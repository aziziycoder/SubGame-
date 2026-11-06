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

export type UserFilter = 'all' | 'admin' | 'user' | 'with_devices';

export const USERS_PAGE_SIZE = 50;

export interface UsersPage {
  users: UserWithLicenses[];
  stats: UserStats;
  filterCounts: Record<UserFilter, number>;
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}

export interface UsersPageParams {
  page?: number;
  pageSize?: number;
  search?: string;
  filter?: UserFilter;
  signal?: AbortSignal;
}

/**
 * One page of users with their licenses. Search and filter are applied by the
 * server across all users.
 */
export const getUsersPage = async ({
  page = 1,
  pageSize = USERS_PAGE_SIZE,
  search = '',
  filter = 'all',
  signal,
}: UsersPageParams = {}): Promise<UsersPage> => {
  const query = new URLSearchParams({ page: String(page), page_size: String(pageSize), filter });
  if (search.trim()) query.set('search', search.trim());
  return apiRequest<UsersPage>(`api/v1/auth/admin/users-with-licenses/?${query}`, { signal });
};

/**
 * Every user with licenses, walked page by page (for the full JSON backup).
 */
export const getAllUsersWithLicenses = async (): Promise<UserWithLicenses[]> => {
  const all: UserWithLicenses[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const data = await getUsersPage({ page, pageSize: 500 });
    all.push(...data.users);
    totalPages = data.pagination.totalPages;
    page += 1;
  } while (page <= totalPages);
  return all;
};

export interface DashboardStats {
  generatedAt: string;
  timezone: string;
  users: {
    total: number; today: number; last7: number; last30: number;
    admins: number; active7: number; active30: number; withLicense: number;
  };
  licenses: {
    total: number; today: number; last7: number; last30: number;
    active: number; revoked: number; bound: number; activeUnbound: number;
    byProvider: { provider: string; count: number }[];
  };
  devices: { uniqueHwids: number; boundLicenses: number; boundLast7: number; boundLast30: number };
  orders: {
    total: number; paid: number; pending: number; cancelled: number; currency: string;
    revenue: { total: number; today: number; last7: number; last30: number };
    lastPaidAt: string | null;
  };
  catalog: { total: number; ready: number };
  games: DashboardGame[];
  topGames: DashboardGame[];
  series: { date: string; users: number; licenses: number; revenue: number }[];
  activity: DashboardActivity[];
}

export interface DashboardGame {
  gameId: string; title: string; slug: string; image: string;
  licenses: number; active: number; bound: number; last30: number;
  paidOrders: number; revenue: number;
}

export interface DashboardActivity {
  type: 'signup' | 'license' | 'bind' | 'payment';
  at: string | null;
  user: string;
  email: string;
  detail: string;
  provider?: string;
  device?: string;
  amount?: number;
}

export const getDashboardStats = async (): Promise<DashboardStats> =>
  apiRequest<DashboardStats>('api/v1/auth/admin/dashboard-stats/');

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
