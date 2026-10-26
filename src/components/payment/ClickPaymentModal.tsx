import React, { useState } from 'react';
import { X, ShieldCheck, Loader2, ExternalLink, Lock } from 'lucide-react';
import type { Game } from '../../types/game';
import { createClickOrder, getGamePriceInfo } from '../../services/paymentService';
import { ClickLogo, ClickBadge } from '../common/BrandLogos';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const priceInfo = getGamePriceInfo(game);
  const displayPrice = priceInfo.text;

  const handleProceedClick = async () => {
    setLoading(true);
    setError(null);
    try {
      const order = await createClickOrder({
        userId: user.uid,
        userEmail: user.email || '',
        game,
      });

      // Redirect to official Click payment gateway
      window.location.href = order.clickUrl;
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Buyurtma yaratishda xatolik yuz berdi.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      {/* Backdrop touch to close */}
      <div 
        className="fixed inset-0 cursor-pointer" 
        onClick={onClose} 
        aria-hidden="true" 
      />

      <div className="relative w-full max-w-md bg-[#121620] border-t sm:border border-[#2A3245] rounded-t-[28px] sm:rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[92vh] animate-in slide-in-from-bottom-4 duration-200">
        {/* Mobile top pull indicator */}
        <div className="sm:hidden w-12 h-1 rounded-full bg-white/20 mx-auto mt-2.5 mb-1 shrink-0" />

        {/* Header with Game Image banner */}
        <div className="relative h-32 sm:h-36 w-full bg-[#0B0D12] overflow-hidden shrink-0">
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
          <div className="p-3.5 rounded-2xl bg-[#0B0D12]/80 border border-[#2A3245] space-y-1.5 text-xs">
            <div className="flex items-center gap-2 font-bold text-white">
              <ShieldCheck className="w-4 h-4 text-[#A3E635] shrink-0" />
              <span>SubGame 1-Qurilma (DRM) Himoyasi</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed pl-6">
              Litsenziya sotib olingandan so‘ng <strong className="text-gray-200">{user.email || 'hisobingiz'}</strong>ga biriktiriladi va SubGame Launcherda ushbu kompyuteringiz uchun avtomatik faollashadi.
            </p>
          </div>

          {/* Click Payment Provider Info */}
          <div className="p-3.5 rounded-2xl bg-[#0065FF]/10 border border-[#0065FF]/25 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <ClickBadge size="lg" />
              <div className="min-w-0">
                <span className="text-xs sm:text-sm font-black text-white block truncate">
                  Click Up / Click Merchant
                </span>
                <span className="text-[11px] text-sky-300 block truncate">
                  Uzcard, Humo va xalqaro kartalar
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-[#A3E635]/15 text-[#A3E635] border border-[#A3E635]/30 text-[10px] font-extrabold whitespace-nowrap shrink-0">
              0% Komissiya
            </span>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              onClick={handleProceedClick}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 sm:py-4 px-5 rounded-2xl bg-[#0065FF] hover:bg-[#0052cc] active:scale-[0.99] text-white font-extrabold text-sm sm:text-base shadow-xl shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span>Click to‘lov sahifasiga o‘tilmoqda...</span>
                </>
              ) : (
                <>
                  <ClickLogo variant="icon" className="w-4.5 h-4.5 text-white shrink-0" />
                  <span>Click orqali to‘lov qilish ({displayPrice})</span>
                  <ExternalLink className="w-4 h-4 opacity-80 shrink-0" />
                </>
              )}
            </button>

            {/* Security Guarantee Note */}
            <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] text-gray-500 pt-1 pb-1">
              <Lock className="w-3 h-3 text-[#A3E635] shrink-0" />
              <span>256-bit shifrlangan xavfsiz to‘lov • Rasmiy Click.uz orqali</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
