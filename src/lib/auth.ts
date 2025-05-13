import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  User
} from 'firebase/auth';
import { auth } from './firebase';

// Register a new user
export async function registerUser(email: string, password: string, displayName?: string) {
  try {
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
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error('Error signing in:', error);
    throw new Error(error.message || 'An error occurred during sign in');
  }
}

// Sign out user
export async function signOut() {
  try {
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
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error: any) {
    console.error('Error resetting password:', error);
    throw new Error(error.message || 'An error occurred during password reset');
  }
}
