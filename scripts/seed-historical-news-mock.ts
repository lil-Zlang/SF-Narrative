/**
 * Script to seed MOCK historical weekly news data from Sep 1 to Oct 20, 2025
 * 
 * This generates mock SF news data for quick testing of the calendar view
 * Use this for development, seed-historical-news.ts for real data
 */

import { prisma } from '../lib/prisma';

// Week dates from Sep 1 to Oct 13, 2025 (7 weeks before Oct 20)
const WEEKS_TO_GENERATE = [
  { weekOf: '2025-09-01', label: 'Labor Day Weekend' },
  { weekOf: '2025-09-08', label: 'Tech Conference Week' },
  { weekOf: '2025-09-15', label: 'Mid-September' },
  { weekOf: '2025-09-22', label: 'Autumn Begins' },
  { weekOf: '2025-09-29', label: 'Q4 Starts' },
  { weekOf: '2025-10-06', label: 'Fleet Week' },
  { weekOf: '2025-10-13', label: 'Mid-October' },
];

const MOCK_SOURCES = [
  { url: 'https://sfchronicle.com/', title: 'SF Chronicle Report', source: 'SF Chronicle', snippet: 'Details from the San Francisco Chronicle', publishedDate: new Date().toISOString() },
  { url: 'https://sfgate.com/', title: 'SFGATE Coverage', source: 'SFGATE', snippet: 'Coverage from SFGATE', publishedDate: new Date().toISOString() },
  { url: 'https://missionlocal.org/', title: 'Mission Local Update', source: 'Mission Local', snippet: 'Local reporting from Mission Local', publishedDate: new Date().toISOString() },
];

function generateMockNews(weekOf: string, category: string, label: string) {
  const date = new Date(weekOf);
  const monthName = date.toLocaleString('en-US', { month: 'long' });
  const dayNum = date.getDate();
  
  return {
    summaryShort: `San Francisco's ${category} landscape during ${label} (week of ${monthName} ${dayNum}). Key developments across the Bay Area shaped local discussions and community priorities.`,
    
    summaryDetailed: `During the week of ${monthName} ${dayNum}, 2025, San Francisco's ${category} sector experienced significant activity. Local stakeholders engaged with emerging challenges while city leadership worked to address pressing community concerns. Bay Area residents responded to various initiatives, demonstrating the city's resilient and engaged civic culture. These developments reflect ongoing trends in San Francisco's evolving ${category} landscape, with implications for future policy decisions and community well-being.`,
    
    bullets: [
      `Major ${category} initiative launched in San Francisco`,
      `Community response highlighted Bay Area priorities`,
      `City leaders announced new ${category} policy proposals`,
      `Local businesses and residents adapted to changing conditions`,
      `Regional collaboration strengthened across SF neighborhoods`,
    ],
    
    keywords: [
      `SF ${category}`,
      'Bay Area Community',
      'San Francisco Policy',
      `${monthName} 2025`,
      'Local Development',
    ],
  };
}

async function main() {
  console.log('🚀 Starting MOCK historical news generation...');
  console.log(`📊 Generating ${WEEKS_TO_GENERATE.length} weeks of mock data`);
  console.log('⚡ This should complete in under a minute...\n');

  let successCount = 0;
  let skipCount = 0;

  for (const week of WEEKS_TO_GENERATE) {
    console.log(`📅 Processing week of ${week.weekOf} (${week.label})...`);

    try {
      // Check if week already exists
      const existing = await prisma.weeklyNews.findUnique({
        where: { weekOf: new Date(week.weekOf) },
      });

      if (existing) {
        skipCount++;
        console.log(`  ✓ Already exists, skipping...`);
        continue;
      }

      // Generate mock data for each category
      const tech = generateMockNews(week.weekOf, 'Technology', week.label);
      const politics = generateMockNews(week.weekOf, 'Politics', week.label);
      const economy = generateMockNews(week.weekOf, 'Economy', week.label);
      const sfLocal = generateMockNews(week.weekOf, 'Local Affairs', week.label);

      // Aggregate weekly keywords
      const weeklyKeywords = [
        ...tech.keywords,
        ...politics.keywords.slice(0, 3),
        ...economy.keywords.slice(0, 3),
        ...sfLocal.keywords.slice(0, 3),
      ];

      // Save to database
      await prisma.weeklyNews.create({
        data: {
          weekOf: new Date(week.weekOf),
          
          techSummary: tech.summaryShort,
          techDetailed: tech.summaryDetailed,
          techBullets: tech.bullets,
          techSources: MOCK_SOURCES,
          techKeywords: tech.keywords,
          
          politicsSummary: politics.summaryShort,
          politicsDetailed: politics.summaryDetailed,
          politicsBullets: politics.bullets,
          politicsSources: MOCK_SOURCES,
          politicsKeywords: politics.keywords,
          
          economySummary: economy.summaryShort,
          economyDetailed: economy.summaryDetailed,
          economyBullets: economy.bullets,
          economySources: MOCK_SOURCES,
          economyKeywords: economy.keywords,
          
          sfLocalSummary: sfLocal.summaryShort,
          sfLocalDetailed: sfLocal.summaryDetailed,
          sfLocalBullets: sfLocal.bullets,
          sfLocalSources: MOCK_SOURCES,
          sfLocalKeywords: sfLocal.keywords,
          
          weeklyKeywords,
        },
      });

      successCount++;
      console.log(`  ✓ Successfully created`);
    } catch (error) {
      console.error(`  ✗ Error:`, error);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY:');
  console.log(`  ✓ Successfully generated: ${successCount} weeks`);
  console.log(`  ⊘ Skipped (already exist): ${skipCount} weeks`);
  console.log('='.repeat(60));
  console.log('\n🎉 Mock historical data generation complete!');
  console.log('💡 You can now test the week selector with 8 weeks of data');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

