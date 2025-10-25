/**
 * News Aggregator Module
 * 
 * Aggregates, deduplicates, filters, and ranks news articles
 */

import { NewsArticle } from './types';

/**
 * Calculate similarity between two strings using simple word overlap
 */
function calculateSimilarity(str1: string, str2: string): number {
  const words1 = str1.toLowerCase().split(/\s+/);
  const words2 = str2.toLowerCase().split(/\s+/);
  
  const set1 = new Set(words1.filter(w => w.length > 3));
  const set2 = new Set(words2.filter(w => w.length > 3));
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return union.size > 0 ? intersection.size / union.size : 0;
}

/**
 * Deduplicate articles by finding similar titles
 */
export function deduplicateArticles(
  articles: NewsArticle[],
  similarityThreshold: number = 0.6
): NewsArticle[] {
  const deduplicated: NewsArticle[] = [];
  const seen = new Set<string>();

  for (const article of articles) {
    // Check if we've seen a similar article
    let isDuplicate = false;
    
    for (const existing of deduplicated) {
      const similarity = calculateSimilarity(article.title, existing.title);
      if (similarity >= similarityThreshold) {
        isDuplicate = true;
        break;
      }
    }

    if (!isDuplicate && !seen.has(article.url)) {
      deduplicated.push(article);
      seen.add(article.url);
    }
  }

  return deduplicated;
}

/**
 * Filter articles by date range (last N days)
 */
export function filterByDateRange(
  articles: NewsArticle[],
  days: number = 7
): NewsArticle[] {
  const now = new Date();
  const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  return articles.filter(article => {
    try {
      const publishedDate = new Date(article.publishedDate);
      return publishedDate >= cutoffDate;
    } catch {
      // If date parsing fails, include the article (better to include than exclude)
      return true;
    }
  });
}

/**
 * Filter articles by specific start date
 * @param articles - Articles to filter
 * @param startDate - Minimum date (articles before this will be excluded)
 * @returns Filtered articles
 */
export function filterByStartDate(
  articles: NewsArticle[],
  startDate: string | Date
): NewsArticle[] {
  const cutoffDate = typeof startDate === 'string' ? new Date(startDate) : startDate;
  cutoffDate.setHours(0, 0, 0, 0); // Start of day

  return articles.filter(article => {
    try {
      const publishedDate = new Date(article.publishedDate);
      return publishedDate >= cutoffDate;
    } catch {
      console.warn(`Failed to parse date: ${article.publishedDate} for article: ${article.title}`);
      // Exclude articles with unparseable dates when using strict date filtering
      return false;
    }
  });
}

/**
 * Rank articles by relevance (simple heuristic based on title and snippet quality)
 */
export function rankArticles(articles: NewsArticle[]): NewsArticle[] {
  return articles.sort((a, b) => {
    // Prefer articles with longer, more descriptive titles
    const aScore = a.title.length + a.snippet.length;
    const bScore = b.title.length + b.snippet.length;
    
    return bScore - aScore;
  });
}

/**
 * Extract keywords from articles using simple frequency analysis
 */
export function extractKeywords(
  articles: NewsArticle[],
  maxKeywords: number = 5
): string[] {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
  ]);

  const wordFrequency = new Map<string, number>();

  // Count word frequencies from titles (titles are more important)
  for (const article of articles) {
    const words = article.title
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word));

    for (const word of words) {
      wordFrequency.set(word, (wordFrequency.get(word) || 0) + 2); // Weight titles more
    }

    // Also count from snippets
    const snippetWords = article.snippet
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word));

    for (const word of snippetWords) {
      wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
    }
  }

  // Sort by frequency and take top keywords
  const sortedKeywords = Array.from(wordFrequency.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word)
    .slice(0, maxKeywords);

  // Capitalize first letter
  return sortedKeywords.map(word => word.charAt(0).toUpperCase() + word.slice(1));
}

/**
 * Aggregate and process articles for a category
 */
export function aggregateArticles(
  articles: NewsArticle[],
  options: {
    deduplicate?: boolean;
    filterDays?: number;
    rank?: boolean;
    maxArticles?: number;
  } = {}
): NewsArticle[] {
  const {
    deduplicate = true,
    filterDays = 7,
    rank = true,
    maxArticles = 10,
  } = options;

  let processed = [...articles];

  // Filter by date
  processed = filterByDateRange(processed, filterDays);

  // Deduplicate
  if (deduplicate) {
    processed = deduplicateArticles(processed);
  }

  // Rank by relevance
  if (rank) {
    processed = rankArticles(processed);
  }

  // Limit to max articles
  return processed.slice(0, maxArticles);
}

/**
 * Aggregate all news categories
 */
export function aggregateAllNews(newsData: {
  tech: NewsArticle[];
  politics: NewsArticle[];
  economy: NewsArticle[];
  sfLocal: NewsArticle[];
}): {
  tech: NewsArticle[];
  politics: NewsArticle[];
  economy: NewsArticle[];
  sfLocal: NewsArticle[];
  allKeywords: string[];
} {
  const tech = aggregateArticles(newsData.tech);
  const politics = aggregateArticles(newsData.politics);
  const economy = aggregateArticles(newsData.economy);
  const sfLocal = aggregateArticles(newsData.sfLocal);

  // Extract keywords from all articles
  const allArticles = [...tech, ...politics, ...economy, ...sfLocal];
  const allKeywords = extractKeywords(allArticles, 10);

  return {
    tech,
    politics,
    economy,
    sfLocal,
    allKeywords,
  };
}

