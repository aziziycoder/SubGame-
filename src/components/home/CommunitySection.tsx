import React from 'react';
import { SITE_CONFIG } from '../../config/site';
import { Send, Users, Sparkles } from 'lucide-react';

interface CommunitySectionProps {
  onOpenSuggestModal: () => void;
}

export const CommunitySection: React.FC<CommunitySectionProps> = ({ onOpenSuggestModal }) => {
  return (
    <section className="py-20 bg-[#0B0D12] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-[#141821] via-[#1A1F2A] to-[#141821] border border-[#2A3245] p-8 sm:p-12 lg:p-16 overflow-hidden shadow-2xl">
          {/* Subtle glow lights in background */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#A3E635]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/30 text-xs font-bold mb-4">
              <Users className="w-3.5 h-3.5" />
              <span>O‘zbekiston Geymerlar Hamjamiyati</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              O‘zbek gaming hamjamiyatiga qo‘shiling
            </h2>

            <p className="text-base sm:text-lg text-gray-300 mt-4 leading-relaxed">
              Yangi subtitrlar, loyihalar va yangiliklardan birinchilardan bo‘lib xabardor bo‘ling. Ovoz berish jarayonlarida qatnashing va keyingi tarjima qilinadigan o‘yinni birgalikda tanlang!
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-8">
              <a
                href={SITE_CONFIG.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm sm:text-base transition-all hover:scale-[1.02] shadow-lg shadow-sky-500/20"
              >
                <Send className="w-5 h-5" />
                <span>Telegram kanaliga o‘tish</span>
              </a>

              <button
                onClick={onOpenSuggestModal}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#141821] hover:bg-[#1A1F2A] text-white font-semibold text-sm sm:text-base border border-[#2A3245] hover:border-[#A3E635]/50 transition-all"
              >
                <Sparkles className="w-4 h-4 text-[#A3E635]" />
                <span>Subtitr taklif qilish</span>
              </button>
            </div>

            {/* Live community stats badge */}
            <div className="mt-8 pt-8 border-t border-[#2A3245]/60 flex flex-wrap items-center gap-8 text-xs text-gray-400">
              <div>
                <span className="text-white font-bold text-sm">2+ o‘yin</span>
                <p>To‘liq subtitr bilan</p>
              </div>
              <div className="h-6 w-px bg-[#2A3245]" />
              <div>
                <span className="text-[#A3E635] font-bold text-sm">100% bepul</span>
                <p>O‘zbek geymerlari uchun</p>
              </div>
              <div className="h-6 w-px bg-[#2A3245]" />
              <a
                href={SITE_CONFIG.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group block cursor-pointer transition-transform hover:scale-105"
                title="Telegram kanaliga o‘tish"
              >
                <span className="text-sky-400 font-bold text-sm group-hover:text-sky-300 group-hover:underline flex items-center gap-1">
                  {SITE_CONFIG.telegramChannelName}
                </span>
                <p className="text-gray-400 group-hover:text-gray-200">Rasmiy muhokama kanali ↗</p>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
