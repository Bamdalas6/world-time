import React from 'react';
import { Sun, Moon, CloudRain, Snowflake, Cloud, ChevronRight } from 'lucide-react';
import { City, WeatherData, TimeFormat, TempUnit } from '../types';
import { getLocalTimeDetails } from '../services/timeUtils';

interface ListViewProps {
  cities: City[];
  selectedCity: City;
  onSelectCity: (city: City) => void;
  onOpenDetails: (city: City) => void;
  weatherMap: Record<string, WeatherData>;
  baseDate: Date;
  timeFormat: TimeFormat;
  tempUnit: TempUnit;
  isDark: boolean;
}

export const ListView: React.FC<ListViewProps> = ({
  cities,
  selectedCity,
  onSelectCity,
  onOpenDetails,
  weatherMap,
  baseDate,
  timeFormat,
  tempUnit,
  isDark,
}) => {
  return (
    <div className="flex-1 overflow-y-auto px-5 pb-28 pt-1 space-y-3.5 no-scrollbar">
      {cities.map((city) => {
        const isSelected = selectedCity.id === city.id;
        const timeDetails = getLocalTimeDetails(city.timezone, baseDate, timeFormat === '24h');
        const weather = weatherMap[city.id];
        
        // Convert temp if unit is F
        let displayTemp: string | null = null;
        if (weather) {
          const t = tempUnit === 'F' ? Math.round((weather.temperature * 9) / 5 + 32) : weather.temperature;
          displayTemp = `${t}°${tempUnit}`;
        }

        return (
          <div
            key={city.id}
            onClick={() => {
              onSelectCity(city);
            }}
            className={`group relative w-full rounded-[26px] p-5 cursor-pointer select-none transition-all duration-300 transform active:scale-[0.98] ${
              isSelected
                ? isDark
                  ? 'bg-zinc-800/95 text-white shadow-2xl ring-1 ring-white/10'
                  : 'bg-black text-white shadow-xl ring-2 ring-black/10'
                : isDark
                ? 'bg-zinc-900/60 hover:bg-zinc-900/90 text-zinc-100 shadow-sm border border-zinc-800/60'
                : 'bg-white/85 hover:bg-white text-zinc-900 shadow-ios border border-black/5'
            }`}
          >
            <div className="flex items-center justify-between">
              {/* Left Column: Offset & City Name */}
              <div className="flex flex-col space-y-1">
                <span
                  className={`text-[12px] font-semibold tracking-wider uppercase font-mono ${
                    isSelected
                      ? 'text-zinc-400'
                      : isDark
                      ? 'text-zinc-400'
                      : 'text-zinc-500'
                  }`}
                >
                  {timeDetails.offsetStr}
                </span>
                <span className="text-[20px] font-bold tracking-tight">
                  {city.name}
                </span>
                <span
                  className={`text-xs ${
                    isSelected ? 'text-zinc-400' : 'text-zinc-500'
                  }`}
                >
                  {city.country}
                </span>
              </div>

              {/* Right Column: Large Time + Sun/Moon Icon */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="flex items-baseline justify-end space-x-1">
                    <span className="text-3xl font-extrabold tracking-tight font-mono">
                      {timeDetails.timeString}
                    </span>
                  </div>

                  {/* Weather pill badge */}
                  {displayTemp && (
                    <div className="flex items-center justify-end space-x-1 mt-1">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        isSelected 
                          ? 'bg-zinc-800 text-zinc-300' 
                          : isDark 
                          ? 'bg-zinc-800/90 text-zinc-300' 
                          : 'bg-zinc-100 text-zinc-600'
                      }`}>
                        {displayTemp}
                      </span>
                    </div>
                  )}
                </div>

                {/* Day / Night / Weather Indicator icon */}
                <div className="flex flex-col items-center justify-center pl-1">
                  {timeDetails.isDay ? (
                    <Sun className="w-5 h-5 text-amber-400 fill-amber-400 animate-pulse-subtle" />
                  ) : (
                    <Moon className="w-5 h-5 text-indigo-300 fill-indigo-300/30" />
                  )}

                  {/* Click to open details button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCity(city);
                      onOpenDetails(city);
                    }}
                    className={`mt-2 p-1 rounded-full transition-opacity opacity-70 hover:opacity-100 ${
                      isSelected ? 'text-zinc-400 hover:text-white' : 'text-zinc-400'
                    }`}
                    title="View Weather & AI Insights"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
