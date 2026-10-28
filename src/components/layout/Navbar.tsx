import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SITE_CONFIG } from '../../config/site';
import { useFavorites } from '../../context/FavoritesContext';
import { useAuth } from '../../context/AuthContext';
import {
  Heart,
  Menu,
  X,
  Info,
  Layers,
  Home,
  Monitor,
  Shield,
  User,
  LogOut,
  Laptop,
  HeartHandshake
} from 'lucide-react';
import { TelegramLogo } from '../common/BrandLogos';
// Lazy-load modal to avoid bundling with Navbar
const SuggestGameModal = React.lazy(() => import('../home/SuggestGameModal').then((m) => ({ default: m.SuggestGameModal })));
import { UserMenu } from './UserMenu';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
  const { favoritesCount } = useFavorites();
  const { user, isAdmin, licenses, signInWithGoogle, signOut } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on page transition
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { name: 'Bosh sahifa', path: '/', icon: Home },
    { name: 'O‘yinlar', path: '/games', icon: Layers },
    { name: 'Launcher', path: '/launcher', icon: Monitor },
    { name: 'Biz haqimizda', path: '/about', icon: Info },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isMobileMenuOpen
            ? 'bg-[#0B0D12] border-b border-[#2A3245] py-3.5 shadow-2xl'
            : isScrolled
            ? 'bg-[#0B0D12]/80 backdrop-blur-md border-b border-[#2A3245]/80 py-3 shadow-xl'
            : 'bg-gradient-to-b from-[#0B0D12]/70 via-[#0B0D12]/20 to-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group shrink-0">
              <img
                src="/images/logo_doppi.png"
                alt="SubGame Logo"
                className="w-10 h-10 object-contain drop-shadow-[0_0_12px_rgba(163,230,53,0.35)] group-hover:scale-110 transition-transform duration-300"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-[#A3E635] transition-colors">
                    Sub<span className="text-[#A3E635]">Game</span>
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#A3E635]/15 text-[#A3E635] border border-[#A3E635]/30">
                    UZB SUB
                  </span>
                </div>
                <span className="text-[11px] text-gray-400 hidden sm:block">
                  O‘zbekcha o‘yinlar
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 bg-[#141821]/80 px-2.5 py-1 rounded-full border border-[#2A3245]/60 backdrop-blur-md shrink-0">
              {navLinks.map((link) => {
                const active = isActive(link.path);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      active
                        ? 'bg-[#A3E635] text-[#0B0D12] font-semibold shadow-accent-glow'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Desktop Admin Panel Link */}
              {isAdmin && (
                <Link
                  to="/admin"
                  title="Admin Panel"
                  className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#A3E635]/15 text-[#A3E635] border border-[#A3E635]/35 hover:bg-[#A3E635]/25 transition-all shadow-sm"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin Panel</span>
                </Link>
              )}

              {/* Desktop Google Auth User Menu */}
              <div className="hidden lg:block">
                <UserMenu />
              </div>

              {/* Donate Button (taps.uz/subgame) */}
              <a
                href={SITE_CONFIG.donationUrl || 'https://taps.uz/subgame'}
                target="_blank"
                rel="noopener noreferrer"
                title="Loyihani qo‘llab-quvvatlash (Donat)"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/15 text-amber-300 border border-amber-500/35 hover:border-amber-400 hover:text-white hover:bg-amber-500/25 transition-all shadow-sm shadow-amber-500/10 hover:scale-105 cursor-pointer"
              >
                <HeartHandshake className="w-3.5 h-3.5 text-amber-400" />
                <span>Donat</span>
              </a>

              {/* Favorites Link (Desktop only) */}
              <Link
                to="/favorites"
                title="Sevimlilar ro‘yxati"
                className="hidden sm:inline-flex relative p-2 rounded-xl bg-[#141821] border border-[#2A3245] text-gray-300 hover:text-white hover:border-gray-500 transition-colors"
              >
                <Heart className="w-4 h-4" />
                {favoritesCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {favoritesCount}
                  </span>
                )}
              </Link>

              {/* Telegram Channel Icon Button */}
              <a
                href={SITE_CONFIG.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Telegram kanalimiz"
                className="hidden sm:inline-flex items-center justify-center p-2 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30 hover:bg-sky-500/25 transition-all text-xs font-semibold cursor-pointer shadow-sm hover:shadow-sky-500/20"
              >
                <TelegramLogo className="w-4 h-4" />
              </a>

              {/* Mobile menu toggle button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Menyu"
                className="p-2 rounded-xl lg:hidden bg-[#141821] border border-[#2A3245] text-gray-200 hover:text-white cursor-pointer"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Fullscreen Menu (Drawer) */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-x-0 top-[65px] bottom-0 bg-[#0B0D12] z-50 px-4 py-5 overflow-y-auto flex flex-col justify-between border-t border-[#2A3245] animate-in fade-in duration-200">
            <div className="space-y-4">
              {/* Mobile User Profile / Sign-in Card */}
              {!user ? (
                <div className="p-4 rounded-2xl bg-[#141821] border border-[#2A3245] space-y-3 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400">
                      <User className="w-5 h-5 text-gray-300" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-white block">SubGame Akkaunt</span>
                      <span className="text-[11px] text-gray-400 block">Litsenziyalarni boshqarish uchun</span>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        await signInWithGoogle();
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-white hover:bg-gray-100 text-[#0B0D12] font-black text-sm shadow-md transition-all cursor-pointer active:scale-[0.98]"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Google orqali kirish</span>
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#141821] border border-[#2A3245] space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.displayName || 'User'}
                          className="w-10 h-10 rounded-full border border-[#A3E635] object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#A3E635] text-[#0B0D12] font-black text-sm flex items-center justify-center shrink-0">
                          {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-white truncate">
                          {user.displayName || 'Foydalanuvchi'}
                        </h4>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-[#A3E635]/15 text-[#A3E635] border border-[#A3E635]/30 text-[11px] font-mono font-bold shrink-0">
                      {Object.keys(licenses).length} ta o‘yin
                    </span>
                  </div>

                  {/* Licenses list in mobile menu */}
                  {Object.keys(licenses).length > 0 && (
                    <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                      {Object.values(licenses).map((lic) => (
                        <Link
                          key={lic.id}
                          to={`/games/${lic.gameSlug}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center justify-between p-2 rounded-xl bg-[#0B0D12] border border-[#2A3245] text-xs hover:border-[#A3E635]/40 transition-colors"
                        >
                          <span className="font-semibold text-white truncate">{lic.gameTitle}</span>
                          <span className="text-[10px] text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-500/15">
                            Faol
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Actions: Connect Launcher + Sign out */}
                  <div className="flex items-center gap-2 pt-1 border-t border-[#2A3245]/60">
                    <Link
                      to="/connect"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#A3E635]/15 hover:bg-[#A3E635]/25 text-[#A3E635] border border-[#A3E635]/30 text-xs font-bold transition-all"
                    >
                      <Laptop className="w-3.5 h-3.5" />
                      <span>Launcherni ulash</span>
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-all cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Chiqish</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Navigation Links inside Burger Menu */}
              <nav className="flex flex-col space-y-2">
                {/* Admin Panel Link inside Burger Menu (Only visible to admin) */}
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between px-4 py-3.5 rounded-xl text-base font-bold text-[#A3E635] bg-[#A3E635]/15 border border-[#A3E635]/40 hover:bg-[#A3E635]/25 transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-3.5">
                      <Shield className="w-5 h-5 text-[#A3E635]" />
                      <span>Admin Panel</span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#A3E635] text-[#0B0D12]">
                      Boshqaruv
                    </span>
                  </Link>
                )}

                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.path);
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                        active
                          ? 'bg-[#A3E635] text-[#0B0D12] shadow-accent-glow'
                          : 'text-gray-200 hover:text-white bg-[#141821] border border-[#2A3245]'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}

                <Link
                  to="/favorites"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-3 rounded-xl text-base font-semibold text-gray-200 bg-[#141821] border border-[#2A3245]"
                >
                  <div className="flex items-center gap-3.5">
                    <Heart className="w-5 h-5 text-rose-500" />
                    <span>Sevimlilar ro‘yxati</span>
                  </div>
                  {favoritesCount > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-xs font-bold">
                      {favoritesCount}
                    </span>
                  )}
                </Link>

                <a
                  href={SITE_CONFIG.telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-base font-semibold text-sky-400 bg-sky-500/10 border border-sky-500/25"
                >
                  <TelegramLogo className="w-5 h-5 shrink-0" />
                  <span>Telegram kanalimiz</span>
                </a>
              </nav>
            </div>

            <div className="pt-4 pb-2">
              <a
                href={SITE_CONFIG.donationUrl || 'https://taps.uz/subgame'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-bold text-amber-300 bg-amber-500/15 border border-amber-500/35 hover:bg-amber-500/25 transition-all cursor-pointer shadow-md"
              >
                <HeartHandshake className="w-4 h-4 text-amber-400" />
                <span>Loyihani qo‘llab-quvvatlash (Donat)</span>
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Suggest Modal */}
      {isSuggestModalOpen && (
        <React.Suspense fallback={null}>
          <SuggestGameModal
            isOpen={isSuggestModalOpen}
            onClose={() => setIsSuggestModalOpen(false)}
          />
        </React.Suspense>
      )}
    </>
  );
};
