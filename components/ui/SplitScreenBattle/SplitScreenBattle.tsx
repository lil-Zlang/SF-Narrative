'use client';

import { useState, useRef, useEffect } from 'react';
import { UI_CONFIG, UI_TEXT } from '@/lib/constants';
import { calculateCommunitySentiment } from '@/lib/utils';
import { handleApiError, logError } from '@/lib/error-handler';
import type { SplitScreenBattleProps, SentimentData } from '@/lib/types';
import { Slider } from './Slider';
import { ContentPanel } from './ContentPanel';
import { BattleHeader } from './BattleHeader';
import { PostBattleAnalysis } from './PostBattleAnalysis';
import SentimentGauge from '../SentimentGauge';
import ChatbotModal from '../ChatbotModal';

/**
 * SplitScreenBattle Component
 * 
 * A interactive component that allows users to explore competing narratives
 * about San Francisco events through a draggable slider interface.
 */
export default function SplitScreenBattle({
  eventId,
  headline,
  weekOf,
  hypeContent,
  backlashContent,
  summary,
  hypeTweets = [],
  backlashTweets = [],
  communitySentiment = UI_CONFIG.DEFAULT_COMMUNITY_SENTIMENT
}: SplitScreenBattleProps) {
  const [sliderPosition, setSliderPosition] = useState<number>(UI_CONFIG.DEFAULT_SLIDER_POSITION);
  const [isDragging, setIsDragging] = useState(false);
  const [userSentiment, setUserSentiment] = useState<{hype: number; backlash: number}>(UI_CONFIG.DEFAULT_SENTIMENT);
  const [showSentimentGauge, setShowSentimentGauge] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [currentCommunitySentiment, setCurrentCommunitySentiment] = useState<{hype: number; backlash: number}>(communitySentiment);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * Handle mouse down event to start dragging
   */
  const handleMouseDown = () => {
    setIsDragging(true);
  };

  /**
   * Handle mouse move event during dragging
   */
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  /**
   * Handle mouse up event to stop dragging and save vote
   */
  const handleMouseUp = async () => {
    setIsDragging(false);
    
    // Update user sentiment based on final position
    const newUserSentiment = {
      hype: sliderPosition,
      backlash: 100 - sliderPosition
    };
    setUserSentiment(newUserSentiment);
    setShowSentimentGauge(true);

    // Save user vote to database
    await saveUserVote(sliderPosition, 100 - sliderPosition);
  };

  /**
   * Save user vote to the database
   */
  const saveUserVote = async (hypePercentage: number, backlashPercentage: number) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          hypePercentage,
          backlashPercentage
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.communitySentiment) {
        setCurrentCommunitySentiment(result.communitySentiment);
        console.log(`Vote saved! Community sentiment: ${result.communitySentiment.hype}% hype, ${result.communitySentiment.backlash}% backlash (${result.totalVotes} total votes)`);
      }
    } catch (error) {
      const appError = handleApiError(error, 'Vote Save');
      logError(appError, 'SplitScreenBattle');
      console.error('Failed to save vote:', appError.message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Set up event listeners for mouse events
   */
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, sliderPosition]);

  /**
   * Determine what content to show based on slider position
   */
  const getContentToShow = () => {
    const threshold = UI_CONFIG.SLIDER_THRESHOLD;
    
    if (sliderPosition < (50 - threshold)) {
      // Show backlash tweets
      return {
        left: { type: 'summary' as const, content: hypeContent },
        right: { type: 'tweets' as const, content: backlashTweets }
      };
    } else if (sliderPosition > (50 + threshold)) {
      // Show hype tweets
      return {
        left: { type: 'tweets' as const, content: hypeTweets },
        right: { type: 'summary' as const, content: backlashContent }
      };
    } else {
      // Show summaries
      return {
        left: { type: 'summary' as const, content: hypeContent },
        right: { type: 'summary' as const, content: backlashContent }
      };
    }
  };

  const contentToShow = getContentToShow();
  const contextData = {
    headline,
    weekOf: weekOf.toISOString(),
    hypeContent,
    backlashContent,
    summary,
    hypeTweets,
    backlashTweets
  };

  return (
    <div className="mb-8">
      <BattleHeader 
        headline={headline}
        weekOf={weekOf}
      />

      {showSentimentGauge && (
        <SentimentGauge 
          userSentiment={userSentiment}
          communitySentiment={currentCommunitySentiment}
        />
      )}

      <div 
        ref={containerRef}
        className="relative h-56 border-clean overflow-hidden cursor-col-resize"
        onMouseDown={handleMouseDown}
      >
        <ContentPanel
          content={contentToShow.left}
          sentiment="hype"
          width={sliderPosition}
          isLoading={isLoading}
        />

        <ContentPanel
          content={contentToShow.right}
          sentiment="backlash"
          width={100 - sliderPosition}
          isLoading={isLoading}
        />

        <Slider
          position={sliderPosition}
          isDragging={isDragging}
        />
      </div>

      <PostBattleAnalysis
        summary={summary}
        onAskQuestions={() => setIsChatbotOpen(true)}
      />

      {isChatbotOpen && (
        <ChatbotModal
          isOpen={isChatbotOpen}
          onClose={() => setIsChatbotOpen(false)}
          contextData={contextData}
        />
      )}
    </div>
  );
}
