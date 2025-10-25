/**
 * Application constants and configuration values
 */

// API Configuration
export const API_CONFIG = {
  X_API_BASE_URL: 'https://api.twitter.com/2/tweets/search/recent',
  NOVITA_API_BASE_URL: 'https://api.novita.ai/v3/openai/chat/completions',
  MAX_TWEETS_PER_REQUEST: 100,
  MIN_TWEETS_PER_REQUEST: 10,
  DEFAULT_TWEET_LIMIT: 20,
  MAX_RETRIES: 3,
  RETRY_DELAY_BASE: 1000, // Base delay in milliseconds
} as const;

// UI Configuration
export const UI_CONFIG = {
  SLIDER_THRESHOLD: 20, // Percentage threshold for showing tweets
  DEFAULT_SLIDER_POSITION: 50,
  DEFAULT_SENTIMENT: { hype: 50, backlash: 50 },
  DEFAULT_COMMUNITY_SENTIMENT: { hype: 60, backlash: 40 },
  CHATBOT_MAX_TOKENS: 1000,
  CHATBOT_TEMPERATURE: 0.7,
  CHATBOT_MAX_RESPONSE_LENGTH: 1000,
} as const;

// San Francisco Geographic Configuration
export const SF_GEO_CONFIG = {
  LATITUDE: 37.7749,
  LONGITUDE: -122.4194,
  RADIUS_KM: 25,
  BOUNDING_BOX: {
    SOUTHWEST: { lat: 37.7039, lng: -122.5155 },
    NORTHEAST: { lat: 37.8324, lng: -122.3558 },
  },
} as const;

// Sentiment Analysis Keywords
export const SENTIMENT_KEYWORDS = {
  HYPE: ['amazing', 'love', 'excited', 'great', 'awesome', 'fantastic', 'incredible'],
  BACKLASH: ['terrible', 'hate', 'awful', 'disappointed', 'frustrated', 'angry', 'worried'],
} as const;

// Cache Configuration
export const CACHE_CONFIG = {
  TTL_HOURS: 24,
  TWEET_CACHE_SUFFIX: '_tweets',
  HYPE_TWEET_CACHE_SUFFIX: '_hype_tweets',
  BACKLASH_TWEET_CACHE_SUFFIX: '_backlash_tweets',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  API_KEY_MISSING: 'API key not configured',
  INVALID_MESSAGES_FORMAT: 'Invalid messages format',
  NO_TWEETS_FOUND: 'No tweets found for the given topic',
  API_REQUEST_FAILED: 'API request failed',
  INVALID_RESPONSE_FORMAT: 'Invalid response format from API',
  ANALYSIS_FAILED: 'Failed to analyze narratives',
  VOTE_SAVE_FAILED: 'Failed to save vote',
  CHATBOT_ERROR: 'Failed to process chatbot request',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  VOTE_SAVED: 'Vote saved successfully',
  TWEETS_FETCHED: 'Tweets fetched and cached successfully',
  ANALYSIS_COMPLETE: 'Narrative analysis completed successfully',
} as const;

// UI Text Constants
export const UI_TEXT = {
  APP_TITLE: 'SF Narrative',
  APP_DESCRIPTION: 'Explore San Francisco\'s trending topics through X',
  HYPE_NARRATIVE_LABEL: 'POSITIVE NARRATIVE',
  BACKLASH_NARRATIVE_LABEL: 'NEGATIVE NARRATIVE',
  DRAG_INSTRUCTION: 'DRAG TO EXPLORE NARRATIVES',
  AI_ANALYSIS_LABEL: 'AI ANALYSIS',
  ASK_QUESTIONS_BUTTON: '💬 ASK QUESTIONS',
  EVIDENCE_LAYER_PRO: 'Evidence Layer: Pro-tweets',
  EVIDENCE_LAYER_ANTI: 'Evidence Layer: Anti-tweets',
  CHATBOT_TITLE: '💬 AI Analysis Assistant',
  CHATBOT_PLACEHOLDER: 'Ask a question...',
  CHATBOT_SUGGESTIONS: '💡 Try: "Compare the narratives" or "What\'s the key tension?"',
  CHATBOT_MAX_RESPONSE_LENGTH: 1000,
  NO_EVENTS_MESSAGE: 'No events yet. Run the cron job to populate the timeline.',
  FOOTER_TEXT: 'Week 3 #BuildInPublic Challenge',
} as const;

// Date Formatting
export const DATE_FORMATS = {
  SHORT: { month: 'short', day: 'numeric' } as const,
  LONG: { month: 'long', day: 'numeric', year: 'numeric' } as const,
  WEEK: 'YYYY-MM-DD',
} as const;

// Component Sizes
export const COMPONENT_SIZES = {
  CHATBOT: {
    WIDTH: 384, // w-96
    HEIGHT: 600,
    MINIMIZED_WIDTH: 320, // w-80
    MINIMIZED_HEIGHT: 56, // h-14
  },
  SPLIT_SCREEN: {
    HEIGHT: 224, // h-56
  },
  TWEET_CARD: {
    AVATAR_SIZE: 24, // w-6 h-6
  },
} as const;
