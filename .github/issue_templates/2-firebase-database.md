# Add Firebase Database Storage for Assessments

## Description
Implement Firebase Firestore database storage to persist assessment data and conversations per user.

## Requirements
- Configure Firestore database with proper security rules
- Store user responses in Firestore
- Store conversation history in Firestore
- Store assessment results in Firestore
- Link assessments to user accounts
- Update useAssessment hook to use Firestore instead of localStorage

## Implementation Details
- Define Firestore database structure
- Create data models for assessments, conversations, and user profiles
- Implement CRUD operations for assessments
- Add migration utility to move localStorage data to Firestore for returning users
- Update relevant hooks and components to use Firestore

## Acceptance Criteria
- Assessment data is saved to Firestore in real-time during the assessment
- Assessment results are stored permanently in Firestore
- User can access saved assessments when they log back in
- Multiple assessments per user are supported
- Data persistence works across different devices
- Secure database rules to prevent unauthorized access
