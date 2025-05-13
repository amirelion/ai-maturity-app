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
    
    // Store the email and assessment in Firestore
    // In a real implementation, this would also trigger an email sending service
    try {
      await addDoc(collection(db, 'assessments'), {
        email,
        assessment,
        createdAt: serverTimestamp(),
      });
    } catch (firebaseError) {
      console.error('Firebase error:', firebaseError);
      // Continue even if the database operation fails
    }
    
    // For demo purposes, we'll just pretend we sent the email
    
    return NextResponse.json({ 
      success: true,
      message: `Assessment report sent to ${email} (simulated)`
    });
  } catch (error) {
    console.error('Error in email API:', error);
    return NextResponse.json(
      { error: 'An error occurred while sending the email' },
      { status: 500 }
    );
  }
}