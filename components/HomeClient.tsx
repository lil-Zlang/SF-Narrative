'use client';

import { useState, useRef, useEffect } from 'react';
import { UI_TEXT } from '@/lib/constants';
import TimelineEventCard from '@/components/TimelineEventCard';
import SectionHeader from '@/components/ui/SectionHeader';
import TimelineSidebar from '@/components/ui/TimelineSidebar';
import NewsCard from '@/components/ui/NewsCard';
import NewsQAModal from '@/components/ui/NewsQAModal';
import WeekSelector from '@/components/ui/WeekSelector';
import type { TimelineEvent, WeeklyNews, CategoryNews } from '@/lib/types';

interface HomeClientProps {
  events: TimelineEvent[];
  weeklyNews: WeeklyNews | null;
  error: string | null;
}

/**
 * HomeClient Component
 * 
 * Client-side component that handles timeline interactions, scrolling, and news Q&A
 */
export default function HomeClient({ events, weeklyNews: initialWeeklyNews, error: initialError }: HomeClientProps) {
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'news' | 'archive'>('news');
  const [highlightedCategory, setHighlightedCategory] = useState<string | null>(null);
  const [qaModalOpen, setQaModalOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<CategoryNews | null>(null);
  const [availableWeeks, setAvailableWeeks] = useState<{ weekOf: Date; label: string }[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<Date | null>(initialWeeklyNews?.weekOf || null);
  const [weeklyNews, setWeeklyNews] = useState<WeeklyNews | null>(initialWeeklyNews);
  const [error, setError] = useState<string | null>(initialError);
  const [isLoadingWeek, setIsLoadingWeek] = useState(false);
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
   * Handle hashtag click - scroll to related news category
   */
  const handleHashtagClick = (keyword: string) => {
    // Map keywords to categories (simple heuristic)
    const keywordLower = keyword.toLowerCase();
    let targetCategory = 'tech'; // default
    
    if (keywordLower.includes('politic') || keywordLower.includes('election') || 
        keywordLower.includes('government') || keywordLower.includes('california')) {
      targetCategory = 'politics';
    } else if (keywordLower.includes('econom') || keywordLower.includes('housing') || 
               keywordLower.includes('market') || keywordLower.includes('business')) {
      targetCategory = 'economy';
    } else if (keywordLower.includes('local') || keywordLower.includes('community') || 
               keywordLower.includes('bart') || keywordLower.includes('transport')) {
      targetCategory = 'sf-local';
    } else if (keywordLower.includes('tech') || keywordLower.includes('startup') || 
               keywordLower.includes('ai')) {
      targetCategory = 'tech';
    }

    // Find all categories that contain this keyword
    const matchingCategory = weeklyNews ? 
      Object.entries({
        tech: weeklyNews.tech,
        politics: weeklyNews.politics,
        economy: weeklyNews.economy,
        'sf-local': weeklyNews.sfLocal,
      }).find(([_, news]) => 
        news.keywords.some(k => k.toLowerCase().includes(keywordLower))
      ) : null;

    if (matchingCategory) {
      targetCategory = matchingCategory[0];
    }

    // Scroll to the news card
    const element = document.getElementById(`news-${targetCategory}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedCategory(targetCategory);
      
      // Clear highlight after animation
      setTimeout(() => setHighlightedCategory(null), 3100);
    }
  };

  /**
   * Handle "Ask AI" button click
   */
  const handleAskAI = (news: CategoryNews) => {
    setSelectedNews(news);
    setQaModalOpen(true);
  };

  /**
   * Fetch available weeks on mount
   */
  useEffect(() => {
    async function fetchWeeks() {
      try {
        const response = await fetch('/api/weekly-news/weeks');
        const data = await response.json();
        
        if (data.success) {
          setAvailableWeeks(data.data.map((w: any) => ({
            weekOf: new Date(w.weekOf),
            label: w.label,
          })));
        }
      } catch (error) {
        console.error('Error fetching weeks:', error);
      }
    }
    
    fetchWeeks();
  }, []);

  /**
   * Fetch news when selected week changes
   */
  useEffect(() => {
    if (!selectedWeek) return;
    
    async function fetchWeekNews() {
      setIsLoadingWeek(true);
      setError(null);
      
      try {
        const weekParam = selectedWeek!.toISOString().split('T')[0];
        const response = await fetch(`/api/weekly-news?weekOf=${weekParam}`);
        const data = await response.json();
        
        if (data.success) {
          setWeeklyNews(data.data);
        } else {
          setError(data.error || 'Failed to load news');
          setWeeklyNews(null);
        }
      } catch (error) {
        console.error('Error fetching week news:', error);
        setError('Failed to load news');
        setWeeklyNews(null);
      } finally {
        setIsLoadingWeek(false);
      }
    }
    
    fetchWeekNews();
  }, [selectedWeek]);

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
              SF Weekly News Digest
            </h1>
            <p className="text-lg font-mono text-gray-600 max-w-2xl">
              AI summary of the week's most important news across Tech, Politics, Economy, and SF Local.
            </p>
          </div>

          {/* Tab Navigation - Archive Hidden */}
          <div className="mb-8 border-b border-gray-300">
            <div className="px-6 py-3 font-mono font-bold text-sm border-b-2 border-black text-black inline-block">
              This Week's News
            </div>
          </div>

          {/* This Week's News Tab */}
          {activeTab === 'news' && (
            <>
              {/* Week Selector */}
              {availableWeeks.length > 0 && selectedWeek && (
                <div className="mb-8">
                  <WeekSelector
                    weeks={availableWeeks}
                    selectedWeek={selectedWeek}
                    onSelectWeek={setSelectedWeek}
                  />
                </div>
              )}

              {/* Loading State */}
              {isLoadingWeek ? (
                <div className="text-center py-16 border border-gray-300">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
                  <p className="text-lg font-mono text-gray-600">
                    Loading news...
                  </p>
                </div>
              ) : error ? (
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
                          <button
                            key={index}
                            onClick={() => handleHashtagClick(keyword)}
                            className="text-xs font-mono text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 hover:bg-blue-100 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 cursor-pointer rounded-sm shadow-sm hover:shadow-md"
                            title={`Jump to ${keyword}`}
                          >
                            {keyword}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* News Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <NewsCard 
                      news={weeklyNews.tech} 
                      onAskAI={() => handleAskAI(weeklyNews.tech)}
                      isHighlighted={highlightedCategory === 'tech'}
                      onHashtagClick={handleHashtagClick}
                    />
                    <NewsCard 
                      news={weeklyNews.politics} 
                      onAskAI={() => handleAskAI(weeklyNews.politics)}
                      isHighlighted={highlightedCategory === 'politics'}
                      onHashtagClick={handleHashtagClick}
                    />
                    <NewsCard 
                      news={weeklyNews.economy} 
                      onAskAI={() => handleAskAI(weeklyNews.economy)}
                      isHighlighted={highlightedCategory === 'economy'}
                      onHashtagClick={handleHashtagClick}
                    />
                    <NewsCard 
                      news={weeklyNews.sfLocal} 
                      onAskAI={() => handleAskAI(weeklyNews.sfLocal)}
                      isHighlighted={highlightedCategory === 'sf-local'}
                      onHashtagClick={handleHashtagClick}
                    />
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

      {/* News Q&A Modal */}
      {selectedNews && weeklyNews && (
        <NewsQAModal
          isOpen={qaModalOpen}
          onClose={() => {
            setQaModalOpen(false);
            setSelectedNews(null);
          }}
          news={selectedNews}
          weekOf={formatWeekDate(weeklyNews.weekOf)}
        />
      )}
    </main>
  );
}
