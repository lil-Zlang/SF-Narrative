'use client';

interface TimelineEvent {
  id: string;
  headline: string;
  weekOf: Date;
  hypeSummary: string;
  backlashSummary: string;
  weeklyPulse: string;
  createdAt: Date;
  updatedAt: Date;
}

interface TimelineSidebarProps {
  events: TimelineEvent[];
  activeEventId?: string;
  onEventClick?: (eventId: string) => void;
}

export default function TimelineSidebar({ 
  events, 
  activeEventId, 
  onEventClick 
}: TimelineSidebarProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatYear = (date: Date) => {
    return new Date(date).getFullYear();
  };

  return (
    <div className="w-80 bg-gray-50 border-l border-gray-200 p-6 overflow-y-auto">
      <div className="sticky top-6">
        <h3 className="text-lg font-mono font-bold mb-6 text-gray-800">
          Timeline
        </h3>
        
        <div className="space-y-6">
          {events.map((event, index) => {
            const isActive = activeEventId === event.id;
            const isFirst = index === 0;
            const isLast = index === events.length - 1;
            
            return (
              <div key={event.id} className="relative">
                {/* Timeline Line */}
                {!isLast && (
                  <div className="absolute left-4 top-8 w-px h-16 bg-gray-300"></div>
                )}
                
                {/* Timeline Dot */}
                <div className="flex items-start">
                  <div className={`
                    w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-mono font-bold
                    ${isActive 
                      ? 'bg-black text-white border-black' 
                      : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                    }
                    transition-colors cursor-pointer
                  `}>
                    {index + 1}
                  </div>
                  
                  {/* Event Content */}
                  <div className="ml-4 flex-1 min-w-0">
                    <div 
                      className={`
                        cursor-pointer group
                        ${isActive ? 'opacity-100' : 'opacity-70 hover:opacity-100'}
                        transition-opacity
                      `}
                      onClick={() => onEventClick?.(event.id)}
                    >
                      <div className="text-xs font-mono text-gray-500 mb-1">
                        {formatDate(event.weekOf)} {formatYear(event.weekOf)}
                      </div>
                      <h4 className={`
                        text-sm font-mono font-bold mb-2 leading-tight
                        ${isActive ? 'text-black' : 'text-gray-700 group-hover:text-black'}
                        transition-colors
                      `}>
                        {event.headline}
                      </h4>
                      <p className="text-xs font-mono text-gray-600 leading-relaxed line-clamp-3">
                        {event.weeklyPulse}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Timeline Legend */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-xs font-mono text-gray-500 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-100 border border-green-300 rounded-sm"></div>
              <span>Hype Narrative</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-100 border border-red-300 rounded-sm"></div>
              <span>Backlash Narrative</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded-sm"></div>
              <span>Post-Battle Analysis</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
