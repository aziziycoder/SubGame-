import {
  collection,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { db } from './firebase';
import type { Game } from '../types/game';

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
    // 1. Fetch all users to have latest names/photos
    const usersMap = new Map<string, { displayName?: string; photoURL?: string; email?: string }>();
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      usersSnap.forEach((d) => {
        const u = d.data();
        usersMap.set(d.id, {
          displayName: u.displayName,
          photoURL: u.photoURL,
          email: u.email
        });
      });
    } catch (e) {
      console.warn('Could not load users map for licenses:', e);
    }

    // 2. Fetch all licenses
    const licensesSnap = await getDocs(collection(db, 'licenses'));
    const allLicenses: GameLicenseItem[] = [];
    const uniqueUserIds = new Set<string>();

    licensesSnap.forEach((d) => {
      const data = d.data();
      const userId = data.userId || '';
      const userProfile = usersMap.get(userId);

      const license: GameLicenseItem = {
        id: d.id,
        userId,
        userEmail: userProfile?.email || data.userEmail || 'Noma’lum email',
        userName: userProfile?.displayName || data.userName || data.userEmail?.split('@')[0] || 'Foydalanuvchi',
        userPhoto: userProfile?.photoURL || data.userPhoto || undefined,
        gameId: data.gameId || 'noma-lum',
        gameTitle: data.gameTitle || 'Noma’lum o‘yin',
        gameSlug: data.gameSlug || (data.gameId ? String(data.gameId) : 'noma-lum'),
        status: data.status === 'revoked' ? 'revoked' : 'active',
        hwid: data.hwid || null,
        boundAt: data.boundAt || null,
        boundDeviceName: data.boundDeviceName || null,
        paymentProvider: data.paymentProvider || undefined,
        paymentRef: data.paymentRef || undefined,
        paidAmount: data.paidAmount || undefined,
        revokedReason: data.revokedReason || undefined,
        createdAt: data.createdAt || null
      };

      allLicenses.push(license);
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
  try {
    const q = query(collection(db, 'licenses'), where('status', '==', 'active'));
    const snap = await getDocs(q);
    const map: Record<string, GameLicenseCountStats> = {};

    snap.forEach((d) => {
      const data = d.data();
      const gid = data.gameId;
      const slug = data.gameSlug;
      const isBound = Boolean(data.hwid);

      const keys = new Set<string>();
      if (gid) keys.add(gid);
      if (slug) keys.add(slug);

      keys.forEach((key) => {
        if (!map[key]) {
          map[key] = { total: 0, bound: 0 };
        }
        map[key].total += 1;
        if (isBound) {
          map[key].bound += 1;
        }
      });
    });

    return map;
  } catch (err) {
    console.warn('Failed to fetch game license counts:', err);
    return {};
  }
};

/**
 * Fetch active license count and bound stats for a specific game by ID and optional slug.
 */
export const fetchSingleGameLicenseStats = async (
  gameId: string,
  slug?: string
): Promise<GameLicenseCountStats> => {
  try {
    const seenLicenseIds = new Set<string>();
    let total = 0;
    let bound = 0;

    // 1. Check by gameId
    const q1 = query(
      collection(db, 'licenses'),
      where('gameId', '==', gameId),
      where('status', '==', 'active')
    );
    const snap1 = await getDocs(q1);
    snap1.forEach((d) => {
      seenLicenseIds.add(d.id);
      total += 1;
      if (d.data().hwid) bound += 1;
    });

    // 2. Also check if stored by slug if different
    if (slug && slug !== gameId) {
      const q2 = query(
        collection(db, 'licenses'),
        where('gameId', '==', slug),
        where('status', '==', 'active')
      );
      const snap2 = await getDocs(q2);
      snap2.forEach((d) => {
        if (!seenLicenseIds.has(d.id)) {
          seenLicenseIds.add(d.id);
          total += 1;
          if (d.data().hwid) bound += 1;
        }
      });
    }

    return { total, bound };
  } catch (err) {
    console.warn(`Failed to fetch license stats for game ${gameId}:`, err);
    return { total: 0, bound: 0 };
  }
};

