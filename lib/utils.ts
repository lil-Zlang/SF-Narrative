/**
 * Utility functions for common operations
 */

import { UI_TEXT, DATE_FORMATS } from './constants';
import type { Tweet, SentimentData, ValidationResult } from './types';

/**
 * Format a date according to the specified format
 */
export function formatDate(date: Date, format: 'short' | 'long' | 'week' = 'short'): string {
  switch (format) {
    case 'short':
      return new Date(date).toLocaleDateString('en-US', DATE_FORMATS.SHORT);
    case 'long':
      return new Date(date).toLocaleDateString('en-US', DATE_FORMATS.LONG);
    case 'week':
      const d = new Date(date);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const day = d.getDate();
      return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    default:
      return new Date(date).toLocaleDateString('en-US', DATE_FORMATS.SHORT);
  }
}

/**
 * Format a number with K/M suffixes for large numbers
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

/**
 * Format a timestamp for display
 */
export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return formatDate(date, 'short');
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Create a hash from a string
 */
export function createHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Capitalize first letter of a string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convert string to kebab-case
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Convert string to camelCase
 */
export function toCamelCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '');
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Sleep function for delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await sleep(delay);
      }
    }
  }
  
  throw lastError!;
}

/**
 * Validate sentiment data
 */
export function validateSentimentData(data: any): ValidationResult {
  const errors: string[] = [];
  
  if (!data || typeof data !== 'object') {
    errors.push('Sentiment data must be an object');
    return { isValid: false, errors };
  }
  
  if (typeof data.hype !== 'number' || data.hype < 0 || data.hype > 100) {
    errors.push('Hype percentage must be a number between 0 and 100');
  }
  
  if (typeof data.backlash !== 'number' || data.backlash < 0 || data.backlash > 100) {
    errors.push('Backlash percentage must be a number between 0 and 100');
  }
  
  if (data.hype + data.backlash !== 100) {
    errors.push('Hype and backlash percentages must sum to 100');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Calculate community sentiment from votes
 */
export function calculateCommunitySentiment(votes: Array<{ hypePercentage: number; backlashPercentage: number }>): SentimentData {
  if (votes.length === 0) {
    return { hype: 50, backlash: 50 };
  }
  
  const totalHype = votes.reduce((sum, vote) => sum + vote.hypePercentage, 0);
  const totalBacklash = votes.reduce((sum, vote) => sum + vote.backlashPercentage, 0);
  
  const avgHype = totalHype / votes.length;
  const avgBacklash = totalBacklash / votes.length;
  
  return {
    hype: Math.round(avgHype),
    backlash: Math.round(avgBacklash)
  };
}

/**
 * Filter tweets by sentiment
 */
export function filterTweetsBySentiment(tweets: Tweet[], sentiment: 'hype' | 'backlash'): Tweet[] {
  return tweets.filter(tweet => tweet.sentiment === sentiment);
}

/**
 * Sort tweets by engagement (likes + retweets)
 */
export function sortTweetsByEngagement(tweets: Tweet[]): Tweet[] {
  return [...tweets].sort((a, b) => {
    const aEngagement = a.likes + a.retweets;
    const bEngagement = b.likes + b.retweets;
    return bEngagement - aEngagement;
  });
}

/**
 * Get relative time string
 */
export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }
  
  return formatDate(date, 'short');
}

/**
 * Check if a value is empty (null, undefined, empty string, empty array, empty object)
 */
export function isEmpty(value: any): boolean {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any;
  if (typeof obj === 'object') {
    const clonedObj = {} as any;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
}

/**
 * Handle external API errors with proper error context
 */
export function handleExternalApiError(error: any, apiName: string, statusCode?: number): Error {
  const message = error?.message || 'Unknown API error';
  const enhancedError = new Error(`${apiName}: ${message}`);
  (enhancedError as any).apiName = apiName;
  (enhancedError as any).statusCode = statusCode;
  (enhancedError as any).originalError = error;
  return enhancedError;
}

/**
 * Log error with context
 */
export function logError(error: any, context: string): void {
  console.error(`[${context}] Error:`, {
    message: error?.message || 'Unknown error',
    stack: error?.stack,
    context,
    timestamp: new Date().toISOString()
  });
}
