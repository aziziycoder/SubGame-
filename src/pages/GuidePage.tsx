import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, FolderCheck, ShieldAlert, Copy, Check } from 'lucide-react';
import { FaqSection } from '../components/home/FaqSection';

export const GuidePage: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyPath = (path: string, index: number) => {
    navigator.clipboard.writeText(path);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const platforms = [
    {
      name: 'Steam',
      defaultPath: 'C:\\Program Files (x86)\\Steam\\steamapps\\common\\<O‘yin_nomi>\\',
      steps: [
        'Steam ilovasini oching va "Kutubxona (Library)" bo‘limiga kiring.',
        'O‘yin ustiga sichqonchaning o‘ng tugmasini bosing va "Boshqarish (Manage)" -> "Lokal fayllarni ko‘rish (Browse local files)" bandini bosing.',
        'Ochilgan papkaga yuklab olingan o‘zbekcha subtitr arxivining ichidagi fayllarni ko‘chirib o‘tkazing.',
        'Fayllarni almashtirish (Replace) so‘ralsa, "Ha" deb tasdiqlang.',
        'O‘yinni ishga tushiring va Sozlamalar -> Audio -> Subtitrlar bo‘limidan subtitrni yoqing.'
      ]
    },
    {
      name: 'Epic Games Store',
      defaultPath: 'C:\\Program Files\\Epic Games\\<O‘yin_nomi>\\',
      steps: [
        'Epic Games Launcher ilovasiga kiring va "Kutubxona (Library)" bo‘limini oching.',
        'O‘yin kartasining pastki burchagidagi uch nuqta (...) belgisini bosing va "Boshqarish (Manage)"ni tanlang.',
        '"O‘rnatish (Installation)" qatoridagi papka belgisini bosing. O‘yin joylashgan asosiy papka ochiladi.',
        'Subtitr fayllarini ushbu papka ichidagi mos strukturaga joylashtiring.',
        'O‘yinni ochib, menyudan o‘zbekcha subtitrlar faollashtirilganini tekshiring.'
      ]
    },
    {
      name: 'GOG Galaxy / DRM-Free',
      defaultPath: 'C:\\GOG Games\\<O‘yin_nomi>\\',
      steps: [
        'GOG Galaxy dasturida o‘yinni tanlang.',
        'Sozlamalar belgisini bosing -> "Fayllarni boshqarish" -> "Papkani ko‘rsatish".',
        'Arxiv ichidagi fayllarni o‘yin papkasiga nusxalang.',
        'O‘yinga kirib zavqlaning.'
      ]
    }
  ];

  return (
    <div className="pt-28 pb-20 min-h-screen bg-[#0B0D12] text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A3E635]/10 text-[#A3E635] text-xs font-bold mb-3 border border-[#A3E635]/20">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Qo‘llanma va Yo‘riqnoma</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Subtitrlarni o‘rnatish bo‘yicha to‘liq qo‘llanma
          </h1>
          <p className="text-sm sm:text-base text-gray-400 mt-3 leading-relaxed">
            Steam, Epic Games va boshqa rasmiy do‘konlardagi o‘yinlarga o‘zbekcha lokalizatsiyani to‘g‘ri va xavfsiz o‘rnatish usullari.
          </p>
        </div>

        {/* 3 Golden Rules Alert */}
        <div className="mb-12 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-4">
          <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0 mt-1" />
          <div className="space-y-1.5 text-xs sm:text-sm text-gray-300">
            <strong className="text-amber-300 block text-base font-bold">
              O‘rnatishdan oldin 3 ta oltin qoida:
            </strong>
            <ul className="list-disc list-inside space-y-1 text-gray-300">
              <li>
                <strong>Zaxira nusxa (Backup):</strong> O‘zgartirayotgan asl til faylining nusxasini boshqa xavfsiz papkada saqlab qo‘ying.
              </li>
              <li>
                <strong>O‘yin versiyasi:</strong> O‘yiningiz eng so‘nggi versiyaga yangilanganligiga ishonch hosil qiling.
              </li>
              <li>
                <strong>Antivirus soxta ogohlantirishi:</strong> Matnli lokalizatsiya fayllari (.locres, .pak) mutlaqo xavfsiz.
              </li>
            </ul>
          </div>
        </div>

        {/* Platform Guides */}
        <div className="space-y-8 mb-16">
          <h2 className="text-2xl font-bold text-white border-b border-[#2A3245] pb-3">
            Platformalar bo‘yicha o‘rnatish yo‘riqnomasi
          </h2>

          <div className="grid grid-cols-1 gap-6">
            {platforms.map((plat, idx) => (
              <div
                key={plat.name}
                className="bg-[#141821] rounded-2xl p-6 sm:p-8 border border-[#2A3245]"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <FolderCheck className="w-5 h-5 text-[#A3E635]" />
                    <span>{plat.name}</span>
                  </h3>
                  <span className="text-xs text-gray-400 bg-[#0B0D12] px-2.5 py-1 rounded-md border border-[#2A3245]">
                    Standart yo‘l
                  </span>
                </div>

                <div className="mb-6 flex items-center justify-between bg-[#0B0D12] p-3 rounded-xl border border-[#2A3245] text-xs font-mono text-gray-300">
                  <code className="truncate mr-2">{plat.defaultPath}</code>
                  <button
                    onClick={() => copyPath(plat.defaultPath, idx)}
                    className="p-1.5 rounded hover:bg-[#1A1F2A] text-gray-400 hover:text-white transition-colors shrink-0"
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
                    <li key={sidx} className="flex items-start gap-3 text-sm text-gray-300">
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
        </div>

        {/* Ready to Play CTA */}
        <div className="p-8 rounded-2xl bg-gradient-to-r from-[#1A1F2A] to-[#141821] border border-[#A3E635]/40 text-center space-y-4">
          <h3 className="text-xl font-bold text-white">
            Qo‘llanma bilan tanishdingizmi? Endi o‘yinlarni sinab ko‘ring!
          </h3>
          <p className="text-sm text-gray-300 max-w-lg mx-auto">
            A Plague Tale: Innocence va Requiem o‘yinlarining o‘zbekcha subtitrlarini bepul yuklab oling.
          </p>
          <div className="pt-2">
            <Link
              to="/games"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#A3E635] text-[#0B0D12] font-bold text-sm hover:bg-[#84CC16] transition-all"
            >
              <span>Katalogga o‘tish</span>
            </Link>
          </div>
        </div>

        {/* FAQs */}
        <div className="mt-16">
          <FaqSection />
        </div>
      </div>
    </div>
  );
};
