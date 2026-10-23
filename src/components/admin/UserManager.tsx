import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  Shield,
  Search,
  RefreshCw,
  HardDrive,
  Gamepad2,
  Clock,
  UserCheck,
  UserX,
  X,
  Laptop,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RotateCcw,
  ChevronRight
} from 'lucide-react';
import type { UserWithLicenses, UserRole } from '../../types/auth';
import {
  getAllUsersWithLicenses,
  updateUserRole,
  resetLicenseHwid,
  toggleLicenseStatus,
  deleteLicense,
  type UserStats
} from '../../services/usersService';
import { ADMIN_EMAILS } from '../../context/AuthContext';

export const UserManager: React.FC = () => {
  const [users, setUsers] = useState<UserWithLicenses[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    totalAdmins: 0,
    totalLicenses: 0,
    totalBoundDevices: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user' | 'with_devices'>('all');
  const [selectedUser, setSelectedUser] = useState<UserWithLicenses | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

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
      const data = await getAllUsersWithLicenses();
      setUsers(data.users);
      setStats(data.stats);

      // If user modal is open, keep selectedUser refreshed
      if (selectedUser) {
        const updatedSelected = data.users.find((u) => u.uid === selectedUser.uid);
        if (updatedSelected) {
          setSelectedUser(updatedSelected);
        }
      }
    } catch (err: any) {
      console.error('Failed to load users:', err);
      showToast('Foydalanuvchilarni yuklashda xatolik yuz berdi: ' + err.message, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRoleChange = async (targetUser: UserWithLicenses, newRole: UserRole) => {
    const isMaster = ADMIN_EMAILS.some((e) => e.toLowerCase() === (targetUser.email || '').toLowerCase());
    if (isMaster && newRole !== 'admin') {
      showToast('Bosh adminning rolini bekor qilib bo‘lmaydi!', 'error');
      return;
    }

    const confirmText =
      newRole === 'admin'
        ? `"${targetUser.displayName || targetUser.email}" foydalanuvchisiga Admin huquqini bermoqchimisiz?`
        : `"${targetUser.displayName || targetUser.email}" dan Adminlik huquqini olib tashlamoqchimisiz?`;

    if (!window.confirm(confirmText)) return;

    setActionLoading(`role_${targetUser.uid}`);
    try {
      const res = await updateUserRole(targetUser.uid, targetUser.email, newRole);
      if (res.success) {
        showToast(
          newRole === 'admin'
            ? `Admin huquqi muvaffaqiyatli berildi: ${targetUser.email}`
            : `Adminlik huquqi bekor qilindi: ${targetUser.email}`,
          'success'
        );
        await loadData(true);
      } else {
        showToast(res.error || 'Rolni o‘zgartirishda xatolik', 'error');
      }
    } catch (err: any) {
      showToast('Xatolik: ' + err.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetHwid = async (licenseId: string, gameTitle: string) => {
    if (!window.confirm(`"${gameTitle}" o‘yini uchun bog‘langan kompyuter (HWID) ni yechmoqchimisiz? Foydalanuvchi yangi kompyuterda o‘yinni faollashtira oladi.`)) {
      return;
    }

    setActionLoading(`reset_${licenseId}`);
    try {
      const res = await resetLicenseHwid(licenseId);
      if (res.success) {
        showToast(`Qurilma bog‘lanmasi muvaffaqiyatli yechildi!`, 'success');
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

  const handleToggleLicense = async (licenseId: string, currentStatus: 'active' | 'revoked', gameTitle: string) => {
    const nextStatus = currentStatus === 'active' ? 'to‘xtatib turilsin' : 'qayta faollashtirilsin';
    if (!window.confirm(`"${gameTitle}" litsenziyasi ${nextStatus}mi?`)) {
      return;
    }

    setActionLoading(`toggle_${licenseId}`);
    try {
      const res = await toggleLicenseStatus(licenseId, currentStatus);
      if (res.success) {
        showToast(`Litsenziya holati o‘zgartirildi`, 'success');
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

  const handleDeleteLicense = async (licenseId: string, gameTitle: string) => {
    if (!window.confirm(`Haqiqatan ham "${gameTitle}" litsenziyasini butunlay o‘chirib tashlamoqchimisiz?`)) {
      return;
    }

    setActionLoading(`delete_${licenseId}`);
    try {
      const res = await deleteLicense(licenseId);
      if (res.success) {
        showToast(`Litsenziya o‘chirildi`, 'success');
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

  const formatDate = (timestamp: any): string => {
    if (!timestamp) return 'Noma’lum';
    try {
      if (timestamp.toDate) {
        return timestamp.toDate().toLocaleString('uz-UZ', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      }
      if (timestamp.seconds) {
        return new Date(timestamp.seconds * 1000).toLocaleString('uz-UZ', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      }
      return new Date(timestamp).toLocaleString('uz-UZ');
    } catch {
      return 'Noma’lum';
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        (u.displayName && u.displayName.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        u.uid.toLowerCase().includes(q);

      if (!matchSearch) return false;

      if (roleFilter === 'admin') return u.isAdmin;
      if (roleFilter === 'user') return !u.isAdmin;
      if (roleFilter === 'with_devices') return (u.boundDevicesCount || 0) > 0;

      return true;
    });
  }, [users, searchQuery, roleFilter]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border text-sm font-semibold transition-all transform translate-y-0 ${
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

      {/* User Statistics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#141821] border border-[#2A3245] space-y-2">
          <span className="text-xs text-gray-400 uppercase tracking-wider block font-medium">Jami Foydalanuvchilar</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-white">{stats.totalUsers}</span>
            <Users className="w-5 h-5 text-gray-500" />
          </div>
          <span className="text-[11px] text-gray-500 block">Google orqali ro‘yxatdan o‘tganlar</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#141821] border border-[#A3E635]/30 space-y-2">
          <span className="text-xs text-[#A3E635] uppercase tracking-wider block font-medium">Adminlar</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-[#A3E635]">{stats.totalAdmins}</span>
            <ShieldCheck className="w-5 h-5 text-[#A3E635]" />
          </div>
          <span className="text-[11px] text-gray-400 block">Admin huquqiga ega akkauntlar</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#141821] border border-cyan-500/20 space-y-2">
          <span className="text-xs text-cyan-400 uppercase tracking-wider block font-medium">Olingan Litsenziyalar</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-cyan-400">{stats.totalLicenses}</span>
            <Gamepad2 className="w-5 h-5 text-cyan-500" />
          </div>
          <span className="text-[11px] text-gray-500 block">Foydalanuvchilar olgan o‘yinlar</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#141821] border border-purple-500/20 space-y-2">
          <span className="text-xs text-purple-400 uppercase tracking-wider block font-medium">Bog‘langan Kompyuterlar</span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-purple-400">{stats.totalBoundDevices}</span>
            <HardDrive className="w-5 h-5 text-purple-500" />
          </div>
          <span className="text-[11px] text-gray-500 block">HWID bilan bog‘langan qurilmalar</span>
        </div>
      </div>

      {/* Action and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Foydalanuvchi ismi, emaili yoki UID bo‘yicha qidiring..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141821] border border-[#2A3245] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#A3E635]"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-[#141821] border border-[#2A3245] rounded-xl text-xs overflow-x-auto">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                roleFilter === 'all'
                  ? 'bg-[#A3E635] text-[#0B0D12]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Barchasi ({users.length})
            </button>
            <button
              onClick={() => setRoleFilter('admin')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                roleFilter === 'admin'
                  ? 'bg-[#A3E635] text-[#0B0D12]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Adminlar ({stats.totalAdmins})
            </button>
            <button
              onClick={() => setRoleFilter('user')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                roleFilter === 'user'
                  ? 'bg-[#A3E635] text-[#0B0D12]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Foydalanuvchilar ({users.length - stats.totalAdmins})
            </button>
            <button
              onClick={() => setRoleFilter('with_devices')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                roleFilter === 'with_devices'
                  ? 'bg-[#A3E635] text-[#0B0D12]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Qurilmasi borlar
            </button>
          </div>
        </div>

        <button
          onClick={() => loadData(true)}
          disabled={refreshing || loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#141821] hover:bg-[#1E2533] text-gray-200 hover:text-white border border-[#2A3245] text-sm font-bold transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#A3E635]' : ''}`} />
          <span>Yangilash</span>
        </button>
      </div>

      {/* Users Table / List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[#141821] border border-[#2A3245] rounded-2xl">
          <RefreshCw className="w-8 h-8 text-[#A3E635] animate-spin mb-3" />
          <p className="text-gray-400 text-sm">Foydalanuvchilar ro‘yxati yuklanmoqda...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-16 bg-[#141821] border border-[#2A3245] rounded-2xl">
          <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">Hech qanday foydalanuvchi topilmadi</h3>
          <p className="text-gray-400 text-xs">
            {searchQuery
              ? `"${searchQuery}" bo‘yicha natija yo‘q. Qidiruv so‘zini o‘zgartirib ko‘ring.`
              : 'Hozircha tizimda birorta ham foydalanuvchi mavjud emas.'}
          </p>
        </div>
      ) : (
        <div className="bg-[#141821] border border-[#2A3245] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-[#0B0D12] text-xs uppercase tracking-wider text-gray-400 border-b border-[#2A3245]">
                <tr>
                  <th scope="col" className="px-6 py-4">Foydalanuvchi</th>
                  <th scope="col" className="px-6 py-4">Roli / Huquqi</th>
                  <th scope="col" className="px-6 py-4">O‘yinlar / Litsenziyalar</th>
                  <th scope="col" className="px-6 py-4">Bog‘langan Kompyuter</th>
                  <th scope="col" className="px-6 py-4">So‘nggi Faollik</th>
                  <th scope="col" className="px-6 py-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A3245]">
                {filteredUsers.map((item) => {
                  const isMaster = ADMIN_EMAILS.some((e) => e.toLowerCase() === (item.email || '').toLowerCase());
                  const isRoleLoading = actionLoading === `role_${item.uid}`;

                  return (
                    <tr
                      key={item.uid}
                      className="hover:bg-[#1A202C]/60 transition-colors cursor-pointer group"
                      onClick={() => {
                        setSelectedUser(item);
                        setIsDetailModalOpen(true);
                      }}
                    >
                      {/* User Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {item.photoURL ? (
                            <img
                              src={item.photoURL}
                              alt={item.displayName || 'Avatar'}
                              className="w-10 h-10 rounded-full border border-[#2A3245] object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-[#1E2533] border border-[#2A3245] text-[#A3E635] flex items-center justify-center font-bold text-sm flex-shrink-0">
                              {(item.displayName || item.email || 'U')[0].toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white truncate group-hover:text-[#A3E635] transition-colors">
                                {item.displayName || 'Ismsiz Foydalanuvchi'}
                              </span>
                              {isMaster && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#A3E635]/20 text-[#A3E635] border border-[#A3E635]/30">
                                  Bosh Admin
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-400 truncate font-mono">
                              {item.email || 'Email yo‘q'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        {item.isAdmin ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#A3E635]/15 text-[#A3E635] border border-[#A3E635]/30">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#1E2533] text-gray-400 border border-[#2A3245]">
                            <Users className="w-3.5 h-3.5" />
                            Foydalanuvchi
                          </span>
                        )}
                      </td>

                      {/* Claimed Games */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-[#0B0D12] text-xs font-bold text-white border border-[#2A3245]">
                            {item.claimedGamesCount || 0} ta o‘yin
                          </span>
                          {item.activeLicensesCount !== undefined && item.activeLicensesCount < item.claimedGamesCount && (
                            <span className="text-[11px] text-amber-400">
                              ({item.claimedGamesCount - item.activeLicensesCount} to‘xtatilgan)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Bound Devices */}
                      <td className="px-6 py-4">
                        {(item.boundDevicesCount || 0) > 0 ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
                            <HardDrive className="w-3.5 h-3.5" />
                            <span>{item.boundDevicesCount} ta kompyuter</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">Bog‘lanmagan</span>
                        )}
                      </td>

                      {/* Last Active */}
                      <td className="px-6 py-4 text-xs text-gray-400">
                        {formatDate(item.lastLoginAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          {/* Role Toggle Button */}
                          {!isMaster ? (
                            item.isAdmin ? (
                              <button
                                onClick={() => handleRoleChange(item, 'user')}
                                disabled={isRoleLoading}
                                title="Adminlik huquqini bekor qilish"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold transition-all disabled:opacity-50"
                              >
                                {isRoleLoading ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <UserX className="w-3.5 h-3.5" />
                                )}
                                <span className="hidden xl:inline">Adminlikni olish</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleRoleChange(item, 'admin')}
                                disabled={isRoleLoading}
                                title="Admin etib tayinlash"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#A3E635]/10 hover:bg-[#A3E635]/20 text-[#A3E635] border border-[#A3E635]/30 text-xs font-bold transition-all disabled:opacity-50"
                              >
                                {isRoleLoading ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <UserCheck className="w-3.5 h-3.5" />
                                )}
                                <span className="hidden xl:inline">Admin qilish</span>
                              </button>
                            )
                          ) : (
                            <span className="text-[11px] font-bold text-gray-500 px-2 py-1 bg-[#1E2533] rounded-lg">
                              Himoyalangan
                            </span>
                          )}

                          {/* Open Details */}
                          <button
                            onClick={() => {
                              setSelectedUser(item);
                              setIsDetailModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#1E2533] hover:bg-[#2A3245] text-gray-200 text-xs font-bold transition-all"
                          >
                            <span>Batafsil</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Details & License Management Modal */}
      {isDetailModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#141821] border border-[#2A3245] rounded-3xl overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-[#0B0D12] border-b border-[#2A3245] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#A3E635]/15 border border-[#A3E635]/30 text-[#A3E635] flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-white">Foydalanuvchi Tafsilotlari</h2>
                  <p className="text-xs text-gray-400">Akkaunt ma’lumotlari, o‘yin litsenziyalari va bog‘langan qurilmalar</p>
                </div>
              </div>

              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#1E2533] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Profile Card */}
              <div className="p-6 rounded-2xl bg-[#0B0D12] border border-[#2A3245] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  {selectedUser.photoURL ? (
                    <img
                      src={selectedUser.photoURL}
                      alt={selectedUser.displayName || 'Avatar'}
                      className="w-16 h-16 rounded-2xl border-2 border-[#A3E635]/30 object-cover shadow-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-[#1E2533] border border-[#2A3245] text-[#A3E635] flex items-center justify-center font-black text-2xl">
                      {(selectedUser.displayName || selectedUser.email || 'U')[0].toUpperCase()}
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-black text-white">{selectedUser.displayName || 'Ism kiritilmagan'}</h3>
                      {ADMIN_EMAILS.some((e) => e.toLowerCase() === (selectedUser.email || '').toLowerCase()) ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#A3E635]/20 text-[#A3E635] border border-[#A3E635]/30">
                          Bosh Administrator
                        </span>
                      ) : selectedUser.isAdmin ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#A3E635]/20 text-[#A3E635] border border-[#A3E635]/30 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Administrator
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#1E2533] text-gray-400 border border-[#2A3245]">
                          Oddiy Foydalanuvchi
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-300 font-mono">{selectedUser.email}</p>
                    <div className="flex items-center gap-2 pt-1 text-xs text-gray-500">
                      <span>UID:</span>
                      <code className="text-gray-400 font-mono bg-[#141821] px-2 py-0.5 rounded border border-[#2A3245]">
                        {selectedUser.uid}
                      </code>
                      <button
                        onClick={() => copyToClipboard(selectedUser.uid, 'uid')}
                        className="text-gray-400 hover:text-white transition-colors"
                        title="UID dan nusxa olish"
                      >
                        {copiedId === 'uid' ? (
                          <Check className="w-3.5 h-3.5 text-[#A3E635]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Role Switcher in Modal */}
                <div className="flex flex-col items-start md:items-end gap-2 w-full md:w-auto">
                  <span className="text-xs text-gray-400 font-medium">Boshqaruv Roli</span>
                  {ADMIN_EMAILS.some((e) => e.toLowerCase() === (selectedUser.email || '').toLowerCase()) ? (
                    <div className="px-3.5 py-2 rounded-xl bg-[#1E2533] text-xs font-bold text-gray-400 border border-[#2A3245]">
                      🔒 Asosiy Bosh Admin (O‘zgartirib bo‘lmaydi)
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRoleChange(selectedUser, selectedUser.isAdmin ? 'user' : 'admin')}
                        disabled={actionLoading === `role_${selectedUser.uid}`}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          selectedUser.isAdmin
                            ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-[#A3E635] text-[#0B0D12] hover:bg-[#b2f043] shadow-accent-glow'
                        }`}
                      >
                        {actionLoading === `role_${selectedUser.uid}` ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : selectedUser.isAdmin ? (
                          <ShieldAlert className="w-4 h-4" />
                        ) : (
                          <ShieldCheck className="w-4 h-4" />
                        )}
                        <span>{selectedUser.isAdmin ? 'Adminlikni Bekor Qilish' : 'Admin Etib Tayinlash'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Activity Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#0B0D12] border border-[#2A3245] flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div>
                    <span className="text-[11px] text-gray-500 block">So‘nggi Kirish</span>
                    <span className="text-sm font-bold text-white">{formatDate(selectedUser.lastLoginAt)}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0B0D12] border border-[#2A3245] flex items-center gap-3">
                  <Gamepad2 className="w-5 h-5 text-[#A3E635] flex-shrink-0" />
                  <div>
                    <span className="text-[11px] text-gray-500 block">Biriktirilgan Litsenziyalar</span>
                    <span className="text-sm font-bold text-white">
                      {selectedUser.licenses?.length || 0} ta o‘yin ({selectedUser.boundDevicesCount || 0} ta bog‘langan kompyuter)
                    </span>
                  </div>
                </div>
              </div>

              {/* Claimed Games / Licenses List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Gamepad2 className="w-4 h-4 text-[#A3E635]" />
                    <span>Olingan O‘yin Litsenziyalari va Bog‘langan Qurilmalar</span>
                  </h4>
                  <span className="text-xs text-gray-400 font-mono">
                    Jami: {selectedUser.licenses?.length || 0} ta
                  </span>
                </div>

                {(!selectedUser.licenses || selectedUser.licenses.length === 0) ? (
                  <div className="text-center py-10 bg-[#0B0D12] border border-[#2A3245] rounded-2xl">
                    <Gamepad2 className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                    <p className="text-sm font-bold text-gray-300">Bu foydalanuvchi hali birorta ham o‘yin olmagan</p>
                    <p className="text-xs text-gray-500">Saytda "Kutubxonaga qo‘shish" orqali olingan o‘yinlar bu yerda aks etadi.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {selectedUser.licenses.map((lic) => {
                      const isResetting = actionLoading === `reset_${lic.id}`;
                      const isToggling = actionLoading === `toggle_${lic.id}`;
                      const isDeleting = actionLoading === `delete_${lic.id}`;

                      return (
                        <div
                          key={lic.id}
                          className="p-4 rounded-2xl bg-[#0B0D12] border border-[#2A3245] hover:border-[#A3E635]/30 transition-all space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h5 className="text-base font-bold text-white">{lic.gameTitle}</h5>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                    lic.status === 'active'
                                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                      : 'bg-red-500/15 text-red-400 border border-red-500/30'
                                  }`}
                                >
                                  {lic.status === 'active' ? 'FAOL' : 'TO‘XTATILGAN'}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 font-mono">ID: {lic.gameSlug || lic.gameId}</p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 flex-wrap">
                              {lic.hwid && (
                                <button
                                  onClick={() => handleResetHwid(lic.id, lic.gameTitle)}
                                  disabled={isResetting}
                                  title="Bog‘langan kompyuterni bekor qilish (yangi kompyuterda o‘ynash uchun)"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all disabled:opacity-50"
                                >
                                  {isResetting ? (
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <RotateCcw className="w-3.5 h-3.5" />
                                  )}
                                  <span>Qurilmani Yechish (HWID Reset)</span>
                                </button>
                              )}

                              <button
                                onClick={() => handleToggleLicense(lic.id, lic.status, lic.gameTitle)}
                                disabled={isToggling}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 ${
                                  lic.status === 'active'
                                    ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                    : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                }`}
                              >
                                {isToggling ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Shield className="w-3.5 h-3.5" />
                                )}
                                <span>{lic.status === 'active' ? 'To‘xtatish' : 'Faollashtirish'}</span>
                              </button>

                              <button
                                onClick={() => handleDeleteLicense(lic.id, lic.gameTitle)}
                                disabled={isDeleting}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold transition-all disabled:opacity-50"
                                title="Litsenziyani butunlay o‘chirish"
                              >
                                {isDeleting ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <X className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Hardware ID and Device Info */}
                          <div className="p-3 rounded-xl bg-[#141821] border border-[#2A3245] text-xs space-y-2">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <Laptop className="w-4 h-4 text-purple-400" />
                                <span className="text-gray-400">Bog‘langan Kompyuter:</span>
                                <span className="font-bold text-white">
                                  {lic.boundDeviceName || (lic.hwid ? 'Noma’lum Kompyuter' : 'Hali bog‘lanmagan')}
                                </span>
                              </div>

                              {lic.boundAt && (
                                <span className="text-gray-500 text-[11px]">
                                  Bog‘langan vaqt: {formatDate(lic.boundAt)}
                                </span>
                              )}
                            </div>

                            {lic.hwid && (
                              <div className="flex items-center gap-2 text-gray-400 pt-1 border-t border-[#2A3245]">
                                <span className="text-[11px] text-gray-500 font-mono">HWID:</span>
                                <code className="text-purple-300 font-mono text-[11px] bg-[#0B0D12] px-2 py-0.5 rounded border border-purple-500/20 break-all">
                                  {lic.hwid}
                                </code>
                                <button
                                  onClick={() => copyToClipboard(lic.hwid!, `hwid_${lic.id}`)}
                                  className="text-gray-400 hover:text-white"
                                  title="HWID nusxalash"
                                >
                                  {copiedId === `hwid_${lic.id}` ? (
                                    <Check className="w-3 h-3 text-[#A3E635]" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-[#0B0D12] border-t border-[#2A3245] flex items-center justify-end">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-[#1E2533] hover:bg-[#2A3245] text-white text-xs font-bold transition-all"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
