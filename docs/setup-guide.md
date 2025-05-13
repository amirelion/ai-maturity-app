# Setup Guide for AI Maturity App

This guide provides step-by-step instructions for setting up the AI Maturity Assessment application for development or production deployment.

## Prerequisites

Before you begin, ensure you have the following:

- **Node.js**: Version 18.x or higher
- **npm** or **yarn**: For package management
- **Git**: For version control
- **OpenAI API Key**: For AI functionality
- **Firebase Project** (optional for current version, required for future features)
- **Resend Account**: For email functionality

## Development Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/amirelion/ai-maturity-app.git
cd ai-maturity-app
```

### 2. Install Dependencies

Using npm:
```bash
npm install
```

Or using yarn:
```bash
yarn install
```

### 3. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and update the values with your API keys and configuration:
   ```
   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key
   OPENAI_ORGANIZATION=your_openai_org_id (optional)

   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id

   # Resend Email Service
   RESEND_API_KEY=your_resend_api_key
   EMAIL_FROM=your_verified_email@domain.com
   ```

### 4. Start the Development Server

```bash
npm run dev
# or
yarn dev
```

This will start the development server at [http://localhost:3000](http://localhost:3000).

## Setting Up External Services

### OpenAI Configuration

1. Create an account at [OpenAI Platform](https://platform.openai.com/)
2. Navigate to API Keys and create a new secret key
3. Copy the key to your `.env.local` file

The application uses the following OpenAI models:
- GPT-4 for analysis
- Whisper for speech-to-text
- TTS for text-to-speech

### Firebase Setup (for Future Use)

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Add a web app to your project
4. Copy the configuration details to your `.env.local` file
5. Enable Authentication and Firestore Database services

### Resend Email Service

1. Create an account at [Resend](https://resend.com/)
2. Add and verify a domain or use a personal email for testing
3. Create an API key
4. Copy the API key to your `.env.local` file

## Production Deployment

### Deploying to Vercel

The easiest way to deploy the application is with Vercel:

1. Push your code to a GitHub repository
2. Import the project in Vercel
3. Configure the environment variables
4. Deploy the application

### Manual Deployment

For manual deployment to other platforms:

1. Build the application:
   ```bash
   npm run build
   # or
   yarn build
   ```

2. Start the production server:
   ```bash
   npm run start
   # or
   yarn start
   ```

3. Configure your server to expose port 3000 (or set the `PORT` environment variable)

## Customization Options

### Maturity Framework

You can customize the maturity framework by modifying `src/config/ai-config.ts`:

- Adjust level names and descriptions
- Modify score ranges for each level
- Change dimension weightings

### Assessment Questions

To modify the assessment questions, edit `src/lib/questions.ts`:

- Add or remove questions
- Change question text
- Adjust value area assignments

### Visual Customization

To customize the visual appearance:

1. Modify Tailwind theme in `tailwind.config.js`
2. Update global styles in `src/styles/globals.css`
3. Modify component styles in their respective files

## Troubleshooting

### OpenAI API Issues

- **Rate Limiting**: If you encounter rate limit errors, implement request throttling or increase your OpenAI plan limits
- **Timeout Errors**: Increase timeout settings in API routes

### Firebase Configuration

- **Initialization Errors**: Verify all Firebase environment variables are set correctly
- **Permission Errors**: Check Firebase security rules configuration

### Email Delivery Problems

- **Sending Failures**: Verify Resend API key and sender email verification status
- **Template Issues**: Test email templates with the Resend testing tools

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Resend Documentation](https://resend.com/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
