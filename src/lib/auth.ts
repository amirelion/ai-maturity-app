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
    
    const googleProvider = getGoogleProvider();
    
    if (!auth) {
      throw new Error('Firebase auth is not initialized');
    }
    
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
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
