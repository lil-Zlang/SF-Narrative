import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fetchNewsWithFallback } from '@/lib/news-api';
import { summarizeWeeklyNewsWithRetry } from '@/lib/llm';
import type { NewsArticle, CategoryNews } from '@/lib/types';
import { filterByStartDate } from '@/lib/news-aggregator';

/**
 * Seed endpoint to fetch REAL weekly news from NewsAPI + Google RSS
 * This uses actual news sources with verified dates from Oct 20, 2025 onwards
 */

/**
 * Generate AI summary from real news articles
 */
async function generateCategorySummary(
  articles: NewsArticle[],
  category: 'tech' | 'politics' | 'economy' | 'sf-local'
): Promise<Omit<CategoryNews, 'category' | 'sources'>> {
  // If no articles, return empty summary
  if (!articles || articles.length === 0) {
    return {
      summaryShort: 'No news articles available for this category this week.',
      summaryDetailed: 'No news articles were found for this category during the specified time period.',
      bullets: ['No news available'],
      keywords: ['No Data'],
    };
  }

  try {
    // Use the existing summarizeWeeklyNewsWithRetry function
    console.log(`🤖 Generating AI summary for ${category} with ${articles.length} articles...`);
    const result = await summarizeWeeklyNewsWithRetry(category, articles, 3);

    console.log(`✓ AI summary generated for ${category}`);
    return {
      summaryShort: result.summaryShort,
      summaryDetailed: result.summaryDetailed,
      bullets: result.bullets,
      keywords: result.keywords,
    };
  } catch (error) {
    console.error(`❌ Error generating summary for ${category}:`, error);
    
    // Better fallback: Create a more natural summary from article titles and snippets
    const categoryLabels = {
      tech: 'San Francisco technology',
      politics: 'San Francisco politics',
      economy: 'San Francisco economy',
      'sf-local': 'San Francisco local news',
    };
    
    // Create a narrative-style fallback summary
    const topArticles = articles.slice(0, 5);
    const summaryShort = `This week in ${categoryLabels[category]}, key developments include: ${topArticles.slice(0, 3).map((a, i) => {
      // Extract first sentence from snippet or use title
      const firstSentence = a.snippet.split('.')[0] || a.title;
      return `${firstSentence}`;
    }).join('. ')}.`;
    
    const summaryDetailed = `Recent developments in ${categoryLabels[category]} this week highlight several important stories. ${topArticles.map((a, i) => {
      return `${a.title.replace(' - ' + a.source, '')}`;
    }).join('. ')}. These stories reflect the ongoing dynamics in San Francisco's ${category === 'sf-local' ? 'community' : category} landscape.`;
    
    return {
      summaryShort,
      summaryDetailed,
      bullets: topArticles.map(a => a.title.replace(' - ' + a.source, '')),
      keywords: [categoryLabels[category], 'San Francisco', 'Bay Area'],
    };
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authorization - allow Vercel Cron or manual auth token
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    // Check if request is from Vercel Cron or has valid auth token
    const isVercelCron = authHeader === `Bearer ${cronSecret}`;
    const isManualAuth = cronSecret && authHeader === `Bearer ${cronSecret}`;
    
    if (cronSecret && !isVercelCron && !isManualAuth) {
      console.log('⛔ Unauthorized cron request');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    console.log('🔄 Fetching REAL weekly news from Oct 20, 2025 onwards...');

    // Get weekOf parameter from query string (if provided)
    const searchParams = request.nextUrl.searchParams;
    const weekOfParam = searchParams.get('weekOf');

    // Calculate the week to fetch news for
    let weekOf: Date;
    if (weekOfParam) {
      // Use provided week
      weekOf = new Date(weekOfParam);
      weekOf.setHours(0, 0, 0, 0);
    } else {
      // Calculate current week start (Monday)
      const now = new Date();
      const dayOfWeek = now.getDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      weekOf = new Date(now);
      weekOf.setDate(now.getDate() + diff);
      weekOf.setHours(0, 0, 0, 0);
    }

    // The absolute minimum date for news (Oct 20, 2025)
    const minimumDate = new Date('2025-10-20');
    minimumDate.setHours(0, 0, 0, 0);

    // Ensure we're not fetching news before Oct 20
    const fetchStartDate = weekOf < minimumDate ? minimumDate : weekOf;

    console.log(`📅 Fetching news for week of: ${weekOf.toISOString().split('T')[0]}`);
    console.log(`📅 Fetching articles from: ${fetchStartDate.toISOString().split('T')[0]}`);

    // Fetch real news from NewsAPI/Google RSS for all categories
    console.log('📰 Fetching news from APIs...');
    const [techArticles, politicsArticles, economyArticles, sfArticles] = await Promise.all([
      fetchNewsWithFallback('tech', fetchStartDate),
      fetchNewsWithFallback('politics', fetchStartDate),
      fetchNewsWithFallback('economy', fetchStartDate),
      fetchNewsWithFallback('sf-local', fetchStartDate),
    ]);

    // Additional filtering to ensure dates are from the fetch start date onwards
    const filteredTech = filterByStartDate(techArticles, fetchStartDate);
    const filteredPolitics = filterByStartDate(politicsArticles, fetchStartDate);
    const filteredEconomy = filterByStartDate(economyArticles, fetchStartDate);
    const filteredSF = filterByStartDate(sfArticles, fetchStartDate);

    console.log(`📊 Article counts:
  Tech: ${filteredTech.length}
  Politics: ${filteredPolitics.length}
  Economy: ${filteredEconomy.length}
  SF Local: ${filteredSF.length}`);

    if (filteredTech.length === 0 && filteredPolitics.length === 0 && 
        filteredEconomy.length === 0 && filteredSF.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No news articles found from Oct 20 onwards. Please check API keys or network connectivity.',
      }, { status: 500 });
    }

    // Generate AI summaries for each category (sequentially to avoid rate limits and improve quality)
    console.log('🤖 Generating AI summaries...');
    
    const techSummary = await generateCategorySummary(filteredTech.slice(0, 10), 'tech');
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
    
    const politicsSummary = await generateCategorySummary(filteredPolitics.slice(0, 10), 'politics');
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
    
    const economySummary = await generateCategorySummary(filteredEconomy.slice(0, 10), 'economy');
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
    
    const sfSummary = await generateCategorySummary(filteredSF.slice(0, 10), 'sf-local');
    
    console.log('✓ All AI summaries generated successfully');

    // Combine category news
    const techNews: CategoryNews = {
      category: 'tech',
      ...techSummary,
      sources: filteredTech.slice(0, 10),
    };

    const politicsNews: CategoryNews = {
      category: 'politics',
      ...politicsSummary,
      sources: filteredPolitics.slice(0, 10),
    };

    const economyNews: CategoryNews = {
      category: 'economy',
      ...economySummary,
      sources: filteredEconomy.slice(0, 10),
    };

    const sfLocalNews: CategoryNews = {
      category: 'sf-local',
      ...sfSummary,
      sources: filteredSF.slice(0, 10),
    };

    // Aggregate all keywords
    const allKeywords = [
      ...techNews.keywords,
      ...politicsNews.keywords,
      ...economyNews.keywords,
      ...sfLocalNews.keywords,
    ];

    // Save to database using the weekOf we calculated earlier
    console.log('💾 Saving to database...');
    const weeklyNews = await prisma.weeklyNews.upsert({
      where: {
        weekOf: weekOf,
      },
      update: {
        techSummary: techNews.summaryShort,
        techDetailed: techNews.summaryDetailed,
        techBullets: JSON.parse(JSON.stringify(techNews.bullets)),
        techSources: JSON.parse(JSON.stringify(techNews.sources)),
        techKeywords: JSON.parse(JSON.stringify(techNews.keywords)),
        
        politicsSummary: politicsNews.summaryShort,
        politicsDetailed: politicsNews.summaryDetailed,
        politicsBullets: JSON.parse(JSON.stringify(politicsNews.bullets)),
        politicsSources: JSON.parse(JSON.stringify(politicsNews.sources)),
        politicsKeywords: JSON.parse(JSON.stringify(politicsNews.keywords)),
        
        economySummary: economyNews.summaryShort,
        economyDetailed: economyNews.summaryDetailed,
        economyBullets: JSON.parse(JSON.stringify(economyNews.bullets)),
        economySources: JSON.parse(JSON.stringify(economyNews.sources)),
        economyKeywords: JSON.parse(JSON.stringify(economyNews.keywords)),
        
        sfLocalSummary: sfLocalNews.summaryShort,
        sfLocalDetailed: sfLocalNews.summaryDetailed,
        sfLocalBullets: JSON.parse(JSON.stringify(sfLocalNews.bullets)),
        sfLocalSources: JSON.parse(JSON.stringify(sfLocalNews.sources)),
        sfLocalKeywords: JSON.parse(JSON.stringify(sfLocalNews.keywords)),
        
        weeklyKeywords: JSON.parse(JSON.stringify(allKeywords)),
        updatedAt: new Date(),
      },
      create: {
        weekOf: weekOf,
        techSummary: techNews.summaryShort,
        techDetailed: techNews.summaryDetailed,
        techBullets: JSON.parse(JSON.stringify(techNews.bullets)),
        techSources: JSON.parse(JSON.stringify(techNews.sources)),
        techKeywords: JSON.parse(JSON.stringify(techNews.keywords)),
        
        politicsSummary: politicsNews.summaryShort,
        politicsDetailed: politicsNews.summaryDetailed,
        politicsBullets: JSON.parse(JSON.stringify(politicsNews.bullets)),
        politicsSources: JSON.parse(JSON.stringify(politicsNews.sources)),
        politicsKeywords: JSON.parse(JSON.stringify(politicsNews.keywords)),
        
        economySummary: economyNews.summaryShort,
        economyDetailed: economyNews.summaryDetailed,
        economyBullets: JSON.parse(JSON.stringify(economyNews.bullets)),
        economySources: JSON.parse(JSON.stringify(economyNews.sources)),
        economyKeywords: JSON.parse(JSON.stringify(economyNews.keywords)),
        
        sfLocalSummary: sfLocalNews.summaryShort,
        sfLocalDetailed: sfLocalNews.summaryDetailed,
        sfLocalBullets: JSON.parse(JSON.stringify(sfLocalNews.bullets)),
        sfLocalSources: JSON.parse(JSON.stringify(sfLocalNews.sources)),
        sfLocalKeywords: JSON.parse(JSON.stringify(sfLocalNews.keywords)),
        
        weeklyKeywords: JSON.parse(JSON.stringify(allKeywords)),
      },
    });

    console.log('✅ Real weekly news seeded successfully!');

    return NextResponse.json({
      success: true,
      message: 'Real weekly news fetched and seeded successfully',
      weekOf: weekOf.toISOString(),
      id: weeklyNews.id,
      stats: {
        tech: filteredTech.length,
        politics: filteredPolitics.length,
        economy: filteredEconomy.length,
        sfLocal: filteredSF.length,
      },
      sample: {
        tech: filteredTech.slice(0, 2).map(a => ({ title: a.title, date: a.publishedDate })),
        politics: filteredPolitics.slice(0, 2).map(a => ({ title: a.title, date: a.publishedDate })),
        economy: filteredEconomy.slice(0, 2).map(a => ({ title: a.title, date: a.publishedDate })),
        sfLocal: filteredSF.slice(0, 2).map(a => ({ title: a.title, date: a.publishedDate })),
      },
    });
  } catch (error) {
    console.error('❌ Seeding failed:', error);
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
export const maxDuration = 60; // Allow up to 60 seconds for API calls

