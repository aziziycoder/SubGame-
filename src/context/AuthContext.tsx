import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  type User,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  doc,
  setDoc,
  serverTimestamp,
  collection,
  query,
  where,
  onSnapshot
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../services/firebase';
import type { GameLicense, UserProfile } from '../types/auth';

export const ADMIN_EMAILS = [
  'azizbekgulomovweb@gmail.com',
  'azizbekgulomovcoder@gmail.com',
];

export const OWNER_LINKED_EMAILS = [
  'azizbekgulomovweb@gmail.com',
  'azizbekgulomovcoder@gmail.com',
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
        const userRef = doc(db, 'users', currentUser.uid);
        const isMaster = Boolean(currentUser.email && ADMIN_EMAILS.some((e) => e.toLowerCase() === currentUser.email?.toLowerCase()));

        // Sync user to firestore
        try {
          const syncData: any = {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            lastLoginAt: serverTimestamp(),
          };

          if (isMaster) {
            syncData.role = 'admin';
            syncData.isAdmin = true;
          }

          await setDoc(userRef, syncData, { merge: true });
        } catch (err) {
          console.warn('Failed to sync user to Firestore:', err);
        }

        // Real-time listener for user profile (for dynamic role updates)
        unsubscribeUserDoc = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserProfile({
              uid: docSnap.id,
              email: data.email || currentUser.email,
              displayName: data.displayName || currentUser.displayName,
              photoURL: data.photoURL || currentUser.photoURL,
              role: data.role || (isMaster ? 'admin' : 'user'),
              isAdmin: Boolean(data.isAdmin || data.role === 'admin' || isMaster),
              createdAt: data.createdAt,
              lastLoginAt: data.lastLoginAt,
            });
          }
        }, (err) => {
          console.warn('User profile listener error:', err);
        });
      } else {
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
      const isOwnerAccount = Boolean(
        user.email && OWNER_LINKED_EMAILS.some((e) => e.toLowerCase() === user.email?.toLowerCase())
      );

      // If developer account, load both this account's licenses and existing master licenses
      const targetUids = isOwnerAccount && user.uid !== 'A60znZ4poze0mvdeEqh8Xcr5Lj62'
        ? [user.uid, 'A60znZ4poze0mvdeEqh8Xcr5Lj62']
        : [user.uid];

      const q = query(collection(db, 'licenses'), where('userId', 'in', targetUids));
      const unsubscribeLicenses = onSnapshot(q, (snapshot) => {
        const licenseMap: Record<string, GameLicense> = {};
        const licensesToSync: GameLicense[] = [];

        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as GameLicense;
          licenseMap[data.gameId] = {
            ...data,
            id: docSnap.id,
          };
          if (isOwnerAccount && data.userId !== user.uid) {
            licensesToSync.push(data);
          }
        });

        setLicenses(licenseMap);

        // Auto-sync master licenses to current developer account in Firestore
        if (licensesToSync.length > 0) {
          for (const lic of licensesToSync) {
            const newDocId = `${user.uid}_${lic.gameId}`;
            const licRef = doc(db, 'licenses', newDocId);
            setDoc(
              licRef,
              {
                ...lic,
                id: newDocId,
                userId: user.uid,
                userEmail: user.email || lic.userEmail,
                userName: user.displayName || lic.userName,
              },
              { merge: true }
            ).catch((err) => console.warn('Sync license error:', err));
          }
        }
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
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Sign-Out Error:', error);
    }
  };

  const claimLicense = async (gameId: string, gameTitle: string, gameSlug: string) => {
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
          hwid: null, // Initial state: not yet bound to any machine
          boundAt: null,
          boundDeviceName: null,
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );

      return { success: true };
    } catch (error: any) {
      console.error('Error claiming license:', error);
      return {
        success: false,
        message: error.message || 'Litsenziyani biriktirishda xatolik yuz berdi',
      };
    }
  };

  const isLicenseClaimed = (gameId: string): boolean => {
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
