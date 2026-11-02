import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  type User,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  query,
  where,
  onSnapshot
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../services/firebase';
import type { GameLicense, UserProfile } from '../types/auth';
import { fetchFromBackend, setTokens, clearTokens } from '../services/apiClient';

export const ADMIN_EMAILS = [
  'azizbekgulomovweb@gmail.com',
  'imuz21029@gmail.com'
];

interface AuthContextType {
  user: User | null;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [licenses, setLicenses] = useState<Record<string, GameLicense>>({});

  const isEmailAdmin = Boolean(user?.email && ADMIN_EMAILS.some((e) => e.toLowerCase() === user.email?.toLowerCase()));
  const isProfileAdmin = Boolean(userProfile?.role === 'admin' || userProfile?.isAdmin === true);
  const isAdmin = isEmailAdmin || isProfileAdmin;

  useEffect(() => {
    let unsubscribeUserDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (unsubscribeUserDoc) {
        unsubscribeUserDoc();
        unsubscribeUserDoc = null;
      }

      if (currentUser) {
        const isMaster = Boolean(
          currentUser.email &&
            ADMIN_EMAILS.some((e) => e.toLowerCase() === currentUser.email?.toLowerCase())
        );

        // 1. Authenticate with Django REST Backend to obtain JWT
        try {
          const idToken = await currentUser.getIdToken();
          const authRes = await fetchFromBackend<{
            user: any;
            access: string;
            refresh: string;
          }>('api/v1/auth/google/', {
            method: 'POST',
            body: JSON.stringify({ id_token: idToken }),
          });

          if (authRes?.access) {
            setTokens(authRes.access, authRes.refresh);
          }

          if (authRes?.user) {
            const isUserAdmin = Boolean(isMaster || authRes.user.isAdmin || authRes.user.role === 'admin');
            setUserProfile({
              uid: authRes.user.uid || currentUser.uid,
              email: authRes.user.email || currentUser.email,
              displayName: authRes.user.displayName || currentUser.displayName,
              photoURL: authRes.user.photoURL || currentUser.photoURL,
              role: isUserAdmin ? 'admin' : 'user',
              isAdmin: isUserAdmin,
              createdAt: authRes.user.createdAt,
              lastLoginAt: authRes.user.lastLoginAt,
            });
          }

          // Fetch user licenses from Django backend
          const backendLicenses = await fetchFromBackend<Record<string, GameLicense>>('api/v1/licenses/my/');
          if (backendLicenses && typeof backendLicenses === 'object') {
            setLicenses(backendLicenses);
          }
        } catch (backendAuthErr) {
          console.warn('[Backend] Auth sync warning:', backendAuthErr);
        }

        // 2. Sync user to firestore safely as fallback
        const userRef = doc(db, 'users', currentUser.uid);
        try {
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            const newUserData: Record<string, any> = {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,
              createdAt: serverTimestamp(),
              lastLoginAt: serverTimestamp(),
            };

            if (isMaster) {
              newUserData.role = 'admin';
              newUserData.isAdmin = true;
            }

            await setDoc(userRef, newUserData);
          } else {
            const existingData = userSnap.data();
            const updatePayload: Record<string, any> = {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName || existingData.displayName,
              photoURL: currentUser.photoURL || existingData.photoURL,
              lastLoginAt: serverTimestamp(),
            };

            if (isMaster) {
              updatePayload.role = 'admin';
              updatePayload.isAdmin = true;
            }

            await setDoc(userRef, updatePayload, { merge: true });
          }
        } catch (err) {
          console.warn('Failed to sync user to Firestore:', err);
        }

        // Real-time listener for user profile (for dynamic role updates)
        unsubscribeUserDoc = onSnapshot(
          userRef,
          (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              const isUserAdmin = Boolean(isMaster || data.isAdmin === true || data.role === 'admin');
              setUserProfile((prev) => ({
                uid: docSnap.id,
                email: data.email || currentUser.email,
                displayName: data.displayName || currentUser.displayName,
                photoURL: data.photoURL || currentUser.photoURL,
                role: isUserAdmin ? 'admin' : 'user',
                isAdmin: isUserAdmin,
                createdAt: data.createdAt || prev?.createdAt,
                lastLoginAt: data.lastLoginAt || prev?.lastLoginAt,
              }));
            }
          },
          (err) => {
            console.warn('User profile listener error:', err);
          }
        );
      } else {
        clearTokens();
        setUserProfile(null);
        setLicenses({});
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUserDoc) {
        unsubscribeUserDoc();
      }
    };
  }, []);

  // Listen to user licenses in real-time
  useEffect(() => {
    if (!user) {
      setLicenses({});
      return;
    }

    try {
      const q = query(collection(db, 'licenses'), where('userId', '==', user.uid));
      const unsubscribeLicenses = onSnapshot(q, (snapshot) => {
        const licenseMap: Record<string, GameLicense> = {};
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as GameLicense;
          licenseMap[data.gameId] = {
            ...data,
            id: docSnap.id,
          };
        });
        setLicenses(licenseMap);
      }, (error) => {
        console.warn('Error listening to licenses:', error);
      });

      return () => unsubscribeLicenses();
    } catch (err) {
      console.warn('Could not set up licenses listener:', err);
    }
  }, [user]);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      clearTokens();
      await firebaseSignOut(auth);
      setUser(null);
      setUserProfile(null);
      setLicenses({});
    } catch (error) {
      console.error('Sign-Out Error:', error);
    }
  };

  const claimLicense = async (gameId: string, gameTitle: string, gameSlug: string) => {
    const PAID_GAMES = ['stray', 'a-plague-tale-legacy'];
    if (!isAdmin && (PAID_GAMES.includes(gameId) || PAID_GAMES.includes(gameSlug))) {
      return {
        success: false,
        message: 'Ushbu o‘yin pullik. Litsenziya faqat to‘lov muvaffaqiyatli amalga oshirilganda avtomatik biriktiriladi.',
      };
    }

    if (!user) {
      try {
        await signInWithGoogle();
      } catch {
        return { success: false, message: 'Google akkaunt bilan kirish bekor qilindi' };
      }
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { success: false, message: 'Iltimos, avval tizimga kiring' };
    }

    // 1. Claim directly via Django REST Backend
    try {
      const claimRes = await fetchFromBackend<{
        success: boolean;
        message?: string;
        license?: any;
      }>('api/v1/licenses/claim-free/', {
        method: 'POST',
        body: JSON.stringify({ gameId, gameSlug }),
      });

      if (claimRes?.success && claimRes.license) {
        setLicenses((prev) => ({
          ...prev,
          [gameId]: claimRes.license,
          [gameSlug]: claimRes.license,
        }));
      }
    } catch (backendClaimErr) {
      console.warn('[Backend] Claim license error, falling back to Firestore:', backendClaimErr);
    }

    // 2. Also keep Firestore in sync as fallback
    try {
      const licenseDocId = `${currentUser.uid}_${gameId}`;
      const licenseRef = doc(db, 'licenses', licenseDocId);

      await setDoc(
        licenseRef,
        {
          id: licenseDocId,
          userId: currentUser.uid,
          userEmail: currentUser.email || '',
          userName: currentUser.displayName || '',
          userPhoto: currentUser.photoURL || '',
          gameId,
          gameTitle,
          gameSlug,
          status: 'active',
          hwid: null,
          boundAt: null,
          boundDeviceName: null,
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );

      return { success: true };
    } catch (error: any) {
      console.error('Error claiming license in Firestore fallback:', error);
      // If backend succeeded, still return success
      return { success: true };
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
        userProfile,
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
