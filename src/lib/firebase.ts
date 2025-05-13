// This is a mock implementation for the demo
// In a production app, this would be real Firebase initialization

// Create mock Firebase objects that won't cause errors during build
const mockFirebase = {
  app: {},
  auth: {
    onAuthStateChanged: () => () => {},
    signInWithPopup: async () => ({ user: { uid: 'mock-uid', email: 'mock@example.com' } }),
    signOut: async () => {},
  },
  db: {
    // Empty mock implementation
  }
};

// Check if we're in a browser environment and have real Firebase credentials
const hasFirebaseConfig = typeof window !== 'undefined' && 
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'YOUR_API_KEY';

// Only try to initialize Firebase if we have real credentials
let app, auth, db;

if (hasFirebaseConfig) {
  try {
    // Dynamically import Firebase only if needed
    const { initializeApp } = require('firebase/app');
    const { getAuth } = require('firebase/auth');
    const { getFirestore } = require('firebase/firestore');
    
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
    };
    
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.error('Firebase initialization error:', error);
    // Fall back to mock implementation
    app = mockFirebase.app;
    auth = mockFirebase.auth;
    db = mockFirebase.db;
  }
} else {
  // Use mock implementation
  app = mockFirebase.app;
  auth = mockFirebase.auth;
  db = mockFirebase.db;
}

export { app, auth, db };