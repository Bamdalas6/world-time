import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Plus, Check } from 'lucide-react';
import { City } from '../types';
import { POPULAR_SEARCH_CITIES } from '../data/cities';
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

  const savedIds = useMemo(() => new Set(savedCities.map((c) => c.id)), [savedCities]);

  const filteredCities = useMemo(() => {
    if (!query.trim()) {
      return POPULAR_SEARCH_CITIES;
    }
    const q = query.toLowerCase().trim();
    return POPULAR_SEARCH_CITIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q) || c.timezone.toLowerCase().includes(q)
    );
  }, [query]);

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
            className={`fixed inset-x-4 top-20 bottom-12 z-50 max-w-lg mx-auto rounded-[32px] overflow-hidden flex flex-col shadow-2xl border ${
              isDark ? 'bg-zinc-900 text-white border-zinc-800' : 'bg-white text-zinc-900 border-zinc-200'
            }`}
          >
            {/* Search Header */}
            <div className="p-4 border-b border-black/5 dark:border-white/10 flex items-center space-x-3">
              <div className={`flex-1 flex items-center px-3.5 py-2.5 rounded-2xl ${
                isDark ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-100 text-zinc-800'
              }`}>
                <Search className="w-4 h-4 opacity-50 mr-2.5 shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search city, country, or timezone..."
                  className="w-full bg-transparent text-sm focus:outline-none placeholder:opacity-50"
                  autoFocus
                />
                {query && (
                  <button onClick={() => setQuery('')} className="p-1 opacity-60 hover:opacity-100">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                onClick={onClose}
                className="text-xs font-semibold px-2 py-1 opacity-70 hover:opacity-100"
              >
                Done
              </button>
            </div>

            {/* City Results List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
              {filteredCities.map((city) => {
                const isAlreadySaved = savedIds.has(city.id);
                const offset = getUtcOffsetString(city.timezone);

                return (
                  <div
                    key={city.id}
                    className={`flex items-center justify-between p-3.5 rounded-2xl transition-colors ${
                      isDark ? 'hover:bg-zinc-800/80 bg-zinc-800/30' : 'hover:bg-zinc-100 bg-zinc-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-base">{city.name}</span>
                        <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-500">
                          {offset}
                        </span>
                      </div>
                      <p className="text-xs opacity-60 mt-0.5">
                        {city.country} • {city.timezone}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        if (!isAlreadySaved) {
                          onAddCity(city);
                        }
                      }}
                      disabled={isAlreadySaved}
                      className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
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
