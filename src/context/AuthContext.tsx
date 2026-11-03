import React, { createContext, useCallback, useContext, useState, useEffect } from 'react';
import type { GameLicense, UserProfile } from '../types/auth';
import { ApiError, apiRequest, clearTokens, getAccessToken, setTokens } from '../services/apiClient';
import { requestGoogleAccessToken } from '../services/googleSignIn';

export const ADMIN_EMAILS = [
  'azizbekgulomovweb@gmail.com',
  'imuz21029@gmail.com'
];

const USER_STORAGE_KEY = 'subgame_auth_user';

interface AuthContextType {
  user: UserProfile | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  licenses: Record<string, GameLicense>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  claimLicense: (gameId: string, gameTitle: string, gameSlug: string) => Promise<{ success: boolean; message?: string }>;
  isLicenseClaimed: (gameId: string) => boolean;
  getGameLicense: (gameId: string) => GameLicense | undefined;
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
      setLicenses(await apiRequest<Record<string, GameLicense>>('api/v1/licenses/my/'));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearSession();
      } else {
        console.warn('Could not load licenses:', err);
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

  const claimLicense = async (gameId: string, gameTitle: string, gameSlug: string) => {
    const PAID_GAMES = ['stray', 'a-plague-tale-legacy'];
    if (!isAdmin && (PAID_GAMES.includes(gameId) || PAID_GAMES.includes(gameSlug))) {
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

    try {
      const claimRes = await apiRequest<{ success: boolean; license?: GameLicense }>('api/v1/licenses/claim-free/', {
        method: 'POST',
        body: JSON.stringify({ gameId, gameTitle, gameSlug }),
      });

      if (claimRes.license) {
        setLicenses((prev) => ({
          ...prev,
          [gameId]: claimRes.license!,
          [gameSlug]: claimRes.license!,
        }));
      }
      return { success: true };
    } catch (error: any) {
      console.error('Error claiming license:', error);
      return { success: false, message: error?.message || 'Litsenziyani olishda xatolik yuz berdi.' };
    }
  };

  const isLicenseClaimed = (gameId: string): boolean => {
    if (isAdmin) return true;
    return !!licenses[gameId];
  };

  const getGameLicense = (gameId: string): GameLicense | undefined => {
    return licenses[gameId];
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
