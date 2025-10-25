import { prisma } from '@/lib/prisma';
import { UI_TEXT } from '@/lib/constants';
import { handleDatabaseError, logError } from '@/lib/error-handler';
import TimelineEventCard from '@/components/TimelineEventCard';
import SectionHeader from '@/components/ui/SectionHeader';
import TimelineSidebar from '@/components/ui/TimelineSidebar';
import HomeClient from '../components/HomeClient';
import type { TimelineEvent, WeeklyNews } from '@/lib/types';

export const dynamic = 'force-dynamic';

/**
 * Home Page Component
 * 
 * Main page displaying the weekly news digest and archived events
 */
export default async function Home() {
  let events: TimelineEvent[] = [];
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

    // Fetch archived timeline events from the database, ordered by weekOf descending
    const rawEvents = await prisma.timelineEvent.findMany({
      orderBy: {
        weekOf: 'desc',
      },
    });
    
    // Cast to TimelineEvent type to handle JsonValue types
    events = rawEvents as TimelineEvent[];
  } catch (err) {
    const appError = handleDatabaseError(err, 'Fetch Data');
    logError(appError, 'Home Page');
    error = appError.message;
  }

  return <HomeClient events={events} weeklyNews={weeklyNews} error={error} />;
}

