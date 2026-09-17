import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ArrowLeftRight, Sun, Moon, Clock, Calendar, 
  Briefcase, CheckCircle2, Sparkles, ChevronDown, Search
} from 'lucide-react';
import { City, TimeFormat } from '../types';
import { ALL_COUNTRIES } from '../data/countries';
import { 
  getLocalTimeDetails, 
  getTimeDifference, 
  getComparisonTimeline,
  HourSlot
} from '../services/timeUtils';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCityA?: City | null;
  initialCityB?: City | null;
  timeFormat: TimeFormat;
  isDark: boolean;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  isOpen,
  onClose,
  initialCityA,
  initialCityB,
  timeFormat,
  isDark,
}) => {
  // Country A & Country B state
  const [cityA, setCityA] = useState<City>(() => {
    return initialCityA || ALL_COUNTRIES.find((c) => c.id === 'ng') || ALL_COUNTRIES[0];
  });

  const [cityB, setCityB] = useState<City>(() => {
    if (initialCityB && initialCityB.id !== cityA.id) return initialCityB;
    return ALL_COUNTRIES.find((c) => c.id === 'gb') || ALL_COUNTRIES[1];
  });

  // Selector dropdown states
  const [selectingFor, setSelectingFor] = useState<'A' | 'B' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected hour scrubber (null = live now)
  const [scrubbedHourA, setScrubbedHourA] = useState<number | null>(null);

  // Live ticking clock
  const [liveNow, setLiveNow] = useState<Date>(new Date());
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => setLiveNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  // Update when initialCityA/B changes externally
  useEffect(() => {
    if (initialCityA) setCityA(initialCityA);
  }, [initialCityA]);

  useEffect(() => {
    if (initialCityB && initialCityB.id !== cityA.id) setCityB(initialCityB);
  }, [initialCityB, cityA.id]);

  // Swap cities A and B
  const handleSwap = () => {
    const temp = cityA;
    setCityA(cityB);
    setCityB(temp);
    setScrubbedHourA(null);
  };

  // Difference and timeline calculations
  const diffResult = useMemo(() => {
    return getTimeDifference(cityA.timezone, cityB.timezone, liveNow);
  }, [cityA.timezone, cityB.timezone, liveNow]);

  const timelineData = useMemo(() => {
    return getComparisonTimeline(cityA.timezone, cityB.timezone, liveNow);
  }, [cityA.timezone, cityB.timezone, liveNow]);

  // Times for A and B (taking into account hour scrubber if selected)
  const effectiveDateA = useMemo(() => {
    if (scrubbedHourA === null) return liveNow;
    const d = new Date(liveNow);
    // Adjust to scrubbed hour in timezone A
    const localA = getLocalTimeDetails(cityA.timezone, liveNow);
    const hourDelta = scrubbedHourA - localA.hour24;
    return new Date(liveNow.getTime() + hourDelta * 60 * 60 * 1000);
  }, [scrubbedHourA, liveNow, cityA.timezone]);

  const effectiveDateB = useMemo(() => {
    if (scrubbedHourA === null) return liveNow;
    const d = new Date(liveNow);
    const localA = getLocalTimeDetails(cityA.timezone, liveNow);
    const hourDelta = scrubbedHourA - localA.hour24;
    return new Date(liveNow.getTime() + hourDelta * 60 * 60 * 1000);
  }, [scrubbedHourA, liveNow, cityA.timezone]);

  const timeA = getLocalTimeDetails(cityA.timezone, effectiveDateA, timeFormat === '24h');
  const timeB = getLocalTimeDetails(cityB.timezone, effectiveDateB, timeFormat === '24h');

  // Filtered countries for selector dropdown
  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return ALL_COUNTRIES;
    const q = searchQuery.toLowerCase().trim();
    return ALL_COUNTRIES.filter(
      (c) =>
        c.country.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.continent.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const cardCls = isDark
    ? 'bg-zinc-800/60 border-zinc-700/60 text-white'
    : 'bg-white/80 border-zinc-200/80 text-zinc-900 shadow-sm';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className={`fixed inset-x-0 bottom-0 z-50 max-h-[92vh] rounded-t-[36px] overflow-hidden flex flex-col shadow-2xl border-t ${
              isDark
                ? 'bg-zinc-900/95 text-white border-zinc-700/80 backdrop-blur-xl'
                : 'bg-[#fafafa]/95 text-zinc-900 border-zinc-200/80 backdrop-blur-xl'
            }`}
          >
            {/* Drag Handle */}
            <div className="w-full pt-3 pb-1 flex justify-center shrink-0">
              <div className={`w-12 h-1.5 rounded-full ${isDark ? 'bg-zinc-700' : 'bg-zinc-300'}`} />
            </div>

            {/* Header */}
            <div className="px-5 py-2 flex items-center justify-between border-b border-black/5 dark:border-white/5 shrink-0">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-xl bg-amber-400/20 text-amber-500">
                  <ArrowLeftRight className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold tracking-tight">Time Difference Comparator</h2>
                  <p className="text-[11px] opacity-50">Compare hours, days & plan meetings across 195 countries</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-full ${
                  isDark ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 no-scrollbar">

              {/* 1. Country Selection Bar with Swap Button */}
              <div className="flex items-center justify-between gap-2">
                {/* Country A Button */}
                <button
                  onClick={() => {
                    setSelectingFor('A');
                    setSearchQuery('');
                  }}
                  className={`flex-1 p-3 rounded-2xl border flex items-center justify-between text-left transition-all ${cardCls} hover:border-amber-400`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <span className="text-2xl">{cityA.flag}</span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500">Base Country</p>
                      <p className="text-sm font-extrabold tracking-tight truncate">{cityA.country}</p>
                      <p className="text-[11px] opacity-50 truncate">{cityA.name} ({timeA.offsetStr})</p>
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 opacity-40 shrink-0 ml-1" />
                </button>

                {/* Swap Button */}
                <button
                  onClick={handleSwap}
                  className="p-3 rounded-2xl bg-amber-400 text-black shadow-md hover:bg-amber-300 active:scale-95 transition-all shrink-0"
                  title="Swap Countries"
                >
                  <ArrowLeftRight className="w-4 h-4 stroke-[2.5]" />
                </button>

                {/* Country B Button */}
                <button
                  onClick={() => {
                    setSelectingFor('B');
                    setSearchQuery('');
                  }}
                  className={`flex-1 p-3 rounded-2xl border flex items-center justify-between text-left transition-all ${cardCls} hover:border-amber-400`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <span className="text-2xl">{cityB.flag}</span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500">Target Country</p>
                      <p className="text-sm font-extrabold tracking-tight truncate">{cityB.country}</p>
                      <p className="text-[11px] opacity-50 truncate">{cityB.name} ({timeB.offsetStr})</p>
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 opacity-40 shrink-0 ml-1" />
                </button>
              </div>

              {/* 2. Hero Difference Display */}
              <div className={`p-4 rounded-3xl border text-center space-y-1 relative overflow-hidden ${
                isDark ? 'bg-gradient-to-br from-zinc-800 to-zinc-900 border-zinc-700' : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200'
              }`}>
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-extrabold ${
                    diffResult.direction === 'ahead'
                      ? 'bg-blue-500/20 text-blue-500'
                      : diffResult.direction === 'behind'
                      ? 'bg-amber-500/20 text-amber-500'
                      : 'bg-emerald-500/20 text-emerald-500'
                  }`}>
                    {diffResult.formattedDiff}
                  </span>

                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-500/15 opacity-80">
                    {diffResult.dayRelation}
                  </span>
                </div>

                <h3 className="text-xl font-black tracking-tight">
                  {cityB.country} is{' '}
                  <span className={diffResult.direction === 'ahead' ? 'text-blue-500' : 'text-amber-500'}>
                    {diffResult.summary}
                  </span>{' '}
                  relative to {cityA.country}
                </h3>

                <p className="text-xs opacity-60">
                  When it is {timeA.timeString} in {cityA.name}, it is {timeB.timeString} in {cityB.name}.
                </p>
              </div>

              {/* 3. Side-by-Side Dual Live Clocks */}
              <div className="grid grid-cols-2 gap-3">
                {/* Clock A */}
                <div className={`p-4 rounded-3xl border flex flex-col justify-between ${cardCls}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xl">{cityA.flag}</span>
                      <span className="text-xs font-bold truncate">{cityA.name}</span>
                    </div>
                    {timeA.isDay ? (
                      <Sun className="w-4 h-4 text-amber-500 fill-amber-500" />
                    ) : (
                      <Moon className="w-4 h-4 text-indigo-400 fill-indigo-400/30" />
                    )}
                  </div>

                  <div className="my-3 text-center">
                    <span className="text-3xl font-black font-mono tracking-tight block">
                      {timeA.timeString}
                    </span>
                    <span className="text-[11px] opacity-50 font-mono">
                      {timeA.secondStr ? `:${timeA.secondStr}` : ''} • {timeA.offsetStr}
                    </span>
                  </div>

                  <div className="text-center pt-1 border-t border-black/5 dark:border-white/5 text-[11px] opacity-60 truncate">
                    {timeA.dateString}
                  </div>
                </div>

                {/* Clock B */}
                <div className={`p-4 rounded-3xl border flex flex-col justify-between ${cardCls}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xl">{cityB.flag}</span>
                      <span className="text-xs font-bold truncate">{cityB.name}</span>
                    </div>
                    {timeB.isDay ? (
                      <Sun className="w-4 h-4 text-amber-500 fill-amber-500" />
                    ) : (
                      <Moon className="w-4 h-4 text-indigo-400 fill-indigo-400/30" />
                    )}
                  </div>

                  <div className="my-3 text-center">
                    <span className="text-3xl font-black font-mono tracking-tight block">
                      {timeB.timeString}
                    </span>
                    <span className="text-[11px] opacity-50 font-mono">
                      {timeB.secondStr ? `:${timeB.secondStr}` : ''} • {timeB.offsetStr}
                    </span>
                  </div>

                  <div className="text-center pt-1 border-t border-black/5 dark:border-white/5 text-[11px] opacity-60 truncate">
                    {timeB.dateString}
                  </div>
                </div>
              </div>

              {/* 4. Best Meeting Window Recommendation */}
              {timelineData.bestMeetingWindow && (
                <div className={`p-3.5 rounded-2xl border flex items-center space-x-3 ${
                  isDark ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300' : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                }`}>
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-500 shrink-0">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">Recommended Meeting Window</p>
                    <p className="text-xs font-extrabold">{timelineData.bestMeetingWindow}</p>
                    <p className="text-[10px] opacity-70">Calculated based on overlapping waking and business hours</p>
                  </div>
                </div>
              )}

              {/* 5. 24-Hour Comparative Interactive Timeline */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <h3 className="text-xs font-bold uppercase tracking-wider opacity-60">24-Hour Interactive Timeline</h3>
                  </div>
                  {scrubbedHourA !== null && (
                    <button
                      onClick={() => setScrubbedHourA(null)}
                      className="text-[11px] font-bold text-amber-500 hover:underline"
                    >
                      Reset to Live
                    </button>
                  )}
                </div>

                {/* Timeline status legend */}
                <div className="flex items-center space-x-3 text-[10px] font-semibold opacity-60 px-1">
                  <span className="flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Work (09-17)</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>Awake (07-23)</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-indigo-400/50" />
                    <span>Sleep (23-07)</span>
                  </span>
                </div>

                {/* Scrollable hour slots */}
                <div className="overflow-x-auto no-scrollbar py-1">
                  <div className="flex items-center space-x-1.5 min-w-max">
                    {timelineData.slots.map((slot: HourSlot) => {
                      const isSelected = scrubbedHourA === slot.hourA;
                      const isWork = slot.isWorkOverlap;
                      const isAwake = slot.isOverlap;

                      return (
                        <button
                          key={slot.hourA}
                          onClick={() => setScrubbedHourA(slot.hourA)}
                          className={`w-14 p-2 rounded-2xl border text-center transition-all ${
                            isSelected
                              ? 'ring-2 ring-amber-400 bg-amber-400 text-black shadow-md font-bold'
                              : isWork
                              ? isDark
                                ? 'bg-emerald-950/30 border-emerald-700/60 text-emerald-300 hover:bg-emerald-900/40'
                                : 'bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-100'
                              : isAwake
                              ? isDark
                                ? 'bg-zinc-800/80 border-zinc-700/60 text-zinc-200 hover:bg-zinc-700'
                                : 'bg-zinc-100 border-zinc-200 text-zinc-800 hover:bg-zinc-200'
                              : isDark
                              ? 'bg-zinc-900/50 border-zinc-800/40 text-zinc-500 opacity-60'
                              : 'bg-zinc-100/50 border-zinc-200/40 text-zinc-400 opacity-60'
                          }`}
                        >
                          <p className="text-[10px] font-mono font-extrabold">{slot.hourAStr}</p>
                          <div className="my-1 flex justify-center">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isWork
                                  ? 'bg-emerald-500'
                                  : isAwake
                                  ? 'bg-amber-400'
                                  : 'bg-indigo-400/40'
                              }`}
                            />
                          </div>
                          <p className="text-[10px] font-mono font-bold opacity-85">{slot.hourBStr}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 6. Popular Quick Preset Comparisons */}
              <div className="space-y-2 pt-1">
                <h4 className="text-[11px] font-bold uppercase tracking-wider opacity-50">Popular Global Comparisons</h4>
                <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1">
                  {[
                    { a: 'ng', b: 'us-ny', label: '🇳🇬 Nigeria vs 🇺🇸 New York' },
                    { a: 'ng', b: 'gb', label: '🇳🇬 Nigeria vs 🇬🇧 London' },
                    { a: 'jp', b: 'us-la', label: '🇯🇵 Tokyo vs 🇺🇸 Los Angeles' },
                    { a: 'fr', b: 'au', label: '🇫🇷 Paris vs 🇦🇺 Sydney' },
                    { a: 'ae', b: 'in', label: '🇦🇪 Dubai vs 🇮🇳 New Delhi' },
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        const ca = ALL_COUNTRIES.find((c) => c.id === preset.a);
                        const cb = ALL_COUNTRIES.find((c) => c.id === preset.b);
                        if (ca) setCityA(ca);
                        if (cb) setCityB(cb);
                        setScrubbedHourA(null);
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 border transition-all ${
                        isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700' : 'bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Nested Country Selector Dropdown Modal */}
          {selectingFor !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`fixed inset-4 sm:inset-x-12 sm:inset-y-20 z-50 rounded-[32px] overflow-hidden flex flex-col shadow-2xl border ${
                isDark ? 'bg-zinc-900 text-white border-zinc-800' : 'bg-white text-zinc-900 border-zinc-200'
              }`}
            >
              <div className="p-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold">
                    Select {selectingFor === 'A' ? 'Base Country' : 'Target Country'}
                  </h3>
                  <p className="text-xs opacity-50">Choose from all 195 world nations</p>
                </div>
                <button
                  onClick={() => setSelectingFor(null)}
                  className={`p-1.5 rounded-full ${
                    isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-700'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 border-b border-black/5 dark:border-white/10">
                <div
                  className={`flex items-center px-3 py-2 rounded-2xl ${
                    isDark ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-100 text-zinc-800'
                  }`}
                >
                  <Search className="w-4 h-4 opacity-50 mr-2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search country, capital, or continent..."
                    className="w-full bg-transparent text-sm focus:outline-none placeholder:opacity-50"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-1.5 no-scrollbar">
                {filteredCountries.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      if (selectingFor === 'A') setCityA(c);
                      else setCityB(c);
                      setSelectingFor(null);
                      setScrubbedHourA(null);
                    }}
                    className={`w-full p-3 rounded-2xl flex items-center justify-between text-left transition-colors ${
                      isDark ? 'hover:bg-zinc-800 bg-zinc-800/30' : 'hover:bg-zinc-100 bg-zinc-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{c.flag}</span>
                      <div>
                        <p className="text-sm font-extrabold">{c.country}</p>
                        <p className="text-xs opacity-50">
                          {c.name} • {c.continent}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-400/20 text-amber-500">
                      {getLocalTimeDetails(c.timezone).offsetStr}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
};
