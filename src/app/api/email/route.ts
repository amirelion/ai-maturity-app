import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

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
    
    // For demo purposes, we'll just log the data
    // In a production implementation, this would store in Firestore and send an email
    console.log('Demo mode: Would save assessment for', email);
    
    // Save the data only if we have a real db connection with Firestore collection method
    if (db && typeof db.collection === 'function') {
      try {
        const { collection, addDoc, serverTimestamp } = require('firebase/firestore');
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