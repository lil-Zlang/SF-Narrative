/**
 * Script to seed historical weekly news data from Sep 1 to Oct 20, 2025
 * 
 * This generates realistic SF news data for each week to populate the calendar view
 */

import { prisma } from '../lib/prisma';
import { fetchNewsWithFallback } from '../lib/news-api';
import { summarizeWeeklyNewsWithRetry } from '../lib/llm';
import type { NewsArticle } from '../lib/types';

// Week dates from Sep 1 to Oct 20, 2025 (8 weeks total)
const WEEKS_TO_GENERATE = [
  { weekOf: '2025-09-01', fromDate: '2025-09-01' },
  { weekOf: '2025-09-08', fromDate: '2025-09-08' },
  { weekOf: '2025-09-15', fromDate: '2025-09-15' },
  { weekOf: '2025-09-22', fromDate: '2025-09-22' },
  { weekOf: '2025-09-29', fromDate: '2025-09-29' },
  { weekOf: '2025-10-06', fromDate: '2025-10-06' },
  { weekOf: '2025-10-13', fromDate: '2025-10-13' },
  { weekOf: '2025-10-20', fromDate: '2025-10-20' }, // Already exists, but included for completeness
];

/**
 * Generate AI summary for a category
 */
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
    
    // Fallback to simple generation
    return {
      summaryShort: `San Francisco ${category} news from this week. Multiple developments across the Bay Area.`,
      summaryDetailed: `This week saw various developments in San Francisco's ${category} sector. Local communities and businesses continued to navigate changing conditions while city leaders worked on addressing key challenges facing residents.`,
      bullets: [
        `Key ${category} development in San Francisco`,
        'Local community response and engagement',
        'Ongoing policy discussions and initiatives',
      ],
      keywords: [`SF ${category}`, 'Bay Area', 'San Francisco'],
    };
  }
}

/**
 * Generate news for a single week
 */
async function generateWeeklyNews(weekOf: string, fromDate: string) {
  console.log(`\n📅 Generating news for week of ${weekOf}...`);

  try {
    // Check if week already exists
    const existing = await prisma.weeklyNews.findUnique({
      where: { weekOf: new Date(weekOf) },
    });

    if (existing) {
      console.log(`✓ Week ${weekOf} already exists, skipping...`);
      return;
    }

    // Fetch news for all categories
    console.log('  Fetching articles...');
    const [techArticles, politicsArticles, economyArticles, sfLocalArticles] = await Promise.all([
      fetchNewsWithFallback('tech', fromDate),
      fetchNewsWithFallback('politics', fromDate),
      fetchNewsWithFallback('economy', fromDate),
      fetchNewsWithFallback('sf-local', fromDate),
    ]);

    console.log(`  Found: Tech(${techArticles.length}), Politics(${politicsArticles.length}), Economy(${economyArticles.length}), SF-Local(${sfLocalArticles.length})`);

    // Generate AI summaries
    console.log('  Generating AI summaries...');
    const [tech, politics, economy, sfLocal] = await Promise.all([
      generateCategorySummary(techArticles, 'tech'),
      generateCategorySummary(politicsArticles, 'politics'),
      generateCategorySummary(economyArticles, 'economy'),
      generateCategorySummary(sfLocalArticles, 'sf-local'),
    ]);

    // Aggregate weekly keywords
    const allKeywords = [
      ...tech.keywords,
      ...politics.keywords,
      ...economy.keywords,
      ...sfLocal.keywords,
    ];
    
    // Get unique keywords, sorted by frequency
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
        
        techSummary: tech.summaryShort,
        techDetailed: tech.summaryDetailed,
        techBullets: tech.bullets,
        techSources: techArticles.slice(0, 10),
        techKeywords: tech.keywords,
        
        politicsSummary: politics.summaryShort,
        politicsDetailed: politics.summaryDetailed,
        politicsBullets: politics.bullets,
        politicsSources: politicsArticles.slice(0, 10),
        politicsKeywords: politics.keywords,
        
        economySummary: economy.summaryShort,
        economyDetailed: economy.summaryDetailed,
        economyBullets: economy.bullets,
        economySources: economyArticles.slice(0, 10),
        economyKeywords: economy.keywords,
        
        sfLocalSummary: sfLocal.summaryShort,
        sfLocalDetailed: sfLocal.summaryDetailed,
        sfLocalBullets: sfLocal.bullets,
        sfLocalSources: sfLocalArticles.slice(0, 10),
        sfLocalKeywords: sfLocal.keywords,
        
        weeklyKeywords,
      },
    });

    console.log(`✓ Successfully generated news for week of ${weekOf}`);
  } catch (error) {
    console.error(`✗ Error generating week ${weekOf}:`, error);
    throw error;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting historical news generation...');
  console.log(`📊 Generating ${WEEKS_TO_GENERATE.length} weeks of data`);
  console.log('⏱️  This may take 10-20 minutes due to API rate limits...\n');

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const week of WEEKS_TO_GENERATE) {
    try {
      const existing = await prisma.weeklyNews.findUnique({
        where: { weekOf: new Date(week.weekOf) },
      });

      if (existing) {
        skipCount++;
        console.log(`✓ Week ${week.weekOf} already exists, skipping...`);
        continue;
      }

      await generateWeeklyNews(week.weekOf, week.fromDate);
      successCount++;
      
      // Add delay between weeks to avoid rate limiting
      if (successCount < WEEKS_TO_GENERATE.length) {
        console.log('  ⏳ Waiting 30 seconds before next week...');
        await new Promise(resolve => setTimeout(resolve, 30000));
      }
    } catch (error) {
      errorCount++;
      console.error(`✗ Failed to generate week ${week.weekOf}:`, error);
      // Continue with next week
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY:');
  console.log(`  ✓ Successfully generated: ${successCount} weeks`);
  console.log(`  ⊘ Skipped (already exist): ${skipCount} weeks`);
  console.log(`  ✗ Errors: ${errorCount} weeks`);
  console.log('='.repeat(60));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

