import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  User
} from 'firebase/auth';
import { auth } from './firebase';
import { getGoogleProvider } from './firebase';

// Register a new user
export async function registerUser(email: string, password: string, displayName?: string) {
  try {
    if (!auth) {
      throw new Error('Firebase auth is not initialized');
    }
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Update profile if displayName is provided
    if (displayName && userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
    }
    return userCredential.user;
  } catch (error: any) {
    console.error('Error registering user:', error);
    throw new Error(error.message || 'An error occurred during registration');
  }
}

// Sign in existing user
export async function signIn(email: string, password: string) {
  try {
    if (!auth) {
      throw new Error('Firebase auth is not initialized');
    }
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error('Error signing in:', error);
    throw new Error(error.message || 'An error occurred during sign in');
  }
}

// Sign in with Google
export async function signInWithGoogle() {
  try {
    if (typeof window === 'undefined') {
      throw new Error('Google sign-in is only available in browser environments');
    }
    
    // Add detailed debugging information
    console.log('Attempting Google sign-in');
    console.log('Current location:', window.location.toString());
    
    // Get the Firebase auth instance first
    if (!auth) {
      console.error('Firebase auth is null during Google sign-in');
      throw new Error('Firebase auth is not initialized');
    }
    
    // Only get the Google provider after confirming auth is initialized
    const googleProvider = getGoogleProvider();
    console.log('Google provider created successfully');
    
    // Log auth settings for debugging
    console.log('Auth settings:', {
      authDomain: auth.app.options.authDomain,
      currentUrl: window.location.origin,
      providerId: googleProvider.providerId
    });
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Google sign-in successful');
      return result.user;
    } catch (error) {
      console.error('Error in signInWithPopup:', error);
      throw error;
    }
  } catch (error: any) {
    console.error('Error signing in with Google:', error);
    throw new Error(error.message || 'An error occurred during Google sign in');
  }
}

// Sign out user
export async function signOut() {
  try {
    if (!auth) {
      throw new Error('Firebase auth is not initialized');
    }
    
    await firebaseSignOut(auth);
    return true;
  } catch (error: any) {
    console.error('Error signing out:', error);
    throw new Error(error.message || 'An error occurred during sign out');
  }
}

// Password reset
export async function resetPassword(email: string) {
  try {
    if (!auth) {
      throw new Error('Firebase auth is not initialized');
    }
    
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error: any) {
    console.error('Error resetting password:', error);
    throw new Error(error.message || 'An error occurred during password reset');
  }
}
