'use client';

import { useState, useRef, useEffect } from 'react';
import { UI_TEXT } from '@/lib/constants';
import TimelineEventCard from '@/components/TimelineEventCard';
import SectionHeader from '@/components/ui/SectionHeader';
import TimelineSidebar from '@/components/ui/TimelineSidebar';
import type { TimelineEvent } from '@/lib/types';

interface HomeClientProps {
  events: TimelineEvent[];
  error: string | null;
}

/**
 * HomeClient Component
 * 
 * Client-side component that handles timeline interactions and scrolling
 */
export default function HomeClient({ events, error }: HomeClientProps) {
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const eventRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Calculate the number of weeks covered by the events
  const weeksCount = events.length > 0 ? events.length : 0;

  /**
   * Handle timeline event click - scroll to the specific event
   */
  const handleEventClick = (eventId: string) => {
    setActiveEventId(eventId);
    
    const eventElement = eventRefs.current[eventId];
    if (eventElement) {
      eventElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  /**
   * Set up intersection observer to track which event is currently visible
   */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const eventId = entry.target.getAttribute('data-event-id');
            if (eventId) {
              setActiveEventId(eventId);
            }
          }
        });
      },
      {
        threshold: 0.5,
        rootMargin: '-100px 0px -100px 0px',
      }
    );

    // Observe all event elements
    Object.values(eventRefs.current).forEach((element) => {
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [events]);

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
                <div
                  key={event.id}
                  ref={(el) => {
                    eventRefs.current[event.id] = el;
                  }}
                  data-event-id={event.id}
                >
                  <TimelineEventCard event={event} />
                </div>
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
          <TimelineSidebar 
            events={events} 
            activeEventId={activeEventId || undefined}
            onEventClick={handleEventClick}
          />
        </div>
      </div>
    </main>
  );
}
