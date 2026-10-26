import React, { useState } from 'react';
import { X, ShieldCheck, Loader2, Sparkles, ExternalLink } from 'lucide-react';
import type { Game } from '../../types/game';
import { createClickOrder, simulateSandboxPayment } from '../../services/paymentService';
import { ClickLogo } from '../common/BrandLogos';

interface ClickPaymentModalProps {
  game: Game;
  user: any;
  onClose: () => void;
  onSuccess: () => void;
}

export const ClickPaymentModal: React.FC<ClickPaymentModalProps> = ({
  game,
  user,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rawPrice = game.subtitlePrice || game.price || '15 000 so‘m';
  const displayPrice = rawPrice.includes('so‘m') ? rawPrice : `${rawPrice} so‘m`;

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

  const handleTestSandboxPayment = async () => {
    setSimulating(true);
    setError(null);
    try {
      const order = await createClickOrder({
        userId: user.uid,
        userEmail: user.email || '',
        game,
      });

      const success = await simulateSandboxPayment(order.orderId);
      if (success) {
        onSuccess();
      } else {
        setError('Test to‘lovini simulyatsiya qilishda xatolik yuz berdi.');
      }
    } catch (err: any) {
      setError(err?.message || 'Test to‘lovi bajarilmadi.');
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md bg-[#141821] border border-[#2A3245] rounded-3xl overflow-hidden shadow-2xl">
        {/* Header with Game Image banner */}
        <div className="relative h-36 w-full bg-[#0B0D12] overflow-hidden">
          <img
            src={game.cardImage || game.cover}
            alt={game.title}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141821] via-[#141821]/60 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-black/50 text-gray-300 hover:text-white hover:bg-black/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-3 left-5 right-5 flex items-end justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#A3E635] tracking-wider block">
                Rasmiy Litsenziya
              </span>
              <h3 className="text-lg font-black text-white leading-tight line-clamp-1">
                {game.title}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-400 block">Narxi:</span>
              <span className="text-base font-extrabold text-[#A3E635]">{displayPrice}</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {/* DRM Notice */}
          <div className="p-3.5 rounded-2xl bg-[#0B0D12] border border-[#2A3245] space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-white">
              <ShieldCheck className="w-4 h-4 text-[#A3E635]" />
              <span>SubGame 1-Qurilma (DRM) Himoyasi</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Litsenziya sotib olingandan so‘ng <strong>{user.email || 'hisobingiz'}</strong>ga biriktiriladi va SubGame Launcherda ushbu kompyuteringiz uchun avtomatik faollashadi.
            </p>
          </div>

          {/* Click Payment Provider Info */}
          <div className="p-3.5 rounded-2xl bg-[#0065FF]/10 border border-[#0065FF]/25 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 px-2.5 rounded-xl bg-[#0065FF] flex items-center justify-center shadow-md">
                <ClickLogo variant="full" className="h-4.5 w-auto text-white" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Click Up / Click Merchant</span>
                <span className="text-[10px] text-sky-300">Milliy to‘lov tizimi (Uzcard, Humo)</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 text-[10px] font-bold">
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
              disabled={loading || simulating}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-[#0065FF] hover:bg-[#0052cc] text-white font-extrabold text-sm shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Click to‘lov sahifasiga o‘tilmoqda...</span>
                </>
              ) : (
                <>
                  <ClickLogo variant="icon" className="w-4 h-4 text-white" />
                  <span>Click orqali to‘lash ({displayPrice})</span>
                  <ExternalLink className="w-4 h-4 opacity-75" />
                </>
              )}
            </button>

            {/* Developer Test Sandbox Simulator */}
            <button
              onClick={handleTestSandboxPayment}
              disabled={loading || simulating}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#1A202C] hover:bg-[#252E3E] text-gray-300 hover:text-white border border-[#2A3245] text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              title="Click shartnomasi bo'lmasa ham to'lov oqimini va litsenziya berilishini tekshirish uchun test rejimi"
            >
              {simulating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#A3E635]" />
                  <span>Test to‘lovi yuborilmoqda...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-[#A3E635]" />
                  <span>Test to‘lovini simulyatsiya qilish (Sandbox)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
