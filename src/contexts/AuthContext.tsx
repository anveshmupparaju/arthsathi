import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { generateSalt, deriveKey } from '@/lib/encryption';
import { User } from '@/types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: User | null;
  encryptionKey: CryptoKey | null;
  loading: boolean;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  setEncryptionKeyInMemory: (key: CryptoKey) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
  const [loading, setLoading] = useState(true);

  // Signup function
  async function signup(email: string, password: string, displayName: string) {
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update display name
      await updateProfile(user, { displayName });

      // Generate encryption salt
      const salt = generateSalt();

      // Derive encryption key (but don't store it)
      const key = await deriveKey(password, salt);
      setEncryptionKey(key);

      // Create user profile in Firestore
      const userProfile: Omit<User, 'uid'> = {
        email: user.email!,
        displayName: displayName,
        encryptionSalt: salt,
        locale: 'en-IN',
        currency: 'INR',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(doc(db, 'users', user.uid), userProfile);
      
      console.log('User registered successfully');
    } catch (error: any) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  // Login function
  async function login(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch user profile to get salt
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as Omit<User, 'uid'>;
        
        // Derive encryption key from password and stored salt
        const key = await deriveKey(password, userData.encryptionSalt);
        setEncryptionKey(key);

        setUserProfile({ uid: user.uid, ...userData } as User);
        console.log('Login successful');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Google Sign-In
  async function loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Check if user profile exists
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // New Google user - create profile
        const salt = generateSalt();
        
        const userProfile: Omit<User, 'uid'> = {
          email: user.email!,
          displayName: user.displayName || 'User',
          photoURL: user.photoURL || undefined,
          encryptionSalt: salt,
          locale: 'en-IN',
          currency: 'INR',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await setDoc(doc(db, 'users', user.uid), userProfile);
      }

      // For Google login, we'll use a default encryption key
      // In production, you might want to prompt for a separate encryption password
      const defaultPassword = user.uid; // Using UID as password (not recommended for production)
      const userData = userDoc.exists() ? userDoc.data() : await getDoc(doc(db, 'users', user.uid)).then(d => d.data());
      const key = await deriveKey(defaultPassword, (userData as any).encryptionSalt);
      setEncryptionKey(key);

      console.log('Google login successful');
    } catch (error: any) {
      console.error('Google login error:', error);
      throw error;
    }
  }

  // Logout function
  async function logout() {
    try {
      // Clear encryption key from memory
      setEncryptionKey(null);
      setUserProfile(null);
      await signOut(auth);
      console.log('Logout successful');
    } catch (error: any) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  // Reset password
  async function resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('Password reset email sent');
    } catch (error: any) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  // Manually set encryption key (for auto-lock scenarios)
  function setEncryptionKeyInMemory(key: CryptoKey) {
    setEncryptionKey(key);
  }

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Fetch user profile
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as Omit<User, 'uid'>;
          setUserProfile({ uid: user.uid, ...userData } as User);
        }
      } else {
        setUserProfile(null);
        setEncryptionKey(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    userProfile,
    encryptionKey,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    setEncryptionKeyInMemory,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
