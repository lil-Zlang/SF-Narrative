'use client';

import { UI_CONFIG } from '@/lib/constants';
import SplitScreenBattle from './ui/SplitScreenBattle';
import type { TimelineEvent, TimelineEventCardProps } from '@/lib/types';

/**
 * TimelineEventCard Component
 * 
 * Wrapper component that displays a single timeline event using the SplitScreenBattle
 */
export default function TimelineEventCard({ event }: TimelineEventCardProps) {
  return (
    <div className="mb-12">
      <SplitScreenBattle
        eventId={event.id}
        headline={event.headline}
        weekOf={event.weekOf}
        hypeContent={event.hypeSummary}
        backlashContent={event.backlashSummary}
        summary={event.weeklyPulse}
        hypeTweets={event.hypeTweets || []}
        backlashTweets={event.backlashTweets || []}
        communitySentiment={event.communitySentiment || UI_CONFIG.DEFAULT_COMMUNITY_SENTIMENT}
      />
    </div>
  );
}

