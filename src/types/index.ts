export interface City {
  id: string;
  name: string;
  country: string;
  countryCode: string; // ISO 2 code for flag or avatar
  timezone: string; // IANA timezone string e.g. "Asia/Tokyo"
  latitude: number;
  longitude: number;
  avatarUrl?: string;
  isDefault?: boolean;
}

export interface WeatherData {
  temperature: number; // Celsius
  feelsLike: number;
  humidity: number;
  weatherCode: number;
  isDay: boolean;
  uvIndex: number;
  windSpeed: number;
  description: string;
  condition: 'sunny' | 'clear-night' | 'cloudy' | 'rain' | 'snow' | 'storm';
  sunrise?: string;
  sunset?: string;
  tempMax?: number;
  tempMin?: number;
}

export interface CountryInsights {
  country: string;
  leader: {
    name: string;
    title: string;
  };
  the_good: string[];
  the_bad: string[];
  fallback?: boolean;
  note?: string;
}

export type ViewMode = 'list' | 'map';

export type TimeFormat = '24h' | '12h';
export type TempUnit = 'C' | 'F';
