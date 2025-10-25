'use client';

import { useState, useRef, useEffect } from 'react';
import { UI_TEXT } from '@/lib/constants';
import TimelineEventCard from '@/components/TimelineEventCard';
import SectionHeader from '@/components/ui/SectionHeader';
import TimelineSidebar from '@/components/ui/TimelineSidebar';
import NewsCard from '@/components/ui/NewsCard';
import type { TimelineEvent, WeeklyNews } from '@/lib/types';

interface HomeClientProps {
  events: TimelineEvent[];
  weeklyNews: WeeklyNews | null;
  error: string | null;
}

/**
 * HomeClient Component
 * 
 * Client-side component that handles timeline interactions and scrolling
 */
export default function HomeClient({ events, weeklyNews, error }: HomeClientProps) {
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'news' | 'archive'>('news');
  const eventRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Calculate the number of weeks covered by the events
  const weeksCount = events.length > 0 ? events.length : 0;

  // Format week date for display
  const formatWeekDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

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
              Weekly News Digest
            </h1>
            <p className="text-lg font-mono text-gray-600 max-w-2xl">
              Your curated summary of the week's most important news across Tech, Politics, Economy, and SF Local.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8 flex gap-4 border-b border-gray-300">
            <button
              onClick={() => setActiveTab('news')}
              className={`px-6 py-3 font-mono font-bold text-sm transition-colors ${
                activeTab === 'news'
                  ? 'border-b-2 border-black text-black'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              This Week's News
            </button>
            <button
              onClick={() => setActiveTab('archive')}
              className={`px-6 py-3 font-mono font-bold text-sm transition-colors ${
                activeTab === 'archive'
                  ? 'border-b-2 border-black text-black'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Archive
            </button>
          </div>

          {/* This Week's News Tab */}
          {activeTab === 'news' && (
            <>
              {error ? (
                <div className="text-center py-16 border border-gray-300">
                  <p className="text-lg font-mono text-red-500">
                    Error loading news: {error}
                  </p>
                </div>
              ) : !weeklyNews ? (
                <div className="text-center py-16 border border-gray-300">
                  <p className="text-lg font-mono text-gray-500">
                    No weekly news available yet. Check back soon!
                  </p>
                </div>
              ) : (
                <>
                  {/* Week header */}
                  <div className="mb-8">
                    <h2 className="text-2xl font-mono font-bold mb-2">
                      Week of {formatWeekDate(weeklyNews.weekOf)}
                    </h2>
                    {weeklyNews.weeklyKeywords.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {weeklyNews.weeklyKeywords.map((keyword, index) => (
                          <span
                            key={index}
                            className="text-xs font-mono text-gray-600 bg-gray-100 border border-gray-300 px-3 py-1"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* News Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <NewsCard news={weeklyNews.tech} />
                    <NewsCard news={weeklyNews.politics} />
                    <NewsCard news={weeklyNews.economy} />
                    <NewsCard news={weeklyNews.sfLocal} />
                  </div>
                </>
              )}
            </>
          )}

          {/* Archive Tab */}
          {activeTab === 'archive' && (
            <>
              <SectionHeader 
                title={`Most Heated Events in SF (Past ${weeksCount} weeks)`}
              />
              
              {events.length === 0 ? (
                <div className="text-center py-16 border border-gray-300">
                  <p className="text-lg font-mono text-gray-500">
                    No archived events available.
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
            </>
          )}

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-gray-200 text-center">
            <p className="text-sm font-mono text-gray-400">
              Updated every Friday • Powered by AI
            </p>
          </div>
        </div>
        
        {/* Timeline Sidebar - Hidden on mobile, visible on large screens */}
        {activeTab === 'archive' && events.length > 0 && (
          <div className="hidden lg:block">
            <TimelineSidebar 
              events={events} 
              activeEventId={activeEventId || undefined}
              onEventClick={handleEventClick}
            />
          </div>
        )}
      </div>
    </main>
  );
}
