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
 * Fetch all games purely from Firestore collection 'games'.
 * No static code fallback; 100% dynamic from the database.
 */
export async function getGames(): Promise<Game[]> {
  try {
    const gamesRef = collection(db, GAMES_COLLECTION);
    const q = query(gamesRef, orderBy('releaseYear', 'desc'));
    const snapshot = await getDocs(q);

    const firestoreGames: Game[] = [];
    if (!snapshot.empty) {
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Game;
        firestoreGames.push({
          ...data,
          id: docSnap.id
        });
      });
    }

    return firestoreGames;
  } catch (error) {
    console.error('Failed to fetch games from Firestore:', error);
    return [];
  }
}

/**
 * Fetch a single game by slug or id directly from Firestore.
 */
export async function getGameBySlug(slug: string): Promise<Game | undefined> {
  try {
    // 1. Direct document lookup by ID
    const directDocRef = doc(db, GAMES_COLLECTION, slug);
    const directSnap = await getDoc(directDocRef);
    if (directSnap.exists()) {
      return {
        ...(directSnap.data() as Game),
        id: directSnap.id
      };
    }

    // 2. Query where 'slug' == slug
    const gamesRef = collection(db, GAMES_COLLECTION);
    const q = query(gamesRef, where('slug', '==', slug));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      return {
        ...(docSnap.data() as Game),
        id: docSnap.id
      };
    }

    return undefined;
  } catch (error) {
    console.error(`Failed to get game by slug "${slug}" from Firestore:`, error);
    return undefined;
  }
}

/**
 * Create a new game in Firestore.
 */
export async function createGame(gameData: Game): Promise<{ success: boolean; id: string; error?: string }> {
  try {
    const docId = gameData.slug || gameData.id || `game_${Date.now()}`;
    const gameRef = doc(db, GAMES_COLLECTION, docId);

    const payload = cleanGameData({
      ...gameData,
      id: docId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    await setDoc(gameRef, payload, { merge: true });
    return { success: true, id: docId };
  } catch (error: any) {
    console.error('Error creating game in Firestore:', error);
    return { success: false, id: '', error: error?.message || 'Noma‘lum xatolik' };
  }
}

/**
 * Update an existing game in Firestore.
 * Uses setDoc with merge:true so it succeeds even if document did not exist yet.
 */
export async function updateGame(id: string, gameData: Partial<Game>): Promise<{ success: boolean; error?: string }> {
  try {
    const gameRef = doc(db, GAMES_COLLECTION, id);
    const cleaned = cleanGameData({
      ...gameData,
      updatedAt: serverTimestamp()
    });
    await setDoc(gameRef, cleaned, { merge: true });
    return { success: true };
  } catch (error: any) {
    console.error('Error updating game in Firestore:', error);
    return { success: false, error: error?.message || 'Noma‘lum xatolik' };
  }
}

/**
 * Delete a game from Firestore.
 */
export async function deleteGame(id: string): Promise<{ success: boolean; error?: string }> {
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
