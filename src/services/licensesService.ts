import type { Game } from '../types/game';
import { apiRequest, fetchFromBackend } from './apiClient';

export interface GameLicenseItem {
  id: string; // `${userId}_${gameId}`
  userId: string;
  userEmail: string;
  userName?: string;
  userPhoto?: string;
  gameId: string;
  gameTitle: string;
  gameSlug: string;
  status: 'active' | 'revoked';
  hwid?: string | null;
  boundAt?: any;
  boundDeviceName?: string | null;
  paymentProvider?: string;
  paymentRef?: string;
  paidAmount?: number;
  revokedReason?: string;
  createdAt?: any;
}

export interface GameLicenseGroup {
  gameId: string;
  gameTitle: string;
  gameSlug: string;
  coverImage?: string;
  genres?: string[];
  totalLicenses: number;
  activeLicenses: number;
  boundDevicesCount: number;
  percentage: number; // Share of total claimed licenses
  lastClaimedAt?: any;
  licenses: GameLicenseItem[];
}

export interface LicenseGlobalStats {
  totalLicenses: number;
  totalUniqueUsers: number;
  totalGamesClaimed: number;
  totalBoundDevices: number;
  topGame: {
    gameTitle: string;
    gameId: string;
    count: number;
    percentage: number;
  } | null;
}

/**
 * Fetch all claimed licenses, enrich with latest user profiles and games info,
 * and calculate per-game and platform-wide statistics.
 */
export const fetchAllLicensesWithStats = async (
  gamesList: Game[] = []
): Promise<{
  licenses: GameLicenseItem[];
  groups: GameLicenseGroup[];
  stats: LicenseGlobalStats;
}> => {
  try {
    const allLicenses: GameLicenseItem[] = [];
    const uniqueUserIds = new Set<string>();

    const backendLicenses = await apiRequest<any[]>('api/v1/licenses/admin/');
    backendLicenses.forEach((d) => {
      const userId = d.userId || '';
      allLicenses.push({
        id: d.id,
        userId,
        userEmail: d.userEmail || 'Noma’lum email',
        userName: d.userName || d.userEmail?.split('@')[0] || 'Foydalanuvchi',
        userPhoto: d.userPhoto || undefined,
        gameId: d.gameId || 'noma-lum',
        gameTitle: d.gameTitle || 'Noma’lum o‘yin',
        gameSlug: d.gameSlug || (d.gameId ? String(d.gameId) : 'noma-lum'),
        status: d.status === 'revoked' ? 'revoked' : 'active',
        hwid: d.hwid || null,
        boundAt: d.boundAt || null,
        boundDeviceName: d.boundDeviceName || null,
        paymentProvider: d.paymentProvider || undefined,
        paymentRef: d.paymentRef || undefined,
        paidAmount: d.paidAmount || undefined,
        revokedReason: d.revokedReason || undefined,
        createdAt: d.createdAt || null,
      });
      if (userId) {
        uniqueUserIds.add(userId);
      }
    });

    // 3. Map games by ID and slug for metadata (images, genres)
    const gamesById = new Map<string, Game>();
    const gamesBySlug = new Map<string, Game>();
    gamesList.forEach((g) => {
      gamesById.set(g.id, g);
      if (g.slug) gamesBySlug.set(g.slug, g);
    });

    // 4. Group by gameId
    const groupsMap = new Map<string, GameLicenseItem[]>();
    allLicenses.forEach((lic) => {
      const key = lic.gameId || lic.gameSlug;
      if (!groupsMap.has(key)) {
        groupsMap.set(key, []);
      }
      groupsMap.get(key)!.push(lic);
    });

    const totalLicensesCount = allLicenses.length;
    let totalBoundDevices = 0;

    const groups: GameLicenseGroup[] = [];

    groupsMap.forEach((lics, gameKey) => {
      // Find matching game for display
      const matchedGame = gamesById.get(gameKey) || gamesBySlug.get(gameKey) || gamesList.find(
        (g) => g.title.toLowerCase() === (lics[0]?.gameTitle || '').toLowerCase()
      );

      const gameTitle = matchedGame?.title || lics[0]?.gameTitle || gameKey;
      const gameSlug = matchedGame?.slug || lics[0]?.gameSlug || gameKey;
      const coverImage = matchedGame?.cardImage || matchedGame?.cover || matchedGame?.heroImage;
      const genres = matchedGame?.genres || [];

      // Sort licenses in this group: latest first
      lics.sort((a, b) => {
        const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });

      const totalGroupLicenses = lics.length;
      const activeLicenses = lics.filter((l) => l.status === 'active').length;
      const boundCount = lics.filter((l) => Boolean(l.hwid)).length;
      totalBoundDevices += boundCount;

      const percentage = totalLicensesCount > 0
        ? Math.round((totalGroupLicenses / totalLicensesCount) * 100)
        : 0;

      groups.push({
        gameId: matchedGame?.id || gameKey,
        gameTitle,
        gameSlug,
        coverImage,
        genres,
        totalLicenses: totalGroupLicenses,
        activeLicenses,
        boundDevicesCount: boundCount,
        percentage,
        lastClaimedAt: lics[0]?.createdAt,
        licenses: lics
      });
    });

    // Sort groups by totalLicenses descending (most popular game first)
    groups.sort((a, b) => b.totalLicenses - a.totalLicenses);

    // Calculate top claimed game
    const topGroup = groups[0] || null;
    const topGame = topGroup
      ? {
          gameTitle: topGroup.gameTitle,
          gameId: topGroup.gameId,
          count: topGroup.totalLicenses,
          percentage: topGroup.percentage
        }
      : null;

    const stats: LicenseGlobalStats = {
      totalLicenses: totalLicensesCount,
      totalUniqueUsers: uniqueUserIds.size,
      totalGamesClaimed: groups.length,
      totalBoundDevices,
      topGame
    };

    return {
      licenses: allLicenses,
      groups,
      stats
    };
  } catch (error) {
    console.error('Error fetching license stats:', error);
    throw error;
  }
};

export interface GameLicenseCountStats {
  total: number;
  bound: number;
}

/**
 * Fetch active license counts grouped by gameId and gameSlug.
 * Returns a dictionary mapping gameId/gameSlug -> { total, bound }
 */
export const fetchGameLicenseCounts = async (): Promise<Record<string, GameLicenseCountStats>> => {
  return (await fetchFromBackend<Record<string, GameLicenseCountStats>>('api/v1/licenses/stats/')) || {};
};

/**
 * Fetch active license count and bound stats for a specific game by ID and optional slug.
 */
export const fetchSingleGameLicenseStats = async (
  gameId: string,
  slug?: string
): Promise<GameLicenseCountStats> => {
  const counts = await fetchGameLicenseCounts();
  return counts[gameId] || (slug ? counts[slug] : undefined) || { total: 0, bound: 0 };
};
