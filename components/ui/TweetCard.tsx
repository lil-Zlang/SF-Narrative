'use client';

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

interface TweetCardProps {
  tweet: Tweet;
}

export default function TweetCard({ tweet }: TweetCardProps) {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <div className={`
      p-4 rounded-lg border transition-all duration-200 hover:shadow-sm
      ${tweet.sentiment === 'hype' 
        ? 'bg-green-50 border-green-200 hover:bg-green-100' 
        : 'bg-red-50 border-red-200 hover:bg-red-100'
      }
    `}>
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className={`
          w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold
          ${tweet.sentiment === 'hype' 
            ? 'bg-green-200 text-green-800' 
            : 'bg-red-200 text-red-800'
          }
        `}>
          {tweet.author.charAt(0).toUpperCase()}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-mono font-bold text-gray-800">
              {tweet.author}
            </span>
            <span className="text-xs font-mono text-gray-500">
              @{tweet.username}
            </span>
            <span className="text-xs font-mono text-gray-400">
              · {formatTimestamp(tweet.timestamp)}
            </span>
          </div>
          
          <p className="text-sm font-mono text-gray-700 leading-relaxed mb-2">
            {tweet.text}
          </p>
          
          {/* Engagement */}
          <div className="flex items-center gap-4 text-xs font-mono text-gray-500">
            <span>{formatNumber(tweet.likes)} likes</span>
            <span>{formatNumber(tweet.retweets)} retweets</span>
          </div>
        </div>
      </div>
    </div>
  );
}
