/**
 * Script to generate week 44 content (Oct 26 - Nov 1, 2025)
 * 
 * This script calls the API endpoint to generate weekly news for week 44
 */

async function generateWeek44() {
  const apiUrl = process.env.API_URL || 'http://localhost:3000';
  const cronSecret = process.env.CRON_SECRET;
  
  const weekOf = '2025-10-26'; // Sunday of week 44
  
  console.log(`🚀 Generating week 44 content (week of ${weekOf})...`);
  console.log(`📡 Calling API: ${apiUrl}/api/seed-weekly-news-real?weekOf=${weekOf}`);
  
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Add authorization header if CRON_SECRET is set
    if (cronSecret) {
      headers['Authorization'] = `Bearer ${cronSecret}`;
    }
    
    const response = await fetch(`${apiUrl}/api/seed-weekly-news-real?weekOf=${weekOf}`, {
      method: 'GET',
      headers,
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Week 44 generated successfully!');
      console.log(`📅 Week of: ${data.weekOf}`);
      console.log(`📊 Stats:`, data.stats);
      console.log(`📰 Sample articles:`, data.sample);
    } else {
      console.error('❌ Failed to generate week 44:', data.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error generating week 44:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  generateWeek44();
}

export { generateWeek44 };

