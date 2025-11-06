'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Week {
  weekOf: Date;
  label: string;
}

interface WeekSelectorProps {
  weeks: Week[];
  selectedWeek: Date | null;
  onSelectWeek: (weekOf: Date) => void;
}

/**
 * WeekSelector Component
 * 
 * Horizontal timeline-style week selector for browsing historical weekly news
 */
export default function WeekSelector({ weeks, selectedWeek, onSelectWeek }: WeekSelectorProps) {
  // Group weeks by month
  const groupedWeeks = weeks.reduce((acc, week) => {
    const date = new Date(week.weekOf);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    if (!acc[monthKey]) {
      acc[monthKey] = {
        name: monthName,
        weeks: [],
      };
    }
    acc[monthKey].weeks.push(week);
    return acc;
  }, {} as Record<string, { name: string; weeks: Week[] }>);

  const months = Object.values(groupedWeeks);

  const formatWeekDate = (date: Date) => {
    const weekDate = new Date(date);
    return weekDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDayNumber = (date: Date) => {
    return new Date(date).getDate();
  };

  const getWeekNumber = (date: Date | string) => {
    // Calculate week number for Sunday-starting weeks to match calendar format
    // Week starts on Sunday, ends on Saturday
    // Week 1 starts on Dec 28, 2024 (for 2025) or the Sunday before Jan 1
    // Oct 20, 2025 should be W43 (Week 43: Oct 19-25)
    
    // Parse date properly to avoid timezone issues
    let year: number, month: number, day: number;
    
    if (typeof date === 'string') {
      // Parse ISO string directly (YYYY-MM-DD format)
      const parts = date.split('T')[0].split('-');
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
      day = parseInt(parts[2], 10);
    } else {
      // For Date objects, convert to ISO string first to get the actual calendar date
      // This avoids timezone conversion issues
      const isoString = date.toISOString().split('T')[0];
      const parts = isoString.split('-');
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
      day = parseInt(parts[2], 10);
    }
    
    // Create date in local timezone
    const localDate = new Date(year, month, day);
    
    // Find the Sunday that starts the week containing this date
    const dayOfWeek = localDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const sundayOfWeek = new Date(year, month, day - dayOfWeek);
    sundayOfWeek.setHours(0, 0, 0, 0);
    
    // Find Week 1 start: Dec 28 of the year before (or adjusted for Jan 1)
    const weekYear = sundayOfWeek.getFullYear();
    const jan1 = new Date(weekYear, 0, 1);
    jan1.setHours(0, 0, 0, 0);
    const jan1DayOfWeek = jan1.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Find the Sunday before Jan 1, then subtract 1 day to get Dec 28
    let week1Start: Date;
    if (jan1DayOfWeek === 0) {
      // Jan 1 is Sunday, so Week 1 starts on Jan 1
      week1Start = new Date(jan1);
    } else {
      // Jan 1 is not Sunday, find the Sunday before Jan 1, then subtract 1 day
      week1Start = new Date(weekYear, 0, 1 - jan1DayOfWeek - 1);
      week1Start.setHours(0, 0, 0, 0);
    }
    
    // Calculate week number based on days from Week 1 start
    const daysDiff = Math.floor((sundayOfWeek.getTime() - week1Start.getTime()) / (1000 * 60 * 60 * 24));
    const weekNumber = Math.floor(daysDiff / 7) + 1;
    
    return weekNumber;
  };

  const isSelected = (week: Week) => {
    if (!selectedWeek) return false;
    return new Date(week.weekOf).toDateString() === new Date(selectedWeek).toDateString();
  };

  const currentIndex = weeks.findIndex(w => 
    selectedWeek && new Date(w.weekOf).toDateString() === new Date(selectedWeek).toDateString()
  );

  const goToPreviousWeek = () => {
    if (currentIndex < weeks.length - 1) {
      onSelectWeek(weeks[currentIndex + 1].weekOf);
    }
  };

  const goToNextWeek = () => {
    if (currentIndex > 0) {
      onSelectWeek(weeks[currentIndex - 1].weekOf);
    }
  };

  return (
    <div className="border-2 border-black bg-white">
      {/* Header with navigation */}
      <div className="border-b-2 border-black bg-gray-50 px-6 py-3 flex items-center justify-between">
        <button
          onClick={goToPreviousWeek}
          disabled={currentIndex >= weeks.length - 1}
          className="p-2 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors border border-gray-300 bg-white"
          title="Previous Week"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="font-mono text-sm font-bold">
          SELECT WEEK • {weeks.length} AVAILABLE
        </div>

        <button
          onClick={goToNextWeek}
          disabled={currentIndex <= 0}
          className="p-2 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors border border-gray-300 bg-white"
          title="Next Week"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Timeline View */}
      <div className="p-6 overflow-x-auto">
        <div className="flex gap-8">
          {months.map((month, monthIdx) => (
            <div key={monthIdx} className="flex-shrink-0">
              {/* Month Label */}
              <div className="mb-4 pb-2 border-b-2 border-gray-300">
                <h3 className="font-mono text-xs font-bold text-gray-600 uppercase tracking-wider">
                  {month.name}
                </h3>
              </div>

              {/* Week Cards */}
              <div className="flex gap-3">
                {month.weeks.map((week, weekIdx) => {
                  const selected = isSelected(week);
                  const isLatest = weeks.indexOf(week) === 0;
                  
                  return (
                    <button
                      key={weekIdx}
                      onClick={() => onSelectWeek(week.weekOf)}
                      className={`relative flex flex-col items-center justify-center w-20 h-28 border-2 font-mono transition-all ${
                        selected
                          ? 'border-black bg-black text-white scale-105 shadow-lg'
                          : 'border-gray-300 bg-white hover:border-gray-400 hover:shadow-md'
                      }`}
                      title={`Week ${getWeekNumber(week.weekOf)} - ${formatWeekDate(week.weekOf)}`}
                    >
                      {/* Latest Badge */}
                      {isLatest && !selected && (
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 whitespace-nowrap">
                          LATEST
                        </div>
                      )}

                      {/* Week Number */}
                      <div className={`text-xs font-bold mb-1 ${selected ? 'text-gray-400' : 'text-gray-500'}`}>
                        W{getWeekNumber(week.weekOf)}
                      </div>

                      {/* Day Number */}
                      <div className={`text-2xl font-bold ${selected ? 'text-white' : 'text-gray-900'}`}>
                        {formatDayNumber(week.weekOf)}
                      </div>

                      {/* Month Label (short) */}
                      <div className={`text-xs mt-1 ${selected ? 'text-gray-300' : 'text-gray-500'}`}>
                        {new Date(week.weekOf).toLocaleDateString('en-US', { month: 'short' })}
                      </div>

                      {/* Selected Indicator */}
                      {selected && (
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-white"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Week Display */}
      <div className="border-t-2 border-black bg-gray-50 px-6 py-3">
        <div className="font-mono text-sm">
          <span className="text-gray-600">VIEWING: </span>
          <span className="font-bold">
            Week of {selectedWeek ? formatWeekDate(selectedWeek) : 'None'}
          </span>
        </div>
      </div>
    </div>
  );
}
