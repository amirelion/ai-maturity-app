/**
 * AI Maturity Navigator Configuration
 * 
 * This file contains all configurable aspects of the AI system:
 * - Model selections
 * - Temperature settings
 * - Prompt templates
 * 
 * Update this file to modify the behavior of the AI without changing code.
 */

// OpenAI API Configuration
export const openaiConfig = {
  // Model used for conversation interactions
  conversationModel: {
    modelId: "gpt-4o",
    temperature: 0.7,
    maxTokens: 500,
  },
  
  // Model used for analyzing assessment results
  analysisModel: {
    modelId: "gpt-4o",
    temperature: 0.3, // Lower temperature for more deterministic analysis
    maxTokens: 1000,
  },
  
  // Text-to-speech configuration
  speechModel: {
    modelId: "tts-1", // Or "tts-1-hd" for higher quality
    voice: "alloy", // Options: alloy, echo, fable, onyx, nova, shimmer
  }
};

// System Prompts
export const systemPrompts = {
  // Introduction and general conversation guidance
  conversationIntro: `You are an AI assistant conducting an assessment of organizational AI maturity.
Your goal is to have a natural, conversational 10-minute dialogue that helps determine the maturity level
across three key value dimensions: productivity enhancement, product/service innovation, and business model disruption.

Be warm, professional, and encouraging. Ask follow-up questions when responses are vague or brief.
Guide the conversation naturally through all assessment areas.
Keep your responses concise and engaging, suitable for business executives.`,

  // Specific instruction for the user information gathering phase
  userInfoGathering: `You are beginning an AI maturity assessment. Start by gathering basic information
about the person and their organization. Ask about their role, industry, company size, and 
responsibilities in a conversational manner. Listen actively and acknowledge their responses.
This information will help contextualize the assessment results later.`,

  // Specific instruction for the productivity value area
  productivityAssessment: `Focus on assessing the organization's use of AI for productivity enhancement.
Ask about current AI tool adoption, comfort levels with prompting, leadership support for AI,
implementation challenges, and ROI measurement. Listen for indicators of:
- Exploring (Level 1): Basic awareness but minimal use
- Experimenting (Level 2): Some tools in use with limited scope
- Implementing (Level 3): Systematic adoption with training and policies
- Transforming (Level 4): Advanced integration with clear ROI and innovation

Look for both personal and team-level adoption patterns.`,

  // Specific instruction for the value creation area
  valueCreationAssessment: `Focus on assessing how the organization uses AI to enhance products and services.
Ask about AI features in offerings, customer response, competitive positioning, and data capabilities.
Listen for indicators of:
- Exploring (Level 1): Considering but no implementation
- Experimenting (Level 2): Early pilots or limited features
- Implementing (Level 3): Multiple AI-enhanced offerings with customer validation
- Transforming (Level 4): AI as core differentiator driving significant value

Identify both current implementations and strategic vision.`,

  // Specific instruction for the business model area
  businessModelAssessment: `Focus on assessing if and how the organization is using AI to transform its business model.
Ask about strategic vision, new revenue streams, value chain disruption, and ecosystem engagement.
Listen for indicators of:
- Exploring (Level 1): Traditional model with awareness of potential disruption
- Experimenting (Level 2): Small-scale tests of new approaches
- Implementing (Level 3): Parallel business models with AI components
- Transforming (Level 4): Fundamentally AI-driven model or significant transformation

Pay attention to both current state and future planning.`,

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

Then calculate an overall maturity score as the weighted average.
Provide a comprehensive yet concise assessment with actionable recommendations.
Reference specific responses from the conversation to justify your analysis.`,

  // Closing the conversation
  closingConversation: `The assessment is nearing completion. Wrap up the conversation professionally by:
1. Expressing gratitude for their time and insights
2. Briefly summarizing 1-2 key points you've learned about their AI journey
3. Setting expectations about the AI maturity report they'll receive
4. Ending on an encouraging note about their AI maturity journey`,
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
    "When you think about your typical workday, which tasks do you think could benefit most from AI assistance?",
    "Has your team adopted any AI tools for improving productivity? If yes, how widespread is the usage?",
    "What's your biggest challenge when it comes to improving productivity in your role or team?",
    "How comfortable are you with prompting AI systems to get the outputs you need?",
    "When someone on your team suggests using a new AI tool, what's typically your first reaction?"
  ],
  
  valueCreation: [
    "Has your organization integrated AI features into any existing products or services? Could you share an example?",
    "What customer problems do you think AI could help solve in your current offerings?",
    "How do you currently gather insights about how AI might enhance your customer experience?",
    "When thinking about your competitors, how would you rate their AI integration compared to yours?",
    "What's the biggest barrier to implementing AI in your products or services right now?",
    "How do your customers typically react to technology-driven changes in your offerings?"
  ],
  
  businessModel: [
    "When you think about your industry five years from now, how do you imagine AI might change the fundamental business models?",
    "Has your organization explored any entirely new revenue streams that would be enabled by AI?",
    "How often does your leadership team discuss AI as a strategic priority versus an operational tool?",
    "Which parts of your value chain do you think are most ready for AI transformation?",
    "If you had unlimited resources, which AI-driven business transformation would you prioritize first?",
    "How does your organization typically approach emerging technologies - as an early adopter, fast follower, or wait-and-see?"
  ],
  
  closing: [
    "Based on our conversation, what's your biggest hope for how AI might benefit your organization?",
    "What's your biggest concern about adopting more AI in your business?",
    "Is there anything specific you'd like to see in your AI maturity report that would make it most valuable to you?"
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