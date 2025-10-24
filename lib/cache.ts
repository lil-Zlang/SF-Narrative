/**
 * Simple file-based cache for X API responses
 * This helps conserve API rate limits by storing responses
 */

import fs from 'fs/promises';
import path from 'path';

const CACHE_DIR = path.join(process.cwd(), '.cache', 'x-api');

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  topic: string;
}

/**
 * Ensure cache directory exists
 */
async function ensureCacheDir() {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating cache directory:', error);
  }
}

/**
 * Get cache file path for a topic
 */
function getCacheFilePath(topic: string, suffix: string = ''): string {
  const sanitizedTopic = topic.replace(/[^a-zA-Z0-9]/g, '_');
  return path.join(CACHE_DIR, `${sanitizedTopic}${suffix}.json`);
}

/**
 * Get cached data for a topic
 * @param topic - The topic to get cached data for
 * @param suffix - Optional suffix for different cache types (e.g., '_hype', '_backlash')
 * @param maxAgeMs - Maximum age of cache in milliseconds (default: 7 days)
 * @returns Cached data or null if not found/expired
 */
export async function getCachedData<T>(
  topic: string,
  suffix: string = '',
  maxAgeMs: number = 7 * 24 * 60 * 60 * 1000 // 7 days
): Promise<T | null> {
  try {
    const cacheFile = getCacheFilePath(topic, suffix);
    const data = await fs.readFile(cacheFile, 'utf-8');
    const entry: CacheEntry<T> = JSON.parse(data);
    
    const age = Date.now() - entry.timestamp;
    if (age > maxAgeMs) {
      console.log(`Cache expired for ${topic}${suffix} (age: ${Math.round(age / 1000 / 60)} minutes)`);
      return null;
    }
    
    console.log(`✓ Using cached data for ${topic}${suffix} (age: ${Math.round(age / 1000 / 60)} minutes)`);
    return entry.data;
  } catch (error) {
    // Cache miss is expected, don't log error
    return null;
  }
}

/**
 * Save data to cache
 * @param topic - The topic to cache data for
 * @param data - The data to cache
 * @param suffix - Optional suffix for different cache types
 */
export async function setCachedData<T>(
  topic: string,
  data: T,
  suffix: string = ''
): Promise<void> {
  try {
    await ensureCacheDir();
    const cacheFile = getCacheFilePath(topic, suffix);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      topic
    };
    await fs.writeFile(cacheFile, JSON.stringify(entry, null, 2));
    console.log(`✓ Cached data for ${topic}${suffix}`);
  } catch (error) {
    console.error(`Error caching data for ${topic}${suffix}:`, error);
  }
}

/**
 * Clear all cache files
 */
export async function clearCache(): Promise<void> {
  try {
    await fs.rm(CACHE_DIR, { recursive: true, force: true });
    console.log('✓ Cache cleared');
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}
