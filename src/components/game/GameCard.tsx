import React from 'react';
import { Link } from 'react-router-dom';
import type { Game } from '../../types/game';
import { SubtitleStatusBadge } from '../common/Badge';
import { useFavorites } from '../../context/FavoritesContext';
import { Heart, Monitor, ArrowRight, ShieldCheck } from 'lucide-react';

interface GameCardProps {
  game: Game;
  priority?: boolean;
}

export const GameCard: React.FC<GameCardProps> = ({ game, priority = false }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(game.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(game.id);
  };

  return (
    <div className="group relative bg-[#1A1F2A] rounded-2xl border border-[#2A3245] hover:border-[#A3E635]/60 transition-all duration-300 hover:shadow-card-glow flex flex-col overflow-hidden">
      {/* Top Media / Poster */}
      <Link to={`/games/${game.slug}`} className="relative block aspect-[16/10] sm:aspect-[16/9] overflow-hidden bg-[#141821]">
        <img
          src={game.cover}
          alt={game.title}
          loading={priority ? 'eager' : 'lazy'}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1F2A] via-transparent to-black/30" />

        {/* Subtitle status badge in top-left */}
        <div className="absolute top-3 left-3 z-10">
          <SubtitleStatusBadge status={game.subtitleStatus} size="sm" />
        </div>

        {/* Favorite toggle button in top-right */}
        <button
          onClick={handleFavoriteClick}
          aria-label={favorited ? 'Sevimlilardan o‘chirish' : 'Sevimlilarga qo‘shish'}
          className={`absolute top-3 right-3 z-10 p-2.5 rounded-xl backdrop-blur-md transition-all ${
            favorited
              ? 'bg-rose-500/20 text-rose-500 border border-rose-500/40'
              : 'bg-black/50 text-gray-300 hover:text-white border border-white/10 hover:bg-black/70'
          }`}
        >
          <Heart className={`w-4 h-4 ${favorited ? 'fill-rose-500' : ''}`} />
        </button>

        {/* Subtitle version tag if ready */}
        {game.subtitleStatus === 'Tayyor' && (
          <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5 text-xs font-mono text-[#A3E635] bg-[#0B0D12]/80 px-2.5 py-1 rounded-md border border-[#A3E635]/30 backdrop-blur-sm">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Subtitr {game.subtitleVersion}</span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Release year and Developer */}
          <div className="flex items-center justify-between text-xs text-[#9CA3AF] mb-1.5">
            <span className="font-medium text-gray-300">{game.developer}</span>
            <span className="font-mono bg-[#141821] px-2 py-0.5 rounded border border-[#2A3245]">
              {game.releaseYear}
            </span>
          </div>

          {/* Title */}
          <Link to={`/games/${game.slug}`}>
            <h3 className="text-lg font-bold text-[#F5F7FA] group-hover:text-[#A3E635] transition-colors line-clamp-1">
              {game.title}
            </h3>
          </Link>

          {/* Short description */}
          <p className="text-xs sm:text-sm text-[#9CA3AF] mt-2 line-clamp-2 leading-relaxed">
            {game.shortDescription}
          </p>

          {/* Genres */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {game.genres.slice(0, 3).map((genre) => (
              <span
                key={genre}
                className="text-[11px] px-2 py-0.5 rounded bg-[#141821] text-gray-300 border border-[#2A3245]"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>

        {/* Footer info: Platforms, Price status, Batafsil button */}
        <div className="pt-4 mt-4 border-t border-[#2A3245]/60 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] text-gray-400">O‘yin narxi:</span>
            <span className="text-xs font-medium text-gray-200">
              {game.price}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center text-xs text-gray-400 bg-[#141821] px-2 py-1 rounded border border-[#2A3245]">
              <Monitor className="w-3.5 h-3.5 mr-1 text-[#A3E635]" />
              <span>PC</span>
            </div>

            <Link
              to={`/games/${game.slug}`}
              className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#A3E635] text-[#0B0D12] hover:bg-[#84CC16] transition-colors"
            >
              <span>Batafsil</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
