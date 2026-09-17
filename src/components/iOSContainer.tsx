import React from 'react';

interface IOSContainerProps {
  children: React.ReactNode;
  isDark?: boolean;
}

export const IOSContainer: React.FC<IOSContainerProps> = ({
  children,
  isDark = false,
}) => {
  return (
    <div className={`min-h-screen w-full flex items-center justify-center p-0 md:py-6 transition-colors duration-500 ${isDark ? 'bg-zinc-950 text-white' : 'bg-slate-100 text-zinc-900'}`}>
      {/* Clean application container */}
      <div className={`relative w-full max-w-[430px] h-screen md:h-[880px] md:max-h-[92vh] md:rounded-[48px] shadow-2xl overflow-hidden flex flex-col transition-all duration-500 border-0 md:border-[10px] ${
        isDark 
          ? 'bg-[#09090b] border-zinc-800 shadow-[0_25px_70px_rgba(0,0,0,0.85)]' 
          : 'bg-[#fafafa] border-zinc-300 shadow-[0_25px_60px_rgba(0,0,0,0.15)]'
      }`}>
        {/* Main Viewport Content (Top status bar totally removed) */}
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
