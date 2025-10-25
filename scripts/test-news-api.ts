/**
 * Test script for news API functionality
 * Tests both NewsAPI and Google RSS feeds
 */

import { fetchNewsFromGoogleRSS, fetchNewsWithFallback } from '../lib/news-api';
import { filterByStartDate } from '../lib/news-aggregator';

async function testNewsAPI() {
  console.log('🧪 Testing News API Implementation\n');
  console.log('=' .repeat(60));

  const weekStart = new Date('2025-10-20');
  
  // Test Google RSS Feed (doesn't require API key)
  console.log('\n📰 Testing Google News RSS Feed...\n');
  
  try {
    const techNews = await fetchNewsFromGoogleRSS('tech');
    console.log(`✓ Tech: Fetched ${techNews.length} articles`);
    
    if (techNews.length > 0) {
      console.log(`  Sample: ${techNews[0].title}`);
      console.log(`  Date: ${techNews[0].publishedDate}`);
      console.log(`  Source: ${techNews[0].source}`);
    }
    
    const filteredTech = filterByStartDate(techNews, weekStart);
    console.log(`  After filtering (Oct 20+): ${filteredTech.length} articles\n`);
    
    const politicsNews = await fetchNewsFromGoogleRSS('politics');
    console.log(`✓ Politics: Fetched ${politicsNews.length} articles`);
    
    if (politicsNews.length > 0) {
      console.log(`  Sample: ${politicsNews[0].title}`);
      console.log(`  Date: ${politicsNews[0].publishedDate}`);
    }
    
    const filteredPolitics = filterByStartDate(politicsNews, weekStart);
    console.log(`  After filtering (Oct 20+): ${filteredPolitics.length} articles\n`);
    
  } catch (error) {
    console.error('❌ Google RSS test failed:', error);
  }
  
  // Test fallback mechanism
  console.log('\n🔄 Testing Fallback Mechanism (NewsAPI → Google RSS)...\n');
  
  try {
    const economyNews = await fetchNewsWithFallback('economy', weekStart);
    console.log(`✓ Economy: Fetched ${economyNews.length} articles (with fallback)`);
    
    if (economyNews.length > 0) {
      console.log(`  Sample: ${economyNews[0].title}`);
      console.log(`  Date: ${economyNews[0].publishedDate}`);
      console.log(`  Source: ${economyNews[0].source}`);
    }
    
    const sfNews = await fetchNewsWithFallback('sf-local', weekStart);
    console.log(`\n✓ SF Local: Fetched ${sfNews.length} articles (with fallback)`);
    
    if (sfNews.length > 0) {
      console.log(`  Sample: ${sfNews[0].title}`);
      console.log(`  Date: ${sfNews[0].publishedDate}`);
    }
    
  } catch (error) {
    console.error('❌ Fallback test failed:', error);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Testing Complete!\n');
  console.log('💡 Tips:');
  console.log('  - Add NEWSAPI_KEY to .env for better results');
  console.log('  - Google RSS is free and works without API key');
  console.log('  - Date filtering ensures only Oct 20+ articles\n');
}

// Run the test
testNewsAPI().catch(console.error);

