import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from './firebase';
import type { UserProfile, GameLicense, UserWithLicenses, UserRole } from '../types/auth';
import { ADMIN_EMAILS } from '../context/AuthContext';

export interface UserStats {
  totalUsers: number;
  totalAdmins: number;
  totalLicenses: number;
  totalBoundDevices: number;
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

    // 2. Fetch all licenses
    const licensesSnapshot = await getDocs(collection(db, 'licenses'));
    const licensesByUser: Record<string, GameLicense[]> = {};
    let totalBoundDevices = 0;

    licensesSnapshot.forEach((docSnap) => {
      const lic = { id: docSnap.id, ...docSnap.data() } as GameLicense;
      if (!licensesByUser[lic.userId]) {
        licensesByUser[lic.userId] = [];
      }
      licensesByUser[lic.userId].push(lic);

      if (lic.hwid) {
        totalBoundDevices++;
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
      totalLicenses: licensesSnapshot.size,
      totalBoundDevices,
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
