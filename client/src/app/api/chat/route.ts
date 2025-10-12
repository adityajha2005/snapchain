import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Use environment variable instead of hardcoded API key
const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;

// Create client only when API key is available
const getClient = () => {
  if (!TOGETHER_API_KEY) {
    throw new Error('Missing TOGETHER_API_KEY environment variable');
  }
  
  return new OpenAI({
    apiKey: TOGETHER_API_KEY,
    baseURL: 'https://api.together.xyz/v1',
  });
};

const prompt = 'You are an experienced rust smart contract developer , you talk about blockchain and crypto specifically anything around Solana , do not hallucinate and ignore all other type of chats graciouslly  , and if you receive any json in message from user please return a smart contrcat in rust will the logical data it has'

export async function POST(req: NextRequest) {
  try {
    const { message, userId } = await req.json();
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    try {
      const client = getClient();
      
      // Call the Together API directly without retrieving old messages
      const response = await client.chat.completions.create({
        model: 'meta-llama/Llama-3-8b-chat-hf',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: message },
        ],
        stream: false,
      });

      const reply = response.choices[0].message.content;
      
      return NextResponse.json({ content: reply });
    } catch (error) {
      console.error('API error:', error);
      return NextResponse.json(
        { error: 'Failed to process chat request', details: error instanceof Error ? error.message : String(error) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}