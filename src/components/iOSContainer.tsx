import React from 'react';
import { Wifi, Battery } from 'lucide-react';

interface IOSContainerProps {
  children: React.ReactNode;
  currentTimeString?: string;
  isDark?: boolean;
}

export const IOSContainer: React.FC<IOSContainerProps> = ({
  children,
  currentTimeString = '9:41',
  isDark = false,
}) => {
  return (
    <div className={`min-h-screen w-full flex items-center justify-center p-0 md:py-6 transition-colors duration-500 ${isDark ? 'bg-zinc-950 text-white' : 'bg-slate-100 text-zinc-900'}`}>
      {/* Phone chassis frame (on desktop) / Native full screen (on mobile) */}
      <div className={`relative w-full max-w-[430px] h-screen md:h-[880px] md:max-h-[92vh] md:rounded-[52px] shadow-2xl overflow-hidden flex flex-col transition-all duration-500 border-0 md:border-[10px] ${
        isDark 
          ? 'bg-[#09090b] border-zinc-800 shadow-[0_25px_70px_rgba(0,0,0,0.85)]' 
          : 'bg-[#fafafa] border-zinc-300 shadow-[0_25px_60px_rgba(0,0,0,0.15)]'
      }`}>
        {/* iOS Dynamic Island & Status Bar */}
        <div className="relative z-30 pt-3 px-7 pb-2 flex items-center justify-between select-none pointer-events-none">
          {/* Status Bar Clock */}
          <span className="text-[15px] font-semibold tracking-tight font-mono">
            {currentTimeString}
          </span>

          {/* Dynamic Island pill */}
          <div className="absolute left-1/2 -translate-x-1/2 top-3 h-[28px] w-[112px] bg-black rounded-full flex items-center justify-between px-3 shadow-inner">
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-zinc-800" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 animate-pulse" />
          </div>

          {/* Status Bar Right (Cellular, Wifi, Battery) */}
          <div className="flex items-center space-x-2 text-xs font-semibold">
            {/* Cellular signal bars */}
            <div className="flex items-end space-x-[2px] h-3">
              <span className="w-[3px] h-[4px] bg-current rounded-sm" />
              <span className="w-[3px] h-[6px] bg-current rounded-sm" />
              <span className="w-[3px] h-[8px] bg-current rounded-sm" />
              <span className="w-[3px] h-[11px] bg-current rounded-sm" />
            </div>
            <Wifi className="w-3.5 h-3.5" />
            <div className="flex items-center">
              <div className="w-5 h-2.5 rounded-[4px] border border-current p-[1px] flex items-center">
                <div className="w-3.5 h-full bg-current rounded-[2px]" />
              </div>
              <div className="w-[1px] h-1 bg-current rounded-r-sm ml-[1px]" />
            </div>
          </div>
        </div>

        {/* Main Viewport Content */}
        <div className="relative flex-1 flex flex-col overflow-hidden">
          {children}
        </div>

        {/* iOS Home Indicator Bar */}
        <div className="relative z-30 w-full pb-2 flex justify-center pointer-events-none">
          <div className={`w-36 h-1 rounded-full ${isDark ? 'bg-zinc-600' : 'bg-zinc-400'}`} />
        </div>
      </div>
    </div>
  );
};
