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

// Check if Firebase config is valid
const isFirebaseConfigValid = (): boolean => {
  const requiredKeys = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId'
  ];
  
  for (const key of requiredKeys) {
    const value = firebaseConfig[key];
    if (!value || value === `your_firebase_${key}_here` || value.includes('XXXXX')) {
      console.error(`Missing or invalid Firebase config: ${key}`);
      return false;
    }
  }
  
  return true;
};

// Initialize Firebase - declare variables
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (typeof window !== 'undefined') {
  console.log('Firebase config:', {
    apiKeyValid: !!firebaseConfig.apiKey && firebaseConfig.apiKey !== 'your_firebase_api_key_here',
    authDomainValid: !!firebaseConfig.authDomain && firebaseConfig.authDomain !== 'your_firebase_auth_domain_here',
    projectIdValid: !!firebaseConfig.projectId && firebaseConfig.projectId !== 'your_firebase_project_id_here'
  });
}

// Initialize Firebase
try {
  // Only initialize Firebase if the config is valid
  if (isFirebaseConfigValid()) {
    // Check for existing Firebase instances
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
    
    // Initialize services (but only in browser environment)
    if (typeof window !== 'undefined') {
      auth = getAuth(app);
      db = getFirestore(app);
    }
  } else {
    console.error('Firebase initialization skipped due to invalid configuration. Please check your environment variables in Vercel project settings.');
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// Helper function to get Google provider
export const getGoogleProvider = (): GoogleAuthProvider => {
  if (typeof window === 'undefined') {
    throw new Error('GoogleAuthProvider can only be used in browser environment');
  }
  
  if (!app) {
    throw new Error('Firebase app is not initialized. Please check your environment variables in Vercel project settings.');
  }
  
  if (!googleProvider) {
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
  }
  
  return googleProvider;
};

// Export the instances and helper functions
export { app, auth, db };