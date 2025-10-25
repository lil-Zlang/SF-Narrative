'use client';

import { useState, useRef, useEffect } from 'react';
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
  const [sliderPosition, setSliderPosition] = useState(50); // 0-100 percentage
  const [isDragging, setIsDragging] = useState(false);
  const [userSentiment, setUserSentiment] = useState({ hype: 50, backlash: 50 });
  const [showSentimentGauge, setShowSentimentGauge] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [currentCommunitySentiment, setCurrentCommunitySentiment] = useState(communitySentiment);
  const containerRef = useRef<HTMLDivElement>(null);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

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
    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: eventId,
          hypePercentage: sliderPosition,
          backlashPercentage: 100 - sliderPosition
        })
      });

      const result = await response.json();
      if (result.success) {
        // Update community sentiment with real data
        setCurrentCommunitySentiment(result.communitySentiment);
        console.log(`Vote saved! Community sentiment: ${result.communitySentiment.hype}% hype, ${result.communitySentiment.backlash}% backlash (${result.totalVotes} total votes)`);
      }
    } catch (error) {
      console.error('Failed to save vote:', error);
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  // Determine what content to show based on slider position
  const getContentToShow = () => {
    const threshold = 20; // Percentage threshold for showing tweets
    
    if (sliderPosition < (50 - threshold)) {
      // Show backlash tweets
      return {
        left: { type: 'summary', content: hypeContent },
        right: { type: 'tweets', content: backlashTweets }
      };
    } else if (sliderPosition > (50 + threshold)) {
      // Show hype tweets
      return {
        left: { type: 'tweets', content: hypeTweets },
        right: { type: 'summary', content: backlashContent }
      };
    } else {
      // Show summaries
      return {
        left: { type: 'summary', content: hypeContent },
        right: { type: 'summary', content: backlashContent }
      };
    }
  };

  const contentToShow = getContentToShow();

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

      {/* Split Screen Battlefield - More Compact */}
      <div 
        ref={containerRef}
        className="relative h-56 border-clean overflow-hidden cursor-col-resize"
        onMouseDown={handleMouseDown}
      >
        {/* Hype Side (Green) */}
        <div 
          className="absolute top-0 left-0 h-full bg-green-50 border-r-2 border-green-200 transition-all duration-100"
          style={{ width: `${sliderPosition}%` }}
        >
          <div className="p-3 h-full overflow-y-auto">
            <div className="mb-1.5">
              <span className="text-xs font-mono font-bold text-green-700 bg-green-200 px-2 py-0.5">
                HYPE NARRATIVE
              </span>
            </div>
            
            {contentToShow.left.type === 'summary' ? (
              <p className="text-xs font-mono text-gray-800 leading-relaxed">
                {contentToShow.left.content as string}
              </p>
            ) : (
              <div className="space-y-1.5">
                <p className="text-xs font-mono text-green-600 mb-1">
                  Evidence Layer: Pro-tweets
                </p>
                {(contentToShow.left.content as Tweet[]).slice(0, 3).map((tweet) => (
                  <TweetCard key={tweet.id} tweet={tweet} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Backlash Side (Red) */}
        <div 
          className="absolute top-0 right-0 h-full bg-red-50 border-l-2 border-red-200 transition-all duration-100"
          style={{ width: `${100 - sliderPosition}%` }}
        >
          <div className="p-3 h-full overflow-y-auto">
            <div className="mb-1.5">
              <span className="text-xs font-mono font-bold text-red-700 bg-red-200 px-2 py-0.5">
                BACKLASH NARRATIVE
              </span>
            </div>
            
            {contentToShow.right.type === 'summary' ? (
              <p className="text-xs font-mono text-gray-800 leading-relaxed">
                {contentToShow.right.content as string}
              </p>
            ) : (
              <div className="space-y-1.5">
                <p className="text-xs font-mono text-red-600 mb-1">
                  Evidence Layer: Anti-tweets
                </p>
                {(contentToShow.right.content as Tweet[]).slice(0, 3).map((tweet) => (
                  <TweetCard key={tweet.id} tweet={tweet} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Interactive Slider */}
        <div 
          className="absolute top-0 w-1 h-full bg-black cursor-col-resize z-10 hover:bg-gray-600 transition-colors"
          style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        >
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-8 bg-black rounded-sm"></div>
        </div>

        {/* Center Label */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
          <span className="text-xs font-mono font-bold bg-white px-2 py-1 border border-gray-300">
            DRAG TO EXCAVATE EVIDENCE
          </span>
        </div>
      </div>

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
