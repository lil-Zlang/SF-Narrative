import { fetchTweetsForTopic, fetchStructuredTweetsForEvidence } from '../lib/x-api';
import { prisma } from '../lib/prisma';
import { analyzeNarrativesWithRetry } from '../lib/llm';
import { combineTweetsForAnalysis } from '../lib/x-api';

// All 9 weekly topics
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

async function processAllTopics() {
  console.log('🔍 Processing All 9 Topics...\n');
  
  // Check environment variables
  console.log('Environment Variables:');
  console.log(`- X_BEARER_TOKEN: ${process.env.X_BEARER_TOKEN ? '✓ Configured' : '✗ NOT CONFIGURED'}`);
  console.log(`- NOVITA_API_KEY: ${process.env.NOVITA_API_KEY ? '✓ Configured' : '✗ NOT CONFIGURED'}\n`);

  if (!process.env.X_BEARER_TOKEN) {
    console.error('❌ X_BEARER_TOKEN is not configured!');
    console.error('Please add X_BEARER_TOKEN to your .env file');
    process.exit(1);
  }

  const results = [];
  const errors = [];
  let totalApiCalls = 0;
  let cachedCalls = 0;

  try {
    console.log('='.repeat(80));
    console.log(`Processing ${weeklyTopics.length} topics...`);
    console.log('⚠️  This will fetch 5 tweets per topic (3 hype + 2 backlash)');
    console.log('📊 Total: 9 topics × 5 tweets = 45 posts (45% of your 100-post limit)');
    console.log('💡 Same tweets used for BOTH evidence layer AND LLM analysis');
    console.log('💡 Cached data will be reused, so subsequent runs cost 0 API calls');
    console.log('='.repeat(80));
    console.log('');

    for (let i = 0; i < weeklyTopics.length; i++) {
      const { weekOf, topic } = weeklyTopics[i];
      
      console.log(`\n[${ i + 1}/${weeklyTopics.length}] Processing ${topic}...`);
      console.log('-'.repeat(60));

      try {
        // Add delay between topics to avoid rate limiting (except for first topic)
        if (i > 0) {
          console.log('⏳ Waiting 2 seconds to avoid rate limiting...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // Step 1: Fetch evidence layer tweets (OPTIMIZED!)
        console.log('  1️⃣  Fetching tweets (3 hype + 2 backlash = 5 total)...');
        const [hypeTweets, backlashTweets] = await Promise.all([
          fetchStructuredTweetsForEvidence(topic, 'hype', 3),
          fetchStructuredTweetsForEvidence(topic, 'backlash', 2)
        ]);
        
        if (hypeTweets.length === 0 && backlashTweets.length === 0) {
          console.warn(`  ⚠️  No tweets found for ${topic}, skipping...`);
          errors.push({ weekOf, topic, error: 'No tweets found' });
          continue;
        }

        console.log(`  ✓ Fetched ${hypeTweets.length} hype tweets + ${backlashTweets.length} backlash tweets`);
        totalApiCalls += 2; // 2 API calls per topic

        // Step 2: Prepare tweets for LLM analysis
        console.log('  2️⃣  Combining tweets for LLM analysis...');
        const allTweetTexts = [
          ...hypeTweets.map(t => t.text),
          ...backlashTweets.map(t => t.text)
        ];
        const combinedTweets = combineTweetsForAnalysis(allTweetTexts);
        console.log(`  ✓ Combined ${allTweetTexts.length} tweets`);

        // Step 3: Generate LLM analysis
        console.log('  3️⃣  Generating LLM analysis with Novita AI...');
        const analysis = await analyzeNarrativesWithRetry(topic, combinedTweets);
        console.log('  ✓ Generated analysis');

        // Step 4: Update database
        console.log('  4️⃣  Updating database...');
        const initialCommunitySentiment = {
          hype: 50,
          backlash: 50,
          totalVotes: 0
        };

        const timelineEvent = await prisma.timelineEvent.upsert({
          where: {
            weekOf: new Date(weekOf),
          },
          update: {
            headline: topic,
            hypeSummary: analysis.hypeSummary,
            backlashSummary: analysis.backlashSummary,
            weeklyPulse: analysis.weeklyPulse,
            hypeTweets: JSON.parse(JSON.stringify(hypeTweets)),
            backlashTweets: JSON.parse(JSON.stringify(backlashTweets)),
            communitySentiment: JSON.parse(JSON.stringify(initialCommunitySentiment)),
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

        console.log(`  ✓ Database updated (Event ID: ${timelineEvent.id})`);
        console.log(`  ✅ ${topic} completed successfully!`);

        results.push({ weekOf, topic, status: 'success' });

      } catch (error) {
        console.error(`  ❌ Error processing ${topic}:`, error);
        errors.push({ weekOf, topic, error: String(error) });
      }
    }

    // Final Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 PROCESSING COMPLETE');
    console.log('='.repeat(80));
    console.log(`\n✅ Successfully processed: ${results.length}/${weeklyTopics.length} topics`);
    if (errors.length > 0) {
      console.log(`❌ Failed: ${errors.length} topics`);
      errors.forEach(err => {
        console.log(`   - ${err.topic}: ${err.error}`);
      });
    }

    console.log(`\n📡 API Usage Summary:`);
    console.log(`   X API (Twitter): ${results.length * 2} calls, ${results.length * 5} tweets`);
    console.log(`   - Used ${results.length * 5} out of 100 posts (${results.length * 5}%)`);
    console.log(`   - Remaining: ${100 - (results.length * 5)} posts`);
    console.log(`\n   Novita AI (LLM): ${results.length} analysis calls`);
    console.log(`   - Generated ${results.length} narrative summaries`);
    console.log('\n💡 Next run will use cached data and make 0 X API calls!');
    console.log('🎉 All timeline events are now available at http://localhost:3000');

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Add confirmation prompt
console.log('⚠️  WARNING: This will process all 9 topics');
console.log('📊 API Usage:');
console.log('   - X API: 18 calls, 45 tweets (45% of your 100-post limit)');
console.log('   - Novita AI: 9 LLM analysis calls');
console.log('💡 Same tweets used for BOTH evidence layer AND LLM analysis');
console.log('💡 After first run, all data is cached for 7 days (0 X API calls)\n');
console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');

setTimeout(() => {
  processAllTopics();
}, 5000);

