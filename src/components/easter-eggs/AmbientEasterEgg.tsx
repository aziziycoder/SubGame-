import React, { useEffect, useState } from 'react';

type AmbientEffect = React.ComponentType;

/** Add a game here, keyed by its slug, for an effect that plays on its own while the page is open. */
const AMBIENT_EFFECTS: Record<string, () => Promise<AmbientEffect>> = {
  'red-dead-redemption': () => import('./Tumbleweed').then((m) => m.Tumbleweed),
};

/** Loads after the page has settled, so the effect never competes with the page itself. */
const LOAD_DELAY_MS = 2500;

export const AmbientEasterEgg: React.FC<{ slug: string }> = ({ slug }) => {
  const [Effect, setEffect] = useState<AmbientEffect | null>(null);

  useEffect(() => {
    const load = AMBIENT_EFFECTS[slug];
    if (!load) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      load()
        // The functional form stops React from calling the component as an updater.
        .then((loaded) => {
          if (!cancelled) setEffect(() => loaded);
        })
        // A failed chunk (e.g. a stale tab after a deploy) must not break the game page.
        .catch(() => {});
    }, LOAD_DELAY_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      setEffect(null);
    };
  }, [slug]);

  return Effect ? <Effect /> : null;
};
