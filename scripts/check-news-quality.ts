import { prisma } from '../lib/prisma';

async function check() {
  const weeks = await prisma.weeklyNews.findMany({
    orderBy: { weekOf: 'desc' },
    select: {
      weekOf: true,
      techSources: true,
      techSummary: true,
    }
  });

  console.log('\n📊 NEWS QUALITY CHECK:\n');

  for (const week of weeks) {
    const date = week.weekOf.toISOString().split('T')[0];
    const sources = week.techSources as any[];
    const sourceCount = sources?.length || 0;
    const hasRealUrl = sources?.[0]?.url && 
                       sources[0].url.startsWith('http') && 
                       sources[0].url !== 'https://sfchronicle.com/' &&
                       sources[0].url !== 'https://sfgate.com/' &&
                       sources[0].url !== 'https://missionlocal.org/';
    
    const quality = sourceCount > 5 && hasRealUrl ? '✅ REAL' : '⚠️  MOCK';
    const summary = week.techSummary.substring(0, 70);
    
    console.log(`${date}: ${quality} (${sourceCount} sources)`);
    console.log(`  "${summary}..."\n`);
  }
  
  await prisma.$disconnect();
}

check();

