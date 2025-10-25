'use client';

import { formatTimestamp, formatNumber } from '@/lib/utils';
import { componentStyles, colors } from '@/lib/design-system';
import type { Tweet, TweetCardProps } from '@/lib/types';

/**
 * TweetCard Component
 * 
 * Displays a single tweet with author info, content, and engagement metrics
 */
export default function TweetCard({ tweet, sentiment }: TweetCardProps) {
  const isHype = sentiment === 'hype';
  const cardStyles = isHype 
    ? 'bg-green-50 border-green-200 hover:bg-green-100' 
    : 'bg-red-50 border-red-200 hover:bg-red-100';
  
  const avatarStyles = isHype 
    ? 'bg-green-200 text-green-800' 
    : 'bg-red-200 text-red-800';

  return (
    <div className={`p-2.5 rounded-lg border transition-all duration-200 hover:shadow-sm ${cardStyles}`}>
      <div className="flex items-start gap-2">
        {/* Avatar */}
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold ${avatarStyles}`}>
          {tweet.author.charAt(0).toUpperCase()}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-xs font-mono font-bold text-gray-800">
              {tweet.author}
            </span>
            <span className="text-xs font-mono text-gray-500">
              @{tweet.username}
            </span>
            <span className="text-xs font-mono text-gray-400">
              · {formatTimestamp(tweet.timestamp)}
            </span>
          </div>
          
          <p className="text-xs font-mono text-gray-700 leading-relaxed mb-1.5">
            {tweet.text}
          </p>
          
          {/* Engagement */}
          <div className="flex items-center gap-3 text-xs font-mono text-gray-500">
            <span>{formatNumber(tweet.likes)} likes</span>
            <span>{formatNumber(tweet.retweets)} retweets</span>
          </div>
        </div>
      </div>
    </div>
  );
}
