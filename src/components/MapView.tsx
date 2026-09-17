import React, { useMemo } from 'react';
import { Sun, Moon, MapPin, ChevronUp } from 'lucide-react';
import { City, WeatherData, TimeFormat } from '../types';
import { getLocalTimeDetails, generateTerminatorSvgPath } from '../services/timeUtils';

interface MapViewProps {
  cities: City[];
  selectedCity: City;
  onSelectCity: (city: City) => void;
  onOpenDetails: (city: City) => void;
  weatherMap: Record<string, WeatherData>;
  baseDate: Date;
  timeFormat: TimeFormat;
  isDark: boolean;
}

// Equirectangular projection constants
// SVG viewBox: 0 0 800 420
const MAP_WIDTH = 800;
const MAP_HEIGHT = 420;

function projectCoords(lat: number, lon: number): { x: number; y: number } {
  const x = ((lon + 180) / 360) * MAP_WIDTH;
  const y = ((90 - lat) / 180) * MAP_HEIGHT;
  return { x, y };
}

export const MapView: React.FC<MapViewProps> = ({
  cities,
  selectedCity,
  onSelectCity,
  onOpenDetails,
  weatherMap,
  baseDate,
  timeFormat,
  isDark,
}) => {
  // 1. Calculate terminator path for current baseDate
  const terminatorPath = useMemo(() => {
    return generateTerminatorSvgPath(baseDate, MAP_WIDTH, MAP_HEIGHT);
  }, [baseDate]);

  // 2. Selected city position
  const selectedPos = projectCoords(selectedCity.latitude, selectedCity.longitude);
  const timeDetails = getLocalTimeDetails(selectedCity.timezone, baseDate, timeFormat === '24h');
  const weather = weatherMap[selectedCity.id];

  return (
    <div className="relative flex-1 w-full h-full flex flex-col justify-between overflow-hidden select-none pb-24">
      {/* SVG Interactive World Map Container */}
      <div className="relative flex-1 w-full flex items-center justify-center px-1">
        <div className="relative w-full aspect-[800/450] max-h-[460px] rounded-3xl overflow-hidden shadow-inner border border-black/5 dark:border-white/5 bg-slate-200/50 dark:bg-zinc-900/50">
          <svg
            viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
            className="w-full h-full object-cover"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Hatching pattern for night shadow (as seen in the mockup) */}
              <pattern id="nightHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="0" y2="8" stroke={isDark ? '#3f3f46' : '#94a3b8'} strokeWidth="1.5" strokeOpacity="0.65" />
              </pattern>

              {/* Glowing pin filter */}
              <filter id="glowPin" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#ef4444" floodOpacity="0.6" />
              </filter>
            </defs>

            {/* Latitude & Longitude grid lines */}
            <g stroke={isDark ? '#27272a' : '#cbd5e1'} strokeWidth="0.75" strokeDasharray="3 3">
              {/* UTC longitude guide lines */}
              {[-120, -60, 0, 60, 120].map((lon) => {
                const x = ((lon + 180) / 360) * MAP_WIDTH;
                return <line key={lon} x1={x} y1="0" x2={x} y2={MAP_HEIGHT} />;
              })}
              {/* Equator & tropics */}
              {[-23.5, 0, 23.5].map((lat) => {
                const y = ((90 - lat) / 180) * MAP_HEIGHT;
                return <line key={lat} x1="0" y1={y} x2={MAP_WIDTH} y2={y} />;
              })}
            </g>

            {/* Continents Simplified Stylized Geometry */}
            <g
              fill={isDark ? '#52525b' : '#94a3b8'}
              stroke={isDark ? '#3f3f46' : '#cbd5e1'}
              strokeWidth="0.5"
              className="transition-colors duration-500"
            >
              {/* North America */}
              <path d="M 120,70 Q 150,55 195,65 Q 230,80 220,115 Q 185,130 190,175 Q 170,195 155,170 Q 130,140 105,120 Q 95,90 120,70 Z" />
              <path d="M 90,80 Q 115,85 110,105 Q 85,110 75,90 Z" /> {/* Alaska */}
              {/* Central America */}
              <path d="M 170,185 Q 190,210 185,230 Q 175,220 165,195 Z" />
              {/* South America */}
              <path d="M 200,225 Q 240,230 255,270 Q 245,340 215,380 Q 200,375 195,310 Q 185,250 200,225 Z" />
              {/* Europe */}
              <path d="M 370,80 Q 420,75 440,100 Q 430,135 390,145 Q 360,135 365,110 Q 355,95 370,80 Z" />
              <path d="M 360,105 Q 375,95 370,120 Q 355,115 360,105 Z" /> {/* British Isles */}
              {/* Africa */}
              <path d="M 365,148 Q 435,145 455,190 Q 470,240 440,310 Q 410,345 385,320 Q 350,250 340,200 Q 345,160 365,148 Z" />
              <path d="M 465,280 Q 475,280 470,320 Q 455,315 465,280 Z" /> {/* Madagascar */}
              {/* Asia */}
              <path d="M 440,95 Q 520,70 650,85 Q 690,130 650,190 Q 590,170 560,210 Q 520,230 500,190 Q 460,185 450,140 Q 440,110 440,95 Z" />
              <path d="M 640,120 Q 660,130 655,170 Q 635,160 640,120 Z" /> {/* Japan archipelago */}
              {/* Australia & Oceania */}
              <path d="M 610,270 Q 690,265 700,310 Q 685,355 620,345 Q 595,310 610,270 Z" />
              <path d="M 720,335 Q 735,335 730,370 Q 715,365 720,335 Z" /> {/* New Zealand */}
            </g>

            {/* Day / Night Solar Terminator Shading */}
            <path
              d={terminatorPath}
              fill="url(#nightHatch)"
              className="pointer-events-none transition-all duration-1000"
            />

            {/* Vertical Red Timeline Cursor for Selected City (Mockup Style) */}
            <line
              x1={selectedPos.x}
              y1="0"
              x2={selectedPos.x}
              y2={MAP_HEIGHT}
              stroke="#ef4444"
              strokeWidth="1.5"
              strokeDasharray="2 2"
              className="transition-all duration-500"
            />

            {/* Red Timeline top indicator dot */}
            <circle
              cx={selectedPos.x}
              cy="6"
              r="3.5"
              fill="#ef4444"
              className="animate-pulse"
            />

            {/* City Pins */}
            {cities.map((city) => {
              const { x, y } = projectCoords(city.latitude, city.longitude);
              const isSelected = selectedCity.id === city.id;

              return (
                <g
                  key={city.id}
                  onClick={() => onSelectCity(city)}
                  className="cursor-pointer group"
                >
                  {/* Click target hitbox */}
                  <circle cx={x} cy={y} r="18" fill="transparent" />

                  {isSelected ? (
                    // Active Pin (Red drop pin as seen in mockup)
                    <g transform={`translate(${x - 12}, ${y - 24})`}>
                      <path
                        d="M 12 0 C 6 0 1 5 1 11 C 1 18 12 26 12 26 C 12 26 23 18 23 11 C 23 5 18 0 12 0 Z"
                        fill="#000000"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                        filter="url(#glowPin)"
                      />
                      <circle cx="12" cy="10" r="4" fill="#ef4444" />
                    </g>
                  ) : (
                    // Subtle Inactive Pin Dot
                    <circle
                      cx={x}
                      cy={y}
                      r="4.5"
                      className="fill-white stroke-zinc-700 dark:stroke-zinc-400 hover:scale-150 transition-transform duration-200"
                      strokeWidth="1.5"
                    />
                  )}
                </g>
              );
            })}
          </svg>

          {/* Timezone Markers along the bottom axis (matching mockup: UTC-4, UTC-2, UTC+0, UTC+2, UTC+4) */}
          <div className="absolute bottom-1.5 inset-x-0 flex justify-between px-3 text-[10px] font-mono font-semibold tracking-tighter opacity-50 select-none">
            <span>UTC-8</span>
            <span>UTC-4</span>
            <span className="text-red-500 font-bold">UTC+0</span>
            <span>UTC+4</span>
            <span>UTC+8</span>
            <span>UTC+12</span>
          </div>
        </div>
      </div>

      {/* Floating Selected Location Card (matching mockup bottom card: UTC+1 Algiers 17:40) */}
      <div className="px-5 pt-3">
        <div
          onClick={() => onOpenDetails(selectedCity)}
          className={`w-full rounded-[24px] p-4 cursor-pointer select-none transition-all duration-300 transform active:scale-95 shadow-xl border flex items-center justify-between ${
            isDark
              ? 'bg-black text-white border-zinc-800 shadow-2xl'
              : 'bg-zinc-900 text-white border-zinc-700 shadow-xl'
          }`}
        >
          {/* Left: Offset, Flag & Country Name */}
          <div className="flex flex-col">
            <div className="flex items-center space-x-1.5">
              <span className="text-sm">{selectedCity.flag}</span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
                {timeDetails.offsetStr}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">• {selectedCity.continent}</span>
            </div>
            <span className="text-lg font-extrabold tracking-tight">
              {selectedCity.country}
            </span>
            <span className="text-xs text-zinc-400">
              Capital: {selectedCity.name}
            </span>
          </div>

          {/* Right: Big Numeric Time + Day/Night Icon */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <span className="text-3xl font-extrabold font-mono tracking-tight">
                {timeDetails.timeString}
              </span>
              {weather && (
                <div className="text-xs text-zinc-400 font-medium">
                  {weather.temperature}°C • {weather.description}
                </div>
              )}
            </div>

            <div className="p-2 rounded-full bg-zinc-800/80 text-amber-400 flex items-center justify-center">
              {timeDetails.isDay ? (
                <Sun className="w-5 h-5 fill-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-300 fill-indigo-300/40" />
              )}
            </div>

            <ChevronUp className="w-4 h-4 text-zinc-400 animate-bounce" />
          </div>
        </div>
      </div>
    </div>
  );
};
