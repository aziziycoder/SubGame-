import React, { useState, useEffect, useMemo } from 'react';
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
  RotateCcw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Copy,
  Check,
  ShieldCheck,
  ShieldAlert,
  Layers,
  Laptop
} from 'lucide-react';
import type { Game } from '../../types/game';
import {
  fetchAllLicensesWithStats,
  type GameLicenseItem,
  type GameLicenseGroup,
  type LicenseGlobalStats
} from '../../services/licensesService';
import {
  resetLicenseHwid,
  toggleLicenseStatus,
  deleteLicense
} from '../../services/usersService';
import { GrantLicenseModal } from './GrantLicenseModal';

interface LicenseStatsManagerProps {
  games: Game[];
}

export const LicenseStatsManager: React.FC<LicenseStatsManagerProps> = ({ games }) => {
  const [licenses, setLicenses] = useState<GameLicenseItem[]>([]);
  const [groups, setGroups] = useState<GameLicenseGroup[]>([]);
  const [stats, setStats] = useState<LicenseGlobalStats>({
    totalLicenses: 0,
    totalUniqueUsers: 0,
    totalGamesClaimed: 0,
    totalBoundDevices: 0,
    topGame: null
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'by_game' | 'all_table'>('by_game');
  const [sortBy, setSortBy] = useState<'claims_desc' | 'claims_asc' | 'alpha' | 'bound_desc'>('claims_desc');
  const [filterGame, setFilterGame] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'bound' | 'unbound' | 'active' | 'revoked'>('all');
  const [expandedGames, setExpandedGames] = useState<Record<string, boolean>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await fetchAllLicensesWithStats(games);
      setLicenses(res.licenses);
      setGroups(res.groups);
      setStats(res.stats);

      // By default expand the top 3 games for quick visibility
      if (res.groups.length > 0 && Object.keys(expandedGames).length === 0) {
        const initialExpanded: Record<string, boolean> = {};
        res.groups.slice(0, 3).forEach((g) => {
          initialExpanded[g.gameId] = true;
        });
        setExpandedGames(initialExpanded);
      }
    } catch (err: any) {
      console.error('Failed to load license stats:', err);
      showToast('Litsenziyalar statistikasini yuklashda xatolik: ' + err.message, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [games]);

  const toggleGameExpand = (gameId: string) => {
    setExpandedGames((prev) => ({
      ...prev,
      [gameId]: !prev[gameId]
    }));
  };

  const expandAll = () => {
    const allExp: Record<string, boolean> = {};
    groups.forEach((g) => {
      allExp[g.gameId] = true;
    });
    setExpandedGames(allExp);
  };

  const collapseAll = () => {
    setExpandedGames({});
  };

  const handleResetHwid = async (licenseId: string, gameTitle: string, userName: string) => {
    if (
      !window.confirm(
        `"${userName}" foydalanuvchisining "${gameTitle}" o‘yini uchun bog‘langan kompyuter (HWID) apparatini yechmoqchimisiz?\n\nFoydalanuvchi litsenziyani yangi kompyuterda ishga tushira oladi.`
      )
    ) {
      return;
    }

    setActionLoading(`reset_${licenseId}`);
    try {
      const res = await resetLicenseHwid(licenseId);
      if (res.success) {
        showToast(`HWID qurilma bog‘lanmasi muvaffaqiyatli yechildi!`, 'success');
        await loadData(true);
      } else {
        showToast(res.error || 'Xatolik yuz berdi', 'error');
      }
    } catch (err: any) {
      showToast('Xatolik: ' + err.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (licenseId: string, currentStatus: 'active' | 'revoked', gameTitle: string) => {
    const nextStatusText = currentStatus === 'active' ? 'to‘xtatib turishni' : 'qayta faollashtirishni';
    if (!window.confirm(`"${gameTitle}" litsenziyasini ${nextStatusText} xohlaysizmi?`)) {
      return;
    }

    setActionLoading(`toggle_${licenseId}`);
    try {
      const res = await toggleLicenseStatus(licenseId, currentStatus);
      if (res.success) {
        showToast('Litsenziya holati o‘zgartirildi', 'success');
        await loadData(true);
      } else {
        showToast(res.error || 'Xatolik yuz berdi', 'error');
      }
    } catch (err: any) {
      showToast('Xatolik: ' + err.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteLicense = async (licenseId: string, gameTitle: string, userName: string) => {
    if (
      !window.confirm(
        `Haqiqatan ham "${userName}" foydalanuvchisining "${gameTitle}" o‘yini litsenziyasini butunlay o‘chirib tashlamoqchimisiz?\n\nBu amalni qaytarib bo‘lmaydi.`
      )
    ) {
      return;
    }

    setActionLoading(`delete_${licenseId}`);
    try {
      const res = await deleteLicense(licenseId);
      if (res.success) {
        showToast('Litsenziya butunlay o‘chirildi', 'success');
        await loadData(true);
      } else {
        showToast(res.error || 'Xatolik yuz berdi', 'error');
      }
    } catch (err: any) {
      showToast('Xatolik: ' + err.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const unpaidLicenses = useMemo(() => {
    return licenses.filter((lic) => {
      // Samir Bekturganov (Click official payer) - ALWAYS keep!
      if (lic.userId === 'TbCgC6mgoxS2W9X5xF9jGJOnIko2') return false;
      if (lic.paymentProvider === 'click' || (lic.paidAmount && lic.paidAmount > 0)) return false;
      return lic.status === 'revoked';
    });
  }, [licenses]);

  const handleCleanUnpaidLicenses = async () => {
    if (unpaidLicenses.length === 0) {
      showToast('O‘chiriladigan to‘xtatilgan / to‘lovsiz litsenziyalar topilmadi', 'success');
      return;
    }

    if (
      !window.confirm(
        `Bazada to‘lovsiz olingan va to‘xtatilgan ${unpaidLicenses.length} ta litsenziya mavjud.\n\nEslatma: Samir Bekturganov (Click orqali to‘lagan rasmiy xaridor) saqlab qolinadi!\n\nQolgan ${unpaidLicenses.length} ta litsenziyani butunlay o‘chirib tashlashni tasdiqlaysizmi?`
      )
    ) {
      return;
    }

    setActionLoading('clean_unpaid');
    let deleted = 0;
    try {
      for (const lic of unpaidLicenses) {
        const res = await deleteLicense(lic.id);
        if (res.success) deleted++;
      }
      showToast(`${deleted} ta to‘lovsiz litsenziya muvaffaqiyatli butunlay o‘chirildi!`, 'success');
      await loadData(true);
    } catch (err: any) {
      showToast('O‘chirishda xatolik: ' + err.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const corruptedLicenses = useMemo(() => {
    const validGameIds = new Set(games.flatMap((g) => [g.id, g.slug]));
    // Explicitly protect all known official games
    validGameIds.add('stray');
    validGameIds.add('mafia-definitive-edition');
    validGameIds.add('a-plague-tale-innocence');
    validGameIds.add('a-plague-tale-requiem');

    return licenses.filter((lic) => {
      // NEVER flag real Stray or official games as corrupted!
      if (lic.gameId === 'stray' || lic.gameSlug === 'stray') return false;
      if (validGameIds.has(lic.gameId) || validGameIds.has(lic.gameSlug)) return false;

      const isKnownCorruptedId = ['44zh', '6zz7', 'mafia-definitive-edi'].includes(lic.gameId) || ['44zh', '6zz7', 'mafia-definitive-edi'].includes(lic.gameSlug);
      const isInvalidGame = !validGameIds.has(lic.gameId) && !validGameIds.has(lic.gameSlug);
      return isKnownCorruptedId || (isInvalidGame && lic.gameTitle.includes('SubGame'));
    });
  }, [licenses, games]);

  const handleCleanCorruptedLicenses = async () => {
    if (corruptedLicenses.length === 0) {
      showToast('Xato yoki test litsenziyalar topilmadi', 'success');
      return;
    }

    if (
      !window.confirm(
        `Bazada noto‘g‘ri yoki test paytida hosil bo‘lgan ${corruptedLicenses.length} ta xato litsenziya topildi (masalan, "SubGame O'yini" va qisqa ID-li yozuvlar).\n\nUlarni butunlay o‘chirib tozalashni tasdiqlaysizmi?`
      )
    ) {
      return;
    }

    setActionLoading('clean_corrupted');
    let deleted = 0;
    try {
      for (const lic of corruptedLicenses) {
        const res = await deleteLicense(lic.id);
        if (res.success) deleted++;
      }
      showToast(`${deleted} ta xato litsenziya muvaffaqiyatli butunlay o‘chirildi!`, 'success');
      await loadData(true);
    } catch (err: any) {
      showToast('O‘chirishda xatolik: ' + err.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (timestamp: any): string => {
    if (!timestamp) return 'Noma’lum';
    try {
      if (timestamp.toDate) {
        return timestamp.toDate().toLocaleString('uz-UZ', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      if (timestamp.seconds) {
        return new Date(timestamp.seconds * 1000).toLocaleString('uz-UZ', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      return new Date(timestamp).toLocaleString('uz-UZ', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Noma’lum';
    }
  };

  // Filtered and Sorted Groups (Games-first view)
  const filteredGroups = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    let result = groups.map((group) => {
      // Filter claimants inside this group if search applies to user
      const matchedClaimants = group.licenses.filter((lic) => {
        const matchesQuery =
          !q ||
          group.gameTitle.toLowerCase().includes(q) ||
          group.gameSlug.toLowerCase().includes(q) ||
          lic.userName?.toLowerCase().includes(q) ||
          lic.userEmail?.toLowerCase().includes(q) ||
          lic.userId.toLowerCase().includes(q) ||
          lic.hwid?.toLowerCase().includes(q);

        if (!matchesQuery) return false;

        if (filterStatus === 'bound') return Boolean(lic.hwid);
        if (filterStatus === 'unbound') return !lic.hwid;
        if (filterStatus === 'active') return lic.status === 'active';
        if (filterStatus === 'revoked') return lic.status === 'revoked';

        return true;
      });

      return {
        ...group,
        filteredLicenses: matchedClaimants
      };
    });

    // Only keep groups that match search or have matching claimants
    if (q || filterStatus !== 'all') {
      result = result.filter(
        (g) =>
          g.gameTitle.toLowerCase().includes(q) ||
          g.gameSlug.toLowerCase().includes(q) ||
          g.filteredLicenses.length > 0
      );
    }

    if (filterGame !== 'all') {
      result = result.filter((g) => g.gameId === filterGame || g.gameSlug === filterGame);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'claims_desc') return b.totalLicenses - a.totalLicenses;
      if (sortBy === 'claims_asc') return a.totalLicenses - b.totalLicenses;
      if (sortBy === 'alpha') return a.gameTitle.localeCompare(b.gameTitle);
      if (sortBy === 'bound_desc') return b.boundDevicesCount - a.boundDevicesCount;
      return 0;
    });

    return result;
  }, [groups, searchQuery, sortBy, filterGame, filterStatus]);

  // Filtered Flat Licenses (Table view)
  const filteredLicenses = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return licenses.filter((lic) => {
      const matchSearch =
        !q ||
        lic.gameTitle.toLowerCase().includes(q) ||
        lic.gameSlug.toLowerCase().includes(q) ||
        lic.userName?.toLowerCase().includes(q) ||
        lic.userEmail?.toLowerCase().includes(q) ||
        lic.userId.toLowerCase().includes(q) ||
        lic.hwid?.toLowerCase().includes(q) ||
        lic.id.toLowerCase().includes(q);

      if (!matchSearch) return false;

      if (filterGame !== 'all' && lic.gameId !== filterGame && lic.gameSlug !== filterGame) {
        return false;
      }

      if (filterStatus === 'bound') return Boolean(lic.hwid);
      if (filterStatus === 'unbound') return !lic.hwid;
      if (filterStatus === 'active') return lic.status === 'active';
      if (filterStatus === 'revoked') return lic.status === 'revoked';

      return true;
    });
  }, [licenses, searchQuery, filterGame, filterStatus]);

  // Export to CSV
  const exportToCSV = () => {
    if (licenses.length === 0) {
      showToast('Eksport qilish uchun litsenziyalar mavjud emas', 'error');
      return;
    }

    const headers = [
      'Litsenziya ID',
      'O‘yin nomi',
      'O‘yin ID',
      'Foydalanuvchi ismi',
      'Foydalanuvchi emaili',
      'Foydalanuvchi UID',
      'Litsenziya holati',
      'Kompyuterga bog‘langanmi',
      'HWID apparat ID',
      'Qurilma nomi',
      'Olingan sana'
    ];

    const rows = licenses.map((l) => [
      `"${l.id}"`,
      `"${l.gameTitle.replace(/"/g, '""')}"`,
      `"${l.gameId}"`,
      `"${(l.userName || '').replace(/"/g, '""')}"`,
      `"${l.userEmail || ''}"`,
      `"${l.userId}"`,
      `"${l.status === 'active' ? 'Faol' : 'To‘xtatilgan'}"`,
      `"${l.hwid ? 'Bog‘langan' : 'Bog‘lanmagan'}"`,
      `"${l.hwid || ''}"`,
      `"${l.boundDeviceName || ''}"`,
      `"${formatDate(l.createdAt)}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `subgame_licenses_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Litsenziyalar ro‘yxati CSV formatida yuklab olindi', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border text-sm font-semibold transition-all ${
            toastMessage.type === 'success'
              ? 'bg-[#141821] border-[#A3E635]/40 text-[#A3E635]'
              : 'bg-[#141821] border-red-500/40 text-red-400'
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

      {/* Global Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#141821] border border-[#2A3245] space-y-2">
          <span className="text-xs text-gray-400 uppercase tracking-wider block font-medium">
            Jami Litsenziyalar
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-white">{stats.totalLicenses}</span>
            <KeyRound className="w-5 h-5 text-gray-500" />
          </div>
          <span className="text-[11px] text-gray-500 block">Foydalanuvchilar olgan jami o‘yinlar</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#141821] border border-cyan-500/30 space-y-2">
          <span className="text-xs text-cyan-400 uppercase tracking-wider block font-medium">
            Litsenziyali O‘yinlar
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-cyan-400">{stats.totalGamesClaimed}</span>
            <Gamepad2 className="w-5 h-5 text-cyan-400" />
          </div>
          <span className="text-[11px] text-gray-400 block">Kamida 1 marta olingan turli o‘yinlar</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#141821] border border-purple-500/30 space-y-2">
          <span className="text-xs text-purple-400 uppercase tracking-wider block font-medium">
            Bog‘langan Kompyuterlar
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-purple-400">{stats.totalBoundDevices}</span>
            <HardDrive className="w-5 h-5 text-purple-400" />
          </div>
          <span className="text-[11px] text-gray-400 block">HWID bilan launcherda ochilganlar</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#141821] border border-[#A3E635]/30 space-y-2">
          <span className="text-xs text-[#A3E635] uppercase tracking-wider block font-medium">
            Eng Ommabop O‘yin
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-black text-[#A3E635] truncate max-w-[180px]">
              {stats.topGame ? stats.topGame.gameTitle : 'Mavjud emas'}
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#A3E635]/20 text-[#A3E635] font-bold">
              {stats.topGame ? `${stats.topGame.count} ta` : '0'}
            </span>
          </div>
          <span className="text-[11px] text-gray-400 block">
            {stats.topGame ? `Barcha litsenziyalarning ${stats.topGame.percentage}% qismi` : 'Hozircha o‘yin olinmagan'}
          </span>
        </div>
      </div>

      {/* Control Bar: Search, Filters, View Modes & Export */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
        {/* Search */}
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="O‘yin nomi, foydalanuvchi ismi, email yoki HWID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141821] border border-[#2A3245] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#A3E635]"
            />
          </div>

          {/* Game filter dropdown */}
          <select
            value={filterGame}
            onChange={(e) => setFilterGame(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-[#141821] border border-[#2A3245] text-xs sm:text-sm text-gray-300 focus:outline-none focus:border-[#A3E635]"
          >
            <option value="all">Barcha o‘yinlar ({groups.length})</option>
            {groups.map((g) => (
              <option key={g.gameId} value={g.gameId}>
                {g.gameTitle} ({g.totalLicenses})
              </option>
            ))}
          </select>

          {/* Status filter dropdown */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3.5 py-2.5 rounded-xl bg-[#141821] border border-[#2A3245] text-xs sm:text-sm text-gray-300 focus:outline-none focus:border-[#A3E635]"
          >
            <option value="all">Barcha holatlar</option>
            <option value="bound">Faqat kompyuterga bog‘langanlar (HWID)</option>
            <option value="unbound">Hali kompyuterga ulanmaganlar</option>
            <option value="active">Faqat faol litsenziyalar</option>
            <option value="revoked">To‘xtatilgan litsenziyalar</option>
          </select>
        </div>

        {/* View mode toggle, Sort & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* View mode buttons */}
          <div className="flex items-center p-1 bg-[#141821] border border-[#2A3245] rounded-xl text-xs">
            <button
              onClick={() => setViewMode('by_game')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'by_game'
                  ? 'bg-[#A3E635] text-[#0B0D12]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>O‘yinlar bo‘yicha</span>
            </button>
            <button
              onClick={() => setViewMode('all_table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'all_table'
                  ? 'bg-[#A3E635] text-[#0B0D12]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Barcha litsenziyalar ({licenses.length})</span>
            </button>
          </div>

          {/* Sort Selector for Game view */}
          {viewMode === 'by_game' && (
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-[#141821] border border-[#2A3245] text-xs text-gray-300 focus:outline-none focus:border-[#A3E635]"
            >
              <option value="claims_desc">Eng ko‘p olinganlar birinchi</option>
              <option value="claims_asc">Eng kam olinganlar birinchi</option>
              <option value="bound_desc">Bog‘langan kompyuterlar ko‘p</option>
              <option value="alpha">O‘yin nomi bo‘yicha (A-Z)</option>
            </select>
          )}

          {/* Expand/Collapse All (only for game view) */}
          {viewMode === 'by_game' && filteredGroups.length > 0 && (
            <div className="hidden sm:flex items-center gap-1">
              <button
                onClick={expandAll}
                className="px-2.5 py-2 rounded-xl bg-[#141821] hover:bg-[#1E2533] text-gray-300 text-xs font-semibold border border-[#2A3245] transition-all"
                title="Barcha o‘yinlarning foydalanuvchilar ro‘yxatini ochish"
              >
                Barchasini ochish
              </button>
              <button
                onClick={collapseAll}
                className="px-2.5 py-2 rounded-xl bg-[#141821] hover:bg-[#1E2533] text-gray-300 text-xs font-semibold border border-[#2A3245] transition-all"
                title="Barcha o‘yinlar ro‘yxatini yopish"
              >
                Yopish
              </button>
            </div>
          )}

          {/* Delete Corrupted Test Licenses */}
          {corruptedLicenses.length > 0 && (
            <button
              onClick={handleCleanCorruptedLicenses}
              disabled={actionLoading === 'clean_corrupted' || refreshing || loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/40 text-xs font-black transition-all disabled:opacity-50 cursor-pointer shadow-md"
              title="Noto‘g‘ri yoki test paytida hosil bo‘lgan xato litsenziyalarni butunlay tozalash"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xato litsenziyalarni tozalash ({corruptedLicenses.length})</span>
            </button>
          )}

          {/* Delete Unpaid Licenses */}
          {unpaidLicenses.length > 0 && (
            <button
              onClick={handleCleanUnpaidLicenses}
              disabled={actionLoading === 'clean_unpaid' || refreshing || loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/40 text-xs font-black transition-all disabled:opacity-50 cursor-pointer shadow-md"
              title="To‘lovsiz olingan litsenziyalarni bazadan butunlay o‘chirib tozalash"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>To‘lovsizlarni chopish ({unpaidLicenses.length})</span>
            </button>
          )}

          {/* Grant License button */}
          <button
            onClick={() => setIsGrantModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#A3E635] hover:bg-[#8ece28] text-[#0B0D12] text-xs font-black transition-all cursor-pointer shadow-md shadow-[#A3E635]/20"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Litsenziya berish</span>
          </button>

          {/* Export to CSV */}
          <button
            onClick={exportToCSV}
            disabled={licenses.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#141821] hover:bg-[#1E2533] text-gray-200 hover:text-white border border-[#2A3245] text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
            title="Litsenziyalar ro‘yxatini Excel/CSV formatida yuklab olish"
          >
            <Download className="w-3.5 h-3.5 text-[#A3E635]" />
            <span className="hidden sm:inline">CSV Eksport</span>
          </button>

          {/* Refresh button */}
          <button
            onClick={() => loadData(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#141821] hover:bg-[#1E2533] text-gray-200 hover:text-white border border-[#2A3245] text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#A3E635]' : ''}`} />
            <span className="hidden sm:inline">Yangilash</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-[#141821] border border-[#2A3245] rounded-2xl">
          <RefreshCw className="w-8 h-8 text-[#A3E635] animate-spin mb-3" />
          <p className="text-gray-400 text-sm">Litsenziyalar va o‘yinlar statistikasi yuklanmoqda...</p>
        </div>
      ) : licenses.length === 0 ? (
        <div className="text-center py-20 bg-[#141821] border border-[#2A3245] rounded-2xl">
          <KeyRound className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">Hozircha hech qanday litsenziya olinmagan</h3>
          <p className="text-gray-400 text-xs max-w-md mx-auto">
            Foydalanuvchilar o‘yin subtitrlarini bepul yoki pullik litsenziya orqali qo‘shganda, bu yerda qaysi o‘yin qancha olingani va kimlar olgani real-time ko‘rinadi.
          </p>
        </div>
      ) : viewMode === 'by_game' ? (
        /* REJIM 1: O'YINLAR BO'YICHA GURUHLANGAN STATISTIKA VA KIMLAR OLGANI */
        <div className="space-y-4">
          {filteredGroups.length === 0 ? (
            <div className="text-center py-16 bg-[#141821] border border-[#2A3245] rounded-2xl">
              <Search className="w-10 h-10 text-gray-600 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-white">Qidiruv bo‘yicha o‘yin topilmadi</h4>
              <p className="text-xs text-gray-400 mt-1">«{searchQuery}» so‘rovi bo‘yicha mos keladigan litsenziya yo‘q.</p>
            </div>
          ) : (
            filteredGroups.map((group, index) => {
              const isExpanded = Boolean(expandedGames[group.gameId]);
              const claimantsToDisplay = group.filteredLicenses || group.licenses;

              return (
                <div
                  key={group.gameId}
                  className="bg-[#141821] border border-[#2A3245] hover:border-[#A3E635]/40 rounded-2xl overflow-hidden transition-all shadow-md"
                >
                  {/* Game Summary Header Card */}
                  <div
                    onClick={() => toggleGameExpand(group.gameId)}
                    className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer hover:bg-[#1A202C]/50 transition-colors select-none"
                  >
                    {/* Game Info with Cover */}
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      {/* Rank number */}
                      <span className="w-7 h-7 rounded-lg bg-[#0B0D12] border border-[#2A3245] text-xs font-black text-gray-400 flex items-center justify-center shrink-0">
                        #{index + 1}
                      </span>

                      {/* Game Image */}
                      {group.coverImage ? (
                        <img
                          src={group.coverImage}
                          alt={group.gameTitle}
                          className="w-16 h-12 sm:w-20 sm:h-14 rounded-xl object-cover border border-[#2A3245] shrink-0 shadow"
                        />
                      ) : (
                        <div className="w-16 h-12 sm:w-20 sm:h-14 rounded-xl bg-[#0B0D12] border border-[#2A3245] flex items-center justify-center text-[#A3E635] shrink-0">
                          <Gamepad2 className="w-6 h-6" />
                        </div>
                      )}

                      {/* Title & metadata */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base sm:text-lg font-bold text-white truncate hover:text-[#A3E635] transition-colors">
                            {group.gameTitle}
                          </h3>
                          <span className="text-[11px] font-mono text-gray-500 bg-[#0B0D12] px-2 py-0.5 rounded border border-[#2A3245]">
                            {group.gameSlug}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 flex-wrap">
                          {group.genres && group.genres.length > 0 && (
                            <span>{group.genres.slice(0, 3).join(', ')}</span>
                          )}
                          {group.lastClaimedAt && (
                            <span className="flex items-center gap-1 text-[11px] text-gray-500">
                              <Clock className="w-3 h-3" />
                              Oxirgi olingan: {formatDate(group.lastClaimedAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stats Badges & Progress Bar */}
                    <div className="flex items-center gap-4 sm:gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-[#2A3245]/60">
                      {/* Metric Badges */}
                      <div className="flex items-center gap-3">
                        {/* Total Claims Badge */}
                        <div className="text-center px-3 py-1.5 rounded-xl bg-[#0B0D12] border border-[#2A3245]">
                          <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">
                            Olingan
                          </span>
                          <span className="text-base sm:text-lg font-black text-[#A3E635]">
                            {group.totalLicenses} ta
                          </span>
                        </div>

                        {/* Bound HWID Badge */}
                        <div className="text-center px-3 py-1.5 rounded-xl bg-[#0B0D12] border border-purple-500/30">
                          <span className="text-[10px] text-purple-300 uppercase tracking-wider block font-semibold flex items-center justify-center gap-1">
                            <Laptop className="w-2.5 h-2.5" />
                            HWID
                          </span>
                          <span className="text-base sm:text-lg font-black text-purple-300">
                            {group.boundDevicesCount} ta
                          </span>
                        </div>

                        {/* Share of total */}
                        <div className="hidden lg:flex flex-col items-end min-w-[90px]">
                          <span className="text-xs font-bold text-white mb-1">
                            {group.percentage}% ulush
                          </span>
                          <div className="w-20 h-2 bg-[#0B0D12] rounded-full overflow-hidden border border-[#2A3245]">
                            <div
                              className="h-full bg-gradient-to-r from-[#A3E635] to-emerald-400 rounded-full"
                              style={{ width: `${Math.min(group.percentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Expand / Collapse Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleGameExpand(group.gameId);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1E2533] hover:bg-[#2A3245] text-xs font-bold text-gray-200 transition-colors"
                      >
                        <Users className="w-3.5 h-3.5 text-[#A3E635]" />
                        <span>Kimlar olgani ({claimantsToDisplay.length})</span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Users List (Kimlar olgani) */}
                  {isExpanded && (
                    <div className="border-t border-[#2A3245] bg-[#0B0D12]/70 p-4 sm:p-6 space-y-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-[#A3E635]" />
                          <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                            «{group.gameTitle}» o‘yinini olgan foydalanuvchilar ({claimantsToDisplay.length})
                          </h4>
                        </div>
                        <span className="text-[11px] text-gray-500 font-mono">
                          {group.boundDevicesCount} ta qurilmada faol o‘rnatilgan
                        </span>
                      </div>

                      {claimantsToDisplay.length === 0 ? (
                        <div className="py-6 text-center text-xs text-gray-500">
                          Ushbu filtr bo‘yicha foydalanuvchilar topilmadi.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {claimantsToDisplay.map((claimant) => {
                            const isActionRunning =
                              actionLoading === `reset_${claimant.id}` ||
                              actionLoading === `toggle_${claimant.id}` ||
                              actionLoading === `delete_${claimant.id}`;

                            return (
                              <div
                                key={claimant.id}
                                className="p-4 rounded-xl bg-[#141821] border border-[#2A3245] hover:border-[#2A3245]/80 flex flex-col justify-between gap-3 shadow-inner"
                              >
                                {/* Top User Details */}
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-center gap-3 min-w-0">
                                    {claimant.userPhoto ? (
                                      <img
                                        src={claimant.userPhoto}
                                        alt={claimant.userName || 'User'}
                                        className="w-10 h-10 rounded-full border border-[#2A3245] object-cover shrink-0"
                                      />
                                    ) : (
                                      <div className="w-10 h-10 rounded-full bg-[#1E2533] border border-[#2A3245] text-[#A3E635] flex items-center justify-center font-bold text-sm shrink-0">
                                        {(claimant.userName || claimant.userEmail || 'U')[0].toUpperCase()}
                                      </div>
                                    )}

                                    <div className="min-w-0">
                                      <div className="font-bold text-sm text-white truncate">
                                        {claimant.userName || 'Ismsiz foydalanuvchi'}
                                      </div>
                                      <div className="text-xs text-gray-400 font-mono truncate">
                                        {claimant.userEmail}
                                      </div>
                                      <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                                        <Clock className="w-3 h-3 text-gray-600" />
                                        <span>Olingan: {formatDate(claimant.createdAt)}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Status & Payment Badges */}
                                  <div className="flex flex-col items-end gap-1 shrink-0">
                                    {claimant.paymentProvider === 'click' && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                        ✓ Click ({claimant.paidAmount || 5000} so‘m)
                                      </span>
                                    )}

                                    {claimant.status === 'active' ? (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#A3E635]/15 text-[#A3E635] border border-[#A3E635]/30">
                                        Faol
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-500/15 text-red-400 border border-red-500/30">
                                        To‘xtatilgan
                                      </span>
                                    )}

                                    {claimant.revokedReason && (
                                      <span className="text-[10px] text-red-400 font-medium text-right max-w-[130px] truncate" title={claimant.revokedReason}>
                                        ⚠️ {claimant.revokedReason}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* HWID Binding Status */}
                                <div className="p-2.5 rounded-lg bg-[#0B0D12] border border-[#2A3245] text-xs space-y-1.5">
                                  <div className="flex items-center justify-between text-[11px]">
                                    <span className="text-gray-400 font-medium flex items-center gap-1">
                                      <Laptop className="w-3 h-3 text-purple-400" />
                                      Bog‘langan apparat (HWID):
                                    </span>
                                    {claimant.hwid ? (
                                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Qurilma ulangan
                                      </span>
                                    ) : (
                                      <span className="text-gray-500">
                                        Ulanmagan (Launcherda ochilmagan)
                                      </span>
                                    )}
                                  </div>

                                  {claimant.hwid && (
                                    <div className="flex items-center justify-between gap-2 pt-0.5">
                                      <code className="text-[10px] font-mono text-purple-300 bg-[#141821] px-2 py-0.5 rounded border border-purple-500/20 truncate">
                                        {claimant.boundDeviceName ? `${claimant.boundDeviceName} • ` : ''}
                                        {claimant.hwid.slice(0, 16)}...
                                      </code>
                                      <button
                                        onClick={() => copyToClipboard(claimant.hwid!, claimant.id)}
                                        className="text-gray-400 hover:text-white p-1"
                                        title="HWID dan nusxa olish"
                                      >
                                        {copiedId === claimant.id ? (
                                          <Check className="w-3 h-3 text-[#A3E635]" />
                                        ) : (
                                          <Copy className="w-3 h-3" />
                                        )}
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#2A3245]/50">
                                  {claimant.hwid && (
                                    <button
                                      onClick={() =>
                                        handleResetHwid(
                                          claimant.id,
                                          group.gameTitle,
                                          claimant.userName || claimant.userEmail
                                        )
                                      }
                                      disabled={isActionRunning}
                                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-bold transition-all disabled:opacity-50 cursor-pointer"
                                      title="Kompyuter bog‘lanmasini yechish (Foydalanuvchi boshqa kompyuterda qayta o‘ynashi uchun)"
                                    >
                                      <RotateCcw className="w-3 h-3" />
                                      <span>HWID yechish</span>
                                    </button>
                                  )}

                                  <button
                                    onClick={() =>
                                      handleToggleStatus(claimant.id, claimant.status, group.gameTitle)
                                    }
                                    disabled={isActionRunning}
                                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-all disabled:opacity-50 cursor-pointer ${
                                      claimant.status === 'active'
                                        ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30'
                                        : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                    }`}
                                    title={
                                      claimant.status === 'active'
                                        ? 'Litsenziyani vaqtincha to‘xtatish'
                                        : 'Litsenziyani qayta yoqish'
                                    }
                                  >
                                    {claimant.status === 'active' ? (
                                      <>
                                        <ShieldAlert className="w-3 h-3" />
                                        <span>To‘xtatish</span>
                                      </>
                                    ) : (
                                      <>
                                        <ShieldCheck className="w-3 h-3" />
                                        <span>Faollashtirish</span>
                                      </>
                                    )}
                                  </button>

                                  <button
                                    onClick={() =>
                                      handleDeleteLicense(
                                        claimant.id,
                                        group.gameTitle,
                                        claimant.userName || claimant.userEmail
                                      )
                                    }
                                    disabled={isActionRunning}
                                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-all disabled:opacity-50 cursor-pointer"
                                    title="Litsenziyani bazadan butunlay o‘chirish"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* REJIM 2: BARCHA LITSENZIYALAR YAGONA TO'LIQ JADVALI */
        <div className="bg-[#141821] border border-[#2A3245] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-[#0B0D12] text-xs uppercase tracking-wider text-gray-400 border-b border-[#2A3245]">
                <tr>
                  <th scope="col" className="px-6 py-4">Foydalanuvchi</th>
                  <th scope="col" className="px-6 py-4">O‘yin</th>
                  <th scope="col" className="px-6 py-4">Olingan Sana</th>
                  <th scope="col" className="px-6 py-4">Kompyuter (HWID)</th>
                  <th scope="col" className="px-6 py-4">Holati</th>
                  <th scope="col" className="px-6 py-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A3245]">
                {filteredLicenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 text-xs">
                      Hech qanday litsenziya topilmadi.
                    </td>
                  </tr>
                ) : (
                  filteredLicenses.map((lic) => {
                    const isActionRunning =
                      actionLoading === `reset_${lic.id}` ||
                      actionLoading === `toggle_${lic.id}` ||
                      actionLoading === `delete_${lic.id}`;

                    return (
                      <tr key={lic.id} className="hover:bg-[#1A202C]/60 transition-colors">
                        {/* User */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {lic.userPhoto ? (
                              <img
                                src={lic.userPhoto}
                                alt={lic.userName || 'User'}
                                className="w-9 h-9 rounded-full border border-[#2A3245] object-cover shrink-0"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-[#1E2533] border border-[#2A3245] text-[#A3E635] flex items-center justify-center font-bold text-xs shrink-0">
                                {(lic.userName || lic.userEmail || 'U')[0].toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <span className="font-bold text-white block truncate">
                                {lic.userName || 'Ismsiz foydalanuvchi'}
                              </span>
                              <span className="text-xs text-gray-400 font-mono block truncate">
                                {lic.userEmail}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Game */}
                        <td className="px-6 py-4">
                          <div className="font-bold text-white flex items-center gap-2">
                            <Gamepad2 className="w-4 h-4 text-[#A3E635] shrink-0" />
                            <span className="truncate">{lic.gameTitle}</span>
                          </div>
                          <span className="text-[11px] font-mono text-gray-500 block">
                            {lic.gameSlug}
                          </span>
                        </td>

                        {/* Claimed Date */}
                        <td className="px-6 py-4 text-xs text-gray-400">
                          {formatDate(lic.createdAt)}
                        </td>

                        {/* Bound Computer */}
                        <td className="px-6 py-4">
                          {lic.hwid ? (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                                <Laptop className="w-3 h-3" />
                                {lic.boundDeviceName || 'Bog‘langan Qurilma'}
                              </span>
                              <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-mono">
                                <span>{lic.hwid.slice(0, 14)}...</span>
                                <button
                                  onClick={() => copyToClipboard(lic.hwid!, lic.id)}
                                  className="text-gray-500 hover:text-white"
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
                            <span className="text-xs text-gray-500">Bog‘lanmagan</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {lic.paymentProvider === 'click' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                ✓ Click ({lic.paidAmount || 5000} so‘m)
                              </span>
                            )}
                            {lic.status === 'active' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#A3E635]/15 text-[#A3E635] border border-[#A3E635]/30">
                                <CheckCircle2 className="w-3 h-3" />
                                Faol
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/30">
                                <AlertCircle className="w-3 h-3" />
                                To‘xtatilgan
                              </span>
                            )}
                            {lic.revokedReason && (
                              <span className="text-[10px] text-red-400 block font-mono">
                                {lic.revokedReason}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {lic.hwid && (
                              <button
                                onClick={() =>
                                  handleResetHwid(
                                    lic.id,
                                    lic.gameTitle,
                                    lic.userName || lic.userEmail
                                  )
                                }
                                disabled={isActionRunning}
                                className="px-2.5 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                                title="Qurilma bog‘lanmasini yechish"
                              >
                                HWID yechish
                              </button>
                            )}

                            <button
                              onClick={() => handleToggleStatus(lic.id, lic.status, lic.gameTitle)}
                              disabled={isActionRunning}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all disabled:opacity-50 cursor-pointer ${
                                lic.status === 'active'
                                  ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30'
                                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              }`}
                              title={lic.status === 'active' ? 'To‘xtatish' : 'Faollashtirish'}
                            >
                              {lic.status === 'active' ? 'To‘xtatish' : 'Yoqish'}
                            </button>

                            <button
                              onClick={() =>
                                handleDeleteLicense(
                                  lic.id,
                                  lic.gameTitle,
                                  lic.userName || lic.userEmail
                                )
                              }
                              disabled={isActionRunning}
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
        </div>
      )}

      {/* Grant License Modal */}
      <GrantLicenseModal
        isOpen={isGrantModalOpen}
        onClose={() => setIsGrantModalOpen(false)}
        onSuccess={(msg) => {
          showToast(msg, 'success');
          loadData(true);
        }}
        games={games}
      />
    </div>
  );
};
