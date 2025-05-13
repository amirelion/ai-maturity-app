# Authentication and Firebase Integration Documentation

This document provides technical details about the implementation of user authentication and Firebase integration in the AI Maturity Assessment application. It is intended for developers working on the project.

## Table of Contents

1. [Authentication System](#authentication-system)
2. [Firebase Database Integration](#firebase-database-integration)
3. [User Flow](#user-flow)
4. [Data Structure](#data-structure)
5. [Key Components](#key-components)
6. [Security Considerations](#security-considerations)
7. [Future Enhancements](#future-enhancements)

## Authentication System

### Overview

The application uses Firebase Authentication for user management. The implementation follows a context-based approach, where authentication state is maintained application-wide through React Context API.

### Key Files

- `src/lib/auth.ts`: Core authentication functions
- `src/contexts/AuthContext.tsx`: React context for authentication state
- `src/components/auth/`: Authentication UI components
- `src/app/login/page.tsx`: Login page
- `src/app/profile/page.tsx`: User profile management

### Authentication Flow

1. **Registration**: Users can sign up with email and password.
   - Validation ensures password strength and confirmation match
   - Optional display name can be provided
   - User record is created in both Firebase Auth and Firestore

2. **Login**: Users can log in with email and password.
   - Credentials are verified against Firebase Auth
   - Session state is maintained across the application
   - User data is loaded from Firestore

3. **Password Recovery**: Users can request password reset links.
   - Firebase Auth sends reset emails
   - The process is handled securely via email

4. **Session Management**: User sessions persist using Firebase Auth's built-in capabilities.
   - `onAuthStateChanged` listener monitors session state
   - Token refresh happens automatically
   - Session is synced across tabs

### Protected Routes

The `ProtectedRoute` component (`src/components/auth/ProtectedRoute.tsx`) provides route protection for authenticated-only pages:

```typescript
// Wrapped around components that require authentication
<ProtectedRoute>
  <DashboardPage />
</ProtectedRoute>
```

When a user is not authenticated, they are redirected to the login page.

## Firebase Database Integration

### Overview

The application uses Firebase Firestore for storing assessment data. The integration allows for real-time updates, cross-device access, and data persistence.

### Key Files

- `src/lib/firebase.ts`: Firebase initialization
- `src/hooks/useAssessment.ts`: Main hook for assessment functionality with Firebase integration
- `src/app/dashboard/page.tsx`: Dashboard showing user's stored assessments

### Data Persistence Strategy

The application implements a hybrid approach to data persistence:

1. **Authenticated Users**:
   - All data is saved to Firestore
   - Assessment progress is saved in real-time
   - Completed assessments are permanently stored
   - User can access assessments across devices

2. **Unauthenticated Users**:
   - Data is saved to localStorage
   - Assessment progress is saved locally
   - Completed assessments remain in localStorage
   - User can be prompted to create an account to persist data

3. **Transition Handling**:
   - If a user logs in after starting an assessment, data is migrated from localStorage to Firestore
   - If a user's connection to Firebase fails, the system falls back to localStorage

## User Flow

### New User Flow

1. User starts an assessment (unauthenticated)
2. After completing the assessment, user is prompted to create an account
3. If user creates an account, the completed assessment is saved to their profile
4. User can view results and access them later via dashboard

### Returning User Flow

1. User logs in to their account
2. User can view past assessments on dashboard
3. User can start a new assessment or continue an in-progress one
4. Assessment data is automatically saved to their account

## Data Structure

### Firestore Collections

#### Users Collection

```
/users/{userId}/
  email: string
  name: string
  role: string (optional)
  industry: string (optional)
  orgSize: string (optional)
  createdAt: timestamp
  lastLoginAt: timestamp
```

#### Assessments Collection

```
/assessments/{assessmentId}/
  userId: string
  status: 'in-progress' | 'completed'
  createdAt: timestamp
  lastUpdatedAt: timestamp (optional)
  completedAt: timestamp (optional)
  
  // User information
  userInfo: {
    name: string
    role: string
    industry: string
    orgSize: string
    email: string
  }
  
  // Assessment data
  responses: [
    {
      questionId: string
      answer: string
      timestamp: number
    }
  ]
  
  // Conversation history
  conversation: [
    {
      role: 'user' | 'assistant'
      content: string
    }
  ]
  
  // Assessment state
  currentQuestionIndex: number
  currentContext: string
  
  // Results (when completed)
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
```

## Key Components

### Authentication Components

- **AuthProvider**: Provides authentication context and state management
- **AuthModal**: Modal dialog for authentication forms
- **LoginForm**: Form for user login
- **SignupForm**: Form for user registration
- **Navbar**: Navigation bar with authentication state handling
- **ProtectedRoute**: Route guard for authenticated pages

### Firebase Integration Components

- **useAssessment Hook**: Enhanced to support Firebase storage
- **Dashboard Page**: Displays user's assessments from Firestore
- **Profile Page**: Allows users to manage their profile information

## Usage Examples

### Authentication

```typescript
// Using authentication in a component
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { currentUser, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!currentUser) {
    return <p>Please log in to access this feature.</p>;
  }
  
  return (
    <div>
      <h1>Welcome, {currentUser.displayName || 'User'}</h1>
      {/* Component content */}
    </div>
  );
}
```

### Firestore Operations

```typescript
// Accessing Firestore in a component
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';

async function fetchUserAssessments() {
  const { currentUser } = useAuth();
  
  if (!currentUser) return [];
  
  const assessmentsRef = collection(db, 'assessments');
  const q = query(
    assessmentsRef,
    where('userId', '==', currentUser.uid),
    where('status', '==', 'completed')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}
```

## Security Considerations

### Firestore Security Rules

Implement these security rules in your Firebase console to ensure proper data access control:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and update their own user document
    match /users/{userId} {
      allow read, update, delete: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can only access their own assessments
    match /assessments/{assessmentId} {
      allow read, update, delete: if request.auth != null && 
                                   request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
  }
}
```

### Authentication Best Practices

- Enforce strong password requirements
- Implement rate limiting for login attempts
- Validate user inputs for security concerns
- Use HTTPS for all API requests

## Future Enhancements

1. **Social Authentication**: Add support for Google, GitHub, etc. logins
2. **Team Access**: Allow sharing assessments with team members
3. **Role-Based Access**: Implement different access levels (admin, manager, etc.)
4. **Enhanced Security**: Add two-factor authentication
5. **Offline Support**: Implement better offline functionality with data syncing

## Troubleshooting

### Common Issues

1. **Firebase Connection Issues**:
   - Check network connectivity
   - Verify Firebase configuration in `.env.local`
   - Ensure Firebase project services are enabled

2. **Authentication Errors**:
   - Invalid credentials: Check user input
   - Account not found: User may need to register
   - Password reset issues: Check email delivery

3. **Data Synchronization Issues**:
   - Check for Firebase quota limits
   - Verify security rules are correctly configured
   - Check for network connectivity issues

### Debugging Tools

- Use Firebase Console to inspect authentication state and database records
- Use browser developer tools to inspect localStorage and Firebase auth tokens
- Enable Firebase debug mode for detailed logging
