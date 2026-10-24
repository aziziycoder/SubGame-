import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  FolderCheck,
  ShieldAlert,
  ShieldCheck,
  Copy,
  Check,
  Download,
  Zap,
  Monitor,
  KeyRound,
  AlertTriangle,
  ArrowRight,
  Settings,
  Sparkles,
  CheckCircle2,
  Send,
  LifeBuoy
} from 'lucide-react';
import { FaqSection } from '../components/home/FaqSection';

export const GuidePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'launcher' | 'manual' | 'license' | 'troubleshoot'>('launcher');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyPath = (path: string, index: number) => {
    navigator.clipboard.writeText(path);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const platforms = [
    {
      name: 'Steam',
      badge: 'Eng mashhur',
      defaultPath: 'C:\\Program Files (x86)\\Steam\\steamapps\\common\\<O‘yin_nomi>\\',
      steps: [
        'Steam ilovasini oching va "Kutubxona (Library)" bo‘limiga kiring.',
        'O‘yin ustiga sichqonchaning o‘ng tugmasini bosing va "Boshqarish (Manage)" -> "Lokal fayllarni ko‘rish (Browse local files)" bandini tanlang.',
        'Ochilgan papkaga yuklab olingan o‘zbekcha subtitr arxivining ichidagi fayllarni ko‘chirib o‘tkazing.',
        'Fayllarni almashtirish (Replace files in the destination) so‘ralsa, "Ha" deb tasdiqlang.',
        'O‘yinni ishga tushiring va Sozlamalar -> Audio / Til -> Subtitrlar bo‘limidan subtitrni yoqing.'
      ]
    },
    {
      name: 'Epic Games Store',
      badge: 'Rasmiy do‘kon',
      defaultPath: 'C:\\Program Files\\Epic Games\\<O‘yin_nomi>\\',
      steps: [
        'Epic Games Launcher dasturiga kiring va "Kutubxona (Library)" bo‘limini oching.',
        'O‘yin kartasining pastki burchagidagi uch nuqta (...) belgisini bosing va "Boshqarish (Manage)"ni tanlang.',
        '"O‘rnatish (Installation)" qatoridagi papka belgisini bosing. O‘yin joylashgan asosiy papka ochiladi.',
        'Subtitr arxivining ichidagi fayllarni o‘yinning tegishli (masalan, Content yoki Paks) papkasiga joylashtiring.',
        'O‘yinni ochib, sozlamalardan subtitrlar faollashtirilganini tekshiring.'
      ]
    },
    {
      name: 'GOG Galaxy & DRM-Free / Repack',
      badge: 'Boshqa platformalar',
      defaultPath: 'C:\\Games\\<O‘yin_nomi>\\',
      steps: [
        'O‘yin o‘rnatilgan asosiy jildga kiring (GOG Galaxy bo‘lsa: Sozlamalar -> Fayllarni boshqarish -> Papkani ko‘rsatish).',
        'Yuklab olingan arxiv ichidagi barcha fayllarni o‘yin ildiz papkasiga nusxalang.',
        'Kerak bo‘lsa mavjud fayllarni almashtirishga ruxsat bering.',
        'O‘yinni ochib, ona tilingizdagi tarjimadan bahramand bo‘ling.'
      ]
    }
  ];

  const troubleshootList = [
    {
      title: 'Windows SmartScreen «Himoyalanmagan dastur» deb chiqarsa',
      cause: 'Mustaqil dasturiy ta’minotlarda qimmat korporativ sertifikat bo‘lmagani sababli Windows xavfsizlik filtri dastlabki ochilishda ogohlantirish beradi.',
      solution: 'Oynadagi «Подробнее (More info)» havolasini bosing, so‘ngra pastda paydo bo‘lgan «Выполнить в любом случае (Run anyway)» tugmasini bosing. Dastur mutlaqo toza va xavfsiz.',
      icon: AlertTriangle,
      color: 'amber'
    },
    {
      title: 'Subtitrlar o‘yin ichida ko‘rinmayapti',
      cause: 'Ko‘p o‘yinlarda standart holatda subtitrlar o‘chiq bo‘ladi yoki noto‘g‘ri til tanlangan bo‘ladi.',
      solution: 'O‘yin ichidagi Sozlamalar (Settings) -> Ovoz/Audio yoki Displey (Display) bo‘limiga kiring. "Subtitrlar (Subtitles)" bandini "Yoqilgan (ON)" holatiga o‘tkazing.',
      icon: Settings,
      color: 'sky'
    },
    {
      title: 'O‘yinga yangilanish (patch / update) kelgach subtitr o‘chib ketdi',
      cause: 'Steam yoki Epic Games o‘yinni yangilaganda asl o‘yin fayllarini qayta yuklab oladi va o‘zgartirilgan fayllarni tiklaydi.',
      solution: 'SubGame Launcherdan foydalanayotgan bo‘lsangiz, shunchaki dasturni ochib qayta "O‘ynash" tugmasini bosing. Qo‘lda o‘rnatgan bo‘lsangiz, subtitr arxivini yana bir bor o‘yin papkasiga ko‘chirib qo‘ying.',
      icon: Sparkles,
      color: 'lime'
    },
    {
      title: 'Launcherda o‘yin ijro faylini (.exe) qanday to‘g‘ri tanlash kerak?',
      cause: 'Ba’zi o‘yinlarda bir nechta .exe fayl (masalan crash reporter yoki launcher) bo‘lishi mumkin.',
      solution: 'Har doim o‘yinning asosiy jildidagi (odatda binaries/win64 yoki asosiy papkada) eng katta hajmli asosiy o‘yin .exe faylini tanlang (masalan, APlagueTaleRequiem_x64.exe).',
      icon: FolderCheck,
      color: 'purple'
    }
  ];

  return (
    <div className="pt-28 pb-20 min-h-screen bg-[#0B0D12] text-[#F5F7FA]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#A3E635]/15 text-[#A3E635] text-xs font-bold mb-4 border border-[#A3E635]/30">
            <BookOpen className="w-3.5 h-3.5" />
            <span>To‘liq Qo‘llanma va Yo‘riqnoma</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Subtitrlarni o‘rnatish va sozlash
          </h1>
          <p className="text-sm sm:text-base text-gray-300 mt-4 leading-relaxed">
            Sevimli videoo‘yinlaringizni ona tilingizda o‘ynash uchun eng qulay usulni tanlang: rasmiy <span className="text-[#A3E635] font-semibold">SubGame Launcher</span> orqali 1 bosishda yoki do‘konlar bo‘yicha qo‘lda o‘rnatish.
          </p>
        </div>

        {/* Interactive Tab Switcher */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12 p-1.5 bg-[#141821] rounded-2xl border border-[#2A3245] max-w-3xl mx-auto">
          <button
            onClick={() => setActiveTab('launcher')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 ${
              activeTab === 'launcher'
                ? 'bg-[#A3E635] text-[#0B0D12] shadow-md shadow-[#A3E635]/20'
                : 'text-gray-300 hover:text-white hover:bg-[#1A1F2A]'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Launcher orqali (Tavsiya)</span>
          </button>

          <button
            onClick={() => setActiveTab('manual')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 ${
              activeTab === 'manual'
                ? 'bg-[#A3E635] text-[#0B0D12] shadow-md shadow-[#A3E635]/20'
                : 'text-gray-300 hover:text-white hover:bg-[#1A1F2A]'
            }`}
          >
            <FolderCheck className="w-4 h-4" />
            <span>Qo‘lda (Manual) o‘rnatish</span>
          </button>

          <button
            onClick={() => setActiveTab('license')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 ${
              activeTab === 'license'
                ? 'bg-[#A3E635] text-[#0B0D12] shadow-md shadow-[#A3E635]/20'
                : 'text-gray-300 hover:text-white hover:bg-[#1A1F2A]'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Litsenziya va To‘lov</span>
          </button>

          <button
            onClick={() => setActiveTab('troubleshoot')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 ${
              activeTab === 'troubleshoot'
                ? 'bg-[#A3E635] text-[#0B0D12] shadow-md shadow-[#A3E635]/20'
                : 'text-gray-300 hover:text-white hover:bg-[#1A1F2A]'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Muammolar va Yechimlar</span>
          </button>
        </div>

        {/* TAB 1: LAUNCHER GUIDE (RECOMMENDED) */}
        {activeTab === 'launcher' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Spotlight Banner */}
            <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#141821] via-[#1A1F2A] to-[#141821] border border-[#A3E635]/30 shadow-xl">
              <div className="absolute top-0 right-0 w-72 h-72 bg-[#A3E635]/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#A3E635]/20 text-[#A3E635] text-xs font-bold mb-3">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Eng tez va qulay usul</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
                    SubGame Launcher orqali avtomatik o‘rnatish
                  </h2>
                  <p className="text-sm text-gray-300 max-w-xl leading-relaxed">
                    Arxivlarni titkilash, papkalarni qidirish va fayllarni almashtirish shart emas. Rasmiy launcher o‘zbekcha subtitrlarni o‘yin bilan avtomatik bog‘laydi va asl fayllarni buzmasdan saqlaydi.
                  </p>
                </div>
                
                <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto">
                  <a
                    href="/downloads/SubGame-Launcher.exe"
                    download="SubGame-Launcher.exe"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#A3E635] text-[#0B0D12] hover:bg-[#84CC16] font-extrabold text-sm shadow-lg shadow-[#A3E635]/20 transition-all hover:scale-105"
                  >
                    <Download className="w-4 h-4" />
                    <span>Launcherni yuklab olish (.exe)</span>
                  </a>
                  <Link
                    to="/launcher"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#141821] text-gray-200 hover:text-white border border-[#2A3245] hover:border-gray-500 font-bold text-sm transition-all"
                  >
                    <span>Launcher haqida batafsil</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Launcher 3 Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-[#141821] border border-[#2A3245] flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#A3E635]/15 border border-[#A3E635]/30 text-[#A3E635] flex items-center justify-center font-black text-xl mb-4">
                    1
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Launcherni ishga tushiring</h3>
                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                    Yuklab olingan <code className="text-[#A3E635]">SubGame-Launcher.exe</code> faylini ikki marta bosing. Dastur portativ bo‘lib, o‘rnatishni talab qilmaydi.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#2A3245]/60 flex items-center gap-2 text-xs text-gray-400">
                  <Monitor className="w-4 h-4 text-sky-400" />
                  <span>Windows 10 / 11 (64-bit)</span>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#141821] border border-[#2A3245] flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#38BDF8]/15 border border-[#38BDF8]/30 text-[#38BDF8] flex items-center justify-center font-black text-xl mb-4">
                    2
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">O‘yin ijro faylini tanlang</h3>
                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                    Launcherda kerakli o‘yin kartasidagi "O‘ynash" tugmasini bosing va kompyuteringizdagi asosiy o‘yin faylini (<code className="text-[#38BDF8]">.exe</code>) bir marta ko‘rsating.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#2A3245]/60 flex items-center gap-2 text-xs text-gray-400">
                  <FolderCheck className="w-4 h-4 text-[#A3E635]" />
                  <span>Steam, Epic yoki DRM-Free</span>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#141821] border border-[#2A3245] flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#A855F7]/15 border border-[#A855F7]/30 text-[#A855F7] flex items-center justify-center font-black text-xl mb-4">
                    3
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">1 Bosishda o‘ynang</h3>
                  <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                    Agar o‘yin pullik bo‘lsa, litsenziya kalitini kiriting (bepul o‘yinlarda to‘g‘ridan-to‘g‘ri ishga tushadi). Tarjimalar avtomatik yuklanadi va o‘yin o‘zbekcha ochiladi!
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#2A3245]/60 flex items-center gap-2 text-xs text-gray-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Xavfsiz va toza integratsiya</span>
                </div>
              </div>
            </div>

            {/* SmartScreen Alert Banner */}
            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-4">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                <strong className="text-amber-300 block font-semibold mb-1">
                  Windows SmartScreen ogohlantirishi chiqdimi?
                </strong>
                SubGame mustaqil loyiha bo‘lgani sababli Windows dasturni ilk bor ochganda «Himoyalanmagan dastur» deb ko‘rsatishi mumkin. Bunday holda oynadagi <span className="text-white font-bold">«Подробнее (More info)»</span> yozuvini bosing, so‘ngra paydo bo‘lgan <span className="text-[#A3E635] font-bold">«Выполнить в любом случае (Run anyway)»</span> tugmasini bosing. Dastur 100% toza va xavfsiz.
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MANUAL INSTALLATION GUIDE */}
        {activeTab === 'manual' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* 3 Golden Rules Alert */}
            <div className="p-6 rounded-2xl bg-[#141821] border border-[#2A3245] flex items-start gap-4">
              <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0 mt-1" />
              <div className="space-y-2 text-xs sm:text-sm text-gray-300">
                <strong className="text-amber-300 block text-base font-bold">
                  Qo‘lda o‘rnatishdan oldin 3 ta oltin qoida:
                </strong>
                <ul className="list-disc list-inside space-y-1.5 text-gray-300">
                  <li>
                    <strong className="text-white">Zaxira nusxa (Backup):</strong> O‘zgartirayotgan asl o‘yin fayllaringiz yoki papkalar nusxasini alohida xavfsiz joyda saqlab qo‘ying.
                  </li>
                  <li>
                    <strong className="text-white">O‘yin versiyasi:</strong> O‘yiningiz so‘nggi versiyaga yangilanganligiga va subtitr bilan versiya mosligiga ishonch hosil qiling.
                  </li>
                  <li>
                    <strong className="text-white">To‘g‘ri papka strukturasi:</strong> Arxiv ichidagi fayllar o‘yinning asosiy ildiziga (root directory) yoki maxsus ko‘rsatilgan jildga to‘g‘ri nusxalanishi lozim.
                  </li>
                </ul>
              </div>
            </div>

            {/* Platform Guides */}
            <div className="grid grid-cols-1 gap-6">
              {platforms.map((plat, idx) => (
                <div
                  key={plat.name}
                  className="bg-[#141821] rounded-2xl p-6 sm:p-8 border border-[#2A3245] hover:border-gray-600 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <FolderCheck className="w-5 h-5 text-[#A3E635]" />
                      <span>{plat.name}</span>
                    </h3>
                    <span className="text-xs text-[#A3E635] bg-[#A3E635]/10 px-2.5 py-1 rounded-md border border-[#A3E635]/20 font-semibold">
                      {plat.badge}
                    </span>
                  </div>

                  <div className="mb-6 flex items-center justify-between bg-[#0B0D12] p-3 rounded-xl border border-[#2A3245] text-xs font-mono text-gray-300">
                    <div className="truncate mr-2">
                      <span className="text-gray-500 mr-2">Standart yo‘l:</span>
                      <code>{plat.defaultPath}</code>
                    </div>
                    <button
                      onClick={() => copyPath(plat.defaultPath, idx)}
                      className="p-1.5 rounded-lg hover:bg-[#1A1F2A] text-gray-400 hover:text-white transition-colors shrink-0"
                      title="Nusxa olish"
                    >
                      {copiedIndex === idx ? (
                        <Check className="w-4 h-4 text-[#A3E635]" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <ol className="space-y-3">
                    {plat.steps.map((st, sidx) => (
                      <li key={sidx} className="flex items-start gap-3 text-xs sm:text-sm text-gray-300 leading-relaxed">
                        <span className="w-6 h-6 rounded-full bg-[#1A1F2A] border border-[#2A3245] text-[#A3E635] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          {sidx + 1}
                        </span>
                        <span>{st}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>

            {/* In-Game Settings Note */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-[#141821] to-[#1A1F2A] border border-[#2A3245]">
              <h4 className="text-base font-bold text-white flex items-center gap-2 mb-2">
                <Settings className="w-5 h-5 text-[#38BDF8]" />
                <span>O‘yin ichidagi sozlamalarni unutmang!</span>
              </h4>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                Fayllarni nusxalash bilan ish tugamaydi. O‘yinga kirgach, menyudagi <strong className="text-white">Sozlamalar (Options/Settings)</strong> bo‘limiga o‘ting va <strong className="text-white">Subtitrlar (Subtitles)</strong> bandini "Yoqilgan (ON)" qiling. Agar o‘yin tili tanlanadigan bo‘lsa, ko‘rsatilgan bazaviy tilni (odatda Inglizcha yoki Ruscha) tanlang.
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: LICENSE & PAYMENT GUIDE */}
        {activeTab === 'license' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-[#141821] border border-[#2A3245]">
                <div className="w-12 h-12 rounded-xl bg-[#A3E635]/15 border border-[#A3E635]/30 text-[#A3E635] flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Bepul Subtitrlar</h3>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-4">
                  SubGame platformasidagi ko‘plab tarjimalar jamiyatimiz uchun to‘liq bepul taqdim etiladi. Bepul o‘yinlar uchun hech qanday kalit yoki to‘lov talab etilmaydi — shunchaki Launcherda yoki saytdan yuklab olib o‘ynashingiz mumkin.
                </p>
                <div className="flex items-center gap-2 text-xs text-[#A3E635] font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Cheklovlarsiz va bepul foydalanish</span>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#141821] border border-[#2A3245]">
                <div className="w-12 h-12 rounded-xl bg-[#38BDF8]/15 border border-[#38BDF8]/30 text-[#38BDF8] flex items-center justify-center mb-4">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Premium Litsenziyalar</h3>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-4">
                  Katta hajmli va professional dublyaj/subtitr loyihalari jamoamiz mehnati evaziga hamyonbop narxlarda taqdim etiladi. To‘lov Click to‘lov tizimi yoki rasmiy bot orqali tezkor amalga oshiriladi.
                </p>
                <div className="flex items-center gap-2 text-xs text-sky-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Xavfsiz bir martalik to‘lov, abadiy kirish</span>
                </div>
              </div>
            </div>

            {/* License Details Card */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#141821] border border-[#2A3245] space-y-4">
              <h3 className="text-xl font-bold text-white">
                Litsenziya qanday ishlaydi va nimalarga e’tibor berish kerak?
              </h3>
              
              <div className="space-y-4 text-xs sm:text-sm text-gray-300">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#1A1F2A] border border-[#2A3245] text-[#A3E635] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    1
                  </div>
                  <div>
                    <strong className="text-white">1 Qurilma = 1 Litsenziya (HWID birikishi):</strong>
                    <p className="text-gray-400 mt-0.5">
                      Har bir faollashtirilgan litsenziya kaliti faqat sizning shaxsiy kompyuteringiz apparat qismlariga biriktiriladi. Bir kalitdan boshqa kompyuterlarda bir vaqtda foydalanib bo‘lmaydi.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#1A1F2A] border border-[#2A3245] text-[#A3E635] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    2
                  </div>
                  <div>
                    <strong className="text-white">Windows qayta o‘rnatilganda (Format):</strong>
                    <p className="text-gray-400 mt-0.5">
                      Agar kompyuteringiz apparat qismlari (ona plata, protsessor) o‘zgarmagan bo‘lsa, operatsion tizimni qayta o‘rnatganingizdan so‘ng xuddi shu litsenziya kaliti o‘z kuchida qoladi.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#1A1F2A] border border-[#2A3245] text-[#A3E635] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    3
                  </div>
                  <div>
                    <strong className="text-white">Xarid qilish jarayoni:</strong>
                    <p className="text-gray-400 mt-0.5">
                      O‘yin sahifasidagi "Sotib olish" tugmasini bosing, telefon raqamingizni kiriting va Click orqali to‘lovni bajaring. Kalit bir zumda ekranda ko‘rsatiladi hamda Telegram profilingizga yuboriladi.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: TROUBLESHOOTING */}
        {activeTab === 'troubleshoot' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 gap-4">
              {troubleshootList.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl bg-[#141821] border border-[#2A3245] space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#1A1F2A] border border-[#2A3245] flex items-center justify-center text-[#A3E635]">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-white">
                        {item.title}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs sm:text-sm">
                      <div className="p-3.5 rounded-xl bg-[#0B0D12] border border-[#2A3245]/60">
                        <span className="text-gray-400 font-semibold block mb-1">Sabab:</span>
                        <p className="text-gray-300 leading-relaxed">{item.cause}</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#0B0D12] border border-[#A3E635]/30">
                        <span className="text-[#A3E635] font-semibold block mb-1">Yechim:</span>
                        <p className="text-gray-300 leading-relaxed">{item.solution}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Antivirus & Security note */}
            <div className="p-6 rounded-2xl bg-[#141821] border border-[#2A3245] flex items-start gap-4">
              <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-1" />
              <div className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                <strong className="text-white block font-bold mb-1">
                  Xavfsizlik kafolati
                </strong>
                SubGame tomonidan tarqatiladigan barcha subtitr fayllari va SubGame Launcher dasturi VirusTotal va zamonaviy xavfsizlik tahlillari orqali tekshirilgan. Dasturlarimiz tarkibida hech qanday troyan, reklama yoki zararli kodlar mavjud emas.
              </div>
            </div>
          </div>
        )}

        {/* Need Help / Support CTA */}
        <div className="mt-16 p-8 rounded-3xl bg-gradient-to-r from-[#141821] via-[#1A1F2A] to-[#141821] border border-[#A3E635]/40 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-[#A3E635]/15 border border-[#A3E635]/30 text-[#A3E635] flex items-center justify-center mx-auto">
            <LifeBuoy className="w-6 h-6" />
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white">
            Qo‘llanmada javob topa olmadingizmi?
          </h3>
          <p className="text-xs sm:text-sm text-gray-300 max-w-lg mx-auto leading-relaxed">
            Bizning do‘stona hamjamiyatimiz va texnik yordam guruhimiz sizga o‘rnatishda bevosita yordam berishga doim tayyor.
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
              <span>O‘yinlar katalogiga o‘tish</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* FAQs Section */}
        <div className="mt-20">
          <FaqSection />
        </div>
      </div>
    </div>
  );
};
