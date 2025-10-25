import { UI_TEXT } from '@/lib/constants';
import { componentStyles } from '@/lib/design-system';

interface PostBattleAnalysisProps {
  summary: string;
  onAskQuestions: () => void;
}

/**
 * PostBattleAnalysis Component
 * 
 * Displays the AI analysis summary with a button to open the chatbot
 */
export function PostBattleAnalysis({ summary, onAskQuestions }: PostBattleAnalysisProps) {
  return (
    <div className="border-clean mt-4">
      <div className="px-6 py-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono font-bold text-gray-600 bg-gray-100 px-2 py-1">
            {UI_TEXT.AI_ANALYSIS_LABEL}
          </span>
          <button
            onClick={onAskQuestions}
            className={`${componentStyles.button.primary.base} ${componentStyles.button.primary.hover} text-xs`}
          >
            {UI_TEXT.ASK_QUESTIONS_BUTTON}
          </button>
        </div>
        <div className="text-sm font-mono text-gray-700 leading-relaxed">
          <p className="text-gray-800 font-medium">
            {summary}
          </p>
        </div>
      </div>
    </div>
  );
}
