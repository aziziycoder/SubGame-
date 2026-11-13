import React from 'react';

const STYLES = `
  @keyframes page-loader-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
  @keyframes page-loader-spin { to { transform: rotate(360deg); } }
  @keyframes page-loader-breathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.06); } }
  @keyframes page-loader-dot { 0%, 80%, 100% { opacity: 0.25; transform: translateY(0); } 40% { opacity: 1; transform: translateY(-3px); } }
  @media (prefers-reduced-motion: reduce) {
    .page-loader-motion { animation: none !important; }
  }
`;

interface PageLoaderProps {
  /** Shown under the logo. */
  label?: string;
  className?: string;
}

/**
 * The site-wide loading state: the SubGame logo inside a spinning lime ring. It fades in
 * after a short delay, so quick loads finish before anything flashes on screen.
 */
export const PageLoader: React.FC<PageLoaderProps> = ({ label = 'Yuklanmoqda', className = 'min-h-[70vh]' }) => (
  <div
    role="status"
    aria-live="polite"
    className={`flex flex-col items-center justify-center gap-5 px-4 ${className}`}
    style={{ animation: 'page-loader-in 300ms ease-out 150ms both' }}
  >
    <style>{STYLES}</style>
    <div className="relative w-20 h-20">
      <div className="absolute inset-0 rounded-full bg-[#A3E635]/10 blur-xl" />
      <div
        className="page-loader-motion absolute inset-0 rounded-full"
        style={{
          background: 'conic-gradient(from 0deg, transparent 0deg, rgba(163,230,53,0.05) 120deg, #A3E635 330deg, transparent 360deg)',
          mask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))',
          WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))',
          animation: 'page-loader-spin 0.9s linear infinite',
        }}
      />
      <div className="absolute inset-[5px] rounded-full bg-[#141821] border border-[#2A3245] flex items-center justify-center">
        <img
          src="/images/logo_doppi.png"
          alt=""
          className="page-loader-motion w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(163,230,53,0.35)]"
          style={{ animation: 'page-loader-breathe 1.8s ease-in-out infinite' }}
        />
      </div>
    </div>
    <div className="flex items-center gap-1 text-sm font-semibold text-gray-300">
      <span>{label}</span>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          aria-hidden="true"
          className="page-loader-motion inline-block w-1 h-1 rounded-full bg-[#A3E635]"
          style={{ animation: `page-loader-dot 1.2s ease-in-out ${i * 0.15}s infinite` }}
        />
      ))}
    </div>
  </div>
);
