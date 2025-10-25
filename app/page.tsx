import { prisma } from '@/lib/prisma';
import { UI_TEXT } from '@/lib/constants';
import { handleDatabaseError, logError } from '@/lib/error-handler';
import TimelineEventCard from '@/components/TimelineEventCard';
import SectionHeader from '@/components/ui/SectionHeader';
import TimelineSidebar from '@/components/ui/TimelineSidebar';
import HomeClient from '../components/HomeClient';
import type { TimelineEvent } from '@/lib/types';

export const dynamic = 'force-dynamic';

/**
 * Home Page Component
 * 
 * Main page displaying the SF Narrative timeline with events
 */
export default async function Home() {
  let events: TimelineEvent[] = [];
  let error: string | null = null;

  try {
    // Fetch all timeline events from the database, ordered by weekOf descending
    const rawEvents = await prisma.timelineEvent.findMany({
      orderBy: {
        weekOf: 'desc',
      },
    });
    
    // Cast to TimelineEvent type to handle JsonValue types
    events = rawEvents as TimelineEvent[];
  } catch (err) {
    const appError = handleDatabaseError(err, 'Fetch Events');
    logError(appError, 'Home Page');
    error = appError.message;
  }

  return <HomeClient events={events} error={error} />;
}

