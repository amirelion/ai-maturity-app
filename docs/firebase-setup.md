# Firebase Configuration Guide

This guide will help you properly set up Firebase for the AI Maturity Assessment application.

## Prerequisites

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password and Google sign-in methods
3. Create a Firestore database in your Firebase project

## Setting up Environment Variables

1. Copy the `.env.example` file to `.env.local`
2. Fill in the Firebase configuration values from your Firebase project:

```
# Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain_here
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket_here
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id_here
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id_here
```

You can find these values in your Firebase project settings under "Your apps" > "SDK setup and configuration".

## Setting up Authentication

1. Go to Firebase Console > Authentication > Sign-in method
2. Enable Email/Password provider
3. Enable Google provider
   - Configure Google Sign-in:
     - Add your domain to the authorized domains list
     - Configure OAuth consent screen if required

## Setting up Firestore

1. Go to Firebase Console > Firestore Database
2. Create a new database if you haven't already
3. Start in production mode or test mode (switch to production mode later)
4. Set up the following security rules for your database:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow users to read/write their own assessments
    match /assessments/{assessmentId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
  }
}
```

## Verifying Configuration

After setting up Firebase, restart your development server and verify that:

1. You can sign up with email/password
2. You can sign in with Google
3. You can see assessments in the dashboard

## Common Issues

1. **"Service firestore is not available" error**: 
   - Make sure you've properly set all Firebase environment variables
   - Verify that Firestore is enabled in your Firebase project

2. **"Expected first argument to collection() to be a CollectionReference" error**:
   - This indicates Firebase initialization issues
   - Check that your Firebase configuration is correct
   - Ensure Firestore is properly initialized

3. **Google Authentication not working**:
   - Verify your domain is added to authorized domains in Firebase console
   - Make sure the Google provider is enabled in Firebase Authentication
   - Check browser console for any CORS or OAuth errors

## Local Development

For local development, make sure:

1. Your `.env.local` file contains all the required Firebase configuration values
2. You're running the latest version of the application code
3. Firebase is properly initialized before being used in your components
