import { useEffect, type CSSProperties } from 'react';

interface TitleFont {
  /** CSS family name, as Google Fonts serves it. */
  family: string;
  /** The `family=` value of the Google Fonts URL. */
  query: string;
}

/**
 * Western display faces close to each game's logo. The real logo fonts are Rockstar's and
 * can't be served, so these are open-licensed (OFL) look-alikes from Google Fonts.
 */
const TITLE_FONTS: Record<string, TitleFont> = {
  'red-dead-redemption': { family: 'Rye', query: 'Rye' },
  'red-dead-redemption-2': { family: 'Rye', query: 'Rye' },
};

/**
 * Returns the title style for games with their own title font, loading that font only on
 * their pages. Everything else keeps the site font.
 */
export function useGameTitleFont(slug: string | undefined): CSSProperties | undefined {
  const font = slug ? TITLE_FONTS[slug] : undefined;

  useEffect(() => {
    if (!font) return;
    const id = `game-title-font-${font.query}`;
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${font.query}&display=swap`;
    document.head.appendChild(link);
  }, [font]);

  if (!font) return undefined;
  // These faces have one weight; the title's font-black would be faked and smear the letters.
  return { fontFamily: `'${font.family}', Georgia, serif`, fontWeight: 400, letterSpacing: '0.01em' };
}
