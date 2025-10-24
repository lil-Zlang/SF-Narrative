import { prisma } from '@/lib/prisma';
import TimelineEventCard from '@/components/TimelineEventCard';
import SectionHeader from '@/components/ui/SectionHeader';
import TimelineSidebar from '@/components/ui/TimelineSidebar';

export const dynamic = 'force-dynamic';

export default async function Home() {
  // Fetch all timeline events from the database, ordered by weekOf descending
  const events = await prisma.timelineEvent.findMany({
    orderBy: {
      weekOf: 'desc',
    },
  });

  return (
    <main className="min-h-screen bg-white">
      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 container mx-auto px-6 py-12 max-w-4xl lg:max-w-none">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-mono font-bold mb-4">
            SF Narrative Battlefield
          </h1>
          <p className="text-lg font-mono text-gray-600 max-w-2xl">
            Drag the slider to engage with competing narratives. Feel the push and pull of San Francisco&apos;s most trending topics.
          </p>
        </div>

        {/* Timeline */}
        <SectionHeader 
          title="Battlefield Events" 
          subtitle="Drag the center line to control the narrative battle"
        />
        
        {events.length === 0 ? (
          <div className="text-center py-16 border-clean">
            <p className="text-lg font-mono text-gray-500">
              No events yet. Run the cron job to populate the timeline.
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
              Week 3 #BuildInPublic Challenge
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

