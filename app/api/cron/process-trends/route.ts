import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fetchTweetsForTopic, combineTweetsForAnalysis } from '@/lib/x-api';
import { fetchTweetsEfficient } from '@/lib/x-api-efficient';
import { analyzeNarrativesWithRetry } from '@/lib/llm';

// Weekly topics to process
const weeklyTopics = [
  { weekOf: '2025-09-01', topic: '#LaborDayWeekend' },
  { weekOf: '2025-09-08', topic: '#SuperFlexArtFest' },
  { weekOf: '2025-09-15', topic: '#SupervisorRecall' },
  { weekOf: '2025-09-22', topic: '#FolsomStreetFair' },
  { weekOf: '2025-09-29', topic: '#OpenStudios' },
  { weekOf: '2025-10-06', topic: '#FleetWeek' },
  { weekOf: '2025-10-13', topic: '#Dreamforce' },
  { weekOf: '2025-10-20', topic: '#TrumpSFSurge' },
  { weekOf: '2025-10-27', topic: '#HalloweenSF' },
];

export async function POST(request: NextRequest) {
  try {
    // Security: Check for CRON_SECRET
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error('CRON_SECRET is not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error('Unauthorized cron request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Starting trend processing...');

    const results = [];
    const errors = [];

    // Process each weekly topic with rate limiting
    for (const { weekOf, topic } of weeklyTopics) {
      try {
        console.log(`Processing ${topic} for week of ${weekOf}...`);

        // Add delay between requests to avoid rate limiting
        if (results.length > 0) {
          console.log('Waiting 2 seconds to avoid rate limiting...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // Step 1: Fetch tweets EFFICIENTLY (1 API call instead of 2!)
        // Fetch once and filter client-side by sentiment keywords
        // This cuts API usage in HALF: 9 calls instead of 18 for all topics
        console.log(`Fetching tweets for ${topic}...`);
        const { hypeTweets, backlashTweets } = await fetchTweetsEfficient(topic);

        if (hypeTweets.length === 0 && backlashTweets.length === 0) {
          console.warn(`No tweets found for ${topic}, skipping...`);
          errors.push({
            weekOf,
            topic,
            error: 'No tweets found',
          });
          continue;
        }

        console.log(`Fetched ${hypeTweets.length} hype tweets and ${backlashTweets.length} backlash tweets`);

        // Step 2: Combine structured tweets for LLM analysis
        // Extract text from structured tweets for LLM
        const allTweetTexts = [
          ...hypeTweets.map((t: any) => t.text),
          ...backlashTweets.map((t: any) => t.text)
        ];
        const combinedTweets = combineTweetsForAnalysis(allTweetTexts);

        // Step 4: Generate LLM analysis
        const analysis = await analyzeNarrativesWithRetry(topic, combinedTweets);

        console.log(`Generated analysis for ${topic}`);

        // Step 5: Calculate initial community sentiment (will be updated by user votes)
        const initialCommunitySentiment = {
          hype: 50,
          backlash: 50,
          totalVotes: 0
        };

        // Step 6: Upsert to database with evidence layer data
        const timelineEvent = await prisma.timelineEvent.upsert({
          where: {
            weekOf: new Date(weekOf),
          },
          update: {
            headline: topic,
            hypeSummary: analysis.hypeSummary,
            backlashSummary: analysis.backlashSummary,
            weeklyPulse: analysis.weeklyPulse,
            hypeTweets: hypeTweets as any,
            backlashTweets: backlashTweets as any,
            communitySentiment: initialCommunitySentiment as any,
            updatedAt: new Date(),
          },
          create: {
            headline: topic,
            weekOf: new Date(weekOf),
            hypeSummary: analysis.hypeSummary,
            backlashSummary: analysis.backlashSummary,
            weeklyPulse: analysis.weeklyPulse,
            hypeTweets: JSON.parse(JSON.stringify(hypeTweets)),
            backlashTweets: JSON.parse(JSON.stringify(backlashTweets)),
            communitySentiment: JSON.parse(JSON.stringify(initialCommunitySentiment)),
          },
        });

        console.log(`Saved timeline event for ${topic} (ID: ${timelineEvent.id})`);

        results.push({
          weekOf,
          topic,
          status: 'success',
          id: timelineEvent.id,
        });
      } catch (error) {
        console.error(`Error processing ${topic}:`, error);
        errors.push({
          weekOf,
          topic,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    console.log('Trend processing complete');

    return NextResponse.json({
      success: true,
      processed: results.length,
      failed: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Cron job failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Disable body parsing for this route
export const dynamic = 'force-dynamic';

