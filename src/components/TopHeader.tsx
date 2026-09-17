import React from 'react';
import { Plus } from 'lucide-react';
import { City } from '../types';

interface TopHeaderProps {
  cities: City[];
  selectedCity: City;
  onSelectCity: (city: City) => void;
  onOpenAddModal: () => void;
  isDark: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  cities,
  selectedCity,
  onSelectCity,
  onOpenAddModal,
  isDark,
}) => {
  return (
    <div className="px-6 pt-2 pb-3 select-none">
      {/* City Avatar / Story reel */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center space-x-2.5 overflow-x-auto no-scrollbar py-1 pr-2">
          {cities.slice(0, 8).map((city) => {
            const isSelected = selectedCity.id === city.id;
            return (
              <button
                key={city.id}
                onClick={() => onSelectCity(city)}
                className={`relative group shrink-0 rounded-2xl p-[2px] transition-all duration-300 ${
                  isSelected
                    ? 'ring-2 ring-amber-400 scale-105 shadow-md'
                    : 'opacity-85 hover:opacity-100'
                }`}
                title={`${city.country} (${city.name})`}
              >
                <div className="w-10 h-10 rounded-[14px] overflow-hidden bg-zinc-200 dark:bg-zinc-800 shadow-inner flex items-center justify-center">
                  {city.avatarUrl ? (
                    <img
                      src={city.avatarUrl}
                      alt={city.country}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-xl select-none">{city.flag}</span>
                  )}
                </div>

                {/* Country Flag Badge when photo avatar exists */}
                {city.avatarUrl && (
                  <span className="absolute -bottom-1 -right-1 text-[11px] leading-none bg-black/40 rounded-full p-0.5 backdrop-blur-sm">
                    {city.flag}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Plus Button */}
        <button
          onClick={onOpenAddModal}
          className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 shadow-sm ${
            isDark
              ? 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700'
              : 'bg-zinc-200/80 text-zinc-800 hover:bg-zinc-300'
          }`}
          aria-label="Add Country"
          title="Browse 195 Countries"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Main Title */}
      <div className="flex items-baseline justify-between">
        <h1 className="text-3xl font-black tracking-tight">World Time</h1>
        <div className="flex items-center space-x-1.5 text-xs font-bold tracking-wider uppercase opacity-60">
          <span>{selectedCity.flag}</span>
          <span className="truncate max-w-[120px]">{selectedCity.country}</span>
        </div>
      </div>
    </div>
  );
};
