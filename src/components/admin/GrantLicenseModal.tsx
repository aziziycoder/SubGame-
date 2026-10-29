import React, { useState, useEffect, useMemo } from 'react';
import {
  KeyRound,
  Search,
  Gamepad2,
  User,
  AlertCircle,
  X,
  CheckCircle2,
  DollarSign,
  FileText,
  Laptop,
  RefreshCw
} from 'lucide-react';
import type { Game } from '../../types/game';
import type { UserWithLicenses, UserProfile } from '../../types/auth';
import { grantLicenseToUser, getAllUsersWithLicenses } from '../../services/usersService';
import { useAuth } from '../../context/AuthContext';

interface GrantLicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  games: Game[];
  users?: UserWithLicenses[];
  preselectedUser?: UserWithLicenses | UserProfile | null;
}

export const GrantLicenseModal: React.FC<GrantLicenseModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  games = [],
  users: initialUsers,
  preselectedUser = null
}) => {
  const { user: currentAdmin } = useAuth();

  const [allUsers, setAllUsers] = useState<UserWithLicenses[]>(initialUsers || []);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserWithLicenses | UserProfile | null>(preselectedUser);

  const [gameSearchQuery, setGameSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const [paymentProvider, setPaymentProvider] = useState<'admin_grant' | 'manual_paid' | 'click' | 'payme' | 'other'>('admin_grant');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [adminNote, setAdminNote] = useState<string>('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync preselectedUser if passed or changed
  useEffect(() => {
    if (preselectedUser) {
      setSelectedUser(preselectedUser);
    }
  }, [preselectedUser]);

  // Fetch users if not passed or empty
  useEffect(() => {
    if (isOpen && (!initialUsers || initialUsers.length === 0)) {
      setLoadingUsers(true);
      getAllUsersWithLicenses()
        .then((data) => {
          setAllUsers(data.users);
          if (preselectedUser) {
            const found = data.users.find((u) => u.uid === preselectedUser.uid);
            if (found) setSelectedUser(found);
          }
        })
        .catch((err) => {
          console.error('Failed to load users for grant modal:', err);
        })
        .finally(() => {
          setLoadingUsers(false);
        });
    } else if (initialUsers && initialUsers.length > 0) {
      setAllUsers(initialUsers);
    }
  }, [isOpen, initialUsers, preselectedUser]);

  // Update default paidAmount when selectedGame or paymentProvider changes
  useEffect(() => {
    if (paymentProvider === 'admin_grant') {
      setPaidAmount(0);
    } else if (selectedGame) {
      // Parse numeric price from game if possible
      const rawPrice = selectedGame.subtitlePrice || selectedGame.price || '';
      const numericMatch = rawPrice.replace(/\s+/g, '').match(/\d+/);
      if (numericMatch) {
        setPaidAmount(parseInt(numericMatch[0], 10));
      } else {
        setPaidAmount(10000);
      }
    }
  }, [paymentProvider, selectedGame]);

  // Filter users by search query
  const filteredUsers = useMemo(() => {
    if (!userSearchQuery.trim()) return allUsers.slice(0, 8);
    const q = userSearchQuery.toLowerCase().trim();
    return allUsers.filter(
      (u) =>
        (u.displayName && u.displayName.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        u.uid.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [allUsers, userSearchQuery]);

  // Filter games by search query
  const filteredGames = useMemo(() => {
    if (!gameSearchQuery.trim()) return games;
    const q = gameSearchQuery.toLowerCase().trim();
    return games.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        (g.developer && g.developer.toLowerCase().includes(q)) ||
        g.slug.toLowerCase().includes(q)
    );
  }, [games, gameSearchQuery]);

  // Check if selected user already owns the selected game
  const isAlreadyOwned = useMemo(() => {
    if (!selectedUser || !selectedGame) return false;
    const userWithLic = selectedUser as UserWithLicenses;
    if (!userWithLic.licenses || !Array.isArray(userWithLic.licenses)) return false;
    return userWithLic.licenses.some(
      (lic) =>
        (lic.gameId === selectedGame.id || lic.gameSlug === selectedGame.slug) &&
        lic.status === 'active'
    );
  }, [selectedUser, selectedGame]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedUser) {
      setErrorMessage('Iltimos, litsenziya beriladigan foydalanuvchini tanlang!');
      return;
    }

    if (!selectedGame) {
      setErrorMessage('Iltimos, o‘yinni tanlang!');
      return;
    }

    if (isAlreadyOwned) {
      setErrorMessage('Ushbu foydalanuvchida bu o‘yin litsenziyasi allaqachon mavjud!');
      return;
    }

    setSubmitting(true);

    try {
      const res = await grantLicenseToUser({
        userId: selectedUser.uid,
        userEmail: selectedUser.email || '',
        userName: selectedUser.displayName || selectedUser.email?.split('@')[0] || 'Foydalanuvchi',
        userPhoto: selectedUser.photoURL || null,
        gameId: selectedGame.id,
        gameTitle: selectedGame.title,
        gameSlug: selectedGame.slug,
        paymentProvider,
        paidAmount: Number(paidAmount) || 0,
        adminNote: adminNote.trim(),
        grantedBy: currentAdmin?.email || currentAdmin?.displayName || 'Admin'
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Litsenziya berishda xatolik yuz berdi');
        return;
      }

      onSuccess(`"${selectedGame.title}" litsenziyasi ${selectedUser.displayName || selectedUser.email} uchun muvaffaqiyatli berildi!`);
      onClose();
    } catch (err: any) {
      console.error('Error in grant license modal submit:', err);
      setErrorMessage(err?.message || 'Kutilmagan xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl my-6 bg-[#141821] border border-[#2A3245] rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-[#0B0D12] border-b border-[#2A3245] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#A3E635]/15 border border-[#A3E635]/30 text-[#A3E635] flex items-center justify-center shadow-lg shadow-[#A3E635]/5">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <span>Foydalanuvchiga Litsenziya Berish</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#A3E635]/20 text-[#A3E635] border border-[#A3E635]/30">
                  Admin Panel
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                Foydalanuvchiga to‘g‘ridan-to‘g‘ri o‘yin litsenziyasi va launcher orqali o‘ynash huquqini biriktirish
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={submitting}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#1E2533] transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 max-h-[80vh]">
          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs sm:text-sm flex items-start gap-3 animate-fade-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold block">Xatolik yuz berdi:</span>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Section 1: User Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#A3E635]" />
                <span>1. Foydalanuvchini Tanlang *</span>
              </span>
              {selectedUser && (
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="text-[11px] text-[#A3E635] hover:underline normal-case font-semibold"
                >
                  Boshqa foydalanuvchini tanlash
                </button>
              )}
            </label>

            {selectedUser ? (
              <div className="p-4 rounded-2xl bg-[#0B0D12] border-2 border-[#A3E635]/40 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {selectedUser.photoURL ? (
                    <img
                      src={selectedUser.photoURL}
                      alt={selectedUser.displayName || 'Avatar'}
                      className="w-12 h-12 rounded-xl object-cover border border-[#2A3245] flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-[#1E2533] border border-[#2A3245] text-[#A3E635] flex items-center justify-center font-bold text-lg flex-shrink-0">
                      {(selectedUser.displayName || selectedUser.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white truncate text-sm">
                        {selectedUser.displayName || 'Ismsiz Foydalanuvchi'}
                      </span>
                      {selectedUser.role === 'admin' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#A3E635]/20 text-[#A3E635] border border-[#A3E635]/30">
                          Admin
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 truncate font-mono">
                      {selectedUser.email || 'Email mavjud emas'}
                    </div>
                    <div className="text-[11px] text-gray-500 font-mono truncate">
                      UID: {selectedUser.uid}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="px-3 py-1.5 rounded-xl bg-[#A3E635]/15 text-[#A3E635] text-xs font-bold border border-[#A3E635]/30 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Tanlangan</span>
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Ism, email yoki UID bo‘yicha qidiring..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B0D12] border border-[#2A3245] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#A3E635]"
                  />
                  {loadingUsers && (
                    <RefreshCw className="w-4 h-4 text-[#A3E635] animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
                  )}
                </div>

                {filteredUsers.length === 0 ? (
                  <div className="p-4 rounded-xl bg-[#0B0D12] border border-[#2A3245] text-center text-xs text-gray-400">
                    Foydalanuvchi topilmadi
                  </div>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-1.5 p-1 bg-[#0B0D12] border border-[#2A3245] rounded-xl">
                    {filteredUsers.map((u) => (
                      <button
                        key={u.uid}
                        type="button"
                        onClick={() => setSelectedUser(u)}
                        className="w-full p-2.5 rounded-lg hover:bg-[#1E2533] transition-all flex items-center justify-between text-left group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {u.photoURL ? (
                            <img
                              src={u.photoURL}
                              alt=""
                              className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-[#141821] text-[#A3E635] border border-[#2A3245] flex items-center justify-center font-bold text-xs flex-shrink-0">
                              {(u.displayName || u.email || 'U')[0].toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate group-hover:text-[#A3E635]">
                              {u.displayName || 'Ismsiz'}
                            </p>
                            <p className="text-[11px] text-gray-400 truncate font-mono">
                              {u.email}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[10px] text-gray-500 font-mono">
                            {u.claimedGamesCount || 0} ta o‘yin
                          </span>
                          <span className="px-2 py-1 rounded-md bg-[#141821] text-[11px] text-gray-300 group-hover:bg-[#A3E635] group-hover:text-[#0B0D12] font-bold transition-colors">
                            Tanlash
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 2: Game Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-[#A3E635]" />
                <span>2. O‘yinni Tanlang *</span>
              </span>
              {selectedGame && (
                <button
                  type="button"
                  onClick={() => setSelectedGame(null)}
                  className="text-[11px] text-[#A3E635] hover:underline normal-case font-semibold"
                >
                  Boshqa o‘yinni tanlash
                </button>
              )}
            </label>

            {selectedGame ? (
              <div className={`p-4 rounded-2xl bg-[#0B0D12] border-2 transition-all ${
                isAlreadyOwned ? 'border-amber-500/50' : 'border-[#A3E635]/40'
              } flex items-center justify-between gap-4`}>
                <div className="flex items-center gap-3.5 min-w-0">
                  <img
                    src={selectedGame.cover || selectedGame.cardImage}
                    alt={selectedGame.title}
                    className="w-14 h-18 object-cover rounded-xl border border-[#2A3245] flex-shrink-0 shadow-md"
                  />
                  <div className="min-w-0 space-y-1">
                    <h4 className="text-base font-black text-white truncate">
                      {selectedGame.title}
                    </h4>
                    <div className="flex items-center gap-2 flex-wrap text-xs text-gray-400">
                      <span>{selectedGame.developer || 'Noma’lum studiya'}</span>
                      <span>•</span>
                      <span className="text-[#A3E635] font-bold">{selectedGame.subtitlePrice || selectedGame.price || 'Tekin'}</span>
                      <span>•</span>
                      <span className="font-mono text-[11px] text-gray-500">ID: {selectedGame.slug || selectedGame.id}</span>
                    </div>

                    {isAlreadyOwned && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-bold">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Foydalanuvchida bu o‘yin allaqachon mavjud!</span>
                      </div>
                    )}
                  </div>
                </div>

                {!isAlreadyOwned && (
                  <span className="px-3 py-1.5 rounded-xl bg-[#A3E635]/15 text-[#A3E635] text-xs font-bold border border-[#A3E635]/30 flex items-center gap-1.5 flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Tanlangan</span>
                  </span>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="O‘yin nomi yoki studiya bo‘yicha qidiring..."
                    value={gameSearchQuery}
                    onChange={(e) => setGameSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B0D12] border border-[#2A3245] text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#A3E635]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1 bg-[#0B0D12] border border-[#2A3245] rounded-xl">
                  {filteredGames.map((game) => (
                    <button
                      key={game.id}
                      type="button"
                      onClick={() => setSelectedGame(game)}
                      className="p-2.5 rounded-xl bg-[#141821] hover:bg-[#1E2533] border border-[#2A3245] hover:border-[#A3E635]/40 transition-all flex items-center gap-3 text-left group"
                    >
                      <img
                        src={game.cover || game.cardImage}
                        alt={game.title}
                        className="w-10 h-13 object-cover rounded-lg border border-[#2A3245] flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white truncate group-hover:text-[#A3E635]">
                          {game.title}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate">
                          {game.developer}
                        </p>
                        <p className="text-[10px] text-[#A3E635] font-semibold">
                          {game.subtitlePrice || game.price || 'Tekin'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Grant Reason / Payment Details */}
          <div className="p-4 rounded-2xl bg-[#0B0D12] border border-[#2A3245] space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#A3E635]" />
              <span>3. Taqdim Etish Turi va To‘lov Ma’lumotlari</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1.5 font-medium">
                  Taqdim etish usuli:
                </label>
                <select
                  value={paymentProvider}
                  onChange={(e) => setPaymentProvider(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141821] border border-[#2A3245] text-xs sm:text-sm text-white focus:outline-none focus:border-[#A3E635]"
                >
                  <option value="admin_grant">Admin sovg‘asi / Bepul grant</option>
                  <option value="manual_paid">Qo‘lda to‘lov qabul qilindi (Karta / Naqd)</option>
                  <option value="click">Click orqali to‘landi</option>
                  <option value="payme">Payme orqali to‘landi</option>
                  <option value="other">Boshqa sabab</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1.5 font-medium">
                  Qabul qilingan summa (so‘m):
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141821] border border-[#2A3245] text-xs sm:text-sm text-white focus:outline-none focus:border-[#A3E635]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1.5 font-medium flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-gray-500" />
                <span>Admin izohi / Chek yoki Murojaat ma’lumoti (Ixtiyoriy):</span>
              </label>
              <input
                type="text"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Masalan: Telegram orqali murojaat qildi, karta orqali to‘landi yoki VIP foydalanuvchi uchun sovg‘a"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141821] border border-[#2A3245] text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#A3E635]"
              />
            </div>
          </div>

          {/* Section 4: Device & Launcher Information Callout */}
          <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/25 flex items-start gap-3 text-xs text-purple-200">
            <Laptop className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold block text-purple-300">HWID va Launcher faollashuvi haqida:</span>
              <p className="text-gray-300 leading-relaxed text-[11px]">
                Litsenziya darhol <span className="font-bold text-white">"Faol"</span> holatda yaratiladi va apparat ID (<span className="font-mono text-purple-300">HWID: bo‘sh</span>) qoldiriladi. Foydalanuvchi o‘z kompyuteridagi <span className="font-bold text-[#A3E635]">SubGame Launcher</span> dasturiga kirib o‘yinni ishga tushirganida uning qurilmasiga avtomatik biriktiriladi.
              </p>
            </div>
          </div>

          {/* Modal Footer / Submit */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#2A3245]">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-[#1E2533] hover:bg-[#2A3245] text-gray-300 text-xs sm:text-sm font-bold transition-all disabled:opacity-50 cursor-pointer"
            >
              Bekor qilish
            </button>

            <button
              type="submit"
              disabled={submitting || !selectedUser || !selectedGame || isAlreadyOwned}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#A3E635] hover:bg-[#8ece28] text-[#0B0D12] text-xs sm:text-sm font-black transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#A3E635]/20 cursor-pointer"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Litsenziya berilmoqda...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Litsenziyani Biriktirish</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
