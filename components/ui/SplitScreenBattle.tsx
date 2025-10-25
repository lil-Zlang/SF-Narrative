'use client';

import { useState } from 'react';
import TweetCard from './TweetCard';
import SentimentGauge from './SentimentGauge';
import ChatbotModal from './ChatbotModal';

interface Tweet {
  id: string;
  text: string;
  author: string;
  username: string;
  timestamp: string;
  likes: number;
  retweets: number;
  sentiment: 'hype' | 'backlash';
}

interface SplitScreenBattleProps {
  eventId: string;
  headline: string;
  weekOf: Date;
  hypeContent: string;
  backlashContent: string;
  summary: string;
  hypeTweets?: Tweet[];
  backlashTweets?: Tweet[];
  communitySentiment?: { hype: number; backlash: number };
}

export default function SplitScreenBattle({ 
  eventId,
  headline,
  weekOf,
  hypeContent, 
  backlashContent, 
  summary,
  hypeTweets = [],
  backlashTweets = [],
  communitySentiment = { hype: 60, backlash: 40 }
}: SplitScreenBattleProps) {
  const [userSentiment, setUserSentiment] = useState({ hype: 50, backlash: 50 });
  const [showSentimentGauge, setShowSentimentGauge] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [currentCommunitySentiment, setCurrentCommunitySentiment] = useState(communitySentiment);
  const [showTweets, setShowTweets] = useState(false);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  /**
   * Handle vote submission
   */
  const handleVote = async (sentiment: {hype: number; backlash: number}) => {
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
      console.error('Failed to save vote:', error);
    }
  };

  const contextData = {
    headline,
    weekOf: formatDate(weekOf),
    hypeContent,
    backlashContent,
    summary,
    hypeTweets,
    backlashTweets
  };

  return (
    <div className="mb-8">
      {/* Event Header with Date and Headline on Same Line */}
      <div className="border-clean mb-4">
        <div className="px-6 py-4">
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-mono font-bold text-gray-400">
              {formatDate(weekOf)}
            </span>
            <h2 className="text-xl font-mono font-bold">{headline}</h2>
          </div>
        </div>
      </div>

      {/* Sentiment Gauge */}
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
                  <TweetCard key={tweet.id} tweet={tweet} sentiment="hype" />
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
                  <TweetCard key={tweet.id} tweet={tweet} sentiment="backlash" />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post-Battle Analysis */}
      <div className="border-clean mt-4">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-bold text-gray-600 bg-gray-100 px-2 py-1">
              AI ANALYSIS
            </span>
            <button
              onClick={() => setIsChatbotOpen(true)}
              className="text-xs font-mono font-bold bg-black text-white px-3 py-1 hover:bg-gray-800 transition-colors border border-black hover-invert"
            >
              💬 ASK QUESTIONS
            </button>
          </div>
          <div className="text-sm font-mono text-gray-700 leading-relaxed">
            <p className="text-gray-800 font-medium">
              {summary}
            </p>
          </div>
        </div>
      </div>

      {/* Chatbot Modal */}
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
