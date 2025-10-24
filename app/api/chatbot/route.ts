import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { messages, contextData } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ success: false, error: 'Invalid messages format' }, { status: 400 });
    }

    const NOVITA_API_KEY = process.env.NOVITA_API_KEY;
    if (!NOVITA_API_KEY) {
      return NextResponse.json({ success: false, error: 'API key not configured' }, { status: 500 });
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

Keep your responses concise (2-3 paragraphs max unless the user asks for more detail). Use clear, accessible language while maintaining analytical depth.`;

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
    const response = await fetch('https://api.novita.ai/v3/openai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOVITA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat',
        messages: apiMessages,
        max_tokens: 1000,
        temperature: 0.7,
        stream: false
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', errorText);
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from DeepSeek API');
    }

    const assistantMessage = data.choices[0].message.content;
    console.log('✓ DeepSeek response received');

    return NextResponse.json({ 
      success: true, 
      response: assistantMessage 
    });

  } catch (error: any) {
    console.error('Chatbot API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to process chatbot request' 
    }, { status: 500 });
  }
}

