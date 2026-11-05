import React from 'react';

/** Drawn in the poster's own 2:3 space, so anything outside 0–200 × 0–300 peeks out from behind it. */
const HYPHAE = [
  { d: 'M30 12C22-4 8-6-2-22', delay: 0 },
  { d: 'M14-6C6-6-8-2-18-8', delay: 1 },
  { d: 'M96 8C92-6 100-12 94-24', delay: 0.5 },
  { d: 'M165 10C172-8 168-18 182-32', delay: 0.2 },
  { d: 'M171-14C180-14 190-10 198-20', delay: 1.1 },
  { d: 'M8 90C-6 86-10 100-24 94', delay: 0.7 },
  { d: 'M8 190C-4 196-8 186-22 198', delay: 0.3 },
  { d: 'M-8 192C-12 202-14 208-20 216', delay: 1.2 },
  { d: 'M194 140C206 138 208 150 216 146', delay: 0.9 },
  { d: 'M28 292C22 308 8 310 2 326', delay: 0.1 },
  { d: 'M14 306C6 310-6 308-14 318', delay: 1 },
  { d: 'M120 292C124 306 116 314 124 328', delay: 0.6 },
  { d: 'M176 290C184 304 178 314 192 324', delay: 0.4 },
];

const LOBES = [
  { cx: 192, cy: -3, rx: 17, ry: 12, rotate: -18 },
  { cx: 204, cy: 10, rx: 11, ry: 8, rotate: 24 },
  { cx: -5, cy: 296, rx: 16, ry: 11, rotate: 20 },
  { cx: 9, cy: 309, rx: 10, ry: 7, rotate: -14 },
];

const NODULES = [
  [-2, -22, 2.4],
  [-18, -8, 1.8],
  [182, -32, 2.4],
  [-24, 94, 2],
  [-20, 216, 2],
  [216, 146, 1.8],
  [2, 326, 2.4],
  [124, 328, 2],
  [192, 324, 2.2],
];

const STYLES = `
  .cordyceps-teaser { animation: cordyceps-teaser-breathe 6s ease-in-out 6s infinite; transform-origin: center; transition: scale 0.3s ease-out; }
  button:hover > .cordyceps-teaser, button:focus-visible > .cordyceps-teaser { scale: 1.05; }
  .cordyceps-teaser-hypha { stroke-dasharray: 1; stroke-dashoffset: 1; animation: cordyceps-teaser-grow 2.6s ease-out forwards; }
  .cordyceps-teaser-bud { opacity: 0; animation: cordyceps-teaser-bud 1.2s ease-out forwards; }
  @keyframes cordyceps-teaser-grow { to { stroke-dashoffset: 0; } }
  @keyframes cordyceps-teaser-bud { to { opacity: 1; } }
  @keyframes cordyceps-teaser-breathe { 50% { opacity: 0.72; } }
  @media (prefers-reduced-motion: reduce) {
    .cordyceps-teaser, .cordyceps-teaser-hypha, .cordyceps-teaser-bud { animation: none; }
    .cordyceps-teaser-hypha { stroke-dashoffset: 0; }
    .cordyceps-teaser-bud { opacity: 1; }
  }
`;

/** Seconds on the page before anything starts creeping out, so it reads as a discovery. */
const START_DELAY = 2.5;
const BUD_DELAY = START_DELAY + 2.4;

/** A few fungal threads creeping out from behind the poster, hinting at the easter egg. */
export const CordycepsTeaser: React.FC = () => (
  <svg
    viewBox="0 0 200 300"
    aria-hidden="true"
    className="cordyceps-teaser absolute overflow-visible"
    fill="none"
    strokeLinecap="round"
    // Sits exactly on the poster: the button around it is larger, to be an easy target.
    style={{ left: 'var(--poster-inset-x)', right: 'var(--poster-inset-x)', top: 'var(--poster-inset-y)', bottom: 'var(--poster-inset-y)', width: 'calc(100% - 2 * var(--poster-inset-x))', height: 'calc(100% - 2 * var(--poster-inset-y))' }}
  >
    <style>{STYLES}</style>
    <defs>
      <radialGradient id="cordyceps-teaser-skin">
        <stop offset="0" stopColor="#39371b" />
        <stop offset="0.5" stopColor="#6a6230" />
        <stop offset="0.84" stopColor="#a99c58" />
        <stop offset="1" stopColor="#d8cf98" />
      </radialGradient>
    </defs>

    {HYPHAE.map(({ d, delay }) => (
      <path
        key={d}
        d={d}
        pathLength={1}
        stroke="#14150a"
        strokeWidth={4.4}
        className="cordyceps-teaser-hypha"
        style={{ animationDelay: `${START_DELAY + delay}s` }}
      />
    ))}
    {HYPHAE.map(({ d, delay }) => (
      <path
        key={d}
        d={d}
        pathLength={1}
        stroke="#b4a95f"
        strokeWidth={2.2}
        className="cordyceps-teaser-hypha"
        style={{ animationDelay: `${START_DELAY + delay}s` }}
      />
    ))}

    <g className="cordyceps-teaser-bud" style={{ animationDelay: `${BUD_DELAY}s` }}>
      {LOBES.map(({ cx, cy, rx, ry, rotate }) => (
        <ellipse
          key={`${cx},${cy}`}
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          fill="url(#cordyceps-teaser-skin)"
          stroke="#14150a"
          strokeWidth={1.2}
          transform={`rotate(${rotate} ${cx} ${cy})`}
        />
      ))}
      {NODULES.map(([cx, cy, r]) => (
        <circle key={`${cx},${cy}`} cx={cx} cy={cy} r={r} fill="#cfc47c" />
      ))}
    </g>
  </svg>
);
