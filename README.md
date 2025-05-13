# AI Maturity Assessment Application

This application helps organizations evaluate their AI maturity across three key dimensions: Productivity Enhancement, Value Creation, and Business Model Innovation. It provides a conversational assessment experience with AI-driven analysis and personalized recommendations.

## 🚀 Features

- Interactive conversational assessment
- Voice input capability for natural responses
- Real-time AI analysis of responses
- Comprehensive maturity scoring across three dimensions
- Visual representation of maturity levels
- Personalized strengths and opportunities identification
- Email delivery of detailed assessment results

## 📋 Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Features and Usage](#features-and-usage)
  - [Assessment Flow](#assessment-flow)
  - [Maturity Framework](#maturity-framework)
  - [Results and Recommendations](#results-and-recommendations)
- [Technology Stack](#technology-stack)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

## 🏁 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- OpenAI API key
- Firebase project (optional for current version, will be required for upcoming features)
- Resend account for email functionality

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/amirelion/ai-maturity-app.git
   cd ai-maturity-app
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables (see next section)

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_ORGANIZATION=your_openai_org_id (optional)

# Firebase Configuration (prepared for future use)
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

## 🏗️ Project Structure

```
ai-maturity-app/
├── public/             # Static files
├── src/
│   ├── app/            # Next.js app router pages
│   │   ├── api/        # API routes
│   │   ├── assessment/ # Assessment pages
│   │   └── page.tsx    # Homepage
│   ├── components/     # React components
│   │   ├── assessment/ # Assessment-specific components
│   │   └── ui/         # Reusable UI components
│   ├── config/         # Application configuration
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility libraries
│   ├── styles/         # Global styles
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Helper functions
├── .env.example        # Example environment variables
├── .env.local          # Local environment variables (gitignored)
├── next.config.js      # Next.js configuration
├── package.json        # Project dependencies
├── postcss.config.js   # PostCSS configuration
├── tailwind.config.js  # Tailwind CSS configuration
└── tsconfig.json       # TypeScript configuration
```

## 💡 Features and Usage

### Assessment Flow

1. **User Information**: The assessment begins by collecting basic information about the user and their organization.

2. **Conversational Assessment**: The application conducts a conversational assessment, asking questions across three key dimensions:
   - Productivity Enhancement
   - Value Creation
   - Business Model Innovation

3. **Voice Input Option**: Users can choose to respond using voice input for a more natural conversational experience.

4. **AI Analysis**: Responses are analyzed in real-time by AI to understand the organization's maturity level.

5. **Results Generation**: After completing the assessment, the application generates a comprehensive maturity report.

### Maturity Framework

The assessment uses a four-level maturity framework:

1. **Exploring** (Level 1): Initial awareness and exploration of AI capabilities.
2. **Experimenting** (Level 2): Active experimentation with AI solutions in limited contexts.
3. **Implementing** (Level 3): Systematic implementation of AI across multiple business areas.
4. **Transforming** (Level 4): AI as a core element of business strategy and operations.

Each dimension (Productivity, Value Creation, Business Model) is scored separately, with an overall maturity score calculated as a weighted average.

### Results and Recommendations

The assessment provides:

- Overall maturity score and level
- Dimension-specific scores and levels
- Key strengths identified across dimensions
- Growth opportunities and recommended next steps
- Option to receive a detailed report via email

## 🔧 Technology Stack

- **Frontend**: React, Next.js, TypeScript, Tailwind CSS
- **AI Integration**: OpenAI API (GPT-4 for analysis, Whisper for voice transcription)
- **Backend**: Next.js API Routes
- **Authentication**: Firebase Auth (prepared for future implementation)
- **Database**: Firebase Firestore (prepared for future implementation)
- **Email**: Resend API

## 🛣️ Roadmap

Future enhancements planned for this application:

- User authentication with Firebase
- Storing assessment history in Firestore database
- Comparative analytics against industry benchmarks
- Custom maturity roadmap with actionable recommendations
- PDF export functionality
- Team collaboration features
- Progress tracking for reassessments

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary and confidential.
