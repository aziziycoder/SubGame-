import React, { useEffect, useRef, useState } from 'react';

export interface LicenseEffectProps {
  onFinished: () => void;
}

type LicenseEffect = React.ComponentType<LicenseEffectProps>;

const loadRatSwarm = () => import('./RatSwarm').then((m) => m.RatSwarm);

/** Add a game here, keyed by its slug, to play an effect when its license is obtained. */
const LICENSE_EFFECTS: Record<string, () => Promise<LicenseEffect>> = {
  'a-plague-tale-innocence': loadRatSwarm,
  'a-plague-tale-requiem': loadRatSwarm,
  'a-plague-tale-legacy': loadRatSwarm,
};

/** Plays the game's effect once each time `active` turns on (a license was just obtained). */
export const LicenseEasterEgg: React.FC<{ slug: string; active: boolean }> = ({ slug, active }) => {
  const [Effect, setEffect] = useState<LicenseEffect | null>(null);
  const playedRef = useRef(false);

  useEffect(() => {
    if (!active) {
      playedRef.current = false;
      return;
    }
    const load = LICENSE_EFFECTS[slug];
    if (!load || playedRef.current) return;
    playedRef.current = true;

    load()
      // The functional form stops React from calling the component as an updater.
      .then((loaded) => setEffect(() => loaded))
      // A failed chunk (e.g. a stale tab after a deploy) must not break the game page.
      .catch(() => {});
  }, [slug, active]);

  return Effect ? <Effect onFinished={() => setEffect(null)} /> : null;
};
