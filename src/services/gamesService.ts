import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import type { Game } from '../types/game';
import { GAMES_DATA } from '../data/games';

const GAMES_COLLECTION = 'games';

/**
 * Fetch all games from Firestore.
 * If Firestore is empty or inaccessible, falls back to local GAMES_DATA.
 */
export async function getGames(): Promise<Game[]> {
  try {
    const gamesRef = collection(db, GAMES_COLLECTION);
    const q = query(gamesRef, orderBy('releaseYear', 'desc'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.info('Firestore games collection is empty, using local initial games.');
      return GAMES_DATA;
    }

    const games: Game[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as Game;
      games.push({
        ...data,
        id: docSnap.id
      });
    });

    return games;
  } catch (error) {
    console.warn('Failed to fetch games from Firestore, falling back to local data:', error);
    return GAMES_DATA;
  }
}

/**
 * Fetch a single game by slug from Firestore.
 */
export async function getGameBySlug(slug: string): Promise<Game | undefined> {
  try {
    const games = await getGames();
    return games.find((g) => g.slug === slug || g.id === slug);
  } catch (error) {
    console.warn('Failed to get game by slug:', error);
    return GAMES_DATA.find((g) => g.slug === slug || g.id === slug);
  }
}

/**
 * Create a new game in Firestore.
 */
export async function createGame(gameData: Game): Promise<{ success: boolean; id: string; error?: string }> {
  try {
    const docId = gameData.slug || gameData.id || `game_${Date.now()}`;
    const gameRef = doc(db, GAMES_COLLECTION, docId);

    const payload = {
      ...gameData,
      id: docId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(gameRef, payload);
    return { success: true, id: docId };
  } catch (error: any) {
    console.error('Error creating game in Firestore:', error);
    return { success: false, id: '', error: error?.message || 'Noma‘lum xatolik' };
  }
}

/**
 * Update an existing game in Firestore.
 */
export async function updateGame(id: string, gameData: Partial<Game>): Promise<{ success: boolean; error?: string }> {
  try {
    const gameRef = doc(db, GAMES_COLLECTION, id);
    await updateDoc(gameRef, {
      ...gameData,
      updatedAt: serverTimestamp()
    });
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
 * Seed / Sync initial games from local games.ts into Firestore.
 * Useful for 1-click database initialization from the Admin Panel.
 */
export async function syncInitialGames(): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    let count = 0;
    for (const game of GAMES_DATA) {
      const gameRef = doc(db, GAMES_COLLECTION, game.id);
      await setDoc(gameRef, {
        ...game,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
      count++;
    }
    return { success: true, count };
  } catch (error: any) {
    console.error('Error syncing initial games to Firestore:', error);
    return { success: false, count: 0, error: error?.message || 'Noma‘lum xatolik' };
  }
}
