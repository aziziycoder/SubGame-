import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LogOut,
  ShieldCheck,
  Laptop,
  CheckCircle2,
  Clock,
  X,
  ChevronDown
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const UserMenu: React.FC = () => {
  const { user, loading, licenses, signInWithGoogle, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSigningIn(false);
    }
  };

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-[#1A1F2A] animate-pulse" />
    );
  }

  if (!user) {
    return (
      <button
        onClick={handleSignIn}
        disabled={isSigningIn}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all shadow-sm cursor-pointer shrink-0"
      >
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span className="hidden xl:inline">Google bilan kirish</span>
        <span className="xl:hidden">Kirish</span>
      </button>
    );
  }

  const licenseList = Object.values(licenses);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-full bg-[#141821] hover:bg-[#1A1F2A] border border-[#2A3245] hover:border-[#A3E635]/60 transition-all text-left cursor-pointer"
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || 'User'}
            className="w-7 h-7 rounded-full object-cover border border-[#A3E635]"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-[#A3E635] text-[#0B0D12] font-bold text-xs flex items-center justify-center">
            {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
          </div>
        )}
        <div className="hidden sm:flex flex-col text-xs leading-tight pr-1">
          <span className="font-semibold text-white max-w-[100px] truncate">
            {user.displayName || user.email?.split('@')[0]}
          </span>
          <span className="text-[10px] text-[#A3E635]">
            {licenseList.length} ta o‘yin
          </span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
      </button>

      {/* Dropdown Modal / Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#141821] border border-[#2A3245] shadow-2xl z-50 p-4 space-y-4 animate-in fade-in zoom-in-95">
          {/* User Info Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#2A3245]">
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-10 h-10 rounded-full border border-[#A3E635]"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#A3E635] text-[#0B0D12] font-extrabold text-sm flex items-center justify-center">
                  {user.displayName?.charAt(0) || 'U'}
                </div>
              )}
              <div className="overflow-hidden">
                <h4 className="text-sm font-bold text-white truncate">
                  {user.displayName || 'Foydalanuvchi'}
                </h4>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Licenses Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#A3E635]" />
                Mening Litsenziyalarim
              </span>
              <span className="text-[11px] font-mono text-[#A3E635] bg-[#A3E635]/15 px-2 py-0.5 rounded">
                {licenseList.length} ta
              </span>
            </div>

            {licenseList.length === 0 ? (
              <div className="p-4 rounded-xl bg-[#0B0D12] border border-[#2A3245] text-center text-xs text-gray-400">
                Sizda hali litsenziyalar yo‘q. Katalogdan o‘yin tanlab, bepul faollashtiring!
              </div>
            ) : (
              <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                {licenseList.map((lic) => (
                  <div
                    key={lic.id}
                    className="p-2.5 rounded-xl bg-[#0B0D12] border border-[#2A3245] space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <Link
                        to={`/games/${lic.gameSlug}`}
                        onClick={() => setIsOpen(false)}
                        className="text-xs font-bold text-white hover:text-[#A3E635] transition-colors truncate max-w-[200px]"
                      >
                        {lic.gameTitle}
                      </Link>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                        Faol
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1 border-t border-[#1A1F2A]">
                      <div className="flex items-center gap-1">
                        <Laptop className="w-3 h-3 text-[#A3E635]" />
                        <span>
                          {lic.hwid
                            ? `Qurilma: ${lic.boundDeviceName || 'Bog‘langan'}`
                            : 'Qurilma: Kutilmoqda'}
                        </span>
                      </div>
                      {lic.hwid ? (
                        <span className="text-emerald-400 flex items-center gap-0.5 text-[10px]">
                          <CheckCircle2 className="w-2.5 h-2.5" /> 1-qurilma faol
                        </span>
                      ) : (
                        <span className="text-amber-400 flex items-center gap-0.5 text-[10px]">
                          <Clock className="w-2.5 h-2.5" /> Launcherni kuting
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Launcher Info Card */}
          <div className="p-3 rounded-xl bg-gradient-to-r from-[#A3E635]/10 to-transparent border border-[#A3E635]/20 text-[11px] text-gray-300 space-y-1">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <Laptop className="w-3.5 h-3.5 text-[#A3E635]" />
              1 Akkaunt = 1 Qurilma
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              SubGame Launcher orqali birinchi marta o‘yinni ochganingizda, o‘yin avtomatik sizning kompyuteringizga qulflanadi.
            </p>
          </div>

          {/* Connect Launcher Quick Action */}
          <Link
            to="/connect"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#A3E635]/15 hover:bg-[#A3E635]/25 text-[#A3E635] border border-[#A3E635]/30 text-xs font-bold transition-all"
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Launcherni ulash</span>
          </Link>

          {/* Logout Button */}
          <button
            onClick={() => {
              signOut();
              setIsOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Hisobdan chiqish</span>
          </button>
        </div>
      )}
    </div>
  );
};
