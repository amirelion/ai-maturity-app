import OpenAI from "openai";
import { 
  openaiConfig, 
  systemPrompts,
  maturityFramework
} from "@/config/ai-config";
import { AssessmentResult, Response, UserInfo, MaturityLevel } from '@/types/assessment';

// Initialize OpenAI client
const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("OpenAI API key is not defined");
    return null;
  }

  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true // Note: In production, avoid exposing API key to the browser
  });
}

// Generate a response in the conversation
export async function generateAssistantResponse(
  conversation: { role: 'user' | 'assistant' | 'system'; content: string }[],
  systemPrompt: string = systemPrompts.conversationIntro
): Promise<string> {
  const openai = getOpenAIClient();
  
  if (!openai) {
    throw new Error("OpenAI client not initialized");
  }
  
  try {
    // Prepare conversation with system prompt
    const messages = [
      { role: "system", content: systemPrompt },
      ...conversation
    ];
    
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: openaiConfig.conversationModel.modelId,
      temperature: openaiConfig.conversationModel.temperature,
      max_tokens: openaiConfig.conversationModel.maxTokens,
      messages: messages as any
    });
    
    return response.choices[0]?.message.content || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    throw error;
  }
}

// Text-to-speech conversion
export async function textToSpeech(text: string): Promise<ArrayBuffer> {
  const openai = getOpenAIClient();
  
  if (!openai) {
    throw new Error("OpenAI client not initialized");
  }
  
  try {
    const response = await openai.audio.speech.create({
      model: openaiConfig.speechModel.modelId,
      voice: openaiConfig.speechModel.voice,
      input: text,
    });
    
    // Convert to arrayBuffer
    const buffer = await response.arrayBuffer();
    return buffer;
  } catch (error) {
    console.error("Error converting text to speech:", error);
    throw error;
  }
}

// Speech-to-text conversion
export async function speechToText(audioData: Blob): Promise<string> {
  const openai = getOpenAIClient();
  
  if (!openai) {
    throw new Error("OpenAI client not initialized");
  }
  
  try {
    const response = await openai.audio.transcriptions.create({
      file: new File([audioData], "audio.webm", { type: "audio/webm" }),
      model: "whisper-1",
    });
    
    return response.text;
  } catch (error) {
    console.error("Error converting speech to text:", error);
    throw error;
  }
}

// Generate a complete AI maturity assessment
export async function generateMaturityAssessment(
  userInfo: UserInfo,
  responses: Response[]
): Promise<AssessmentResult> {
  const openai = getOpenAIClient();
  
  if (!openai) {
    throw new Error("OpenAI client not initialized");
  }
  
  try {
    // Format the conversation history for analysis
    const formattedResponses = responses.map(r => 
      `Question: ${r.questionId}\nAnswer: ${r.answer}\n`
    ).join("\n");
    
    // Create the prompt for analysis
    const analysisPrompt = `
${systemPrompts.analysisInstruction}

## User Information:
Name: ${userInfo.name}
Role: ${userInfo.role}
Industry: ${userInfo.industry}
Organization Size: ${userInfo.orgSize}

## Conversation Transcript:
${formattedResponses}

## Maturity Framework:
Level 1 (Exploring): ${maturityFramework.levels.exploring.description}
Level 2 (Experimenting): ${maturityFramework.levels.experimenting.description}
Level 3 (Implementing): ${maturityFramework.levels.implementing.description}
Level 4 (Transforming): ${maturityFramework.levels.transforming.description}

Provide a comprehensive analysis, including specific scores for each area on a scale of 1.0 to 4.0.
`;

    // Call OpenAI for analysis
    const response = await openai.chat.completions.create({
      model: openaiConfig.analysisModel.modelId,
      temperature: openaiConfig.analysisModel.temperature,
      max_tokens: openaiConfig.analysisModel.maxTokens,
      messages: [
        { role: "system", content: systemPrompts.analysisInstruction },
        { role: "user", content: analysisPrompt }
      ]
    });
    
    const analysisText = response.choices[0]?.message.content || "";
    
    // Extract scores and insights from the analysis text
    // This is a simplified parsing implementation
    // In a production app, you might want more robust parsing
    const productivityScore = extractScore(analysisText, "productivity") || 2.5;
    const valueCreationScore = extractScore(analysisText, "value creation") || 2.0;
    const businessModelScore = extractScore(analysisText, "business model") || 1.8;
    
    // Calculate overall score using the weightings
    const overallScore = (
      productivityScore * maturityFramework.weightings.productivity +
      valueCreationScore * maturityFramework.weightings.valueCreation +
      businessModelScore * maturityFramework.weightings.businessModel
    );
    
    // Extract strengths and opportunities
    const productivityStrengths = extractPoints(analysisText, "productivity", "strength");
    const productivityOpportunities = extractPoints(analysisText, "productivity", "opportunit");
    
    const valueStrengths = extractPoints(analysisText, "value creation", "strength");
    const valueOpportunities = extractPoints(analysisText, "value creation", "opportunit");
    
    const businessStrengths = extractPoints(analysisText, "business model", "strength");
    const businessOpportunities = extractPoints(analysisText, "business model", "opportunit");
    
    // Determine maturity levels
    const getMaturityLevel = (score: number): MaturityLevel => {
      if (score <= maturityFramework.levels.exploring.range.max) return MaturityLevel.Exploring;
      if (score <= maturityFramework.levels.experimenting.range.max) return MaturityLevel.Experimenting;
      if (score <= maturityFramework.levels.implementing.range.max) return MaturityLevel.Implementing;
      return MaturityLevel.Transforming;
    };
    
    // Create the assessment result
    const assessment: AssessmentResult = {
      userInfo,
      productivity: {
        score: productivityScore,
        level: getMaturityLevel(productivityScore),
        strengths: productivityStrengths,
        opportunities: productivityOpportunities
      },
      valueCreation: {
        score: valueCreationScore,
        level: getMaturityLevel(valueCreationScore),
        strengths: valueStrengths,
        opportunities: valueOpportunities
      },
      businessModel: {
        score: businessModelScore,
        level: getMaturityLevel(businessModelScore),
        strengths: businessStrengths,
        opportunities: businessOpportunities
      },
      overall: {
        score: Number(overallScore.toFixed(1)),
        level: getMaturityLevel(overallScore)
      },
      responses,
      timestamp: Date.now()
    };
    
    return assessment;
  } catch (error) {
    console.error("Error generating assessment:", error);
    throw error;
  }
}

// Helper function to extract a score from LLM output
function extractScore(text: string, areaName: string): number | null {
  // Look for patterns like "Productivity: 2.5" or "Productivity Score: 2.5/4.0"
  const regex = new RegExp(`${areaName}[^\\d]+(\\d+\\.?\\d*)`, 'i');
  const match = text.match(regex);
  if (match && match[1]) {
    return parseFloat(match[1]);
  }
  return null;
}

// Helper function to extract bullet points related to strengths or opportunities
function extractPoints(text: string, areaName: string, pointType: string): string[] {
  // Try to find a section that looks like "Productivity Strengths:" followed by bullet points or numbered list
  const sectionRegex = new RegExp(
    `${areaName}[^\\n]*${pointType}[^\\n]*\\n((?:\\s*[-*•].*\\n|\\s*\\d+\\..*\\n)+)`,
    'i'
  );
  
  const sectionMatch = text.match(sectionRegex);
  
  if (sectionMatch && sectionMatch[1]) {
    // Extract individual points
    const pointsText = sectionMatch[1];
    const points = pointsText
      .split('\n')
      .map(line => line.replace(/^\s*[-*•]\s*|\s*\d+\.\s*/, '').trim())
      .filter(line => line.length > 0);
    
    return points;
  }
  
  // Fallback: return some generic points
  return [
    `Further ${pointType} opportunities will be identified based on assessment`,
    `Additional analysis needed for ${areaName} ${pointType}s`
  ];
}