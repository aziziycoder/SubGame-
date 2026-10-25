import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import type { HeroSlide } from '../../types/slider';
import { INITIAL_SLIDES } from '../../data/sliders';
import { getSliders, getCachedSliders } from '../../services/slidersService';

const SLIDE_INTERVAL_MS = 6000;

export const HeroSection: React.FC = () => {
  const [slides, setSlides] = useState<HeroSlide[]>(() => {
    const cached = getCachedSliders();
    if (cached && cached.length > 0) {
      const active = cached.filter((s) => s.isActive !== false);
      if (active.length > 0) return active;
    }
    return INITIAL_SLIDES;
  });
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    let mounted = true;
    getSliders()
      .then((data) => {
        if (!mounted) return;
        const activeSlides = data.filter((s) => s.isActive !== false);
        if (activeSlides.length > 0) {
          setSlides(activeSlides);
        }
      })
      .catch((err) => console.warn('Failed to load dynamic slides:', err));
    return () => {
      mounted = false;
    };
  }, []);

  const totalSlides = slides.length || 1;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Continuous auto-slide timer
  useEffect(() => {
    if (totalSlides <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, SLIDE_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [currentSlide, totalSlides]);

  const active = slides[currentSlide] || slides[0] || INITIAL_SLIDES[0];

  return (
    <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center pt-24 sm:pt-28 pb-12 sm:pb-16 overflow-hidden select-none">
      {/* Background Cinematic Art with cross-fade animation */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {slides.map((slide, index) => {
          const isCurrent = currentSlide === index;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isCurrent ? 'opacity-100 z-0' : 'opacity-0 -z-10 pointer-events-none'
              }`}
            >
              <img
                src={slide.bgImage}
                alt={`${slide.title} fon rasmi`}
                fetchPriority={index === 0 ? 'high' : 'low'}
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding="async"
                className={`w-full h-full object-cover object-center filter brightness-[0.80] sm:brightness-[0.85] contrast-105 transition-transform duration-1000 ease-out ${
                  isCurrent ? 'scale-105' : 'scale-100'
                }`}
              />
            </div>
          );
        })}

        {/* Cinematic Vignette Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D12] via-[#0B0D12]/35 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0D12]/75 via-[#0B0D12]/25 to-transparent hidden sm:block" />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#0B0D12]/70 via-transparent to-transparent pointer-events-none" />
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
                <span>Professional tahririyat</span>
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
            <div className="relative rounded-2xl bg-[#141821] border border-[#2A3245] hover:border-[#A3E635]/50 transition-all duration-500 shadow-2xl overflow-hidden group">
              {/* Card Header Bar: Badges placed outside the image so art and logos are 100% visible */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-[#1A1F2A] border-b border-[#2A3245]">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#A3E635] bg-[#0B0D12] px-2.5 py-1 rounded-md border border-[#A3E635]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A3E635] animate-pulse" />
                  {active.cardTag}
                </span>

                <div className="px-3 py-1 rounded-full bg-[#A3E635] text-[#0B0D12] text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-accent-glow">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{active.highlightTag}</span>
                </div>
              </div>

              {/* Full Game Header Image (100% Uncropped, Exact 460:215 Steam Ratio) */}
              <div
                className="relative w-full bg-[#0B0D12] overflow-hidden"
                style={{ aspectRatio: '460 / 215' }}
              >
                {slides.map((slide, index) => {
                  const isCurrent = currentSlide === index;
                  return (
                    <img
                      key={slide.id}
                      src={slide.cardImage}
                      alt={`${slide.title} Banner`}
                      fetchPriority={index === 0 ? 'high' : 'low'}
                      loading={index === 0 ? 'eager' : 'lazy'}
                      decoding="async"
                      className={`absolute inset-0 w-full h-full object-contain transition-all duration-700 ${
                        isCurrent ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                      }`}
                    />
                  );
                })}
              </div>

              {/* Clean Content Area Below The Image */}
              <div className="p-4 sm:p-5 space-y-2.5 bg-[#141821] border-t border-[#2A3245]">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-lg sm:text-xl font-bold text-white transition-all duration-300">
                    {active.title}
                  </h3>
                  <span className="text-[11px] font-mono text-gray-400 bg-[#0B0D12] px-2 py-0.5 rounded border border-[#2A3245] shrink-0">
                    {active.version}
                  </span>
                </div>

                <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed transition-all duration-300">
                  {active.cardDescription}
                </p>

                <div className="pt-2 flex items-center justify-between border-t border-[#2A3245]/60">
                  <span className="text-xs text-gray-400">
                    To‘liq o‘zbekcha subtitr
                  </span>
                  <Link
                    to={`/games/${active.slug}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#A3E635] text-[#0B0D12] text-xs font-bold hover:bg-[#84CC16] transition-colors group/btn shadow-accent-glow"
                  >
                    <span>Sahifaga o‘tish</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Slider Switcher & Indicators */}
            <div className="flex items-center justify-between px-1 sm:px-2 pt-1">
              {/* Slide Selection Buttons with Animated Progress */}
              <div className="flex items-center gap-2">
                {slides.map((slide, index) => {
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
