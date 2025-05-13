import { NextResponse } from 'next/server';
import { textToSpeech } from '@/lib/openai';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    
    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }
    
    const audioBuffer = await textToSpeech(text);
    
    // Convert to base64 to send over JSON
    const audioBase64 = Buffer.from(audioBuffer).toString('base64');
    
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString()
      }
    });
  } catch (error) {
    console.error('Error in speech API:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}