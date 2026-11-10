import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyRound,
  Gamepad2,
  Users,
  HardDrive,
  Search,
  RefreshCw,
  Download,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Copy,
  Check,
  Layers,
  Laptop,
  Table2,
} from 'lucide-react';
import type { Game } from '../../types/game';
import {
  getAdminLicenseSummary,
  getAdminLicensesPage,
  getAllAdminLicenses,
  type GameLicenseItem,
  type LicenseFilters,
  type LicenseSummary,
  type LicensesPage,
} from '../../services/licensesService';
import { resetLicenseHwid, toggleLicenseStatus, deleteLicense } from '../../services/usersService';
import { GrantLicenseModal } from './GrantLicenseModal';

interface LicenseStatsManagerProps {
  games: Game[];
}

type Notify = (text: string, type?: 'success' | 'error') => void;

const PROVIDER_LABELS: Record<string, string> = {
  free: 'Bepul',
  admin_grant: 'Admin bergan',
  click: 'Click',
  payme: 'Payme',
  manual_paid: 'Qo‘lda to‘langan',
  other: 'Boshqa',
  none: 'Eski (Firebase)',
};

const selectClass =
  'px-3 py-2.5 rounded-xl bg-[#141821] border border-[#2A3245] text-sm text-gray-200 focus:outline-none focus:border-[#A3E635] cursor-pointer min-w-0';

const MONTHS = ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avg', 'sen', 'okt', 'noy', 'dek'];

const formatDate = (value: any): string => {
  if (!value) return 'Noma’lum';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'Noma’lum';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getDate()}-${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const useDebounced = <T,>(value: T, delay = 350): T => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
};

/* ---------- Pagination ---------- */

const pageItems = (current: number, total: number): (number | '...')[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, 4, '...', total];
  if (current >= total - 2) return [1, '...', total - 3, total - 2, total - 1, total];
  return [1, '...', current - 1, current, current + 1, '...', total];
};

const Pager: React.FC<{ pagination: LicensesPage['pagination']; onPage: (page: number) => void }> = ({
  pagination,
  onPage,
}) => {
  const { page, pageSize, total, totalPages } = pagination;
  if (total === 0) return null;
  const navClass =
    'inline-flex items-center justify-center gap-1 min-w-10 h-10 sm:min-w-0 sm:h-auto px-3 py-1.5 rounded-xl bg-[#141821] border border-[#2A3245] text-xs font-bold text-gray-300 hover:text-white hover:border-[#A3E635] disabled:opacity-40 disabled:hover:border-[#2A3245] disabled:cursor-not-allowed transition-all cursor-pointer';
  return (
    <div className="px-4 sm:px-6 py-4 bg-[#0B0D12] border-t border-[#2A3245] flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="text-xs text-gray-400 font-medium text-center sm:text-left">
        Ko‘rsatilmoqda:{' '}
        <strong className="text-white">
          {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)}
        </strong>{' '}
        / Jami <strong className="text-[#A3E635]">{total} ta</strong> litsenziya (Sahifa {page} / {totalPages})
      </div>
      {totalPages > 1 && (
        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          <button onClick={() => onPage(page - 1)} disabled={page === 1} className={navClass} title="Oldingi sahifa">
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Oldingi</span>
          </button>
          {pageItems(page, totalPages).map((item, idx) =>
            item === '...' ? (
              <span key={`e${idx}`} className="px-2 text-xs text-gray-500 font-bold select-none">
                ...
              </span>
            ) : (
              <button
                key={item}
                onClick={() => onPage(item)}
                className={`min-w-10 h-10 sm:min-w-8 sm:h-8 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  item === page
                    ? 'bg-[#A3E635] text-[#0B0D12] font-black'
                    : 'bg-[#141821] text-gray-400 hover:text-white border border-[#2A3245] hover:border-[#A3E635]'
                }`}
              >
                {item}
              </button>
            )
          )}
          <button
            onClick={() => onPage(page + 1)}
            disabled={page === totalPages}
            className={navClass}
            title="Keyingi sahifa"
          >
            <span className="hidden sm:inline">Keyingi</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

/* ---------- Licenses table (one server page at a time) ---------- */

interface LicenseTableProps {
  filters: LicenseFilters;
  reloadKey: number;
  hideGame?: boolean;
  notify: Notify;
  onChanged: () => void;
}

const LicenseTable: React.FC<LicenseTableProps> = ({ filters, reloadKey, hideGame, notify, onChanged }) => {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<LicensesPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const seq = useRef(0);
  const topRef = useRef<HTMLDivElement>(null);
  const filterKey = JSON.stringify(filters);

  // A new filter starts again at page 1
  useEffect(() => {
    setPage(1);
  }, [filterKey]);

  useEffect(() => {
    const mine = ++seq.current;
    setLoading(true);
    getAdminLicensesPage(filters, page)
      .then((res) => {
        if (mine !== seq.current) return;
        setData(res);
        setError(null);
        if (res.pagination.page !== page) setPage(res.pagination.page);
      })
      .catch((err) => {
        if (mine === seq.current) setError(err?.message || 'Litsenziyalarni yuklab bo‘lmadi.');
      })
      .finally(() => {
        if (mine === seq.current) setLoading(false);
      });
  }, [filterKey, page, reloadKey]);

  const goTo = (next: number) => {
    if (!data || next < 1 || next > data.pagination.totalPages || next === page) return;
    setPage(next);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const run = async (key: string, action: () => Promise<{ success: boolean; error?: string }>, ok: string) => {
    setActionLoading(key);
    try {
      const res = await action();
      if (res.success) {
        notify(ok, 'success');
        onChanged();
      } else {
        notify(res.error || 'Xatolik yuz berdi', 'error');
      }
    } catch (err: any) {
      notify('Xatolik: ' + err.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const who = (lic: GameLicenseItem) => lic.userName || lic.userEmail;

  const handleResetHwid = (lic: GameLicenseItem) => {
    if (
      !window.confirm(
        `"${who(lic)}" foydalanuvchisining "${lic.gameTitle}" o‘yini uchun bog‘langan kompyuter (HWID) apparatini yechmoqchimisiz?\n\nFoydalanuvchi litsenziyani yangi kompyuterda ishga tushira oladi.`
      )
    )
      return;
    run(`reset_${lic.id}`, () => resetLicenseHwid(lic.id), 'HWID qurilma bog‘lanmasi muvaffaqiyatli yechildi!');
  };

  const handleToggle = (lic: GameLicenseItem) => {
    const next = lic.status === 'active' ? 'to‘xtatib turishni' : 'qayta faollashtirishni';
    if (!window.confirm(`"${lic.gameTitle}" litsenziyasini ${next} xohlaysizmi?`)) return;
    run(`toggle_${lic.id}`, () => toggleLicenseStatus(lic.id, lic.status), 'Litsenziya holati o‘zgartirildi');
  };

  const handleDelete = (lic: GameLicenseItem) => {
    if (
      !window.confirm(
        `Haqiqatan ham "${who(lic)}" foydalanuvchisining "${lic.gameTitle}" o‘yini litsenziyasini butunlay o‘chirib tashlamoqchimisiz?\n\nBu amalni qaytarib bo‘lmaydi.`
      )
    )
      return;
    run(`delete_${lic.id}`, () => deleteLicense(lic.id), 'Litsenziya butunlay o‘chirildi');
  };

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center px-4">
        {error ? (
          <>
            <AlertCircle className="w-7 h-7 text-red-400 mb-2" />
            <p className="text-xs text-gray-300">{error}</p>
          </>
        ) : (
          <>
            <RefreshCw className="w-7 h-7 text-[#A3E635] animate-spin mb-2" />
            <p className="text-xs text-gray-400">Litsenziyalar yuklanmoqda...</p>
          </>
        )}
      </div>
    );
  }

  const columns = hideGame ? 5 : 6;

  return (
    <div className={`transition-opacity ${loading ? 'opacity-60' : ''}`}>
      <div ref={topRef} className="scroll-mt-24" />
      {error && (
        <div className="px-4 py-2 text-xs text-red-300 bg-red-500/10 border-b border-red-500/30">{error}</div>
      )}
      {/* Phones: one card per license */}
      <ul className="md:hidden divide-y divide-[#2A3245]">
        {data.licenses.length === 0 ? (
          <li className="px-4 py-12 text-center text-gray-500 text-xs">Hech qanday litsenziya topilmadi.</li>
        ) : (
          data.licenses.map((lic) => {
            const busy = actionLoading?.endsWith(`_${lic.id}`);
            return (
              <li key={lic.id} className="p-4 space-y-3 text-sm text-gray-300">
                <div className="flex items-center gap-3 min-w-0">
                  {lic.userPhoto ? (
                    <img src={lic.userPhoto} alt="" className="w-9 h-9 rounded-full border border-[#2A3245] object-cover shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#1E2533] border border-[#2A3245] text-[#A3E635] flex items-center justify-center font-bold text-xs shrink-0">
                      {(lic.userName || lic.userEmail || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-white block truncate">
                      {lic.userName || lic.userEmail?.split('@')[0] || 'Ismsiz foydalanuvchi'}
                    </span>
                    <span className="text-xs text-gray-400 font-mono block truncate">{lic.userEmail}</span>
                  </div>
                  {lic.status === 'active' ? (
                    <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#A3E635]/15 text-[#A3E635] border border-[#A3E635]/30">
                      <CheckCircle2 className="w-3 h-3" />
                      Faol
                    </span>
                  ) : (
                    <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-500/15 text-red-400 border border-red-500/30">
                      <AlertCircle className="w-3 h-3" />
                      To‘xtatilgan
                    </span>
                  )}
                </div>

                {!hideGame && (
                  <div className="flex items-center gap-2 min-w-0 font-bold text-white">
                    <Gamepad2 className="w-4 h-4 text-[#A3E635] shrink-0" />
                    <span className="truncate">{lic.gameTitle}</span>
                  </div>
                )}

                <div className="text-[11px] text-gray-500 space-y-1">
                  <div>
                    {formatDate(lic.createdAt)} · {PROVIDER_LABELS[lic.paymentProvider || 'none'] || lic.paymentProvider}
                    {lic.paidAmount ? ` · ${lic.paidAmount} so‘m` : ''}
                  </div>
                  {lic.hwid ? (
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Laptop className="w-3 h-3 text-purple-300 shrink-0" />
                      <span className="text-purple-300 font-semibold truncate">{lic.boundDeviceName || 'Bog‘langan qurilma'}</span>
                      <span className="font-mono text-gray-400 shrink-0">{lic.hwid.slice(0, 10)}…</span>
                      <button
                        onClick={() => copy(lic.hwid!, lic.id)}
                        className="shrink-0 p-3 -m-2 text-gray-500 hover:text-white cursor-pointer"
                        title="HWID dan nusxa olish"
                      >
                        {copiedId === lic.id ? <Check className="w-3.5 h-3.5 text-[#A3E635]" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ) : (
                    <div>Kompyuter bog‘lanmagan</div>
                  )}
                  {lic.revokedReason && <div className="text-red-400 font-mono break-all">{lic.revokedReason}</div>}
                </div>

                <div className="flex items-center gap-2">
                  {lic.hwid && (
                    <button
                      onClick={() => handleResetHwid(lic)}
                      disabled={busy}
                      className="flex-1 px-3 py-2.5 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/30 text-xs font-bold disabled:opacity-50 cursor-pointer whitespace-nowrap"
                    >
                      HWID yechish
                    </button>
                  )}
                  <button
                    onClick={() => handleToggle(lic)}
                    disabled={busy}
                    className={`flex-1 px-3 py-2.5 rounded-xl text-xs font-bold border disabled:opacity-50 cursor-pointer ${
                      lic.status === 'active'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    {lic.status === 'active' ? 'To‘xtatish' : 'Yoqish'}
                  </button>
                  <button
                    onClick={() => handleDelete(lic)}
                    disabled={busy}
                    className="shrink-0 w-10 h-10 inline-flex items-center justify-center rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 disabled:opacity-50 cursor-pointer"
                    title="Litsenziyani o‘chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            );
          })
        )}
      </ul>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-[#0B0D12] text-xs uppercase tracking-wider text-gray-400 border-b border-[#2A3245]">
            <tr>
              <th scope="col" className="px-4 sm:px-6 py-3.5">Foydalanuvchi</th>
              {!hideGame && <th scope="col" className="px-4 sm:px-6 py-3.5">O‘yin</th>}
              <th scope="col" className="px-4 sm:px-6 py-3.5 whitespace-nowrap">Olingan sana</th>
              <th scope="col" className="px-4 sm:px-6 py-3.5 whitespace-nowrap">Kompyuter (HWID)</th>
              <th scope="col" className="px-4 sm:px-6 py-3.5">Holati</th>
              <th scope="col" className="px-4 sm:px-6 py-3.5 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2A3245]">
            {data.licenses.length === 0 ? (
              <tr>
                <td colSpan={columns} className="px-6 py-12 text-center text-gray-500 text-xs">
                  Hech qanday litsenziya topilmadi.
                </td>
              </tr>
            ) : (
              data.licenses.map((lic) => {
                const busy = actionLoading?.endsWith(`_${lic.id}`);
                return (
                  <tr key={lic.id} className="hover:bg-[#1A202C]/60 transition-colors">
                    <td className="px-4 sm:px-6 py-3.5">
                      <div className="flex items-center gap-3 min-w-[180px]">
                        {lic.userPhoto ? (
                          <img
                            src={lic.userPhoto}
                            alt=""
                            className="w-9 h-9 rounded-full border border-[#2A3245] object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-[#1E2533] border border-[#2A3245] text-[#A3E635] flex items-center justify-center font-bold text-xs shrink-0">
                            {(lic.userName || lic.userEmail || 'U')[0].toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="font-bold text-white block truncate">
                            {lic.userName || lic.userEmail?.split('@')[0] || 'Ismsiz foydalanuvchi'}
                          </span>
                          <span className="text-xs text-gray-400 font-mono block truncate">{lic.userEmail}</span>
                        </div>
                      </div>
                    </td>

                    {!hideGame && (
                      <td className="px-4 sm:px-6 py-3.5">
                        <div className="font-bold text-white flex items-center gap-2 min-w-[140px]">
                          <Gamepad2 className="w-4 h-4 text-[#A3E635] shrink-0" />
                          <span className="truncate">{lic.gameTitle}</span>
                        </div>
                        <span className="text-[11px] font-mono text-gray-500 block">{lic.gameSlug}</span>
                      </td>
                    )}

                    <td className="px-4 sm:px-6 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                      {formatDate(lic.createdAt)}
                    </td>

                    <td className="px-4 sm:px-6 py-3.5">
                      {lic.hwid ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30 whitespace-nowrap">
                            <Laptop className="w-3 h-3" />
                            {lic.boundDeviceName || 'Bog‘langan qurilma'}
                          </span>
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-mono">
                            <span>{lic.hwid.slice(0, 14)}...</span>
                            <button
                              onClick={() => copy(lic.hwid!, lic.id)}
                              className="text-gray-500 hover:text-white cursor-pointer"
                              title="HWID dan nusxa olish"
                            >
                              {copiedId === lic.id ? (
                                <Check className="w-3 h-3 text-[#A3E635]" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500 whitespace-nowrap">Bog‘lanmagan</span>
                      )}
                    </td>

                    <td className="px-4 sm:px-6 py-3.5">
                      <div className="space-y-1">
                        {lic.status === 'active' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#A3E635]/15 text-[#A3E635] border border-[#A3E635]/30">
                            <CheckCircle2 className="w-3 h-3" />
                            Faol
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/30 whitespace-nowrap">
                            <AlertCircle className="w-3 h-3" />
                            To‘xtatilgan
                          </span>
                        )}
                        <span className="text-[10px] text-gray-500 block whitespace-nowrap">
                          {PROVIDER_LABELS[lic.paymentProvider || 'none'] || lic.paymentProvider}
                          {lic.paidAmount ? ` · ${lic.paidAmount} so‘m` : ''}
                        </span>
                        {lic.revokedReason && (
                          <span className="text-[10px] text-red-400 block font-mono">{lic.revokedReason}</span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 sm:px-6 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {lic.hwid && (
                          <button
                            onClick={() => handleResetHwid(lic)}
                            disabled={busy}
                            className="px-2.5 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer whitespace-nowrap"
                            title="Qurilma bog‘lanmasini yechish"
                          >
                            HWID yechish
                          </button>
                        )}
                        <button
                          onClick={() => handleToggle(lic)}
                          disabled={busy}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all disabled:opacity-50 cursor-pointer ${
                            lic.status === 'active'
                              ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30'
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          {lic.status === 'active' ? 'To‘xtatish' : 'Yoqish'}
                        </button>
                        <button
                          onClick={() => handleDelete(lic)}
                          disabled={busy}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-all disabled:opacity-50 cursor-pointer"
                          title="Litsenziyani o‘chirish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <Pager pagination={data.pagination} onPage={goTo} />
    </div>
  );
};

/* ---------- Section ---------- */

export const LicenseStatsManager: React.FC<LicenseStatsManagerProps> = ({ games }) => {
  const [summary, setSummary] = useState<LicenseSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [viewMode, setViewMode] = useState<'by_game' | 'all_table'>('by_game');

  // Games view
  const [gameQuery, setGameQuery] = useState('');
  const [sortBy, setSortBy] = useState<'claims_desc' | 'claims_asc' | 'alpha' | 'bound_desc'>('claims_desc');
  const [expandedGames, setExpandedGames] = useState<Record<string, boolean>>({});

  // Table view filters (sent to the server)
  const [searchQuery, setSearchQuery] = useState('');
  const search = useDebounced(searchQuery.trim());
  const [filterGame, setFilterGame] = useState('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'revoked'>('all');
  const [filterDevice, setFilterDevice] = useState<'all' | 'bound' | 'unbound'>('all');
  const [filterProvider, setFilterProvider] = useState('all');
  const [sort, setSort] = useState<'newest' | 'oldest' | 'recently_bound'>('newest');

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);

  const notify: Notify = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadSummary = async (silent = false) => {
    if (silent) setRefreshing(true);
    try {
      setSummary(await getAdminLicenseSummary());
    } catch (err: any) {
      notify('Litsenziyalar statistikasini yuklashda xatolik: ' + err.message, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  // After any change: refresh the counts and every open table
  const refreshAll = () => {
    setReloadKey((k) => k + 1);
    loadSummary(true);
  };

  const tableFilters = useMemo<LicenseFilters>(
    () => ({ search, game: filterGame, status: filterStatus, device: filterDevice, provider: filterProvider, sort }),
    [search, filterGame, filterStatus, filterDevice, filterProvider, sort]
  );

  const groups = useMemo(() => {
    const q = gameQuery.toLowerCase().trim();
    const list = (summary?.groups || []).filter(
      (g) => !q || g.gameTitle.toLowerCase().includes(q) || g.gameSlug.toLowerCase().includes(q)
    );
    return [...list].sort((a, b) => {
      if (sortBy === 'claims_asc') return a.totalLicenses - b.totalLicenses;
      if (sortBy === 'alpha') return a.gameTitle.localeCompare(b.gameTitle);
      if (sortBy === 'bound_desc') return b.boundDevicesCount - a.boundDevicesCount;
      return b.totalLicenses - a.totalLicenses;
    });
  }, [summary, gameQuery, sortBy]);

  const gameOptions = useMemo(() => {
    const known = new Map<string, string>();
    (summary?.groups || []).forEach((g) => known.set(g.gameId, g.gameTitle));
    games.forEach((g) => {
      if (!known.has(g.id)) known.set(g.id, g.title);
    });
    return [...known.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [summary, games]);

  const unpaidIds = summary?.unpaidRevokedIds || [];

  const handleCleanUnpaid = async () => {
    if (unpaidIds.length === 0) return;
    if (
      !window.confirm(
        `Bazada to‘lovsiz olingan va to‘xtatilgan ${unpaidIds.length} ta litsenziya mavjud (Click orqali to‘langanlar saqlab qolinadi).\n\nUlarni butunlay o‘chirib tashlashni tasdiqlaysizmi?`
      )
    )
      return;
    setActionLoading('clean_unpaid');
    let deleted = 0;
    try {
      for (const id of unpaidIds) {
        const res = await deleteLicense(id);
        if (res.success) deleted++;
      }
      notify(`${deleted} ta to‘lovsiz litsenziya butunlay o‘chirildi!`, 'success');
      refreshAll();
    } catch (err: any) {
      notify('O‘chirishda xatolik: ' + err.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const exportToCSV = async () => {
    setActionLoading('export');
    try {
      const filters = viewMode === 'all_table' ? tableFilters : {};
      const licenses = await getAllAdminLicenses(filters);
      if (licenses.length === 0) {
        notify('Eksport qilish uchun litsenziyalar mavjud emas', 'error');
        return;
      }
      const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
      const headers = [
        'Litsenziya ID', 'O‘yin nomi', 'O‘yin ID', 'Foydalanuvchi ismi', 'Foydalanuvchi emaili',
        'Foydalanuvchi UID', 'Litsenziya holati', 'Manba', 'To‘langan summa', 'Kompyuterga bog‘langanmi',
        'HWID apparat ID', 'Qurilma nomi', 'Olingan sana',
      ];
      const rows = licenses.map((l) => [
        l.id, l.gameTitle, l.gameId, l.userName, l.userEmail, l.userId,
        l.status === 'active' ? 'Faol' : 'To‘xtatilgan',
        PROVIDER_LABELS[l.paymentProvider || 'none'] || l.paymentProvider, l.paidAmount || 0,
        l.hwid ? 'Bog‘langan' : 'Bog‘lanmagan', l.hwid, l.boundDeviceName, formatDate(l.createdAt),
      ].map(esc));
      const csv = '﻿' + [headers.map(esc).join(','), ...rows.map((r) => r.join(','))].join('\r\n');
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `subgame_licenses_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      notify(`${licenses.length} ta litsenziya CSV formatida yuklab olindi`, 'success');
    } catch (err: any) {
      notify('Eksportda xatolik: ' + err.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const stats = summary?.stats;
  const topGame = summary?.groups[0];
  const anyFilter =
    searchQuery || filterGame !== 'all' || filterStatus !== 'all' || filterDevice !== 'all' || filterProvider !== 'all';

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 left-6 sm:left-auto z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border text-sm font-semibold bg-[#141821] ${
            toastMessage.type === 'success' ? 'border-[#A3E635]/40 text-[#A3E635]' : 'border-red-500/40 text-red-400'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Global statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-[#141821] border border-[#2A3245] space-y-2 min-w-0">
          <span className="text-xs text-gray-400 uppercase tracking-wider block font-medium break-words">
Jami litsenziyalar</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-white">{stats?.totalLicenses ?? '—'}</span>
            <KeyRound className="w-5 h-5 text-gray-500" />
          </div>
          <span className="text-[11px] text-gray-500 block">
            {stats ? `${stats.activeLicenses} faol · ${stats.revokedLicenses} to‘xtatilgan` : ''}
          </span>
        </div>
        <div className="p-4 sm:p-5 rounded-2xl bg-[#141821] border border-[#A3E635]/30 space-y-2 min-w-0">
          <span className="text-xs text-[#A3E635] uppercase tracking-wider block font-medium break-words">
Litsenziya olganlar</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-[#A3E635]">{stats?.totalUniqueUsers ?? '—'}</span>
            <Users className="w-5 h-5 text-[#A3E635]" />
          </div>
          <span className="text-[11px] text-gray-400 block">Kamida bitta o‘yin olgan userlar</span>
        </div>
        <div className="p-4 sm:p-5 rounded-2xl bg-[#141821] border border-cyan-500/20 space-y-2 min-w-0">
          <span className="text-xs text-cyan-400 uppercase tracking-wider block font-medium break-words">
O‘yinlar</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-cyan-400">{stats?.totalGamesClaimed ?? '—'}</span>
            <Gamepad2 className="w-5 h-5 text-cyan-500" />
          </div>
          <span className="text-[11px] text-gray-500 block truncate">
            {topGame ? `Eng ko‘p: ${topGame.gameTitle} (${topGame.totalLicenses})` : 'Litsenziya olingan o‘yinlar'}
          </span>
        </div>
        <div className="p-4 sm:p-5 rounded-2xl bg-[#141821] border border-purple-500/20 space-y-2 min-w-0">
          <span className="text-xs text-purple-400 uppercase tracking-wider block font-medium break-words">
Bog‘langan kompyuterlar</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-purple-400">{stats?.totalBoundDevices ?? '—'}</span>
            <HardDrive className="w-5 h-5 text-purple-500" />
          </div>
          <span className="text-[11px] text-gray-500 block">HWID bilan bog‘langan litsenziyalar</span>
        </div>
      </div>

      {/* View switch and actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="grid grid-cols-2 sm:flex p-1 bg-[#141821] border border-[#2A3245] rounded-xl text-xs sm:self-start">
          <button
            onClick={() => setViewMode('by_game')}
            className={`inline-flex items-center justify-center gap-1.5 px-3 py-2.5 sm:py-2 rounded-lg font-bold transition-all cursor-pointer ${
              viewMode === 'by_game' ? 'bg-[#A3E635] text-[#0B0D12]' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> O‘yinlar bo‘yicha
          </button>
          <button
            onClick={() => setViewMode('all_table')}
            className={`inline-flex items-center justify-center gap-1.5 px-3 py-2.5 sm:py-2 rounded-lg font-bold transition-all cursor-pointer ${
              viewMode === 'all_table' ? 'bg-[#A3E635] text-[#0B0D12]' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Table2 className="w-3.5 h-3.5" /> Barcha litsenziyalar
          </button>
        </div>

        <div className="grid grid-cols-3 sm:flex items-center gap-2 sm:flex-wrap">
          {unpaidIds.length > 0 && (
            <button
              onClick={handleCleanUnpaid}
              disabled={actionLoading === 'clean_unpaid' || refreshing}
              className="col-span-3 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-sm font-bold transition-all disabled:opacity-50 cursor-pointer"
            >
              {actionLoading === 'clean_unpaid' ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              <span>To‘lovsizlarni o‘chirish ({unpaidIds.length})</span>
            </button>
          )}
          <button
            onClick={() => setIsGrantModalOpen(true)}
            className="col-span-3 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#A3E635] hover:bg-[#8ece28] text-[#0B0D12] text-sm font-black transition-all cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            <span>Litsenziya berish</span>
          </button>
          <button
            onClick={exportToCSV}
            disabled={actionLoading === 'export' || !stats?.totalLicenses}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#141821] hover:bg-[#1E2533] text-gray-200 hover:text-white border border-[#2A3245] text-sm font-bold transition-all disabled:opacity-50 cursor-pointer"
            title={viewMode === 'all_table' ? 'Joriy filtrlar bo‘yicha eksport' : 'Barcha litsenziyalarni eksport qilish'}
          >
            {actionLoading === 'export' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>CSV</span>
          </button>
          <button
            onClick={refreshAll}
            disabled={refreshing || loading}
            className="col-span-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#141821] hover:bg-[#1E2533] text-gray-200 hover:text-white border border-[#2A3245] text-sm font-bold transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#A3E635]' : ''}`} />
            <span>Yangilash</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[#141821] border border-[#2A3245] rounded-2xl">
          <RefreshCw className="w-8 h-8 text-[#A3E635] animate-spin mb-3" />
          <p className="text-gray-400 text-sm">Litsenziyalar statistikasi yuklanmoqda...</p>
        </div>
      ) : viewMode === 'by_game' ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 sm:max-w-md">
              <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="O‘yin nomi bo‘yicha qidiring..."
                value={gameQuery}
                onChange={(e) => setGameQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141821] border border-[#2A3245] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#A3E635]"
              />
            </div>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className={selectClass}>
              <option value="claims_desc">Eng ko‘p olinganlar</option>
              <option value="claims_asc">Eng kam olinganlar</option>
              <option value="bound_desc">Ko‘p bog‘langanlar</option>
              <option value="alpha">Alifbo bo‘yicha</option>
            </select>
            {Object.values(expandedGames).some(Boolean) && (
              <button
                onClick={() => setExpandedGames({})}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#141821] hover:bg-[#1E2533] border border-[#2A3245] text-xs font-bold text-gray-300 hover:text-white cursor-pointer"
              >
                <ChevronUp className="w-4 h-4" /> Hammasini yopish
              </button>
            )}
          </div>

          {groups.length === 0 ? (
            <div className="text-center py-16 bg-[#141821] border border-[#2A3245] rounded-2xl text-xs text-gray-400">
              Hech qanday o‘yin topilmadi.
            </div>
          ) : (
            groups.map((group, idx) => {
              const open = Boolean(expandedGames[group.gameId]);
              return (
                <div
                  key={group.gameId}
                  className={`bg-[#141821] border rounded-2xl overflow-hidden transition-colors ${
                    open ? 'border-[#A3E635]/40' : 'border-[#2A3245]'
                  }`}
                >
                  <button
                    onClick={() => setExpandedGames((prev) => ({ ...prev, [group.gameId]: !prev[group.gameId] }))}
                    className="w-full p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-left cursor-pointer hover:bg-[#1A202C]/40"
                    aria-expanded={open}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <span className="text-xs font-mono font-bold text-gray-500 w-5 shrink-0">{idx + 1}.</span>
                      {group.coverImage ? (
                        <img
                          src={group.coverImage}
                          alt=""
                          className="w-16 h-10 sm:w-20 sm:h-12 rounded-lg object-cover border border-[#2A3245] shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-10 sm:w-20 sm:h-12 rounded-lg bg-[#0B0D12] border border-[#2A3245] flex items-center justify-center shrink-0">
                          <Gamepad2 className="w-5 h-5 text-gray-600" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="font-bold text-white truncate">{group.gameTitle}</h3>
                        <div className="text-[11px] text-gray-500 flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono">{group.gameSlug}</span>
                          {group.lastClaimedAt && (
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {formatDate(group.lastClaimedAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap md:flex-nowrap md:shrink-0 pl-8 md:pl-0">
                      <span className="px-2.5 py-1 rounded-lg bg-[#0B0D12] border border-[#2A3245] text-xs font-bold text-white whitespace-nowrap">
                        {group.totalLicenses} ta litsenziya
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-300 whitespace-nowrap">
                        {group.boundDevicesCount} bog‘langan
                      </span>
                      {group.activeLicenses < group.totalLicenses && (
                        <span className="px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-300 whitespace-nowrap">
                          {group.totalLicenses - group.activeLicenses} to‘xtatilgan
                        </span>
                      )}
                      <span className="hidden sm:flex items-center gap-2 w-28">
                        <span className="flex-1 h-1.5 rounded-full bg-[#0B0D12] overflow-hidden">
                          <span
                            className="block h-full rounded-full bg-[#A3E635]"
                            style={{ width: `${Math.max(group.percentage, 2)}%` }}
                          />
                        </span>
                        <span className="text-[11px] text-gray-400 font-bold tabular-nums">{group.percentage}%</span>
                      </span>
                      <span className="ml-auto md:ml-0 text-gray-400">
                        {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </span>
                    </div>
                  </button>

                  {open && (
                    <div className="border-t border-[#2A3245]">
                      <LicenseTable
                        filters={{ game: group.gameId, sort: 'newest' }}
                        reloadKey={reloadKey}
                        hideGame
                        notify={notify}
                        onChanged={refreshAll}
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            <div className="relative sm:col-span-2 lg:col-span-2">
              <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Email, ism, UID, HWID yoki o‘yin..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141821] border border-[#2A3245] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#A3E635]"
              />
            </div>
            <select value={filterGame} onChange={(e) => setFilterGame(e.target.value)} className={selectClass}>
              <option value="all">Barcha o‘yinlar</option>
              {gameOptions.map(([id, title]) => (
                <option key={id} value={id}>
                  {title}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className={selectClass}
            >
              <option value="all">Har qanday holat</option>
              <option value="active">Faol</option>
              <option value="revoked">To‘xtatilgan</option>
            </select>
            <select
              value={filterDevice}
              onChange={(e) => setFilterDevice(e.target.value as typeof filterDevice)}
              className={selectClass}
            >
              <option value="all">Kompyuter: barchasi</option>
              <option value="bound">Bog‘langan</option>
              <option value="unbound">Bog‘lanmagan</option>
            </select>
            <select value={filterProvider} onChange={(e) => setFilterProvider(e.target.value)} className={selectClass}>
              <option value="all">Barcha manbalar</option>
              {(summary?.providers || []).map((p) => (
                <option key={p} value={p}>
                  {PROVIDER_LABELS[p] || p}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className={selectClass}>
              <option value="newest">Eng yangilari</option>
              <option value="oldest">Eng eskilari</option>
              <option value="recently_bound">Yaqinda bog‘langanlar</option>
            </select>
            {anyFilter && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterGame('all');
                  setFilterStatus('all');
                  setFilterDevice('all');
                  setFilterProvider('all');
                }}
                className="px-2 py-2.5 text-xs font-bold text-gray-400 hover:text-[#A3E635] cursor-pointer"
              >
                Filtrlarni tozalash
              </button>
            )}
          </div>

          <div className="bg-[#141821] border border-[#2A3245] rounded-2xl overflow-hidden shadow-xl">
            <LicenseTable filters={tableFilters} reloadKey={reloadKey} notify={notify} onChanged={refreshAll} />
          </div>
        </div>
      )}

      <GrantLicenseModal
        isOpen={isGrantModalOpen}
        onClose={() => setIsGrantModalOpen(false)}
        onSuccess={(msg) => {
          notify(msg, 'success');
          refreshAll();
        }}
        games={games}
      />
    </div>
  );
};
