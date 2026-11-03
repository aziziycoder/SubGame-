import type { Game } from '../types/game';
import { INITIAL_GAMES_SEED } from '../data/initialGamesSeed';
import { apiRequest, fetchFromBackend } from './apiClient';

/**
 * Remove undefined values before sending a game to the backend.
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
 * Fetch all games from the backend, falling back to the bundled seed when it is unreachable.
 */
export async function getGames(): Promise<Game[]> {
  const backendGames = await fetchFromBackend<Game[]>('api/v1/games/');
  if (backendGames && Array.isArray(backendGames) && backendGames.length > 0) {
    return backendGames.map((g) => normalizeGameData(g));
  }

  return INITIAL_GAMES_SEED.map((g) => normalizeGameData(g));
}

/**
 * Fetch a single game by slug or id.
 */
export async function getGameBySlug(slug: string): Promise<Game | undefined> {
  const backendGame = await fetchFromBackend<Game>(`api/v1/games/${slug}/`);
  if (backendGame && backendGame.title) {
    return normalizeGameData(backendGame);
  }
  return undefined;
}

/**
 * Create a new game.
 */
export async function createGame(gameData: Game): Promise<{ success: boolean; id: string; error?: string }> {
  const docId = gameData.slug || gameData.id || `game_${Date.now()}`;

  try {
    const res = await apiRequest<{ id: string }>('api/v1/games/admin/manage/', {
      method: 'POST',
      body: JSON.stringify(cleanGameData({ ...gameData, id: docId })),
    });
    return { success: true, id: res.id };
  } catch (error: any) {
    console.error('Error creating game:', error);
    return { success: false, id: '', error: error?.message || 'Noma‘lum xatolik' };
  }
}

/**
 * Update an existing game.
 */
export async function updateGame(id: string, gameData: Partial<Game>): Promise<{ success: boolean; error?: string }> {
  try {
    await apiRequest(`api/v1/games/admin/manage/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(cleanGameData(gameData)),
    });
    return { success: true };
  } catch (error: any) {
    console.error('Error updating game:', error);
    return { success: false, error: error?.message || 'Noma‘lum xatolik' };
  }
}

/**
 * Delete a game.
 */
export async function deleteGame(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await apiRequest(`api/v1/games/admin/manage/${id}/`, {
      method: 'DELETE',
    });
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting game:', error);
    return { success: false, error: error?.message || 'Noma‘lum xatolik' };
  }
}

/**
 * Seed / Sync initial games into the backend for the admin panel.
 * Reads from INITIAL_GAMES_SEED and creates the games that are missing.
 */
export async function syncInitialGames(forceOverwrite = false): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const existing = await apiRequest<Game[]>('api/v1/games/');
    const existingIds = new Set(existing.map((g) => g.id));

    let count = 0;
    for (const game of INITIAL_GAMES_SEED) {
      if (!existingIds.has(game.id)) {
        await apiRequest('api/v1/games/admin/manage/', { method: 'POST', body: JSON.stringify(cleanGameData(game)) });
        count++;
      } else if (forceOverwrite) {
        await apiRequest(`api/v1/games/admin/manage/${game.id}/`, { method: 'PUT', body: JSON.stringify(cleanGameData(game)) });
        count++;
      }
    }
    return { success: true, count };
  } catch (error: any) {
    console.error('Error syncing initial games:', error);
    return { success: false, count: 0, error: error?.message || 'Noma‘lum xatolik' };
  }
}
