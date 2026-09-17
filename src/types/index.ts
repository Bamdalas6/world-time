export interface City {
  id: string;
  name: string; // Capital city or major city name
  country: string;
  countryCode: string; // ISO 3166-1 alpha-2
  timezone: string; // IANA timezone string
  latitude: number;
  longitude: number;
  flag: string; // Emoji flag
  continent: string;
  population: string; // Human-readable, e.g. "125.7M"
  languages: string[];
  currency: string;
  callingCode: string;
  avatarUrl?: string;
  isDefault?: boolean;
  cultureImageIds?: string[]; // Unsplash photo IDs for culture photos
}

export interface WeatherData {
  temperature: number;
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
  funFacts: string[];
  cuisine: string[];
  festivals: string[];
  knownFor: string;
  cultureDescription: string;
  fallback?: boolean;
  note?: string;
}

export type ViewMode = 'list' | 'map';
export type TimeFormat = '24h' | '12h';
export type TempUnit = 'C' | 'F';
