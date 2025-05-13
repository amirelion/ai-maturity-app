// User information
export interface UserInfo {
  name: string;
  role: string;
  industry: string;
  orgSize: string;
  email: string;
}

// Assessment question
export interface Question {
  id: string;
  text: string;
  valueArea: 'productivity' | 'valueCreation' | 'businessModel' | 'general';
  followUp?: string[];
}

// User's response to a question
export interface Response {
  questionId: string;
  answer: string;
  timestamp: number;
}

// Maturity level for a value area
export enum MaturityLevel {
  Exploring = 1,
  Experimenting = 2,
  Implementing = 3,
  Transforming = 4
}

// Assessment result
export interface AssessmentResult {
  userInfo: UserInfo;
  productivity: {
    score: number;
    level: MaturityLevel;
    strengths: string[];
    opportunities: string[];
  };
  valueCreation: {
    score: number;
    level: MaturityLevel;
    strengths: string[];
    opportunities: string[];
  };
  businessModel: {
    score: number;
    level: MaturityLevel;
    strengths: string[];
    opportunities: string[];
  };
  overall: {
    score: number;
    level: MaturityLevel;
  };
  responses: Response[];
  timestamp: number;
}