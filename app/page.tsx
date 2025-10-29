import { prisma } from '@/lib/prisma';
import { handleDatabaseError, logError } from '@/lib/error-handler';
import HomeClient from '../components/HomeClient';
import type { WeeklyNews } from '@/lib/types';

export const dynamic = 'force-dynamic';

/**
 * Home Page Component
 * 
 * Main page displaying the weekly news digest
 */
export default async function Home() {
  let weeklyNews: WeeklyNews | null = null;
  let error: string | null = null;

  try {
    // Fetch the latest weekly news
    const latestWeeklyNews = await prisma.weeklyNews.findFirst({
      orderBy: {
        weekOf: 'desc',
      },
    });

    if (latestWeeklyNews) {
      // Transform to WeeklyNews type
      weeklyNews = {
        id: latestWeeklyNews.id,
        weekOf: latestWeeklyNews.weekOf,
        tech: {
          category: 'tech',
          summaryShort: latestWeeklyNews.techSummary,
          summaryDetailed: latestWeeklyNews.techDetailed,
          bullets: latestWeeklyNews.techBullets as string[],
          sources: latestWeeklyNews.techSources as any,
          keywords: latestWeeklyNews.techKeywords as string[],
        },
        politics: {
          category: 'politics',
          summaryShort: latestWeeklyNews.politicsSummary,
          summaryDetailed: latestWeeklyNews.politicsDetailed,
          bullets: latestWeeklyNews.politicsBullets as string[],
          sources: latestWeeklyNews.politicsSources as any,
          keywords: latestWeeklyNews.politicsKeywords as string[],
        },
        economy: {
          category: 'economy',
          summaryShort: latestWeeklyNews.economySummary,
          summaryDetailed: latestWeeklyNews.economyDetailed,
          bullets: latestWeeklyNews.economyBullets as string[],
          sources: latestWeeklyNews.economySources as any,
          keywords: latestWeeklyNews.economyKeywords as string[],
        },
        sfLocal: {
          category: 'sf-local',
          summaryShort: latestWeeklyNews.sfLocalSummary,
          summaryDetailed: latestWeeklyNews.sfLocalDetailed,
          bullets: latestWeeklyNews.sfLocalBullets as string[],
          sources: latestWeeklyNews.sfLocalSources as any,
          keywords: latestWeeklyNews.sfLocalKeywords as string[],
        },
        weeklyKeywords: latestWeeklyNews.weeklyKeywords as string[],
        createdAt: latestWeeklyNews.createdAt,
        updatedAt: latestWeeklyNews.updatedAt,
      };
    }
  } catch (err) {
    const appError = handleDatabaseError(err, 'Fetch Data');
    logError(appError, 'Home Page');
    error = appError.message;
  }

  return <HomeClient weeklyNews={weeklyNews} error={error} />;
}

