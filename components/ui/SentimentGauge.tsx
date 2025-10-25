'use client';

interface SentimentGaugeProps {
  userSentiment: { hype: number; backlash: number };
  communitySentiment: { hype: number; backlash: number };
  onSentimentChange?: (sentiment: { hype: number; backlash: number }) => void;
}

export default function SentimentGauge({ 
  userSentiment, 
  communitySentiment, 
  onSentimentChange 
}: SentimentGaugeProps) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
      <h4 className="text-sm font-mono font-bold mb-3 text-gray-800">
        Sentiment Analysis
      </h4>
      
      {/* User Sentiment Only */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-mono text-gray-600">Your Take:</span>
          <div className="flex gap-2 text-xs font-mono">
            <span className="text-green-700 font-bold">
              {userSentiment.hype}% Positive
            </span>
            <span className="text-gray-400">/</span>
            <span className="text-red-700 font-bold">
              {userSentiment.backlash}% Negative
            </span>
          </div>
        </div>
        
        {/* Visual Sentiment Bar */}
        <div className="space-y-2">
          <div>
            <div className="text-xs font-mono text-gray-500 mb-1">Your Sentiment</div>
            <div className="flex h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="bg-green-500 transition-all duration-300"
                style={{ width: `${userSentiment.hype}%` }}
              ></div>
              <div 
                className="bg-red-500 transition-all duration-300"
                style={{ width: `${userSentiment.backlash}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
