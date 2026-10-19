import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Download, Gamepad2, ArrowRight } from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      number: '01',
      icon: Search,
      title: 'O‘yinni tanlang',
      description:
        'Katalogimizdan o‘zingiz yoqtirgan va o‘zbekcha subtitri tayyor bo‘lgan o‘yinni tanlang.',
      linkText: 'Katalogga o‘tish',
      linkUrl: '/games',
    },
    {
      number: '02',
      icon: Download,
      title: 'Subtitrni yuklab oling',
      description:
        'O‘yin sahifasidan mos subtitr ZIP arxivini bepul va to‘g‘ridan-to‘g‘ri shaxsiy kompyuteringizga saqlang.',
      linkText: 'Fayllar haqida',
      linkUrl: '/guide#files',
    },
    {
      number: '03',
      icon: Gamepad2,
      title: 'O‘rnating va o‘ynang',
      description:
        'Qisqa qo‘llanma asosida arxiv ichidagi fayllarni o‘yin papkasiga ko‘chiring va o‘yin ichida subtitrni yoqing.',
      linkText: 'Qo‘llanmani ko‘rish',
      linkUrl: '/guide',
    },
  ];

  return (
    <section className="py-20 bg-[#141821]/60 border-y border-[#2A3245]/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-[#A3E635] uppercase tracking-wider bg-[#A3E635]/10 px-3 py-1 rounded-full border border-[#A3E635]/20">
            Oddiy va tushunarli
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-3">
            Subtitr qanday ishlaydi?
          </h2>
          <p className="text-sm sm:text-base text-gray-400 mt-3 leading-relaxed">
            Bor-yo‘g‘i 3 ta oddiy qadam bilan sevimli o‘yiningizni ona tilingizda o‘ynashni boshlang.
          </p>
        </div>

        {/* Process Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line for desktop */}
          <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] -translate-y-8 h-0.5 bg-gradient-to-r from-[#A3E635]/20 via-[#A3E635]/40 to-[#A3E635]/20 z-0" />

          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="relative z-10 bg-[#1A1F2A] rounded-2xl p-7 border border-[#2A3245] hover:border-[#A3E635]/60 transition-all duration-300 hover:shadow-card-glow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-[#141821] border border-[#2A3245] flex items-center justify-center text-[#A3E635] shadow-inner">
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="text-3xl font-black font-mono text-gray-700 select-none">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2.5">
                    {step.title}
                  </h3>

                  <p className="text-sm text-gray-400 leading-relaxed mb-6">
                    {step.description}
                  </p>
                </div>

                <Link
                  to={step.linkUrl}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A3E635] hover:text-[#84CC16] transition-colors"
                >
                  <span>{step.linkText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>

        {/* Bottom Callout */}
        <div className="mt-12 text-center text-xs text-gray-400">
          <span>Har bir o‘yinning o‘rnatilish uslubi o‘ziga xos bo‘lishi mumkin. Batafsil yo‘riqnoma uchun har bir o‘yin sahifasidagi </span>
          <span className="text-white font-semibold">"O‘rnatish yo‘riqnomasi"</span>
          <span> bo‘limiga qarang.</span>
        </div>
      </div>
    </section>
  );
};
