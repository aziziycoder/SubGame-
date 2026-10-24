import React from 'react';
import { Link } from 'react-router-dom';
import {
  Download,
  ShieldCheck,
  Zap,
  Cpu,
  AlertTriangle,
  Sparkles,
  Monitor,
  FolderCheck,
  Gamepad2,
  ArrowRight,
  Send,
  LifeBuoy
} from 'lucide-react';
import { FaqSection } from '../components/home/FaqSection';

export const LauncherPage: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Launcherni yuklab oling',
      description:
        'Quyidagi tugma orqali rasmiy «SubGame-Launcher.exe» dasturini shaxsiy kompyuteringizga yuklab oling. Dastur portativ (portable) bo‘lib, hech qanday o‘rnatishni talab qilmaydi.',
      icon: Download,
      tip: 'Hajmi ~95 MB, portativ dastur.'
    },
    {
      step: '02',
      title: 'Dasturni ishga tushiring',
      description:
        'Yuklab olingan faylni ikki marta bosing. Agar Windows SmartScreen «Himoyalanmagan dastur» deb ogohlantirsa, «Подробнее (More info)» havolasini bosing va «Выполнить в любом случае (Run anyway)»ni tanlang.',
      icon: AlertTriangle,
      tip: 'Dastur 100% toza va xavfsiz.'
    },
    {
      step: '03',
      title: 'O‘yin ijro faylini (.exe) tanlang',
      description:
        'Launcherdagi katalogdan kerakli o‘yinni oching va kompyuteringizdagi o‘yin papkasidagi asosiy ijro faylini (.exe) bir marta ko‘rsatib bering.',
      icon: FolderCheck,
      tip: 'Steam, Epic Games yoki kompyuteringizdagi o‘yin papkasi.'
    },
    {
      step: '04',
      title: '1-bosishda o‘zbekcha o‘ynang',
      description:
        '«O‘yinni boshlash» tugmasini bosing. Subtitrlar avtomatik ulanadi, o‘yin ishga tushadi va siz o‘zbek tilidagi to‘liq kontentdan bahramand bo‘lasiz.',
      icon: Gamepad2,
      tip: 'O‘yin yakunlangach, fayllar toza saqlanadi.'
    }
  ];

  return (
    <div className="pt-28 pb-20 min-h-screen bg-[#0B0D12] text-[#F5F7FA]">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-96 bg-gradient-to-b from-[#A3E635]/10 via-[#38BDF8]/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#A3E635]/15 border border-[#A3E635]/40 text-[#A3E635] text-xs font-semibold mb-6 shadow-sm">
            <Sparkles className="w-4 h-4" />
            <span>Rasmiy Windows Dasturi • Versiya 1.0.0</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-6">
            O‘zbekcha o‘yinlarni boshqarish uchun <span className="text-[#A3E635]">SubGame Launcher</span>
          </h1>

          <p className="text-base sm:text-lg text-gray-300 leading-relaxed mb-8">
            Subtitr fayllarini qo‘lda ko‘chirib yurishga chek qo‘ying! Rasmiy Launcher orqali o‘zbekcha tarjimalarni 1 bosishda o‘rnating, litsenziyalarni boshqaring va o‘yinlarni to‘g‘ridan-to‘g‘ri ishga tushiring.
          </p>

          {/* Download Action */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <a
              href="/downloads/SubGame-Launcher.exe"
              download="SubGame-Launcher.exe"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-[#A3E635] text-[#0B0D12] hover:bg-[#84CC16] font-extrabold text-base shadow-lg shadow-[#A3E635]/25 hover:scale-105 transition-all"
            >
              <Download className="w-5 h-5" />
              <span>Launcherni yuklab olish (.exe)</span>
            </a>
            <Link
              to="/games"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-[#141821] text-gray-200 hover:text-white border border-[#2A3245] hover:border-gray-500 font-bold text-sm transition-all"
            >
              <span>O‘yinlar katalogi</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Technical Specs Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#141821] border border-[#2A3245]">
              <Monitor className="w-3.5 h-3.5 text-[#A3E635]" />
              Windows 10 / 11 (64-bit)
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#141821] border border-[#2A3245]">
              <Cpu className="w-3.5 h-3.5 text-sky-400" />
              Hajmi: ~95 MB (Portativ)
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#141821] border border-[#2A3245]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              100% Xavfsiz & Toza
            </span>
          </div>
        </div>

        {/* 4 Steps Guide */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
              Qanday ishlatiladi? (4 oddiy qadam)
            </h2>
            <p className="text-sm text-gray-400">
              Hech qanday murakkab sozlamalarsiz o‘yinni 1 daqiqada ishga tushiring
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {steps.map((st) => {
              const Icon = st.icon;
              return (
                <div
                  key={st.step}
                  className="p-6 sm:p-7 rounded-2xl bg-[#141821] border border-[#2A3245] flex flex-col justify-between hover:border-[#A3E635]/50 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-[#1A1F2A] border border-[#2A3245] text-[#A3E635] flex items-center justify-center shadow-inner">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-3xl font-black font-mono text-gray-700 select-none">
                        {st.step}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2">
                      {st.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-4">
                      {st.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#2A3245]/60 text-xs text-gray-400 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#A3E635]" />
                    <span>{st.tip}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SmartScreen Alert Note */}
        <div className="mb-20 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1.5 text-xs sm:text-sm text-gray-300">
            <strong className="text-amber-300 block text-base font-bold">
              Windows SmartScreen «Himoyalanmagan dastur» deb chiqarsa nima qilish kerak?
            </strong>
            <p className="leading-relaxed">
              SubGame mustaqil loyiha bo‘lib, xorijiy qimmatbaho korporativ sertifikatga ega emas. Shu sababli Windows yangi yuklab olingan dasturni ilk bor ochganda xavfsizlik ogohlantirishini ko‘rsatadi.
            </p>
            <p className="leading-relaxed font-semibold text-white">
              Yechim: Oynadagi <span className="text-[#A3E635]">«Подробнее (More info)»</span> yozuvini bosing, so‘ngra pastda chiqqan <span className="text-[#A3E635]">«Выполнить в любом случае (Run anyway)»</span> tugmasini bosing. Dastur mutlaqo toza va xavfsiz.
            </p>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
              Nega aynan Launcher orqali o‘ynash kerak?
            </h2>
            <p className="text-sm text-gray-400">
              Oddiy arxiv fayllaridan farqli o‘laroq, Launcher sizga to‘liq qulaylik va xavfsizlik beradi
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#141821] border border-[#2A3245] hover:border-[#A3E635]/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#A3E635]/15 border border-[#A3E635]/30 flex items-center justify-center text-[#A3E635] mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">1 Bosishda O‘rnatish</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                O‘yin papkalarini qidirib, fayllarni almashtirib o‘tirmaysiz. Dasturda o‘yin faylini bir marta tanlaysiz va har safar 1 ta tugma bilan o‘zbekcha o‘ynaysiz.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#141821] border border-[#2A3245] hover:border-[#A3E635]/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#38BDF8]/15 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8] mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">1 Qurilma = 1 Litsenziya</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Har bir litsenziya kaliti faqat sizning kompyuteringiz apparatiga (HWID) biriktiriladi. Subtitrlar AES-256 bilan shifrlangan bo‘lib, xavfsiz ishlaydi.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#141821] border border-[#2A3245] hover:border-[#A3E635]/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#A855F7]/15 border border-[#A855F7]/30 flex items-center justify-center text-[#A855F7] mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Toza O‘chirish & Xavfsizlik</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                O‘yin yakunlangach, barcha vaqtinchalik tarjima fayllari toza saqlanadi. Asl o‘yin fayllari hech qachon shikastlanmaydi yoki buzilmaydi.
              </p>
            </div>
          </div>
        </div>

        {/* Need Help CTA */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-[#141821] via-[#1A1F2A] to-[#141821] border border-[#A3E635]/40 text-center space-y-4 shadow-xl mb-20">
          <div className="w-12 h-12 rounded-2xl bg-[#A3E635]/15 border border-[#A3E635]/30 text-[#A3E635] flex items-center justify-center mx-auto">
            <LifeBuoy className="w-6 h-6" />
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white">
            Savollaringiz bormi yoki yordam kerakmi?
          </h3>
          <p className="text-xs sm:text-sm text-gray-300 max-w-lg mx-auto leading-relaxed">
            Agar Launcherni ishlatishda biror qiyinchilikka duch kelsangiz, rasmiy Telegram guruhimizga yozing, doimo yordam beramiz.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://t.me/subgame_uz"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#A3E635] text-[#0B0D12] font-extrabold text-sm hover:bg-[#84CC16] transition-all hover:scale-105 shadow-md shadow-[#A3E635]/20"
            >
              <Send className="w-4 h-4" />
              <span>Telegramda yordam olish</span>
            </a>
            <Link
              to="/games"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#141821] text-white border border-[#2A3245] hover:border-gray-500 font-bold text-sm transition-all"
            >
              <span>Katalogga o‘tish</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* FAQ Section */}
        <div>
          <FaqSection />
        </div>
      </div>
    </div>
  );
};
