import React, { useRef, useState } from 'react';

export interface EasterEggEffectProps {
  /** The trigger button: the effect starts from it and returns focus to it. */
  originRef: React.RefObject<HTMLButtonElement | null>;
  /** Grows each time the trigger is pressed while the effect is running. */
  healSignal: number;
  onFinished: () => void;
}

type EffectComponent = React.ComponentType<EasterEggEffectProps>;

interface EasterEgg {
  label: string;
  icon: React.ReactNode;
  /** Imported on first click, so nobody downloads an effect they never trigger. */
  load: () => Promise<EffectComponent>;
}

const SporeIcon = (
  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="currentColor" aria-hidden="true">
    <path d="M12 3.2c-4.6 0-8 3-8 6.6 0 .9.7 1.5 1.6 1.5h12.8c.9 0 1.6-.6 1.6-1.5 0-3.6-3.4-6.6-8-6.6Z" />
    <path d="M9.6 12.6h4.8l.7 5.6c.1 1-.7 1.9-1.7 1.9h-2.8c-1 0-1.8-.9-1.7-1.9l.7-5.6Z" opacity="0.65" />
    <circle cx="4" cy="15.5" r="1.1" opacity="0.8" />
    <circle cx="20" cy="14.5" r="1.3" opacity="0.8" />
    <circle cx="18" cy="19.5" r="0.9" opacity="0.6" />
    <circle cx="6" cy="20" r="0.8" opacity="0.6" />
  </svg>
);

/** Add a game here, keyed by its slug, to give its page an easter egg. */
const EASTER_EGGS: Record<string, EasterEgg> = {
  'the-last-of-us-part-i': {
    label: 'Sirli spora',
    icon: SporeIcon,
    load: () => import('./CordycepsOutbreak').then((m) => m.CordycepsOutbreak),
  },
};

export const GameEasterEgg: React.FC<{ slug: string }> = ({ slug }) => {
  const egg = EASTER_EGGS[slug];
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [Effect, setEffect] = useState<EffectComponent | null>(null);
  const [healSignal, setHealSignal] = useState(0);

  if (!egg) return null;

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
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleClick}
        aria-label={egg.label}
        aria-pressed={Boolean(Effect)}
        title={egg.label}
        className="h-11 w-11 flex items-center justify-center rounded-xl bg-[#141821] border border-[#2A3245] text-[#8f8745] hover:text-[#d8cf98] hover:border-[#8f8745]/60 hover:bg-[#1A202C] transition-colors cursor-pointer shrink-0"
      >
        <span className="animate-pulse [animation-duration:4s] motion-reduce:animate-none">{egg.icon}</span>
      </button>

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
    </>
  );
};
