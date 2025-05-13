# Firebase Configuration Guide

This guide provides detailed instructions for configuring Firebase for the AI Maturity Assessment application. While the current version doesn't fully utilize Firebase, this setup will be required for upcoming features including user authentication and database storage.

## Setting Up Firebase Project

### 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter a project name (e.g., "AI Maturity Assessment")
4. Choose whether to enable Google Analytics (recommended)
5. Configure Google Analytics settings if enabled
6. Click "Create project"

### 2. Register Your Web Application

1. On the project overview page, click the web icon (</>) to add a web app
2. Register your app with a nickname (e.g., "AI Maturity Web App")
3. Optionally set up Firebase Hosting
4. Click "Register app"
5. You'll see a configuration object that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id",
  measurementId: "your-measurement-id"
};
```

6. Copy these values to your `.env.local` file:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

## Setting Up Firebase Authentication

### 1. Enable Authentication Methods

1. In the Firebase Console, navigate to "Authentication" from the left sidebar
2. Click the "Get started" button if this is your first time
3. Select "Email/Password" from the Sign-in method tab
4. Enable "Email/Password" and save
5. Optionally, enable other authentication methods like Google, GitHub, etc.

### 2. Configure Authentication Rules

1. Go to the "Rules" tab in Authentication
2. Set up authentication rules according to your requirements
3. Basic rules are pre-configured, but you may need to adjust them based on your specific needs

## Setting Up Firestore Database

### 1. Create a Firestore Database

1. In the Firebase Console, navigate to "Firestore Database" from the left sidebar
2. Click "Create database"
3. Choose "Start in production mode" or "Start in test mode" (use test mode for development)
4. Select a database location closest to your users
5. Click "Enable"

### 2. Define Security Rules

For development, you can use test mode rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

For production, implement more restrictive rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and update their own data
    match /users/{userId} {
      allow read, update, delete: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null;
    }
    
    // Users can read, create and update their own assessments
    match /assessments/{assessmentId} {
      allow read, update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### 3. Create Initial Indexes

For the planned queries, you'll need to create the following indexes:

1. Go to "Indexes" tab in Firestore
2. Click "Add index"
3. Create these composite indexes:

| Collection | Fields indexed | Query scope | 
|------------|---------------|-------------|
| assessments | userId Ascending, createdAt Descending | Collection |
| assessments | userId Ascending, status Ascending | Collection |
| assessments | userInfo.industry Ascending, status Ascending | Collection |

## Firebase Admin Setup (for Server-Side Operations)

### 1. Generate a Private Key

1. In the Firebase Console, navigate to Project Settings
2. Go to the "Service accounts" tab
3. Click "Generate new private key"
4. Save the JSON file securely

### 2. Configure Server Environment

For server-side operations, you'll need to set up environment variables with these credentials. **Never commit these to your repository.**

1. Extract the necessary values from the JSON file
2. Add them to your server environment variables or a secure `.env` file:

```
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_PRIVATE_KEY="your-private-key"
FIREBASE_ADMIN_CLIENT_EMAIL=your-client-email
```

## Database Schema

The application will use the following Firestore schema:

### Users Collection

```
/users/{userId}/
  name: string
  email: string
  role: string
  industry: string
  orgSize: string
  createdAt: timestamp
  lastLoginAt: timestamp
```

### Assessments Collection

```
/assessments/{assessmentId}/
  userId: string
  userInfo: {
    name: string
    role: string
    industry: string
    orgSize: string
    email: string
  }
  responses: [
    {
      questionId: string
      answer: string
      timestamp: number
    }
  ]
  conversation: [
    {
      role: string
      content: string
      timestamp: number
    }
  ]
  results: {
    productivity: {
      score: number
      level: number
      strengths: string[]
      opportunities: string[]
    }
    valueCreation: {
      score: number
      level: number
      strengths: string[]
      opportunities: string[]
    }
    businessModel: {
      score: number
      level: number
      strengths: string[]
      opportunities: string[]
    }
    overall: {
      score: number
      level: number
    }
  }
  createdAt: timestamp
  completedAt: timestamp (optional)
  status: 'in-progress' | 'completed'
  sharedWith: string[] (optional)
```

## Testing Firebase Integration

After setting up Firebase, you can test the integration:

1. Implement the basic authentication flow
2. Test creating a user account
3. Test signing in with the created account
4. Test creating and retrieving assessment data

## Deployment Considerations

When deploying to production:

1. Ensure environment variables are correctly set in your hosting environment
2. Switch to production security rules
3. Set up proper Firebase Authentication settings for your production domain
4. Consider implementing Firebase Analytics for usage tracking

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Web SDK Documentation](https://firebase.google.com/docs/web/setup)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
