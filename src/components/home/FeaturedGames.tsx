import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GAMES_DATA } from '../../data/games';
import { getGames } from '../../services/gamesService';
import type { Game } from '../../types/game';
import { GameCard } from '../game/GameCard';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

export const FeaturedGames: React.FC = () => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [games, setGames] = useState<Game[]>(GAMES_DATA);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [filterTab, setFilterTab] = useState<'all' | 'ready' | 'upcoming'>('all');

  useEffect(() => {
    getGames().then(setGames);
  }, []);

  const filteredGames = games.filter((game) => {
    if (filterTab === 'ready') return game.subtitleStatus === 'Tayyor';
    if (filterTab === 'upcoming') return game.subtitleStatus !== 'Tayyor';
    return true;
  });

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

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Tabs */}
            <div className="flex items-center bg-[#141821] p-1 rounded-xl border border-[#2A3245]">
              <button
                onClick={() => setFilterTab('all')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  filterTab === 'all'
                    ? 'bg-[#A3E635] text-[#0B0D12]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Barchasi ({games.length})
              </button>
              <button
                onClick={() => setFilterTab('ready')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  filterTab === 'ready'
                    ? 'bg-[#A3E635] text-[#0B0D12]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Tayyor
              </button>
              <button
                onClick={() => setFilterTab('upcoming')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  filterTab === 'upcoming'
                    ? 'bg-[#A3E635] text-[#0B0D12]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Kutilayotgan
              </button>
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
        </div>

        {/* Note clarifying separation between game license and subtitle file */}
        <div className="mt-8 p-4 rounded-xl bg-[#141821] border border-[#2A3245] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-400">
          <p>
            <strong className="text-gray-200">Muhim eslatma:</strong> Subtitr fayllari mustaqil mod bo‘lib, SubGame platformasida bepul taqdim etiladi. O‘yinning o‘zi esa rasmiy litsenziyalangan do‘konlardan (Steam, GOG, Epic Games) xarid qilinishi shart.
          </p>
          <Link
            to="/guide"
            className="shrink-0 text-[#A3E635] hover:underline font-semibold"
          >
            Qo‘llanmani o‘qish →
          </Link>
        </div>
      </div>
    </section>
  );
};
