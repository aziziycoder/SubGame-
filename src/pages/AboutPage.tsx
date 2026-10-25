import React, { useState } from 'react';
import { SITE_CONFIG } from '../config/site';
const SuggestGameModal = React.lazy(() => import('../components/home/SuggestGameModal').then((m) => ({ default: m.SuggestGameModal })));
import {
  Sparkles,
  ShieldCheck,
  Send,
  Workflow,
  Globe2
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);

  const pipelineSteps = [
    {
      step: '01',
      title: 'Matn resurslarini ajratib olish',
      description: 'O‘yin fayllaridan (.locres, .stringtable, .loc) inglizcha matnlar va dialoglar kod strukturasiga ziyon yetkazmasdan ajratib olinadi.'
    },
    {
      step: '02',
      title: 'Kontekstual mahalliylashtirish',
      description: 'Personajlar fe‘l-atvori, davr muhiti, o‘yin terminlari va dialoglarning tabiiy jaranglashini hisobga olgan holda sinchkovlik bilan tarjima qilinadi.'
    },
    {
      step: '03',
      title: 'Terminologik lug‘at nazorati',
      description: 'Barcha o‘yinlar bo‘yicha yagona gaming lug‘ati (UI tugmalari, menyu, maxsus atamalar) qo‘llanilishi tekshiriladi.'
    },
    {
      step: '04',
      title: 'O‘yin ichida sinov (In-game QA)',
      description: 'Subtitrlar o‘yinga o‘rnatilib, timing (vaqt o‘lchami), ekranga sig‘ishi va kontekstdagi tabiiyligi real o‘yin jarayonida tekshiriladi.'
    }
  ];

  return (
    <div className="pt-28 pb-20 min-h-screen bg-[#0B0D12] text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A3E635]/10 text-[#A3E635] text-xs font-bold mb-3 border border-[#A3E635]/20">
            <Globe2 className="w-3.5 h-3.5" />
            <span>Biz haqimizda</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            O‘zbek geymerlari uchun yangi davr
          </h1>
          <p className="text-base text-gray-400 mt-4 leading-relaxed">
            Biz videoo‘yinlarni oddiy ko‘ngilochar vosita emas, balki chuqur san‘at va hikoya deb bilamiz. Har bir o‘zbek geymeri uni o‘z ona tilida his qilishga haqli.
          </p>
        </div>

        {/* Mission Statement Card */}
        <div className="bg-gradient-to-br from-[#141821] to-[#1A1F2A] rounded-3xl p-8 sm:p-12 border border-[#2A3245] mb-16 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl relative z-10 space-y-4">
            <span className="text-xs font-bold text-[#A3E635] uppercase tracking-wider">
              Bizning bosh maqsadimiz
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              O‘zbek tilida hikoyaviy o‘yinlar kutubxonasini shakllantirish
            </h2>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              Dunyodagi eng yaxshi videoo‘yinlar (A Plague Tale, The Witcher, God of War) taqdim etadigan chuqur tuyg‘ular, falsafiy savollar va shaxsiyatlar kurashini ona tilimizda ifodalash orqali mahalliy gaming madaniyatini rivojlantirishdir.
            </p>
          </div>
        </div>

        {/* Translation Pipeline */}
        <div className="mb-16">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold text-[#A3E635] uppercase tracking-wider">
              Texnologiya va Jarayon
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mt-2">
              Biz subtitrlarni qanday yaratamiz?
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 mt-2">
              Shunchaki quruq tarjima emas, balki chuqur badiiy va adabiy tahririyat mehnati.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pipelineSteps.map((step) => (
              <div
                key={step.step}
                className="bg-[#141821] rounded-2xl p-6 border border-[#2A3245] hover:border-[#A3E635]/50 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black font-mono text-[#A3E635]">
                    {step.step}
                  </span>
                  <Workflow className="w-5 h-5 text-gray-500" />
                </div>
                <h4 className="text-lg font-bold text-white">{step.title}</h4>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Independent Community Declaration */}
        <div className="bg-[#141821] rounded-2xl p-6 sm:p-8 border border-[#2A3245] mb-16 space-y-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-[#A3E635]" />
            <h3 className="text-xl font-bold text-white">Mustaqil loyiha tamoyillari</h3>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            {SITE_CONFIG.disclaimer}
          </p>
          <p className="text-xs text-gray-400">
            Biz o‘yinlarning pirat (buzilgan) nusxalarini tarqatmaymiz. O‘zbek geymerlarini doimo rasmiy litsenziyalangan nusxalarni xarid qilish orqali o‘yin yaratuvchilarini qo‘llab-quvvatlashga chaqiramiz.
          </p>
        </div>

        {/* CTA Banner */}
        <div className="text-center p-8 rounded-3xl bg-gradient-to-r from-[#1A1F2A] via-[#141821] to-[#1A1F2A] border border-[#A3E635]/40 space-y-6">
          <h3 className="text-2xl font-black text-white">
            Loyihamizga hissa qo‘shishni istaysizmi?
          </h3>
          <p className="text-sm text-gray-300 max-w-lg mx-auto">
            G‘oyalar, tarjimalar, testlash yoki takliflar bilan qatnashish uchun Telegram kanalimizga qo‘shiling!
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href={SITE_CONFIG.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Telegram guruhimizga o‘tish</span>
            </a>
            <button
              onClick={() => setIsSuggestModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1A1F2A] hover:bg-[#222938] text-white border border-[#2A3245] hover:border-[#A3E635] text-sm font-semibold transition-all"
            >
              <Sparkles className="w-4 h-4 text-[#A3E635]" />
              <span>O‘yin taklif qilish</span>
            </button>
          </div>
        </div>
      </div>

      {isSuggestModalOpen && (
        <React.Suspense fallback={null}>
          <SuggestGameModal
            isOpen={isSuggestModalOpen}
            onClose={() => setIsSuggestModalOpen(false)}
          />
        </React.Suspense>
      )}
    </div>
  );
};
