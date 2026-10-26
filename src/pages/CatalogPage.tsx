import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { GENRES, SUBTITLE_STATUSES } from '../data/games';
import { getGames } from '../services/gamesService';
import type { Game } from '../types/game';
import { GameCard } from '../components/game/GameCard';
import { Search, Filter, RotateCcw, Layers, Loader2 } from 'lucide-react';

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('q') || '';

  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedGenre, setSelectedGenre] = useState<string>('Barchasi');
  const [selectedStatus, setSelectedStatus] = useState<string>('Barchasi');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');

  useEffect(() => {
    getGames()
      .then((data) => {
        setGames(data);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Keep query params synced if passed in URL
  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null && q !== searchQuery) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  const filteredGames = useMemo(() => {
    return (games || []).filter((game) => {
      if (!game) return false;

      const title = (game.title || '').toLowerCase();
      const developer = (game.developer || '').toLowerCase();
      const genres = Array.isArray(game.genres) ? game.genres : [];
      const subtitleStatus = game.subtitleStatus || '';
      const query = searchQuery.trim().toLowerCase();

      // Search matching title or developer or genres
      const matchesSearch =
        query === '' ||
        title.includes(query) ||
        developer.includes(query) ||
        genres.some((g) => (g || '').toLowerCase().includes(query));

      // Genre filter
      const matchesGenre =
        selectedGenre === 'Barchasi' || genres.includes(selectedGenre);

      // Status filter
      const matchesStatus =
        selectedStatus === 'Barchasi' || subtitleStatus === selectedStatus;

      return matchesSearch && matchesGenre && matchesStatus;
    }).sort((a, b) => {
      const yearA = Number(a?.releaseYear) || 0;
      const yearB = Number(b?.releaseYear) || 0;
      if (sortBy === 'newest') return yearB - yearA;
      if (sortBy === 'oldest') return yearA - yearB;
      if (sortBy === 'title') return (a?.title || '').localeCompare(b?.title || '');
      return 0;
    });
  }, [games, searchQuery, selectedGenre, selectedStatus, sortBy]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedGenre('Barchasi');
    setSelectedStatus('Barchasi');
    setSortBy('newest');
    setSearchParams({});
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedGenre !== 'Barchasi' ||
    selectedStatus !== 'Barchasi' ||
    sortBy !== 'newest';

  return (
    <div className="pt-28 pb-20 min-h-screen bg-[#0B0D12]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A3E635]/10 text-[#A3E635] text-xs font-bold mb-3 border border-[#A3E635]/20">
            <Layers className="w-3.5 h-3.5" />
            <span>Katalog</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Barcha o‘zbekcha subtitrli o‘yinlar
          </h1>
          <p className="text-sm sm:text-base text-gray-400 mt-2 max-w-2xl">
            Loyiha doirasida tayyorlangan, tahrirlanayotgan va kelgusida rejalashtirilgan barcha videoo‘yinlar ro‘yxati.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-[#141821] border border-[#2A3245] rounded-2xl p-5 mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Search Input (5 cols) */}
            <div className="md:col-span-5 relative">
              <input
                type="text"
                placeholder="O‘yin nomi, janri yoki studiyani qidiring..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value) {
                    setSearchParams({ q: e.target.value });
                  } else {
                    setSearchParams({});
                  }
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B0D12] border border-[#2A3245] text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#A3E635] transition-colors"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            </div>

            {/* Subtitle Status Filter (3 cols) */}
            <div className="md:col-span-3">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D12] border border-[#2A3245] text-white text-sm focus:outline-none focus:border-[#A3E635] transition-colors"
              >
                {SUBTITLE_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown (3 cols) */}
            <div className="md:col-span-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D12] border border-[#2A3245] text-white text-sm focus:outline-none focus:border-[#A3E635] transition-colors"
              >
                <option value="newest">Yil bo‘yicha: Eng yangilar</option>
                <option value="oldest">Yil bo‘yicha: Avvalgilari</option>
                <option value="title">Nom bo‘yicha: A-Z</option>
              </select>
            </div>

            {/* Reset Button (1 col) */}
            <div className="md:col-span-1 flex justify-end">
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  title="Filtrlarni tozalash"
                  className="p-2.5 rounded-xl bg-[#0B0D12] border border-[#2A3245] text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Genre Quick Filter Chips */}
          <div className="pt-2 border-t border-[#2A3245]/60 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Janr:
            </span>
            {GENRES.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`text-xs px-3 py-1.5 rounded-lg shrink-0 transition-all ${
                  selectedGenre === genre
                    ? 'bg-[#A3E635] text-[#0B0D12] font-bold shadow-accent-glow'
                    : 'bg-[#0B0D12] text-gray-300 hover:text-white border border-[#2A3245]'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between text-xs text-gray-400 mb-6">
          <span>
            Jami: <strong className="text-white">{filteredGames.length} ta o‘yin</strong> topildi
          </span>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-[#A3E635] hover:underline"
            >
              Barcha filtrlarni tozalash
            </button>
          )}
        </div>

        {/* Games Grid or Empty State */}
        {loading ? (
          <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#A3E635] animate-spin" />
            <p className="text-sm text-gray-400">O‘yinlar yuklanmoqda...</p>
          </div>
        ) : filteredGames.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-[#141821] rounded-2xl border border-[#2A3245] p-8 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-[#1A1F2A] border border-[#2A3245] flex items-center justify-center text-gray-400 mx-auto mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Hech qanday o‘yin topilmadi
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              Kiritilgan qidiruv yoki tanlangan filtrlar bo‘yicha hozircha subtitr mavjud emas. Filtrlarni o‘zgartirib ko‘ring yoki yangi o‘yin taklif qiling.
            </p>
            <button
              onClick={resetFilters}
              className="px-5 py-2.5 rounded-xl bg-[#A3E635] text-[#0B0D12] font-semibold text-sm hover:bg-[#84CC16] transition-colors"
            >
              Filtrlarni tozalash
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
