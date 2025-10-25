import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG, UI_TEXT, UI_CONFIG, ERROR_MESSAGES } from '@/lib/constants';
import { handleApiError, logError, createErrorResponse, handleExternalApiError } from '@/lib/error-handler';
import type { ChatbotResponse } from '@/lib/types';

/**
 * POST /api/chatbot
 * 
 * Handles chatbot conversations with AI analysis
 */
export async function POST(request: NextRequest) {
  try {
    const { messages, contextData } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      throw createErrorResponse(
        ERROR_MESSAGES.INVALID_MESSAGES_FORMAT,
        'VALIDATION_FAILED',
        400
      );
    }

    const NOVITA_API_KEY = process.env.NOVITA_API_KEY;
    if (!NOVITA_API_KEY) {
      throw createErrorResponse(
        ERROR_MESSAGES.API_KEY_MISSING,
        'API_KEY_MISSING',
        500
      );
    }

    // Build system prompt with context
    const systemPrompt = `You are an AI assistant specialized in analyzing San Francisco cultural narratives and urban sociology. 

CONTEXT FOR THIS CONVERSATION:
Event: ${contextData.headline} (Week of ${contextData.weekOf})

Hype Narrative Summary:
${contextData.hypeContent}

Backlash Narrative Summary:
${contextData.backlashContent}

Post-Battle Analysis:
${contextData.summary}

Your role is to:
1. Help users understand the competing narratives around this SF event
2. Provide deeper insights into the cultural, economic, and social tensions
3. Connect this event to broader patterns in SF's urban development
4. Answer questions about the evidence, implications, and context
5. Be thoughtful, nuanced, and avoid taking strong partisan positions
6. When appropriate, highlight what's missing or oversimplified in the narratives

IMPORTANT FORMATTING RULES:
- Keep responses concise and use bullet points when appropriate
- Do NOT include your thinking process or reasoning steps
- Go straight to the answer
- Use clear, accessible language while maintaining analytical depth
- Keep response within ${UI_TEXT.CHATBOT_MAX_RESPONSE_LENGTH} characters`;

    // Prepare messages for the API
    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((msg: any) => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      }))
    ];

    console.log('🤖 Calling DeepSeek API via Novita...');

    // Call Novita AI API with DeepSeek model
    const response = await fetch(API_CONFIG.NOVITA_API_BASE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOVITA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1-0528-qwen3-8b',
        messages: apiMessages,
        max_tokens: UI_CONFIG.CHATBOT_MAX_TOKENS,
        temperature: UI_CONFIG.CHATBOT_TEMPERATURE,
        stream: false
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw handleExternalApiError(
        new Error(`DeepSeek API error: ${errorText}`),
        'DeepSeek API',
        response.status
      );
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw createErrorResponse(
        'Invalid response format from DeepSeek API',
        'API_INVALID_RESPONSE',
        502
      );
    }

    let assistantMessage = data.choices[0].message.content;
    
    // Strip out thinking process tags if present (for R1 reasoning models)
    if (assistantMessage.includes('<think>')) {
      assistantMessage = assistantMessage.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    }
    
    console.log('✓ DeepSeek response received');

    const responseData: ChatbotResponse = { 
      success: true, 
      response: assistantMessage 
    };

    return NextResponse.json(responseData);

  } catch (error: any) {
    const appError = handleApiError(error, 'Chatbot API');
    logError(appError, 'Chatbot Route');
    
    const errorResponse: ChatbotResponse = { 
      success: false, 
      error: appError.message 
    };
    
    return NextResponse.json(errorResponse, { status: appError.statusCode });
  }
}

