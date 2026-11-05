import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { EasterEggEffectProps } from './GameEasterEgg';

type Phase = 'growing' | 'infected' | 'healing';

interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

interface Tip {
  x: number;
  y: number;
  angle: number;
  curl: number;
  width: number;
  speed: number;
  age: number;
  life: number;
}

interface Lobe {
  x: number;
  y: number;
  rx: number;
  ry: number;
  rotation: number;
  start: number;
}

interface Spore {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  phase: number;
}

type GrowthEvent =
  | { delay: number; kind: 'tips'; x: number; y: number; count: number }
  | { delay: number; kind: 'plate'; x: number; y: number };

/** How long the infection front takes to reach the far end of the page. */
const COVER_SECONDS = 6;
/** The firefly and the caption appear once the outbreak is clearly visible. */
const INFECTED_AT_SECONDS = 4.5;
const LOBE_GROW_SECONDS = 0.9;
const HEAL_SECONDS = 1.8;
/** How long the closing caption stays up after the firefly is caught. */
const HEAL_HOLD_SECONDS = 3;
/** Canvas pixels are budgeted because the canvas spans the whole, very tall page. */
const PIXEL_BUDGET = { desktop: 6_000_000, mobile: 2_500_000 };

const HYPHA_BUCKETS = [
  { maxWidth: 1.1, drawWidth: 0.9, color: '#7c7639' },
  { maxWidth: 2.1, drawWidth: 1.7, color: '#958c49' },
  { maxWidth: Infinity, drawWidth: 2.9, color: '#b4a95f' },
];

const random = (min: number, max: number) => min + Math.random() * (max - min);

const expand = (el: Element, margin: number): Rect => {
  const r = el.getBoundingClientRect();
  return {
    left: r.left + window.scrollX - margin,
    top: r.top + window.scrollY - margin,
    right: r.right + window.scrollX + margin,
    bottom: r.bottom + window.scrollY + margin,
  };
};

const createSporeSprite = (): HTMLCanvasElement => {
  const sprite = document.createElement('canvas');
  sprite.width = sprite.height = 32;
  const ctx = sprite.getContext('2d');
  if (ctx) {
    const glow = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    glow.addColorStop(0, 'rgba(232, 224, 160, 0.95)');
    glow.addColorStop(0.35, 'rgba(200, 190, 110, 0.4)');
    glow.addColorStop(1, 'rgba(200, 190, 110, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 32, 32);
  }
  return sprite;
};

/**
 * The Last of Us easter egg: cordyceps spreads from the trigger across the page and
 * a firefly burns it away again. The growth lives on a page-sized canvas, so it
 * scrolls with the content. Every layer ignores pointer events and the hyphae grow
 * around interactive elements, so buying and claiming keep working mid-outbreak.
 */
export const CordycepsOutbreak: React.FC<EasterEggEffectProps> = ({ originRef, healSignal, onFinished }) => {
  const [reducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [phase, setPhase] = useState<Phase>(reducedMotion ? 'infected' : 'growing');
  const [pageHeight] = useState(() => document.documentElement.scrollHeight);

  const growthCanvasRef = useRef<HTMLCanvasElement>(null);
  const sporeCanvasRef = useRef<HTMLCanvasElement>(null);
  const fireflyRef = useRef<HTMLButtonElement>(null);
  const burstRef = useRef<HTMLDivElement>(null);
  const healRef = useRef<(() => void) | null>(null);
  const fireflySlowRef = useRef(false);
  const onFinishedRef = useRef(onFinished);

  useEffect(() => {
    onFinishedRef.current = onFinished;
  }, [onFinished]);

  useEffect(() => {
    const growthCanvas = growthCanvasRef.current;
    const sporeCanvas = sporeCanvasRef.current;
    const growth = growthCanvas?.getContext('2d');
    const spores = sporeCanvas?.getContext('2d');
    const origin = originRef.current;
    if (!growthCanvas || !sporeCanvas || !growth || !spores || !origin) return;

    const pageWidth = document.documentElement.clientWidth;
    const isMobile = pageWidth < 768;

    const pixelBudget = isMobile ? PIXEL_BUDGET.mobile : PIXEL_BUDGET.desktop;
    const scale = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(pixelBudget / (pageWidth * pageHeight)));
    growthCanvas.width = Math.round(pageWidth * scale);
    growthCanvas.height = Math.round(pageHeight * scale);
    growth.scale(scale, scale);
    growth.lineCap = 'round';

    const originRect = expand(origin, 0);
    const originX = (originRect.left + originRect.right) / 2;
    const originY = (originRect.top + originRect.bottom) / 2;

    const main = document.querySelector('main') ?? document.body;
    const obstacles = Array.from(main.querySelectorAll('a, button, iframe, input, select, textarea'))
      .map((el) => expand(el, 5))
      .filter((r) => r.right - r.left > 10 && r.bottom - r.top > 10);
    const isBlocked = (x: number, y: number, margin = 0) =>
      x < 0 ||
      y < 0 ||
      x > pageWidth ||
      y > pageHeight ||
      obstacles.some(
        (r) => x > r.left - margin && x < r.right + margin && y > r.top - margin && y < r.bottom + margin,
      );

    // The infection front moves outward from the trigger, so nearby parts of the page
    // are overrun first and the far end is reached at COVER_SECONDS.
    const farthest = Math.max(
      Math.hypot(originX, originY),
      Math.hypot(pageWidth - originX, originY),
      Math.hypot(originX, pageHeight - originY),
      Math.hypot(pageWidth - originX, pageHeight - originY),
    );
    const frontDelay = (x: number, y: number) =>
      (Math.hypot(x - originX, y - originY) / farthest) * COVER_SECONDS;

    const events: GrowthEvent[] = [];
    const cell = isMobile ? 240 : 340;
    for (let cy = 0; cy < pageHeight; cy += cell) {
      for (let cx = 0; cx < pageWidth; cx += cell) {
        const x = cx + random(0, cell);
        const y = cy + random(0, cell);
        if (isBlocked(x, y)) continue;
        events.push({ delay: frontDelay(x, y) + random(0, 0.4), kind: 'tips', x, y, count: Math.round(random(2, 4)) });
      }
    }
    main.querySelectorAll('.rounded-2xl').forEach((card) => {
      const r = expand(card, 0);
      if (r.right - r.left < 220 || r.bottom - r.top < 100) return;
      // Two opposite corners per card reads as growth; all four reads as decoration.
      const corners: Array<[number, number]> =
        Math.random() < 0.5
          ? [[r.left, r.top], [r.right, r.bottom]]
          : [[r.right, r.top], [r.left, r.bottom]];
      for (const [x, y] of corners) {
        events.push({ delay: frontDelay(x, y) + random(0, 0.5), kind: 'plate', x, y });
      }
    });
    for (let y = random(80, 300); y < pageHeight; y += random(320, 720)) {
      const x = Math.random() < 0.5 ? 0 : pageWidth;
      events.push({ delay: frontDelay(x, y) + random(0, 0.5), kind: 'plate', x, y });
    }
    events.sort((a, b) => a.delay - b.delay);

    const maxTips = isMobile ? 110 : 280;
    const tips: Tip[] = [];
    const lobes: Lobe[] = [];
    let nextEvent = 0;
    let simTime = 0;

    const spawnTip = (x: number, y: number, angle: number, width: number, life: number) => {
      if (tips.length >= maxTips) return;
      tips.push({ x, y, angle, width, life, curl: random(-1.4, 1.4), speed: random(130, 230), age: 0 });
    };

    const spawnPlate = (x: number, y: number) => {
      const count = Math.round(random(4, 8));
      const maxRadius = isMobile ? 24 : 40;
      for (let i = 0; i < count; i += 1) {
        const lx = x + random(-maxRadius, maxRadius) * 0.9;
        const ly = y + random(-maxRadius, maxRadius) * 0.9;
        const rx = random(maxRadius * 0.35, maxRadius);
        if (isBlocked(lx, ly, rx)) continue;
        lobes.push({ x: lx, y: ly, rx, ry: rx * random(0.6, 0.82), rotation: random(0, Math.PI), start: simTime + i * 0.12 });
      }
      spawnTip(x, y, random(0, Math.PI * 2), 2.4, random(0.8, 1.4));
    };

    const drawLobe = (lobe: Lobe, progress: number) => {
      const eased = 1 - (1 - progress) ** 3;
      growth.save();
      growth.translate(lobe.x, lobe.y);
      growth.rotate(lobe.rotation);
      growth.scale(lobe.rx * eased, lobe.ry * eased);

      growth.fillStyle = 'rgba(16, 17, 8, 0.55)';
      growth.beginPath();
      growth.ellipse(0.05, 0.1, 1.04, 1.04, 0, 0, Math.PI * 2);
      growth.fill();

      const skin = growth.createRadialGradient(-0.15, -0.15, 0.05, 0, 0, 1);
      skin.addColorStop(0, '#39371b');
      skin.addColorStop(0.5, '#6a6230');
      skin.addColorStop(0.84, '#a99c58');
      skin.addColorStop(1, '#d8cf98');
      growth.fillStyle = skin;
      growth.beginPath();
      growth.arc(0, 0, 1, 0, Math.PI * 2);
      growth.fill();

      if (progress >= 1) {
        // Radial gills are only worth drawing once the lobe has stopped growing.
        growth.strokeStyle = 'rgba(26, 24, 10, 0.32)';
        growth.lineWidth = 0.022;
        growth.beginPath();
        for (let i = 0; i < 26; i += 1) {
          const a = (i / 26) * Math.PI * 2 + random(-0.05, 0.05);
          growth.moveTo(Math.cos(a) * random(0.2, 0.4), Math.sin(a) * random(0.2, 0.4));
          growth.lineTo(Math.cos(a) * 0.96, Math.sin(a) * 0.96);
        }
        growth.stroke();
      }
      growth.restore();
    };

    const advanceGrowth = (dt: number) => {
      simTime += dt;

      while (nextEvent < events.length && events[nextEvent].delay <= simTime) {
        const event = events[nextEvent];
        nextEvent += 1;
        if (event.kind === 'plate') {
          spawnPlate(event.x, event.y);
        } else {
          for (let i = 0; i < event.count; i += 1) {
            spawnTip(event.x, event.y, random(0, Math.PI * 2), random(1.2, 2.6), random(0.7, 1.5));
          }
        }
      }

      const segments = HYPHA_BUCKETS.map(() => new Path2D());
      const nodules: Array<[number, number, number]> = [];

      for (let i = tips.length - 1; i >= 0; i -= 1) {
        const tip = tips[i];
        tip.age += dt;
        tip.angle += tip.curl * dt + (Math.random() + Math.random() - 1) * 5 * Math.sqrt(dt) * 0.35;
        const distance = tip.speed * dt;
        const nextX = tip.x + Math.cos(tip.angle) * distance;
        const nextY = tip.y + Math.sin(tip.angle) * distance;

        if (tip.age >= tip.life || isBlocked(nextX, nextY)) {
          tips.splice(i, 1);
          continue;
        }

        const width = tip.width * (1 - (tip.age / tip.life) * 0.7);
        const bucket = HYPHA_BUCKETS.findIndex((b) => width <= b.maxWidth);
        segments[bucket].moveTo(tip.x, tip.y);
        segments[bucket].lineTo(nextX, nextY);
        tip.x = nextX;
        tip.y = nextY;

        if (Math.random() < 3 * dt) {
          nodules.push([nextX, nextY, random(1.2, 2.8)]);
        }
        if (Math.random() < 1.6 * dt && width > 0.8) {
          const side = Math.random() < 0.5 ? -1 : 1;
          spawnTip(nextX, nextY, tip.angle + side * random(0.4, 1.1), width * 0.8, tip.life * random(0.5, 0.85));
        }
      }

      HYPHA_BUCKETS.forEach((bucket, index) => {
        growth.strokeStyle = 'rgba(18, 19, 9, 0.75)';
        growth.lineWidth = bucket.drawWidth + 1.3;
        growth.stroke(segments[index]);
      });
      HYPHA_BUCKETS.forEach((bucket, index) => {
        growth.strokeStyle = bucket.color;
        growth.lineWidth = bucket.drawWidth;
        growth.stroke(segments[index]);
      });

      growth.fillStyle = '#cfc47c';
      for (const [x, y, r] of nodules) {
        growth.beginPath();
        growth.arc(x, y, r, 0, Math.PI * 2);
        growth.fill();
      }

      for (let i = lobes.length - 1; i >= 0; i -= 1) {
        const lobe = lobes[i];
        const progress = (simTime - lobe.start) / LOBE_GROW_SECONDS;
        if (progress <= 0) continue;
        drawLobe(lobe, Math.min(progress, 1));
        if (progress >= 1) lobes.splice(i, 1);
      }
    };

    // The first tips leave the trigger from its top and bottom edges. Its row is packed
    // with other buttons, so tips sent sideways would die on them straight away.
    for (let i = 0; i < 8; i += 1) {
      const side = i % 2 === 0 ? -1 : 1;
      const y = side < 0 ? originRect.top - 7 : originRect.bottom + 7;
      spawnTip(originX + random(-14, 14), y, (side * Math.PI) / 2 + random(-0.7, 0.7), random(2.2, 3.2), random(0.9, 1.5));
    }

    let burstX = originX - window.scrollX;
    let burstY = originY - window.scrollY;
    let finishTimer: ReturnType<typeof setTimeout> | undefined;

    const resizeSporeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      sporeCanvas.width = Math.round(window.innerWidth * dpr);
      sporeCanvas.height = Math.round(window.innerHeight * dpr);
      spores.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resizeSporeCanvas();
    window.addEventListener('resize', resizeSporeCanvas);

    const finish = () => {
      if (origin.matches(':focus-within') || document.activeElement === document.body) origin.focus({ preventScroll: true });
      onFinishedRef.current();
    };

    if (reducedMotion) {
      // No growth animation: settle the simulation up front and show the end state.
      for (let i = 0; i < 300; i += 1) advanceGrowth(1 / 30);

      healRef.current = () => {
        healRef.current = null;
        growth.clearRect(0, 0, pageWidth, pageHeight);
        setPhase('healing');
        finishTimer = setTimeout(finish, HEAL_HOLD_SECONDS * 1000);
      };

      return () => {
        clearTimeout(finishTimer);
        window.removeEventListener('resize', resizeSporeCanvas);
        healRef.current = null;
      };
    }

    const sprite = createSporeSprite();
    const sporeCount = isMobile ? 28 : 70;
    const sporeField: Spore[] = Array.from({ length: sporeCount }, () => ({
      x: random(0, window.innerWidth),
      y: random(0, window.innerHeight),
      vx: random(-10, 10),
      vy: random(-22, -6),
      size: random(3, 11),
      phase: random(0, Math.PI * 2),
    }));

    let healStart: number | null = null;
    let healMaxRadius = 0;
    let healX = 0;
    let healY = 0;
    let sporeAlpha = 0;
    let announced = false;
    let fireflyClock = random(0, 100);
    let raf = 0;
    let last = performance.now();

    healRef.current = () => {
      healRef.current = null;
      const fireflyEl = fireflyRef.current;
      if (fireflyEl && fireflyEl.style.visibility === 'visible') {
        const rect = fireflyEl.getBoundingClientRect();
        burstX = rect.left + rect.width / 2;
        burstY = rect.top + rect.height / 2;
      } else {
        const rect = origin.getBoundingClientRect();
        burstX = rect.left + rect.width / 2;
        burstY = rect.top + rect.height / 2;
      }
      healX = burstX + window.scrollX;
      healY = burstY + window.scrollY;
      healMaxRadius = Math.max(
        Math.hypot(healX, healY),
        Math.hypot(pageWidth - healX, healY),
        Math.hypot(healX, pageHeight - healY),
        Math.hypot(pageWidth - healX, pageHeight - healY),
      ) + 80;
      healStart = performance.now();
      setPhase('healing');

      const burst = burstRef.current;
      if (burst) {
        burst.style.left = `${burstX}px`;
        burst.style.top = `${burstY}px`;
        burst.animate(
          [
            { transform: 'translate(-50%, -50%) scale(0.2)', opacity: 0.9 },
            { transform: 'translate(-50%, -50%) scale(14)', opacity: 0 },
          ],
          { duration: HEAL_SECONDS * 1000, easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)', fill: 'forwards' },
        );
      }
      finishTimer = setTimeout(finish, HEAL_HOLD_SECONDS * 1000);
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      if (healStart === null) {
        advanceGrowth(dt);
        if (!announced && simTime >= INFECTED_AT_SECONDS) {
          announced = true;
          setPhase('infected');
        }
      } else {
        // Burn outward with a soft edge: quadratic so the visible part isn't gone instantly.
        const progress = Math.min((now - healStart) / (HEAL_SECONDS * 1000), 1);
        const radius = healMaxRadius * progress * progress;
        if (progress >= 1) {
          growth.clearRect(0, 0, pageWidth, pageHeight);
        } else if (radius > 1) {
          const edge = growth.createRadialGradient(healX, healY, radius * 0.72, healX, healY, radius);
          edge.addColorStop(0, 'rgba(0, 0, 0, 1)');
          edge.addColorStop(1, 'rgba(0, 0, 0, 0)');
          growth.globalCompositeOperation = 'destination-out';
          growth.fillStyle = edge;
          growth.beginPath();
          growth.arc(healX, healY, radius, 0, Math.PI * 2);
          growth.fill();
          growth.globalCompositeOperation = 'source-over';
        }
      }

      const targetAlpha = healStart === null ? Math.min(simTime / 3, 1) : 0;
      sporeAlpha += (targetAlpha - sporeAlpha) * Math.min(dt * 3, 1);
      const viewWidth = window.innerWidth;
      const viewHeight = window.innerHeight;
      spores.clearRect(0, 0, viewWidth, viewHeight);
      for (const spore of sporeField) {
        spore.phase += dt;
        spore.x += (spore.vx + Math.sin(spore.phase) * 12) * dt;
        spore.y += spore.vy * dt;
        if (spore.y < -20) spore.y = viewHeight + 20;
        if (spore.x < -20) spore.x = viewWidth + 20;
        if (spore.x > viewWidth + 20) spore.x = -20;
        spores.globalAlpha = sporeAlpha * (0.3 + 0.35 * (Math.sin(spore.phase * 1.7) + 1));
        spores.drawImage(sprite, spore.x - spore.size, spore.y - spore.size, spore.size * 2, spore.size * 2);
      }
      spores.globalAlpha = 1;

      const fireflyEl = fireflyRef.current;
      if (fireflyEl) {
        // Summed sines wander without ever leaving the safe middle of the viewport.
        fireflyClock += dt * (fireflySlowRef.current ? 0.12 : 1);
        const t = fireflyClock;
        const x = viewWidth * (0.5 + 0.36 * Math.sin(t * 0.23) + 0.07 * Math.sin(t * 1.1));
        const y = viewHeight * (0.5 + 0.26 * Math.sin(t * 0.31 + 1.7) + 0.05 * Math.cos(t * 1.4));
        fireflyEl.style.transform = `translate(${x - 28}px, ${y - 28}px)`;
        fireflyEl.style.opacity = String(0.72 + 0.28 * Math.sin(t * 3.1));
        fireflyEl.style.visibility = 'visible';
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(finishTimer);
      window.removeEventListener('resize', resizeSporeCanvas);
      healRef.current = null;
      growth.setTransform(1, 0, 0, 1, 0, 0);
      growth.clearRect(0, 0, growthCanvas.width, growthCanvas.height);
    };
  }, [originRef, pageHeight, reducedMotion]);

  // A repeat click on the trigger cures the page too, not only the firefly.
  useEffect(() => {
    if (healSignal > 0) healRef.current?.();
  }, [healSignal]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') healRef.current?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const infected = phase === 'infected';
  const healing = phase === 'healing';

  return createPortal(
    <>
      <div
        aria-hidden="true"
        className="absolute left-0 top-0 z-40 w-full overflow-hidden pointer-events-none"
        style={{ height: pageHeight }}
      >
        <canvas ref={growthCanvasRef} className="block h-full w-full" />
      </div>

      <div
        aria-hidden="true"
        className="fixed inset-0 z-40 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(74, 72, 22, 0.14) 40%, rgba(30, 34, 10, 0.62) 100%)',
          opacity: healing ? 0 : 1,
          transition: healing ? 'opacity 1.4s ease-out' : `opacity ${COVER_SECONDS}s ease-in`,
          // Starts transparent; the keyframe avoids a one-frame flash before the transition.
          animation: healing ? undefined : `cordyceps-fade-in ${COVER_SECONDS}s ease-in`,
        }}
      />
      <style>{'@keyframes cordyceps-fade-in { from { opacity: 0; } to { opacity: 1; } }'}</style>

      <canvas ref={sporeCanvasRef} aria-hidden="true" className="fixed inset-0 z-40 h-full w-full pointer-events-none" />

      <div
        ref={burstRef}
        aria-hidden="true"
        className="fixed z-40 h-[30vmax] w-[30vmax] rounded-full pointer-events-none"
        style={{
          opacity: 0,
          background:
            'radial-gradient(circle, rgba(255, 244, 190, 0.95) 0%, rgba(255, 205, 90, 0.45) 35%, rgba(255, 190, 60, 0) 70%)',
        }}
      />

      {infected && (
        <button
          ref={fireflyRef}
          type="button"
          aria-label="Olovli qo‘ng‘iz: infeksiyani tozalash"
          onClick={() => healRef.current?.()}
          onPointerEnter={() => {
            fireflySlowRef.current = true;
          }}
          onPointerLeave={() => {
            fireflySlowRef.current = false;
          }}
          onFocus={() => {
            fireflySlowRef.current = true;
          }}
          onBlur={() => {
            fireflySlowRef.current = false;
          }}
          className="fixed left-0 top-0 z-40 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full"
          // The animation loop positions and reveals it; without motion it just sits still.
          style={reducedMotion ? { left: '70%', top: '30%' } : { visibility: 'hidden' }}
        >
          <span
            className="block h-2.5 w-2.5 rounded-full"
            style={{
              background: '#fff6c2',
              boxShadow: '0 0 16px 7px #ffc93c, 0 0 60px 24px rgba(255, 170, 30, 0.55)',
            }}
          />
        </button>
      )}

      <div
        role="status"
        className="fixed bottom-6 left-1/2 z-40 w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-xl bg-[#0B0D12]/80 px-4 py-2.5 text-center backdrop-blur-sm transition-opacity duration-700 pointer-events-none"
        style={{ opacity: infected || healing ? 1 : 0 }}
      >
        {healing ? (
          <p className="text-sm sm:text-base font-black tracking-wide text-amber-200">Yorug‘likni izla</p>
        ) : (
          infected && (
            <>
              <p className="text-sm sm:text-base font-black tracking-wide text-[#d8cf98]">Infeksiya tarqaldi</p>
              <p className="mt-0.5 text-[11px] sm:text-xs text-gray-300">Olovli qo‘ng‘izni ushlang</p>
            </>
          )
        )}
      </div>
    </>,
    document.body,
  );
};
