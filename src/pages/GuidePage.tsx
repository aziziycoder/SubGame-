import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Download,
  Zap,
  Monitor,
  Cpu,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  FolderCheck,
  Gamepad2,
  Send,
  LifeBuoy
} from 'lucide-react';
import { FaqSection } from '../components/home/FaqSection';

export const GuidePage: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Launcherni yuklab oling',
      description:
        'Saytdan rasmiy «SubGame-Launcher.exe» faylini shaxsiy kompyuteringizga yuklab oling. Dastur portativ (portable) bo‘lib, murakkab o‘rnatishni talab qilmaydi.',
      icon: Download,
      color: 'lime',
      tip: 'Hajmi ~95 MB, to‘g‘ridan-to‘g‘ri yuklanadi.'
    },
    {
      step: '02',
      title: 'Dasturni ishga tushiring',
      description:
        'Yuklab olingan faylni ikki marta bosing. Agar Windows SmartScreen «Himoyalanmagan dastur» deb ogohlantirsa, «Подробнее (More info)» havolasini bosib, «Выполнить в любом случае (Run anyway)»ni tanlang.',
      icon: AlertTriangle,
      color: 'amber',
      tip: 'Dastur 100% toza, hech qanday virus yoki zararli kod yo‘q.'
    },
    {
      step: '03',
      title: 'O‘yin ijro faylini (.exe) tanlang',
      description:
        'Launcherdagi o‘yinlar ro‘yxatidan kerakli o‘yinni oching va kompyuteringizdagi o‘yin joylashgan papkadagi asosiy .exe faylini bir marta ko‘rsatib bering.',
      icon: FolderCheck,
      color: 'sky',
      tip: 'Steam, Epic Games yoki kompyuteringizdagi istalgan papka mos keladi.'
    },
    {
      step: '04',
      title: '1-bosishda o‘zbekcha o‘ynang',
      description:
        '«O‘yinni boshlash» tugmasini bosing. Subtitrlar avtomatik ulanadi, o‘yin ishga tushadi va siz o‘zbek tilidagi to‘liq kontentdan bahramand bo‘lasiz.',
      icon: Gamepad2,
      color: 'emerald',
      tip: 'O‘yin yakunlangach, barcha fayllar toza saqlanadi.'
    }
  ];

  return (
    <div className="pt-28 pb-20 min-h-screen bg-[#0B0D12] text-[#F5F7FA]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#A3E635]/15 text-[#A3E635] text-xs font-bold mb-4 border border-[#A3E635]/30">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Qo‘llanma va Yo‘riqnoma</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            SubGame Launcherni yuklab olish va ishlatish
          </h1>
          <p className="text-sm sm:text-base text-gray-300 mt-4 leading-relaxed">
            O‘yinlarga o‘zbekcha subtitrlarni qo‘lda fayllarni almashtirib o‘tirmasdan, rasmiy <span className="text-[#A3E635] font-semibold">SubGame Launcher</span> orqali 1 bosishda o‘rnating va xavfsiz o‘ynang.
          </p>
        </div>

        {/* Spotlight Download Card */}
        <div className="relative overflow-hidden p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-[#141821] via-[#1A1F2A] to-[#141821] border border-[#A3E635]/30 shadow-2xl mb-14">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#A3E635]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#A3E635]/20 text-[#A3E635] text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Rasmiy Windows Dasturi • Portativ (Installer shart emas)</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                SubGame Launcher v1.0.0
              </h2>
              <p className="text-sm text-gray-300 max-w-xl leading-relaxed">
                Barcha o‘zbekcha tarjimalarni markazlashgan holda boshqaring, litsenziyalarni faollashtiring va o‘yinlarni xavfsiz ishga tushiring.
              </p>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2 text-xs text-gray-400">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#0B0D12] border border-[#2A3245]">
                  <Monitor className="w-3.5 h-3.5 text-[#A3E635]" />
                  Windows 10 / 11 (64-bit)
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#0B0D12] border border-[#2A3245]">
                  <Cpu className="w-3.5 h-3.5 text-sky-400" />
                  Hajmi: ~95 MB
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#0B0D12] border border-[#2A3245]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  100% Xavfsiz & Toza
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto">
              <a
                href="/downloads/SubGame-Launcher.exe"
                download="SubGame-Launcher.exe"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-[#A3E635] text-[#0B0D12] hover:bg-[#84CC16] font-extrabold text-base shadow-lg shadow-[#A3E635]/25 hover:scale-105 transition-all"
              >
                <Download className="w-5 h-5" />
                <span>Launcherni yuklab olish (.exe)</span>
              </a>
              <Link
                to="/launcher"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#141821] text-gray-200 hover:text-white border border-[#2A3245] hover:border-gray-500 font-bold text-sm transition-all"
              >
                <span>Launcher haqida to‘liq ma’lumot</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* 4 Steps Guide */}
        <div className="mb-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
              Launcherdan foydalanish tartibi
            </h2>
            <p className="text-sm text-gray-400">
              Quyidagi 4 ta oddiy qadam bilan o‘yinni ishga tushiring
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {steps.map((st) => {
              const Icon = st.icon;
              return (
                <div
                  key={st.step}
                  className="p-6 sm:p-7 rounded-2xl bg-[#141821] border border-[#2A3245] flex flex-col justify-between hover:border-gray-600 transition-colors"
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
        <div className="mb-16 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-4">
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

        {/* Why Launcher Highlights */}
        <div className="p-8 rounded-3xl bg-[#141821] border border-[#2A3245] mb-16">
          <h3 className="text-xl font-bold text-white text-center mb-6">
            Nega aynan Launcher orqali o‘ynash kerak?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="p-4 rounded-xl bg-[#0B0D12] border border-[#2A3245]">
              <Zap className="w-6 h-6 text-[#A3E635] mx-auto mb-2" />
              <h4 className="font-bold text-white text-sm mb-1">1 Bosishda Ulanadi</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Papkalar ichida fayl almashtirib o‘tirmaysiz, hamma ish avtomatlashgan.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#0B0D12] border border-[#2A3245]">
              <ShieldCheck className="w-6 h-6 text-sky-400 mx-auto mb-2" />
              <h4 className="font-bold text-white text-sm mb-1">Asl Fayllar Butun</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                O‘yinning asl fayllari shikastlanmaydi va o‘yin toza holatda saqlanadi.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#0B0D12] border border-[#2A3245]">
              <Sparkles className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              <h4 className="font-bold text-white text-sm mb-1">Yangilanishlarga Mos</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                O‘yinga yangilanish kelsa ham lokalizatsiyani osonlik bilan qayta ishga tushirasiz.
              </p>
            </div>
          </div>
        </div>

        {/* Need Help CTA */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-[#141821] via-[#1A1F2A] to-[#141821] border border-[#A3E635]/40 text-center space-y-4 shadow-xl mb-16">
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
