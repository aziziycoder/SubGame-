import {
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import type { UserProfile, GameLicense, UserWithLicenses, UserRole } from '../types/auth';
import { ADMIN_EMAILS } from '../context/AuthContext';

export interface UserStats {
  totalUsers: number;
  totalAdmins: number;
  totalLicenses: number;
  totalBoundDevices: number;
  orphanedLicensesCount: number;
  rawLicensesCount: number;
}

/**
 * Fetch all users from Firestore along with their claimed licenses.
 */
export const getAllUsersWithLicenses = async (): Promise<{
  users: UserWithLicenses[];
  stats: UserStats;
}> => {
  try {
    // 1. Fetch all users
    let usersSnapshot;
    try {
      const usersQuery = query(collection(db, 'users'), orderBy('lastLoginAt', 'desc'));
      usersSnapshot = await getDocs(usersQuery);
    } catch {
      // Fallback if index on lastLoginAt is missing or unindexed
      usersSnapshot = await getDocs(collection(db, 'users'));
    }

    const rawUsers: UserProfile[] = [];
    usersSnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      rawUsers.push({
        uid: docSnap.id,
        email: data.email || null,
        displayName: data.displayName || null,
        photoURL: data.photoURL || null,
        role: data.role || (data.isAdmin ? 'admin' : 'user'),
        isAdmin: data.isAdmin || data.role === 'admin',
        createdAt: data.createdAt || null,
        lastLoginAt: data.lastLoginAt || null,
      });
    });

    const knownUserIds = new Set(rawUsers.map((u) => u.uid));
    const recoveredUsersMap = new Map<string, UserProfile>();

    // 2. Fetch all licenses
    const licensesSnapshot = await getDocs(collection(db, 'licenses'));
    const licensesByUser: Record<string, GameLicense[]> = {};

    licensesSnapshot.forEach((docSnap) => {
      const lic = { id: docSnap.id, ...docSnap.data() } as GameLicense;
      if (!licensesByUser[lic.userId]) {
        licensesByUser[lic.userId] = [];
      }
      licensesByUser[lic.userId].push(lic);

      // Auto-detect and recover legitimate users who claimed games but were missing from users collection
      if (!knownUserIds.has(lic.userId) && lic.userId && lic.userEmail) {
        if (!recoveredUsersMap.has(lic.userId)) {
          const recovered: UserProfile = {
            uid: lic.userId,
            email: lic.userEmail,
            displayName: lic.userName || lic.userEmail.split('@')[0],
            photoURL: lic.userPhoto || null,
            role: 'user',
            isAdmin: false,
            createdAt: lic.createdAt || null,
            lastLoginAt: lic.createdAt || null,
          };
          recoveredUsersMap.set(lic.userId, recovered);

          // Asynchronously persist to users collection in Firestore
          setDoc(
            doc(db, 'users', lic.userId),
            {
              uid: recovered.uid,
              email: recovered.email,
              displayName: recovered.displayName,
              photoURL: recovered.photoURL,
              role: 'user',
              isAdmin: false,
              createdAt: recovered.createdAt || serverTimestamp(),
              lastLoginAt: recovered.lastLoginAt || serverTimestamp(),
            },
            { merge: true }
          ).catch((e) => console.warn('Auto-sync missing user doc error:', e));
        }
      }
    });

    // Merge recovered users into rawUsers
    recoveredUsersMap.forEach((u) => {
      rawUsers.push(u);
      knownUserIds.add(u.uid);
    });

    // Compute active vs truly orphaned licenses
    let activeUserLicenses = 0;
    let activeUserBoundDevices = 0;
    let orphanedCount = 0;

    licensesSnapshot.forEach((docSnap) => {
      const lic = docSnap.data() as GameLicense;
      if (knownUserIds.has(lic.userId)) {
        activeUserLicenses++;
        if (lic.hwid) {
          activeUserBoundDevices++;
        }
      } else {
        orphanedCount++;
      }
    });

    // 3. Assemble UserWithLicenses
    let totalAdmins = 0;
    const usersWithLicenses: UserWithLicenses[] = rawUsers.map((user) => {
      const userEmail = (user.email || '').toLowerCase();
      const isSuperAdmin = ADMIN_EMAILS.some((e) => e.toLowerCase() === userEmail);
      const isUserAdmin = isSuperAdmin || user.role === 'admin' || user.isAdmin === true;

      if (isUserAdmin) {
        totalAdmins++;
      }

      const userLicenses = licensesByUser[user.uid] || [];
      const activeLicenses = userLicenses.filter((l) => l.status === 'active');
      const boundLicenses = userLicenses.filter((l) => Boolean(l.hwid));

      return {
        ...user,
        role: isUserAdmin ? 'admin' : 'user',
        isAdmin: isUserAdmin,
        licenses: userLicenses,
        claimedGamesCount: userLicenses.length,
        activeLicensesCount: activeLicenses.length,
        boundDevicesCount: boundLicenses.length,
      };
    });

    // Sort by admin first, then last login or name
    usersWithLicenses.sort((a, b) => {
      if (a.isAdmin && !b.isAdmin) return -1;
      if (!a.isAdmin && b.isAdmin) return 1;
      return (b.claimedGamesCount || 0) - (a.claimedGamesCount || 0);
    });

    const stats: UserStats = {
      totalUsers: usersWithLicenses.length,
      totalAdmins,
      totalLicenses: activeUserLicenses, // Only licenses belonging to existing users
      totalBoundDevices: activeUserBoundDevices, // Only devices belonging to existing users
      orphanedLicensesCount: orphanedCount,
      rawLicensesCount: licensesSnapshot.size,
    };

    return { users: usersWithLicenses, stats };
  } catch (error) {
    console.error('Error fetching users and licenses:', error);
    throw error;
  }
};

/**
 * Update user role (assign admin or demote to user).
 * Master admin (azizbekgulomovweb@gmail.com) is protected.
 */
export const updateUserRole = async (
  userId: string,
  userEmail: string | null,
  newRole: UserRole
): Promise<{ success: boolean; error?: string }> => {
  try {
    const emailLower = (userEmail || '').toLowerCase();
    const isMasterAdmin = ADMIN_EMAILS.some((e) => e.toLowerCase() === emailLower);

    if (isMasterAdmin && newRole !== 'admin') {
      return {
        success: false,
        error: 'Asosiy tizim ma’muri (Bosh admin) rolini bekor qilib bo‘lmaydi!',
      };
    }

    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      role: newRole,
      isAdmin: newRole === 'admin',
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error updating user role:', error);
    return {
      success: false,
      error: error?.message || 'Foydalanuvchi rolini yangilashda xatolik yuz berdi.',
    };
  }
};

/**
 * Reset HWID binding for a specific game license so user can bind a new PC/device.
 */
export const resetLicenseHwid = async (
  licenseId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const licenseRef = doc(db, 'licenses', licenseId);
    await updateDoc(licenseRef, {
      hwid: null,
      boundDeviceName: null,
      boundAt: null,
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error resetting license HWID:', error);
    return {
      success: false,
      error: error?.message || 'Qurilma bog‘lanmasini bekor qilishda xatolik yuz berdi.',
    };
  }
};

/**
 * Toggle license status between active and revoked.
 */
export const toggleLicenseStatus = async (
  licenseId: string,
  currentStatus: 'active' | 'revoked'
): Promise<{ success: boolean; error?: string }> => {
  try {
    const nextStatus = currentStatus === 'active' ? 'revoked' : 'active';
    const licenseRef = doc(db, 'licenses', licenseId);
    await updateDoc(licenseRef, {
      status: nextStatus,
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error toggling license status:', error);
    return {
      success: false,
      error: error?.message || 'Litsenziya holatini o‘zgartirishda xatolik yuz berdi.',
    };
  }
};

/**
 * Delete a license permanently.
 */
export const deleteLicense = async (
  licenseId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const licenseRef = doc(db, 'licenses', licenseId);
    await deleteDoc(licenseRef);
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting license:', error);
    return {
      success: false,
      error: error?.message || 'Litsenziyani o‘chirishda xatolik yuz berdi.',
    };
  }
};

/**
 * Delete all orphaned licenses (licenses whose userId does not exist in the users collection).
 */
export const cleanupOrphanedLicenses = async (): Promise<{
  success: boolean;
  deletedCount: number;
  error?: string;
}> => {
  try {
    // 1. Fetch all valid user UIDs from users collection
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const validUserIds = new Set(usersSnapshot.docs.map((d) => d.id));

    // 2. Fetch all licenses
    const licensesSnapshot = await getDocs(collection(db, 'licenses'));
    const orphanedDocs = licensesSnapshot.docs.filter((d) => {
      const data = d.data();
      // Keep any license that has a valid Google user email to prevent data loss
      const hasRealUserEmail = Boolean(data.userEmail && data.userEmail.includes('@'));
      if (hasRealUserEmail) return false;
      return !data.userId || !validUserIds.has(data.userId);
    });

    if (orphanedDocs.length === 0) {
      return { success: true, deletedCount: 0 };
    }

    // 3. Batch delete in chunks (max 400 docs per batch)
    let deletedCount = 0;
    const chunkSize = 400;
    for (let i = 0; i < orphanedDocs.length; i += chunkSize) {
      const chunk = orphanedDocs.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      chunk.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      deletedCount += chunk.length;
    }

    return { success: true, deletedCount };
  } catch (error: any) {
    console.error('Error cleaning up orphaned licenses:', error);
    return {
      success: false,
      deletedCount: 0,
      error: error?.message || 'Yetim litsenziyalarni tozalashda xatolik yuz berdi.',
    };
  }
};

export interface GrantLicenseParams {
  userId: string;
  userEmail: string;
  userName?: string;
  userPhoto?: string | null;
  gameId: string;
  gameTitle: string;
  gameSlug: string;
  paymentProvider?: 'admin_grant' | 'manual_paid' | 'click' | 'payme' | 'other' | string;
  paidAmount?: number;
  adminNote?: string;
  grantedBy?: string;
}

/**
 * Grant a game license directly to a user by an admin.
 * Sets license status to 'active', hwid to null (unbound, so user can bind on first launcher launch).
 */
export const grantLicenseToUser = async (
  params: GrantLicenseParams
): Promise<{ success: boolean; licenseId?: string; error?: string }> => {
  try {
    const {
      userId,
      userEmail,
      userName,
      userPhoto,
      gameId,
      gameTitle,
      gameSlug,
      paymentProvider = 'admin_grant',
      paidAmount = 0,
      adminNote = '',
      grantedBy = 'Admin'
    } = params;

    if (!userId || !gameId) {
      return { success: false, error: 'Foydalanuvchi yoki o‘yin tanlanmagan!' };
    }

    const licenseId = `${userId}_${gameId}`;
    const licenseRef = doc(db, 'licenses', licenseId);
    const existingSnap = await getDoc(licenseRef);

    if (existingSnap.exists()) {
      const data = existingSnap.data();
      if (data.status === 'active') {
        return {
          success: false,
          error: `Ushbu foydalanuvchida "${gameTitle}" o‘yini uchun allaqachon faol litsenziya mavjud!`
        };
      }

      // If it existed but was revoked/inactive, reactivate it with new grant details
      await setDoc(
        licenseRef,
        {
          status: 'active',
          paymentProvider,
          paidAmount: typeof paidAmount === 'number' ? paidAmount : 0,
          adminNote: adminNote || '',
          grantedBy: grantedBy || 'Admin',
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );

      return { success: true, licenseId };
    }

    // Create brand new license
    const newLicense = {
      id: licenseId,
      userId,
      userEmail: userEmail || '',
      userName: userName || userEmail?.split('@')[0] || 'Foydalanuvchi',
      userPhoto: userPhoto || null,
      gameId,
      gameTitle: gameTitle || 'Noma’lum o‘yin',
      gameSlug: gameSlug || gameId,
      status: 'active',
      hwid: null,
      boundAt: null,
      boundDeviceName: null,
      paymentProvider,
      paidAmount: typeof paidAmount === 'number' ? paidAmount : 0,
      adminNote: adminNote || '',
      grantedBy: grantedBy || 'Admin',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(licenseRef, newLicense);

    return { success: true, licenseId };
  } catch (error: any) {
    console.error('Error granting license to user:', error);
    return {
      success: false,
      error: error?.message || 'Litsenziya berishda xatolik yuz berdi.'
    };
  }
};
