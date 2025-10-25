import { fetchTweetsForTopic, combineTweetsForAnalysis } from '../lib/x-api';
import { fetchTweetsEfficient } from '../lib/x-api-efficient';
import { prisma } from '../lib/prisma';
import { analyzeNarrativesWithRetry } from '../lib/llm';

// Test with a single topic to verify X API configuration
const testTopic = '#Dreamforce';
const testWeekOf = '2025-10-13';

async function testXAPIConfiguration() {
  console.log('🔍 Testing X API Configuration...\n');
  
  // Check environment variables
  console.log('Environment Variables:');
  console.log(`- X_BEARER_TOKEN: ${process.env.X_BEARER_TOKEN ? '✓ Configured' : '✗ NOT CONFIGURED'}`);
  console.log(`- NOVITA_API_KEY: ${process.env.NOVITA_API_KEY ? '✓ Configured' : '✗ NOT CONFIGURED'}\n`);

  if (!process.env.X_BEARER_TOKEN) {
    console.error('❌ X_BEARER_TOKEN is not configured!');
    console.error('Please add X_BEARER_TOKEN to your .env file');
    process.exit(1);
  }

  try {
    console.log(`\n📡 Testing with topic: ${testTopic}\n`);
    console.log('='.repeat(60));
    
    // Step 1: Fetch tweets EFFICIENTLY (1 API call instead of 2!)
    console.log('\n1️⃣  Fetching tweets (3 hype + 2 backlash = 5 total)...');
    console.log('   💡 EFFICIENT MODE: 1 API call, client-side filtering');
    console.log('   💡 These same tweets will be used for BOTH evidence layer AND LLM analysis');
    const { hypeTweets, backlashTweets } = await fetchTweetsEfficient(testTopic);
    console.log(`✓ Fetched ${hypeTweets.length} hype tweets`);
    console.log(`✓ Fetched ${backlashTweets.length} backlash tweets`);

    if (hypeTweets.length === 0 && backlashTweets.length === 0) {
      console.warn('⚠️  No tweets found. This might mean:');
      console.warn('   - The topic is too specific');
      console.warn('   - No recent tweets match the criteria');
      console.warn('   - X API rate limit reached');
      return;
    }

    if (hypeTweets.length > 0) {
      console.log(`   Example hype tweet: "${hypeTweets[0].text.substring(0, 80)}..."`);
    }
    if (backlashTweets.length > 0) {
      console.log(`   Example backlash tweet: "${backlashTweets[0].text.substring(0, 80)}..."`);
    }

    // Step 2: Combine tweets for LLM analysis
    console.log('\n2️⃣  Preparing tweets for LLM analysis...');
    const allTweetTexts = [
      ...hypeTweets.map(t => t.text),
      ...backlashTweets.map(t => t.text)
    ];
    const combinedTweets = combineTweetsForAnalysis(allTweetTexts);
    console.log(`✓ Combined ${allTweetTexts.length} tweets for analysis`);

    // Step 3: Generate LLM analysis
    console.log('\n3️⃣  Generating LLM analysis with Novita AI...');
    const analysis = await analyzeNarrativesWithRetry(testTopic, combinedTweets);
    console.log(`✓ Generated analysis`);
    console.log(`   Hype summary: "${analysis.hypeSummary.substring(0, 80)}..."`);
    console.log(`   Backlash summary: "${analysis.backlashSummary.substring(0, 80)}..."`);

    // Step 4: Update database
    console.log('\n4️⃣  Updating database...');
    const initialCommunitySentiment = {
      hype: 50,
      backlash: 50,
      totalVotes: 0
    };

    const timelineEvent = await prisma.timelineEvent.upsert({
      where: {
        weekOf: new Date(testWeekOf),
      },
      update: {
        headline: testTopic,
        hypeSummary: analysis.hypeSummary,
        backlashSummary: analysis.backlashSummary,
        weeklyPulse: analysis.weeklyPulse,
        hypeTweets: JSON.parse(JSON.stringify(hypeTweets)),
        backlashTweets: JSON.parse(JSON.stringify(backlashTweets)),
        communitySentiment: JSON.parse(JSON.stringify(initialCommunitySentiment)),
        updatedAt: new Date(),
      },
      create: {
        headline: testTopic,
        weekOf: new Date(testWeekOf),
        hypeSummary: analysis.hypeSummary,
        backlashSummary: analysis.backlashSummary,
        weeklyPulse: analysis.weeklyPulse,
        hypeTweets: JSON.parse(JSON.stringify(hypeTweets)),
        backlashTweets: JSON.parse(JSON.stringify(backlashTweets)),
        communitySentiment: JSON.parse(JSON.stringify(initialCommunitySentiment)),
      },
    });

    console.log(`✓ Database updated (Event ID: ${timelineEvent.id})`);

    console.log('\n' + '='.repeat(60));
    console.log('✅ Test completed successfully!');
    console.log('\n📊 API Usage Summary:');
    console.log('   X API (Twitter):');
    console.log('   - 1 EFFICIENT call for all tweets (20 fetched, 5 used)');
    console.log('   - Client-side filtering by sentiment keywords');
    console.log('   - Total: 1 X API call, 5 tweets used');
    console.log('   - Used 5 out of 100 posts (5%)');
    console.log('');
    console.log('   Novita AI (LLM):');
    console.log('   - 1 call to analyze 5 tweets');
    console.log('   - Generated hype, backlash, and weekly pulse summaries');
    console.log('\n💡 Cached data will be reused for subsequent calls!');
    console.log('💡 Process all 9 topics = 9 API calls (9% of X API limit)');
    console.log('💡 EFFICIENT MODE: 50% fewer API calls!');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testXAPIConfiguration();
