import { Languages, Sparkles, CheckCircle, Flame } from 'lucide-react';

export const WhyUsSection: React.FC = () => {
  const advantages = [
    {
      icon: Languages,
      title: 'O‘zbek tilida hikoya',
      description:
        'O‘yinlardagi dialoglar, personajlarning his-tuyg‘ulari va chuqur voqealarni chet tilida emas, o‘z ona tilingizda tushuning.',
      badge: 'Mahalliy madaniyat',
    },
    {
      icon: Sparkles,
      title: 'Sifatli adabiy tarjima',
      description:
        'O‘yinlar konteksti, qahramonlarning hissiyotlari va davr muhiti saqlangan holda badiiy mahorat bilan tarjima qilinadi.',
      badge: 'Adabiy tahrir',
    },
    {
      icon: CheckCircle,
      title: 'Oson o‘rnatish',
      description:
        'Murakkab dasturlar kerak emas. Har bir o‘yin uchun aniq papka yo‘llari va rasmli bosqichma-bosqich o‘rnatish qo‘llanmasi taqdim etiladi.',
      badge: '1-daqiqa ichida',
    },
    {
      icon: Flame,
      title: 'Doimiy rivojlanish',
      description:
        'Loyiha faqat 1-2 o‘yin bilan to‘xtab qolmaydi. Geymerlar ovozi va takliflari asosida yangi AAA va Indie o‘yinlar muntazam qo‘shiladi.',
      badge: 'Kengayuvchi katalog',
    },
  ];

  return (
    <section className="py-20 bg-[#0B0D12] relative overflow-hidden">
      {/* Subtle ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#A3E635]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-[#A3E635] uppercase tracking-wider bg-[#A3E635]/10 px-3 py-1 rounded-full border border-[#A3E635]/20">
            Platforma afzalliklari
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-3">
            Nega bizning loyihamiz?
          </h2>
          <p className="text-sm sm:text-base text-gray-400 mt-3 leading-relaxed">
            Biz o‘zbek tilidagi videoo‘yin kontentini yangi sifat bosqichiga ko‘tarishni maqsad qilganmiz.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {advantages.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="group relative bg-[#141821] rounded-2xl p-6 border border-[#2A3245] hover:border-[#A3E635]/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-glow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#1A1F2A] border border-[#2A3245] flex items-center justify-center text-[#A3E635] group-hover:scale-110 group-hover:bg-[#A3E635] group-hover:text-[#0B0D12] transition-all">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-mono text-gray-400 bg-[#0B0D12] px-2 py-0.5 rounded border border-[#2A3245]">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-[#A3E635] transition-colors mb-2">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#2A3245]/50 flex items-center text-xs font-semibold text-[#A3E635] opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Batafsil ma‘lumot →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
