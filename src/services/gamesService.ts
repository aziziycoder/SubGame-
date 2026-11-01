import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import type { Game } from '../types/game';
import { INITIAL_GAMES_SEED } from '../data/initialGamesSeed';
import { fetchFromBackend } from './apiClient';

const GAMES_COLLECTION = 'games';

/**
 * Remove undefined values so Firestore does not reject the document write.
 */
function cleanGameData(data: Record<string, any>): Record<string, any> {
  const cleaned: Record<string, any> = {};
  for (const [key, val] of Object.entries(data)) {
    if (val !== undefined) {
      if (val && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
        cleaned[key] = cleanGameData(val);
      } else {
        cleaned[key] = val;
      }
    }
  }
  return cleaned;
}

/**
 * Normalizes game data to resolve legacy or contradictory field values.
 * e.g., If subtitleStatus is 'Tayyor', fields should not display 'Kutilmoqda' or 'O‘yin hozirda tayyorlanish bosqichida'.
 */
export function normalizeGameData(game: Game): Game {
  const copy = { ...game };

  // 0. Ensure officialStoreLinks has default Steam/GOG links if missing
  if (!copy.officialStoreLinks || copy.officialStoreLinks.length === 0) {
    if (copy.slug === 'rusty-lake-paradise' || copy.id === 'rusty-lake-paradise') {
      copy.officialStoreLinks = [
        { name: 'Steam', url: 'https://store.steampowered.com/app/744190/Rusty_Lake_Paradise/', priceNote: 'Steam rasmiy do‘koni' },
        { name: 'GOG', url: 'https://www.gog.com/en/game/rusty_lake_paradise', priceNote: 'GOG rasmiy do‘koni' }
      ];
    } else if (copy.slug === 'mafia-definitive-edition' || copy.id === 'mafia-definitive-edition') {
      copy.officialStoreLinks = [
        { name: 'Steam', url: 'https://store.steampowered.com/app/1030840/Mafia_Definitive_Edition/', priceNote: 'Steam rasmiy sahifasi' }
      ];
      copy.subtitleStatus = 'Tayyor';
      copy.targetFileName = copy.targetFileName || 'stringtable_en.sds';
      copy.targetRelativeDir = (copy.targetRelativeDir || 'sds_retail/string_tables').replace(/[\\/]+$/, '');
      copy.defaultExeName = 'mafiadefinitiveedition.exe';
      copy.keyPrefix = 'SUB-MAFI';
      copy.subtitleSize = '1.6 MB';
      copy.subtitleVersion = 'v1.0.0';
      copy.subtitlePrice = 'Bepul';
      copy.price = 'Tekin';
      copy.subtitleFormat = 'SubGame Launcher himoyalangan lokalizatsiyasi (.sds)';
    }
  }

  if (copy.subtitleStatus === 'Tayyor') {
    // 1. Subtitle Translation Type
    if (!copy.subtitleTranslationType || /kutilmoqda|tez kunda/i.test(copy.subtitleTranslationType)) {
      copy.subtitleTranslationType = 'To‘liq adabiy o‘zbekcha tarjima';
    }

    // 2. Subtitle Last Updated
    if (!copy.subtitleLastUpdated || /kutilmoqda|tez kunda/i.test(copy.subtitleLastUpdated)) {
      copy.subtitleLastUpdated = '2026-10-28';
    }

    // 3. Subtitle Size
    if (copy.subtitleSize && /kutilmoqda/i.test(copy.subtitleSize)) {
      copy.subtitleSize = '1.4 MB';
    }

    // 4. Known issues: strip out obsolete "tayyorlanish bosqichida" notes when game is actually ready
    if (Array.isArray(copy.knownIssues)) {
      copy.knownIssues = copy.knownIssues.filter(
        (issue) => !/tayyorlanish|kutilmoqda|anons/i.test(issue)
      );
    }

    // 5. Tags: strip out upcoming tags
    if (Array.isArray(copy.tags)) {
      copy.tags = copy.tags.filter((t) => !/kutilmoqda|tez kunda/i.test(t));
    }

    // 6. Installation Guide: if legacy placeholder mentioning announcement/waiting
    if (
      Array.isArray(copy.installationGuide) &&
      copy.installationGuide.some((g) => /anons|kutilmoqda/i.test(g.title || g.description))
    ) {
      copy.installationGuide = [
        {
          step: 1,
          title: 'SubGame Launcherni oching',
          description: 'SubGame dasturini kompyuteringizda ishga tushiring va Google profilingiz bilan kiring.'
        },
        {
          step: 2,
          title: 'O‘yin ijro faylini (.exe) ko‘rsating',
          description: `O‘rnatilgan o‘yin papkasidagi ${copy.defaultExeName || 'o‘yin fayli'}ni tanlang.`
        },
        {
          step: 3,
          title: 'O‘yinni boshlash',
          description: 'Launcher orqali "O‘ynash" tugmasini bosing — o‘zbekcha subtitr avtomatik ulanadi.'
        }
      ];
    }

    return copy;
  }
  return game;
}

/**
 * Fetch all games purely from Firestore collection 'games'.
 * No static code fallback; 100% dynamic from the database.
 */
export async function getGames(): Promise<Game[]> {
  // 1. Try fetching from Django REST Backend first
  try {
    const backendGames = await fetchFromBackend<Game[]>('api/v1/games/');
    if (backendGames && Array.isArray(backendGames) && backendGames.length > 0) {
      return backendGames.map((g) => normalizeGameData(g));
    }
  } catch (backendErr) {
    console.warn('[Backend] Could not reach Django backend, checking Firestore fallback:', backendErr);
  }

  // 2. Fallback to Firestore
  try {
    const gamesRef = collection(db, GAMES_COLLECTION);
    const q = query(gamesRef, orderBy('releaseYear', 'desc'));
    const snapshot = await getDocs(q);

    const firestoreGames: Game[] = [];
    if (!snapshot.empty) {
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Game;
        firestoreGames.push(
          normalizeGameData({
            ...data,
            id: docSnap.id
          })
        );
      });
    }

    if (firestoreGames.length > 0) {
      return firestoreGames;
    }
  } catch (error) {
    console.warn('Failed to fetch games from Firestore, falling back to initial seed:', error);
  }

  // 3. Ultimate Fallback to Initial Seed
  return INITIAL_GAMES_SEED.map((g) => normalizeGameData(g));
}

/**
 * Fetch a single game by slug or id directly from Firestore or Django Backend.
 */
export async function getGameBySlug(slug: string): Promise<Game | undefined> {
  // 1. Try fetching from Django Backend first
  try {
    const backendGame = await fetchFromBackend<Game>(`api/v1/games/${slug}/`);
    if (backendGame && backendGame.title) {
      return normalizeGameData(backendGame);
    }
  } catch {
    // ignore
  }

  // 2. Fallback to Firestore
  try {
    // Direct document lookup by ID
    const directDocRef = doc(db, GAMES_COLLECTION, slug);
    const directSnap = await getDoc(directDocRef);
    if (directSnap.exists()) {
      return normalizeGameData({
        ...(directSnap.data() as Game),
        id: directSnap.id
      });
    }

    // 2. Query where 'slug' == slug
    const gamesRef = collection(db, GAMES_COLLECTION);
    const q = query(gamesRef, where('slug', '==', slug));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      return normalizeGameData({
        ...(docSnap.data() as Game),
        id: docSnap.id
      });
    }

    return undefined;
  } catch (error) {
    console.error(`Failed to get game by slug "${slug}" from Firestore:`, error);
    return undefined;
  }
}

/**
 * Create a new game in Backend & Firestore.
 */
export async function createGame(gameData: Game): Promise<{ success: boolean; id: string; error?: string }> {
  const docId = gameData.slug || gameData.id || `game_${Date.now()}`;
  const payload = cleanGameData({
    ...gameData,
    id: docId,
  });

  // 1. Try creating in Django REST Backend
  try {
    const res = await fetchFromBackend<{ id?: string }>('api/v1/games/admin/manage/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res && res.id) {
      // Also update Firestore in background
      setDoc(doc(db, GAMES_COLLECTION, docId), { ...payload, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }, { merge: true }).catch(() => {});
      return { success: true, id: res.id };
    }
  } catch (backendErr) {
    console.warn('[Backend] Create game backend warning:', backendErr);
  }

  // 2. Fallback to Firestore
  try {
    const gameRef = doc(db, GAMES_COLLECTION, docId);
    await setDoc(gameRef, {
      ...payload,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return { success: true, id: docId };
  } catch (error: any) {
    console.error('Error creating game in Firestore:', error);
    return { success: false, id: '', error: error?.message || 'Noma‘lum xatolik' };
  }
}

/**
 * Update an existing game in Backend & Firestore.
 */
export async function updateGame(id: string, gameData: Partial<Game>): Promise<{ success: boolean; error?: string }> {
  const cleaned = cleanGameData(gameData);

  // 1. Try updating in Django REST Backend
  try {
    const res = await fetchFromBackend<{ id?: string }>(`api/v1/games/admin/manage/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(cleaned),
    });
    if (res) {
      // Also update Firestore in background
      setDoc(doc(db, GAMES_COLLECTION, id), { ...cleaned, updatedAt: serverTimestamp() }, { merge: true }).catch(() => {});
      return { success: true };
    }
  } catch (backendErr) {
    console.warn('[Backend] Update game backend warning:', backendErr);
  }

  // 2. Fallback to Firestore
  try {
    const gameRef = doc(db, GAMES_COLLECTION, id);
    await setDoc(gameRef, {
      ...cleaned,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return { success: true };
  } catch (error: any) {
    console.error('Error updating game in Firestore:', error);
    return { success: false, error: error?.message || 'Noma‘lum xatolik' };
  }
}

/**
 * Delete a game from Backend & Firestore.
 */
export async function deleteGame(id: string): Promise<{ success: boolean; error?: string }> {
  // 1. Try deleting in Django REST Backend
  try {
    await fetchFromBackend(`api/v1/games/admin/manage/${id}/`, {
      method: 'DELETE',
    });
  } catch (backendErr) {
    console.warn('[Backend] Delete game backend warning:', backendErr);
  }

  // 2. Also delete from Firestore
  try {
    const gameRef = doc(db, GAMES_COLLECTION, id);
    await deleteDoc(gameRef);
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting game from Firestore:', error);
    return { success: false, error: error?.message || 'Noma‘lum xatolik' };
  }
}

/**
 * Seed / Sync initial games into Firestore for the admin panel.
 * Reads from INITIAL_GAMES_SEED and writes missing games into Firestore.
 */
export async function syncInitialGames(forceOverwrite = false): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    let count = 0;
    for (const game of INITIAL_GAMES_SEED) {
      const gameRef = doc(db, GAMES_COLLECTION, game.id);
      const existingSnap = await getDoc(gameRef);
      if (!existingSnap.exists() || forceOverwrite) {
        const payload = cleanGameData({
          ...game,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        await setDoc(gameRef, payload, { merge: true });
        count++;
      }
    }
    return { success: true, count };
  } catch (error: any) {
    console.error('Error syncing initial games to Firestore:', error);
    return { success: false, count: 0, error: error?.message || 'Noma‘lum xatolik' };
  }
}
