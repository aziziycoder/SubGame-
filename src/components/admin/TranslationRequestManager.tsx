import React, { useCallback, useEffect, useState } from 'react';
import { ExternalLink, Loader2, Search, Trash2, ThumbsUp, AlertTriangle } from 'lucide-react';
import type { Game } from '../../types/game';
import { ApiError } from '../../services/apiClient';
import {
  deleteTranslationRequest,
  getTranslationRequests,
  updateTranslationRequest,
  type TranslationRequestFilter,
} from '../../services/translationRequestsService';
import {
  TRANSLATION_REQUEST_STATUS_LABELS,
  steamStoreUrl,
  type TranslationRequest,
  type TranslationRequestStatus,
} from '../../types/translationRequest';

const FILTERS: Array<[TranslationRequestFilter, string]> = [
  ['all', 'Barchasi'],
  ['open', TRANSLATION_REQUEST_STATUS_LABELS.open],
  ['accepted', TRANSLATION_REQUEST_STATUS_LABELS.accepted],
  ['done', TRANSLATION_REQUEST_STATUS_LABELS.done],
  ['rejected', TRANSLATION_REQUEST_STATUS_LABELS.rejected],
];

const STATUSES = Object.keys(TRANSLATION_REQUEST_STATUS_LABELS) as TranslationRequestStatus[];

const errorText = (err: unknown) => (err instanceof ApiError ? err.message : 'Nimadir xato ketdi.');

/** Admin view of the players' translation requests: change status, link the site game, delete. */
export const TranslationRequestManager: React.FC<{ games: Game[] }> = ({ games }) => {
  const [filter, setFilter] = useState<TranslationRequestFilter>('all');
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [items, setItems] = useState<TranslationRequest[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);

  const load = useCallback(async (which: TranslationRequestFilter, text: string, nextPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTranslationRequests(which, nextPage, text);
      setItems((prev) => (nextPage === 1 ? data.results : [...prev, ...data.results]));
      setCount(data.count);
      setPage(data.page);
      setHasMore(data.hasMore);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setAppliedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    void load(filter, appliedSearch, 1);
  }, [filter, appliedSearch, load]);

  const save = async (item: TranslationRequest, changes: Parameters<typeof updateTranslationRequest>[1]) => {
    setSavingId(item.id);
    setError(null);
    try {
      const updated = await updateTranslationRequest(item.id, changes);
      // The list's own rank stays; the server returns none for a single item.
      setItems((prev) => prev.map((row) => (row.id === item.id ? { ...updated, rank: row.rank } : row)));
    } catch (err) {
      setError(errorText(err));
    } finally {
      setSavingId(null);
    }
  };

  const remove = async (item: TranslationRequest) => {
    if (!window.confirm(`"${item.title}" taklifi va uning ${item.votes} ta ovozi o‘chirilsinmi?`)) return;
    setSavingId(item.id);
    setError(null);
    try {
      await deleteTranslationRequest(item.id);
      setItems((prev) => prev.filter((row) => row.id !== item.id));
      setCount((n) => Math.max(0, n - 1));
    } catch (err) {
      setError(errorText(err));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white">O‘yin takliflari</h2>
          <p className="text-xs text-gray-400 mt-1">
            Foydalanuvchilar ovoz bergan o‘yinlar, ovozlar soni bo‘yicha. Jami: {count} ta
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nomi bo‘yicha qidirish"
              className="w-full sm:w-56 h-10 pl-9 pr-3 rounded-xl bg-[#141821] border border-[#2A3245] text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#A3E635]/60"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as TranslationRequestFilter)}
            className="h-10 px-3 rounded-xl bg-[#141821] border border-[#2A3245] text-sm text-white focus:outline-none"
          >
            {FILTERS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-300">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {items.length === 0 && loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
        </div>
      ) : items.length === 0 ? (
        <div className="p-8 rounded-2xl border border-dashed border-[#2A3245] text-center text-sm text-gray-400">
          Takliflar topilmadi.
        </div>
      ) : (
        <ul className="space-y-2.5">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-col lg:flex-row lg:items-center gap-3 p-3 sm:p-4 rounded-2xl bg-[#141821] border border-[#2A3245]"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="w-7 text-center text-sm font-black text-gray-500 tabular-nums shrink-0">{item.rank ?? '—'}</span>
                <img
                  src={item.imageUrl}
                  alt=""
                  loading="lazy"
                  className="w-24 aspect-[460/215] object-cover rounded-lg bg-[#0B0D12] border border-[#2A3245] shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">{item.title}</p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                    <span className="inline-flex items-center gap-1 text-[#A3E635] font-bold">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      {item.votes}
                    </span>
                    <a
                      href={steamStoreUrl(item.steamAppId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 hover:text-white"
                    >
                      Steam {item.steamAppId}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={item.status}
                  disabled={savingId === item.id}
                  onChange={(e) => save(item, { status: e.target.value as TranslationRequestStatus })}
                  aria-label="Holati"
                  className="h-9 px-2.5 rounded-lg bg-[#0B0D12] border border-[#2A3245] text-xs text-white focus:outline-none disabled:opacity-60"
                >
                  {STATUSES.map((value) => (
                    <option key={value} value={value}>
                      {TRANSLATION_REQUEST_STATUS_LABELS[value]}
                    </option>
                  ))}
                </select>
                <select
                  value={item.game?.slug ?? ''}
                  disabled={savingId === item.id}
                  onChange={(e) => save(item, { gameSlug: e.target.value || null })}
                  aria-label="Saytdagi o‘yin"
                  className="h-9 max-w-[12rem] px-2.5 rounded-lg bg-[#0B0D12] border border-[#2A3245] text-xs text-white focus:outline-none disabled:opacity-60"
                >
                  <option value="">Saytdagi o‘yin: yo‘q</option>
                  {games.map((game) => (
                    <option key={game.slug} value={game.slug}>
                      {game.title}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => remove(item)}
                  disabled={savingId === item.id}
                  aria-label="O‘chirish"
                  title="O‘chirish"
                  className="h-9 w-9 flex items-center justify-center rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 cursor-pointer disabled:opacity-60"
                >
                  {savingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {hasMore && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => void load(filter, appliedSearch, page + 1)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#141821] border border-[#2A3245] text-sm font-semibold text-white cursor-pointer disabled:opacity-60"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Yana ko‘rsatish
          </button>
        </div>
      )}
    </div>
  );
};
