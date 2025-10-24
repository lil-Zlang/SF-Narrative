# X API and LLM Usage Clarification

## Two Separate APIs

### 1. X (Twitter) API - **100 Posts Limit** ⚠️
- **What it does**: Fetches tweets from Twitter/X
- **Environment variable**: `X_BEARER_TOKEN`
- **Your limit**: 100 posts per month
- **Used for**:
  - Fetching tweets for LLM analysis
  - Fetching evidence layer tweets (hype/backlash)

### 2. Novita AI (LLM) - **Separate Limit** ✓
- **What it does**: Analyzes tweets and generates narratives
- **Environment variable**: `NOVITA_API_KEY`
- **Your limit**: (check your Novita dashboard)
- **Used for**:
  - Generating hype summaries
  - Generating backlash summaries
  - Generating weekly pulse analysis

## Critical Issue: You're Over the X API Limit! 🚨

### Current Configuration (TOO HIGH):
**Per topic:**
- 10 tweets for LLM analysis
- 3 hype tweets
- 3 backlash tweets
- **= 16 tweets per topic**

**All 9 topics:**
- 9 × 16 = **144 tweets**
- **This exceeds your 100-post limit!** ❌

## Solution: Further Reduce X API Usage

### Option 1: Process Only 6 Topics (Recommended)
- 6 topics × 16 tweets = **96 tweets** (within limit)
- You choose which 6 topics are most important

### Option 2: Reduce Tweets Per Topic
**New configuration:**
- 5 tweets for LLM analysis (instead of 10)
- 2 hype tweets (instead of 3)
- 2 backlash tweets (instead of 3)
- **= 9 tweets per topic**

**All 9 topics:**
- 9 × 9 = **81 tweets** (within limit) ✓

### Option 3: Process Topics Gradually
- Process 3 topics per month
- Month 1: Topics 1-3 (48 tweets)
- Month 2: Topics 4-6 (48 tweets)
- Month 3: Topics 7-9 (48 tweets)

## Recommended Approach

**I recommend Option 2**: Reduce to 9 tweets per topic

This allows you to:
- ✓ Process all 9 topics in one go
- ✓ Stay within 100-post limit (81 tweets)
- ✓ Still get enough data for quality LLM analysis
- ✓ Have 19 tweets remaining for testing

## Implementation

Let me update the code to use only **9 tweets per topic**:
- 5 tweets for LLM analysis
- 2 hype tweets for evidence
- 2 backlash tweets for evidence

This way you can process all 9 topics and stay within your X API limit!

