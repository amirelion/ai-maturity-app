import { NextResponse } from 'next/server';
import { generateAssistantResponse } from '@/lib/openai';

export async function POST(request: Request) {
  try {
    const { conversation, systemPrompt } = await request.json();
    
    if (!conversation || !Array.isArray(conversation)) {
      return NextResponse.json(
        { error: 'Conversation is required and must be an array' },
        { status: 400 }
      );
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