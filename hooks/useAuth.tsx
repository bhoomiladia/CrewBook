// hooks/useAuth.tsx
'use client';

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '../firebaseConfig'; // Import db
import { doc, onSnapshot } from 'firebase/firestore'; // Import doc and onSnapshot
import { UserProfile } from '@/lib/types'; // Import your UserProfile type

// --- FIX IS HERE ---
// Define the shape of the context value
interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null; // <-- ADD THIS
  loading: boolean;
}
// --- END FIX ---

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null); // <-- ADD THIS
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // This listener handles Firebase Auth state
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) {
        // User is logged out
        setUserProfile(null);
        setLoading(false);
      }
      // If user is logged in, the next useEffect will run
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    // This listener handles the Firestore profile data
    let unsubscribeProfile: () => void;

    if (currentUser) {
      // Don't set loading to true here, causes flicker
      const userRef = doc(db, 'users', currentUser.uid);
      
      // Listen for real-time changes to the profile
      unsubscribeProfile = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          setUserProfile(doc.data() as UserProfile);
        } else {
          setUserProfile(null);
        }
        setLoading(false); // Auth is set, profile is set, we are done loading.
      }, (error) => {
        console.error("Error fetching user profile:", error);
        setUserProfile(null);
        setLoading(false);
      });
    }

    // Cleanup the profile listener if auth state changes
    return () => {
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, [currentUser]); // This runs every time the Auth user changes

  const value: AuthContextType = {
    currentUser,
    userProfile, // <-- ADD THIS
    loading,
  };

  // Don't render children until we know auth state AND profile state
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}