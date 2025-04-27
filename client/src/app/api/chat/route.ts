import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

// Use environment variable instead of hardcoded API key
const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;

// Validate that API key is available
if (!TOGETHER_API_KEY) {
  console.error('Missing TOGETHER_API_KEY environment variable');
}

const client = new OpenAI({
  apiKey: TOGETHER_API_KEY,
  baseURL: 'https://api.together.xyz/v1',
});

const prompt = 'You are an experienced rust smart contract developer , you talk about blockchain and crypto specifically anything around Solana , do not hallucinate and ignore all other type of chats graciouslly  , and if you receive any json in message from user please return a smart contrcat in rust will the logical data it has';

// Create Message model if it doesn't exist
let Message: mongoose.Model<any>;
try {
  Message = mongoose.model('Message');
} catch {
  const messageSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  });
  
  Message = mongoose.model('Message', messageSchema);
}

export async function POST(req: NextRequest) {
  try {
    // Connect to MongoDB
    await dbConnect();
    
    // Get user from session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to use the chat.' },
        { status: 401 }
      );
    }
    
    const { message } = await req.json();
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get user ID from session
    const userId = session.user.id;
    
    // Find previous messages from this user (last 5)
    const previousMessages = await Message.find({ user: userId })
      .sort({ timestamp: -1 })
      .limit(5)
      .lean();
    
    // Save the user's message to the database
    const userMessage = new Message({
      user: userId,
      content: message,
      role: 'user',
      timestamp: new Date(),
    });
    await userMessage.save();

    try {
      // Format previous messages for the API call
      const messageHistory = previousMessages
        .reverse()
        .map(msg => ({
          role: msg.role,
          content: msg.content,
        }));
      
      // Call the Together API with conversation history
      const response = await client.chat.completions.create({
        model: 'meta-llama/Llama-3-8b-chat-hf',
        messages: [
          { role: 'system', content: prompt },
          ...messageHistory,
          { role: 'user', content: message },
        ],
        stream: false,
      });

      const reply = response.choices[0].message.content;
      
      // Save the assistant's response to the database
      const assistantMessage = new Message({
        user: userId,
        content: reply,
        role: 'assistant',
        timestamp: new Date(),
      });
      await assistantMessage.save();
      
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