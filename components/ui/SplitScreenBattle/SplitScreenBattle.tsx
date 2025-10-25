'use client';

import { useState } from 'react';
import { UI_CONFIG, UI_TEXT } from '@/lib/constants';
import { handleApiError, logError, AppError } from '@/lib/error-handler';
import type { SplitScreenBattleProps } from '@/lib/types';
import { ContentPanel } from './ContentPanel';
import { BattleHeader } from './BattleHeader';
import { PostBattleAnalysis } from './PostBattleAnalysis';
import SentimentGauge from '../SentimentGauge';
import ChatbotModal from '../ChatbotModal';

/**
 * SplitScreenBattle Component
 * 
 * A component that displays competing narratives about San Francisco events
 * with an expandable tweets section.
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
  const [userSentiment, setUserSentiment] = useState<{hype: number; backlash: number}>(UI_CONFIG.DEFAULT_SENTIMENT);
  const [showSentimentGauge, setShowSentimentGauge] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [currentCommunitySentiment, setCurrentCommunitySentiment] = useState<{hype: number; backlash: number}>(communitySentiment);
  const [isLoading, setIsLoading] = useState(false);
  const [showTweets, setShowTweets] = useState(false);

  /**
   * Handle vote submission
   */
  const handleVote = async (sentiment: {hype: number; backlash: number}) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          sentiment
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.communitySentiment) {
          setCurrentCommunitySentiment(result.communitySentiment);
        }
        setUserSentiment(sentiment);
        setShowSentimentGauge(true);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save vote');
      }
    } catch (error) {
      const appError = new AppError('Failed to save vote', 'VOTE_SAVE_ERROR', 500, error);
      logError(appError, 'SplitScreenBattle');
    } finally {
      setIsLoading(false);
    }
  };

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

      {/* Narratives Display */}
      <div className="border-clean overflow-hidden">
        <div className="grid grid-cols-2 h-56">
          {/* Positive Narrative */}
          <div className="bg-green-50 border-r-2 border-green-200">
            <div className="p-3 h-full overflow-y-auto">
              <div className="mb-1.5">
                <span className="text-xs font-mono font-bold text-green-700 bg-green-200 px-2 py-0.5">
                  POSITIVE NARRATIVE
                </span>
              </div>
              <p className="text-xs font-mono text-gray-800 leading-relaxed">
                {hypeContent}
              </p>
            </div>
          </div>

          {/* Negative Narrative */}
          <div className="bg-red-50 border-l-2 border-red-200">
            <div className="p-3 h-full overflow-y-auto">
              <div className="mb-1.5">
                <span className="text-xs font-mono font-bold text-red-700 bg-red-200 px-2 py-0.5">
                  NEGATIVE NARRATIVE
                </span>
              </div>
              <p className="text-xs font-mono text-gray-800 leading-relaxed">
                {backlashContent}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Expand Tweets Button */}
      <div className="mt-4 text-center">
        <button
          onClick={() => setShowTweets(!showTweets)}
          className="px-4 py-2 font-mono font-bold text-sm bg-black text-white border-2 border-black transition-colors hover:bg-gray-800"
        >
          {showTweets ? 'HIDE TWEETS' : 'SHOW TWEETS'}
        </button>
      </div>

      {/* Tweets Section */}
      {showTweets && (
        <div className="mt-4 border-clean">
          <div className="grid grid-cols-2">
            {/* Positive Tweets */}
            <div className="bg-green-50 border-r-2 border-green-200 p-3">
              <div className="mb-2">
                <span className="text-xs font-mono font-bold text-green-700 bg-green-200 px-2 py-0.5">
                  POSITIVE TWEETS
                </span>
              </div>
              <div className="space-y-2">
                {hypeTweets.slice(0, 5).map((tweet) => (
                  <div key={tweet.id} className="p-2.5 rounded-lg border bg-green-50 border-green-200 hover:bg-green-100 transition-all duration-200">
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold bg-green-200 text-green-800">
                        {tweet.author.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-xs font-mono font-bold text-gray-800">
                            {tweet.author}
                          </span>
                          <span className="text-xs font-mono text-gray-500">
                            @{tweet.username}
                          </span>
                        </div>
                        <p className="text-xs font-mono text-gray-700 leading-relaxed mb-1.5">
                          {tweet.text}
                        </p>
                        <div className="flex items-center gap-3 text-xs font-mono text-gray-500">
                          <span>{tweet.likes} likes</span>
                          <span>{tweet.retweets} retweets</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Negative Tweets */}
            <div className="bg-red-50 border-l-2 border-red-200 p-3">
              <div className="mb-2">
                <span className="text-xs font-mono font-bold text-red-700 bg-red-200 px-2 py-0.5">
                  NEGATIVE TWEETS
                </span>
              </div>
              <div className="space-y-2">
                {backlashTweets.slice(0, 5).map((tweet) => (
                  <div key={tweet.id} className="p-2.5 rounded-lg border bg-red-50 border-red-200 hover:bg-red-100 transition-all duration-200">
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold bg-red-200 text-red-800">
                        {tweet.author.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-xs font-mono font-bold text-gray-800">
                            {tweet.author}
                          </span>
                          <span className="text-xs font-mono text-gray-500">
                            @{tweet.username}
                          </span>
                        </div>
                        <p className="text-xs font-mono text-gray-700 leading-relaxed mb-1.5">
                          {tweet.text}
                        </p>
                        <div className="flex items-center gap-3 text-xs font-mono text-gray-500">
                          <span>{tweet.likes} likes</span>
                          <span>{tweet.retweets} retweets</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

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