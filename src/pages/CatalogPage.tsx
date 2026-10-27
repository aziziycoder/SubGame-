import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getGames } from '../services/gamesService';
import type { Game } from '../types/game';
import { GameCard } from '../components/game/GameCard';
import {
  Search,
  Filter,
  RotateCcw,
  Layers,
  Loader2,
  Tag,
  CheckCircle2,
  ArrowUpDown,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
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

        {/* Modern Filter Hub Card */}
        <div className="bg-[#141821] border border-[#2A3245] rounded-3xl p-5 sm:p-6 mb-8 space-y-5 shadow-2xl">
          {/* Row 1: Search & Sort Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
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
                className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#0B0D12] border border-[#2A3245] text-white placeholder-gray-500 text-xs sm:text-sm focus:outline-none focus:border-[#A3E635] focus:ring-1 focus:ring-[#A3E635]/40 transition-all shadow-inner"
              />
              <Search className="w-4 h-4 text-[#A3E635] absolute left-3.5 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSearchParams({});
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-0.5 rounded cursor-pointer transition-colors"
                  title="Qidiruvni tozalash"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="relative flex-1 sm:flex-initial">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full sm:w-auto appearance-none pl-9 pr-9 py-2.5 rounded-xl bg-[#0B0D12] border border-[#2A3245] text-white text-xs sm:text-sm focus:outline-none focus:border-[#A3E635] transition-all cursor-pointer font-medium"
                >
                  <option value="newest">Yil: Yangi o‘yinlar</option>
                  <option value="oldest">Yil: Avvalgi o‘yinlar</option>
                  <option value="title">Alifbo: A–Z</option>
                </select>
                <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-[10px]">▼</span>
              </div>

              {/* Reset Filters Button */}
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  title="Barcha filtrlarni tozalash"
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Tozalash</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-[10px] font-mono">
                    {activeFiltersCount}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Row 2: Segmented Controls for Subtitle Status & Price */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-3 border-t border-[#2A3245]/60">
            {/* Status Segmented Buttons (7 cols) */}
            <div className="lg:col-span-7 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#A3E635]" />
                Subtitr holati:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-xl bg-[#0B0D12] border border-[#2A3245]">
                <button
                  onClick={() => setSelectedStatus('Barchasi')}
                  className={`text-xs px-2.5 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedStatus === 'Barchasi'
                      ? 'bg-[#A3E635] text-[#0B0D12] shadow-sm shadow-[#A3E635]/25'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>Barchasi</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    selectedStatus === 'Barchasi' ? 'bg-[#0B0D12]/20 text-[#0B0D12]' : 'bg-[#141821] text-gray-400'
                  }`}>
                    {statusCounts.all}
                  </span>
                </button>

                <button
                  onClick={() => setSelectedStatus('Tayyor')}
                  className={`text-xs px-2.5 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedStatus === 'Tayyor'
                      ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/25'
                      : 'text-gray-300 hover:text-emerald-400 hover:bg-emerald-500/10'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  <span>Tayyor</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    selectedStatus === 'Tayyor' ? 'bg-black/30 text-white' : 'bg-[#141821] text-gray-400'
                  }`}>
                    {statusCounts.ready}
                  </span>
                </button>

                <button
                  onClick={() => setSelectedStatus('Jarayonda')}
                  className={`text-xs px-2.5 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedStatus === 'Jarayonda'
                      ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/25'
                      : 'text-gray-300 hover:text-sky-400 hover:bg-sky-500/10'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0" />
                  <span>Jarayonda</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    selectedStatus === 'Jarayonda' ? 'bg-black/30 text-white' : 'bg-[#141821] text-gray-400'
                  }`}>
                    {statusCounts.inProgress}
                  </span>
                </button>

                <button
                  onClick={() => setSelectedStatus('Tez kunda')}
                  className={`text-xs px-2.5 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedStatus === 'Tez kunda'
                      ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/25'
                      : 'text-gray-300 hover:text-amber-400 hover:bg-amber-500/10'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                  <span>Tez kunda</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    selectedStatus === 'Tez kunda' ? 'bg-black/30 text-white' : 'bg-[#141821] text-gray-400'
                  }`}>
                    {statusCounts.upcoming}
                  </span>
                </button>
              </div>
            </div>

            {/* Price Segmented Buttons (5 cols) */}
            <div className="lg:col-span-5 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-sky-400" />
                Narx toifasi:
              </span>
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#0B0D12] border border-[#2A3245]">
                <button
                  onClick={() => setSelectedPrice('all')}
                  className={`text-xs px-2 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedPrice === 'all'
                      ? 'bg-[#A3E635] text-[#0B0D12] shadow-sm shadow-[#A3E635]/25'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>Barchasi</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    selectedPrice === 'all' ? 'bg-[#0B0D12]/20 text-[#0B0D12]' : 'bg-[#141821] text-gray-400'
                  }`}>
                    {priceCounts.all}
                  </span>
                </button>

                <button
                  onClick={() => setSelectedPrice('free')}
                  className={`text-xs px-2 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedPrice === 'free'
                      ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/25'
                      : 'text-emerald-400 hover:bg-emerald-500/10'
                  }`}
                >
                  <ShieldCheck className="w-3 h-3 shrink-0" />
                  <span>Bepul</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    selectedPrice === 'free' ? 'bg-black/30 text-white' : 'bg-[#141821] text-gray-400'
                  }`}>
                    {priceCounts.free}
                  </span>
                </button>

                <button
                  onClick={() => setSelectedPrice('paid')}
                  className={`text-xs px-2 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedPrice === 'paid'
                      ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/25'
                      : 'text-sky-300 hover:bg-sky-500/10'
                  }`}
                >
                  <Tag className="w-3 h-3 shrink-0" />
                  <span>Pullik</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    selectedPrice === 'paid' ? 'bg-black/30 text-white' : 'bg-[#141821] text-gray-400'
                  }`}>
                    {priceCounts.paid}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Row 3: 100% Dynamic Database-Driven Genre Chips */}
          <div className="pt-3 border-t border-[#2A3245]/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-[#A3E635]" />
                Janrlar (bazada {dynamicGenres.length - 1} ta):
              </span>

              {/* Scroll buttons for long genre lists */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => scrollGenres('left')}
                  className="p-1 rounded-lg bg-[#0B0D12] hover:bg-[#1A202C] text-gray-400 hover:text-white border border-[#2A3245] transition-colors cursor-pointer"
                  title="Chapga siljitish"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => scrollGenres('right')}
                  className="p-1 rounded-lg bg-[#0B0D12] hover:bg-[#1A202C] text-gray-400 hover:text-white border border-[#2A3245] transition-colors cursor-pointer"
                  title="O‘ngga siljitish"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Horizontally scrollable genre chips */}
            <div
              ref={genreScrollRef}
              className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none scroll-smooth"
            >
              {dynamicGenres.map((genre) => {
                const isSelected = selectedGenre.toLowerCase() === genre.name.toLowerCase();

                return (
                  <button
                    key={genre.name}
                    onClick={() => setSelectedGenre(genre.name)}
                    className={`text-xs px-3.5 py-1.5 rounded-xl shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-[#A3E635] text-[#0B0D12] font-black shadow-accent-glow scale-[1.02] border border-[#A3E635]'
                        : 'bg-[#0B0D12] text-gray-300 hover:text-white hover:bg-[#1A202C] border border-[#2A3245]'
                    }`}
                  >
                    <span>{genre.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isSelected
                          ? 'bg-[#0B0D12]/20 text-[#0B0D12] font-bold'
                          : 'bg-[#141821] text-gray-400'
                      }`}
                    >
                      {genre.count}
                    </span>
                  </button>
                );
              })}
            </div>
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
