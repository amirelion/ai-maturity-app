// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase for client-side
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

// We'll initialize this only on the client side when needed
let googleProvider: GoogleAuthProvider | null = null;

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

if (isBrowser) {
  try {
    // Initialize Firebase
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    
    // Initialize Authentication
    auth = getAuth(app);
    
    // Initialize Firestore
    db = getFirestore(app);
    
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
} else {
  // Handling for server-side rendering - these won't be used
  console.warn('Firebase is not initialized on server-side');
}

// Helper function to get Google provider
export const getGoogleProvider = (): GoogleAuthProvider => {
  if (!isBrowser) {
    throw new Error('GoogleAuthProvider can only be used in browser environment');
  }
  
  if (!googleProvider) {
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
  }
  
  return googleProvider;
};

export { app, auth, db };