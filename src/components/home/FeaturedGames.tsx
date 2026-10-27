import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getGames } from '../../services/gamesService';
import type { Game } from '../../types/game';
import { GameCard } from '../game/GameCard';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, Loader2, RotateCcw } from 'lucide-react';


export const FeaturedGames: React.FC = () => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'ready' | 'inProgress' | 'upcoming' | null>(null);

  useEffect(() => {
    getGames()
      .then((data) => {
        setGames(data);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Compute live subtitle status statistics
  const stats = useMemo(() => {
    let ready = 0;
    let inProgress = 0;
    let upcoming = 0;

    games.forEach((game) => {
      const s = (game.subtitleStatus || '').trim().toLowerCase();
      if (s === 'tayyor') {
        ready++;
      } else if (s === 'jarayonda' || s === 'ishlab chiqilmoqda') {
        inProgress++;
      } else {
        upcoming++;
      }
    });

    return { ready, inProgress, upcoming, total: games.length };
  }, [games]);

  const filteredGames = useMemo(() => {
    if (!activeFilter) return games;
    return games.filter((game) => {
      const s = (game.subtitleStatus || '').trim().toLowerCase();
      if (activeFilter === 'ready') return s === 'tayyor';
      if (activeFilter === 'inProgress') return s === 'jarayonda' || s === 'ishlab chiqilmoqda';
      if (activeFilter === 'upcoming') return s !== 'tayyor' && s !== 'jarayonda' && s !== 'ishlab chiqilmoqda';
      return true;
    });
  }, [games, activeFilter]);

  const checkScroll = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setCanScrollLeft(scrollLeft > 15);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 15);
    }
  };

  useEffect(() => {
    const el = sliderRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
      checkScroll();
      return () => el.removeEventListener('scroll', checkScroll);
    }
  }, [filteredGames]);

  // Auto-scroll games slider every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (sliderRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 20) {
          sliderRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          sliderRef.current.scrollBy({ left: 380, behavior: 'smooth' });
        }
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [filteredGames]);

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const { clientWidth } = sliderRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth * 0.75 : clientWidth * 0.75;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-16 bg-[#0B0D12] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Slider Navigation Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-4 border-b border-[#2A3245]/60">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#A3E635] uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>O‘yinlar to‘plami</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              O‘zbekcha subtitr bilan o‘yna
            </h2>
            <p className="text-sm text-[#9CA3AF] mt-1 max-w-xl">
              Tayyorlangan va ishlab chiqilayotgan barcha o‘yinlar. Slayder orqali o‘zingizga ma‘qul o‘yinni tanlang.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* Live Subtitle Statistics */}
            <div className="flex items-center gap-1.5 sm:gap-2 p-1 rounded-2xl bg-[#141821] border border-[#2A3245]">
              {/* Tayyor Stat Pill */}
              <button
                onClick={() => setActiveFilter(activeFilter === 'ready' ? null : 'ready')}
                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeFilter === 'ready'
                    ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/25 ring-2 ring-emerald-400/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
                title="Tayyor subtitrli o‘yinlar (Filtrlash uchun bosing)"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <span>Tayyor</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    activeFilter === 'ready'
                      ? 'bg-black/25 text-white'
                      : 'bg-emerald-500/15 text-emerald-400'
                  }`}
                >
                  {stats.ready} ta
                </span>
              </button>

              {/* Jarayonda Stat Pill */}
              <button
                onClick={() => setActiveFilter(activeFilter === 'inProgress' ? null : 'inProgress')}
                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeFilter === 'inProgress'
                    ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/25 ring-2 ring-sky-400/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
                title="Jarayondagi subtitrli o‘yinlar (Filtrlash uchun bosing)"
              >
                <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0 animate-pulse" />
                <span>Jarayonda</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    activeFilter === 'inProgress'
                      ? 'bg-black/25 text-white'
                      : 'bg-sky-500/15 text-sky-400'
                  }`}
                >
                  {stats.inProgress} ta
                </span>
              </button>

              {/* Tez kunda Stat Pill */}
              <button
                onClick={() => setActiveFilter(activeFilter === 'upcoming' ? null : 'upcoming')}
                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeFilter === 'upcoming'
                    ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/25 ring-2 ring-amber-400/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
                title="Tez kunda chiqadigan subtitrli o‘yinlar (Filtrlash uchun bosing)"
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                <span>Tez kunda</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    activeFilter === 'upcoming'
                      ? 'bg-black/25 text-white'
                      : 'bg-amber-500/15 text-amber-400'
                  }`}
                >
                  {stats.upcoming} ta
                </span>
              </button>

              {/* Reset to All if filtered */}
              {activeFilter && (
                <button
                  onClick={() => setActiveFilter(null)}
                  className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                  title="Barcha o‘yinlarni ko‘rsatish"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span className="hidden sm:inline">Barchasi</span>
                </button>
              )}
            </div>

            {/* Slider Arrow Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                aria-label="Oldingi o‘yinlar"
                className={`p-2.5 rounded-xl border transition-all ${
                  canScrollLeft
                    ? 'bg-[#141821] border-[#2A3245] text-white hover:border-[#A3E635] hover:bg-[#1A1F2A]'
                    : 'bg-[#141821]/40 border-[#2A3245]/40 text-gray-600 cursor-not-allowed'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                aria-label="Keyingi o‘yinlar"
                className={`p-2.5 rounded-xl border transition-all ${
                  canScrollRight
                    ? 'bg-[#141821] border-[#2A3245] text-white hover:border-[#A3E635] hover:bg-[#1A1F2A]'
                    : 'bg-[#141821]/40 border-[#2A3245]/40 text-gray-600 cursor-not-allowed'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <Link
              to="/games"
              className="hidden lg:inline-flex items-center gap-1.5 text-xs font-semibold text-[#A3E635] hover:text-[#84CC16] ml-2 group"
            >
              <span>Katalog</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Horizontal Slider Track */}
        <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-[#A3E635] animate-spin" />
              <p className="text-xs text-gray-400">O‘yinlar yuklanmoqda...</p>
            </div>
          ) : (
            <div
              ref={sliderRef}
              className="flex gap-6 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth scrollbar-none"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {filteredGames.map((game, idx) => (
                <div
                  key={game.id}
                  className="w-[85vw] sm:w-[360px] md:w-[380px] lg:w-[380px] shrink-0 snap-start"
                >
                  <GameCard game={game} priority={idx < 2} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Note clarifying separation between game license and subtitle file */}
        <div className="mt-8 p-4 rounded-xl bg-[#141821] border border-[#2A3245] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-400">
          <p>
            <strong className="text-gray-200">Muhim eslatma:</strong> Subtitr fayllari mustaqil mod bo‘lib, SubGame platformasida bepul taqdim etiladi. O‘yinning o‘zi esa rasmiy litsenziyalangan do‘konlardan (Steam, GOG, Epic Games) xarid qilinishi shart.
          </p>
          <Link
            to="/launcher"
            className="shrink-0 text-[#A3E635] hover:underline font-semibold"
          >
            Launcherni yuklab olish →
          </Link>
        </div>
      </div>
    </section>
  );
};
