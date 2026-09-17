import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Plus, Check, Globe } from 'lucide-react';
import { City } from '../types';
import { ALL_COUNTRIES, CONTINENTS } from '../data/countries';
import { getUtcOffsetString } from '../services/timeUtils';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedCities: City[];
  onAddCity: (city: City) => void;
  isDark: boolean;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  savedCities,
  onAddCity,
  isDark,
}) => {
  const [query, setQuery] = useState('');
  const [selectedContinent, setSelectedContinent] = useState<string>('All');

  const savedIds = useMemo(() => new Set(savedCities.map((c) => c.id)), [savedCities]);

  const filteredCities = useMemo(() => {
    let list = ALL_COUNTRIES;

    if (selectedContinent !== 'All') {
      list = list.filter((c) => c.continent === selectedContinent);
    }

    if (query.trim()) {
      const q = query.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.country.toLowerCase().includes(q) ||
          c.timezone.toLowerCase().includes(q) ||
          c.continent.toLowerCase().includes(q) ||
          c.languages.some((l) => l.toLowerCase().includes(q))
      );
    }

    return list;
  }, [query, selectedContinent]);

  // Keep first 50 results for smooth performance
  const displayCities = useMemo(() => filteredCities.slice(0, 50), [filteredCities]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={`fixed inset-x-3 sm:inset-x-6 top-14 bottom-10 z-50 max-w-xl mx-auto rounded-[36px] overflow-hidden flex flex-col shadow-2xl border ${
              isDark ? 'bg-zinc-900 text-white border-zinc-800' : 'bg-white text-zinc-900 border-zinc-200'
            }`}
          >
            {/* Header & Search Bar */}
            <div className="p-4 border-b border-black/5 dark:border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight">Explore 195 Countries</h2>
                  <p className="text-xs opacity-50">Discover global timezones, culture & facts</p>
                </div>
                <button
                  onClick={onClose}
                  className={`p-1.5 rounded-full ${
                    isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-700'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Input Field */}
              <div
                className={`flex items-center px-3.5 py-2.5 rounded-2xl ${
                  isDark ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-100 text-zinc-800'
                }`}
              >
                <Search className="w-4 h-4 opacity-50 mr-2.5 shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by country, capital, language, or continent..."
                  className="w-full bg-transparent text-sm focus:outline-none placeholder:opacity-50"
                  autoFocus
                />
                {query && (
                  <button onClick={() => setQuery('')} className="p-1 opacity-60 hover:opacity-100">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Continent Filter Chips */}
              <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pb-1 text-xs font-semibold">
                {['All', ...CONTINENTS].map((continent) => {
                  const isSelected = selectedContinent === continent;
                  return (
                    <button
                      key={continent}
                      onClick={() => setSelectedContinent(continent)}
                      className={`px-3 py-1.5 rounded-full shrink-0 transition-all ${
                        isSelected
                          ? 'bg-amber-400 text-black shadow-sm font-bold'
                          : isDark
                          ? 'bg-zinc-800/80 text-zinc-400 hover:text-white'
                          : 'bg-zinc-200/70 text-zinc-600 hover:text-black'
                      }`}
                    >
                      {continent}
                    </button>
                  );
                })}
              </div>

              {/* Result Count Indicator */}
              <div className="flex items-center justify-between text-[11px] font-mono opacity-50 px-1">
                <span>
                  Showing {displayCities.length} of {filteredCities.length} countries
                </span>
                {filteredCities.length > 50 && (
                  <span className="text-amber-500">Type to filter</span>
                )}
              </div>
            </div>

            {/* Countries Results List */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 no-scrollbar">
              {displayCities.map((c) => {
                const isAlreadySaved = savedIds.has(c.id);
                const offset = getUtcOffsetString(c.timezone);

                return (
                  <div
                    key={c.id}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                      isDark
                        ? 'bg-zinc-800/40 hover:bg-zinc-800/80 border-zinc-800'
                        : 'bg-zinc-50/80 hover:bg-zinc-100 border-zinc-200/80'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      {/* Flag Avatar */}
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-2xl bg-zinc-200/50 dark:bg-zinc-800/80 shadow-sm shrink-0">
                        {c.flag}
                      </div>

                      {/* Info */}
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-extrabold text-sm truncate">{c.country}</span>
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-500 shrink-0">
                            {offset}
                          </span>
                        </div>
                        <p className="text-xs font-semibold opacity-75 truncate">
                          Capital: {c.name} • {c.continent}
                        </p>
                        <div className="flex items-center space-x-2 text-[11px] opacity-50 mt-0.5">
                          <span>👥 {c.population}</span>
                          <span>•</span>
                          <span className="truncate">🗣️ {c.languages.slice(0, 2).join(', ')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Add / Added Button */}
                    <button
                      onClick={() => {
                        if (!isAlreadySaved) {
                          onAddCity(c);
                        }
                      }}
                      disabled={isAlreadySaved}
                      className={`ml-2 shrink-0 flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                        isAlreadySaved
                          ? 'bg-emerald-500/20 text-emerald-500 cursor-default'
                          : 'bg-amber-400 text-black hover:bg-amber-300 active:scale-95 shadow-sm'
                      }`}
                    >
                      {isAlreadySaved ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Add</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
