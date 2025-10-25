import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { searchAndSummarizeNewsWithRetry } from '@/lib/web-search-news';
import { summarizeWeeklyNewsWithRetry } from '@/lib/llm';
import type { CategoryNews, NewsArticle } from '@/lib/types';

/**
 * Test endpoint to manually trigger weekly news generation using LLM web search
 * This bypasses the cron job for testing purposes
 */
export async function GET(request: NextRequest) {
  try {
    console.log('Starting test weekly news generation with LLM web search...');

    const summaries = {
      tech: null as CategoryNews | null,
      politics: null as CategoryNews | null,
      economy: null as CategoryNews | null,
      'sf-local': null as CategoryNews | null,
    };

    // Step 1: Search and gather articles for each category using LLM
    console.log('Step 1: Searching for news with LLM...');

    const categories = [
      { key: 'tech' as const },
      { key: 'politics' as const },
      { key: 'economy' as const },
      { key: 'sf-local' as const },
    ];

    const allKeywords: string[] = [];

    for (const { key } of categories) {
      try {
        console.log(`Searching for ${key} news...`);
        
        // Use LLM to search web and find articles
        const searchResult = await searchAndSummarizeNewsWithRetry(key);
        
        // Convert search results to NewsArticle format
        const articles: NewsArticle[] = searchResult.articles.map(article => ({
          title: article.title,
          url: article.url,
          snippet: article.snippet,
          source: article.source,
          publishedDate: article.publishedDate,
        }));

        console.log(`✓ Found ${articles.length} articles for ${key}`);

        // Step 2: Generate detailed summary using LLM
        if (articles.length > 0) {
          console.log(`Generating detailed summary for ${key}...`);
          const detailedSummary = await summarizeWeeklyNewsWithRetry(key, articles);
          
          summaries[key] = {
            category: key,
            summaryShort: detailedSummary.summaryShort,
            summaryDetailed: detailedSummary.summaryDetailed,
            bullets: detailedSummary.bullets,
            sources: articles,
            keywords: detailedSummary.keywords,
          };

          // Collect keywords
          allKeywords.push(...detailedSummary.keywords);
          
          console.log(`✓ ${key} summary generated`);
        } else {
          // Fallback if no articles found
          summaries[key] = {
            category: key,
            summaryShort: searchResult.summary || `No major ${key} news this week.`,
            summaryDetailed: `We couldn't find significant ${key} news stories this week. This may be due to limited news coverage or search limitations.`,
            bullets: ['No major developments this week'],
            sources: [],
            keywords: searchResult.keywords || ['News', 'Updates'],
          };
          
          allKeywords.push(...(searchResult.keywords || []));
        }
      } catch (error) {
        console.error(`Failed to process ${key}:`, error);
        // Create a fallback summary on error
        summaries[key] = {
          category: key,
          summaryShort: `Unable to fetch ${key} news at this time.`,
          summaryDetailed: `We encountered an error while searching for ${key} news. Please try again later.`,
          bullets: ['Error fetching news'],
          sources: [],
          keywords: ['Error'],
        };
      }
    }

    // Step 3: Calculate week start (Monday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Get previous Monday
    const weekOf = new Date(now);
    weekOf.setDate(now.getDate() + diff);
    weekOf.setHours(0, 0, 0, 0);

    // Step 4: Save to database
    console.log('Step 3: Saving to database...');
    const weeklyNews = await prisma.weeklyNews.upsert({
      where: {
        weekOf: weekOf,
      },
      update: {
        techSummary: summaries.tech!.summaryShort,
        techDetailed: summaries.tech!.summaryDetailed,
        techBullets: JSON.parse(JSON.stringify(summaries.tech!.bullets)),
        techSources: JSON.parse(JSON.stringify(summaries.tech!.sources)),
        techKeywords: JSON.parse(JSON.stringify(summaries.tech!.keywords)),

        politicsSummary: summaries.politics!.summaryShort,
        politicsDetailed: summaries.politics!.summaryDetailed,
        politicsBullets: JSON.parse(JSON.stringify(summaries.politics!.bullets)),
        politicsSources: JSON.parse(JSON.stringify(summaries.politics!.sources)),
        politicsKeywords: JSON.parse(JSON.stringify(summaries.politics!.keywords)),

        economySummary: summaries.economy!.summaryShort,
        economyDetailed: summaries.economy!.summaryDetailed,
        economyBullets: JSON.parse(JSON.stringify(summaries.economy!.bullets)),
        economySources: JSON.parse(JSON.stringify(summaries.economy!.sources)),
        economyKeywords: JSON.parse(JSON.stringify(summaries.economy!.keywords)),

        sfLocalSummary: summaries['sf-local']!.summaryShort,
        sfLocalDetailed: summaries['sf-local']!.summaryDetailed,
        sfLocalBullets: JSON.parse(JSON.stringify(summaries['sf-local']!.bullets)),
        sfLocalSources: JSON.parse(JSON.stringify(summaries['sf-local']!.sources)),
        sfLocalKeywords: JSON.parse(JSON.stringify(summaries['sf-local']!.keywords)),

        weeklyKeywords: JSON.parse(JSON.stringify(allKeywords)),
        updatedAt: new Date(),
      },
      create: {
        weekOf: weekOf,
        techSummary: summaries.tech!.summaryShort,
        techDetailed: summaries.tech!.summaryDetailed,
        techBullets: JSON.parse(JSON.stringify(summaries.tech!.bullets)),
        techSources: JSON.parse(JSON.stringify(summaries.tech!.sources)),
        techKeywords: JSON.parse(JSON.stringify(summaries.tech!.keywords)),
        
        politicsSummary: summaries.politics!.summaryShort,
        politicsDetailed: summaries.politics!.summaryDetailed,
        politicsBullets: JSON.parse(JSON.stringify(summaries.politics!.bullets)),
        politicsSources: JSON.parse(JSON.stringify(summaries.politics!.sources)),
        politicsKeywords: JSON.parse(JSON.stringify(summaries.politics!.keywords)),
        
        economySummary: summaries.economy!.summaryShort,
        economyDetailed: summaries.economy!.summaryDetailed,
        economyBullets: JSON.parse(JSON.stringify(summaries.economy!.bullets)),
        economySources: JSON.parse(JSON.stringify(summaries.economy!.sources)),
        economyKeywords: JSON.parse(JSON.stringify(summaries.economy!.keywords)),
        
        sfLocalSummary: summaries['sf-local']!.summaryShort,
        sfLocalDetailed: summaries['sf-local']!.summaryDetailed,
        sfLocalBullets: JSON.parse(JSON.stringify(summaries['sf-local']!.bullets)),
        sfLocalSources: JSON.parse(JSON.stringify(summaries['sf-local']!.sources)),
        sfLocalKeywords: JSON.parse(JSON.stringify(summaries['sf-local']!.keywords)),

        weeklyKeywords: JSON.parse(JSON.stringify(allKeywords)),
      },
    });

    console.log('✓ Weekly news saved to database');

    return NextResponse.json({
      success: true,
      message: 'Weekly news generated successfully',
      weekOf: weekOf.toISOString(),
      id: weeklyNews.id,
      summaries: {
        tech: {
          articlesCount: summaries.tech?.sources.length || 0,
          keywords: summaries.tech!.keywords,
        },
        politics: {
          articlesCount: summaries.politics?.sources.length || 0,
          keywords: summaries.politics!.keywords,
        },
        economy: {
          articlesCount: summaries.economy?.sources.length || 0,
          keywords: summaries.economy!.keywords,
        },
        'sf-local': {
          articlesCount: summaries['sf-local']?.sources.length || 0,
          keywords: summaries['sf-local']!.keywords,
        },
      },
      allKeywords: allKeywords,
    });
  } catch (error) {
    console.error('Test weekly news generation failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes for scraping and LLM calls

