import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getGames } from '../services/gamesService';
import type { Game } from '../types/game';
import { GameCard } from '../components/game/GameCard';
import {
  Search,
  RotateCcw,
  Layers,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { getGamePriceInfo } from '../services/paymentService';

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('q') || '';
  const initialGenre = searchParams.get('genre') || 'Barchasi';
  const initialStatus = searchParams.get('status') || 'Barchasi';
  const initialPrice = (searchParams.get('price') as any) || 'all';

  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedGenre, setSelectedGenre] = useState<string>(initialGenre);
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatus);
  const [selectedPrice, setSelectedPrice] = useState<'all' | 'free' | 'paid'>(initialPrice);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');

  const genreScrollRef = useRef<HTMLDivElement>(null);

  // Load games dynamically from Firestore database
  useEffect(() => {
    let isMounted = true;
    getGames()
      .then((data) => {
        if (isMounted) {
          setGames(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Katalog o‘yinlarini yuklashda xatolik:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Sync with URL query parameters if present
  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null && q !== searchQuery) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  // 1. Dynamically extract all unique genres directly from Firestore database
  const dynamicGenres = useMemo(() => {
    const counts: Record<string, number> = {};
    (games || []).forEach((g) => {
      if (Array.isArray(g.genres)) {
        g.genres.forEach((genre) => {
          const trimmed = genre?.trim();
          if (trimmed) {
            counts[trimmed] = (counts[trimmed] || 0) + 1;
          }
        });
      }
    });

    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1]) // Sort by popularity (most games first)
      .map(([name, count]) => ({ name, count }));

    return [
      { name: 'Barchasi', count: (games || []).length },
      ...sorted,
    ];
  }, [games]);

  // 2. Dynamic counts for status
  const statusCounts = useMemo(() => {
    const counts = { all: (games || []).length, ready: 0, inProgress: 0, upcoming: 0 };
    (games || []).forEach((g) => {
      if (g.subtitleStatus === 'Tayyor') counts.ready++;
      else if (g.subtitleStatus === 'Jarayonda') counts.inProgress++;
      else if (g.subtitleStatus === 'Tez kunda') counts.upcoming++;
    });
    return counts;
  }, [games]);

  // 3. Dynamic counts for price
  const priceCounts = useMemo(() => {
    const counts = { all: (games || []).length, free: 0, paid: 0 };
    (games || []).forEach((g) => {
      const p = getGamePriceInfo(g);
      if (p.isFree) counts.free++;
      else if (p.isPaid) counts.paid++;
    });
    return counts;
  }, [games]);

  // 4. Multi-filter and sort computation with defensive guards
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

      // Dynamic Genre filter
      const matchesGenre =
        selectedGenre === 'Barchasi' ||
        genres.some((g) => (g || '').toLowerCase() === selectedGenre.toLowerCase());

      // Status filter
      const matchesStatus =
        selectedStatus === 'Barchasi' || subtitleStatus === selectedStatus;

      // Price filter (Tekin / Pullik)
      const priceInfo = getGamePriceInfo(game);
      const matchesPrice =
        selectedPrice === 'all' ||
        (selectedPrice === 'free' && priceInfo.isFree) ||
        (selectedPrice === 'paid' && priceInfo.isPaid);

      return matchesSearch && matchesGenre && matchesStatus && matchesPrice;
    }).sort((a, b) => {
      const yearA = Number(a?.releaseYear) || 0;
      const yearB = Number(b?.releaseYear) || 0;
      if (sortBy === 'newest') return yearB - yearA;
      if (sortBy === 'oldest') return yearA - yearB;
      if (sortBy === 'title') return (a?.title || '').localeCompare(b?.title || '');
      return 0;
    });
  }, [games, searchQuery, selectedGenre, selectedStatus, selectedPrice, sortBy]);

  const scrollGenres = (direction: 'left' | 'right') => {
    if (genreScrollRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      genreScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedGenre('Barchasi');
    setSelectedStatus('Barchasi');
    setSelectedPrice('all');
    setSortBy('newest');
    setSearchParams({});
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedGenre !== 'Barchasi' ||
    selectedStatus !== 'Barchasi' ||
    selectedPrice !== 'all' ||
    sortBy !== 'newest';

  // Count how many filters are active
  const activeFiltersCount =
    (searchQuery.trim() !== '' ? 1 : 0) +
    (selectedGenre !== 'Barchasi' ? 1 : 0) +
    (selectedStatus !== 'Barchasi' ? 1 : 0) +
    (selectedPrice !== 'all' ? 1 : 0) +
    (sortBy !== 'newest' ? 1 : 0);

  return (
    <div className="pt-28 pb-20 min-h-screen bg-[#0B0D12]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A3E635]/10 text-[#A3E635] text-xs font-bold mb-3 border border-[#A3E635]/20">
              <Layers className="w-3.5 h-3.5" />
              <span>O‘yinlar Katalogi</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Barcha o‘zbekcha subtitrli o‘yinlar
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-2 max-w-2xl leading-relaxed">
              Loyiha doirasida tayyorlangan, tahrirlanayotgan va rejalashtirilgan barcha o‘yinlar ro‘yxati.
            </p>
          </div>

          {/* Database stats badge */}
          <div className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#141821] border border-[#2A3245] text-xs font-medium text-gray-300 shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#A3E635] animate-pulse" />
            <span>Bazadagi jami o‘yinlar:</span>
            <strong className="text-white font-mono">{games.length} ta</strong>
          </div>
        </div>

        {/* Minimalist Filter Section */}
        <div className="space-y-3.5 mb-8">
          {/* Top Row: Search + Minimalist Filters Toolbar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-[#141821] border border-[#2A3245] hover:border-gray-600 focus:border-[#A3E635] text-white placeholder-gray-500 text-xs sm:text-sm focus:outline-none transition-all shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSearchParams({});
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-0.5 rounded cursor-pointer transition-colors"
                  title="Qidiruvni tozalash"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Compact Filter Controls (Status, Price, Sort) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {/* Subtitle Status Dropdown */}
              <div className="relative shrink-0">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className={`appearance-none pl-3.5 pr-7 py-2.5 rounded-2xl text-xs font-semibold cursor-pointer border transition-all focus:outline-none ${
                    selectedStatus !== 'Barchasi'
                      ? 'bg-[#A3E635]/15 text-[#A3E635] border-[#A3E635]/50'
                      : 'bg-[#141821] text-gray-300 border-[#2A3245] hover:border-gray-600'
                  }`}
                >
                  <option value="Barchasi" className="bg-[#141821] text-white">Subtitr: Barchasi</option>
                  <option value="Tayyor" className="bg-[#141821] text-emerald-400">● Tayyor ({statusCounts.ready})</option>
                  <option value="Jarayonda" className="bg-[#141821] text-sky-400">● Jarayonda ({statusCounts.inProgress})</option>
                  <option value="Tez kunda" className="bg-[#141821] text-amber-400">● Tez kunda ({statusCounts.upcoming})</option>
                </select>
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">▼</span>
              </div>

              {/* Price Dropdown */}
              <div className="relative shrink-0">
                <select
                  value={selectedPrice}
                  onChange={(e) => setSelectedPrice(e.target.value as any)}
                  className={`appearance-none pl-3.5 pr-7 py-2.5 rounded-2xl text-xs font-semibold cursor-pointer border transition-all focus:outline-none ${
                    selectedPrice !== 'all'
                      ? 'bg-sky-500/15 text-sky-400 border-sky-500/50'
                      : 'bg-[#141821] text-gray-300 border-[#2A3245] hover:border-gray-600'
                  }`}
                >
                  <option value="all" className="bg-[#141821] text-white">Narx: Barchasi</option>
                  <option value="free" className="bg-[#141821] text-emerald-400">Bepul ({priceCounts.free})</option>
                  <option value="paid" className="bg-[#141821] text-sky-400">Pullik ({priceCounts.paid})</option>
                </select>
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">▼</span>
              </div>

              {/* Sort Dropdown */}
              <div className="relative shrink-0">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className={`appearance-none pl-3.5 pr-7 py-2.5 rounded-2xl text-xs font-semibold cursor-pointer border transition-all focus:outline-none ${
                    sortBy !== 'newest'
                      ? 'bg-white/10 text-white border-white/30'
                      : 'bg-[#141821] text-gray-300 border-[#2A3245] hover:border-gray-600'
                  }`}
                >
                  <option value="newest" className="bg-[#141821] text-white">Saralash: Yangi</option>
                  <option value="oldest" className="bg-[#141821] text-white">Saralash: Avvalgi</option>
                  <option value="title" className="bg-[#141821] text-white">Saralash: A–Z</option>
                </select>
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">▼</span>
              </div>

              {/* Reset Button (only if active) */}
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  title="Barcha filtrlarni tozalash"
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span className="hidden sm:inline">Tozalash</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-[10px] font-mono">
                    {activeFiltersCount}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Minimalist Dynamic Genres Strip */}
          <div className="relative flex items-center">
            {/* Scroll Left Button */}
            <button
              onClick={() => scrollGenres('left')}
              className="hidden sm:flex items-center justify-center w-7 h-7 rounded-full bg-[#141821] hover:bg-[#1E2536] text-gray-400 hover:text-white border border-[#2A3245] shadow-sm transition-all cursor-pointer mr-2 shrink-0"
              title="Chapga siljitish"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Scrollable Genres */}
            <div
              ref={genreScrollRef}
              className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none scroll-smooth flex-1"
            >
              {dynamicGenres.map((genre) => {
                const isSelected = selectedGenre.toLowerCase() === genre.name.toLowerCase();

                return (
                  <button
                    key={genre.name}
                    onClick={() => setSelectedGenre(genre.name)}
                    className={`text-xs px-3 py-1.5 rounded-xl shrink-0 transition-all flex items-center gap-1.5 cursor-pointer font-medium ${
                      isSelected
                        ? 'bg-[#A3E635] text-[#0B0D12] font-black shadow-sm shadow-[#A3E635]/25 scale-[1.02]'
                        : 'bg-[#141821] text-gray-400 hover:text-white hover:bg-[#1C2230] border border-[#2A3245]/70 hover:border-gray-600'
                    }`}
                  >
                    <span>{genre.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isSelected
                          ? 'bg-[#0B0D12]/20 text-[#0B0D12] font-bold'
                          : 'bg-[#0B0D12] text-gray-400'
                      }`}
                    >
                      {genre.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Scroll Right Button */}
            <button
              onClick={() => scrollGenres('right')}
              className="hidden sm:flex items-center justify-center w-7 h-7 rounded-full bg-[#141821] hover:bg-[#1E2536] text-gray-400 hover:text-white border border-[#2A3245] shadow-sm transition-all cursor-pointer ml-2 shrink-0"
              title="O‘ngga siljitish"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Results Info & Active Filter Tags Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-gray-400 font-medium">
              Topildi: <strong className="text-white font-bold">{filteredGames.length} ta o‘yin</strong>
            </span>

            {/* Active filter badges */}
            {selectedGenre !== 'Barchasi' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#A3E635]/15 text-[#A3E635] border border-[#A3E635]/30 font-medium">
                Janr: {selectedGenre}
                <button
                  onClick={() => setSelectedGenre('Barchasi')}
                  className="hover:text-white ml-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedStatus !== 'Barchasi' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-medium">
                Holat: {selectedStatus}
                <button
                  onClick={() => setSelectedStatus('Barchasi')}
                  className="hover:text-white ml-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedPrice !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500/15 text-sky-400 border border-sky-500/30 font-medium">
                Narx: {selectedPrice === 'free' ? 'Bepul' : 'Pullik'}
                <button
                  onClick={() => setSelectedPrice('all')}
                  className="hover:text-white ml-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {searchQuery.trim() !== '' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 font-medium">
                Qidiruv: "{searchQuery}"
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSearchParams({});
                  }}
                  className="hover:text-white ml-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-[#A3E635] hover:underline font-semibold cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Barcha filtrlarni tozalash</span>
            </button>
          )}
        </div>

        {/* Games Grid or Empty State */}
        {loading ? (
          <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#A3E635] animate-spin" />
            <p className="text-sm text-gray-400 font-medium">O‘yinlar bazadan yuklanmoqda...</p>
          </div>
        ) : filteredGames.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-[#141821] rounded-3xl border border-[#2A3245] p-8 max-w-xl mx-auto shadow-2xl space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#1A1F2A] border border-[#2A3245] flex items-center justify-center text-gray-400 mx-auto">
              <Search className="w-8 h-8 text-gray-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                Mos keluvchi o‘yinlar topilmadi
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
                Tanlangan filtrlar yoki qidiruv so‘rovi bo‘yicha hozircha o‘yin mavjud emas. Filtrlarni tozalab qayta urinib ko‘ring.
              </p>
            </div>
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#A3E635] text-[#0B0D12] font-bold text-xs sm:text-sm hover:bg-[#84CC16] transition-all hover:scale-[1.02] shadow-accent-glow cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Filtrlarni tozalash</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
