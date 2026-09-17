import { WeatherData } from '../types';

const weatherCache = new Map<string, { data: WeatherData; timestamp: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache

export async function fetchCityWeather(lat: number, lon: number): Promise<WeatherData> {
  const cacheKey = `${lat.toFixed(2)},${lon.toFixed(2)}`;
  const cached = weatherCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    // 1. Try Cloudflare Worker proxy first
    let res: Response | null = null;
    try {
      res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
    } catch (_) {
      // Worker not accessible locally, fallback to direct
    }

    if (!res || !res.ok) {
      // 2. Direct Open-Meteo call (free, no API key needed)
      const directUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,uv_index&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`;
      res = await fetch(directUrl);
    }

    if (!res.ok) {
      throw new Error(`Weather fetch status: ${res.status}`);
    }

    const json = await res.json();
    const cur = json.current || {};
    const daily = json.daily || {};

    const weatherCode = cur.weather_code ?? 0;
    const isDay = cur.is_day === 1;
    const { condition, description } = interpretWeatherCode(weatherCode, isDay);

    const weatherData: WeatherData = {
      temperature: Math.round(cur.temperature_2m ?? 20),
      feelsLike: Math.round(cur.apparent_temperature ?? cur.temperature_2m ?? 20),
      humidity: Math.round(cur.relative_humidity_2m ?? 50),
      weatherCode,
      isDay,
      uvIndex: cur.uv_index ?? (isDay ? 5 : 0),
      windSpeed: Math.round(cur.wind_speed_10m ?? 10),
      description,
      condition,
      sunrise: daily.sunrise?.[0] ? daily.sunrise[0].split('T')[1] : '06:00',
      sunset: daily.sunset?.[0] ? daily.sunset[0].split('T')[1] : '19:00',
      tempMax: daily.temperature_2m_max?.[0] ? Math.round(daily.temperature_2m_max[0]) : undefined,
      tempMin: daily.temperature_2m_min?.[0] ? Math.round(daily.temperature_2m_min[0]) : undefined,
    };

    weatherCache.set(cacheKey, { data: weatherData, timestamp: Date.now() });
    return weatherData;
  } catch (error) {
    console.warn('Using simulated weather for lat/lon', lat, lon, error);
    // Graceful fallback weather so UI is never blank
    const fallback: WeatherData = {
      temperature: 22,
      feelsLike: 23,
      humidity: 45,
      weatherCode: 0,
      isDay: true,
      uvIndex: 4,
      windSpeed: 12,
      description: 'Clear Sky',
      condition: 'sunny',
    };
    return fallback;
  }
}

/**
 * WMO Weather interpretation codes
 */
function interpretWeatherCode(code: number, isDay: boolean): { condition: WeatherData['condition']; description: string } {
  // 0: Clear
  if (code === 0) {
    return {
      condition: isDay ? 'sunny' : 'clear-night',
      description: isDay ? 'Clear & Sunny' : 'Clear Night',
    };
  }
  // 1, 2, 3: Mainly clear, partly cloudy, overcast
  if (code >= 1 && code <= 3) {
    return {
      condition: 'cloudy',
      description: code === 1 ? 'Mainly Clear' : code === 2 ? 'Partly Cloudy' : 'Overcast',
    };
  }
  // 45, 48: Fog
  if (code === 45 || code === 48) {
    return {
      condition: 'cloudy',
      description: 'Foggy Mist',
    };
  }
  // 51-67: Drizzle & Rain
  if (code >= 51 && code <= 67) {
    return {
      condition: 'rain',
      description: code >= 65 ? 'Heavy Rain' : 'Rain Showers',
    };
  }
  // 71-77, 85, 86: Snow
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
    return {
      condition: 'snow',
      description: 'Light Snowfall',
    };
  }
  // 80-82: Showers
  if (code >= 80 && code <= 82) {
    return {
      condition: 'rain',
      description: 'Passing Rain',
    };
  }
  // 95-99: Thunderstorm
  if (code >= 95) {
    return {
      condition: 'storm',
      description: 'Thunderstorm',
    };
  }

  return {
    condition: isDay ? 'sunny' : 'clear-night',
    description: 'Fair Weather',
  };
}
