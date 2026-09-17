import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { IOSContainer } from './components/iOSContainer';
import { TopHeader } from './components/TopHeader';
import { ListView } from './components/ListView';
import { MapView } from './components/MapView';
import { BottomNav } from './components/BottomNav';
import { BottomSheet } from './components/BottomSheet';
import { SearchModal } from './components/SearchModal';
import { TimeScrubber } from './components/TimeScrubber';
import { WeatherOverlay } from './components/WeatherOverlay';
import { CompareModal } from './components/CompareModal';
import { City, WeatherData, ViewMode, TimeFormat, TempUnit } from './types';
import { INITIAL_CITIES } from './data/cities';
import { ALL_COUNTRIES } from './data/countries';
import { fetchCityWeather } from './services/weatherApi';
import { getLocalTimeDetails } from './services/timeUtils';

export function App() {
  // 1. Saved Cities (Most recent at the top)
  const [cities, setCities] = useState<City[]>(() => {
    try {
      const saved = localStorage.getItem('mwt_saved_cities');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return INITIAL_CITIES;
  });

  // Selected City (Default: first in saved cities or Los Angeles / Nigeria)
  const [selectedCity, setSelectedCity] = useState<City>(() => {
    return cities[0] || ALL_COUNTRIES[0];
  });

  // View Mode: list or map
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // Time & Units
  const [timeFormat, setTimeFormat] = useState<TimeFormat>('24h');
  const [tempUnit, setTempUnit] = useState<TempUnit>('C');

  // Time Scrubber (Offset in minutes)
  const [scrubberMinutes, setScrubberMinutes] = useState<number>(0);
  const [isScrubberOpen, setIsScrubberOpen] = useState<boolean>(false);

  // Modals
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState<boolean>(false);
  const [bottomSheetCity, setBottomSheetCity] = useState<City | null>(null);

  // Compare Time Difference Modal State
  const [isCompareOpen, setIsCompareOpen] = useState<boolean>(false);
  const [compareCityA, setCompareCityA] = useState<City | null>(null);
  const [compareCityB, setCompareCityB] = useState<City | null>(null);

  // Weather Map Cache
  const [weatherMap, setWeatherMap] = useState<Record<string, WeatherData>>({});

  // Clock tick (every second)
  const [liveNow, setLiveNow] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setLiveNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Effective Date with Time Scrubber Offset
  const effectiveDate = useMemo(() => {
    if (scrubberMinutes === 0) return liveNow;
    return new Date(liveNow.getTime() + scrubberMinutes * 60 * 1000);
  }, [liveNow, scrubberMinutes]);

  // Fetch weather for visible cities
  useEffect(() => {
    let isCurrent = true;
    const loadWeather = async () => {
      for (const city of cities.slice(0, 15)) {
        try {
          const w = await fetchCityWeather(city.latitude, city.longitude);
          if (isCurrent) {
            setWeatherMap((prev) => ({ ...prev, [city.id]: w }));
          }
        } catch (_) {}
      }
    };
    loadWeather();
    return () => {
      isCurrent = false;
    };
  }, [cities]);

  // Selected city localized time & weather
  const selectedTimeDetails = useMemo(() => {
    return getLocalTimeDetails(selectedCity.timezone, effectiveDate, timeFormat === '24h');
  }, [selectedCity, effectiveDate, timeFormat]);

  const selectedWeather = weatherMap[selectedCity.id] || null;

  // DYNAMIC THEMING LOGIC:
  // Nighttime (past sunset / isDay === false) -> Dark Mode
  // Daytime -> Light Mode
  const isDark = useMemo(() => {
    return !selectedTimeDetails.isDay;
  }, [selectedTimeDetails.isDay]);

  // Save cities in localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mwt_saved_cities', JSON.stringify(cities));
    } catch (_) {}
  }, [cities]);

  // HANDLER: SELECT CITY -> MOVE TO THE VERY TOP OF THE LIST
  const handleSelectCity = useCallback((city: City) => {
    setSelectedCity(city);
    // Put recently selected city at the TOP so it is immediately visible
    setCities((prev) => {
      const filtered = prev.filter((c) => c.id !== city.id);
      return [city, ...filtered];
    });
  }, []);

  const handleOpenDetails = useCallback((city: City) => {
    setBottomSheetCity(city);
    setIsBottomSheetOpen(true);
  }, []);

  // HANDLER: ADD CITY -> MOVE TO THE VERY TOP OF THE LIST
  const handleAddCity = useCallback((newCity: City) => {
    setCities((prev) => {
      const filtered = prev.filter((c) => c.id !== newCity.id);
      return [newCity, ...filtered];
    });
    setSelectedCity(newCity);
    setIsSearchOpen(false);
  }, []);

  // HANDLER: OPEN TIME COMPARATOR
  const handleOpenCompare = useCallback((baseCity?: City) => {
    const primary = baseCity || selectedCity;
    setCompareCityA(primary);
    // Find another distinct city for comparison
    const secondary =
      cities.find((c) => c.id !== primary.id) ||
      ALL_COUNTRIES.find((c) => c.id !== primary.id) ||
      ALL_COUNTRIES[1];
    setCompareCityB(secondary);
    setIsCompareOpen(true);
  }, [selectedCity, cities]);

  return (
    <IOSContainer isDark={isDark}>
      {/* Dynamic Weather & Atmospheric Gradients / Particles */}
      <WeatherOverlay weather={selectedWeather} isDay={selectedTimeDetails.isDay} />

      {/* Main Top Header: Story reels (ordered by recent) + App Title */}
      <TopHeader
        cities={cities}
        selectedCity={selectedCity}
        onSelectCity={handleSelectCity}
        onOpenAddModal={() => setIsSearchOpen(true)}
        isDark={isDark}
      />

      {/* Time Scrubber Slider (Toggleable) */}
      {isScrubberOpen && (
        <TimeScrubber
          offsetMinutes={scrubberMinutes}
          onChangeOffset={setScrubberMinutes}
          onReset={() => setScrubberMinutes(0)}
          isDark={isDark}
        />
      )}

      {/* Viewport Content: List View or Map View */}
      {viewMode === 'list' ? (
        <ListView
          cities={cities}
          selectedCity={selectedCity}
          onSelectCity={handleSelectCity}
          onOpenDetails={handleOpenDetails}
          weatherMap={weatherMap}
          baseDate={effectiveDate}
          timeFormat={timeFormat}
          tempUnit={tempUnit}
          isDark={isDark}
        />
      ) : (
        <MapView
          cities={cities}
          selectedCity={selectedCity}
          onSelectCity={handleSelectCity}
          onOpenDetails={handleOpenDetails}
          weatherMap={weatherMap}
          baseDate={effectiveDate}
          timeFormat={timeFormat}
          isDark={isDark}
        />
      )}

      {/* Floating Bottom Navigation Dock */}
      <BottomNav
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode((v) => (v === 'list' ? 'map' : 'list'))}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenCompare={() => handleOpenCompare()}
        onToggleTimeScrubber={() => setIsScrubberOpen((prev) => !prev)}
        isScrubberOpen={isScrubberOpen}
        isDark={isDark}
      />

      {/* Bottom Sheet Drawer: Time details, Weather conditions, Cloudflare Workers AI */}
      <BottomSheet
        isOpen={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
        city={bottomSheetCity || selectedCity}
        weather={weatherMap[(bottomSheetCity || selectedCity).id] || null}
        timeFormat={timeFormat}
        tempUnit={tempUnit}
        isDark={isDark}
        onOpenCompare={(city) => handleOpenCompare(city)}
      />

      {/* Search & Add City Modal (All 195 countries) */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        savedCities={cities}
        onAddCity={handleAddCity}
        isDark={isDark}
      />

      {/* Time Difference Comparator Modal */}
      <CompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        initialCityA={compareCityA}
        initialCityB={compareCityB}
        timeFormat={timeFormat}
        isDark={isDark}
      />
    </IOSContainer>
  );
}

export default App;
