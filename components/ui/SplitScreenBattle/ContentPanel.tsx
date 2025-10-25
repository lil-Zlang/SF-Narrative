import { UI_TEXT } from '@/lib/constants';
import { componentStyles } from '@/lib/design-system';
import type { ContentDisplay, Tweet } from '@/lib/types';
import TweetCard from '../TweetCard';

interface ContentPanelProps {
  content: ContentDisplay;
  sentiment: 'hype' | 'backlash';
  width: number;
  isLoading?: boolean;
}

/**
 * ContentPanel Component
 * 
 * Displays either summary text or tweets based on the content type
 */
export function ContentPanel({ content, sentiment, width, isLoading = false }: ContentPanelProps) {
  const isHype = sentiment === 'hype';
  const bgColor = isHype ? 'bg-green-50' : 'bg-red-50';
  const borderColor = isHype ? 'border-green-200' : 'border-red-200';
  const textColor = isHype ? 'text-green-700' : 'text-red-700';
  const badgeColor = isHype ? componentStyles.badge.hype : componentStyles.badge.backlash;
  const label = isHype ? UI_TEXT.HYPE_NARRATIVE_LABEL : UI_TEXT.BACKLASH_NARRATIVE_LABEL;
  const evidenceLabel = isHype ? UI_TEXT.EVIDENCE_LAYER_PRO : UI_TEXT.EVIDENCE_LAYER_ANTI;

  return (
    <div 
      className={`absolute top-0 h-full ${bgColor} ${borderColor} transition-all duration-100 ${
        isHype ? 'border-r-2' : 'border-l-2'
      }`}
      style={{ 
        width: `${width}%`,
        [isHype ? 'left' : 'right']: 0
      }}
    >
      <div className="p-3 h-full overflow-y-auto">
        <div className="mb-1.5">
          <span className={`text-xs font-mono font-bold ${textColor} ${badgeColor} px-2 py-0.5`}>
            {label}
          </span>
        </div>
        
        {content.type === 'summary' ? (
          <p className="text-xs font-mono text-gray-800 leading-relaxed">
            {content.content as string}
          </p>
        ) : (
          <div className="space-y-1.5">
            <p className={`text-xs font-mono ${textColor} mb-1`}>
              {evidenceLabel}
            </p>
            {(content.content as Tweet[]).slice(0, 3).map((tweet) => (
              <TweetCard key={tweet.id} tweet={tweet} sentiment={sentiment} />
            ))}
          </div>
        )}
        
        {isLoading && (
          <div className="mt-2 text-xs font-mono text-gray-500">
            Saving vote...
          </div>
        )}
      </div>
    </div>
  );
}
