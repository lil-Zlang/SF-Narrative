/**
 * News Scraper Module
 * 
 * Uses Playwright and Cheerio to scrape news articles from major sources
 * across 4 categories: Tech, Politics, Economy, SF Local
 */

import { chromium } from 'playwright-core';
import * as cheerio from 'cheerio';
import { NewsArticle } from './types';

// Scraper configuration for different news sources
interface ScraperConfig {
  url: string;
  selectors: {
    article: string;
    title: string;
    link: string;
    snippet?: string;
    date?: string;
  };
  source: string;
}

const TECH_SOURCES: ScraperConfig[] = [
  {
    url: 'https://techcrunch.com/',
    selectors: {
      article: 'article.post-block',
      title: 'h2.post-block__title',
      link: 'a.post-block__title__link',
      snippet: 'div.post-block__content',
      date: 'time',
    },
    source: 'TechCrunch',
  },
  {
    url: 'https://www.theverge.com/',
    selectors: {
      article: 'div[data-post-type="post"]',
      title: 'h2',
      link: 'a',
      snippet: 'p',
    },
    source: 'The Verge',
  },
];

const POLITICS_SOURCES: ScraperConfig[] = [
  {
    url: 'https://www.reuters.com/world/',
    selectors: {
      article: 'article',
      title: 'h3',
      link: 'a',
      snippet: 'p',
    },
    source: 'Reuters',
  },
];

const ECONOMY_SOURCES: ScraperConfig[] = [
  {
    url: 'https://www.reuters.com/business/',
    selectors: {
      article: 'article',
      title: 'h3',
      link: 'a',
      snippet: 'p',
    },
    source: 'Reuters Business',
  },
];

const SF_LOCAL_SOURCES: ScraperConfig[] = [
  {
    url: 'https://sfstandard.com/',
    selectors: {
      article: 'article',
      title: 'h2, h3',
      link: 'a',
      snippet: 'p',
    },
    source: 'San Francisco Standard',
  },
];

/**
 * Generic scraper function using Cheerio for HTML parsing
 * Falls back to simple fetch when Playwright is not available
 */
async function scrapeWithCheerio(
  config: ScraperConfig,
  maxArticles: number = 5
): Promise<NewsArticle[]> {
  try {
    console.log(`Scraping ${config.source} from ${config.url}...`);
    
    const response = await fetch(config.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const articles: NewsArticle[] = [];

    $(config.selectors.article).each((index, element) => {
      if (articles.length >= maxArticles) return false;

      try {
        const $article = $(element);
        const $title = $article.find(config.selectors.title).first();
        const $link = $article.find(config.selectors.link).first();
        const $snippet = config.selectors.snippet 
          ? $article.find(config.selectors.snippet).first()
          : null;

        const title = $title.text().trim();
        let link = $link.attr('href') || '';
        const snippet = $snippet ? $snippet.text().trim() : title;

        // Handle relative URLs
        if (link && !link.startsWith('http')) {
          const baseUrl = new URL(config.url);
          link = new URL(link, baseUrl.origin).href;
        }

        if (title && link) {
          articles.push({
            title,
            url: link,
            snippet: snippet.substring(0, 200), // Limit snippet length
            publishedDate: new Date().toISOString(), // Default to now if no date
            source: config.source,
          });
        }
      } catch (error) {
        console.warn(`Error parsing article from ${config.source}:`, error);
      }
    });

    console.log(`Scraped ${articles.length} articles from ${config.source}`);
    return articles;
  } catch (error) {
    console.error(`Error scraping ${config.source}:`, error);
    throw new Error(`Failed to scrape ${config.source}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Scrape tech news from multiple sources
 */
export async function scrapeTechNews(): Promise<NewsArticle[]> {
  const allArticles: NewsArticle[] = [];
  
  for (const source of TECH_SOURCES) {
    try {
      const articles = await scrapeWithCheerio(source, 5);
      allArticles.push(...articles);
      
      // Rate limiting - wait between sources
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Failed to scrape ${source.source}, continuing...`, error);
    }
  }

  return allArticles;
}

/**
 * Scrape politics news from multiple sources
 */
export async function scrapePoliticsNews(): Promise<NewsArticle[]> {
  const allArticles: NewsArticle[] = [];
  
  for (const source of POLITICS_SOURCES) {
    try {
      const articles = await scrapeWithCheerio(source, 5);
      allArticles.push(...articles);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Failed to scrape ${source.source}, continuing...`, error);
    }
  }

  return allArticles;
}

/**
 * Scrape economy news from multiple sources
 */
export async function scrapeEconomyNews(): Promise<NewsArticle[]> {
  const allArticles: NewsArticle[] = [];
  
  for (const source of ECONOMY_SOURCES) {
    try {
      const articles = await scrapeWithCheerio(source, 5);
      allArticles.push(...articles);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Failed to scrape ${source.source}, continuing...`, error);
    }
  }

  return allArticles;
}

/**
 * Scrape SF local news from multiple sources
 */
export async function scrapeSFLocalNews(): Promise<NewsArticle[]> {
  const allArticles: NewsArticle[] = [];
  
  for (const source of SF_LOCAL_SOURCES) {
    try {
      const articles = await scrapeWithCheerio(source, 5);
      allArticles.push(...articles);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Failed to scrape ${source.source}, continuing...`, error);
    }
  }

  return allArticles;
}

/**
 * Scrape all news categories in parallel
 */
export async function scrapeAllNews(): Promise<{
  tech: NewsArticle[];
  politics: NewsArticle[];
  economy: NewsArticle[];
  sfLocal: NewsArticle[];
}> {
  console.log('Starting news scraping for all categories...');
  
  const [tech, politics, economy, sfLocal] = await Promise.allSettled([
    scrapeTechNews(),
    scrapePoliticsNews(),
    scrapeEconomyNews(),
    scrapeSFLocalNews(),
  ]);

  return {
    tech: tech.status === 'fulfilled' ? tech.value : [],
    politics: politics.status === 'fulfilled' ? politics.value : [],
    economy: economy.status === 'fulfilled' ? economy.value : [],
    sfLocal: sfLocal.status === 'fulfilled' ? sfLocal.value : [],
  };
}

