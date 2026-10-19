import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SITE_CONFIG } from '../../config/site';
import { useFavorites } from '../../context/FavoritesContext';
import {
  Gamepad2,
  Heart,
  Send,
  Menu,
  X,
  Sparkles,
  BookOpen,
  Info,
  Layers,
  Home
} from 'lucide-react';
import { SuggestGameModal } from '../home/SuggestGameModal';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
  const { favoritesCount } = useFavorites();
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

  const navLinks = [
    { name: 'Bosh sahifa', path: '/', icon: Home },
    { name: 'O‘yinlar', path: '/games', icon: Layers },
    { name: 'Qo‘llanma', path: '/guide', icon: BookOpen },
    { name: 'Biz haqimizda', path: '/about', icon: Info },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#0B0D12]/80 backdrop-blur-md border-b border-[#2A3245]/80 py-3 shadow-xl'
            : 'bg-gradient-to-b from-[#0B0D12]/70 via-[#0B0D12]/20 to-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1A1F2A] to-[#141821] border border-[#A3E635]/40 flex items-center justify-center text-[#A3E635] shadow-accent-glow group-hover:scale-105 transition-transform">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-[#A3E635] transition-colors">
                    Sub<span className="text-[#A3E635]">Game</span>
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#A3E635]/15 text-[#A3E635] border border-[#A3E635]/30">
                    AI Sub
                  </span>
                </div>
                <span className="text-[11px] text-gray-400 hidden sm:block">
                  O‘zbekcha o‘yinlar
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 bg-[#141821]/80 px-3 py-1.5 rounded-full border border-[#2A3245]/60 backdrop-blur-md shrink-0">
              {navLinks.map((link) => {
                const active = isActive(link.path);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all ${
                      active
                        ? 'bg-[#A3E635] text-[#0B0D12] font-semibold shadow-accent-glow'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Suggest Game Button */}
              <button
                onClick={() => setIsSuggestModalOpen(true)}
                title="Yangi o‘yin taklif qilish"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#141821] hover:bg-[#1A1F2A] text-gray-200 border border-[#2A3245] hover:border-[#A3E635]/50 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#A3E635]" />
                <span>Subtitr taklif qilish</span>
              </button>

              {/* Favorites Link */}
              <Link
                to="/favorites"
                title="Sevimlilar"
                className="relative p-2 rounded-xl bg-[#141821] border border-[#2A3245] text-gray-300 hover:text-white hover:border-gray-500 transition-colors"
              >
                <Heart className="w-4 h-4" />
                {favoritesCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {favoritesCount}
                  </span>
                )}
              </Link>

              {/* Telegram Channel Button */}
              <a
                href={SITE_CONFIG.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30 hover:bg-sky-500/25 transition-all text-xs font-semibold cursor-pointer shadow-sm hover:shadow-sky-500/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Telegram</span>
              </a>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Menyu"
                className="p-2 rounded-xl lg:hidden bg-[#141821] border border-[#2A3245] text-gray-300 hover:text-white"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-[#0B0D12]/98 border-b border-[#2A3245] px-4 pt-3 pb-6 animate-in slide-in-from-top-4 duration-200">
            <nav className="flex flex-col space-y-1.5">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      active
                        ? 'bg-[#A3E635] text-[#0B0D12] font-semibold'
                        : 'text-gray-300 hover:bg-[#141821]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}

              <Link
                to="/favorites"
                className="flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:bg-[#141821]"
              >
                <div className="flex items-center gap-3">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span>Sevimlilar ro‘yxati</span>
                </div>
                {favoritesCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-xs font-bold">
                    {favoritesCount}
                  </span>
                )}
              </Link>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsSuggestModalOpen(true);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-[#A3E635] bg-[#A3E635]/10 hover:bg-[#A3E635]/20 mt-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>O‘zbekcha subtitr taklif qilish</span>
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Suggest Modal */}
      <SuggestGameModal
        isOpen={isSuggestModalOpen}
        onClose={() => setIsSuggestModalOpen(false)}
      />
    </>
  );
};
