import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import type { HeroSlide } from '../types/slider';
import { INITIAL_SLIDES } from '../data/sliders';

const SLIDERS_COLLECTION = 'sliders';
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
 * Remove undefined values so Firestore does not reject the document write.
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
 * Fetch all hero sliders from Firestore.
 * Falls back to INITIAL_SLIDES if Firestore is empty or fails.
 */
export async function getSliders(): Promise<HeroSlide[]> {
  try {
    const slidersRef = collection(db, SLIDERS_COLLECTION);
    const q = query(slidersRef, orderBy('order', 'asc'));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const slides: HeroSlide[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as HeroSlide;
        slides.push({
          ...data,
          id: docSnap.id
        });
      });
      setCachedSliders(slides);
      return slides;
    }

    const cached = getCachedSliders();
    if (cached) return cached;
    return INITIAL_SLIDES;
  } catch (error) {
    console.warn('Failed to fetch sliders from Firestore, falling back to initial data:', error);
    const cached = getCachedSliders();
    if (cached) return cached;
    return INITIAL_SLIDES;
  }
}

/**
 * Create or overwrite a slider in Firestore.
 */
export async function createSlider(slideData: HeroSlide): Promise<{ success: boolean; id: string; error?: string }> {
  try {
    const docId = slideData.id || slideData.slug || `slide_${Date.now()}`;
    const slideRef = doc(db, SLIDERS_COLLECTION, docId);

    const payload = cleanSliderData({
      ...slideData,
      id: docId,
      order: slideData.order || 99,
      isActive: slideData.isActive !== false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    await setDoc(slideRef, payload, { merge: true });
    const cached = getCachedSliders() || [];
    const idx = cached.findIndex((s) => s.id === docId);
    if (idx >= 0) {
      cached[idx] = { ...cached[idx], ...payload };
    } else {
      cached.push(payload as HeroSlide);
    }
    setCachedSliders(cached);
    return { success: true, id: docId };
  } catch (error: any) {
    console.error('Error creating slider in Firestore:', error);
    return { success: false, id: '', error: error?.message || 'Noma‘lum xatolik' };
  }
}

/**
 * Update an existing slider in Firestore.
 */
export async function updateSlider(id: string, slideData: Partial<HeroSlide>): Promise<{ success: boolean; error?: string }> {
  try {
    const slideRef = doc(db, SLIDERS_COLLECTION, id);
    const cleaned = cleanSliderData({
      ...slideData,
      updatedAt: serverTimestamp()
    });
    await setDoc(slideRef, cleaned, { merge: true });
    const cached = getCachedSliders();
    if (cached) {
      const idx = cached.findIndex((s) => s.id === id);
      if (idx >= 0) {
        cached[idx] = { ...cached[idx], ...cleaned };
        setCachedSliders(cached);
      }
    }
    return { success: true };
  } catch (error: any) {
    console.error('Error updating slider in Firestore:', error);
    return { success: false, error: error?.message || 'Noma‘lum xatolik' };
  }
}

/**
 * Delete a slider from Firestore.
 */
export async function deleteSlider(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const slideRef = doc(db, SLIDERS_COLLECTION, id);
    await deleteDoc(slideRef);
    const cached = getCachedSliders();
    if (cached) {
      const updated = cached.filter((s) => s.id !== id);
      setCachedSliders(updated);
    }
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting slider from Firestore:', error);
    return { success: false, error: error?.message || 'Noma‘lum xatolik' };
  }
}

/**
 * Seed / Sync initial sliders from INITIAL_SLIDES into Firestore.
 * Does not overwrite existing sliders unless forceOverwrite is true, preserving admin edits.
 */
export async function syncInitialSliders(forceOverwrite = false): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    let count = 0;
    for (const slide of INITIAL_SLIDES) {
      const slideRef = doc(db, SLIDERS_COLLECTION, slide.id);
      const existingSnap = await getDoc(slideRef);
      if (!existingSnap.exists() || forceOverwrite) {
        const payload = cleanSliderData({
          ...slide,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        await setDoc(slideRef, payload, { merge: true });
        count++;
      }
    }
    return { success: true, count };
  } catch (error: any) {
    console.error('Error syncing initial sliders to Firestore:', error);
    return { success: false, count: 0, error: error?.message || 'Noma‘lum xatolik' };
  }
}
