import { prisma } from '../lib/prisma';

async function main() {
  const augustWeeks = await prisma.weeklyNews.findMany({
    where: {
      weekOf: {
        lt: new Date('2025-09-01')
      }
    }
  });

  console.log(`Found ${augustWeeks.length} weeks before September`);
  
  for (const week of augustWeeks) {
    console.log(`Deleting week: ${week.weekOf.toISOString()}`);
    await prisma.weeklyNews.delete({ where: { id: week.id } });
  }

  const remaining = await prisma.weeklyNews.count();
  console.log(`✓ Cleanup complete. ${remaining} weeks remaining.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
