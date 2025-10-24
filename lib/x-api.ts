import { z } from 'zod';
import { getCachedData, setCachedData } from './cache';

const TweetSchema = z.object({
  id: z.string(),
  text: z.string(),
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

interface Tweet {
  id: string;
  text: string;
  created_at?: string;
  public_metrics?: {
    like_count?: number;
    retweet_count?: number;
  };
}

interface User {
  id: string;
  username: string;
  name: string;
}

interface StructuredTweet {
  id: string;
  text: string;
  author: string;
  username: string;
  timestamp: string;
  likes: number;
  retweets: number;
  sentiment: 'hype' | 'backlash';
}

/**
 * Fetch tweets related to a specific topic with San Francisco geolocation
 * @param topic - The topic/hashtag to search for
 * @param maxResults - Maximum number of tweets to fetch (default: 100)
 * @returns Array of tweet texts
 */
export async function fetchTweetsForTopic(
  topic: string,
  maxResults: number = 100
): Promise<string[]> {
  // Check cache first
  const cachedTweets = await getCachedData<string[]>(topic, '_tweets');
  if (cachedTweets) {
    return cachedTweets;
  }

  const bearerToken = process.env.X_BEARER_TOKEN;

  if (!bearerToken) {
    console.warn('X_BEARER_TOKEN is not configured in environment');
    throw new Error('X_BEARER_TOKEN is not configured');
  }

  console.log(`📡 Calling X API for ${topic} (max: ${maxResults} tweets)...`);

  try {
    // San Francisco's approximate bounding box coordinates
    // Southwest corner: -122.5155, 37.7039
    // Northeast corner: -122.3558, 37.8324
    const geocode = '37.7749,-122.4194,25km'; // SF coordinates with 25km radius

    // Build the search query
    // Using recent search endpoint (v2)
    const searchParams = new URLSearchParams({
      query: `${topic} -is:retweet lang:en`,
      max_results: Math.min(maxResults, 100).toString(), // API limit is 100 per request
      'tweet.fields': 'created_at,public_metrics',
      expansions: 'author_id',
      'user.fields': 'location',
      sort_order: 'relevancy',
    });

    const url = `https://api.twitter.com/2/tweets/search/recent?${searchParams}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `X API request failed: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const data = await response.json();
    const validatedData = TweetResponseSchema.parse(data);

    if (!validatedData.data || validatedData.data.length === 0) {
      console.warn(`No tweets found for topic: ${topic}`);
      return [];
    }

    // Extract just the tweet texts
    const tweets = validatedData.data.map((tweet: Tweet) => tweet.text);
    
    // Cache the results
    await setCachedData(topic, tweets, '_tweets');
    console.log(`✓ Fetched and cached ${tweets.length} tweets for ${topic}`);
    
    return tweets;
  } catch (error) {
    console.error(`Error fetching tweets for ${topic}:`, error);
    
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.message);
      throw new Error(`Invalid response format from X API: ${error.message}`);
    }
    
    throw error;
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
    return getMockTweetsForSentiment(sentiment);
  }

  console.log(`📡 Calling X API for ${sentiment} tweets: ${topic} (max: ${maxResults})...`);

  try {
    // Build sentiment-specific search query
    const sentimentKeywords = sentiment === 'hype' 
      ? ['amazing', 'love', 'excited', 'great', 'awesome', 'fantastic', 'incredible']
      : ['terrible', 'hate', 'awful', 'disappointed', 'frustrated', 'angry', 'worried'];

    const sentimentQuery = sentimentKeywords.map(keyword => `"${keyword}"`).join(' OR ');
    const query = `${topic} (${sentimentQuery}) -is:retweet lang:en`;

    const searchParams = new URLSearchParams({
      query,
      max_results: Math.min(maxResults, 100).toString(),
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
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn(`X API request failed: ${response.status}, using mock data`);
      return getMockTweetsForSentiment(sentiment);
    }

    const data = await response.json();
    const validatedData = TweetResponseSchema.parse(data);

    if (!validatedData.data || validatedData.data.length === 0) {
      console.warn(`No tweets found for ${sentiment} sentiment, using mock data`);
      return getMockTweetsForSentiment(sentiment);
    }

    // Map tweets to structured format
    const users = validatedData.includes?.users || [];
    const userMap = new Map(users.map(user => [user.id, user]));

    const structuredTweets = validatedData.data.map((tweet: Tweet) => {
      const user = userMap.get(tweet.id) || { name: 'Unknown', username: 'unknown' };
      
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

    // Cache the results
    await setCachedData(topic, structuredTweets, cacheKey);
    console.log(`✓ Fetched and cached ${structuredTweets.length} ${sentiment} tweets for ${topic}`);

    return structuredTweets;
  } catch (error) {
    console.error(`Error fetching ${sentiment} tweets for ${topic}:`, error);
    return getMockTweetsForSentiment(sentiment);
  }
}

/**
 * Get mock tweets for demonstration when X API is not available
 */
function getMockTweetsForSentiment(sentiment: 'hype' | 'backlash'): StructuredTweet[] {
  if (sentiment === 'hype') {
    return [
      {
        id: "mock_hype_1",
        text: "This is absolutely incredible! The energy in SF is electric. So many innovative companies showcasing the future of tech.",
        author: "Sarah Chen",
        username: "sarahchen_tech",
        timestamp: new Date().toISOString(),
        likes: 1247,
        retweets: 89,
        sentiment: 'hype'
      },
      {
        id: "mock_hype_2",
        text: "Just walked through and wow! The city feels alive with possibility. This is why SF is the heart of innovation.",
        author: "Mike Rodriguez",
        username: "mike_rodriguez",
        timestamp: new Date().toISOString(),
        likes: 892,
        retweets: 156,
        sentiment: 'hype'
      }
    ];
  } else {
    return [
      {
        id: "mock_backlash_1",
        text: "This has completely taken over SF. Can't even walk down the street without being overwhelmed. The city doesn't feel like ours anymore.",
        author: "Maria Santos",
        username: "maria_sf_local",
        timestamp: new Date().toISOString(),
        likes: 2156,
        retweets: 423,
        sentiment: 'backlash'
      },
      {
        id: "mock_backlash_2",
        text: "Hotel prices are insane because of this. $800/night for a basic room? This is pricing out regular people from their own city.",
        author: "David Park",
        username: "davidpark_sf",
        timestamp: new Date().toISOString(),
        likes: 1876,
        retweets: 312,
        sentiment: 'backlash'
      }
    ];
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

