import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { NewsArticle, CategoryNews } from '@/lib/types';

/**
 * Seed endpoint to create mock weekly news for testing
 * This bypasses scraping and uses hardcoded sample data
 */
export async function GET(request: NextRequest) {
  try {
    console.log('Seeding weekly news with mock data...');

    // Mock news articles for each category
    const mockTechArticles: NewsArticle[] = [
      {
        title: 'OpenAI Releases GPT-5 with Revolutionary Reasoning Capabilities',
        url: 'https://techcrunch.com/gpt5-release',
        snippet: 'OpenAI has unveiled GPT-5, marking a significant leap in AI reasoning and multimodal understanding.',
        publishedDate: new Date().toISOString(),
        source: 'TechCrunch',
      },
      {
        title: 'Apple Announces Vision Pro 2 at Lower Price Point',
        url: 'https://theverge.com/vision-pro-2',
        snippet: 'Apple aims to make spatial computing more accessible with the Vision Pro 2 at $2,499.',
        publishedDate: new Date().toISOString(),
        source: 'The Verge',
      },
      {
        title: 'Meta Unveils New AR Glasses with Real-Time Translation',
        url: 'https://techcrunch.com/meta-ar-glasses',
        snippet: 'Meta\'s latest AR glasses feature real-time language translation powered by advanced AI.',
        publishedDate: new Date().toISOString(),
        source: 'TechCrunch',
      },
    ];

    const mockPoliticsArticles: NewsArticle[] = [
      {
        title: 'Senate Passes Landmark Climate Legislation',
        url: 'https://reuters.com/climate-bill',
        snippet: 'The Senate approved sweeping climate legislation with bipartisan support.',
        publishedDate: new Date().toISOString(),
        source: 'Reuters',
      },
      {
        title: 'Supreme Court to Hear Major Tech Regulation Case',
        url: 'https://reuters.com/tech-regulation',
        snippet: 'The Supreme Court will review federal tech regulation authority in landmark case.',
        publishedDate: new Date().toISOString(),
        source: 'Reuters',
      },
    ];

    const mockEconomyArticles: NewsArticle[] = [
      {
        title: 'Fed Holds Interest Rates Steady as Inflation Moderates',
        url: 'https://reuters.com/fed-rates',
        snippet: 'The Federal Reserve maintained current interest rates citing progress on inflation.',
        publishedDate: new Date().toISOString(),
        source: 'Reuters Business',
      },
      {
        title: 'Tech Stocks Rally on Strong Earnings Reports',
        url: 'https://reuters.com/tech-earnings',
        snippet: 'Major tech companies exceeded earnings expectations, driving market gains.',
        publishedDate: new Date().toISOString(),
        source: 'Reuters Business',
      },
    ];

    const mockSFArticles: NewsArticle[] = [
      {
        title: 'SF Launches New Affordable Housing Initiative in Mission District',
        url: 'https://sfstandard.com/housing-initiative',
        snippet: 'San Francisco announces major affordable housing development in the Mission.',
        publishedDate: new Date().toISOString(),
        source: 'San Francisco Standard',
      },
      {
        title: 'BART Unveils Plans for New Downtown Transit Hub',
        url: 'https://sfstandard.com/bart-hub',
        snippet: 'BART reveals designs for a modern transit hub to improve downtown connectivity.',
        publishedDate: new Date().toISOString(),
        source: 'San Francisco Standard',
      },
      {
        title: 'Golden Gate Park to Host Major Tech Innovation Festival',
        url: 'https://sfstandard.com/tech-festival',
        snippet: 'A new tech innovation festival will showcase SF startups in Golden Gate Park.',
        publishedDate: new Date().toISOString(),
        source: 'San Francisco Standard',
      },
    ];

    // Create mock summaries (these would normally come from LLM)
    const techNews: CategoryNews = {
      category: 'tech',
      summaryShort: 'This week saw major AI breakthroughs with OpenAI\'s GPT-5 launch, Apple making spatial computing more accessible with Vision Pro 2, and Meta pushing AR boundaries with real-time translation glasses. The tech industry continues its rapid evolution with AI and immersive technologies leading the charge.',
      summaryDetailed: 'The technology sector experienced a transformative week marked by groundbreaking AI developments and augmented reality innovations. OpenAI\'s release of GPT-5 represents a quantum leap in artificial intelligence capabilities, particularly in reasoning and multimodal understanding, signaling a new era for AI applications across industries. Apple\'s strategic pricing of the Vision Pro 2 at $2,499 demonstrates the company\'s commitment to democratizing spatial computing, potentially accelerating mainstream adoption of mixed reality technologies. Meta\'s AR glasses with real-time translation capabilities showcase the practical applications of AI in consumer devices, breaking down language barriers and expanding global connectivity. These developments collectively highlight how major tech companies are racing to define the future of human-computer interaction, with significant implications for productivity, communication, and entertainment.',
      bullets: [
        'OpenAI\'s GPT-5 introduces revolutionary reasoning capabilities, setting new benchmarks for AI performance',
        'Apple positions Vision Pro 2 at $2,499 to capture mainstream spatial computing market',
        'Meta\'s AR glasses feature real-time language translation powered by advanced AI models',
        'Industry analysts predict 2025 will be the "year of AI agents" across consumer and enterprise sectors',
        'Major tech companies increase AI infrastructure investments by 40% year-over-year',
      ],
      sources: mockTechArticles,
      keywords: ['AI Breakthroughs', 'Spatial Computing', 'AR Innovation'],
    };

    const politicsNews: CategoryNews = {
      category: 'politics',
      summaryShort: 'A productive week in Washington saw the Senate pass landmark climate legislation with rare bipartisan support. Meanwhile, the Supreme Court agreed to hear a major case on tech regulation that could reshape federal authority over the industry for decades.',
      summaryDetailed: 'Political momentum built this week as the Senate achieved a rare bipartisan victory with the passage of comprehensive climate legislation, marking a significant shift in environmental policy. The bill includes substantial investments in renewable energy infrastructure and carbon reduction incentives, reflecting growing consensus on climate action. In a development with far-reaching implications for the tech sector, the Supreme Court announced it will review federal tech regulation authority, a case that could redefine the balance of power between government oversight and industry self-regulation. This decision comes amid ongoing debates about data privacy, antitrust enforcement, and content moderation. The intersection of these developments highlights the complex relationship between policy, technology, and environmental concerns.',
      bullets: [
        'Senate climate bill passes with 68-32 vote, largest bipartisan majority in decades',
        'Legislation allocates $400 billion for renewable energy infrastructure over 10 years',
        'Supreme Court tech regulation case could determine federal oversight authority',
        'Congressional leaders signal willingness to address AI safety and regulation',
        'Bipartisan working group forms to tackle digital privacy legislation',
      ],
      sources: mockPoliticsArticles,
      keywords: ['Climate Action', 'Tech Regulation', 'Bipartisan Progress'],
    };

    const economyNews: CategoryNews = {
      category: 'economy',
      summaryShort: 'The Federal Reserve held interest rates steady as inflation continues to moderate, bringing relief to markets. Tech stocks led a market rally following strong earnings reports, with the NASDAQ reaching new highs for 2025.',
      summaryDetailed: 'Economic indicators painted an optimistic picture this week as the Federal Reserve\'s decision to maintain current interest rates reflected confidence in ongoing inflation moderation. The central bank\'s patient approach has been validated by consistently declining consumer price indices, suggesting a "soft landing" may be achievable. Technology sector earnings exceeded analyst expectations across the board, with major companies reporting robust revenue growth driven by AI product adoption and cloud services expansion. This performance triggered a significant market rally, pushing the NASDAQ to record levels and demonstrating investor confidence in tech-driven economic growth. The combination of stable monetary policy and strong corporate performance suggests resilience in the face of global economic uncertainties.',
      bullets: [
        'Federal Reserve maintains interest rates at 4.5-4.75%, citing inflation progress',
        'Core inflation drops to 2.8%, approaching Fed\'s 2% target',
        'NASDAQ surges 3.2% on strong tech earnings, reaching new 2025 high',
        'Major tech companies report average 18% revenue growth year-over-year',
        'Consumer confidence index rises to highest level since 2021',
      ],
      sources: mockEconomyArticles,
      keywords: ['Fed Policy', 'Market Rally', 'Tech Earnings'],
    };

    const sfLocalNews: CategoryNews = {
      category: 'sf-local',
      summaryShort: 'San Francisco unveiled ambitious plans this week with a new affordable housing initiative in the Mission District, BART\'s modern downtown transit hub design, and preparations for a major tech innovation festival in Golden Gate Park.',
      summaryDetailed: 'San Francisco demonstrated its commitment to addressing urban challenges while celebrating innovation this week. The city\'s new affordable housing initiative in the Mission District represents a $500 million investment to create 2,000 units over the next five years, directly responding to the housing affordability crisis that has defined SF politics for years. BART\'s unveiling of a state-of-the-art downtown transit hub design signals major infrastructure modernization, with features including improved accessibility, retail spaces, and integration with emerging mobility options. The announcement of a tech innovation festival in Golden Gate Park showcases SF\'s ability to balance its tech hub identity with public space accessibility, featuring startup showcases, career fairs, and free educational programs. These developments collectively illustrate San Francisco\'s ongoing evolution as it navigates growth, equity, and innovation.',
      bullets: [
        'Mission District affordable housing initiative to create 2,000 units by 2030',
        '$500 million investment targets families earning 80% or below area median income',
        'BART downtown transit hub design includes accessibility upgrades and retail space',
        'Golden Gate Park tech festival expected to attract 50,000 attendees',
        'City launches new programs connecting tech companies with local workforce development',
      ],
      sources: mockSFArticles,
      keywords: ['Affordable Housing', 'Transit Innovation', 'Tech Festival'],
    };

    // Calculate week start (Monday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const weekOf = new Date(now);
    weekOf.setDate(now.getDate() + diff);
    weekOf.setHours(0, 0, 0, 0);

    // Aggregate all keywords
    const allKeywords = [
      ...techNews.keywords,
      ...politicsNews.keywords,
      ...economyNews.keywords,
      ...sfLocalNews.keywords,
    ];

    // Save to database
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

    console.log('✓ Mock weekly news created successfully');

    return NextResponse.json({
      success: true,
      message: 'Mock weekly news seeded successfully',
      weekOf: weekOf.toISOString(),
      id: weeklyNews.id,
    });
  } catch (error) {
    console.error('Seeding failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';

