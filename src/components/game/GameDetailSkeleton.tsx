import React from 'react';

const STYLES = `
  @keyframes game-skeleton-shimmer { from { background-position: 150% 0; } to { background-position: -50% 0; } }
  .game-skeleton {
    background-color: #1A1F2A;
    background-image: linear-gradient(100deg, transparent 20%, rgba(163, 230, 53, 0.07) 40%, rgba(255, 255, 255, 0.06) 50%, transparent 70%);
    background-size: 200% 100%;
    animation: game-skeleton-shimmer 1.6s ease-in-out infinite;
  }
  @media (prefers-reduced-motion: reduce) {
    .game-skeleton { animation: none; }
  }
`;

const Bar: React.FC<{ className: string }> = ({ className }) => <div className={`game-skeleton rounded-lg ${className}`} />;

/**
 * What the game page shows while its data loads: the page's own outline with a soft
 * shimmer, so the layout doesn't jump when the real content arrives.
 */
export const GameDetailSkeleton: React.FC = () => (
  <div className="min-h-screen bg-[#0B0D12]" role="status" aria-live="polite">
    <style>{STYLES}</style>
    <span className="sr-only">O‘yin sahifasi yuklanmoqda</span>

    {/* Hero */}
    <section className="relative min-h-[460px] sm:min-h-[560px] flex items-end pt-24 sm:pt-32 pb-8 sm:pb-12 overflow-hidden border-b border-[#2A3245]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1A1F2A] via-[#12161F] to-[#0B0D12]" />
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-[#A3E635]/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 lg:gap-8 items-start sm:items-end">
          <div className="flex items-start gap-3.5 sm:gap-0 w-full sm:w-auto">
            <div className="game-skeleton w-28 sm:w-36 lg:w-48 shrink-0 aspect-[2/3] rounded-xl sm:rounded-2xl border-2 border-[#2A3245]" />
            {/* Phone: title and badges sit beside the poster */}
            <div className="flex-1 space-y-2.5 pt-1 sm:hidden">
              <Bar className="h-5 w-24 rounded-full" />
              <Bar className="h-6 w-full" />
              <Bar className="h-6 w-2/3" />
              <Bar className="h-4 w-1/2" />
            </div>
          </div>

          <div className="flex-1 w-full space-y-3.5">
            <div className="hidden sm:flex gap-2">
              <Bar className="h-7 w-40 rounded-full" />
              <Bar className="h-7 w-28 rounded-full" />
              <Bar className="h-7 w-16 rounded-full" />
            </div>
            <Bar className="hidden sm:block h-12 lg:h-14 w-3/4 max-w-xl" />
            <div className="space-y-2">
              <Bar className="h-3.5 w-full max-w-3xl" />
              <Bar className="h-3.5 w-11/12 max-w-2xl" />
              <Bar className="h-3.5 w-2/3 max-w-xl" />
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {['w-16', 'w-20', 'w-14', 'w-20'].map((width, i) => (
                <Bar key={i} className={`h-7 ${width}`} />
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Bar className="h-11 w-full sm:w-56 rounded-xl" />
              <div className="flex gap-2">
                <Bar className="h-11 flex-1 sm:w-28 rounded-xl" />
                <Bar className="h-11 flex-1 sm:w-11 rounded-xl" />
                <Bar className="h-11 flex-1 sm:w-11 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Body */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-[#141821] rounded-2xl p-5 sm:p-8 border border-[#2A3245] space-y-3">
            <Bar className="h-7 w-40 mb-2" />
            <Bar className="h-3.5 w-full" />
            <Bar className="h-3.5 w-full" />
            <Bar className="h-3.5 w-5/6" />
            <Bar className="h-3.5 w-3/5" />
          </div>
          <div className="bg-[#141821] rounded-2xl p-5 sm:p-8 border border-[#2A3245]">
            <Bar className="h-7 w-48 mb-5" />
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="game-skeleton aspect-video rounded-xl" />
              ))}
            </div>
          </div>
        </div>
        <div className="lg:col-span-4">
          <div className="bg-[#141821] rounded-2xl p-5 sm:p-6 border border-[#A3E635]/20 space-y-3">
            <Bar className="h-4 w-44" />
            <Bar className="h-14 w-full rounded-xl" />
            <Bar className="h-5 w-36" />
            <Bar className="h-3.5 w-full" />
            <Bar className="h-3.5 w-4/5" />
            <Bar className="h-11 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  </div>
);
