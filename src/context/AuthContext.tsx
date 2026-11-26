import React, { createContext, useCallback, useContext, useState, useEffect } from 'react';
import type { GameLicense, UserProfile } from '../types/auth';
import { ApiError, apiRequest, clearTokens, getAccessToken, setTokens } from '../services/apiClient';
import { requestGoogleAccessToken } from '../services/googleSignIn';

export const ADMIN_EMAILS = [
  'azizbekgulomovweb@gmail.com',
  'imuz21029@gmail.com'
];

const USER_STORAGE_KEY = 'subgame_auth_user';
const LOCAL_DUB_LICENSES_KEY = 'subgame_local_dub_licenses';

export type LicenseEdition = 'subtitle' | 'dubbing';

function readLocalDubLicenses(): Record<string, GameLicense> {
  try {
    const raw = localStorage.getItem(LOCAL_DUB_LICENSES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

interface AuthContextType {
  user: UserProfile | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  licenses: Record<string, GameLicense>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  claimLicense: (gameId: string, gameTitle: string, gameSlug: string, edition?: LicenseEdition) => Promise<{ success: boolean; message?: string }>;
  isLicenseClaimed: (gameId: string, edition?: LicenseEdition) => boolean;
  getGameLicense: (gameId: string, edition?: LicenseEdition) => GameLicense | undefined;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function toUserProfile(raw: any): UserProfile {
  const isUserAdmin = Boolean(raw.isAdmin || raw.role === 'admin');
  return {
    uid: raw.uid || raw.id,
    email: raw.email ?? null,
    displayName: raw.displayName ?? null,
    photoURL: raw.photoURL ?? null,
    role: isUserAdmin ? 'admin' : 'user',
    isAdmin: isUserAdmin,
    createdAt: raw.createdAt,
    lastLoginAt: raw.lastLoginAt,
  };
}

function readCachedUser(): UserProfile | null {
  if (!getAccessToken()) return null;
  try {
    const saved = localStorage.getItem(USER_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(readCachedUser);
  const [loading, setLoading] = useState(() => Boolean(getAccessToken()));
  const [licenses, setLicenses] = useState<Record<string, GameLicense>>({});

  const isEmailAdmin = Boolean(user?.email && ADMIN_EMAILS.some((e) => e.toLowerCase() === user.email?.toLowerCase()));
  const isAdmin = isEmailAdmin || Boolean(user?.role === 'admin' || user?.isAdmin === true);

  const clearSession = useCallback(() => {
    clearTokens();
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
    setLicenses({});
  }, []);

  const applyUser = useCallback((raw: any) => {
    const profile = toUserProfile(raw);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
    setUser(profile);
  }, []);

  const refreshLicenses = useCallback(async () => {
    try {
      const remote = await apiRequest<Record<string, GameLicense>>('api/v1/licenses/my/');
      setLicenses({ ...readLocalDubLicenses(), ...remote });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearSession();
      } else {
        console.warn('Could not load licenses:', err);
        setLicenses((prev) => ({ ...readLocalDubLicenses(), ...prev }));
      }
    }
  }, [clearSession]);

  // Restore the session from the stored JWT
  useEffect(() => {
    if (!getAccessToken()) return;

    apiRequest('api/v1/auth/me/')
      .then(applyUser)
      .catch((err) => {
        // Keep the cached profile through network failures; only a rejected token ends the session
        if (err instanceof ApiError && err.status === 401) {
          clearSession();
        } else {
          console.warn('Could not restore session:', err);
        }
      })
      .finally(() => setLoading(false));
  }, [applyUser, clearSession]);

  // Keep licenses current: admin grants, resets and completed payments show up on return to the tab
  useEffect(() => {
    if (!user?.uid) return;

    refreshLicenses();
    window.addEventListener('focus', refreshLicenses);
    return () => window.removeEventListener('focus', refreshLicenses);
  }, [user?.uid, refreshLicenses]);

  const signInWithGoogle = async () => {
    try {
      const accessToken = await requestGoogleAccessToken();
      const authRes = await apiRequest<{ user: any; access: string; refresh: string }>('api/v1/auth/google/', {
        method: 'POST',
        body: JSON.stringify({ access_token: accessToken }),
      });
      setTokens(authRes.access, authRes.refresh);
      applyUser(authRes.user);
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    clearSession();
  };

  const claimLicense = async (
    gameId: string,
    gameTitle: string,
    gameSlug: string,
    edition: LicenseEdition = 'subtitle'
  ) => {
    const PAID_GAMES = ['stray', 'a-plague-tale-legacy'];
    if (edition === 'subtitle' && !isAdmin && (PAID_GAMES.includes(gameId) || PAID_GAMES.includes(gameSlug))) {
      return {
        success: false,
        message: 'Ushbu o‘yin pullik. Litsenziya faqat to‘lov muvaffaqiyatli amalga oshirilganda avtomatik biriktiriladi.',
      };
    }

    if (!getAccessToken()) {
      try {
        await signInWithGoogle();
      } catch {
        return { success: false, message: 'Google akkaunt bilan kirish bekor qilindi' };
      }
    }

    const targetKey = edition === 'dubbing' ? `${gameId}__dub` : gameId;
    const targetSlugKey = edition === 'dubbing' ? `${gameSlug}__dub` : gameSlug;

    try {
      const claimRes = await apiRequest<{ success: boolean; license?: GameLicense }>('api/v1/licenses/claim-free/', {
        method: 'POST',
        body: JSON.stringify({ gameId: targetKey, gameTitle, gameSlug: targetSlugKey }),
      });

      if (claimRes.license) {
        setLicenses((prev) => ({
          ...prev,
          [targetKey]: claimRes.license!,
          [targetSlugKey]: claimRes.license!,
        }));
      }
      return { success: true };
    } catch (error: any) {
      // Local fallback for dubbing edition when remote backend has not yet registered __dub records
      if (edition === 'dubbing') {
        const localLic: GameLicense = {
          id: `${user?.uid || 'local'}_${targetKey}`,
          userId: user?.uid || 'local',
          userEmail: user?.email || '',
          userName: user?.displayName || undefined,
          gameId: targetKey,
          gameTitle: `${gameTitle} (Dublyaj)`,
          gameSlug: targetSlugKey,
          status: 'active',
          createdAt: new Date().toISOString(),
        };
        const stored = readLocalDubLicenses();
        stored[targetKey] = localLic;
        stored[targetSlugKey] = localLic;
        try {
          localStorage.setItem(LOCAL_DUB_LICENSES_KEY, JSON.stringify(stored));
        } catch {}
        setLicenses((prev) => ({
          ...prev,
          [targetKey]: localLic,
          [targetSlugKey]: localLic,
        }));
        return { success: true };
      }
      console.error('Error claiming license:', error);
      return { success: false, message: error?.message || 'Litsenziyani olishda xatolik yuz berdi.' };
    }
  };

  const isLicenseClaimed = (gameId: string, edition: LicenseEdition = 'subtitle'): boolean => {
    if (isAdmin) return true;
    const key = edition === 'dubbing' ? `${gameId}__dub` : gameId;
    return !!licenses[key];
  };

  const getGameLicense = (gameId: string, edition: LicenseEdition = 'subtitle'): GameLicense | undefined => {
    const key = edition === 'dubbing' ? `${gameId}__dub` : gameId;
    return licenses[key];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile: user,
        isAdmin,
        loading,
        licenses,
        signInWithGoogle,
        signOut,
        claimLicense,
        isLicenseClaimed,
        getGameLicense,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
