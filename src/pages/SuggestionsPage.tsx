import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ThumbsUp, Check, ExternalLink, Loader2, Trophy, AlertTriangle, Vote, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../services/apiClient';
import {
  getTranslationRequests,
  removeVote,
  searchSteamGames,
  voteForGame,
} from '../services/translationRequestsService';
import {
  TRANSLATION_REQUEST_STATUS_LABELS,
  steamStoreUrl,
  type SteamSearchResult,
  type TranslationRequest,
  type TranslationRequestStatus,
} from '../types/translationRequest';

type RankingTab = 'active' | 'done';

const SEARCH_DEBOUNCE_MS = 400;
const MIN_QUERY_LENGTH = 2;

const STATUS_STYLES: Record<TranslationRequestStatus, string> = {
  open: 'bg-[#1E2533] text-gray-300 border-[#2A3245]',
  accepted: 'bg-sky-500/15 text-sky-300 border-sky-500/35',
  rejected: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
  done: 'bg-[#A3E635]/15 text-[#A3E635] border-[#A3E635]/35',
};

const StatusBadge: React.FC<{ status: TranslationRequestStatus }> = ({ status }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border ${STATUS_STYLES[status]}`}>
    {TRANSLATION_REQUEST_STATUS_LABELS[status]}
  </span>
);

const errorText = (err: unknown) => (err instanceof ApiError ? err.message : 'Nimadir xato ketdi. Qayta urinib ko‘ring.');

interface VoteButtonProps {
  votes: number;
  hasVoted: boolean;
  pending: boolean;
  isNew?: boolean;
  onClick: () => void;
}

const VoteButton: React.FC<VoteButtonProps> = ({ votes, hasVoted, pending, isNew, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={pending}
    aria-pressed={hasVoted}
    title={hasVoted ? 'Ovozni qaytarib olish' : 'Ovoz berish'}
    className={`inline-flex items-center justify-center gap-1.5 h-9 sm:h-10 min-w-[3.5rem] px-3 sm:px-3.5 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer shrink-0 disabled:opacity-60 ${
      hasVoted
        ? 'bg-[#A3E635] text-[#0B0D12] border-[#A3E635] hover:bg-[#84CC16]'
        : 'bg-[#141821] text-gray-200 border-[#2A3245] hover:border-[#A3E635]/60 hover:text-white'
    }`}
  >
    {pending ? (
      <Loader2 className="w-4 h-4 animate-spin" />
    ) : hasVoted ? (
      <Check className="w-4 h-4" />
    ) : (
      <ThumbsUp className="w-4 h-4" />
    )}
    <span>{isNew ? 'Taklif qilish' : votes}</span>
  </button>
);

const RANK_STYLES: Record<number, string> = {
  1: 'bg-amber-400 text-[#0B0D12]',
  2: 'bg-gray-300 text-[#0B0D12]',
  3: 'bg-orange-400/90 text-[#0B0D12]',
};

interface GameRowProps {
  imageUrl: string;
  title: string;
  rank?: number | null;
  meta: React.ReactNode;
  action: React.ReactNode;
  className?: string;
}

/**
 * One game in the search results or the ranking. On phones the title gets the full width
 * beside the image and the meta line and action share the row below it; from `sm` the
 * action moves to the right-hand side and the rank gets its own column.
 */
const GameRow: React.FC<GameRowProps> = ({ imageUrl, title, rank, meta, action, className = '' }) => {
  const hasRank = rank !== null && rank !== undefined;
  const rankStyle = hasRank ? RANK_STYLES[rank] ?? 'bg-[#2A3245] text-gray-200' : '';
  return (
    <li className={`flex gap-3 sm:gap-4 ${className}`}>
      {hasRank && (
        <span
          className={`hidden sm:flex w-8 self-center justify-center text-xl font-black tabular-nums shrink-0 ${
            rank === 1 ? 'text-amber-400' : rank <= 3 ? 'text-gray-200' : 'text-gray-500'
          }`}
        >
          {rank}
        </span>
      )}
      <div className="relative w-24 min-[400px]:w-28 sm:w-36 shrink-0 self-start sm:self-center">
        <img
          src={imageUrl}
          alt=""
          loading="lazy"
          className="w-full aspect-[460/215] object-cover rounded-lg bg-[#0B0D12] border border-[#2A3245]"
        />
        {hasRank && (
          <span
            className={`sm:hidden absolute -top-2 -left-2 min-w-6 h-6 px-1.5 rounded-full text-[11px] font-black tabular-nums flex items-center justify-center shadow-md ring-2 ring-[#141821] ${rankStyle}`}
          >
            {rank}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0 grid grid-cols-[minmax(0,1fr)_auto] content-center gap-x-3 gap-y-2 sm:gap-y-1">
        <p className="col-span-2 sm:col-span-1 text-sm sm:text-base font-bold leading-snug line-clamp-2 break-words">
          {title}
        </p>
        <div className="min-w-0 flex flex-wrap items-center gap-x-2 gap-y-1 self-center sm:col-start-1 sm:row-start-2">
          {meta}
        </div>
        <div className="flex justify-end self-center sm:col-start-2 sm:row-start-1 sm:row-span-2">{action}</div>
      </div>
    </li>
  );
};

export const SuggestionsPage: React.FC = () => {
  const { user, signInWithGoogle } = useAuth();

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SteamSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const searchRun = useRef(0);

  const [tab, setTab] = useState<RankingTab>('active');
  const [ranking, setRanking] = useState<TranslationRequest[]>([]);
  const [rankingCount, setRankingCount] = useState(0);
  const [rankingPage, setRankingPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [rankingLoading, setRankingLoading] = useState(true);
  const [rankingError, setRankingError] = useState<string | null>(null);

  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadRanking = useCallback(async (which: RankingTab, page: number) => {
    setRankingLoading(true);
    setRankingError(null);
    try {
      const data = await getTranslationRequests(which, page);
      setRanking((prev) => (page === 1 ? data.results : [...prev, ...data.results]));
      setRankingCount(data.count);
      setRankingPage(data.page);
      setHasMore(data.hasMore);
    } catch (err) {
      setRankingError(errorText(err));
    } finally {
      setRankingLoading(false);
    }
  }, []);

  // Reloads on sign-in too, so the user's own votes show up.
  useEffect(() => {
    void loadRanking(tab, 1);
  }, [tab, user?.uid, loadRanking]);

  const runSearch = useCallback(async (text: string) => {
    const run = ++searchRun.current;
    setSearching(true);
    setSearchError(null);
    try {
      const results = await searchSteamGames(text);
      if (run === searchRun.current) setSearchResults(results);
    } catch (err) {
      if (run === searchRun.current) {
        setSearchResults([]);
        setSearchError(errorText(err));
      }
    } finally {
      if (run === searchRun.current) setSearching(false);
    }
  }, []);

  useEffect(() => {
    const text = query.trim();
    if (text.length < MIN_QUERY_LENGTH) {
      searchRun.current += 1;
      setSearchResults([]);
      setSearching(false);
      setSearchError(null);
      return;
    }
    const timer = setTimeout(() => void runSearch(text), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query, user?.uid, runSearch]);

  /** Keeps both lists in step after a vote changes a request (or removes it). */
  const applyRequestChange = (steamAppId: number, updated: TranslationRequest | null) => {
    setSearchResults((prev) =>
      prev.map((item) => (item.steamAppId === steamAppId ? { ...item, request: updated } : item))
    );
    void loadRanking(tab, 1);
  };

  const toggleVote = async (steamAppId: number, existing: TranslationRequest | null) => {
    if (!user) {
      await signInWithGoogle();
      return;
    }
    setPendingKey(String(steamAppId));
    setActionError(null);
    try {
      if (existing?.hasVoted) {
        const result = await removeVote(existing.id);
        applyRequestChange(steamAppId, result.request);
      } else {
        const updated = await voteForGame(steamAppId);
        applyRequestChange(steamAppId, updated);
      }
    } catch (err) {
      setActionError(errorText(err));
    } finally {
      setPendingKey(null);
    }
  };

  const showSearch = query.trim().length >= MIN_QUERY_LENGTH;

  return (
    <div className="pt-28 pb-20 min-h-screen bg-[#0B0D12] text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A3E635]/10 text-[#A3E635] text-xs font-bold mb-3 border border-[#A3E635]/25">
            <Vote className="w-3.5 h-3.5" />
            <span>O‘yin takliflari</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">Qaysi o‘yinni tarjima qilaylik?</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-400 max-w-2xl leading-relaxed">
            O‘yinni Steam’dan qidiring, taklif qiling va ovoz bering. Eng ko‘p ovoz olgan o‘yinlar tarjima uchun
            birinchi navbatda ko‘rib chiqiladi.
          </p>
        </div>

        {/* Search */}
        <section className="bg-[#141821] rounded-2xl border border-[#2A3245] p-4 sm:p-6 mb-8">
          <label htmlFor="steam-search" className="block text-sm font-bold mb-2.5">
            O‘yin qidirish
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="steam-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Masalan: Hollow Knight"
              autoComplete="off"
              className="w-full h-12 pl-10 pr-10 rounded-xl bg-[#0B0D12] border border-[#2A3245] focus:border-[#A3E635]/60 focus:outline-none text-sm text-white placeholder:text-gray-500"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Qidiruvni tozalash"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {!user && (
            <p className="mt-2.5 text-xs text-gray-400">Ovoz berish uchun Google orqali kirishingiz kerak bo‘ladi.</p>
          )}

          {actionError && (
            <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-300">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{actionError}</span>
            </div>
          )}

          {showSearch && (
            <div className="mt-4" aria-live="polite">
              {searching && searchResults.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Steam’dan qidirilmoqda...</span>
                </div>
              ) : searchError ? (
                <p className="text-sm text-amber-300 py-3">{searchError}</p>
              ) : searchResults.length === 0 ? (
                <p className="text-sm text-gray-400 py-3">Hech narsa topilmadi. Nomini boshqacha yozib ko‘ring.</p>
              ) : (
                <ul className="divide-y divide-[#2A3245]/70">
                  {searchResults.map((item) => {
                    const request = item.request;
                    const closed = request && (request.status === 'rejected' || request.status === 'done');
                    return (
                      <GameRow
                        key={item.steamAppId}
                        className="py-3"
                        imageUrl={item.imageUrl}
                        title={item.title}
                        meta={
                          item.siteGame ? (
                            <span className="text-[11px] text-[#A3E635] font-semibold whitespace-nowrap">
                              Saytda bor
                              <span className="hidden min-[400px]:inline"> · {item.siteGame.subtitleStatus}</span>
                            </span>
                          ) : request && request.status !== 'open' ? (
                            <StatusBadge status={request.status} />
                          ) : request ? (
                            <span className="text-[11px] text-gray-400">Taklif qilingan</span>
                          ) : (
                            // On phones the "Taklif qilish" button beside it already says this.
                            <span className="hidden sm:inline text-[11px] text-gray-400">Hali taklif qilinmagan</span>
                          )
                        }
                        action={
                          item.siteGame ? (
                            <Link
                              to={`/games/${item.siteGame.slug}`}
                              className="inline-flex items-center gap-1.5 h-9 sm:h-10 px-3.5 rounded-xl text-xs sm:text-sm font-bold bg-[#A3E635]/15 text-[#A3E635] border border-[#A3E635]/35 hover:bg-[#A3E635]/25 shrink-0"
                            >
                              <span>Ochish</span>
                            </Link>
                          ) : closed ? null : (
                            <VoteButton
                              votes={request?.votes ?? 0}
                              hasVoted={Boolean(request?.hasVoted)}
                              isNew={!request}
                              pending={pendingKey === String(item.steamAppId)}
                              onClick={() => toggleVote(item.steamAppId, request)}
                            />
                          )
                        }
                      />
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </section>

        {/* Ranking */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span>Reyting</span>
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                {rankingCount > 0 ? `${rankingCount} ta o‘yin` : 'Ovozlar soni bo‘yicha saralangan'}
              </p>
            </div>
            <div className="grid grid-cols-2 w-full sm:inline-flex sm:w-auto p-1 rounded-xl bg-[#141821] border border-[#2A3245] sm:self-start">
              {(
                [
                  ['active', 'Ovoz yig‘ilmoqda'],
                  ['done', 'Tarjima qilingan'],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTab(value)}
                  aria-pressed={tab === value}
                  className={`px-3.5 py-2.5 sm:py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    tab === value ? 'bg-[#A3E635] text-[#0B0D12]' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {rankingError ? (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-sm text-rose-300 flex items-center justify-between gap-3">
              <span>{rankingError}</span>
              <button
                type="button"
                onClick={() => void loadRanking(tab, 1)}
                className="text-xs font-bold underline cursor-pointer shrink-0"
              >
                Qayta urinish
              </button>
            </div>
          ) : ranking.length === 0 && rankingLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
            </div>
          ) : ranking.length === 0 ? (
            <div className="p-8 rounded-2xl border border-dashed border-[#2A3245] text-center text-sm text-gray-400">
              {tab === 'active'
                ? 'Hali takliflar yo‘q. Yuqorida o‘yin qidirib, birinchi bo‘lib taklif qiling!'
                : 'Hali takliflardan tarjima qilingan o‘yin yo‘q.'}
            </div>
          ) : (
            <ol className="space-y-2.5">
              {ranking.map((item) => {
                const canVote = item.status === 'open' || item.status === 'accepted';
                return (
                  <GameRow
                    key={item.id}
                    className="p-3 sm:p-4 rounded-2xl bg-[#141821] border border-[#2A3245]"
                    imageUrl={item.imageUrl}
                    title={item.title}
                    rank={item.rank}
                    meta={
                      <>
                        {/* Every row in this tab is open by default, so only the exceptions get a badge. */}
                        {item.status !== 'open' && <StatusBadge status={item.status} />}
                        {item.game ? (
                          <Link to={`/games/${item.game.slug}`} className="text-[11px] font-semibold text-[#A3E635] hover:underline">
                            Sahifaga o‘tish
                          </Link>
                        ) : (
                          <a
                            href={steamStoreUrl(item.steamAppId)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-white"
                          >
                            <span>Steam</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </>
                    }
                    action={
                      canVote ? (
                        <VoteButton
                          votes={item.votes}
                          hasVoted={item.hasVoted}
                          pending={pendingKey === String(item.steamAppId)}
                          onClick={() => toggleVote(item.steamAppId, item)}
                        />
                      ) : (
                        <span className="text-xs text-gray-400 tabular-nums">{item.votes} ovoz</span>
                      )
                    }
                  />
                );
              })}
            </ol>
          )}

          {hasMore && !rankingError && (
            <div className="flex justify-center mt-6">
              <button
                type="button"
                onClick={() => void loadRanking(tab, rankingPage + 1)}
                disabled={rankingLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#141821] border border-[#2A3245] hover:border-gray-500 text-sm font-semibold cursor-pointer disabled:opacity-60"
              >
                {rankingLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Yana ko‘rsatish</span>
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
