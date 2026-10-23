export type UserRole = 'admin' | 'user';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role?: UserRole;
  isAdmin?: boolean;
  createdAt?: any;
  lastLoginAt?: any;
}

export interface GameLicense {
  id: string; // `${userId}_${gameId}`
  userId: string;
  userEmail: string;
  userName?: string;
  userPhoto?: string;
  gameId: string;
  gameTitle: string;
  gameSlug: string;
  status: 'active' | 'revoked';
  hwid?: string | null; // Bound hardware ID (1 device limit)
  boundAt?: any;
  boundDeviceName?: string;
  createdAt: any;
}

export interface UserWithLicenses extends UserProfile {
  licenses: GameLicense[];
  claimedGamesCount: number;
  activeLicensesCount: number;
  boundDevicesCount: number;
}

