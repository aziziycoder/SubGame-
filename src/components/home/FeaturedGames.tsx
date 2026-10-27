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

  // Compute live subtitle status statistics from database
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
    <section className="py-16 bg-[#0B0D12] relative overflow-hidden">
      {/* Subtle ambient light matching SubGame theme */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#A3E635]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A3E635]/10 text-[#A3E635] text-xs font-bold mb-3 border border-[#A3E635]/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Platforma ko‘rsatkichlari</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              O‘zbekcha subtitrlar statistikasi
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-2 max-w-2xl leading-relaxed">
              Platformamizda tayyorlangan, tarjima qilinayotgan va rejalashtirilgan barcha o‘yinlar haqida real vaqtdagi statistika.
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

        {/* Loading State */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 bg-[#141821] rounded-2xl border border-[#2A3245]">
            <Loader2 className="w-8 h-8 text-[#A3E635] animate-spin" />
            <p className="text-xs text-gray-400">Statistika yuklanmoqda...</p>
          </div>
        ) : (
          /* 4 Gaming Stats Cards in SubGame Visual Style */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* 1. Tayyor subtitrlar */}
            <Link
              to="/games?status=Tayyor"
              className="group relative bg-[#141821] rounded-2xl p-6 border border-[#2A3245] hover:border-[#A3E635]/60 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card-glow flex flex-col justify-between overflow-hidden"
            >
              {/* Corner ambient glow */}
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-[#A3E635]/10 rounded-full blur-2xl group-hover:bg-[#A3E635]/20 transition-all pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[#1A1F2A] border border-[#2A3245] flex items-center justify-center text-[#A3E635] group-hover:scale-110 group-hover:bg-[#A3E635] group-hover:text-[#0B0D12] transition-all duration-300 shadow-sm">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-mono text-[#A3E635] bg-[#A3E635]/10 px-2.5 py-1 rounded-full border border-[#A3E635]/20 font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#A3E635] animate-pulse" />
                    Tayyor
                  </span>
                </div>

                <div className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight group-hover:text-[#A3E635] transition-colors mb-2">
                  {stats.ready} <span className="text-base sm:text-lg font-sans font-semibold text-gray-400">ta</span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-[#A3E635] transition-colors mb-1.5">
                  Tayyor subtitrlar
                </h3>

                <p className="text-xs text-gray-400 leading-relaxed">
                  To‘liq tarjima qilingan va yuklab olishga tayyor o‘yinlar
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#2A3245]/60 flex items-center justify-between text-xs font-semibold text-[#A3E635] group-hover:text-[#BEF264] transition-colors">
                <span>O‘yinlarni ko‘rish</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* 2. Jarayonda */}
            <Link
              to="/games?status=Jarayonda"
              className="group relative bg-[#141821] rounded-2xl p-6 border border-[#2A3245] hover:border-sky-500/60 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card-glow flex flex-col justify-between overflow-hidden"
            >
              {/* Corner ambient glow */}
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-sky-500/10 rounded-full blur-2xl group-hover:bg-sky-500/20 transition-all pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[#1A1F2A] border border-[#2A3245] flex items-center justify-center text-sky-400 group-hover:scale-110 group-hover:bg-sky-500 group-hover:text-[#0B0D12] transition-all duration-300 shadow-sm">
                    <Clock className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-mono text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/20 font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                    Jarayonda
                  </span>
                </div>

                <div className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight group-hover:text-sky-400 transition-colors mb-2">
                  {stats.inProgress} <span className="text-base sm:text-lg font-sans font-semibold text-gray-400">ta</span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-sky-400 transition-colors mb-1.5">
                  Ishlab chiqilmoqda
                </h3>

                <p className="text-xs text-gray-400 leading-relaxed">
                  Hozirda tarjima va tahrir bosqichida bo‘lgan o‘yinlar
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#2A3245]/60 flex items-center justify-between text-xs font-semibold text-sky-400 group-hover:text-sky-300 transition-colors">
                <span>O‘yinlarni ko‘rish</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* 3. Tez kunda */}
            <Link
              to="/games?status=Tez+kunda"
              className="group relative bg-[#141821] rounded-2xl p-6 border border-[#2A3245] hover:border-amber-500/60 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card-glow flex flex-col justify-between overflow-hidden"
            >
              {/* Corner ambient glow */}
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[#1A1F2A] border border-[#2A3245] flex items-center justify-center text-amber-400 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-[#0B0D12] transition-all duration-300 shadow-sm">
                    <Flame className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    Tez kunda
                  </span>
                </div>

                <div className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight group-hover:text-amber-400 transition-colors mb-2">
                  {stats.upcoming} <span className="text-base sm:text-lg font-sans font-semibold text-gray-400">ta</span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors mb-1.5">
                  Rejadagi loyihalar
                </h3>

                <p className="text-xs text-gray-400 leading-relaxed">
                  Tez kunda tarjimasi boshlanishi kutilayotgan o‘yinlar
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#2A3245]/60 flex items-center justify-between text-xs font-semibold text-amber-400 group-hover:text-amber-300 transition-colors">
                <span>O‘yinlarni ko‘rish</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* 4. Jami o‘yinlar */}
            <Link
              to="/games"
              className="group relative bg-[#141821] rounded-2xl p-6 border border-[#2A3245] hover:border-[#A3E635]/60 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card-glow flex flex-col justify-between overflow-hidden"
            >
              {/* Corner ambient glow */}
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-[#A3E635]/10 rounded-full blur-2xl group-hover:bg-[#A3E635]/20 transition-all pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[#1A1F2A] border border-[#2A3245] flex items-center justify-center text-[#A3E635] group-hover:scale-110 group-hover:bg-[#A3E635] group-hover:text-[#0B0D12] transition-all duration-300 shadow-sm">
                    <Gamepad2 className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-mono text-gray-300 bg-[#0B0D12] px-2.5 py-1 rounded-full border border-[#2A3245] font-bold">
                    To‘liq katalog
                  </span>
                </div>

                <div className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight group-hover:text-[#A3E635] transition-colors mb-2">
                  {stats.total} <span className="text-base sm:text-lg font-sans font-semibold text-gray-400">ta</span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-[#A3E635] transition-colors mb-1.5">
                  Barcha o‘yinlar
                </h3>

                <p className="text-xs text-gray-400 leading-relaxed">
                  Loyiha doirasidagi barcha o‘zbekcha o‘yinlar ro‘yxati
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#2A3245]/60 flex items-center justify-between text-xs font-semibold text-[#A3E635] group-hover:text-[#BEF264] transition-colors">
                <span>Katalogga o‘tish</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        )}

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
