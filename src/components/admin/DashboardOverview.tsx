import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Users,
  KeyRound,
  HardDrive,
  Wallet,
  RefreshCw,
  AlertCircle,
  UserPlus,
  Link2,
  CreditCard,
  Activity,
  Trophy,
  ShoppingCart,
  Gamepad2,
} from 'lucide-react';
import {
  getDashboardStats,
  type DashboardStats,
  type DashboardActivity,
} from '../../services/usersService';

const MONTHS = ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avg', 'sen', 'okt', 'noy', 'dek'];

const PROVIDER_LABELS: Record<string, string> = {
  free: 'Bepul',
  admin_grant: 'Admin bergan',
  click: 'Click',
  payme: 'Payme',
  manual_paid: 'Qo‘lda to‘langan',
  other: 'Boshqa',
  none: 'Eski (Firebase)',
};

const fmt = (n: number) => new Intl.NumberFormat('ru-RU').format(n || 0).replace(/,/g, ' ');

const fmtMoney = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1).replace('.', ',')} mln`;
  return fmt(n);
};

const dayLabel = (iso: string) => {
  const [, m, d] = iso.split('-').map(Number);
  return `${d}-${MONTHS[m - 1]}`;
};

const timeAgo = (iso: string | null) => {
  if (!iso) return '';
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'hozirgina';
  if (min < 60) return `${min} daqiqa oldin`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} soat oldin`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} kun oldin`;
  return new Date(iso).toLocaleDateString('uz-UZ');
};

/** Round tick step: 1, 2, 5 × 10^n */
const niceMax = (max: number) => {
  if (max <= 0) return { top: 4, step: 1 };
  const rough = max / 3;
  const pow = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 5, 10].map((m) => m * pow).find((s) => s >= rough) || pow * 10;
  return { top: Math.ceil(max / step) * step, step };
};

/* ---------- Stat tile ---------- */

interface TileProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  note?: React.ReactNode;
  accent?: boolean;
}

const StatTile: React.FC<TileProps> = ({ label, value, icon, note, accent }) => (
  <div
    className={`p-4 sm:p-5 rounded-2xl bg-[#141821] border space-y-2 min-w-0 ${
      accent ? 'border-[#A3E635]/30' : 'border-[#2A3245]'
    }`}
  >
    <div className="flex items-center justify-between gap-2">
      <span className="text-[11px] sm:text-xs text-gray-400 font-medium truncate">{label}</span>
      <span className={accent ? 'text-[#A3E635]' : 'text-gray-500'}>{icon}</span>
    </div>
    <div className="text-2xl sm:text-3xl font-black text-white leading-none">{value}</div>
    {note && <div className="text-[11px] text-gray-500 leading-snug">{note}</div>}
  </div>
);

const Delta: React.FC<{ n: number; label: string }> = ({ n, label }) => (
  <span className="whitespace-nowrap">
    <span className={n > 0 ? 'text-[#A3E635] font-bold' : 'text-gray-400 font-bold'}>+{fmt(n)}</span> {label}
  </span>
);

/* ---------- 30-day column chart ---------- */

type Metric = 'users' | 'licenses' | 'revenue';

const METRICS: { key: Metric; label: string; unit: string }[] = [
  { key: 'users', label: 'Yangi foydalanuvchilar', unit: 'ta' },
  { key: 'licenses', label: 'Olingan litsenziyalar', unit: 'ta' },
  { key: 'revenue', label: 'Click daromadi', unit: 'so‘m' },
];

const DailyChart: React.FC<{ series: DashboardStats['series'] }> = ({ series }) => {
  const [metric, setMetric] = useState<Metric>('licenses');
  const [hover, setHover] = useState<number | null>(null);
  const meta = METRICS.find((m) => m.key === metric)!;
  const values = series.map((d) => d[metric]);
  const total = values.reduce((a, b) => a + b, 0);
  const max = Math.max(0, ...values);
  const { top, step } = niceMax(max);
  const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);
  const peak = values.indexOf(max);
  const show = (n: number) => (metric === 'revenue' ? fmtMoney(n) : fmt(n));

  const readout =
    hover === null ? (
      <>
        <span className="text-white font-black text-lg">{show(total)}</span>
        <span className="text-gray-400 text-xs"> {meta.unit} · so‘nggi 30 kun</span>
      </>
    ) : (
      <>
        <span className="text-white font-black text-lg">{show(values[hover])}</span>
        <span className="text-gray-400 text-xs">
          {' '}
          {meta.unit} · {dayLabel(series[hover].date)}
        </span>
      </>
    );

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[#141821] border border-[#2A3245] space-y-4 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-white">{meta.label} — kunlar bo‘yicha</h3>
          <div className="mt-1 h-7" aria-live="polite">
            {readout}
          </div>
        </div>
        <div className="flex p-1 bg-[#0B0D12] border border-[#2A3245] rounded-xl text-[11px] overflow-x-auto self-start max-w-full">
          {METRICS.map((m) => (
            <button
              key={m.key}
              onClick={() => setMetric(m.key)}
              className={`px-2.5 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all cursor-pointer ${
                metric === m.key ? 'bg-[#A3E635] text-[#0B0D12]' : 'text-gray-400 hover:text-white'
              }`}
            >
              {m.key === 'users' ? 'Userlar' : m.key === 'licenses' ? 'Litsenziyalar' : 'Daromad'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        {/* Y axis */}
        <div className="relative h-44 w-9 shrink-0 text-[10px] text-gray-500 tabular-nums">
          {ticks.map((t) => (
            <span
              key={t}
              className="absolute right-0 leading-none"
              style={{ bottom: `${(t / top) * 100}%`, transform: 'translateY(50%)' }}
            >
              {metric === 'revenue' ? fmtMoney(t) : fmt(t)}
            </span>
          ))}
        </div>

        <div className="relative flex-1 min-w-0">
          {/* Gridlines */}
          <div className="absolute inset-x-0 top-0 h-44 pointer-events-none">
            {ticks.map((t) => (
              <div
                key={t}
                className={`absolute inset-x-0 h-px ${t === 0 ? 'bg-[#3A4560]' : 'bg-[#2A3245]/60'}`}
                style={{ bottom: `${(t / top) * 100}%` }}
              />
            ))}
          </div>

          {/* Columns */}
          <div className="relative h-44 flex items-end gap-[2px]" onMouseLeave={() => setHover(null)}>
            {series.map((d, i) => {
              const v = values[i];
              const h = top ? (v / top) * 100 : 0;
              return (
                <button
                  key={d.date}
                  type="button"
                  className="group relative flex-1 h-full flex items-end justify-center cursor-default focus:outline-none"
                  onMouseEnter={() => setHover(i)}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(null)}
                  onClick={() => setHover(i)}
                  aria-label={`${dayLabel(d.date)}: ${show(v)} ${meta.unit}`}
                >
                  {hover === i && <span className="absolute inset-0 bg-white/[0.04] rounded" />}
                  {i === peak && max > 0 && (
                    <span
                      className="absolute text-[10px] font-bold text-gray-300 whitespace-nowrap tabular-nums"
                      style={{ bottom: `calc(${h}% + 4px)` }}
                    >
                      {show(v)}
                    </span>
                  )}
                  {v > 0 && (
                    <span
                      className={`relative w-full max-w-[24px] rounded-t-[4px] transition-colors ${
                        hover === i ? 'bg-[#BEF264]' : 'bg-[#A3E635]'
                      }`}
                      style={{ height: `${Math.max(h, 1.5)}%` }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* X labels */}
          <div className="relative h-4 mt-1.5 text-[10px] text-gray-500">
            {series.map((d, i) =>
              i === 0 || i === series.length - 1 || (i % 7 === 0 && series.length - 1 - i >= 4) ? (
                <span
                  key={d.date}
                  className="absolute whitespace-nowrap"
                  style={{
                    left: `${((i + 0.5) / series.length) * 100}%`,
                    transform:
                      i === 0 ? 'translateX(-20%)' : i === series.length - 1 ? 'translateX(-80%)' : 'translateX(-50%)',
                  }}
                >
                  {dayLabel(d.date)}
                </span>
              ) : null
            )}
          </div>
        </div>
      </div>

      <table className="sr-only">
        <caption>{meta.label}, so‘nggi 30 kun</caption>
        <thead>
          <tr>
            <th>Sana</th>
            <th>Yangi foydalanuvchilar</th>
            <th>Litsenziyalar</th>
            <th>Daromad (so‘m)</th>
          </tr>
        </thead>
        <tbody>
          {series.map((d) => (
            <tr key={d.date}>
              <td>{d.date}</td>
              <td>{d.users}</td>
              <td>{d.licenses}</td>
              <td>{d.revenue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/* ---------- Ranked bars ---------- */

interface RankedRow {
  key: string;
  label: string;
  value: number;
  sub?: string;
}

const RankedBars: React.FC<{ rows: RankedRow[]; unit?: string; muted?: boolean }> = ({ rows, unit = '', muted }) => {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="space-y-3">
      {rows.map((r, i) => (
        <li key={r.key} className="min-w-0" title={`${r.label}: ${fmt(r.value)} ${unit}`}>
          <div className="flex items-baseline justify-between gap-3 text-xs mb-1.5">
            <span className="text-gray-200 font-semibold truncate">
              {!muted && <span className="text-gray-500 font-mono mr-1.5">{i + 1}.</span>}
              {r.label}
            </span>
            <span className="text-white font-bold tabular-nums shrink-0">
              {fmt(r.value)}
              {unit && <span className="text-gray-500 font-medium"> {unit}</span>}
            </span>
          </div>
          <div className="h-2 rounded-full bg-[#0B0D12] overflow-hidden">
            <div
              className={`h-full rounded-full ${muted ? 'bg-[#7C8BA8]' : 'bg-[#A3E635]'}`}
              style={{ width: `${(r.value / max) * 100}%` }}
            />
          </div>
          {r.sub && <div className="text-[11px] text-gray-500 mt-1 truncate">{r.sub}</div>}
        </li>
      ))}
    </ul>
  );
};

/* ---------- Activity feed ---------- */

const ACTIVITY_META: Record<DashboardActivity['type'], { icon: React.ReactNode; verb: string }> = {
  signup: { icon: <UserPlus className="w-3.5 h-3.5" />, verb: 'ro‘yxatdan o‘tdi' },
  license: { icon: <KeyRound className="w-3.5 h-3.5" />, verb: 'litsenziya oldi' },
  bind: { icon: <Link2 className="w-3.5 h-3.5" />, verb: 'kompyuterni bog‘ladi' },
  payment: { icon: <CreditCard className="w-3.5 h-3.5" />, verb: 'Click orqali to‘ladi' },
};

const ActivityFeed: React.FC<{ items: DashboardActivity[] }> = ({ items }) => {
  if (!items.length) return <p className="text-xs text-gray-500">Hozircha faollik yo‘q.</p>;
  return (
    <ul className="divide-y divide-[#2A3245]">
      {items.map((a, i) => {
        const m = ACTIVITY_META[a.type];
        return (
          <li key={`${a.type}-${a.at}-${i}`} className="flex items-start gap-3 py-2.5 min-w-0">
            <span
              className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                a.type === 'payment'
                  ? 'bg-[#A3E635]/10 border-[#A3E635]/30 text-[#A3E635]'
                  : 'bg-[#0B0D12] border-[#2A3245] text-gray-400'
              }`}
            >
              {m.icon}
            </span>
            <div className="min-w-0 flex-1 text-xs leading-snug">
              <div className="text-gray-300 break-words">
                <span className="text-white font-semibold">{a.user || a.email}</span> {m.verb}
                {a.detail && (
                  <>
                    : <span className="text-gray-200 font-medium">{a.detail}</span>
                  </>
                )}
                {a.type === 'payment' && a.amount ? (
                  <span className="text-white font-bold"> · {fmt(a.amount)} so‘m</span>
                ) : null}
                {a.type === 'license' && a.provider && (
                  <span className="text-gray-500"> · {PROVIDER_LABELS[a.provider] || a.provider}</span>
                )}
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5">
                {timeAgo(a.at)}
                {a.type === 'bind' && a.device ? ` · ${a.device}` : ''}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

/* ---------- Card shell ---------- */

const Card: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; aside?: React.ReactNode }> = ({
  title,
  icon,
  children,
  aside,
}) => (
  <section className="p-4 sm:p-5 rounded-2xl bg-[#141821] border border-[#2A3245] space-y-4 min-w-0">
    <div className="flex items-center justify-between gap-3">
      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        <span className="text-gray-500">{icon}</span>
        {title}
      </h3>
      {aside}
    </div>
    {children}
  </section>
);

/* ---------- Dashboard ---------- */

export const DashboardOverview: React.FC = () => {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllGames, setShowAllGames] = useState(false);
  const mounted = useRef(true);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const stats = await getDashboardStats();
      if (mounted.current) setData(stats);
    } catch (err: any) {
      if (mounted.current) setError(err?.message || 'Statistikani yuklab bo‘lmadi.');
    } finally {
      if (mounted.current) setLoading(false);
    }
  };

  useEffect(() => {
    mounted.current = true;
    load();
    return () => {
      mounted.current = false;
    };
  }, []);

  const gameRows = useMemo<RankedRow[]>(() => {
    if (!data) return [];
    const list = showAllGames ? data.games : data.topGames;
    return list.map((g) => ({
      key: g.gameId,
      label: g.title,
      value: g.licenses,
      sub: [
        `${fmt(g.bound)} bog‘langan`,
        g.last30 ? `+${fmt(g.last30)} 30 kunda` : '',
        g.revenue ? `${fmt(g.revenue)} so‘m` : '',
      ]
        .filter(Boolean)
        .join(' · '),
    }));
  }, [data, showAllGames]);

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-[#141821] border border-[#2A3245] rounded-2xl text-center px-4">
        {error ? (
          <>
            <AlertCircle className="w-8 h-8 text-red-400 mb-3" />
            <p className="text-sm text-gray-300 mb-4">{error}</p>
            <button
              onClick={load}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1E2533] hover:bg-[#2A3245] text-sm font-bold text-white cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Qayta urinish
            </button>
          </>
        ) : (
          <>
            <RefreshCw className="w-8 h-8 text-[#A3E635] animate-spin mb-3" />
            <p className="text-gray-400 text-sm">Statistika yuklanmoqda...</p>
          </>
        )}
      </div>
    );
  }

  const { users, licenses, devices, orders, catalog } = data;
  const licensedShare = users.total ? Math.floor((users.withLicense / users.total) * 100) : 0;
  const providerRows: RankedRow[] = licenses.byProvider.map((p) => ({
    key: p.provider,
    label: PROVIDER_LABELS[p.provider] || p.provider,
    value: p.count,
  }));

  return (
    <div className={`space-y-4 sm:space-y-6 transition-opacity ${loading ? 'opacity-60' : ''}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-black text-white">Umumiy ko‘rinish</h2>
          <p className="text-[11px] text-gray-500">
            Yangilangan: {new Date(data.generatedAt).toLocaleString('uz-UZ')} · kunlar Toshkent vaqti bilan
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-[#141821] hover:bg-[#1E2533] border border-[#2A3245] text-sm font-bold text-gray-200 hover:text-white disabled:opacity-50 cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#A3E635]' : ''}`} />
          <span className="hidden sm:inline">Yangilash</span>
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatTile
          label="Foydalanuvchilar"
          value={fmt(users.total)}
          icon={<Users className="w-5 h-5" />}
          note={
            <span className="flex flex-wrap gap-x-2">
              <Delta n={users.today} label="bugun" />
              <Delta n={users.last7} label="7 kun" />
              <Delta n={users.last30} label="30 kun" />
            </span>
          }
        />
        <StatTile
          label="Litsenziyalar"
          value={fmt(licenses.total)}
          icon={<KeyRound className="w-5 h-5" />}
          note={
            <span className="flex flex-wrap gap-x-2">
              <Delta n={licenses.today} label="bugun" />
              <Delta n={licenses.last7} label="7 kun" />
              <Delta n={licenses.last30} label="30 kun" />
            </span>
          }
        />
        <StatTile
          label="Bog‘langan kompyuterlar"
          value={fmt(devices.uniqueHwids)}
          icon={<HardDrive className="w-5 h-5" />}
          note={
            <>
              Noyob HWID · {fmt(devices.boundLicenses)} litsenziya bog‘langan
              <br />
              <Delta n={devices.boundLast7} label="7 kunda bog‘landi" />
            </>
          }
        />
        <StatTile
          accent
          label="Click daromadi"
          value={`${fmtMoney(orders.revenue.total)}`}
          icon={<Wallet className="w-5 h-5" />}
          note={
            <>
              so‘m · {fmt(orders.paid)} ta Click tasdiqlagan to‘lov
              <br />
              <span className="text-gray-400 font-bold">{fmtMoney(orders.revenue.last30)}</span> so‘m 30 kunda
              {orders.otherPaid > 0 && (
                <>
                  <br />
                  Bundan tashqari qo‘lda: {fmt(orders.otherPaid)} ta, {fmtMoney(orders.otherRevenue)} so‘m
                </>
              )}
            </>
          }
        />
      </div>

      {/* Secondary row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <StatTile
          label="Faol userlar (7 kun)"
          value={fmt(users.active7)}
          icon={<Activity className="w-4 h-4" />}
          note={`30 kunda: ${fmt(users.active30)} · adminlar: ${fmt(users.admins)}`}
        />
        <StatTile
          label="Litsenziyasi borlar"
          value={`${licensedShare}%`}
          icon={<UserPlus className="w-4 h-4" />}
          note={`${fmt(users.withLicense)} / ${fmt(users.total)} foydalanuvchi`}
        />
        <StatTile
          label="Faol litsenziyalar"
          value={fmt(licenses.active)}
          icon={<KeyRound className="w-4 h-4" />}
          note={`${fmt(licenses.activeUnbound)} hali bog‘lanmagan · ${fmt(licenses.revoked)} to‘xtatilgan`}
        />
        <StatTile
          label="Buyurtmalar"
          value={fmt(orders.total)}
          icon={<ShoppingCart className="w-4 h-4" />}
          note={`${fmt(orders.paid + orders.otherPaid)} to‘langan · ${fmt(orders.pending)} kutilmoqda · ${fmt(orders.cancelled)} bekor`}
        />
      </div>

      <DailyChart series={data.series} />

      <div className="grid lg:grid-cols-5 gap-4 sm:gap-6">
        <div className="lg:col-span-3 space-y-4 sm:space-y-6 min-w-0">
          <Card
            title="Eng ommabop o‘yinlar"
            icon={<Trophy className="w-4 h-4" />}
            aside={
              data.games.length > data.topGames.length && (
                <button
                  onClick={() => setShowAllGames((v) => !v)}
                  className="text-[11px] font-bold text-gray-400 hover:text-[#A3E635] cursor-pointer"
                >
                  {showAllGames ? 'Top 10' : `Barchasi (${data.games.length})`}
                </button>
              )
            }
          >
            {gameRows.length ? (
              <RankedBars rows={gameRows} unit="ta" />
            ) : (
              <p className="text-xs text-gray-500">Hali litsenziya olinmagan.</p>
            )}
            <p className="text-[11px] text-gray-500 flex items-center gap-1.5 pt-1">
              <Gamepad2 className="w-3.5 h-3.5" /> Katalogda {fmt(catalog.total)} ta o‘yin, {fmt(catalog.ready)} tasi tayyor
            </p>
          </Card>

          <Card title="Litsenziya manbalari" icon={<KeyRound className="w-4 h-4" />}>
            <RankedBars rows={providerRows} unit="ta" muted />
          </Card>
        </div>

        <div className="lg:col-span-2 min-w-0">
          <Card title="So‘nggi faollik" icon={<Activity className="w-4 h-4" />}>
            <ActivityFeed items={data.activity} />
          </Card>
        </div>
      </div>
    </div>
  );
};
