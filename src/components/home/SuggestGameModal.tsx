import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { CheckCircle2, Sparkles } from 'lucide-react';

interface SuggestGameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SuggestGameModal: React.FC<SuggestGameModalProps> = ({ isOpen, onClose }) => {
  const [gameTitle, setGameTitle] = useState('');
  const [platform, setPlatform] = useState('PC');
  const [steamUrl, setSteamUrl] = useState('');
  const [contact, setContact] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameTitle.trim()) return;

    console.log('Submitted game suggestion:', {
      gameTitle,
      platform,
      steamUrl,
      contact,
      note,
      timestamp: new Date().toISOString(),
    });

    setIsSubmitted(true);
    setTimeout(() => {
      setTimeout(() => {
        setIsSubmitted(false);
        setGameTitle('');
        setSteamUrl('');
        setContact('');
        setNote('');
        onClose();
      }, 2500);
    }, 500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="O‘zbekcha subtitr taklif qilish"
      subtitle="Qaysi o‘yinni ona tilingizda o‘ynashni istaysiz? Bizga yozib qoldiring!"
      maxWidth="lg"
    >
      {isSubmitted ? (
        <div className="py-8 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-[#A3E635]/20 text-[#A3E635] flex items-center justify-center mb-4 animate-bounce">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="text-xl font-bold text-white mb-2">Taklifingiz qabul qilindi!</h4>
          <p className="text-sm text-gray-400 max-w-sm">
            Tashakkur! O‘yin jamoamiz monitoring ro‘yxatiga qo‘shildi. Ovozlar soni yetarli bo‘lganda tarjima jarayoni boshlanadi.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              O‘yin nomi <span className="text-[#A3E635]">*</span>
            </label>
            <input
              type="text"
              required
              value={gameTitle}
              onChange={(e) => setGameTitle(e.target.value)}
              placeholder="Masalan: Red Dead Redemption 2, Elden Ring..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#0B0D12] border border-[#2A3245] text-white placeholder-gray-500 focus:outline-none focus:border-[#A3E635] transition-colors text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Platforma
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0B0D12] border border-[#2A3245] text-white focus:outline-none focus:border-[#A3E635] transition-colors text-sm"
              >
                <option value="PC">PC (Windows)</option>
                <option value="Steam Deck">Steam Deck</option>
                <option value="Boshqa">Boshqa</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Steam yoki do‘kon havolasi
              </label>
              <input
                type="url"
                value={steamUrl}
                onChange={(e) => setSteamUrl(e.target.value)}
                placeholder="https://store.steampowered.com/app/..."
                className="w-full px-4 py-2.5 rounded-xl bg-[#0B0D12] border border-[#2A3245] text-white placeholder-gray-500 focus:outline-none focus:border-[#A3E635] transition-colors text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Bog‘lanish (Telegram yoki Email) <span className="text-gray-500">(ixtiyoriy)</span>
            </label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="@username yoki pochta manzili"
              className="w-full px-4 py-2.5 rounded-xl bg-[#0B0D12] border border-[#2A3245] text-white placeholder-gray-500 focus:outline-none focus:border-[#A3E635] transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Qo‘shimcha fikr yoki izoh
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nima uchun aynan shu o‘yin tanlanishi kerakligi haqida yozishingiz mumkin..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#0B0D12] border border-[#2A3245] text-white placeholder-gray-500 focus:outline-none focus:border-[#A3E635] transition-colors text-sm resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#A3E635] text-[#0B0D12] font-semibold text-sm hover:bg-[#84CC16] transition-all hover:shadow-accent-glow"
            >
              <Sparkles className="w-4 h-4" />
              <span>Taklifni yuborish</span>
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
