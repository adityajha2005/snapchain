import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Use OpenRouter API
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Create OpenRouter client
const getClient = () => {
  if (!OPENROUTER_API_KEY) {
    throw new Error('Missing OPENROUTER_API_KEY environment variable');
  }
  
  return new OpenAI({
    apiKey: OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000',
      'X-Title': 'Snapchain Smart Contract Builder',
    },
  });
};

const prompt = `You are an expert Rust smart contract developer specializing in Solana blockchain development. 

CORE COMPETENCIES:
- Expert in Rust programming language and Solana Program Library (SPL)
- Deep understanding of Solana's account model and program architecture
- Proficient in writing secure, gas-optimized smart contracts
- Familiar with common vulnerabilities and security best practices

BEHAVIOR GUIDELINES:
- You ONLY discuss and assist with blockchain and cryptocurrency topics, specifically Solana
- When receiving JSON block structures, interpret them to understand user intent and generate corresponding Rust code
- Always provide production-ready, compilable code with proper error handling
- Include security checks and validations in all generated code
- Politely decline requests outside of blockchain/crypto domain
- Never hallucinate or make up information

CRITICAL RESPONSE FORMAT FOR CONTRACT REFINEMENT:
- When asked to refine or generate a contract, return ONLY the Rust code
- Wrap the code in \`\`\`rust code blocks
- DO NOT include any explanations, analysis, or commentary before or after the code
- DO NOT include phrases like "Here's the improved code" or "I've made the following changes"
- The response should start with \`\`\`rust and end with \`\`\`
- Everything between the code fences should be pure, compilable Rust code`;

/**
 * Extract clean Rust code from LLM response
 * Removes markdown code fences, explanations, and extra text
 */
function extractCleanCode(response: string): string {
  // Try to extract code from markdown code blocks
  const codeBlockRegex = /```(?:rust)?\s*([\s\S]*?)```/g;
  const matches = [...response.matchAll(codeBlockRegex)];
  
  if (matches.length > 0) {
    // Get the largest code block (likely the main contract)
    const codeBlocks = matches.map(m => m[1].trim());
    const largestBlock = codeBlocks.reduce((a, b) => a.length > b.length ? a : b);
    return largestBlock;
  }
  
  // If no code blocks found, try to clean the response
  let cleaned = response.trim();
  
  // Remove common prefixes/explanations (case-insensitive, dotall)
  const prefixPatterns = [
    /^.*?Here'?s?\s+(?:the|an?)\s+.*?:?\s*\n+/i,
    /^.*?I'?(?:ve|'ve)\s+(?:made|generated|created|improved).*?:?\s*\n+/i,
    /^.*?The\s+following.*?:?\s*\n+/i,
    /^.*?Below\s+is.*?:?\s*\n+/i,
  ];
  
  for (const pattern of prefixPatterns) {
    const match = cleaned.match(pattern);
    if (match && match[0].length < 200) { // Only remove short prefixes
      cleaned = cleaned.replace(pattern, '');
    }
  }
  
  // Remove trailing explanations
  const suffixPatterns = [
    /\n+.*?(?:Note|Changes|Improvements).*$/i,
  ];
  
  for (const pattern of suffixPatterns) {
    const match = cleaned.match(pattern);
    if (match && match.index && match.index > 500) { // Only remove if there's substantial code before it
      cleaned = cleaned.substring(0, match.index);
    }
  }
  
  return cleaned.trim();
}

/**
 * Clean chat response by removing markdown formatting for display
 * Removes asterisks, backticks, and code fences while preserving content
 */
function cleanChatResponse(response: string): string {
  let cleaned = response;
  
  // Remove code block markers but keep the code
  cleaned = cleaned.replace(/```(?:rust|javascript|typescript|python|solidity)?\s*\n/g, '\n');
  cleaned = cleaned.replace(/```\s*/g, '');
  
  // Remove bold/italic markers (** and *)
  cleaned = cleaned.replace(/\*\*\*(.+?)\*\*\*/g, '$1'); // bold + italic
  cleaned = cleaned.replace(/\*\*(.+?)\*\*/g, '$1'); // bold
  cleaned = cleaned.replace(/\*(.+?)\*/g, '$1'); // italic
  cleaned = cleaned.replace(/_(.+?)_/g, '$1'); // underscores
  
  // Remove inline code backticks
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1');
  
  // Clean up any remaining artifacts
  cleaned = cleaned.replace(/^\s*[\*\-]\s+/gm, '• '); // Convert markdown lists to bullet points
  
  return cleaned.trim();
}

export async function POST(req: NextRequest) {
  try {
    const { message, userId, blocksStructure } = await req.json();
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    try {
      const client = getClient();
      
      // Enhance the message with block structure info if provided
      let enhancedMessage = message;
      if (blocksStructure && Array.isArray(blocksStructure)) {
        const blockCount = blocksStructure.length;
        const blockTypes = blocksStructure.map((b: any) => b.type).join(', ');
        enhancedMessage += `\n\n[METADATA] This request includes ${blockCount} top-level block(s) of types: ${blockTypes}`;
      }
      
      // Call the OpenRouter API 
      const response = await client.chat.completions.create({
        model: 'openai/gpt-oss-120b:free',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: enhancedMessage },
        ],
        stream: false,
        temperature: 0.7,
        max_tokens: 4000,
      });

      const reply = response.choices[0].message.content;
      
      // Determine response type and clean accordingly
      const isRefinementRequest = message.includes('TASK:') || message.includes('refine') || message.includes('generate') || blocksStructure;
      
      let cleanedContent: string;
      if (isRefinementRequest) {
        // For contract refinement: extract only the code
        cleanedContent = extractCleanCode(reply || '');
      } else {
        // For chat: remove markdown formatting but keep content readable
        cleanedContent = cleanChatResponse(reply || '');
      }
      
      return NextResponse.json({ 
        content: cleanedContent,
        rawContent: reply, // Keep original for debugging
        blocksProcessed: blocksStructure ? blocksStructure.length : 0 
      });
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