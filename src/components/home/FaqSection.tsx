import React, { useState } from 'react';
import { FAQS_DATA } from '../../data/faqs';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>(FAQS_DATA[0].id);

  const toggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="py-20 bg-[#0B0D12]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A3E635]/10 text-[#A3E635] border border-[#A3E635]/20 text-xs font-bold mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Savollaringiz bormi?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ko‘p beriladigan savollar
          </h2>
          <p className="text-sm text-gray-400 mt-2">
            O‘zbekcha subtitrlarni yuklab olish, o‘rnatish va ularning ishlashi bo‘yicha tez-tez so‘raladigan savollarga javoblar.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS_DATA.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="rounded-2xl bg-[#141821] border border-[#2A3245] overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => toggle(faq.id)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left gap-4 hover:bg-[#1A1F2A]/60 transition-colors"
                >
                  <span className="font-semibold text-white text-sm sm:text-base">
                    {faq.question}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-lg bg-[#1A1F2A] flex items-center justify-center shrink-0 text-gray-400 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#A3E635]' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-sm text-gray-300 leading-relaxed border-t border-[#2A3245]/40 animate-in fade-in duration-150">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
