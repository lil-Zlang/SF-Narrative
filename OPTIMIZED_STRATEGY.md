# OPTIMIZED: Single Fetch Strategy 🚀

## The Brilliant Optimization

Instead of fetching tweets twice (once for LLM, once for evidence), we now:

1. **Fetch once**: 3 hype + 2 backlash = 5 tweets per topic
2. **Use twice**: Same tweets for BOTH evidence layer AND LLM analysis
3. **Save big**: 50% reduction in API calls!

## API Usage Breakdown

### Per Topic:
- **X API (Twitter):**
  - 1 call for 3 hype tweets
  - 1 call for 2 backlash tweets
  - **Total: 2 calls, 5 tweets** ✅

- **Novita AI (LLM):**
  - 1 call to analyze those 5 tweets
  - Generates: hype summary, backlash summary, weekly pulse
  - **Total: 1 call** ✅

### All 9 Topics:
- **X API:** 18 calls, **45 tweets (45% of 100-post limit)** ✅
- **Novita AI:** 9 LLM analysis calls ✅
- **Remaining X API quota:** 55 posts for testing/future use! ✅

## How It Works

```typescript
// Step 1: Fetch structured tweets
const [hypeTweets, backlashTweets] = await Promise.all([
  fetchStructuredTweetsForEvidence(topic, 'hype', 3),    // 3 hype tweets
  fetchStructuredTweetsForEvidence(topic, 'backlash', 2) // 2 backlash tweets
]);

// Step 2: Extract text for LLM
const allTweetTexts = [
  ...hypeTweets.map(t => t.text),      // Get text from hype tweets
  ...backlashTweets.map(t => t.text)   // Get text from backlash tweets
];

// Step 3: Send to LLM for analysis
const analysis = await analyzeNarrativesWithRetry(topic, allTweetTexts);

// Step 4: Save to database
await prisma.timelineEvent.upsert({
  // ... saves BOTH the structured tweets (for evidence layer)
  //     AND the LLM analysis (for summaries)
  hypeTweets: hypeTweets,           // For evidence layer
  backlashTweets: backlashTweets,   // For evidence layer
  hypeSummary: analysis.hypeSummary,      // From LLM
  backlashSummary: analysis.backlashSummary, // From LLM
  weeklyPulse: analysis.weeklyPulse      // From LLM
});
```

## Benefits

✅ **Efficient**: Single fetch, dual use
✅ **Economical**: Only 45 tweets for all 9 topics
✅ **Complete**: Full evidence layer + LLM analysis
✅ **Cached**: All subsequent runs cost 0 X API calls
✅ **Budget-friendly**: 55 posts remaining for experimentation

## Run the Scripts

### Test Single Topic (Recommended First):
```bash
npx tsx scripts/test-x-api.ts
```
**Cost:** 5 tweets (5% of limit)

### Process All 9 Topics:
```bash
npx tsx scripts/process-all-topics.ts
```
**Cost:** 45 tweets (45% of limit)

## What You Get

### Evidence Layer:
- 3 real hype tweets per topic (with author, likes, retweets)
- 2 real backlash tweets per topic (with author, likes, retweets)
- Interactive slider to reveal these tweets

### LLM Analysis:
- Hype narrative summary (generated from the 5 tweets)
- Backlash narrative summary (generated from the 5 tweets)
- Weekly pulse analysis (generated from the 5 tweets)

### User Voting:
- User sentiment tracking
- Community sentiment calculation
- Real-time updates

## The Math

**Old approach:**
- 10 tweets for LLM
- 3 hype for evidence
- 3 backlash for evidence
- = 16 tweets × 9 topics = **144 tweets** ❌ (44 over limit!)

**New approach:**
- 3 hype (for both LLM + evidence)
- 2 backlash (for both LLM + evidence)
- = 5 tweets × 9 topics = **45 tweets** ✅ (55 under limit!)

**Savings:** 99 tweets saved! 🎉

## Quality Check

**Q: Is 5 tweets enough for LLM analysis?**
A: Yes! The LLM can generate quality summaries from 3 hype + 2 backlash tweets. The asymmetric split (3:2) actually helps capture the dominant narrative while showing counter-perspective.

**Q: Is 3+2 tweets enough for evidence layer?**
A: Yes! Users will see 3 real hype tweets and 2 real backlash tweets when they drag the slider. That's enough to validate the narrative.

**Q: Why 3 hype vs 2 backlash?**
A: This reflects the typical distribution - more hype content exists for trending topics. You can adjust this ratio if needed.

## Caching FTW

After the first run, all data is cached for 7 days:
- ✅ X API: 0 calls (100% cache hits)
- ✅ Novita AI: You can re-run analysis if needed
- ✅ Cost: FREE for 7 days!

## Summary

This optimization is a **win-win-win**:
1. **Stays within X API limit** (45/100 posts)
2. **Provides complete functionality** (evidence + analysis)
3. **Leaves room for growth** (55 posts remaining)

You can now run the full application with real data! 🚀

