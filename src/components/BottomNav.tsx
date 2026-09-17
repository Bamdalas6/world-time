import React from 'react';
import { Search, Globe, List, Clock, ArrowLeftRight } from 'lucide-react';
import { ViewMode } from '../types';

interface BottomNavProps {
  viewMode: ViewMode;
  onToggleViewMode: () => void;
  onOpenSearch: () => void;
  onOpenCompare: () => void;
  onToggleTimeScrubber: () => void;
  isScrubberOpen: boolean;
  isDark: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  viewMode,
  onToggleViewMode,
  onOpenSearch,
  onOpenCompare,
  onToggleTimeScrubber,
  isScrubberOpen,
  isDark,
}) => {
  return (
    <div className="absolute bottom-6 inset-x-0 z-30 flex justify-center pointer-events-none">
      {/* Floating Pill Dock */}
      <div className={`pointer-events-auto flex items-center space-x-1.5 p-1.5 rounded-full shadow-2xl backdrop-blur-2xl transition-all duration-300 border ${
        isDark
          ? 'bg-zinc-900/90 border-zinc-700/80 text-zinc-300 shadow-[0_15px_35px_rgba(0,0,0,0.7)]'
          : 'bg-black/90 border-zinc-800 text-zinc-200 shadow-[0_15px_30px_rgba(0,0,0,0.35)]'
      }`}>
        {/* 1. Search Button */}
        <button
          onClick={onOpenSearch}
          className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-white/15 active:scale-90"
          title="Search & Add Countries"
        >
          <Search className="w-5 h-5 stroke-[2.2]" />
        </button>

        {/* 2. Compare Time Difference Button */}
        <button
          onClick={onOpenCompare}
          className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-white/15 active:scale-90"
          title="Compare Time Difference Between Countries"
        >
          <ArrowLeftRight className="w-5 h-5 stroke-[2.2]" />
        </button>

        {/* 3. Time Scrubber / Travel Slider Toggle */}
        <button
          onClick={onToggleTimeScrubber}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-white/15 active:scale-90 ${
            isScrubberOpen ? 'bg-amber-400 text-black shadow-lg hover:bg-amber-300' : ''
          }`}
          title="Global Time Travel Scrubber"
        >
          <Clock className="w-5 h-5 stroke-[2.2]" />
        </button>

        {/* 4. Map View / List View Toggle Button (Globe or List) */}
        <button
          onClick={onToggleViewMode}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-white/15 active:scale-90 ${
            viewMode === 'map' ? 'bg-white text-black shadow-lg hover:bg-zinc-200' : ''
          }`}
          title={viewMode === 'map' ? 'Switch to List View' : 'Switch to Map View'}
        >
          {viewMode === 'map' ? (
            <List className="w-5 h-5 stroke-[2.2]" />
          ) : (
            <Globe className="w-5 h-5 stroke-[2.2]" />
          )}
        </button>
      </div>
    </div>
  );
};
