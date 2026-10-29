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
      copy.targetFileName = 'stringtable_en.sds,stringtable_ru.sds';
      copy.targetRelativeDir = 'sds_retail/string_tables';
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
