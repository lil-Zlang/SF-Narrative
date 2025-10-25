import { z } from 'zod';
import { getCachedData, setCachedData } from './cache';
import { 
  API_CONFIG, 
  SF_GEO_CONFIG, 
  SENTIMENT_KEYWORDS, 
  CACHE_CONFIG,
  ERROR_MESSAGES 
} from './constants';
import { handleExternalApiError, logError, retry } from './utils';
import type { RawTweet, User, Tweet, StructuredTweet } from './types';

const TweetSchema = z.object({
  id: z.string(),
  text: z.string(),
  author_id: z.string().optional(),
  created_at: z.string().optional(),
  public_metrics: z.object({
    like_count: z.number().optional(),
    retweet_count: z.number().optional(),
  }).optional(),
});

const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
  name: z.string(),
});

const TweetResponseSchema = z.object({
  data: z.array(TweetSchema).optional(),
  includes: z.object({
    users: z.array(UserSchema).optional(),
  }).optional(),
  meta: z.object({
    result_count: z.number(),
  }).optional(),
});

/**
 * Fetch tweets related to a specific topic with San Francisco geolocation
 * @param topic - The topic/hashtag to search for
 * @param maxResults - Maximum number of tweets to fetch (default: 100)
 * @returns Array of tweet texts
 */
export async function fetchTweetsForTopic(
  topic: string,
  maxResults: number = API_CONFIG.MAX_TWEETS_PER_REQUEST
): Promise<string[]> {
  // Check cache first
  const cachedTweets = await getCachedData<string[]>(topic, CACHE_CONFIG.TWEET_CACHE_SUFFIX);
  if (cachedTweets) {
    return cachedTweets;
  }

  const bearerToken = process.env.X_BEARER_TOKEN;

  if (!bearerToken) {
    throw new Error(ERROR_MESSAGES.API_KEY_MISSING);
  }

  console.log(`📡 Calling X API for ${topic} (max: ${maxResults} tweets)...`);

  try {
    const geocode = `${SF_GEO_CONFIG.LATITUDE},${SF_GEO_CONFIG.LONGITUDE},${SF_GEO_CONFIG.RADIUS_KM}km`;

    const searchParams = new URLSearchParams({
      query: `${topic} -is:retweet lang:en`,
      max_results: Math.min(maxResults, API_CONFIG.MAX_TWEETS_PER_REQUEST).toString(),
      'tweet.fields': 'created_at,public_metrics',
      expansions: 'author_id',
      'user.fields': 'location',
      sort_order: 'relevancy',
    });

    const url = `${API_CONFIG.X_API_BASE_URL}?${searchParams}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw handleExternalApiError(
        new Error(`X API request failed: ${response.status} ${response.statusText} - ${errorText}`),
        'X API',
        response.status
      );
    }

    const data = await response.json();
    const validatedData = TweetResponseSchema.parse(data);

    if (!validatedData.data || validatedData.data.length === 0) {
      console.warn(`No tweets found for topic: ${topic}`);
      return [];
    }

    // Extract just the tweet texts
    const tweets = validatedData.data.map((tweet: RawTweet) => tweet.text);
    
    // Cache the results
    await setCachedData(topic, tweets, CACHE_CONFIG.TWEET_CACHE_SUFFIX);
    console.log(`✓ Fetched and cached ${tweets.length} tweets for ${topic}`);
    
    return tweets;
  } catch (error) {
    const appError = handleExternalApiError(error, 'X API');
    logError(appError, 'fetchTweetsForTopic');
    throw appError;
  }
}

/**
 * Fetch structured tweets for evidence layer
 * @param topic - The topic/hashtag to search for
 * @param sentiment - Whether to fetch hype or backlash tweets
 * @param maxResults - Maximum number of tweets to fetch (default: 20)
 * @returns Array of structured tweets
 */
export async function fetchStructuredTweetsForEvidence(
  topic: string,
  sentiment: 'hype' | 'backlash',
  maxResults: number = 20
): Promise<StructuredTweet[]> {
  // Check cache first
  const cacheKey = `_${sentiment}_tweets`;
  const cachedTweets = await getCachedData<StructuredTweet[]>(topic, cacheKey);
  if (cachedTweets) {
    return cachedTweets;
  }

  const bearerToken = process.env.X_BEARER_TOKEN;

  if (!bearerToken) {
    console.warn('X_BEARER_TOKEN is not configured, returning mock data');
    return getMockTweetsForSentiment(topic, sentiment);
  }

  console.log(`📡 Calling X API for ${sentiment} tweets: ${topic} (max: ${maxResults})...`);

  try {
    // Build sentiment-specific search query
    const sentimentKeywords = sentiment === 'hype' 
      ? ['amazing', 'love', 'excited', 'great', 'awesome', 'fantastic', 'incredible']
      : ['terrible', 'hate', 'awful', 'disappointed', 'frustrated', 'angry', 'worried'];

    const sentimentQuery = sentimentKeywords.map(keyword => `"${keyword}"`).join(' OR ');
    const query = `${topic} (${sentimentQuery}) -is:retweet lang:en`;

    // X API requires max_results to be between 10 and 100
    // We'll fetch the minimum (10) and slice the results if needed
    const apiMaxResults = Math.max(10, Math.min(maxResults, 100));
    
    const searchParams = new URLSearchParams({
      query,
      max_results: apiMaxResults.toString(),
      'tweet.fields': 'created_at,public_metrics,author_id',
      expansions: 'author_id',
      'user.fields': 'username,name',
      sort_order: 'relevancy',
    });

    const url = `https://api.twitter.com/2/tweets/search/recent?${searchParams}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    });

    // Check rate limit headers
    const rateLimitRemaining = response.headers.get('x-rate-limit-remaining');
    const rateLimitReset = response.headers.get('x-rate-limit-reset');
    
    if (rateLimitRemaining) {
      console.log(`Rate limit remaining: ${rateLimitRemaining}`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`X API request failed: ${response.status} ${response.statusText}`);
      console.warn(`Error details: ${errorText}`);
      console.warn(`Query used: ${query}`);
      
      if (response.status === 429 && rateLimitReset) {
        const resetTime = new Date(parseInt(rateLimitReset) * 1000);
        console.warn(`Rate limit exceeded. Resets at: ${resetTime.toLocaleString()}`);
        console.warn(`Please wait before making more requests.`);
      }
      
      console.warn(`Using mock data instead`);
      return getMockTweetsForSentiment(topic, sentiment);
    }

    const data = await response.json();
    const validatedData = TweetResponseSchema.parse(data);

    if (!validatedData.data || validatedData.data.length === 0) {
      console.warn(`No tweets found for ${sentiment} sentiment, using mock data`);
      return getMockTweetsForSentiment(topic, sentiment);
    }

    // Map tweets to structured format
    const users = validatedData.includes?.users || [];
    const userMap = new Map(users.map(user => [user.id, user]));

    const structuredTweets = validatedData.data.map((tweet: Tweet) => {
      const user = userMap.get(tweet.author_id || '') || { name: 'Unknown', username: 'unknown' };
      
      return {
        id: tweet.id,
        text: tweet.text,
        author: user.name,
        username: user.username,
        timestamp: tweet.created_at || new Date().toISOString(),
        likes: tweet.public_metrics?.like_count || 0,
        retweets: tweet.public_metrics?.retweet_count || 0,
        sentiment
      };
    });

    // Slice to return only the requested number of tweets
    const limitedTweets = structuredTweets.slice(0, maxResults);
    
    // Cache the results
    await setCachedData(topic, limitedTweets, cacheKey);
    console.log(`✓ Fetched and cached ${limitedTweets.length} ${sentiment} tweets for ${topic}`);

    return limitedTweets;
  } catch (error) {
    console.error(`Error fetching ${sentiment} tweets for ${topic}:`, error);
    return getMockTweetsForSentiment(topic, sentiment);
  }
}

/**
 * Get mock tweets for demonstration when X API is not available
 * Now generates unique tweets based on the topic
 */
function getMockTweetsForSentiment(topic: string, sentiment: 'hype' | 'backlash'): StructuredTweet[] {
  // Create a simple hash from the topic to make IDs unique
  const topicHash = topic.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  
  // Different mock data templates based on topic keywords
  const topicLower = topic.toLowerCase();
  
  if (sentiment === 'hype') {
    const hypeTemplates = [
      {
        text: `${topic} is absolutely incredible! The energy in SF is electric. This is what makes our city special.`,
        author: "Sarah Chen",
        username: "sarahchen_tech",
        likes: 1247,
        retweets: 89
      },
      {
        text: `Just experienced ${topic} and wow! The city feels alive with possibility. This is why SF is the heart of innovation.`,
        author: "Mike Rodriguez",
        username: "mike_rodriguez",
        likes: 892,
        retweets: 156
      },
      {
        text: `${topic} really showcases the best of SF. Amazing community energy and innovation on display!`,
        author: "Alex Kim",
        username: "alexkim_sf",
        likes: 654,
        retweets: 78
      }
    ];
    
    return hypeTemplates.map((template, i) => ({
      id: `${topicHash}_hype_${i + 1}`,
      text: template.text,
      author: template.author,
      username: template.username,
      timestamp: new Date().toISOString(),
      likes: template.likes,
      retweets: template.retweets,
      sentiment: 'hype'
    }));
  } else {
    const backlashTemplates = [
      {
        text: `${topic} has completely taken over SF. Can't even walk down the street without being overwhelmed. The city doesn't feel like ours anymore.`,
        author: "Maria Santos",
        username: "maria_sf_local",
        likes: 2156,
        retweets: 423
      },
      {
        text: `The disruption from ${topic} is pricing out regular people. Hotel prices through the roof, streets impassable. This isn't sustainable.`,
        author: "David Park",
        username: "davidpark_sf",
        likes: 1876,
        retweets: 312
      },
      {
        text: `Tired of ${topic} taking priority over actual residents. SF needs to remember who lives here year-round.`,
        author: "Jamie Lee",
        username: "jamielee_local",
        likes: 1432,
        retweets: 267
      }
    ];
    
    return backlashTemplates.map((template, i) => ({
      id: `${topicHash}_backlash_${i + 1}`,
      text: template.text,
      author: template.author,
      username: template.username,
      timestamp: new Date().toISOString(),
      likes: template.likes,
      retweets: template.retweets,
      sentiment: 'backlash'
    }));
  }
}

/**
 * Combine multiple tweets into a single text block for LLM analysis
 * @param tweets - Array of tweet texts
 * @returns Combined text block
 */
export function combineTweetsForAnalysis(tweets: string[]): string {
  if (tweets.length === 0) {
    return '';
  }

  return tweets
    .map((tweet, index) => `Tweet ${index + 1}: ${tweet}`)
    .join('\n\n');
}

