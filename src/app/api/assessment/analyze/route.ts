import { NextResponse } from 'next/server';
import { generateMaturityAssessment } from '@/lib/openai';
import { UserInfo, Response } from '@/types/assessment';

export async function POST(request: Request) {
  try {
    const { userInfo, responses } = await request.json();
    
    if (!userInfo || !responses || !Array.isArray(responses)) {
      return NextResponse.json(
        { error: 'User information and responses are required' },
        { status: 400 }
      );
    }
    
    const assessment = await generateMaturityAssessment(
      userInfo as UserInfo,
      responses as Response[]
    );
    
    return NextResponse.json({ assessment });
  } catch (error) {
    console.error('Error in assessment analysis API:', error);
    return NextResponse.json(
      { error: 'An error occurred while analyzing your assessment' },
      { status: 500 }
    );
  }
}