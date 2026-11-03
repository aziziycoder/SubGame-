import type { GameLicense, UserWithLicenses, UserRole } from '../types/auth';
import { ADMIN_EMAILS } from '../context/AuthContext';
import { apiRequest } from './apiClient';

export interface UserStats {
  totalUsers: number;
  totalAdmins: number;
  totalLicenses: number;
  totalBoundDevices: number;
  orphanedLicensesCount: number;
  rawLicensesCount: number;
}

/**
 * Fetch all users along with their claimed licenses.
 */
export const getAllUsersWithLicenses = async (): Promise<{
  users: UserWithLicenses[];
  stats: UserStats;
}> => {
  return apiRequest<{ users: UserWithLicenses[]; stats: UserStats }>('api/v1/auth/admin/users-with-licenses/');
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

    await apiRequest(`api/v1/auth/admin/users/${userId}/role/`, {
      method: 'PATCH',
      body: JSON.stringify({ role: newRole }),
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
    await apiRequest(`api/v1/licenses/admin/${licenseId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ action: 'reset_hwid' }),
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
  _currentStatus: 'active' | 'revoked'
): Promise<{ success: boolean; error?: string }> => {
  try {
    await apiRequest(`api/v1/licenses/admin/${licenseId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ action: 'toggle_status' }),
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
    await apiRequest(`api/v1/licenses/admin/${licenseId}/`, {
      method: 'DELETE',
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting license:', error);
    return {
      success: false,
      error: error?.message || 'Litsenziyani o‘chirishda xatolik yuz berdi.',
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
): Promise<{ success: boolean; licenseId?: string; license?: GameLicense; error?: string }> => {
  try {
    const { paymentProvider = 'admin_grant', paidAmount = 0, adminNote = '', grantedBy = 'Admin' } = params;

    if (!params.userId || !params.gameId) {
      return { success: false, error: 'Foydalanuvchi yoki o‘yin tanlanmagan!' };
    }

    const res = await apiRequest<{ license: GameLicense }>('api/v1/licenses/admin/', {
      method: 'POST',
      body: JSON.stringify({
        ...params,
        paymentProvider,
        paidAmount: typeof paidAmount === 'number' ? paidAmount : 0,
        adminNote,
        grantedBy,
      }),
    });

    return { success: true, licenseId: res.license.id, license: res.license };
  } catch (error: any) {
    console.error('Error granting license to user:', error);
    return {
      success: false,
      error: error?.message || 'Litsenziya berishda xatolik yuz berdi.'
    };
  }
};
