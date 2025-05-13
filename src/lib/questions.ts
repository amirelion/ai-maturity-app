import { Question } from '@/types/assessment';

// User information questions
export const userInfoQuestions: Question[] = [
  {
    id: 'user-name-role',
    text: "Hi there! I'm excited to help you understand your AI readiness. First, could you tell me your name and role in your organization?",
    valueArea: 'general',
  },
  {
    id: 'user-industry',
    text: "What industry does your organization operate in? For example, healthcare, finance, retail, manufacturing...",
    valueArea: 'general',
  },
  {
    id: 'user-org-size',
    text: "Roughly how large is your organization? Would you say it's a small business, mid-sized company, or enterprise?",
    valueArea: 'general',
  },
  {
    id: 'user-responsibility',
    text: "Are you primarily responsible for business decisions, technical implementations, or a mix of both?",
    valueArea: 'general',
  },
  {
    id: 'user-email',
    text: "Where would you like me to send your personalized AI maturity report when we're done?",
    valueArea: 'general',
  },
];

// Value Opportunity 1: Boosting Productivity
export const productivityQuestions: Question[] = [
  {
    id: 'prod-personal-experience',
    text: "How would you describe your personal experience with AI tools so far? Have you tried tools like ChatGPT, GitHub Copilot, or AI-based productivity assistants?",
    valueArea: 'productivity',
  },
  {
    id: 'prod-workday-tasks',
    text: "When you think about your typical workday, which tasks do you think could benefit most from AI assistance?",
    valueArea: 'productivity',
  },
  {
    id: 'prod-team-adoption',
    text: "Has your team adopted any AI tools for improving productivity? If yes, how widespread is the usage?",
    valueArea: 'productivity',
  },
  {
    id: 'prod-challenges',
    text: "What's your biggest challenge when it comes to improving productivity in your role or team?",
    valueArea: 'productivity',
  },
  {
    id: 'prod-prompting',
    text: "How comfortable are you with prompting AI systems to get the outputs you need?",
    valueArea: 'productivity',
  },
  {
    id: 'prod-reaction',
    text: "When someone on your team suggests using a new AI tool, what's typically your first reaction?",
    valueArea: 'productivity',
  },
];

// Value Opportunity 2: Creating Value Through Enhanced Products & Services
export const valueCreationQuestions: Question[] = [
  {
    id: 'value-current-integration',
    text: "Has your organization integrated AI features into any existing products or services? Could you share an example?",
    valueArea: 'valueCreation',
  },
  {
    id: 'value-customer-problems',
    text: "What customer problems do you think AI could help solve in your current offerings?",
    valueArea: 'valueCreation',
  },
  {
    id: 'value-insights',
    text: "How do you currently gather insights about how AI might enhance your customer experience?",
    valueArea: 'valueCreation',
  },
  {
    id: 'value-competition',
    text: "When thinking about your competitors, how would you rate their AI integration compared to yours?",
    valueArea: 'valueCreation',
  },
  {
    id: 'value-barriers',
    text: "What's the biggest barrier to implementing AI in your products or services right now?",
    valueArea: 'valueCreation',
  },
  {
    id: 'value-customer-reaction',
    text: "How do your customers typically react to technology-driven changes in your offerings?",
    valueArea: 'valueCreation',
  },
];

// Value Opportunity 3: Disrupting Value Chain & Business Models
export const businessModelQuestions: Question[] = [
  {
    id: 'biz-future-vision',
    text: "When you think about your industry five years from now, how do you imagine AI might change the fundamental business models?",
    valueArea: 'businessModel',
  },
  {
    id: 'biz-revenue-streams',
    text: "Has your organization explored any entirely new revenue streams that would be enabled by AI?",
    valueArea: 'businessModel',
  },
  {
    id: 'biz-leadership',
    text: "How often does your leadership team discuss AI as a strategic priority versus an operational tool?",
    valueArea: 'businessModel',
  },
  {
    id: 'biz-value-chain',
    text: "Which parts of your value chain (like procurement, production, distribution) do you think are most ready for AI transformation?",
    valueArea: 'businessModel',
  },
  {
    id: 'biz-prioritization',
    text: "If you had unlimited resources, which AI-driven business transformation would you prioritize first?",
    valueArea: 'businessModel',
  },
  {
    id: 'biz-approach',
    text: "How does your organization typically approach emerging technologies - as an early adopter, fast follower, or wait-and-see?",
    valueArea: 'businessModel',
  },
];

// Closing Questions
export const closingQuestions: Question[] = [
  {
    id: 'closing-hope',
    text: "Based on our conversation, I'm curious - what's your biggest hope for how AI might benefit your organization?",
    valueArea: 'general',
  },
  {
    id: 'closing-concern',
    text: "What's your biggest concern about adopting more AI in your business?",
    valueArea: 'general',
  },
  {
    id: 'closing-report',
    text: "Is there anything specific you'd like to see in your AI maturity report that would make it most valuable to you?",
    valueArea: 'general',
  },
];

// All questions
export const allQuestions: Question[] = [
  ...userInfoQuestions,
  ...productivityQuestions,
  ...valueCreationQuestions,
  ...businessModelQuestions,
  ...closingQuestions,
];