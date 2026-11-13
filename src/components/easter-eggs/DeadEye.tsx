import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { EasterEggEffectProps } from './GameEasterEgg';

interface Target {
  /** Page coordinates, so marks and bullet holes scroll with the content they hit. */
  x: number;
  y: number;
  /** Fixed per target so a re-render doesn't reshuffle the cracks. */
  cracks: number[];
}

const MARK_INTERVAL_MS = 320;
const SHOT_INTERVAL_MS = 150;
const AIM_START_MS = 700;
/** How long the wanted poster hangs before it leaves on its own. */
const WANTED_STAY_MS = 7000;
const WANTED_LEAVE_MS = 450;
/** Bullet holes linger this long after the poster is gone. */
const HOLES_LINGER_MS = 1500;

const random = (min: number, max: number) => min + Math.random() * (max - min);

const STYLES = `
  @keyframes dead-eye-in { from { opacity: 0; } to { opacity: 1; } }
  @keyframes dead-eye-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.82; } }
  @keyframes dead-eye-mark { from { transform: translate(-50%, -50%) scale(2.2) rotate(45deg); opacity: 0; } to { transform: translate(-50%, -50%) scale(1) rotate(45deg); opacity: 1; } }
  @keyframes dead-eye-flash { from { transform: translate(-50%, -50%) scale(0.3); opacity: 1; } to { transform: translate(-50%, -50%) scale(2.4); opacity: 0; } }
  @keyframes wanted-drop { from { transform: translateY(-110vh) rotate(-14deg); } to { transform: translateY(0) rotate(-3deg); } }
  @keyframes wanted-leave { from { transform: translateY(0) rotate(-3deg); opacity: 1; } to { transform: translateY(40px) rotate(4deg); opacity: 0; } }
  @media (prefers-reduced-motion: reduce) {
    .dead-eye-animated { animation: none !important; }
  }
`;

/** Picks what to shoot: visible pictures, headings and buttons first, then empty spots. */
function pickTargets(count: number): Target[] {
  const viewWidth = window.innerWidth;
  const viewHeight = window.innerHeight;
  const points: Array<{ x: number; y: number }> = [];
  const farEnough = (x: number, y: number) => points.every((p) => Math.hypot(p.x - x, p.y - y) > 70);

  const candidates = Array.from(document.querySelectorAll('main img, main h1, main h2, main button, main a'));
  for (const el of candidates.sort(() => Math.random() - 0.5)) {
    if (points.length >= count) break;
    const rect = el.getBoundingClientRect();
    if (rect.width < 24 || rect.height < 16) continue;
    // Below the navbar and fully on screen, so every shot lands where people are looking.
    if (rect.top < 80 || rect.bottom > viewHeight - 10 || rect.left < 0 || rect.right > viewWidth) continue;
    const x = rect.left + rect.width * random(0.3, 0.7);
    const y = rect.top + rect.height * random(0.3, 0.7);
    if (farEnough(x, y)) points.push({ x, y });
  }
  for (let tries = 0; points.length < count && tries < 50; tries += 1) {
    const x = random(40, viewWidth - 40);
    const y = random(110, viewHeight - 40);
    if (farEnough(x, y)) points.push({ x, y });
  }

  return points
    .sort((a, b) => a.x - b.x)
    .map((p) => ({
      x: p.x + window.scrollX,
      y: p.y + window.scrollY,
      cracks: Array.from({ length: 7 }, (_, i) => (i / 7) * 360 + random(-18, 18)),
    }));
}

const BulletHole: React.FC<{ cracks: number[] }> = ({ cracks }) => (
  <svg viewBox="-20 -20 40 40" className="w-8 h-8" aria-hidden="true">
    {cracks.map((angle) => (
      <line
        key={angle}
        x1="0"
        y1="0"
        x2={Math.cos((angle * Math.PI) / 180) * 17}
        y2={Math.sin((angle * Math.PI) / 180) * 17}
        stroke="rgba(230, 220, 200, 0.55)"
        strokeWidth="0.9"
      />
    ))}
    <circle r="8" fill="rgba(40, 28, 18, 0.85)" stroke="rgba(210, 190, 160, 0.6)" strokeWidth="1.4" />
    <circle r="4.6" fill="#050403" />
  </svg>
);

/** An old paper wanted poster, with the game's own cover as the portrait. */
const WantedPoster: React.FC<{ portrait: string | null; leaving: boolean; onClose: () => void }> = ({
  portrait,
  leaving,
  onClose,
}) => (
  <div className="fixed inset-0 z-40 flex items-center justify-center p-4 pointer-events-none">
    <button
      type="button"
      onClick={onClose}
      aria-label="Qidiruv e’lonini yopish"
      className="dead-eye-animated pointer-events-auto relative w-[250px] sm:w-[290px] cursor-pointer text-center text-[#3b2412] shadow-[0_25px_60px_rgba(0,0,0,0.65)] rounded-[3px] px-5 pt-6 pb-4"
      style={{
        fontFamily: "'Rye', Georgia, serif",
        transform: 'rotate(-3deg)',
        background:
          'radial-gradient(circle at 25% 18%, #f6e7c1 0%, #e3c995 45%, #c9a46a 85%, #a9834e 100%)',
        animation: leaving
          ? `wanted-leave ${WANTED_LEAVE_MS}ms ease-in forwards`
          : 'wanted-drop 650ms cubic-bezier(0.2, 1.35, 0.45, 1)',
      }}
    >
      {/* The nail it hangs from. */}
      <span className="absolute left-1/2 top-2 w-3 h-3 -translate-x-1/2 rounded-full bg-[#2a1a0e] shadow-[inset_0_1px_1px_rgba(255,255,255,0.35)]" />
      <span className="absolute inset-2 border-2 border-[#5b3b1f]/60 rounded-[2px] pointer-events-none" />

      <span className="block text-[44px] sm:text-[52px] leading-none tracking-wide">WANTED</span>
      <span className="block mt-1 text-[11px] sm:text-xs tracking-[0.25em]">TIRIK YOKI O‘LIK</span>

      <span className="block mt-3 mx-auto w-[150px] sm:w-[170px] aspect-[3/4] border-[3px] border-[#3b2412] bg-[#c9a46a] overflow-hidden">
        {portrait && (
          <img
            src={portrait}
            alt=""
            className="w-full h-full object-cover"
            style={{ filter: 'sepia(1) contrast(1.15) brightness(0.92)' }}
          />
        )}
      </span>

      <span className="block mt-3 text-xl sm:text-2xl leading-tight">ARTHUR MORGAN</span>
      <span className="block mt-1 text-[11px] tracking-[0.2em]">MUKOFOT</span>
      <span className="block text-3xl sm:text-4xl leading-none">$5 000</span>
      <span className="block mt-3 text-[10px] tracking-wide opacity-80" style={{ fontFamily: 'inherit' }}>
        Van der Linde to‘dasi a’zosi
      </span>
    </button>
  </div>
);

/**
 * Red Dead Redemption 2 easter egg: Dead Eye. The page drains to sepia, red X marks land on
 * things in view, then they are shot one after another and leave bullet holes for a while.
 * Then a wanted poster drops in; clicking it (or waiting) ends the effect. Apart from the
 * poster, every layer ignores the pointer, so the page stays usable throughout.
 */
export const DeadEye: React.FC<EasterEggEffectProps> = ({ originRef, healSignal, onFinished }) => {
  const [targets] = useState(() => pickTargets(window.innerWidth < 640 ? 4 : 6));
  const [portrait, setPortrait] = useState<string | null>(null);
  const [shotsFired, setShotsFired] = useState(0);
  const [phase, setPhase] = useState<'aiming' | 'fading' | 'holes'>('aiming');
  const [wanted, setWanted] = useState<'hidden' | 'shown' | 'leaving'>('hidden');
  const [holesFading, setHolesFading] = useState(false);
  const onFinishedRef = useRef(onFinished);
  const flashLayerRef = useRef<HTMLDivElement>(null);
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    onFinishedRef.current = onFinished;
  }, [onFinished]);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timers: Array<ReturnType<typeof setTimeout>> = [];
    const at = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));

    const fireAt = AIM_START_MS + targets.length * MARK_INTERVAL_MS + 450;
    const shotsDone = fireAt + targets.length * SHOT_INTERVAL_MS;

    targets.forEach((target, index) => {
      at(fireAt + index * SHOT_INTERVAL_MS, () => {
        setShotsFired(index + 1);
        if (reducedMotion) return;
        const layer = flashLayerRef.current;
        if (layer) {
          const flash = document.createElement('div');
          flash.style.cssText = `position:absolute;left:${target.x}px;top:${target.y}px;width:70px;height:70px;border-radius:9999px;background:radial-gradient(circle, rgba(255,244,214,0.95), rgba(255,180,90,0.35) 45%, transparent 70%);animation:dead-eye-flash 180ms ease-out forwards;`;
          layer.appendChild(flash);
          setTimeout(() => flash.remove(), 220);
        }
        document.querySelector('main')?.animate(
          [
            { transform: 'translate(0, 0)' },
            { transform: 'translate(-4px, 2px)' },
            { transform: 'translate(3px, -2px)' },
            { transform: 'translate(0, 0)' },
          ],
          { duration: 120 },
        );
      });
    });

    const closeWanted = () => {
      timers.forEach(clearTimeout);
      timers.length = 0;
      stopRef.current = null;
      setWanted('leaving');
      at(WANTED_LEAVE_MS, () => setWanted('hidden'));
      at(WANTED_LEAVE_MS + HOLES_LINGER_MS, () => setHolesFading(true));
      at(WANTED_LEAVE_MS + HOLES_LINGER_MS + 900, () => onFinishedRef.current());
    };

    const finish = () => {
      timers.forEach(clearTimeout);
      timers.length = 0;
      setShotsFired(targets.length);
      setPhase('fading');
      at(600, () => {
        setPhase('holes');
        // The page's own poster is the portrait on the wanted poster.
        setPortrait(originRef.current?.parentElement?.querySelector('img')?.src ?? null);
        setWanted('shown');
        // From here, stopping means taking the poster down.
        stopRef.current = closeWanted;
      });
      at(600 + WANTED_STAY_MS, () => stopRef.current?.());
    };
    stopRef.current = () => {
      stopRef.current = null;
      finish();
    };
    at(shotsDone + 600, () => stopRef.current?.());

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') stopRef.current?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener('keydown', onKeyDown);
      stopRef.current = null;
    };
  }, [targets, originRef]);

  // Pressing the poster again ends Dead Eye early.
  useEffect(() => {
    if (healSignal > 0) stopRef.current?.();
  }, [healSignal]);

  const tinted = phase === 'aiming';

  return createPortal(
    <>
      <style>{STYLES}</style>
      <div
        aria-hidden="true"
        className="fixed inset-0 z-40 pointer-events-none transition-opacity duration-700"
        style={{
          opacity: tinted ? 1 : 0,
          backdropFilter: 'sepia(0.85) saturate(0.75) contrast(1.15) brightness(0.92)',
          WebkitBackdropFilter: 'sepia(0.85) saturate(0.75) contrast(1.15) brightness(0.92)',
          animation: 'dead-eye-in 600ms ease-out',
        }}
      >
        <div
          className="dead-eye-animated absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 45%, rgba(70, 22, 10, 0.6) 100%)',
            animation: 'dead-eye-pulse 1.1s ease-in-out infinite',
          }}
        />
      </div>

      <div
        aria-hidden="true"
        ref={flashLayerRef}
        className="absolute left-0 top-0 w-full z-40 pointer-events-none transition-opacity duration-700"
        style={{ height: 0, overflow: 'visible', opacity: holesFading ? 0 : 1 }}
      >
        {targets.map((target, index) => {
          const shot = index < shotsFired;
          return (
            <div key={`${target.x}-${target.y}`} className="absolute" style={{ left: target.x, top: target.y }}>
              {shot ? (
                <div className="-translate-x-1/2 -translate-y-1/2">
                  <BulletHole cracks={target.cracks} />
                </div>
              ) : (
                tinted && (
                  <div
                    className="dead-eye-animated absolute w-6 h-6"
                    style={{
                      transform: 'translate(-50%, -50%) rotate(45deg)',
                      animation: `dead-eye-mark 260ms ease-out ${AIM_START_MS + index * MARK_INTERVAL_MS}ms backwards`,
                    }}
                  >
                    <span className="absolute left-1/2 top-0 h-full w-[3px] -translate-x-1/2 rounded bg-[#e0141e] shadow-[0_0_8px_rgba(224,20,30,0.9)]" />
                    <span className="absolute top-1/2 left-0 w-full h-[3px] -translate-y-1/2 rounded bg-[#e0141e] shadow-[0_0_8px_rgba(224,20,30,0.9)]" />
                  </div>
                )
              )}
            </div>
          );
        })}
      </div>

      {wanted !== 'hidden' && (
        <WantedPoster portrait={portrait} leaving={wanted === 'leaving'} onClose={() => stopRef.current?.()} />
      )}
    </>,
    document.body,
  );
};
