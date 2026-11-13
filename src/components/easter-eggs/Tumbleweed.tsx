import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/** Counted from when the effect has loaded, about a second after the page opens. */
const FIRST_ROLL_MS: [number, number] = [3000, 4000];
const NEXT_ROLL_MS: [number, number] = [25000, 40000];
const MAX_ROLLS_PER_VISIT = 4;
const STRAW_PIECES = 26;

const random = (min: number, max: number) => min + Math.random() * (max - min);

interface Branch {
  d: string;
  color: string;
  width: number;
}

/** Tangled twigs inside a 110-unit circle. Built once, so every tumbleweed on the page matches. */
const BRANCHES: Branch[] = (() => {
  const colors = ['#8a6a3f', '#a9834e', '#6b4f2c', '#b8935a', '#7a5a33'];
  const point = (angle: number, radius: number) =>
    `${(Math.cos(angle) * radius).toFixed(1)} ${(Math.sin(angle) * radius).toFixed(1)}`;
  return Array.from({ length: 48 }, () => {
    const start = random(0, Math.PI * 2);
    return {
      d: `M${point(start, random(6, 48))} Q${point(start + random(0.6, 1.6), random(20, 54))} ${point(
        start + random(1.2, 3),
        random(8, 50),
      )}`,
      color: colors[Math.floor(Math.random() * colors.length)],
      width: random(1.1, 2.3),
    };
  });
})();

const TumbleweedArt: React.FC = () => (
  <svg viewBox="-56 -56 112 112" className="w-full h-full overflow-visible" aria-hidden="true">
    <circle r="22" fill="rgba(70, 50, 25, 0.25)" />
    <g fill="none" strokeLinecap="round" opacity="0.92">
      {BRANCHES.map((branch, index) => (
        <path key={index} d={branch.d} stroke={branch.color} strokeWidth={branch.width} />
      ))}
    </g>
  </svg>
);

/** Straw flying out of a tumbleweed that was clicked. */
function burst(x: number, y: number, size: number) {
  for (let i = 0; i < STRAW_PIECES; i += 1) {
    const piece = document.createElement('span');
    const length = random(6, 16) * (size / 84);
    piece.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:${length}px;height:2px;border-radius:2px;background:${
      BRANCHES[i % BRANCHES.length].color
    };pointer-events:none;z-index:40;`;
    document.body.appendChild(piece);
    const angle = random(0, Math.PI * 2);
    const distance = random(40, 130) * (size / 84);
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance - 30;
    const spin = random(-540, 540);
    piece
      .animate(
        [
          { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
          { transform: `translate(${dx}px, ${dy}px) rotate(${spin / 2}deg)`, opacity: 1, offset: 0.55 },
          // Gravity pulls the straw down for the last part of the flight.
          { transform: `translate(${dx * 1.25}px, ${dy + 90}px) rotate(${spin}deg)`, opacity: 0 },
        ],
        { duration: random(700, 1100), easing: 'cubic-bezier(0.2, 0.7, 0.4, 1)', fill: 'forwards' },
      )
      .finished.then(() => piece.remove(), () => piece.remove());
  }
}

/** One tumbleweed rolling across the bottom of the screen with the wind, left to right. */
const RollingTumbleweed: React.FC<{ onGone: () => void }> = ({ onGone }) => {
  const ref = useRef<HTMLButtonElement>(null);
  const poppedRef = useRef(false);
  const onGoneRef = useRef(onGone);

  useEffect(() => {
    onGoneRef.current = onGone;
  }, [onGone]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const isMobile = window.innerWidth < 640;
    const size = isMobile ? 56 : 84;
    const speed = (isMobile ? random(95, 130) : random(160, 220));
    const bouncePeriod = random(0.8, 1.05);
    el.style.width = el.style.height = `${size}px`;

    const start = performance.now();
    let lastHop = 0;
    let raf = 0;

    const tick = (now: number) => {
      if (poppedRef.current) return;
      const t = (now - start) / 1000;
      const x = -size + speed * t;
      if (x > window.innerWidth + size) {
        onGoneRef.current();
        return;
      }
      // Bounces get lower as it goes, like it is losing the wind.
      const height = Math.max(10, 46 - t * 4) * (size / 84);
      const hop = Math.floor(t / bouncePeriod);
      const lift = Math.abs(Math.sin((Math.PI * t) / bouncePeriod)) * height;
      const ground = window.innerHeight - size - 14;
      const rotation = (x / (size / 2)) * (180 / Math.PI);
      el.style.transform = `translate(${x}px, ${ground - lift}px) rotate(${rotation}deg)`;

      if (hop !== lastHop) {
        lastHop = hop;
        const puff = document.createElement('span');
        puff.style.cssText = `position:fixed;left:${x + size / 2}px;top:${window.innerHeight - 18}px;width:${size * 0.6}px;height:${
          size * 0.22
        }px;border-radius:9999px;background:rgba(190,160,110,0.35);pointer-events:none;z-index:39;transform:translate(-50%,-50%);`;
        document.body.appendChild(puff);
        puff
          .animate(
            [
              { transform: 'translate(-50%, -50%) scale(0.4)', opacity: 0.8 },
              { transform: 'translate(-50%, -60%) scale(1.6)', opacity: 0 },
            ],
            { duration: 700, easing: 'ease-out', fill: 'forwards' },
          )
          .finished.then(() => puff.remove(), () => puff.remove());
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const pop = () => {
    const el = ref.current;
    if (!el || poppedRef.current) return;
    poppedRef.current = true;
    const rect = el.getBoundingClientRect();
    burst(rect.left + rect.width / 2, rect.top + rect.height / 2, rect.width);
    el.style.visibility = 'hidden';
    setTimeout(() => onGoneRef.current(), 1100);
  };

  return (
    <button
      ref={ref}
      type="button"
      tabIndex={-1}
      aria-hidden="true"
      onClick={pop}
      className="fixed left-0 top-0 z-40 cursor-pointer p-0 border-0 bg-transparent"
      style={{ transform: 'translate(-200px, -200px)' }}
    >
      <TumbleweedArt />
    </button>
  );
};

/**
 * Red Dead Redemption easter egg: now and then a tumbleweed rolls across the bottom of the
 * screen. Clicking it bursts it into straw. Skipped for people who prefer reduced motion.
 */
export const Tumbleweed: React.FC = () => {
  const [rolls, setRolls] = useState(0);
  const [rolling, setRolling] = useState(false);

  useEffect(() => {
    if (rolling || rolls >= MAX_ROLLS_PER_VISIT) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const [min, max] = rolls === 0 ? FIRST_ROLL_MS : NEXT_ROLL_MS;
    const timer = setTimeout(() => setRolling(true), random(min, max));
    return () => clearTimeout(timer);
  }, [rolling, rolls]);

  if (!rolling) return null;
  return createPortal(
    <RollingTumbleweed
      key={rolls}
      onGone={() => {
        setRolling(false);
        setRolls((n) => n + 1);
      }}
    />,
    document.body,
  );
};
