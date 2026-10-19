import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Check, ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroSlide {
  id: string;
  slug: string;
  title: string;
  badge: string;
  headlinePrefix: string;
  headlineHighlight: string;
  headlineSuffix: string;
  description: string;
  bgImageDesktop: string;
  bgImageMobile: string;
  cardImage: string;
  cardTag: string;
  highlightTag: string;
  version: string;
  cardDescription: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'requiem',
    slug: 'a-plague-tale-requiem',
    title: 'A Plague Tale: Requiem',
    badge: 'Yangi Premyera • v1.0.2',
    headlinePrefix: 'Har bir hikoyani ',
    headlineHighlight: 'o‘z tilingda',
    headlineSuffix: ' his qil.',
    description:
      'Amitsiya va Gyugoning vabo epidemiyasidagi ta‘sirli dramasi endi to‘liq o‘zbek tilida. Qora kalamushlar to‘dasi va taqdir sinovlariga qarshi kurash.',
    bgImageDesktop:
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1182900/ss_9cbcd6b81cc32ecf75b36f40b92157da78a19598.1920x1080.jpg',
    bgImageMobile:
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1182900/library_600x900_2x.jpg',
    cardImage:
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1182900/header.jpg',
    cardTag: 'O‘ZBEKCHA SUBTITR TAYYOR',
    highlightTag: 'Yangi premyera',
    version: 'v1.0.2 • PC',
    cardDescription:
      'Amitsiya va Gyugoning vabo epidemiyasidagi ta‘sirli dramasi endi to‘liq o‘zbek tilida.',
  },
  {
    id: 'innocence',
    slug: 'a-plague-tale-innocence',
    title: 'A Plague Tale: Innocence',
    badge: 'Afsonaviy Klassika • v1.2.0',
    headlinePrefix: 'Tarixiy vabo va ',
    headlineHighlight: 'inkvizitsiya',
    headlineSuffix: ' changalida.',
    description:
      '1349-yil, Yuz yillik urush davridagi Fransiya. Amitsiya va uning kichik ukasi Gyugoning afsonaviy birinchi sayohati o‘zbekcha tarjimada.',
    bgImageDesktop:
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/752590/ss_8433438bf03b7f524e6cf3ac81e99e96be2188c8.1920x1080.jpg',
    bgImageMobile:
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/752590/library_600x900_2x.jpg',
    cardImage:
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/752590/header.jpg',
    cardTag: 'O‘ZBEKCHA SUBTITR TAYYOR',
    highlightTag: 'Ommabop afsona',
    version: 'v1.2.0 • PC',
    cardDescription:
      '1349-yil. Fransiyada vabo va inkvizitsiya avjida. Yosh Amitsiya va Gyugoning omon qolish jangi.',
  },
];

const SLIDE_INTERVAL_MS = 5000;

export const HeroSection: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  // Continuous auto-slide timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, SLIDE_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [currentSlide]);

  const active = HERO_SLIDES[currentSlide];

  return (
    <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center pt-20 sm:pt-28 pb-12 sm:pb-16 overflow-hidden select-none">
      {/* Background Cinematic Art with responsive mobile/desktop source & cross-fade */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {HERO_SLIDES.map((slide, index) => {
          const isCurrent = currentSlide === index;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isCurrent ? 'opacity-100 z-0' : 'opacity-0 -z-10 pointer-events-none'
              }`}
            >
              <picture className="w-full h-full block">
                <source media="(min-width: 640px)" srcSet={slide.bgImageDesktop} />
                <img
                  src={slide.bgImageMobile}
                  alt={`${slide.title} fon rasmi`}
                  className={`w-full h-full object-cover object-top sm:object-center filter brightness-[0.52] sm:brightness-[0.65] contrast-110 transition-transform duration-1000 ease-out ${
                    isCurrent ? 'scale-105' : 'scale-100'
                  }`}
                />
              </picture>
            </div>
          );
        })}

        {/* Cinematic Vignette Gradients tuned for mobile portrait and desktop */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D12] via-[#0B0D12]/75 to-[#0B0D12]/30 sm:via-[#0B0D12]/50 sm:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0D12]/95 via-[#0B0D12]/50 to-transparent hidden sm:block" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#0B0D12]/80 via-[#0B0D12]/30 to-transparent pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#A3E635]/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Main Hero Copy (Col 1-7) */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6">
            {/* Small Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1A1F2A]/90 border border-[#A3E635]/40 backdrop-blur-md shadow-accent-glow transition-all duration-300">
              <span className="w-2 h-2 rounded-full bg-[#A3E635] animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#A3E635]">
                {active.badge}
              </span>
            </div>

            {/* Big Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.2] sm:leading-[1.15] transition-all duration-500">
              {active.headlinePrefix}
              <span className="text-accent-gradient">{active.headlineHighlight}</span>
              {active.headlineSuffix}
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base lg:text-lg text-gray-300 leading-relaxed max-w-2xl transition-all duration-500">
              {active.description}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <Link
                to={`/games/${active.slug}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#A3E635] text-[#0B0D12] font-bold text-sm sm:text-base hover:bg-[#84CC16] transition-all hover:scale-[1.02] shadow-accent-glow text-center"
              >
                <span>O‘yinni ko‘rish</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/games"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#141821]/80 hover:bg-[#1A1F2A] text-white font-semibold text-sm sm:text-base border border-[#2A3245] hover:border-gray-500 transition-all backdrop-blur-sm text-center"
              >
                <span>Barcha o‘yinlar</span>
              </Link>
            </div>

            {/* Guarantee Pills */}
            <div className="pt-5 border-t border-[#2A3245]/60 flex flex-wrap items-center gap-x-5 gap-y-2.5 text-xs sm:text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#A3E635]/20 text-[#A3E635] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>100% O‘zbekcha dialoglar</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#A3E635]/20 text-[#A3E635] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>AI + Tahririyat tekshiruvi</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#A3E635]/20 text-[#A3E635] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Bepul yuklab olish</span>
              </div>
            </div>
          </div>

          {/* Interactive Hero Showcase Card (Col 8-12) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative rounded-2xl bg-gradient-to-b from-[#1A1F2A] to-[#141821] p-1 border border-[#2A3245] hover:border-[#A3E635]/50 transition-all duration-500 shadow-2xl group">
              {/* Highlight badge on showcase */}
              <div className="absolute -top-3.5 right-6 z-20 px-3 py-1 rounded-full bg-[#A3E635] text-[#0B0D12] text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-accent-glow">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{active.highlightTag}</span>
              </div>

              <div className="relative rounded-xl overflow-hidden aspect-[16/10]">
                {HERO_SLIDES.map((slide, index) => {
                  const isCurrent = currentSlide === index;
                  return (
                    <img
                      key={slide.id}
                      src={slide.cardImage}
                      alt={`${slide.title} Poster`}
                      className={`absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-700 ${
                        isCurrent ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                      }`}
                    />
                  );
                })}

                <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#0B0D12] via-[#0B0D12]/50 to-transparent" />

                <div className="absolute bottom-4 left-4 right-4 z-30 space-y-2">
                  <span className="inline-block text-xs font-mono font-bold text-[#A3E635] bg-[#0B0D12]/80 px-2 py-0.5 rounded border border-[#A3E635]/30">
                    {active.cardTag}
                  </span>
                  <h3 className="text-xl font-bold text-white transition-all duration-300">
                    {active.title}
                  </h3>
                  <p className="text-xs text-gray-300 line-clamp-2 transition-all duration-300">
                    {active.cardDescription}
                  </p>
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-mono">
                      {active.version}
                    </span>
                    <Link
                      to={`/games/${active.slug}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#A3E635] text-[#0B0D12] text-xs font-bold hover:bg-[#84CC16] transition-colors group/btn"
                    >
                      <span>Sahifaga o‘tish</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Slider Switcher & Indicators */}
            <div className="flex items-center justify-between px-1 sm:px-2 pt-1">
              {/* Slide Selection Buttons with Animated Progress */}
              <div className="flex items-center gap-2">
                {HERO_SLIDES.map((slide, index) => {
                  const isCurrent = currentSlide === index;
                  return (
                    <button
                      key={slide.id}
                      onClick={() => setCurrentSlide(index)}
                      className={`relative overflow-hidden flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-[#1A1F2A] text-[#A3E635] border border-[#A3E635]/50 shadow-sm'
                          : 'bg-[#141821]/60 text-gray-400 hover:text-white border border-[#2A3245]/60 hover:border-gray-500'
                      }`}
                    >
                      {/* Active progress bar filling up over 5s */}
                      {isCurrent && (
                        <span
                          key={`prog-${currentSlide}`}
                          className="absolute bottom-0 left-0 top-0 bg-[#A3E635]/20 pointer-events-none"
                          style={{
                            animation: `heroProgress ${SLIDE_INTERVAL_MS}ms linear forwards`,
                          }}
                        />
                      )}
                      <span
                        className={`relative z-10 w-2 h-2 rounded-full ${
                          isCurrent
                            ? 'bg-[#A3E635] shadow-[0_0_8px_#A3E635]'
                            : 'bg-gray-500'
                        }`}
                      />
                      <span className="relative z-10">
                        {slide.title.replace('A Plague Tale: ', '')}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Prev / Next Arrows */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={prevSlide}
                  aria-label="Oldingi slayd"
                  className="p-2 rounded-lg bg-[#141821]/80 hover:bg-[#1A1F2A] text-gray-300 hover:text-white border border-[#2A3245] hover:border-[#A3E635]/40 transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextSlide}
                  aria-label="Keyingi slayd"
                  className="p-2 rounded-lg bg-[#141821]/80 hover:bg-[#1A1F2A] text-gray-300 hover:text-white border border-[#2A3245] hover:border-[#A3E635]/40 transition-all cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
