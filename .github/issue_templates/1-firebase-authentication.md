# Implement Firebase Authentication

## Description
Add user authentication to the AI maturity app so users can access their assessment results after leaving the site.

## Requirements
- Implement Firebase Auth integration
- Create login/signup forms
- Add auth context for state management
- Implement protected routes
- Add user profile page
- Add authentication flow after completing first assessment
- Add password reset functionality

## Implementation Details
- Create src/lib/auth.ts with authentication functions
- Create src/contexts/AuthContext.tsx
- Create auth-related components (LoginForm, SignupForm, etc.)
- Implement AuthGuard component for protected routes
- Update useAssessment hook to handle authenticated users

## Acceptance Criteria
- Users can sign up with email and password
- Users can log in with their credentials
- Users can recover forgotten passwords
- Authenticated users can access their past assessments
- Authentication state persists across page refreshes
- Unauthenticated users are redirected to login when accessing protected pages
