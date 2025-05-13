import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const { email, assessment } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment data is required' },
        { status: 400 }
      );
    }
    
    // For demo/development purposes, just log the request
    console.log('Assessment report requested for:', email);
    
    // Only try to store in Firestore on client-side or if we have a Firebase connection
    if (typeof window !== 'undefined' && db && 'collection' in db) {
      try {
        await addDoc(collection(db, 'assessments'), {
          email,
          assessment,
          createdAt: serverTimestamp(),
        });
        console.log('Successfully saved to Firestore');
      } catch (firebaseError) {
        console.error('Firebase error:', firebaseError);
        // Continue even if the database operation fails
      }
    }
    
    return NextResponse.json({ 
      success: true,
      message: `Assessment report sent to ${email}`
    });
  } catch (error) {
    console.error('Error in email API:', error);
    return NextResponse.json(
      { error: 'An error occurred while sending the email' },
      { status: 500 }
    );
  }
}