import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Sun, Moon, Wind, Droplets, Compass, Sparkles,
  CheckCircle2, AlertTriangle, UserCheck, RefreshCw, Cpu,
  Globe, Phone, Coins, Users, Utensils, Lightbulb, Quote, ChevronDown,
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
  onOpenCompare?: (city: City) => void;
}

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4, ease: 'easeOut' } }),
};

export const BottomSheet: React.FC<BottomSheetProps> = ({ 
  isOpen, 
  onClose, 
  city, 
  weather, 
  timeFormat, 
  tempUnit, 
  isDark,
  onOpenCompare 
}) => {
  const [liveDate, setLiveDate] = useState(new Date());
  const [insights, setInsights] = useState<CountryInsights | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [expandedFact, setExpandedFact] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => setLiveDate(new Date()), 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !city) return;
    let mounted = true;
    setIsLoadingAi(true);
    setInsights(null);
    fetchCountryInsights(city.country).then((d) => { if (mounted) { setInsights(d); setIsLoadingAi(false); } }).catch(() => { if (mounted) setIsLoadingAi(false); });
    return () => { mounted = false; };
  }, [isOpen, city]);

  if (!city) return null;
  const t = getLocalTimeDetails(city.timezone, liveDate, timeFormat === '24h');
  const fmtTemp = (c?: number) => { if (c === undefined) return '--'; return tempUnit === 'F' ? `${Math.round((c * 9) / 5 + 32)}°F` : `${c}°C`; };

  const cardCls = isDark ? 'bg-zinc-800/60 border-zinc-700/50' : 'bg-white/80 border-zinc-200/80';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            drag="y" dragConstraints={{ top: 0 }} dragElastic={0.2}
            onDragEnd={(_, info) => { if (info.offset.y > 100) onClose(); }}
            className={`fixed inset-x-0 bottom-0 z-50 max-h-[92vh] rounded-t-[36px] overflow-hidden flex flex-col shadow-2xl border-t ${isDark ? 'bg-zinc-900/95 text-white border-zinc-700/80 backdrop-blur-xl' : 'bg-[#fafafa]/95 text-zinc-900 border-zinc-200/80 backdrop-blur-xl'}`}
          >
            {/* Drag Handle */}
            <div className="w-full pt-3 pb-1 flex justify-center cursor-grab active:cursor-grabbing shrink-0">
              <div className={`w-12 h-1.5 rounded-full ${isDark ? 'bg-zinc-700' : 'bg-zinc-300'}`} />
            </div>

            {/* Close */}
            <div className="px-5 pb-1 flex justify-end shrink-0">
              <button onClick={onClose} className={`p-2 rounded-full ${isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-200 text-zinc-700'}`}><X className="w-4 h-4" /></button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-5 pb-14 space-y-5 no-scrollbar">

              {/* 1. HERO BANNER */}
              <motion.div custom={0} variants={sectionVariants} initial="hidden" animate="visible" className="relative w-full h-44 rounded-3xl overflow-hidden shadow-lg">
                {city.avatarUrl ? (
                  <img src={city.avatarUrl} alt={city.country} className="w-full h-full object-cover" />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-gradient-to-br from-zinc-800 to-zinc-900' : 'bg-gradient-to-br from-amber-100 to-orange-200'}`}>
                    <span className="text-7xl">{city.flag}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-4 left-5 text-white">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-2xl">{city.flag}</span>
                    <span className="text-2xl font-extrabold tracking-tight">{city.country}</span>
                  </div>
                  <p className="text-sm opacity-80">{city.name} • {city.continent}</p>
                </div>
              </motion.div>

              {/* 2. LIVE CLOCK */}
              <motion.div custom={1} variants={sectionVariants} initial="hidden" animate="visible" className="flex flex-col items-center text-center py-2">
                <div className="flex items-center space-x-3">
                  <span className="text-5xl font-black tracking-tight font-mono">{t.fullTimeString}</span>
                  <div className={`p-2.5 rounded-2xl ${t.isDay ? 'bg-amber-400/15 text-amber-500' : 'bg-indigo-400/15 text-indigo-400'}`}>
                    {t.isDay ? <Sun className="w-7 h-7 fill-current" /> : <Moon className="w-7 h-7 fill-current/30" />}
                  </div>
                </div>
                <p className="text-sm opacity-60 mt-1">{t.dateString} • {t.offsetStr}</p>
              </motion.div>

              {/* Compare Time Difference Button */}
              {onOpenCompare && (
                <motion.div custom={1.5} variants={sectionVariants} initial="hidden" animate="visible">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenCompare(city);
                    }}
                    className="w-full py-3 px-4 rounded-2xl flex items-center justify-center space-x-2 font-bold text-xs bg-amber-400 text-black hover:bg-amber-300 shadow-md active:scale-[0.98] transition-all"
                  >
                    <span>⇄</span>
                    <span>Compare Time Difference with Another Country</span>
                  </button>
                </motion.div>
              )}

              {/* 3. QUICK STATS GRID */}
              <motion.div custom={2} variants={sectionVariants} initial="hidden" animate="visible" className="grid grid-cols-3 gap-2.5">
                {[
                  { icon: <Users className="w-3.5 h-3.5" />, label: 'Population', value: city.population },
                  { icon: <Globe className="w-3.5 h-3.5" />, label: 'Languages', value: city.languages.slice(0, 2).join(', ') },
                  { icon: <Coins className="w-3.5 h-3.5" />, label: 'Currency', value: city.currency.split(' (')[0] },
                  { icon: <Phone className="w-3.5 h-3.5" />, label: 'Calling', value: city.callingCode },
                  { icon: <Compass className="w-3.5 h-3.5" />, label: 'Continent', value: city.continent },
                  { icon: <Globe className="w-3.5 h-3.5" />, label: 'Timezone', value: t.offsetStr },
                ].map((s, i) => (
                  <div key={i} className={`p-3 rounded-2xl border text-center ${cardCls}`}>
                    <div className="flex justify-center mb-1 opacity-50">{s.icon}</div>
                    <p className="text-[10px] uppercase tracking-wider opacity-50 font-semibold">{s.label}</p>
                    <p className="text-xs font-bold mt-0.5 truncate">{s.value}</p>
                  </div>
                ))}
              </motion.div>

              {/* 4. WEATHER */}
              {weather && (
                <motion.div custom={3} variants={sectionVariants} initial="hidden" animate="visible" className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider opacity-50">Current Weather</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { icon: <Sun className="w-3.5 h-3.5 text-amber-500" />, label: 'Temp', val: fmtTemp(weather.temperature), sub: `Feels ${fmtTemp(weather.feelsLike)}` },
                      { icon: <Droplets className="w-3.5 h-3.5 text-sky-500" />, label: 'Humidity', val: `${weather.humidity}%`, sub: 'Relative' },
                      { icon: <Wind className="w-3.5 h-3.5 text-teal-500" />, label: 'Wind', val: `${weather.windSpeed}km/h`, sub: `UV ${weather.uvIndex}` },
                      { icon: <Compass className="w-3.5 h-3.5 text-blue-500" />, label: 'Sky', val: weather.description, sub: weather.isDay ? 'Day' : 'Night' },
                    ].map((w, i) => (
                      <div key={i} className={`p-3 rounded-2xl border ${cardCls}`}>
                        <div className="flex items-center justify-between mb-1"><span className="text-[10px] opacity-50">{w.label}</span>{w.icon}</div>
                        <p className="text-sm font-bold truncate">{w.val}</p>
                        <p className="text-[10px] opacity-50 truncate">{w.sub}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* AI INSIGHTS */}
              {isLoadingAi ? (
                <motion.div custom={4} variants={sectionVariants} initial="hidden" animate="visible" className={`p-8 rounded-2xl flex flex-col items-center space-y-3 border ${cardCls}`}>
                  <Sparkles className="w-8 h-8 text-amber-400 animate-spin" />
                  <p className="text-sm font-medium opacity-70">Generating cultural insights for {city.country}...</p>
                </motion.div>
              ) : insights ? (
                <>
                  {/* 5. KNOWN FOR */}
                  {insights.knownFor && (
                    <motion.div custom={4} variants={sectionVariants} initial="hidden" animate="visible" className={`p-5 rounded-2xl border relative overflow-hidden ${isDark ? 'bg-amber-950/20 border-amber-800/40' : 'bg-amber-50/80 border-amber-200'}`}>
                      <Quote className="absolute top-3 left-3 w-5 h-5 text-amber-400/40" />
                      <p className="text-sm font-semibold italic pl-6 leading-relaxed">{insights.knownFor}</p>
                    </motion.div>
                  )}

                  {/* 6. CULTURE & TRADITIONS */}
                  {insights.cultureDescription && (
                    <motion.div custom={5} variants={sectionVariants} initial="hidden" animate="visible" className="space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider opacity-50">🎭 Culture & Traditions</h3>
                      <p className="text-xs leading-relaxed opacity-80">{insights.cultureDescription}</p>
                    </motion.div>
                  )}

                  {/* 7. FAMOUS CUISINE */}
                  {insights.cuisine.length > 0 && (
                    <motion.div custom={6} variants={sectionVariants} initial="hidden" animate="visible" className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Utensils className="w-4 h-4 text-orange-500" />
                        <h3 className="text-xs font-bold uppercase tracking-wider opacity-50">Famous Cuisine</h3>
                      </div>
                      <div className="space-y-2">
                        {insights.cuisine.map((dish, i) => (
                          <div key={i} className={`px-4 py-3 rounded-2xl border ${cardCls}`}>
                            <p className="text-xs font-semibold">🍽️ {dish}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* 8. FESTIVALS */}
                  {insights.festivals.length > 0 && (
                    <motion.div custom={7} variants={sectionVariants} initial="hidden" animate="visible" className="space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider opacity-50">🎉 Festivals & Celebrations</h3>
                      <div className="space-y-2">
                        {insights.festivals.map((fest, i) => (
                          <div key={i} className={`px-4 py-3 rounded-2xl border ${cardCls}`}>
                            <p className="text-xs font-semibold">🎊 {fest}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* 9. FUN FACTS */}
                  {insights.funFacts.length > 0 && (
                    <motion.div custom={8} variants={sectionVariants} initial="hidden" animate="visible" className="space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider opacity-50">💡 Fun Facts</h3>
                      <div className="space-y-2">
                        {insights.funFacts.map((fact, i) => (
                          <div key={i} onClick={() => setExpandedFact(expandedFact === i ? null : i)} className={`px-4 py-3 rounded-2xl border cursor-pointer transition-all ${isDark ? 'bg-purple-950/20 border-purple-800/40 hover:bg-purple-950/30' : 'bg-purple-50/80 border-purple-200 hover:bg-purple-100'}`}>
                            <div className="flex items-start justify-between">
                              <p className={`text-xs font-semibold pr-2 ${expandedFact === i ? '' : 'line-clamp-1'}`}>
                                <Lightbulb className="w-3.5 h-3.5 inline mr-1 text-purple-500" />{fact}
                              </p>
                              <ChevronDown className={`w-3.5 h-3.5 shrink-0 mt-0.5 opacity-50 transition-transform ${expandedFact === i ? 'rotate-180' : ''}`} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* 10. HEAD OF STATE */}
                  <motion.div custom={9} variants={sectionVariants} initial="hidden" animate="visible" className={`p-4 rounded-2xl border flex items-center justify-between ${cardCls}`}>
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500"><UserCheck className="w-5 h-5" /></div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-semibold opacity-50">{insights.leader?.title}</p>
                        <p className="text-base font-extrabold tracking-tight">{insights.leader?.name}</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* 11. THE GOOD */}
                  <motion.div custom={10} variants={sectionVariants} initial="hidden" animate="visible" className={`p-4 rounded-2xl border space-y-2 ${isDark ? 'bg-emerald-950/20 border-emerald-800/40' : 'bg-emerald-50/70 border-emerald-200'}`}>
                    <div className="flex items-center space-x-2 text-emerald-500">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-xs font-extrabold uppercase tracking-wider">The Good</span>
                    </div>
                    <ul className="space-y-2 text-xs leading-relaxed opacity-90">
                      {insights.the_good.map((p, i) => <li key={i} className="flex items-start space-x-2"><span className="text-emerald-500 font-bold">•</span><span>{p}</span></li>)}
                    </ul>
                  </motion.div>

                  {/* THE BAD */}
                  <motion.div custom={11} variants={sectionVariants} initial="hidden" animate="visible" className={`p-4 rounded-2xl border space-y-2 ${isDark ? 'bg-amber-950/20 border-amber-800/40' : 'bg-amber-50/70 border-amber-200'}`}>
                    <div className="flex items-center space-x-2 text-amber-500">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-xs font-extrabold uppercase tracking-wider">The Bad</span>
                    </div>
                    <ul className="space-y-2 text-xs leading-relaxed opacity-90">
                      {insights.the_bad.map((p, i) => <li key={i} className="flex items-start space-x-2"><span className="text-amber-500 font-bold">•</span><span>{p}</span></li>)}
                    </ul>
                  </motion.div>

                  {/* 12. AI FOOTER */}
                  <motion.div custom={12} variants={sectionVariants} initial="hidden" animate="visible" className="flex items-center justify-center space-x-2 pt-2 pb-4">
                    <Cpu className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-[10px] font-mono opacity-40">Powered by Cloudflare Workers AI • @cf/meta/llama-3-8b-instruct</span>
                  </motion.div>
                </>
              ) : null}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
