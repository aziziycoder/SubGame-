import React from 'react';
import { Link } from 'react-router-dom';
import type { Game } from '../../types/game';
import { SubtitleStatusBadge } from '../common/Badge';
import { useFavorites } from '../../context/FavoritesContext';
import { Heart, Monitor, ArrowRight, ShieldCheck, Tag, Sparkles, Users } from 'lucide-react';
import { getGamePriceInfo } from '../../services/paymentService';

interface GameCardProps {
  game: Game;
  priority?: boolean;
  claimCount?: number;
}

export const GameCard: React.FC<GameCardProps> = ({ game, priority = false, claimCount }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(game.id);
  const priceInfo = getGamePriceInfo(game);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(game.id);
  };

  return (
    <div className="group relative bg-[#1A1F2A] rounded-2xl border border-[#2A3245] hover:border-[#A3E635]/60 transition-all duration-300 hover:shadow-card-glow flex flex-col overflow-hidden">
      {/* Top Header Bar: Status Badge, Version & Favorite button (Outside the image so art and logos are 100% visible) */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#141821] border-b border-[#2A3245]">
        <div className="flex items-center gap-2">
          <SubtitleStatusBadge status={game.subtitleStatus} size="sm" />
          {game.subtitleStatus === 'Tayyor' && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#A3E635] bg-[#0B0D12] px-2 py-0.5 rounded border border-[#A3E635]/30">
              <ShieldCheck className="w-3 h-3" />
              <span>{game.subtitleVersion}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {typeof claimCount === 'number' && claimCount > 0 && (
            <span
              className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-300 bg-cyan-500/15 border border-cyan-500/35 px-2 py-0.5 rounded-full shadow-sm"
              title={`${claimCount} nafar o‘yinchi subtitrni olgan`}
            >
              <Users className="w-3 h-3 text-cyan-400" />
              <span>{claimCount}</span>
            </span>
          )}

          <button
            onClick={handleFavoriteClick}
            aria-label={favorited ? 'Sevimlilardan o‘chirish' : 'Sevimlilarga qo‘shish'}
            className={`p-1.5 rounded-lg transition-all ${
              favorited
                ? 'bg-rose-500/20 text-rose-500 border border-rose-500/40'
                : 'text-gray-400 hover:text-white bg-[#0B0D12] hover:bg-white/10 border border-[#2A3245]'
            }`}
          >
            <Heart className={`w-4 h-4 ${favorited ? 'fill-rose-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Media / Poster: Exact Steam Header 460:215 ratio, 100% Uncropped */}
      <Link
        to={`/games/${game.slug}`}
        className="relative block w-full bg-[#0B0D12] overflow-hidden"
        style={{ aspectRatio: '460 / 215' }}
      >
        <img
          src={game.cardImage || game.cover}
          alt={game.title}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className="w-full h-full object-contain transition-transform duration-500 ease-out group-hover:scale-105"
        />
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
            {(Array.isArray(game.genres) ? game.genres : []).slice(0, 3).map((genre) => (
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
          <div className="flex flex-col min-w-0 pr-2">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Subtitr narxi:</span>
            <div className="mt-1 flex items-center">
              {priceInfo.isPaid ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-black text-sky-300 bg-sky-500/15 border border-sky-500/35 shadow-sm">
                  <Tag className="w-3 h-3 text-sky-400 shrink-0" />
                  <span className="truncate">{priceInfo.text}</span>
                </span>
              ) : priceInfo.isFree ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-black text-[#A3E635] bg-[#A3E635]/15 border border-[#A3E635]/35 shadow-sm">
                  <ShieldCheck className="w-3 h-3 text-[#A3E635] shrink-0" />
                  <span>Bepul</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold text-amber-400 bg-amber-500/15 border border-amber-500/35">
                  <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>Tez kunda</span>
                </span>
              )}
            </div>
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
