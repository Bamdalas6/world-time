import React from 'react';
import { RotateCcw } from 'lucide-react';

interface TimeScrubberProps {
  offsetMinutes: number;
  onChangeOffset: (minutes: number) => void;
  onReset: () => void;
  isDark: boolean;
}

export const TimeScrubber: React.FC<TimeScrubberProps> = ({
  offsetMinutes,
  onChangeOffset,
  onReset,
  isDark,
}) => {
  const hours = Math.floor(Math.abs(offsetMinutes) / 60);
  const minutes = Math.abs(offsetMinutes) % 60;
  const sign = offsetMinutes > 0 ? '+' : offsetMinutes < 0 ? '-' : '';
  const isOffsetActive = offsetMinutes !== 0;

  return (
    <div className={`mx-5 mb-3 p-3.5 rounded-2xl shadow-lg border backdrop-blur-md transition-all ${
      isDark
        ? 'bg-zinc-900/90 border-zinc-800 text-white'
        : 'bg-white/90 border-zinc-200 text-zinc-900'
    }`}>
      <div className="flex items-center justify-between text-xs font-semibold mb-2">
        <span className="flex items-center space-x-1.5 opacity-80">
          <span>Global Time Travel</span>
          {isOffsetActive && (
            <span className="font-mono text-amber-500 font-bold">
              ({sign}{hours}h {minutes > 0 ? `${minutes}m` : ''})
            </span>
          )}
        </span>

        {isOffsetActive && (
          <button
            onClick={onReset}
            className="flex items-center space-x-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 hover:bg-amber-500/30 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Live Now</span>
          </button>
        )}
      </div>

      <div className="flex items-center space-x-3">
        <span className="text-[10px] font-mono opacity-50">-12h</span>
        <input
          type="range"
          min="-720"
          max="720"
          step="15"
          value={offsetMinutes}
          onChange={(e) => onChangeOffset(parseInt(e.target.value, 10))}
          className="w-full accent-amber-400 cursor-pointer h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-lg"
        />
        <span className="text-[10px] font-mono opacity-50">+12h</span>
      </div>
    </div>
  );
};
