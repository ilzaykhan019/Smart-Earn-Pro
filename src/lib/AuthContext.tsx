import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

interface UserData {
  ownerId: string;
  email: string;
  fullName: string;
  username: string;
  phoneNumber: string;
  balance: number;
  role: 'user' | 'admin';
  activePlanId: string;
  investmentAmount: number;
  totalEarnings: number;
  referralCode: string;
  referredBy: string;
  hasInvested: boolean;
  tasksCompletedToday: number;
  adsWatchedToday: number;
  lastActiveDate: string;
  createdAt: number;
  updatedAt: number;
}

interface AuthContextType {
  user: FirebaseUser | null;
  userData: UserData | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, userData: null, loading: true });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Fetch or create user data
        const docRef = doc(db, 'users', firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setUserData(docSnap.data() as UserData);
        } else {
          // Setup new user
          const newUser: UserData = {
             ownerId: firebaseUser.uid,
             email: firebaseUser.email || '',
             fullName: firebaseUser.displayName || '',
             username: firebaseUser.displayName?.replace(/\s/g, '').toLowerCase() || firebaseUser.uid.substring(0,6),
             phoneNumber: '',
             balance: 0,
             role: 'user',
             activePlanId: '',
             investmentAmount: 0,
             totalEarnings: 0,
             referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
             referredBy: '',
             hasInvested: false,
             tasksCompletedToday: 0,
             adsWatchedToday: 0,
             lastActiveDate: new Date().toISOString(),
             createdAt: Date.now(),
             updatedAt: Date.now(),
          };
          await setDoc(docRef, newUser);
          setUserData(newUser);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userData, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
