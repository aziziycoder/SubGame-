import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { LicenseEffectProps } from './LicenseEasterEgg';

const SPRITE_WIDTH = 120;
const SPRITE_HEIGHT = 48;
const SPRITE_RESOLUTION = 2;
const GAIT_FRAMES = 6;
/** Pixels a full-size rat travels per gait frame, so faster rats also scurry faster. */
const FRAME_DISTANCE = 15;
/** Most of the horde crosses within this window, in seconds. */
const HORDE_SPREAD_SECONDS = 2.8;

interface Rat {
  delay: number;
  speed: number;
  y: number;
  scale: number;
  wander: number;
  gaitOffset: number;
}

const random = (min: number, max: number) => min + Math.random() * (max - min);

/** Draws one gait frame of a rat running left, in a 120×48 space. */
const createRatFrame = (frame: number): HTMLCanvasElement => {
  const sprite = document.createElement('canvas');
  sprite.width = SPRITE_WIDTH * SPRITE_RESOLUTION;
  sprite.height = SPRITE_HEIGHT * SPRITE_RESOLUTION;
  const ctx = sprite.getContext('2d');
  if (!ctx) return sprite;
  ctx.scale(SPRITE_RESOLUTION, SPRITE_RESOLUTION);
  ctx.lineCap = 'round';

  const phase = (frame / GAIT_FRAMES) * Math.PI * 2;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(44, 44, 34, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  const tailSwing = Math.sin(phase) * 7;
  ctx.strokeStyle = '#7d5f58';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(68, 28);
  ctx.bezierCurveTo(82, 22 + tailSwing, 96, 36 - tailSwing, 116, 28 + tailSwing);
  ctx.stroke();

  // Front and back pairs move in opposite phase: the rat's gallop.
  const legs: Array<[x: number, offset: number]> = [
    [24, 0],
    [31, Math.PI * 0.6],
    [58, Math.PI],
    [65, Math.PI * 1.6],
  ];
  ctx.strokeStyle = '#2b211b';
  ctx.lineWidth = 2.6;
  for (const [x, offset] of legs) {
    const swing = Math.sin(phase + offset) * 7;
    const lift = Math.max(0, Math.cos(phase + offset)) * 3.5;
    ctx.beginPath();
    ctx.moveTo(x, 33);
    ctx.lineTo(x + swing, 43 - lift);
    ctx.stroke();
  }

  const bodyBob = Math.sin(phase * 2) * 0.8;
  const fur = ctx.createLinearGradient(0, 12, 0, 40);
  fur.addColorStop(0, '#4a3b30');
  fur.addColorStop(0.55, '#231a15');
  fur.addColorStop(1, '#120d0a');
  ctx.fillStyle = fur;

  ctx.beginPath();
  ctx.ellipse(47, 26 + bodyBob, 25, 12.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head tapering into the snout.
  ctx.beginPath();
  ctx.moveTo(34, 16 + bodyBob);
  ctx.quadraticCurveTo(18, 17 + bodyBob, 5, 29 + bodyBob);
  ctx.quadraticCurveTo(18, 37 + bodyBob, 36, 36 + bodyBob);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#5b463b';
  ctx.beginPath();
  ctx.arc(28, 16 + bodyBob, 4.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8d6a60';
  ctx.beginPath();
  ctx.arc(28, 16.5 + bodyBob, 2.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#c4574a';
  ctx.beginPath();
  ctx.arc(17, 24 + bodyBob, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#a97a70';
  ctx.beginPath();
  ctx.arc(5.5, 29 + bodyBob, 1.6, 0, Math.PI * 2);
  ctx.fill();

  return sprite;
};

/**
 * A Plague Tale easter egg: a rat horde runs across the screen from right to left when
 * a license is obtained. It ignores pointer events and plays once. People who asked for
 * reduced motion skip it, since the horde has no meaningful still version.
 */
export const RatSwarm: React.FC<LicenseEffectProps> = ({ onFinished }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onFinishedRef = useRef(onFinished);

  useEffect(() => {
    onFinishedRef.current = onFinished;
  }, [onFinished]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onFinishedRef.current();
      return;
    }
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const isMobile = window.innerWidth < 768;
    const sizeFactor = isMobile ? 0.62 : 1;
    // Narrow screens need slower rats, or the horde is gone before it registers.
    const speedFactor = Math.min(1, Math.max(0.45, window.innerWidth / 1400));

    const frames = Array.from({ length: GAIT_FRAMES }, (_, frame) => createRatFrame(frame));
    const rats: Rat[] = Array.from({ length: isMobile ? 32 : 80 }, () => {
      // Lower on the screen means closer to the viewer, so larger and faster.
      const depth = Math.random() ** 0.7;
      return {
        delay: (Math.random() + Math.random()) * 0.5 * HORDE_SPREAD_SECONDS,
        speed: (random(420, 620) + depth * 180) * speedFactor,
        y: window.innerHeight * (0.1 + depth * 0.86),
        scale: (0.6 + depth * 0.85) * sizeFactor,
        wander: random(0, Math.PI * 2),
        gaitOffset: Math.floor(random(0, GAIT_FRAMES)),
      };
    }).sort((a, b) => a.y - b.y);

    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const elapsed = (now - start) / 1000;
      const viewWidth = window.innerWidth;
      ctx.clearRect(0, 0, viewWidth, window.innerHeight);

      let running = false;
      for (const rat of rats) {
        const width = SPRITE_WIDTH * rat.scale;
        const height = SPRITE_HEIGHT * rat.scale;
        const travelled = rat.speed * (elapsed - rat.delay);
        const x = viewWidth - travelled;
        if (x + width < 0) continue;
        running = true;
        if (travelled < 0) continue;

        const frame = (Math.floor(travelled / (FRAME_DISTANCE * rat.scale)) + rat.gaitOffset) % GAIT_FRAMES;
        const y = rat.y - height + Math.sin(travelled * 0.012 + rat.wander) * 10;
        ctx.drawImage(frames[frame], x, y, width, height);
      }

      if (running) {
        raf = requestAnimationFrame(tick);
      } else {
        onFinishedRef.current();
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return createPortal(
    <canvas ref={canvasRef} aria-hidden="true" className="fixed inset-0 z-40 h-full w-full pointer-events-none" />,
    document.body,
  );
};
