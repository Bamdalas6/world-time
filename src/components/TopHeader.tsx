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
          {cities.slice(0, 6).map((city) => {
            const isSelected = selectedCity.id === city.id;
            return (
              <button
                key={city.id}
                onClick={() => onSelectCity(city)}
                className={`relative group shrink-0 rounded-2xl p-[2px] transition-all duration-300 ${
                  isSelected
                    ? 'ring-2 ring-amber-400 scale-105 shadow-md'
                    : 'opacity-80 hover:opacity-100'
                }`}
                title={`${city.name}, ${city.country}`}
              >
                <div className="w-10 h-10 rounded-[14px] overflow-hidden bg-zinc-200 dark:bg-zinc-800 shadow-inner">
                  {city.avatarUrl ? (
                    <img
                      src={city.avatarUrl}
                      alt={city.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-xs">
                      {city.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
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
          aria-label="Add City"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Main Title */}
      <div className="flex items-baseline justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight">
          World Time
        </h1>
        <span className="text-xs font-semibold tracking-wider uppercase opacity-45">
          {selectedCity.name}
        </span>
      </div>
    </div>
  );
};
