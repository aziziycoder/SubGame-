import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getGames } from '../../services/gamesService';
import type { Game } from '../../types/game';
import {
  ArrowRight,
  Sparkles,
  Loader2,
  CheckCircle2,
  Clock,
  Flame,
  Gamepad2,
} from 'lucide-react';

export const FeaturedGames: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

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
        // 'tez kunda', 'rejada', 'tekshirilmoqda'
        upcoming++;
      }
    });

    return { ready, inProgress, upcoming, total: games.length };
  }, [games]);

  return (
    <section className="py-14 bg-[#0B0D12] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#A3E635] uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Platforma ko‘rsatkichlari</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              O‘zbekcha subtitrlar statistikasi
            </h2>
            <p className="text-sm text-[#9CA3AF] mt-1 max-w-xl">
              Platformamizda tayyorlangan, tarjima qilinayotgan va rejalashtirilgan barcha o‘yinlar.
            </p>
          </div>

          <Link
            to="/games"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#A3E635] text-[#0B0D12] text-xs sm:text-sm font-bold hover:bg-[#84CC16] transition-all shadow-accent-glow self-start sm:self-auto shrink-0 group"
          >
            <span>Barcha o‘yinlar katalogi</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Minimalist Aesthetic Statistics Banner Card (Exact style requested) */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#10131A] via-[#141822] to-[#181D28] border border-[#2A3245] p-8 sm:p-12 shadow-2xl">
          {/* Decorative Geometric Mandala Rosette Watermark on the Right */}
          <div className="absolute -right-14 -top-14 -bottom-14 w-64 sm:w-80 md:w-96 pointer-events-none opacity-[0.14] text-gray-300 flex items-center justify-center overflow-hidden">
            <svg
              viewBox="0 0 200 200"
              className="w-full h-full fill-none stroke-current"
              strokeWidth="1.2"
            >
              <circle cx="100" cy="100" r="92" />
              <circle cx="100" cy="100" r="78" />
              <circle cx="100" cy="100" r="62" />
              <circle cx="100" cy="100" r="46" />
              <circle cx="100" cy="100" r="30" />
              <circle cx="100" cy="100" r="15" />
              {[
                0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315,
                337.5,
              ].map((angle) => (
                <g key={angle} transform={`rotate(${angle} 100 100)`}>
                  <path d="M 100 8 L 108 38 L 100 58 L 92 38 Z" />
                  <path d="M 100 22 L 114 54 L 100 74 L 86 54 Z" />
                  <path d="M 95 8 L 100 0 L 105 8" />
                </g>
              ))}
            </svg>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 relative z-10">
              <Loader2 className="w-8 h-8 text-[#A3E635] animate-spin" />
              <p className="text-xs text-gray-400">Statistika yuklanmoqda...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 relative z-10">
              {/* 1. Tayyor subtitrlar */}
              <Link
                to="/games?status=Tayyor"
                className="flex flex-col items-center text-center group cursor-pointer transition-all duration-300 hover:-translate-y-1"
                title="Tayyor subtitrli o‘yinlarni ko‘rish"
              >
                <div className="mb-3 text-white group-hover:text-[#A3E635] transition-colors">
                  <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8 stroke-[1.75]" />
                </div>
                <span className="text-xs sm:text-sm text-gray-400 group-hover:text-gray-200 transition-colors font-medium mb-3">
                  Tayyor
                </span>
                <span className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#E8D7B8] font-light tracking-wider group-hover:text-[#A3E635] transition-colors">
                  {stats.ready}
                </span>
              </Link>

              {/* 2. Jarayonda */}
              <Link
                to="/games?status=Jarayonda"
                className="flex flex-col items-center text-center group cursor-pointer transition-all duration-300 hover:-translate-y-1"
                title="Jarayondagi subtitrli o‘yinlarni ko‘rish"
              >
                <div className="mb-3 text-white group-hover:text-sky-400 transition-colors">
                  <Clock className="w-7 h-7 sm:w-8 sm:h-8 stroke-[1.75]" />
                </div>
                <span className="text-xs sm:text-sm text-gray-400 group-hover:text-gray-200 transition-colors font-medium mb-3">
                  Jarayonda
                </span>
                <span className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#E8D7B8] font-light tracking-wider group-hover:text-sky-400 transition-colors">
                  {stats.inProgress}
                </span>
              </Link>

              {/* 3. Tez kunda */}
              <Link
                to="/games?status=Tez+kunda"
                className="flex flex-col items-center text-center group cursor-pointer transition-all duration-300 hover:-translate-y-1"
                title="Tez kunda chiqadigan subtitrli o‘yinlarni ko‘rish"
              >
                <div className="mb-3 text-white group-hover:text-amber-400 transition-colors">
                  <Flame className="w-7 h-7 sm:w-8 sm:h-8 stroke-[1.75]" />
                </div>
                <span className="text-xs sm:text-sm text-gray-400 group-hover:text-gray-200 transition-colors font-medium mb-3">
                  Tez kunda
                </span>
                <span className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#E8D7B8] font-light tracking-wider group-hover:text-amber-400 transition-colors">
                  {stats.upcoming}
                </span>
              </Link>

              {/* 4. Jami o‘yinlar */}
              <Link
                to="/games"
                className="flex flex-col items-center text-center group cursor-pointer transition-all duration-300 hover:-translate-y-1"
                title="Barcha o‘yinlar katalogini ochish"
              >
                <div className="mb-3 text-white group-hover:text-emerald-400 transition-colors">
                  <Gamepad2 className="w-7 h-7 sm:w-8 sm:h-8 stroke-[1.75]" />
                </div>
                <span className="text-xs sm:text-sm text-gray-400 group-hover:text-gray-200 transition-colors font-medium mb-3">
                  Jami o‘yinlar
                </span>
                <span className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#E8D7B8] font-light tracking-wider group-hover:text-emerald-400 transition-colors">
                  {stats.total}
                </span>
              </Link>
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
