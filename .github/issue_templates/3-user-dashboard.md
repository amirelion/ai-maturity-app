# Create User Dashboard for Past Assessments

## Description
Implement a dashboard page for users to view and manage their past AI maturity assessments.

## Requirements
- Create a dashboard UI with a list of all user assessments
- Allow users to view, delete, and resume assessments
- Display assessment status (complete/incomplete)
- Show assessment dates and scores
- Add pagination for users with many assessments
- Include search/filter functionality

## Implementation Details
- Create src/app/dashboard/page.tsx
- Implement useAssessmentHistory hook
- Create AssessmentCard component
- Add resume functionality for incomplete assessments
- Implement assessment deletion with confirmation
- Add sorting options (by date, score, etc.)

## Acceptance Criteria
- Dashboard displays all user assessments in a clear, organized manner
- Users can view full results of past assessments
- Users can delete assessments they no longer need
- Users can resume incomplete assessments from where they left off
- Dashboard is responsive and works on mobile devices
- Loading states are handled appropriately
