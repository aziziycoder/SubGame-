import type { HeroSlide } from '../types/slider';
import { INITIAL_SLIDES } from '../data/sliders';
import { apiRequest, fetchFromBackend } from './apiClient';

const CACHE_KEY = 'subgame_cached_sliders';

/**
 * Get cached slides from localStorage if available.
 */
export function getCachedSliders(): HeroSlide[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return null;
}

/**
 * Save slides to localStorage cache.
 */
export function setCachedSliders(slides: HeroSlide[]): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(slides));
  } catch {}
}

/**
 * Remove undefined values before sending a slide to the backend.
 */
function cleanSliderData(data: Record<string, any>): Record<string, any> {
  const cleaned: Record<string, any> = {};
  for (const [key, val] of Object.entries(data)) {
    if (val !== undefined) {
      if (val && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
        cleaned[key] = cleanSliderData(val);
      } else {
        cleaned[key] = val;
      }
    }
  }
  return cleaned;
}

/**
 * Returns a slide's headline parts ready to render side by side.
 * The parts are stored separately and the spaces between them don't survive saving,
 * so spacing is decided here instead of relying on what the admin typed.
 */
export function getHeadlineParts(slide: Partial<HeroSlide>) {
  const prefix = (slide.headlinePrefix ?? '').trim();
  const highlight = (slide.headlineHighlight ?? '').trim();
  const suffix = (slide.headlineSuffix ?? '').trim();
  // Punctuation stays attached to the highlighted words: "...tilida" + "."
  const suffixAttaches = /^[.,!?:;)\-–—…]/.test(suffix);

  return {
    prefix: prefix ? `${prefix} ` : '',
    highlight,
    suffix: suffix && !suffixAttaches ? ` ${suffix}` : suffix,
  };
}

/**
 * Fetch the active hero sliders for the public site.
 * Falls back to the cache, then INITIAL_SLIDES, if the backend is empty or fails.
 */
export async function getSliders(): Promise<HeroSlide[]> {
  const slides = await fetchFromBackend<HeroSlide[]>('api/v1/games/sliders/');
  if (slides && slides.length > 0) {
    setCachedSliders(slides);
    return slides;
  }

  return getCachedSliders() || INITIAL_SLIDES;
}

/**
 * Fetch every slider, including hidden ones, for the admin panel.
 */
export async function getAdminSliders(): Promise<HeroSlide[]> {
  const slides = await apiRequest<HeroSlide[]>('api/v1/games/admin/sliders/');
  return slides.length > 0 ? slides : INITIAL_SLIDES;
}

/**
 * Create a slider.
 */
export async function createSlider(slideData: HeroSlide): Promise<{ success: boolean; id: string; error?: string }> {
  try {
    const docId = slideData.id || slideData.slug || `slide_${Date.now()}`;

    const created = await apiRequest<HeroSlide>('api/v1/games/admin/sliders/', {
      method: 'POST',
      body: JSON.stringify(cleanSliderData({
        ...slideData,
        id: docId,
        order: slideData.order || 99,
        isActive: slideData.isActive !== false,
      })),
    });

    const cached = getCachedSliders() || [];
    setCachedSliders([...cached.filter((s) => s.id !== docId), created]);
    return { success: true, id: docId };
  } catch (error: any) {
    console.error('Error creating slider:', error);
    return { success: false, id: '', error: error?.message || 'Noma‘lum xatolik' };
  }
}

/**
 * Update an existing slider.
 */
export async function updateSlider(id: string, slideData: Partial<HeroSlide>): Promise<{ success: boolean; error?: string }> {
  try {
    const updated = await apiRequest<HeroSlide>(`api/v1/games/admin/sliders/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(cleanSliderData(slideData)),
    });

    const cached = getCachedSliders();
    if (cached) {
      setCachedSliders(cached.map((s) => (s.id === id ? updated : s)));
    }
    return { success: true };
  } catch (error: any) {
    console.error('Error updating slider:', error);
    return { success: false, error: error?.message || 'Noma‘lum xatolik' };
  }
}

/**
 * Delete a slider.
 */
export async function deleteSlider(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await apiRequest(`api/v1/games/admin/sliders/${id}/`, { method: 'DELETE' });

    const cached = getCachedSliders();
    if (cached) {
      setCachedSliders(cached.filter((s) => s.id !== id));
    }
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting slider:', error);
    return { success: false, error: error?.message || 'Noma‘lum xatolik' };
  }
}

/**
 * Seed / Sync initial sliders from INITIAL_SLIDES into the backend.
 * Does not overwrite existing sliders unless forceOverwrite is true, preserving admin edits.
 */
export async function syncInitialSliders(forceOverwrite = false): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const existing = await apiRequest<HeroSlide[]>('api/v1/games/admin/sliders/');
    const existingIds = new Set(existing.map((s) => s.id));

    let count = 0;
    for (const slide of INITIAL_SLIDES) {
      if (!existingIds.has(slide.id)) {
        await apiRequest('api/v1/games/admin/sliders/', { method: 'POST', body: JSON.stringify(cleanSliderData(slide)) });
        count++;
      } else if (forceOverwrite) {
        await apiRequest(`api/v1/games/admin/sliders/${slide.id}/`, { method: 'PUT', body: JSON.stringify(cleanSliderData(slide)) });
        count++;
      }
    }
    return { success: true, count };
  } catch (error: any) {
    console.error('Error syncing initial sliders:', error);
    return { success: false, count: 0, error: error?.message || 'Noma‘lum xatolik' };
  }
}
