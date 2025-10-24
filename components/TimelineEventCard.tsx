'use client';

import SplitScreenBattle from './ui/SplitScreenBattle';

interface TimelineEvent {
  id: string;
  headline: string;
  weekOf: Date;
  hypeSummary: string;
  backlashSummary: string;
  weeklyPulse: string;
  hypeTweets?: any;
  backlashTweets?: any;
  communitySentiment?: any;
  createdAt: Date;
  updatedAt: Date;
}

interface TimelineEventCardProps {
  event: TimelineEvent;
}

export default function TimelineEventCard({ event }: TimelineEventCardProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatWeek = (date: Date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  };

  return (
    <div className="mb-12">
      {/* Split Screen Battlefield */}
      <SplitScreenBattle
        eventId={event.id}
        headline={event.headline}
        weekOf={event.weekOf}
        hypeContent={event.hypeSummary}
        backlashContent={event.backlashSummary}
        summary={event.weeklyPulse}
        hypeTweets={event.hypeTweets || []}
        backlashTweets={event.backlashTweets || []}
        communitySentiment={event.communitySentiment || { hype: 60, backlash: 40 }}
      />
    </div>
  );
}

