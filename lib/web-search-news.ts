/**
 * Web Search News Module
 * 
 * Uses LLM with web search capabilities to find and summarize latest news
 * This is much more flexible than rigid web scrapers
 */

import { z } from 'zod';
import type { NewsArticle } from './types';

// Schema for news search results
const NewsSearchResultSchema = z.object({
  articles: z.array(z.object({
    title: z.string(),
    url: z.string(),
    snippet: z.string(),
    source: z.string(),
    publishedDate: z.string(),
  })),
  summary: z.string(),
  keywords: z.array(z.string()),
});

export type NewsSearchResult = z.infer<typeof NewsSearchResultSchema>;

/**
 * Search and summarize news for a specific category using LLM with web search
 * @param category - News category (tech, politics, economy, sf-local)
 * @returns News search results with articles and summary
 */
export async function searchAndSummarizeNews(
  category: 'tech' | 'politics' | 'economy' | 'sf-local'
): Promise<NewsSearchResult> {
  const apiKey = process.env.NOVITA_API_KEY;

  if (!apiKey) {
    throw new Error('NOVITA_API_KEY is not configured');
  }

  const categoryPrompts = {
    tech: 'Latest San Francisco and Bay Area technology news this week: AI companies in SF, tech startups in the Bay Area, Silicon Valley developments affecting SF, local tech company announcements, and technology trends in San Francisco',
    politics: 'Latest San Francisco and Bay Area political news this week: SF city policies, Bay Area legislation, California state politics affecting SF, SF mayor and supervisors, local elections, and political developments in San Francisco',
    economy: 'Latest San Francisco and Bay Area economic news this week: SF business news, Bay Area startup funding, SF real estate and housing market, local job market, SF economic indicators, and business developments in San Francisco',
    'sf-local': 'Latest San Francisco local news this week: SF city policies, housing developments, BART and transportation updates, Golden Gate Park events, local community news, and Bay Area developments',
  };

  const categoryLabels = {
    tech: 'Technology',
    politics: 'Politics',
    economy: 'Economy',
    'sf-local': 'San Francisco Local News',
  };

  // Get current date for context
  const today = new Date();
  const weekStart = new Date('2025-10-20'); // Week starting Oct 20, 2025
  const dateStr = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const weekStartStr = weekStart.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const prompt = `Today is ${dateStr}. You are a San Francisco-focused news researcher tasked with finding the most important news stories from the week starting ${weekStartStr} in the ${categoryLabels[category]} category.

Search for: ${categoryPrompts[category]}

CRITICAL REQUIREMENTS:
- ONLY include news articles published on or after ${weekStartStr} (October 20, 2025)
- Articles MUST be from the current week (October 20-25, 2025)
- Each article MUST have a real, verifiable published date from this week
- DO NOT include any articles from before October 20, 2025
- ⭐ MOST IMPORTANT: ALL articles MUST be about San Francisco, Bay Area, or Silicon Valley
- EXCLUDE national/international news unless it directly impacts San Francisco
- Every article must mention "San Francisco", "Bay Area", "SF", or related locations

Your task is to:
1. Search the web for the top 5-7 most significant SAN FRANCISCO-RELATED news stories from THIS SPECIFIC WEEK (Oct 20-25, 2025)
2. For each story, extract: title, URL, brief snippet (1-2 sentences), source name, and EXACT published date (must be between Oct 20-25, 2025)
3. Provide a brief 2-3 sentence overview of this week's main themes IN SAN FRANCISCO
4. Identify 3-5 key keywords or trending topics from THIS WEEK in SF/Bay Area

Focus on:
- Stories published between October 20-25, 2025 ONLY
- Stories specifically about San Francisco, Bay Area, or Silicon Valley
- Major reputable news sources (SF Chronicle, SF Standard, SF Gate, TechCrunch, Bloomberg Bay Area, etc.)
- High-impact, newsworthy stories affecting SF residents (not minor updates or rumors)
- Local perspectives and SF-specific angles
- VERIFY that published dates are within the specified week
- VERIFY that each story mentions San Francisco or Bay Area

Return your findings as a JSON object with this structure:
{
  "articles": [
    {
      "title": "Article headline",
      "url": "https://...",
      "snippet": "Brief 1-2 sentence summary",
      "source": "Source name (e.g., Reuters, TechCrunch)",
      "publishedDate": "2025-10-XX (ISO date string within Oct 20-25, 2025)"
    }
  ],
  "summary": "2-3 sentence overview of THIS WEEK's main themes in this category",
  "keywords": ["Keyword1", "Keyword2", "Keyword3"]
}

Return ONLY the raw JSON object, no other text.`;

  try {
    console.log(`Searching web for ${category} news...`);
    
    const response = await fetch('https://api.novita.ai/v3/openai/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-v3.2-exp',
        messages: [
          {
            role: 'system',
            content: `You are a professional news researcher with web search capabilities. Your job is to find the most important and recent news stories from reputable sources. Always prioritize accuracy, recency, and newsworthiness.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3, // Lower temperature for more factual responses
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Novita API request failed: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const data = await response.json();

    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from Novita API');
    }

    const content = data.choices[0].message.content;

    // Clean the response
    let cleanedContent = content.trim();
    
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/^```json\s*\n?/, '').replace(/\n?```\s*$/, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```\s*\n?/, '').replace(/\n?```\s*$/, '');
    }

    // Parse and validate
    let parsedContent: unknown;
    try {
      parsedContent = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse LLM response as JSON:', content);
      throw new Error(`LLM response is not valid JSON: ${parseError}`);
    }

    const validatedResult = NewsSearchResultSchema.parse(parsedContent);

    console.log(`✓ Found ${validatedResult.articles.length} articles for ${category}`);
    return validatedResult;
  } catch (error) {
    console.error(`Error searching ${category} news:`, error);

    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.message);
      throw new Error(
        `Invalid response format from LLM. Expected articles, summary, and keywords fields.`
      );
    }

    throw error;
  }
}

/**
 * Search and summarize news with retry logic
 * @param category - News category
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @returns News search results
 */
export async function searchAndSummarizeNewsWithRetry(
  category: 'tech' | 'politics' | 'economy' | 'sf-local',
  maxRetries: number = 3
): Promise<NewsSearchResult> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await searchAndSummarizeNews(category);
    } catch (error) {
      lastError = error as Error;
      console.warn(`Attempt ${attempt} failed for ${category}:`, error);

      if (attempt < maxRetries) {
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(
    `Failed to search ${category} news after ${maxRetries} attempts: ${lastError?.message}`
  );
}

