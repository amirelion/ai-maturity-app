# AI Maturity Assessment Documentation

Welcome to the documentation for the AI Maturity Assessment application. This index will help you navigate the various documentation resources available for this project.

## Documentation Overview

| Document | Description |
|----------|-------------|
| [README.md](../README.md) | Project overview, features, and basic setup instructions |
| [CONTRIBUTING.md](../CONTRIBUTING.md) | Guidelines for contributing to the project |
| [User Guide](user-guide.md) | Instructions for end users on how to use the application |
| [Developer Guide](developer-guide.md) | Technical documentation for developers working on the project |
| [Setup Guide](setup-guide.md) | Detailed setup instructions for development and deployment |
| [Firebase Configuration](firebase-config.md) | Guide for setting up Firebase for authentication and database |
| [Authentication & Firebase Integration](auth-firebase-guide.md) | Detailed documentation on the implemented authentication and Firebase database integration |
| [Deployment Guide](deployment-guide.md) | Comprehensive instructions for deploying to various environments |

## Quick Links

- [Project Repository](https://github.com/amirelion/ai-maturity-app)
- [Issue Tracker](https://github.com/amirelion/ai-maturity-app/issues)

## Project Overview

The AI Maturity Assessment is an application designed to help organizations evaluate their AI maturity across three key dimensions:

1. **Productivity Enhancement**: How AI improves internal efficiency
2. **Value Creation**: How AI enhances products/services
3. **Business Model Innovation**: How AI transforms the business model

The application provides a conversational assessment experience with AI-driven analysis and personalized recommendations.

## Architecture Overview

The application is built with:

- **Frontend**: React, Next.js, TypeScript, Tailwind CSS
- **AI Integration**: OpenAI API (GPT-4, Whisper, TTS)
- **Backend**: Next.js API Routes
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore with localStorage fallback
- **Email**: Resend API

## Key Features

- **Conversational Assessment**: Engaging chat-like interface for answering questions
- **Voice Input**: Support for voice responses using browser APIs
- **AI Analysis**: Advanced analysis of responses to determine maturity level
- **Visual Results**: Clear visualization of maturity scores
- **User Authentication**: Secure login and account management
- **Assessment Storage**: Save and resume assessments across sessions and devices
- **Dashboard**: View and manage past assessments

## Future Development

The roadmap for this project includes:

- Comparative analytics against industry benchmarks
- Custom maturity roadmap generation
- PDF export functionality
- Team collaboration features
- Progress tracking for reassessments

## Contributing

Please refer to the [CONTRIBUTING.md](../CONTRIBUTING.md) file and [Developer Guide](developer-guide.md) for information on contributing to this project, including coding standards and development workflow.

## Deployment

Deployment instructions are available in the [Deployment Guide](deployment-guide.md), with specific information for deploying to Vercel and other hosting platforms.

## Support

For support with this application, please open an issue in the [Issue Tracker](https://github.com/amirelion/ai-maturity-app/issues) or contact the project maintainers directly.
