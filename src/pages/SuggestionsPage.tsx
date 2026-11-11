import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/common/SEO';
import { Search, ThumbsUp, Check, ExternalLink, Loader2, Trophy, AlertTriangle, Vote, X, Plus, Users } from 'lucide-react';
import { SteamLogo } from '../components/common/BrandLogos';
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
        : isNew
        ? 'bg-[#A3E635]/15 text-[#A3E635] border-[#A3E635]/45 hover:bg-[#A3E635]/25'
        : 'bg-[#141821] text-gray-200 border-[#2A3245] hover:border-[#A3E635]/60 hover:text-white'
    }`}
  >
    {pending ? (
      <Loader2 className="w-4 h-4 animate-spin" />
    ) : hasVoted ? (
      <Check className="w-4 h-4" />
    ) : isNew ? (
      <Plus className="w-4 h-4" />
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
  id?: string;
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
const GameRow: React.FC<GameRowProps> = ({ id, imageUrl, title, rank, meta, action, className = '' }) => {
  const hasRank = rank !== null && rank !== undefined;
  const rankStyle = hasRank ? RANK_STYLES[rank] ?? 'bg-[#2A3245] text-gray-200' : '';
  return (
    <li id={id} className={`flex gap-3 sm:gap-4 ${className}`}>
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

  // Confirms a vote, so people see their game actually landed in the ranking.
  const [toast, setToast] = useState<{ text: string; requestId: number } | null>(null);
  const [highlightId, setHighlightId] = useState<number | null>(null);
  const searchSectionRef = useRef<HTMLElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (highlightId === null) return;
    const timer = setTimeout(() => setHighlightId(null), 3000);
    return () => clearTimeout(timer);
  }, [highlightId]);

  const goToSearch = () => {
    searchSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    searchInputRef.current?.focus({ preventScroll: true });
  };

  const showInRanking = (requestId: number) => {
    setToast(null);
    setHighlightId(requestId);
    document.getElementById(`request-${requestId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

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

  const toggleVote = async (steamAppId: number, existing: TranslationRequest | null, title: string) => {
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
        setToast(null);
      } else {
        const updated = await voteForGame(steamAppId);
        applyRequestChange(steamAppId, updated);
        setToast({
          text: existing
            ? `«${title}» uchun ovozingiz qabul qilindi.`
            : `«${title}» reytingga qo‘shildi — birinchi ovoz sizdan!`,
          requestId: updated.id,
        });
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
      <SEO
        title="O‘yin taklif qilish va ovoz berish — O‘zbekcha tarjima | SubGame"
        description="Qaysi o‘yinni o‘zbek tiliga tarjima qilishimizni xohlaysiz? O‘z sevimli o‘yiningizni taklif qiling va unga ovoz bering!"
        keywords="o‘yin taklif qilish, o‘zbekcha tarjimaga ovoz berish, o‘yinlar so‘rovi, subgame takliflar"
        canonicalUrl="https://subgame.uz/suggestions"
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A3E635]/10 text-[#A3E635] text-xs font-bold mb-3 border border-[#A3E635]/25">
            <Vote className="w-3.5 h-3.5" />
            <span>O‘yin takliflari</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">Qaysi o‘yinni tarjima qilaylik?</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-400 max-w-2xl leading-relaxed">
            Steam’dagi istalgan o‘yinni taklif qiling yoki boshqalar taklif qilganiga ovoz bering. Eng ko‘p ovoz
            olgan o‘yinlar tarjima uchun birinchi navbatda ko‘rib chiqiladi.
          </p>

          {/* How it works: people kept reading the search box as a filter for the list below. */}
          {/* On phones the three steps share one row, so the search box stays near the top. */}
          <ol className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
            {(
              [
                [Search, 'Qidiring', 'O‘yinni qidiring', 'Steam’dagi istalgan o‘yin chiqadi'],
                [Plus, 'Taklif qiling', '“Taklif qilish”ni bosing', 'O‘yin reytingga qo‘shiladi'],
                [Users, 'Ovoz to‘plang', 'Ovoz to‘plang', 'Do‘stlaringizga ham ayting'],
              ] as const
            ).map(([Icon, shortTitle, title, hint], index) => (
              <li
                key={title}
                className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-[#141821]/70 border border-[#2A3245] text-center sm:text-left"
              >
                <span className="relative w-9 h-9 rounded-lg bg-[#A3E635]/10 text-[#A3E635] flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                  <span className="absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full bg-[#A3E635] text-[#0B0D12] text-[10px] font-black flex items-center justify-center">
                    {index + 1}
                  </span>
                </span>
                <span className="min-w-0">
                  <span className="block sm:hidden text-[11px] font-bold leading-tight">{shortTitle}</span>
                  <span className="hidden sm:block text-sm font-bold">{title}</span>
                  <span className="hidden sm:block text-xs text-gray-400">{hint}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* Search */}
        <section
          ref={searchSectionRef}
          className="scroll-mt-24 bg-[#141821] rounded-2xl border border-[#A3E635]/30 p-4 sm:p-6 mb-8 shadow-[0_0_40px_-20px_rgba(163,230,53,0.5)]"
        >
          <label htmlFor="steam-search" className="block text-base sm:text-lg font-bold">
            Yangi o‘yin taklif qiling
          </label>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 mb-3">
            Steam’dagi istalgan o‘yinni toping va reytingga qo‘shing. Ro‘yxatda bo‘lsa, ovoz bering.
          </p>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              id="steam-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="O‘yin nomini yozing…"
              autoComplete="off"
              className="w-full h-12 pl-10 pr-24 rounded-xl bg-[#0B0D12] border border-[#2A3245] focus:border-[#A3E635]/60 focus:outline-none text-sm text-white placeholder:text-gray-500 [&::-webkit-search-cancel-button]:hidden"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Qidiruvni tozalash"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <span
                aria-hidden="true"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#141821] border border-[#2A3245] text-[11px] font-semibold text-gray-300 pointer-events-none"
              >
                <SteamLogo variant="monochrome" className="w-3.5 h-3.5" />
                Steam
              </span>
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
                            <>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#A3E635] text-[#0B0D12]">
                                Yangi
                              </span>
                              <span className="hidden sm:inline text-[11px] text-gray-400">Hali hech kim taklif qilmagan</span>
                            </>
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
                              onClick={() => toggleVote(item.steamAppId, request, item.title)}
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

          {tab === 'active' && ranking.length > 0 && <AddGamePrompt onClick={goToSearch} className="mb-3" />}

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
                    id={`request-${item.id}`}
                    className={`scroll-mt-28 p-3 sm:p-4 rounded-2xl border transition-colors duration-700 ${
                      highlightId === item.id
                        ? 'bg-[#A3E635]/10 border-[#A3E635] ring-2 ring-[#A3E635]/40'
                        : 'bg-[#141821] border-[#2A3245]'
                    }`}
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
                          onClick={() => toggleVote(item.steamAppId, item, item.title)}
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

          {/* Whoever scrolls to the end without finding their game stops right here. */}
          {tab === 'active' && ranking.length > 0 && !hasMore && (
            <AddGamePrompt onClick={goToSearch} className="mt-4" />
          )}
        </section>
      </div>

      {toast && (
        <div
          role="status"
          className="fixed z-50 bottom-4 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-max sm:max-w-md flex items-center gap-3 p-3 pl-4 rounded-2xl bg-[#141821]/95 backdrop-blur-md border border-[#A3E635]/50 shadow-2xl shadow-black/70"
        >
          <Check className="w-5 h-5 text-[#A3E635] shrink-0" />
          <p className="flex-1 min-w-0 text-sm text-white">{toast.text}</p>
          <button
            type="button"
            onClick={() => showInRanking(toast.requestId)}
            className="shrink-0 h-9 px-3 rounded-xl bg-[#A3E635] text-[#0B0D12] text-xs font-bold cursor-pointer hover:bg-[#84CC16]"
          >
            Ko‘rish
          </button>
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Yopish"
            className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

const AddGamePrompt: React.FC<{ onClick: () => void; className?: string }> = ({ onClick, className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full flex items-center gap-3 p-3 sm:p-4 rounded-2xl border border-dashed border-[#A3E635]/40 bg-[#A3E635]/5 hover:bg-[#A3E635]/10 text-left cursor-pointer transition-colors ${className}`}
  >
    <span className="w-9 h-9 rounded-lg bg-[#A3E635]/15 text-[#A3E635] flex items-center justify-center shrink-0">
      <Plus className="w-5 h-5" />
    </span>
    <span className="min-w-0">
      <span className="block text-sm font-bold text-white">Kerakli o‘yin yo‘qmi?</span>
      <span className="block text-xs text-gray-400">Uni o‘zingiz qo‘shing: Steam’dan qidiring va taklif qiling</span>
    </span>
  </button>
);
