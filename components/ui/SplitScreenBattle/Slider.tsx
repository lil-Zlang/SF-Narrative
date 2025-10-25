import { UI_TEXT } from '@/lib/constants';

interface SliderProps {
  position: number;
  isDragging: boolean;
}

/**
 * Slider Component
 * 
 * Interactive slider handle for the split screen battle
 */
export function Slider({ position, isDragging }: SliderProps) {
  return (
    <>
      {/* Interactive Slider Handle */}
      <div 
        className={`absolute top-0 w-1 h-full bg-black cursor-col-resize z-20 transition-colors ${
          isDragging ? 'bg-gray-600' : 'hover:bg-gray-600'
        }`}
        style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
      >
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-8 bg-black rounded-sm"></div>
      </div>

      {/* Center Label */}
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-30">
        <span className="text-xs font-mono font-bold bg-white px-2 py-1 border border-gray-300 shadow-sm">
          {UI_TEXT.DRAG_INSTRUCTION}
        </span>
      </div>
    </>
  );
}

