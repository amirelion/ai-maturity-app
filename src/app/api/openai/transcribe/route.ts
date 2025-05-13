import { NextResponse } from 'next/server';
import { speechToText } from '@/lib/openai';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as Blob;
    
    if (!audioFile) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      );
    }
    
    const transcription = await speechToText(audioFile);
    
    return NextResponse.json({ text: transcription });
  } catch (error) {
    console.error('Error in transcribe API:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}