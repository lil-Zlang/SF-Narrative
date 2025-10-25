/**
 * Script to clean up duplicate week entries caused by timezone issues
 */

import { prisma } from '../lib/prisma';

async function main() {
  console.log('🧹 Cleaning up duplicate weeks...\n');

  // Get all weeks
  const allWeeks = await prisma.weeklyNews.findMany({
    orderBy: { weekOf: 'desc' },
  });

  console.log(`Found ${allWeeks.length} total entries`);

  // Group by week (normalize to Monday of each week)
  const weekMap = new Map<string, typeof allWeeks>();

  for (const week of allWeeks) {
    const date = new Date(week.weekOf);
    // Normalize to start of week (Monday)
    const monday = new Date(date);
    monday.setUTCHours(0, 0, 0, 0);
    const dayOfWeek = monday.getUTCDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // If Sunday, go back 6 days, else go to Monday
    monday.setUTCDate(monday.getUTCDate() + diff);
    
    const weekKey = monday.toISOString().split('T')[0];
    
    if (!weekMap.has(weekKey)) {
      weekMap.set(weekKey, []);
    }
    weekMap.get(weekKey)!.push(week);
  }

  console.log(`\nFound ${weekMap.size} unique weeks\n`);

  let deletedCount = 0;

  // For each week, keep the one with more data, delete others
  for (const [weekKey, duplicates] of weekMap.entries()) {
    if (duplicates.length > 1) {
      console.log(`Week ${weekKey}: Found ${duplicates.length} duplicates`);
      
      // Sort by created date (keep the first one created, it usually has real data)
      duplicates.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      
      // Keep the first one, delete the rest
      const toKeep = duplicates[0];
      const toDelete = duplicates.slice(1);
      
      console.log(`  Keeping: ${toKeep.weekOf.toISOString()} (id: ${toKeep.id})`);
      
      for (const dup of toDelete) {
        console.log(`  Deleting: ${dup.weekOf.toISOString()} (id: ${dup.id})`);
        await prisma.weeklyNews.delete({ where: { id: dup.id } });
        deletedCount++;
      }
    }
  }

  console.log(`\n✓ Deleted ${deletedCount} duplicate entries`);
  console.log(`✓ ${weekMap.size} unique weeks remaining`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

