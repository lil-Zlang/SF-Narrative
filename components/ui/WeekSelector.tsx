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

  const getWeekNumber = (date: Date) => {
    // Custom week number calculation to match desired numbering
    // Oct 20, 2025 should be W43, so we add +1 to ISO week
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const isoWeek = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return isoWeek + 1; // Add 1 to match desired numbering (Oct 20 = W43)
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
