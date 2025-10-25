import { NextRequest, NextResponse } from 'next/server';
import type { CategoryNews } from '@/lib/types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface RequestBody {
  question: string;
  news: CategoryNews;
  weekOf: string;
  conversationHistory: Message[];
}

/**
 * POST /api/news-qa
 * AI-powered Q&A for news articles
 */
export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { question, news, weekOf, conversationHistory } = body;

    if (!question || !news) {
      return NextResponse.json(
        { success: false, error: 'Question and news data are required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.NOVITA_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'LLM API key not configured' },
        { status: 500 }
      );
    }

    // Build context from news data
    const categoryLabels = {
      tech: 'San Francisco Technology',
      politics: 'San Francisco Politics',
      economy: 'San Francisco Economy',
      'sf-local': 'San Francisco Local News',
    };

    const context = `You are a knowledgeable San Francisco news analyst helping users understand ${categoryLabels[news.category]} news from the week of ${weekOf}.

NEWS CONTEXT:
Category: ${categoryLabels[news.category]}
Week: ${weekOf}

Summary: ${news.summaryShort}

Detailed Analysis: ${news.summaryDetailed}

Key Developments:
${news.bullets.map((bullet, i) => `${i + 1}. ${bullet}`).join('\n')}

Keywords: ${news.keywords.join(', ')}

Top Sources:
${news.sources.slice(0, 5).map((s, i) => `${i + 1}. ${s.title} (${s.source})`).join('\n')}

INSTRUCTIONS:
- Provide helpful, accurate answers based on the news context above
- Focus on implications for San Francisco residents
- Connect different stories when relevant
- Be conversational but informative
- If asked about specific details not in the context, say so honestly
- Cite sources when mentioning specific stories`;

    // Build messages for LLM
    const messages = [
      { role: 'system', content: context },
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: question },
    ];

    // Call LLM API
    const response = await fetch('https://api.novita.ai/v3/openai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-v3.2-exp',
        messages,
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('LLM API error:', errorText);
      throw new Error(`LLM API request failed: ${response.status}`);
    }

    const data = await response.json();

    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from LLM');
    }

    const answer = data.choices[0].message.content;

    return NextResponse.json({
      success: true,
      answer,
    });
  } catch (error) {
    console.error('News QA error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';

