/**
 * Script to seed REAL news for weeks 37-43 (Sep 8 - Oct 25, 2025)
 * 
 * This fetches actual SF news and generates AI summaries
 */

import { prisma } from '../lib/prisma';
import { fetchNewsWithFallback } from '../lib/news-api';
import { summarizeWeeklyNewsWithRetry } from '../lib/llm';
import type { NewsArticle } from '../lib/types';

// Weeks 37-43 (7 weeks total)
const WEEKS_TO_GENERATE = [
  { weekOf: '2025-09-08', fromDate: '2025-09-08', weekNum: 37 }, // Week 37
  { weekOf: '2025-09-15', fromDate: '2025-09-15', weekNum: 38 }, // Week 38
  { weekOf: '2025-09-22', fromDate: '2025-09-22', weekNum: 39 }, // Week 39
  { weekOf: '2025-09-29', fromDate: '2025-09-29', weekNum: 40 }, // Week 40
  { weekOf: '2025-10-06', fromDate: '2025-10-06', weekNum: 41 }, // Week 41
  { weekOf: '2025-10-13', fromDate: '2025-10-13', weekNum: 42 }, // Week 42
  { weekOf: '2025-10-20', fromDate: '2025-10-20', weekNum: 43 }, // Week 43 (current)
];

async function generateCategorySummary(
  articles: NewsArticle[],
  category: 'tech' | 'politics' | 'economy' | 'sf-local'
): Promise<{
  summaryShort: string;
  summaryDetailed: string;
  bullets: string[];
  keywords: string[];
}> {
  try {
    const result = await summarizeWeeklyNewsWithRetry(category, articles);
    return {
      summaryShort: result.summaryShort,
      summaryDetailed: result.summaryDetailed,
      bullets: result.bullets,
      keywords: result.keywords,
    };
  } catch (error) {
    console.error(`Error generating summary for ${category}:`, error);
    throw error;
  }
}

async function generateWeeklyNews(weekOf: string, fromDate: string, weekNum: number) {
  console.log(`\n📅 Week ${weekNum}: Generating news for ${weekOf}...`);

  try {
    // Check if week already exists
    const existing = await prisma.weeklyNews.findUnique({
      where: { weekOf: new Date(weekOf) },
    });

    if (existing && existing.techSources && (existing.techSources as any[]).length > 1) {
      console.log(`✓ Week ${weekNum} already has real data, skipping...`);
      return;
    }

    if (existing) {
      // Delete mock data
      await prisma.weeklyNews.delete({ where: { id: existing.id } });
      console.log(`  Removed mock data for week ${weekNum}`);
    }

    // Fetch REAL news for all categories
    console.log('  Fetching real articles from NewsAPI & Google RSS...');
    const [techArticles, politicsArticles, economyArticles, sfLocalArticles] = await Promise.all([
      fetchNewsWithFallback('tech', fromDate).catch(() => []),
      fetchNewsWithFallback('politics', fromDate).catch(() => []),
      fetchNewsWithFallback('economy', fromDate).catch(() => []),
      fetchNewsWithFallback('sf-local', fromDate).catch(() => []),
    ]);

    console.log(`  Articles found: Tech(${techArticles.length}), Politics(${politicsArticles.length}), Economy(${economyArticles.length}), SF-Local(${sfLocalArticles.length})`);

    if (techArticles.length === 0 && politicsArticles.length === 0) {
      console.log(`  ⚠️  No articles found for week ${weekNum}, skipping...`);
      return;
    }

    // Generate AI summaries
    console.log('  Generating AI summaries with Novita...');
    const [tech, politics, economy, sfLocal] = await Promise.all([
      techArticles.length > 0 ? generateCategorySummary(techArticles, 'tech') : null,
      politicsArticles.length > 0 ? generateCategorySummary(politicsArticles, 'politics') : null,
      economyArticles.length > 0 ? generateCategorySummary(economyArticles, 'economy') : null,
      sfLocalArticles.length > 0 ? generateCategorySummary(sfLocalArticles, 'sf-local') : null,
    ]);

    // Use fallback for categories with no articles
    const fallback = {
      summaryShort: `San Francisco news for this week (Week ${weekNum}).`,
      summaryDetailed: `News coverage for San Francisco during this period.`,
      bullets: ['Key developments in San Francisco'],
      keywords: ['San Francisco', 'Bay Area'],
    };

    const techData = tech || fallback;
    const politicsData = politics || fallback;
    const economyData = economy || fallback;
    const sfLocalData = sfLocal || fallback;

    // Aggregate weekly keywords
    const allKeywords = [
      ...techData.keywords,
      ...politicsData.keywords,
      ...economyData.keywords,
      ...sfLocalData.keywords,
    ];
    
    const keywordCounts = allKeywords.reduce((acc, keyword) => {
      acc[keyword] = (acc[keyword] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const weeklyKeywords = Object.entries(keywordCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([keyword]) => keyword);

    // Save to database
    console.log('  Saving to database...');
    await prisma.weeklyNews.create({
      data: {
        weekOf: new Date(weekOf),
        
        techSummary: techData.summaryShort,
        techDetailed: techData.summaryDetailed,
        techBullets: techData.bullets,
        techSources: techArticles.slice(0, 10),
        techKeywords: techData.keywords,
        
        politicsSummary: politicsData.summaryShort,
        politicsDetailed: politicsData.summaryDetailed,
        politicsBullets: politicsData.bullets,
        politicsSources: politicsArticles.slice(0, 10),
        politicsKeywords: politicsData.keywords,
        
        economySummary: economyData.summaryShort,
        economyDetailed: economyData.summaryDetailed,
        economyBullets: economyData.bullets,
        economySources: economyArticles.slice(0, 10),
        economyKeywords: economyData.keywords,
        
        sfLocalSummary: sfLocalData.summaryShort,
        sfLocalDetailed: sfLocalData.summaryDetailed,
        sfLocalBullets: sfLocalData.bullets,
        sfLocalSources: sfLocalArticles.slice(0, 10),
        sfLocalKeywords: sfLocalData.keywords,
        
        weeklyKeywords,
      },
    });

    console.log(`✓ Week ${weekNum} completed!`);
  } catch (error) {
    console.error(`✗ Error generating week ${weekNum}:`, error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting REAL news generation for weeks 37-43...');
  console.log(`📊 Generating 7 weeks of SF news`);
  console.log('⏱️  This will take 10-15 minutes due to API rate limits...\n');

  // First, remove week 36 if it exists
  const week36 = await prisma.weeklyNews.findFirst({
    where: { weekOf: new Date('2025-09-02') }
  });
  if (week36) {
    await prisma.weeklyNews.delete({ where: { id: week36.id } });
    console.log('✓ Removed week 36 (Sep 2)\n');
  }

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const week of WEEKS_TO_GENERATE) {
    try {
      await generateWeeklyNews(week.weekOf, week.fromDate, week.weekNum);
      successCount++;
      
      // Add delay between weeks to avoid rate limiting
      if (successCount < WEEKS_TO_GENERATE.length) {
        console.log('  ⏳ Waiting 90 seconds before next week...');
        await new Promise(resolve => setTimeout(resolve, 90000));
      }
    } catch (error) {
      errorCount++;
      console.error(`✗ Failed week ${week.weekNum}:`, error);
      // Continue with next week
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY:');
  console.log(`  ✓ Successfully generated: ${successCount} weeks`);
  console.log(`  ⊘ Skipped: ${skipCount} weeks`);
  console.log(`  ✗ Errors: ${errorCount} weeks`);
  console.log('='.repeat(60));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

