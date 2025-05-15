'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'; 
import { db } from '@/lib/firebase';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isLoading: true
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if auth is available
    if (!auth) {
      console.error('Firebase auth is not initialized');
      setIsLoading(false);
      return () => {};
    }
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      // If we have a user and Firestore is initialized, ensure they have a profile
      if (user && db) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          
          if (!userSnap.exists()) {
            // Create new user profile if it doesn't exist
            await setDoc(userRef, {
              email: user.email,
              name: user.displayName || '',
              createdAt: serverTimestamp(),
              lastLoginAt: serverTimestamp()
            });
          } else {
            // Update last login time
            await setDoc(userRef, {
              lastLoginAt: serverTimestamp()
            }, { merge: true });
          }
        } catch (error) {
          console.error('Error managing user profile in Firestore:', error);
          // Store minimal user info in localStorage as fallback
          if (typeof window !== 'undefined') {
            localStorage.setItem('userProfile', JSON.stringify({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              lastLoginAt: new Date().toISOString()
            }));
          }
        }
      } else if (user && !db) {
        console.warn('User logged in but Firestore is not available, using localStorage fallback');
        // Store minimal user info in localStorage as fallback
        if (typeof window !== 'undefined') {
          localStorage.setItem('userProfile', JSON.stringify({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            lastLoginAt: new Date().toISOString()
          }));
        }
      }
      
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
