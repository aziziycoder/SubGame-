import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { GAMES_DATA } from '../../data/games';
import { CheckCircle2, Send } from 'lucide-react';

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedGameId?: string;
}

export const ReportIssueModal: React.FC<ReportIssueModalProps> = ({
  isOpen,
  onClose,
  preselectedGameId,
}) => {
  const [gameId, setGameId] = useState(preselectedGameId || GAMES_DATA[0].id);
  const [issueType, setIssueType] = useState('Tarjima xatosi');
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    console.log('Submitted issue report:', {
      gameId,
      issueType,
      description,
      contact,
      timestamp: new Date().toISOString(),
    });

    setIsSubmitted(true);
    setTimeout(() => {
      setTimeout(() => {
        setIsSubmitted(false);
        setDescription('');
        setContact('');
        onClose();
      }, 2500);
    }, 500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Xatolik haqida xabar berish"
      subtitle="Subtitrda tarjima noaniqligi yoki o‘rnatishda xatolik bormi? Bizga xabar bering!"
      maxWidth="lg"
    >
      {isSubmitted ? (
        <div className="py-8 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-[#A3E635]/20 text-[#A3E635] flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="text-xl font-bold text-white mb-2">Xabaringiz uchun rahmat!</h4>
          <p className="text-sm text-gray-400 max-w-sm">
            Tahririyatimiz muammoni ko‘rib chiqadi va keyingi subtitr patchida tuzatish kiritadi.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Tegishli o‘yin <span className="text-[#A3E635]">*</span>
            </label>
            <select
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0B0D12] border border-[#2A3245] text-white focus:outline-none focus:border-[#A3E635] transition-colors text-sm"
            >
              {GAMES_DATA.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title} ({g.subtitleStatus})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Xatolik turi
            </label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#0B0D12] border border-[#2A3245] text-white focus:outline-none focus:border-[#A3E635] transition-colors text-sm"
            >
              <option value="Tarjima xatosi">Tarjima xatosi yoki grammatik noaniqlik</option>
              <option value="O‘rnatish muammosi">O‘rnatishda muammo yoki fayl ochilmayapti</option>
              <option value="Versiya nomutanosibligi">O‘yin yangilanishidan keyin ishlamay qoldi</option>
              <option value="Boshqa">Boshqa texnik masala</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Xatolik tavsifi <span className="text-[#A3E635]">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Qaysi sahnada, qaysi qahramon so‘zida yoki qaysi faylni nusxalashda xato yuz berganini batafsil yozing..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#0B0D12] border border-[#2A3245] text-white placeholder-gray-500 focus:outline-none focus:border-[#A3E635] transition-colors text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Aloqa uchun (Telegram yoki Email) <span className="text-gray-500">(ixtiyoriy)</span>
            </label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="@username yoki email"
              className="w-full px-4 py-2.5 rounded-xl bg-[#0B0D12] border border-[#2A3245] text-white placeholder-gray-500 focus:outline-none focus:border-[#A3E635] transition-colors text-sm"
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
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#A3E635] text-[#0B0D12] font-semibold text-sm hover:bg-[#84CC16] transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Xabarni yuborish</span>
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
