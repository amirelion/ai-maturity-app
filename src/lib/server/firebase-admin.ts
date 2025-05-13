// This is a server-side only file that creates a firestore admin client
import { collection, getDocs, DocumentData } from 'firebase/firestore';
import { db } from '../firebase';

// Mock functions for server-side to prevent errors during build
export async function getAssessments(): Promise<DocumentData[]> {
  // Server-side Firestore operations are not performed during build
  if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
    return [];
  }
  
  try {
    if (!db || !('collection' in db)) {
      console.warn('Firestore not initialized');
      return [];
    }
    
    const assessmentsCollection = collection(db, 'assessments');
    const snapshot = await getDocs(assessmentsCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching assessments:', error);
    return [];
  }
}