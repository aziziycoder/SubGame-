import React from 'react';
import {
  Download,
  ShieldCheck,
  Zap,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Play,
  KeyRound,
  Sparkles,
  Monitor
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const LauncherPage: React.FC = () => {

  return (
    <div className="pt-24 pb-20 min-h-screen bg-[#0B0D12] text-[#F5F7FA]">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-96 bg-gradient-to-b from-[#A3E635]/10 via-[#38BDF8]/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8">
          <Link to="/" className="hover:text-white transition-colors">Bosh sahifa</Link>
          <span>/</span>
          <span className="text-[#A3E635] font-semibold">SubGame Launcher</span>
        </nav>

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

          {/* Download & Launch Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <a
              href="/downloads/SubGame-Launcher.exe"
              download="SubGame-Launcher.exe"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-[#A3E635] text-[#0B0D12] hover:bg-[#84CC16] font-extrabold text-base shadow-lg shadow-[#A3E635]/25 hover:scale-105 transition-all"
            >
              <Download className="w-5 h-5" />
              <span>Launcherni yuklab olish (.exe)</span>
            </a>

            <a
              href="subgame://open"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-[#141821] hover:bg-[#1A1F2A] text-gray-200 border border-[#2A3245] hover:border-[#A3E635]/50 font-bold text-sm transition-all"
            >
              <Play className="w-4 h-4 text-[#A3E635] fill-current" />
              <span>Launcherni ochish (Kompyuterda)</span>
            </a>
          </div>

          {/* Technical Specs Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#141821] border border-[#2A3245]">
              <Monitor className="w-3.5 h-3.5 text-[#A3E635]" />
              Windows 10 / 11 (64-bit)
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#141821] border border-[#2A3245]">
              <Cpu className="w-3.5 h-3.5 text-sky-400" />
              Hajmi: ~86 MB (Portativ)
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#141821] border border-[#2A3245]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              100% Xavfsiz & Toza
            </span>
          </div>
        </div>

        {/* UI Mockup Card Preview */}
        <div className="relative rounded-2xl border border-[#2A3245] bg-[#141821] p-3 sm:p-5 shadow-2xl shadow-black/80 mb-20 overflow-hidden">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#2A3245] text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 font-mono text-gray-300 font-semibold">SubGame Launcher v1.0.0</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px] text-[#A3E635] bg-[#0B0D12] px-2.5 py-0.5 rounded border border-[#A3E635]/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>HWID Himoya Faol</span>
            </div>
          </div>

          {/* Mockup UI layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#1A1F2A] border border-[#2A3245] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="px-2 py-0.5 rounded bg-[#A3E635]/20 text-[#A3E635] text-[10px] font-bold">TAYYOR</span>
                  <span className="text-gray-400 font-mono text-[11px]">v1.0.2</span>
                </div>
                <h4 className="font-bold text-white text-sm mb-1">A Plague Tale: Requiem</h4>
                <p className="text-xs text-gray-400 line-clamp-2">Amitsiya va Gyugoning vabo epidemiyasidagi afsonaviy sarguzashti.</p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#2A3245] flex items-center justify-between">
                <span className="text-[11px] text-gray-400">1.9 MB</span>
                <span className="px-3 py-1 rounded-lg bg-[#A3E635] text-[#0B0D12] text-xs font-extrabold flex items-center gap-1">
                  <Play className="w-3 h-3 fill-current" /> O‘ynash
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#1A1F2A] border border-[#2A3245] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="px-2 py-0.5 rounded bg-[#A3E635]/20 text-[#A3E635] text-[10px] font-bold">TAYYOR</span>
                  <span className="text-gray-400 font-mono text-[11px]">v1.0.1</span>
                </div>
                <h4 className="font-bold text-white text-sm mb-1">A Plague Tale: Innocence</h4>
                <p className="text-xs text-gray-400 line-clamp-2">1349-yil Fransiya. Inkvizitsiya ta‘qibidan omon qolish kurashi.</p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#2A3245] flex items-center justify-between">
                <span className="text-[11px] text-gray-400">1.1 MB</span>
                <span className="px-3 py-1 rounded-lg bg-[#A3E635] text-[#0B0D12] text-xs font-extrabold flex items-center gap-1">
                  <Play className="w-3 h-3 fill-current" /> O‘ynash
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#1A1F2A] border border-[#2A3245] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 text-[10px] font-bold">JARAYONDA</span>
                  <span className="text-gray-400 font-mono text-[11px]">2026</span>
                </div>
                <h4 className="font-bold text-white text-sm mb-1">Outward 2</h4>
                <p className="text-xs text-gray-400 line-clamp-2">Realistik omon qolish va sehrli ochiq dunyo sarguzashti.</p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#2A3245] flex items-center justify-between">
                <span className="text-[11px] text-gray-400">Kutilmoqda</span>
                <span className="px-3 py-1 rounded-lg bg-[#141821] text-gray-500 text-xs font-semibold">
                  Jarayonda
                </span>
              </div>
            </div>
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
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Toza O‘chirish & Xavfsizlik</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                O‘yin yakunlangach, barcha vaqtinchalik tarjima fayllari toza saqlanadi. Asl o‘yin fayllari hech qachon shikastlanmaydi yoki buzilmaydi.
              </p>
            </div>
          </div>
        </div>

        {/* 3 Step Guide */}
        <div className="p-8 rounded-3xl bg-[#141821] border border-[#2A3245] mb-20">
          <h2 className="text-2xl font-extrabold text-white text-center mb-8">
            Launcherni ishlatish bo‘yicha 3 oddiy qadam
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-10 h-10 rounded-full bg-[#A3E635] text-[#0B0D12] font-extrabold flex items-center justify-center text-base mb-3 shadow-sm">
                1
              </div>
              <h4 className="font-bold text-white text-sm mb-1">Launcherni yuklab oling</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Yuqoridagi tugma orqali <code className="text-[#A3E635]">.exe</code> faylini yuklab oling. O‘rnatish shart emas, ikki marta bosib to‘g‘ridan-to‘g‘ri ochiladi.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="w-10 h-10 rounded-full bg-[#A3E635] text-[#0B0D12] font-extrabold flex items-center justify-center text-base mb-3 shadow-sm">
                2
              </div>
              <h4 className="font-bold text-white text-sm mb-1">O‘yin faylini tanlang</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Steam, Epic Games yoki kompyuteringizdagi o‘yin papkasidagi asosiy <code className="text-[#A3E635]">.exe</code> faylini ko‘rsating.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="w-10 h-10 rounded-full bg-[#A3E635] text-[#0B0D12] font-extrabold flex items-center justify-center text-base mb-3 shadow-sm">
                3
              </div>
              <h4 className="font-bold text-white text-sm mb-1">Kalitni kiriting & O‘ynang</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Olingan litsenziya kalitini kiriting va «O‘yinni boshlash»ni bosing. Subtitrlar avtomatik ulanadi!
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Accordion / Notices */}
        <div className="max-w-3xl mx-auto space-y-4">
          <h3 className="text-xl font-bold text-white mb-4 text-center">
            Ko‘p beriladigan savollar
          </h3>

          <div className="p-4 rounded-xl bg-[#141821] border border-[#2A3245] space-y-1.5">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              Windows SmartScreen «Himoyalanmagan dastur» deb chiqarsa nima qilish kerak?
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              SubGame mustaqil loyiha bo‘lib, hozircha qimmat xorijiy sertifikatga ega emas. Shuning uchun Windows birinchi marta ochganda ogohlantirishi mumkin. Oynadagi <strong className="text-white">«Подробнее (More info)»</strong> tugmasini bosing va <strong className="text-[#A3E635]">«Выполнить в любом случае (Run anyway)»</strong> ni tanlang. Dastur 100% toza va xavfsiz.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#141821] border border-[#2A3245] space-y-1.5">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#A3E635] shrink-0" />
              Litsenziya kalitini qanday olaman?
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Litsenziya kalitlari bizning rasmiy Telegram botimiz yoki saytdagi buyurtma orqali taqdim etiladi. Bir martalik to‘lov bilan o‘yin sizning shaxsiy kompyuteringizga abadiy biriktiriladi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
