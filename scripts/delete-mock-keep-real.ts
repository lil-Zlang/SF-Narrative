import { prisma } from '../lib/prisma';

async function main() {
  console.log('🧹 Deleting mock data, keeping only REAL news...\n');

  const weeks = await prisma.weeklyNews.findMany({
    orderBy: { weekOf: 'desc' },
  });

  for (const week of weeks) {
    const sources = week.techSources as any[];
    const sourceCount = sources?.length || 0;
    const isMock = sourceCount <= 3;
    
    if (isMock) {
      console.log(`Deleting MOCK: ${week.weekOf.toISOString().split('T')[0]} (${sourceCount} sources)`);
      await prisma.weeklyNews.delete({ where: { id: week.id } });
    } else {
      console.log(`Keeping REAL: ${week.weekOf.toISOString().split('T')[0]} (${sourceCount} sources)`);
    }
  }

  const remaining = await prisma.weeklyNews.count();
  console.log(`\n✓ Complete! ${remaining} weeks with REAL data remaining.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

