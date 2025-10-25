'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, MessageSquare } from 'lucide-react';
import type { CategoryNews } from '@/lib/types';

interface NewsCardProps {
  news: CategoryNews;
  onAskAI: () => void;
  isHighlighted?: boolean;
  onHashtagClick?: (keyword: string) => void;
}

const CATEGORY_STYLES = {
  tech: {
    badge: 'bg-blue-100 text-blue-800 border-blue-300',
    header: 'border-blue-200 bg-blue-50',
    highlight: 'ring-4 ring-blue-400 ring-offset-4',
    label: 'Technology',
  },
  politics: {
    badge: 'bg-purple-100 text-purple-800 border-purple-300',
    header: 'border-purple-200 bg-purple-50',
    highlight: 'ring-4 ring-purple-400 ring-offset-4',
    label: 'Politics',
  },
  economy: {
    badge: 'bg-green-100 text-green-800 border-green-300',
    header: 'border-green-200 bg-green-50',
    highlight: 'ring-4 ring-green-400 ring-offset-4',
    label: 'Economy',
  },
  'sf-local': {
    badge: 'bg-orange-100 text-orange-800 border-orange-300',
    header: 'border-orange-200 bg-orange-50',
    highlight: 'ring-4 ring-orange-400 ring-offset-4',
    label: 'SF Local',
  },
};

export default function NewsCard({ news, onAskAI, isHighlighted, onHashtagClick }: NewsCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showHighlight, setShowHighlight] = useState(false);
  const styles = CATEGORY_STYLES[news.category];

  // Handle highlight animation
  useEffect(() => {
    if (isHighlighted) {
      setShowHighlight(true);
      // Auto-remove highlight after 3 seconds
      const timer = setTimeout(() => setShowHighlight(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isHighlighted]);

  return (
    <div 
      id={`news-${news.category}`}
      className={`border border-gray-300 bg-white hover:shadow-lg transition-all duration-300 ${
        showHighlight ? styles.highlight : ''
      }`}
    >
      {/* Header with category badge */}
      <div className={`border-b px-6 py-4 ${styles.header}`}>
        <div className="flex items-center justify-between">
          <span className={`px-3 py-1 text-xs font-mono font-bold border ${styles.badge}`}>
            {styles.label}
          </span>
          {news.keywords.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {news.keywords.slice(0, 3).map((keyword, index) => (
                <button
                  key={index}
                  onClick={() => onHashtagClick?.(keyword)}
                  className="text-xs font-mono text-blue-600 bg-blue-50 border border-blue-200 px-2 py-1 hover:bg-blue-100 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 cursor-pointer rounded-sm shadow-sm hover:shadow-md"
                  title={`Jump to ${keyword}`}
                >
                  #{keyword}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Card content */}
      <div className="p-6">
        {/* Short summary - always visible */}
        <p className="text-sm font-mono text-gray-800 leading-relaxed mb-4">
          {news.summaryShort}
        </p>

        {/* Expanded content */}
        {isExpanded && (
          <div className="mt-6 space-y-6 border-t border-gray-200 pt-6">
            {/* Detailed narrative */}
            <div>
              <h4 className="text-xs font-mono font-bold text-gray-500 uppercase mb-3">
                In-Depth Analysis
              </h4>
              <div className="text-sm font-mono text-gray-700 leading-relaxed space-y-3">
                {news.summaryDetailed.split('\n\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Bullet points */}
            {news.bullets.length > 0 && (
              <div>
                <h4 className="text-xs font-mono font-bold text-gray-500 uppercase mb-3">
                  Key Developments
                </h4>
                <ul className="space-y-2">
                  {news.bullets.map((bullet, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-gray-400 font-mono text-xs mt-1">•</span>
                      <span className="text-sm font-mono text-gray-700 leading-relaxed flex-1">
                        {bullet}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Sources */}
            {news.sources.length > 0 && (
              <div>
                <h4 className="text-xs font-mono font-bold text-gray-500 uppercase mb-3">
                  Sources
                </h4>
                <div className="space-y-2">
                  {news.sources.slice(0, 5).map((source, index) => (
                    <a
                      key={index}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-2 text-sm font-mono text-blue-600 hover:text-blue-800 hover:underline group"
                    >
                      <ExternalLink className="w-3 h-3 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-bold">{source.title}</div>
                        <div className="text-xs text-gray-500">{source.source}</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 bg-white hover:bg-gray-50 transition-colors font-mono text-sm font-bold"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Read More
              </>
            )}
          </button>
          <button
            onClick={onAskAI}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white hover:bg-gray-50 transition-colors font-mono text-sm font-bold"
            title="Ask AI about this news"
          >
            <MessageSquare className="w-4 h-4" />
            Ask AI
          </button>
        </div>
      </div>
    </div>
  );
}
