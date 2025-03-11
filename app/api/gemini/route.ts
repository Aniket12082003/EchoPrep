import { NextResponse } from 'next/server';
import { generateResponse } from '@/lib/gemini'; // Adjust the path as needed

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    const response = await generateResponse(prompt);
    return NextResponse.json({ result: response });
  } catch (error) {
    console.error('Error in Gemini API route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}