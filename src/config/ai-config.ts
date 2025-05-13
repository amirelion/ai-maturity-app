/**
 * AI Maturity Navigator Configuration
 * 
 * This file contains all configurable aspects of the AI system:
 * - Model selections
 * - Temperature settings
 * - Prompt templates
 */

// OpenAI API Configuration
export const openaiConfig = {
  // Model used for conversation interactions
  conversationModel: {
    modelId: "gpt-4o",
    temperature: 0.5, // Reduced from 0.7 for more focused responses
    maxTokens: 300,   // Reduced to encourage brevity
  },
  
  // Model used for analyzing assessment results
  analysisModel: {
    modelId: "gpt-4o",
    temperature: 0.3,
    maxTokens: 1000,
  },
  
  // Text-to-speech configuration
  speechModel: {
    modelId: "tts-1",
    voice: "alloy",
  }
};

// System Prompts
export const systemPrompts = {
  // Introduction and general conversation guidance
  conversationIntro: `You are conducting a focused AI maturity assessment. Your goal is to gather information efficiently about the organization's AI maturity across three dimensions: productivity enhancement, product/service innovation, and business model disruption.

Keep your responses brief and direct. Focus on asking questions rather than providing commentary or advice. Acknowledge responses with minimal phrasing, then proceed to the next relevant question.

Do not suggest strategies, offer recommendations, or teach about AI during the assessment phase. Your purpose is purely to collect data that will be analyzed later.`,

  // Specific instruction for the user information gathering phase
  userInfoGathering: `Collect basic information about the person and their organization. Ask about their name, role, industry, company size, and responsibilities. Use simple acknowledgments, then move on to the next question.

Your responses should be 2-3 sentences maximum. Strictly avoid giving advice or suggestions during this phase.`,

  // Specific instruction for the productivity value area
  productivityAssessment: `Focus on assessing the organization's use of AI for productivity enhancement. Ask about current AI tool adoption, comfort levels with prompting, leadership support, implementation challenges, and ROI measurement.

Keep responses under 3 sentences. Acknowledge their answer briefly, then ask the next question. Do not offer advice, recommendations, or elaborate on best practices during this phase.

You are collecting data for maturity assessment, not providing consultation.`,

  // Specific instruction for the value creation area
  valueCreationAssessment: `Focus on assessing how the organization uses AI to enhance products and services. Ask about AI features in offerings, customer response, competitive positioning, and data capabilities.

Maintain brief responses (2-3 sentences maximum). Acknowledge their answer with minimal commentary, then proceed to the next question. Avoid suggesting improvements or best practices - focus only on data collection.`,

  // Specific instruction for the business model area
  businessModelAssessment: `Focus on assessing if and how the organization is using AI to transform its business model. Ask about strategic vision, new revenue streams, value chain disruption, and ecosystem engagement.

Limit responses to 2-3 sentences. Your goal is to extract information efficiently without providing advice or consulting services. Simple acknowledgment of their answers is sufficient before moving to the next question.`,

  // Analysis instructions for generating the assessment
  analysisInstruction: `Analyze the conversation transcript to determine AI maturity levels across three dimensions:
1. Productivity Enhancement (personal and team efficiency)
2. Value Creation (products and services)
3. Business Model Innovation

For each area, identify:
- Current maturity level (1-4)
- Key strengths demonstrated
- Specific opportunities for growth
- Recommended next steps

Your analysis should be comprehensive and actionable, referencing specific responses from the conversation to justify your assessment.`,

  // Closing the conversation
  closingConversation: `Wrap up the conversation professionally but concisely:
1. Thank them for their time
2. Confirm you have the information needed
3. Let them know they'll receive a maturity assessment report
4. End the conversation

Keep your closing message under 3 sentences. Do not provide preliminary insights or advice.`,
};

// Questions Bank - Example questions for each area
export const questionsBank = {
  userInfo: [
    "Could you tell me your name and role in your organization?",
    "What industry does your organization operate in?",
    "Roughly how large is your organization?",
    "Are you primarily responsible for business decisions, technical implementations, or a mix of both?",
    "Where would you like me to send your personalized AI maturity report when we're done?"
  ],
  
  productivity: [
    "How would you describe your personal experience with AI tools so far?",
    "Which tasks in your typical workday could benefit most from AI assistance?",
    "Has your team adopted any AI tools for productivity? If yes, how widespread is the usage?",
    "What's your biggest challenge with improving productivity in your role or team?",
    "How comfortable are you with prompting AI systems?",
    "What's typically your first reaction when someone suggests using a new AI tool?"
  ],
  
  valueCreation: [
    "Has your organization integrated AI into any products or services? If so, how?",
    "What customer problems could AI help solve in your current offerings?",
    "How do you gather insights about enhancing customer experience with AI?",
    "How would you rate your competitors' AI integration compared to yours?",
    "What's the biggest barrier to implementing AI in your products or services?",
    "How do customers typically react to technology-driven changes in your offerings?"
  ],
  
  businessModel: [
    "How might AI change your industry's business models five years from now?",
    "Has your organization explored any new revenue streams enabled by AI?",
    "How often does leadership discuss AI as a strategic priority versus an operational tool?",
    "Which parts of your value chain are most ready for AI transformation?",
    "If you had unlimited resources, which AI-driven business transformation would you prioritize?",
    "Is your organization an early adopter, fast follower, or wait-and-see with emerging technologies?"
  ],
  
  closing: [
    "What's your biggest hope for how AI might benefit your organization?",
    "What's your biggest concern about adopting more AI in your business?",
    "Is there anything specific you'd like to see in your AI maturity report?"
  ]
};

// Maturity Framework Definition
export const maturityFramework = {
  levels: {
    exploring: {
      level: 1,
      range: { min: 1.0, max: 1.75 },
      name: "Exploring",
      description: "Basic awareness of AI potential with minimal implementation. Beginning to identify use cases and experiment with simple tools."
    },
    experimenting: {
      level: 2,
      range: { min: 1.76, max: 2.75 },
      name: "Experimenting",
      description: "Active pilots and limited use cases in place. Some successful implementations but lacking systematic approach."
    },
    implementing: {
      level: 3,
      range: { min: 2.76, max: 3.5 },
      name: "Implementing",
      description: "Systematic adoption across multiple areas with formal processes, training, and governance. Clear ROI measurement."
    },
    transforming: {
      level: 4,
      range: { min: 3.51, max: 4.0 },
      name: "Transforming",
      description: "AI as a core strategic driver fundamentally changing how business operates. Organization-wide capabilities with continuous innovation."
    }
  },
  
  // Weighting for the overall score calculation
  weightings: {
    productivity: 0.3,
    valueCreation: 0.3,
    businessModel: 0.4
  }
};