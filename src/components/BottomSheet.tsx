import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Sun, Moon, Wind, Droplets, Compass, Sparkles, 
  CheckCircle2, AlertTriangle, UserCheck, RefreshCw, Cpu
} from 'lucide-react';
import { City, WeatherData, CountryInsights, TimeFormat, TempUnit } from '../types';
import { getLocalTimeDetails } from '../services/timeUtils';
import { fetchCountryInsights } from '../services/cloudflareAi';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  city: City | null;
  weather: WeatherData | null;
  timeFormat: TimeFormat;
  tempUnit: TempUnit;
  isDark: boolean;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  city,
  weather,
  timeFormat,
  tempUnit,
  isDark,
}) => {
  const [liveDate, setLiveDate] = useState<Date>(new Date());
  const [insights, setInsights] = useState<CountryInsights | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Live second ticker
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setLiveDate(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Fetch AI insights whenever city changes
  useEffect(() => {
    if (!isOpen || !city) return;

    let isMounted = true;
    setIsLoadingAi(true);
    setAiError(null);

    fetchCountryInsights(city.country)
      .then((data) => {
        if (isMounted) {
          setInsights(data);
          setIsLoadingAi(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setAiError(err.message || 'Failed to load insights');
          setIsLoadingAi(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, city]);

  const handleRefreshAi = () => {
    if (!city) return;
    setIsLoadingAi(true);
    fetchCountryInsights(city.country).then((data) => {
      setInsights(data);
      setIsLoadingAi(false);
    });
  };

  if (!city) return null;

  const timeDetails = getLocalTimeDetails(city.timezone, liveDate, timeFormat === '24h');

  // Temp conversion
  const formatTemp = (celsius?: number) => {
    if (celsius === undefined) return '--';
    if (tempUnit === 'F') {
      return `${Math.round((celsius * 9) / 5 + 32)}°F`;
    }
    return `${celsius}°C`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />

          {/* Sliding Bottom Sheet Modal */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100) onClose();
            }}
            className={`fixed inset-x-0 bottom-0 z-50 max-h-[88vh] rounded-t-[36px] overflow-hidden flex flex-col shadow-2xl transition-colors duration-500 border-t ${
              isDark
                ? 'bg-zinc-900/95 text-white border-zinc-700/80 backdrop-blur-xl'
                : 'bg-white/95 text-zinc-900 border-zinc-200/80 backdrop-blur-xl'
            }`}
          >
            {/* Drag Handle Bar */}
            <div className="w-full pt-3 pb-2 flex justify-center cursor-grab active:cursor-grabbing">
              <div className={`w-12 h-1.5 rounded-full ${isDark ? 'bg-zinc-700' : 'bg-zinc-300'}`} />
            </div>

            {/* Modal Header */}
            <div className="px-6 py-2 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-500">
                  {timeDetails.offsetStr}
                </span>
                <span className="text-xs opacity-60 font-mono">
                  {city.timezone}
                </span>
              </div>

              <button
                onClick={onClose}
                className={`p-2 rounded-full transition-colors ${
                  isDark ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content Container */}
            <div className="flex-1 overflow-y-auto px-6 pt-2 pb-12 space-y-6 no-scrollbar">
              {/* 1. Time & City Hero Banner */}
              <div className="flex flex-col items-center text-center space-y-1 py-2">
                <h2 className="text-3xl font-extrabold tracking-tight">
                  {city.name}
                </h2>
                <p className="text-sm font-medium opacity-60">
                  {city.country} • {timeDetails.dateString}
                </p>

                {/* Big live ticking digital clock */}
                <div className="pt-2 flex items-center space-x-3">
                  <span className="text-5xl font-black tracking-tight font-mono">
                    {timeDetails.fullTimeString}
                  </span>
                  <div className="p-2.5 rounded-2xl bg-amber-400/10 text-amber-500">
                    {timeDetails.isDay ? (
                      <Sun className="w-7 h-7 fill-amber-400 animate-pulse" />
                    ) : (
                      <Moon className="w-7 h-7 text-indigo-300 fill-indigo-300/30" />
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Weather Conditions Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider opacity-60">
                    Current Atmospheric Conditions
                  </h3>
                  <span className="text-[11px] text-emerald-500 font-medium">
                    via Open-Meteo Edge
                  </span>
                </div>

                {weather ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Temperature */}
                    <div className={`p-3.5 rounded-2xl flex flex-col justify-between ${
                      isDark ? 'bg-zinc-800/60' : 'bg-zinc-100/80'
                    }`}>
                      <div className="flex items-center justify-between text-xs opacity-60">
                        <span>Temp</span>
                        <Sun className="w-3.5 h-3.5 text-amber-500" />
                      </div>
                      <div className="mt-2">
                        <span className="text-2xl font-bold font-mono">
                          {formatTemp(weather.temperature)}
                        </span>
                        <p className="text-[11px] opacity-60 truncate">
                          Feels {formatTemp(weather.feelsLike)}
                        </p>
                      </div>
                    </div>

                    {/* Condition */}
                    <div className={`p-3.5 rounded-2xl flex flex-col justify-between ${
                      isDark ? 'bg-zinc-800/60' : 'bg-zinc-100/80'
                    }`}>
                      <div className="flex items-center justify-between text-xs opacity-60">
                        <span>Sky</span>
                        <Compass className="w-3.5 h-3.5 text-blue-500" />
                      </div>
                      <div className="mt-2">
                        <span className="text-sm font-bold truncate block">
                          {weather.description}
                        </span>
                        <p className="text-[11px] opacity-60">
                          {weather.isDay ? 'Daytime' : 'Nighttime'}
                        </p>
                      </div>
                    </div>

                    {/* Humidity */}
                    <div className={`p-3.5 rounded-2xl flex flex-col justify-between ${
                      isDark ? 'bg-zinc-800/60' : 'bg-zinc-100/80'
                    }`}>
                      <div className="flex items-center justify-between text-xs opacity-60">
                        <span>Humidity</span>
                        <Droplets className="w-3.5 h-3.5 text-sky-500" />
                      </div>
                      <div className="mt-2">
                        <span className="text-2xl font-bold font-mono">
                          {weather.humidity}%
                        </span>
                        <p className="text-[11px] opacity-60">Relative</p>
                      </div>
                    </div>

                    {/* UV & Wind */}
                    <div className={`p-3.5 rounded-2xl flex flex-col justify-between ${
                      isDark ? 'bg-zinc-800/60' : 'bg-zinc-100/80'
                    }`}>
                      <div className="flex items-center justify-between text-xs opacity-60">
                        <span>UV & Wind</span>
                        <Wind className="w-3.5 h-3.5 text-teal-500" />
                      </div>
                      <div className="mt-2">
                        <span className="text-sm font-bold font-mono">
                          UV {weather.uvIndex}
                        </span>
                        <p className="text-[11px] opacity-60">
                          {weather.windSpeed} km/h
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-zinc-800/40 text-center text-xs opacity-60">
                    Loading live atmospheric metrics...
                  </div>
                )}
              </div>

              {/* 3. Cloudflare Workers AI Country Insights */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-1 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-sm">
                      <Cpu className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-wider">
                      Cloudflare Workers AI Insights
                    </h3>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-zinc-500/15 opacity-80">
                      @cf/meta/llama-3-8b-instruct
                    </span>
                    <button
                      onClick={handleRefreshAi}
                      disabled={isLoadingAi}
                      className="p-1 hover:rotate-180 transition-transform duration-500 opacity-70 hover:opacity-100 disabled:opacity-40"
                      title="Re-generate Insights"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAi ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                {isLoadingAi ? (
                  <div className={`p-6 rounded-2xl flex flex-col items-center justify-center space-y-3 ${
                    isDark ? 'bg-zinc-800/40' : 'bg-zinc-100/60'
                  }`}>
                    <Sparkles className="w-6 h-6 text-amber-400 animate-spin" />
                    <p className="text-xs font-medium opacity-70">
                      Querying Cloudflare Workers AI for {city.country}...
                    </p>
                  </div>
                ) : insights ? (
                  <div className="space-y-4">
                    {/* Head of State / Leader Card */}
                    <div className={`p-4 rounded-2xl flex items-center justify-between border ${
                      isDark ? 'bg-zinc-800/50 border-zinc-700/60' : 'bg-zinc-50 border-zinc-200'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
                          <UserCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-wider font-semibold opacity-60">
                            {insights.leader?.title || 'Head of State'}
                          </p>
                          <p className="text-base font-extrabold tracking-tight">
                            {insights.leader?.name || 'Current Head of State'}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-semibold">
                        Official
                      </span>
                    </div>

                    {/* The Good (3 Positives) */}
                    <div className={`p-4 rounded-2xl border space-y-2.5 ${
                      isDark ? 'bg-emerald-950/20 border-emerald-800/40' : 'bg-emerald-50/70 border-emerald-200'
                    }`}>
                      <div className="flex items-center space-x-2 text-emerald-500">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-xs font-extrabold uppercase tracking-wider">
                          The Good (Highlights & Strengths)
                        </span>
                      </div>
                      <ul className="space-y-2 text-xs leading-relaxed opacity-90">
                        {insights.the_good?.map((point, i) => (
                          <li key={i} className="flex items-start space-x-2">
                            <span className="text-emerald-500 font-bold">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* The Bad (3 Challenges) */}
                    <div className={`p-4 rounded-2xl border space-y-2.5 ${
                      isDark ? 'bg-amber-950/20 border-amber-800/40' : 'bg-amber-50/70 border-amber-200'
                    }`}>
                      <div className="flex items-center space-x-2 text-amber-500">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-xs font-extrabold uppercase tracking-wider">
                          The Bad (Challenges & Caveats)
                        </span>
                      </div>
                      <ul className="space-y-2 text-xs leading-relaxed opacity-90">
                        {insights.the_bad?.map((point, i) => (
                          <li key={i} className="flex items-start space-x-2">
                            <span className="text-amber-500 font-bold">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {insights.fallback && insights.note && (
                      <p className="text-[10px] text-center opacity-40 font-mono">
                        {insights.note}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-zinc-800/30 text-center text-xs opacity-70">
                    {aiError || 'Unable to retrieve insights.'}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
