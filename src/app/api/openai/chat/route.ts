import { NextResponse } from 'next/server';
import { generateAssistantResponse } from '@/lib/openai';
import { systemPrompts } from '@/config/ai-config';

export async function POST(request: Request) {
  try {
    const { conversation, context } = await request.json();
    
    if (!conversation || !Array.isArray(conversation)) {
      return NextResponse.json(
        { error: 'Conversation is required and must be an array' },
        { status: 400 }
      );
    }
    
    // Determine which system prompt to use based on context
    let systemPrompt = systemPrompts.conversationIntro;
    if (context) {
      switch (context) {
        case 'userInfo':
          systemPrompt = systemPrompts.userInfoGathering;
          break;
        case 'productivity':
          systemPrompt = systemPrompts.productivityAssessment;
          break;
        case 'valueCreation':
          systemPrompt = systemPrompts.valueCreationAssessment;
          break;
        case 'businessModel':
          systemPrompt = systemPrompts.businessModelAssessment;
          break;
        case 'closing':
          systemPrompt = systemPrompts.closingConversation;
          break;
        default:
          systemPrompt = systemPrompts.conversationIntro;
      }
    }
    
    const response = await generateAssistantResponse(conversation, systemPrompt);
    
    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}