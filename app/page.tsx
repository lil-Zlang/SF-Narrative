import { prisma } from '@/lib/prisma';
import { UI_TEXT } from '@/lib/constants';
import { handleDatabaseError, logError } from '@/lib/error-handler';
import TimelineEventCard from '@/components/TimelineEventCard';
import SectionHeader from '@/components/ui/SectionHeader';
import TimelineSidebar from '@/components/ui/TimelineSidebar';
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

  // Calculate the number of weeks covered by the events
  const weeksCount = events.length > 0 ? events.length : 0;

  return (
    <main className="min-h-screen bg-white">
      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 container mx-auto px-6 py-12 max-w-4xl lg:max-w-none">
          {/* Header */}
          <div className="mb-16">
            <h1 className="text-4xl md:text-5xl font-mono font-bold mb-4">
              {UI_TEXT.APP_TITLE}
            </h1>
            <p className="text-lg font-mono text-gray-600 max-w-2xl">
              {UI_TEXT.APP_DESCRIPTION}
            </p>
          </div>

          {/* Timeline */}
          <SectionHeader 
            title={`Most Heated Event Happened In SF in the past ${weeksCount} weeks`}
          />
          
          {error ? (
            <div className="text-center py-16 border-clean">
              <p className="text-lg font-mono text-red-500">
                Error loading events: {error}
              </p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-16 border-clean">
              <p className="text-lg font-mono text-gray-500">
                {UI_TEXT.NO_EVENTS_MESSAGE}
              </p>
            </div>
          ) : (
            <div>
              {events.map((event) => (
                <TimelineEventCard key={event.id} event={event} />
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-gray-200 text-center">
            <p className="text-sm font-mono text-gray-400">
              {UI_TEXT.FOOTER_TEXT}
            </p>
          </div>
        </div>
        
        {/* Timeline Sidebar - Hidden on mobile, visible on large screens */}
        <div className="hidden lg:block">
          <TimelineSidebar events={events} />
        </div>
      </div>
    </main>
  );
}

