import React from 'react';
import { X, ShieldCheck, ExternalLink, Lock, AlertTriangle } from 'lucide-react';
import type { Game } from '../../types/game';
import { getGamePriceInfo } from '../../services/paymentService';
import { SITE_CONFIG } from '../../config/site';
import { ClickLogo, TelegramLogo } from '../common/BrandLogos';

interface ClickPaymentModalProps {
  game: Game;
  user: any;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ClickPaymentModal: React.FC<ClickPaymentModalProps> = ({
  game,
  user,
  onClose,
}) => {
  const priceInfo = getGamePriceInfo(game);
  const displayPrice = priceInfo.text;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      {/* Backdrop touch to close */}
      <div 
        className="fixed inset-0 cursor-pointer" 
        onClick={onClose} 
        aria-hidden="true" 
      />

      <div className="relative w-full max-w-md bg-[#121620] border-t sm:border border-[#2A3245] rounded-t-[28px] sm:rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[95vh] animate-in slide-in-from-bottom-4 duration-200">
        {/* Mobile top pull indicator */}
        <div className="sm:hidden w-12 h-1 rounded-full bg-white/20 mx-auto mt-2.5 mb-1 shrink-0" />

        {/* Header with Game Image banner */}
        <div className="relative h-28 sm:h-36 w-full bg-[#0B0D12] overflow-hidden shrink-0">
          <img
            src={game.cardImage || game.cover}
            alt={game.title}
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121620] via-[#121620]/60 to-transparent" />
          
          <button
            onClick={onClose}
            aria-label="Yopish"
            className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/90 text-gray-300 hover:text-white transition-all cursor-pointer backdrop-blur-sm shadow-md"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-3 left-4 right-4 sm:left-5 sm:right-5 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-[#A3E635] tracking-wider block">
                Rasmiy Litsenziya
              </span>
              <h3 className="text-lg sm:text-xl font-black text-white leading-tight truncate">
                {game.title}
              </h3>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[11px] text-gray-400 block font-medium">Litsenziya narxi:</span>
              <span className="text-base sm:text-lg font-black text-[#A3E635] drop-shadow-[0_0_12px_rgba(163,230,53,0.35)]">
                {displayPrice}
              </span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto">
          {/* DRM Notice */}
          <div className="p-3 rounded-2xl bg-[#0B0D12]/80 border border-[#2A3245] space-y-1 text-xs">
            <div className="flex items-center gap-2 font-bold text-white">
              <ShieldCheck className="w-4 h-4 text-[#A3E635] shrink-0" />
              <span>SubGame 1-Qurilma (DRM) Himoyasi</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed pl-6">
              Litsenziya sotib olingandan so‘ng <strong className="text-gray-200">{user.email || 'hisobingiz'}</strong>ga biriktiriladi va SubGame Launcherda ushbu kompyuteringiz uchun avtomatik faollashadi.
            </p>
          </div>

          {/* Maintenance Notice for Click & Telegram Redirect */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-3">
            <div className="flex items-center gap-2 font-extrabold text-amber-400 text-xs sm:text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Click to‘lov tizimida texnik ishlar</span>
            </div>
            <p className="text-[11px] sm:text-xs text-amber-200/90 leading-relaxed">
              Hozirda avtomatlashtirilgan Click to‘lov tizimida texnik ishlar olib borilmoqda. Ushbu o‘yin uchun litsenziya xarid qilish va uni hisobingizga darhol biriktirish uchun rasmiy Telegram guruhimizga o‘ting!
            </p>
            
            {/* Primary Telegram Purchase CTA */}
            <a
              href={SITE_CONFIG.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-12 flex items-center justify-center gap-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-sky-500/25 transition-all cursor-pointer"
            >
              <TelegramLogo className="w-4 h-4 shrink-0" />
              <span>Telegram orqali xarid qilish ({SITE_CONFIG.telegramChannelName})</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>

          {/* Disabled Click State */}
          <div className="space-y-2 pt-1">
            <button
              disabled
              className="w-full h-11 flex items-center justify-center gap-2 px-4 rounded-xl bg-[#1A202C]/60 border border-[#2A3245] text-gray-400 font-bold text-xs cursor-not-allowed opacity-80"
            >
              <ClickLogo variant="icon" className="w-4 h-4 opacity-40 shrink-0" />
              <span>Click to‘lov tizimi vaqtincha to‘xtatilgan</span>
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] text-gray-500 pt-0.5">
              <Lock className="w-3 h-3 text-[#A3E635] shrink-0" />
              <span>Telegram adminlari orqali xavfsiz va tezkor litsenziyalash</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
