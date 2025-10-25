import { formatDate } from '@/lib/utils';
import { UI_TEXT } from '@/lib/constants';

interface BattleHeaderProps {
  headline: string;
  weekOf: Date;
}

/**
 * BattleHeader Component
 * 
 * Displays the event headline and date in a clean header format
 */
export function BattleHeader({ headline, weekOf }: BattleHeaderProps) {
  return (
    <div className="border-clean mb-4">
      <div className="px-6 py-4">
        <div className="flex items-baseline gap-3">
          <span className="text-2xl font-mono font-bold text-gray-400">
            {formatDate(weekOf, 'short')}
          </span>
          <h2 className="text-xl font-mono font-bold">{headline}</h2>
        </div>
      </div>
    </div>
  );
}
