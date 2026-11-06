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
  lastClaimedAt?: string | null;
}

export interface LicenseGlobalStats {
  totalLicenses: number;
  activeLicenses: number;
  revokedLicenses: number;
  totalUniqueUsers: number;
  totalGamesClaimed: number;
  totalBoundDevices: number;
}

export interface LicenseSummary {
  stats: LicenseGlobalStats;
  groups: GameLicenseGroup[];
  providers: string[];
  unpaidRevokedIds: string[];
}

/** Totals and per-game counts, without the licenses themselves. */
export const getAdminLicenseSummary = async (): Promise<LicenseSummary> =>
  apiRequest<LicenseSummary>('api/v1/licenses/admin/summary/');

export const LICENSES_PAGE_SIZE = 50;

export interface LicenseFilters {
  search?: string;
  game?: string;
  status?: 'all' | 'active' | 'revoked';
  device?: 'all' | 'bound' | 'unbound';
  provider?: string;
  sort?: 'newest' | 'oldest' | 'recently_bound';
}

export interface LicensesPage {
  licenses: GameLicenseItem[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}

/** One page of licenses; search and filters are applied by the server. */
export const getAdminLicensesPage = async (
  filters: LicenseFilters,
  page = 1,
  pageSize = LICENSES_PAGE_SIZE
): Promise<LicensesPage> => {
  const query = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== 'all') query.set(key, String(value).trim());
  });
  if (!query.get('search')) query.delete('search');
  return apiRequest<LicensesPage>(`api/v1/licenses/admin/list/?${query}`);
};

/** Every license matching the filters, walked page by page (for CSV export). */
export const getAllAdminLicenses = async (filters: LicenseFilters): Promise<GameLicenseItem[]> => {
  const all: GameLicenseItem[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const data = await getAdminLicensesPage(filters, page, 500);
    all.push(...data.licenses);
    totalPages = data.pagination.totalPages;
    page += 1;
  } while (page <= totalPages);
  return all;
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
