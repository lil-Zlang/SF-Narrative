/**
 * EFFICIENT X API STRATEGY
 * Fetch tweets ONCE per topic and filter client-side by sentiment keywords
 * This cuts API calls in HALF (9 calls instead of 18 for all topics)
 */

import { z } from 'zod';
import { getCachedData, setCachedData } from './cache';

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

interface Tweet {
  id: string;
  text: string;
  author_id?: string;
  created_at?: string;
  public_metrics?: {
    like_count?: number;
    retweet_count?: number;
  };
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
 * Fetch tweets ONCE and split by sentiment using keyword matching
 * This is 50% more efficient than separate API calls
 */
export async function fetchTweetsEfficient(topic: string): Promise<{
  hypeTweets: StructuredTweet[];
  backlashTweets: StructuredTweet[];
}> {
  // Check cache first
  const cacheKey = '_all_tweets';
  const cachedData = await getCachedData<{ hypeTweets: StructuredTweet[]; backlashTweets: StructuredTweet[] }>(
    topic, 
    cacheKey
  );
  
  if (cachedData) {
    console.log(`✓ Using cached tweets for ${topic}`);
    return cachedData;
  }

  const bearerToken = process.env.X_BEARER_TOKEN;

  if (!bearerToken) {
    console.warn('X_BEARER_TOKEN is not configured, returning mock data');
    return {
      hypeTweets: getMockTweetsForSentiment(topic, 'hype', 3),
      backlashTweets: getMockTweetsForSentiment(topic, 'backlash', 2)
    };
  }

  console.log(`📡 Calling X API ONCE for ${topic} (efficient mode)...`);

  try {
    // Fetch tweets without sentiment filtering - just the topic
    const query = `${topic} -is:retweet lang:en`;
    
    // Fetch more tweets (20) so we have enough to filter into hype/backlash
    const searchParams = new URLSearchParams({
      query,
      max_results: '20',
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
    
    if (rateLimitRemaining) {
      console.log(`Rate limit remaining: ${rateLimitRemaining}`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`X API request failed: ${response.status}`);
      console.warn(`Using mock data instead`);
      return {
        hypeTweets: getMockTweetsForSentiment(topic, 'hype', 3),
        backlashTweets: getMockTweetsForSentiment(topic, 'backlash', 2)
      };
    }

    const data = await response.json();
    const validatedData = TweetResponseSchema.parse(data);

    if (!validatedData.data || validatedData.data.length === 0) {
      console.warn(`No tweets found, using mock data`);
      return {
        hypeTweets: getMockTweetsForSentiment(topic, 'hype', 3),
        backlashTweets: getMockTweetsForSentiment(topic, 'backlash', 2)
      };
    }

    // Map tweets to structured format
    const users = validatedData.includes?.users || [];
    const userMap = new Map(users.map(user => [user.id, user]));

    const allStructuredTweets = validatedData.data.map((tweet: Tweet) => {
      const user = userMap.get(tweet.author_id || '') || { name: 'Unknown', username: 'unknown' };
      
      return {
        id: tweet.id,
        text: tweet.text,
        author: user.name,
        username: user.username,
        timestamp: tweet.created_at || new Date().toISOString(),
        likes: tweet.public_metrics?.like_count || 0,
        retweets: tweet.public_metrics?.retweet_count || 0,
      };
    });

    // Filter by sentiment keywords
    const hypeKeywords = ['amazing', 'love', 'excited', 'great', 'awesome', 'fantastic', 'incredible', 'best', 'beautiful'];
    const backlashKeywords = ['terrible', 'hate', 'awful', 'disappointed', 'frustrated', 'angry', 'worried', 'worst', 'bad'];

    const hypeTweets: StructuredTweet[] = [];
    const backlashTweets: StructuredTweet[] = [];

    for (const tweet of allStructuredTweets) {
      const textLower = tweet.text.toLowerCase();
      
      const hasHypeKeyword = hypeKeywords.some(kw => textLower.includes(kw));
      const hasBacklashKeyword = backlashKeywords.some(kw => textLower.includes(kw));

      if (hasHypeKeyword && !hasBacklashKeyword) {
        hypeTweets.push({ ...tweet, sentiment: 'hype' });
      } else if (hasBacklashKeyword && !hasHypeKeyword) {
        backlashTweets.push({ ...tweet, sentiment: 'backlash' });
      }
    }

    // Take top 3 hype and top 2 backlash (sorted by engagement)
    const sortedHype = hypeTweets
      .sort((a, b) => (b.likes + b.retweets) - (a.likes + a.retweets))
      .slice(0, 3);
    
    const sortedBacklash = backlashTweets
      .sort((a, b) => (b.likes + b.retweets) - (a.likes + a.retweets))
      .slice(0, 2);

    // If not enough tweets, fill with mock data
    const result = {
      hypeTweets: sortedHype.length >= 2 ? sortedHype : getMockTweetsForSentiment(topic, 'hype', 3),
      backlashTweets: sortedBacklash.length >= 2 ? sortedBacklash : getMockTweetsForSentiment(topic, 'backlash', 2),
    };

    // Cache the results
    await setCachedData(topic, result, cacheKey);
    console.log(`✓ Fetched and cached tweets for ${topic} (${sortedHype.length} hype, ${sortedBacklash.length} backlash)`);

    return result;
  } catch (error) {
    console.error(`Error fetching tweets for ${topic}:`, error);
    return {
      hypeTweets: getMockTweetsForSentiment(topic, 'hype', 3),
      backlashTweets: getMockTweetsForSentiment(topic, 'backlash', 2)
    };
  }
}

/**
 * Generate realistic mock tweets based on topic
 */
function getMockTweetsForSentiment(topic: string, sentiment: 'hype' | 'backlash', count: number): StructuredTweet[] {
  const topicHash = topic.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  
  if (sentiment === 'hype') {
    const templates = [
      { text: `${topic} is absolutely incredible! The energy in SF is electric. This is what makes our city special.`, author: 'Sarah Chen', username: 'sarahchen_tech', likes: 1247, retweets: 89 },
      { text: `Just experienced ${topic} and wow! The city feels alive with possibility. This is why SF is the heart of innovation.`, author: 'Mike Rodriguez', username: 'mike_rodriguez', likes: 892, retweets: 156 },
      { text: `${topic} really showcases the best of SF. Amazing community energy and innovation on display!`, author: 'Alex Kim', username: 'alexkim_sf', likes: 654, retweets: 78 }
    ];
    
    return templates.slice(0, count).map((t, i) => ({
      id: `${topicHash}_hype_${i + 1}`,
      text: t.text,
      author: t.author,
      username: t.username,
      timestamp: new Date().toISOString(),
      likes: t.likes,
      retweets: t.retweets,
      sentiment: 'hype'
    }));
  } else {
    const templates = [
      { text: `${topic} has completely taken over SF. Can't even walk down the street without being overwhelmed. The city doesn't feel like ours anymore.`, author: 'Maria Santos', username: 'maria_sf_local', likes: 2156, retweets: 423 },
      { text: `The disruption from ${topic} is pricing out regular people. Hotel prices through the roof, streets impassable. This isn't sustainable.`, author: 'David Park', username: 'davidpark_sf', likes: 1876, retweets: 312 }
    ];
    
    return templates.slice(0, count).map((t, i) => ({
      id: `${topicHash}_backlash_${i + 1}`,
      text: t.text,
      author: t.author,
      username: t.username,
      timestamp: new Date().toISOString(),
      likes: t.likes,
      retweets: t.retweets,
      sentiment: 'backlash'
    }));
  }
}

