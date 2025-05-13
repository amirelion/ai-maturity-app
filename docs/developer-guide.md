# AI Maturity App - Developer Documentation

This document provides technical details about the AI Maturity Assessment application for developers working on the project.

## Architecture Overview

The application follows a modern React architecture using Next.js with the App Router pattern. It utilizes a "client-heavy" approach where most of the logic happens in the browser, with API endpoints for AI processing and external service integration.

### Key Components

1. **Assessment Engine**: Manages the assessment flow, question sequencing, and state management
2. **Conversation Handler**: Processes user inputs and manages the chat-like interface
3. **AI Integration**: Connects with OpenAI APIs for response analysis and speech processing
4. **Visualization Components**: Renders assessment results and maturity charts
5. **Storage Layer**: Currently uses localStorage, with Firebase integration prepared for future implementation

## Core Files and Their Purpose

### Hooks

- `useAssessment.ts`: Core assessment logic and state management
- `useSpeechRecognition.ts`: Handles voice input functionality

### API Routes

- `/api/assessment/analyze`: Processes assessment responses to generate maturity scores
- `/api/openai/chat`: Handles conversation with OpenAI for follow-up questions
- `/api/openai/speech`: Generates speech from text for voice responses
- `/api/openai/transcribe`: Transcribes voice input to text
- `/api/email`: Sends assessment reports via email

### Pages

- `/app/page.tsx`: Homepage with introduction and start assessment button
- `/app/assessment/page.tsx`: Main assessment information collection page
- `/app/assessment/conversation/page.tsx`: Conversational assessment interface
- `/app/assessment/results/page.tsx`: Assessment results and visualization

### Components

- `MaturityChart.tsx`: Radar chart for visualizing maturity dimensions
- `VoiceRecorder.tsx`: Component for recording and processing voice input

### Configuration

- `ai-config.ts`: Contains configuration for AI interactions and the maturity framework

### Types

- `assessment.ts`: TypeScript interfaces for assessment data structures

## Data Flow

1. **User Input Processing**:
   ```
   User Input → (optional speech recognition) → useAssessment hook → OpenAI API → Update state
   ```

2. **Assessment Generation**:
   ```
   Responses → /api/assessment/analyze → OpenAI processing → Assessment result → Update state
   ```

3. **Results Visualization**:
   ```
   Assessment data → Results page → MaturityChart → Visual representation
   ```

## Firebase Integration (Future Implementation)

The application is prepared for Firebase integration with the following components:

- `firebase.ts`: Client-side Firebase initialization
- `firebase-admin.ts`: Server-side Firebase Admin SDK initialization

When implemented, the following data structure will be used:

```
/users/{userId}/
  profile: {
    name, email, role, etc.
  }
  
/assessments/{assessmentId}/
  userId: string,
  userInfo: {...},
  responses: [...],
  conversation: [...],
  results: {...},
  createdAt: timestamp,
  status: 'in-progress' | 'completed'
```

## OpenAI Integration

The application uses several OpenAI models:

1. **GPT-4**: For analyzing responses and generating personalized insights
2. **Whisper**: For transcribing voice input to text
3. **TTS**: For generating voice responses

The integration is managed through API routes with appropriate prompting to ensure consistent analysis.

## Assessment Framework

The maturity model is defined with four levels across three dimensions:

1. **Dimensions**:
   - Productivity Enhancement: How AI improves internal efficiency
   - Value Creation: How AI enhances products/services
   - Business Model Innovation: How AI transforms the business model

2. **Maturity Levels**:
   - Level 1 (Exploring): 1.0-1.5
   - Level 2 (Experimenting): 1.6-2.5
   - Level 3 (Implementing): 2.6-3.5
   - Level 4 (Transforming): 3.6-4.0

## Development Guidelines

### Adding New Questions

1. Update the question bank in `src/lib/questions.ts`
2. Ensure each question has a unique ID and is assigned to the correct value area
3. Update the maximum threshold in useAssessment if necessary

### Modifying the Maturity Framework

1. Update the framework definition in `src/config/ai-config.ts`
2. Ensure the analysis prompt in `/api/assessment/analyze/route.ts` reflects these changes
3. Update visualization components if level ranges change

### Adding New Features

Follow these patterns when extending the application:

1. **New API endpoints**: Add to the appropriate folder under `src/app/api/`
2. **New UI components**: Create in `src/components/` with proper TypeScript typing
3. **New hooks**: Add to `src/hooks/` with comprehensive documentation
4. **New pages**: Create in the appropriate folder under `src/app/`

## Testing

Currently, the application uses manual testing. Future implementations should include:

1. **Unit Tests**: For hooks and utility functions
2. **Integration Tests**: For API endpoints
3. **E2E Tests**: For complete user flows

## Deployment

The application is configured for deployment on Vercel with the following environment variables:

- `OPENAI_API_KEY`: For OpenAI integration
- `RESEND_API_KEY`: For email functionality
- `FIREBASE_*`: For future Firebase integration

## Common Issues and Solutions

### OpenAI Rate Limiting

If you encounter rate limit issues with OpenAI:
- Implement request batching
- Add retry logic with exponential backoff
- Consider caching common responses

### Voice Recognition Browser Compatibility

Voice recognition may not work in all browsers:
- Ensure fallback to text input
- Test thoroughly in Chrome, Safari, and Firefox
- Add browser compatibility checks

### LocalStorage Limitations

Current storage using localStorage has limitations:
- Maximum 5MB storage (may be an issue for long assessments)
- Not shared across devices
- Cleared when browser cache is cleared

This will be resolved with the Firebase implementation.

## Contributing

When contributing to this project:

1. Follow the existing code style and patterns
2. Document all new functions, components, and hooks
3. Ensure TypeScript typing is comprehensive
4. Test across different browsers and devices
5. Update documentation when making significant changes
