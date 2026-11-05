import React, { useRef, useState } from 'react';
import { CordycepsTeaser } from './CordycepsTeaser';

export interface EasterEggEffectProps {
  /** The hidden trigger around the poster: the effect starts from it and returns focus to it. */
  originRef: React.RefObject<HTMLButtonElement | null>;
  /** Grows each time the trigger is pressed while the effect is running. */
  healSignal: number;
  onFinished: () => void;
}

type EffectComponent = React.ComponentType<EasterEggEffectProps>;

interface EasterEgg {
  label: string;
  /** What peeks out from behind the poster and gives the secret away. */
  teaser: React.ReactNode;
  /** Imported on first click, so nobody downloads an effect they never trigger. */
  load: () => Promise<EffectComponent>;
}

/** Add a game here, keyed by its slug, to give its page an easter egg. */
const EASTER_EGGS: Record<string, EasterEgg> = {
  'the-last-of-us-part-i': {
    label: 'Poster orqasidagi tolalar',
    teaser: <CordycepsTeaser />,
    load: () => import('./CordycepsOutbreak').then((m) => m.CordycepsOutbreak),
  },
};

// The clickable band around the poster. On phones the title starts 14px to its right,
// so the band has to stay narrower than that.
const TRIGGER_INSET = '[--poster-inset-x:12px] [--poster-inset-y:20px] sm:[--poster-inset-x:24px] sm:[--poster-inset-y:28px]';

/** Wraps a game's poster. Games without an easter egg get the poster back untouched. */
export const GameEasterEgg: React.FC<{ slug: string; children: React.ReactNode }> = ({ slug, children }) => {
  const egg = EASTER_EGGS[slug];
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [Effect, setEffect] = useState<EffectComponent | null>(null);
  const [healSignal, setHealSignal] = useState(0);

  if (!egg) return <>{children}</>;

  const handleClick = async () => {
    if (Effect) {
      setHealSignal((n) => n + 1);
      return;
    }
    try {
      const loaded = await egg.load();
      // The functional form stops React from calling the component as an updater.
      setEffect(() => loaded);
    } catch {
      // A failed chunk (e.g. a stale tab after a deploy) must not break the game page.
    }
  };

  return (
    <div className={`relative shrink-0 ${TRIGGER_INSET}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleClick}
        aria-label={egg.label}
        aria-pressed={Boolean(Effect)}
        className="absolute z-0 cursor-pointer rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[#b4a95f]"
        style={{
          top: 'calc(-1 * var(--poster-inset-y))',
          bottom: 'calc(-1 * var(--poster-inset-y))',
          left: 'calc(-1 * var(--poster-inset-x))',
          right: 'calc(-1 * var(--poster-inset-x))',
        }}
      >
        {egg.teaser}
      </button>

      {/* The trigger runs underneath, so letting clicks through makes the poster clickable too. */}
      <div className="relative z-10 pointer-events-none">{children}</div>

      {Effect && (
        <Effect
          originRef={triggerRef}
          healSignal={healSignal}
          onFinished={() => {
            setEffect(null);
            setHealSignal(0);
          }}
        />
      )}
    </div>
  );
};
