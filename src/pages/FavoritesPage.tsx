import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';
import { getGames } from '../services/gamesService';
import type { Game } from '../types/game';
import { GameCard } from '../components/game/GameCard';
import { fetchGameLicenseCounts, type GameLicenseCountStats } from '../services/licensesService';
import { Heart, ArrowLeft, Layers } from 'lucide-react';

export const FavoritesPage: React.FC = () => {
  const { favoriteIds } = useFavorites();
  const [games, setGames] = useState<Game[]>([]);
  const [licenseStats, setLicenseStats] = useState<Record<string, GameLicenseCountStats>>({});

  useEffect(() => {
    getGames().then(setGames);
    fetchGameLicenseCounts().then(setLicenseStats).catch(() => {});
  }, []);

  const favoriteGames = games.filter((game) =>
    favoriteIds.includes(game.id)
  );

  return (
    <div className="pt-28 pb-20 min-h-screen bg-[#0B0D12] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-[#2A3245]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-bold mb-3 border border-rose-500/20">
              <Heart className="w-3.5 h-3.5 fill-rose-500" />
              <span>Saqlanganlar</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Sevimlilar ro‘yxati
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Siz o‘ynashni rejalashtirgan yoki yoqtirgan barcha o‘yinlar.
            </p>
          </div>

          <Link
            to="/games"
            className="inline-flex items-center gap-2 text-sm text-[#A3E635] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Katalogga qaytish</span>
          </Link>
        </div>

        {favoriteGames.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{favoriteGames.length} ta o‘yin saqlangan</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteGames.map((game) => {
                const claimCount = licenseStats[game.id]?.total || (game.slug ? licenseStats[game.slug]?.total : 0) || 0;
                return (
                  <GameCard
                    key={game.id}
                    game={game}
                    claimCount={claimCount}
                  />
                );
              })}
            </div>
          </div>
        ) : (
          <div className="py-20 text-center bg-[#141821] rounded-2xl border border-[#2A3245] p-8 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-[#1A1F2A] border border-[#2A3245] flex items-center justify-center text-rose-400 mx-auto mb-4">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Sevimlilar ro‘yxati hozircha bo‘sh
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              O‘yin kartalaridagi yurakcha belgisini bosib, o‘zingizga yoqqan o‘yinlarni bu yerga saqlashingiz mumkin.
            </p>
            <Link
              to="/games"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#A3E635] text-[#0B0D12] font-bold text-sm hover:bg-[#84CC16] transition-colors"
            >
              <Layers className="w-4 h-4" />
              <span>O‘yinlar katalogini ko‘rish</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
