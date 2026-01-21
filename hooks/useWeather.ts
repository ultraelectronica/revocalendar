'use client';

import { useState, useEffect, useCallback } from 'react';

// Default location: Manila, Philippines
const DEFAULT_LOCATION = {
  lat: 14.5995,
  lon: 120.9842,
  name: 'Manila',
};

const STORAGE_KEY = 'weather_location';
const WEATHER_CACHE_KEY = 'weather_data_cache';
const REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes - same as refresh interval

export interface WeatherLocation {
  lat: number;
  lon: number;
  name?: string;
}

export interface WeatherCondition {
  text: string;
  icon: string;
  code: number;
}

export interface AirQuality {
  pm2_5: number;
  pm10: number;
  us_epa_index: number;
  gb_defra_index: number;
}

export interface Astro {
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  moon_phase: string;
}

export interface ForecastDay {
  date: string;
  maxtemp_c: number;
  mintemp_c: number;
  condition: WeatherCondition;
  astro: Astro;
  daily_chance_of_rain: number;
  uv: number;
}

export interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
    localtime: string;
  };
  current: {
    temp_c: number;
    temp_f: number;
    feelslike_c: number;
    feelslike_f: number;
    humidity: number;
    wind_kph: number;
    wind_dir: string;
    uv: number;
    condition: WeatherCondition;
    air_quality: AirQuality | null;
  };
  forecast: ForecastDay[];
}

interface CachedWeatherData {
  data: WeatherData;
  timestamp: number;
  location: WeatherLocation;
}

interface UseWeatherReturn {
  weather: WeatherData | null;
  location: WeatherLocation;
  loading: boolean;
  error: string | null;
  permissionDenied: boolean;
  refresh: () => Promise<void>;
}

export function useWeather(): UseWeatherReturn {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<WeatherLocation>(DEFAULT_LOCATION);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Get cache key for a specific location
  const getCacheKey = useCallback((loc: WeatherLocation) => {
    return `${WEATHER_CACHE_KEY}_${loc.lat.toFixed(4)}_${loc.lon.toFixed(4)}`;
  }, []);

  // Get cached weather data if valid
  const getCachedWeather = useCallback((loc: WeatherLocation): WeatherData | null => {
    try {
      const cacheKey = getCacheKey(loc);
      const cached = localStorage.getItem(cacheKey);
      if (!cached) return null;

      const parsed: CachedWeatherData = JSON.parse(cached);
      const now = Date.now();
      const age = now - parsed.timestamp;

      // Check if cache is still valid and location matches
      if (age < CACHE_DURATION && 
          Math.abs(parsed.location.lat - loc.lat) < 0.0001 &&
          Math.abs(parsed.location.lon - loc.lon) < 0.0001) {
        return parsed.data;
      }

      // Cache expired or location changed, remove it
      localStorage.removeItem(cacheKey);
      return null;
    } catch {
      return null;
    }
  }, [getCacheKey]);

  // Store weather data in cache
  const setCachedWeather = useCallback((loc: WeatherLocation, data: WeatherData) => {
    try {
      const cacheKey = getCacheKey(loc);
      const cached: CachedWeatherData = {
        data,
        timestamp: Date.now(),
        location: loc,
      };
      localStorage.setItem(cacheKey, JSON.stringify(cached));
    } catch (err) {
      console.warn('[useWeather] Failed to cache weather data:', err);
    }
  }, [getCacheKey]);

  // Fetch weather data from API
  const fetchWeather = useCallback(async (loc: WeatherLocation, forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Check cache first unless forcing refresh
      if (!forceRefresh) {
        const cached = getCachedWeather(loc);
        if (cached) {
          setWeather(cached);
          setLoading(false);
          return;
        }
      }
      
      const response = await fetch(`/api/weather?lat=${loc.lat}&lon=${loc.lon}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }
      
      const data = await response.json();
      setWeather(data);
      setCachedWeather(loc, data);
    } catch (err) {
      console.error('[useWeather] Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load weather');
      
      // On error, try to use cached data as fallback
      if (!forceRefresh) {
        const cached = getCachedWeather(loc);
        if (cached) {
          setWeather(cached);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [getCachedWeather, setCachedWeather]);

  // Request geolocation
  const requestLocation = useCallback(async () => {
    // Check for stored location first
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setLocation(parsed);
        await fetchWeather(parsed);
        return;
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    // Request browser geolocation
    if (!navigator.geolocation) {
      console.log('[useWeather] Geolocation not supported, using default');
      setPermissionDenied(true);
      await fetchWeather(DEFAULT_LOCATION);
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        });
      });

      const newLocation: WeatherLocation = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      };

      setLocation(newLocation);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newLocation));
      await fetchWeather(newLocation);
    } catch (err) {
      console.log('[useWeather] Location denied or error, using Manila default');
      setPermissionDenied(true);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_LOCATION));
      await fetchWeather(DEFAULT_LOCATION);
    }
  }, [fetchWeather]);

  // Manual refresh (bypasses cache)
  const refresh = useCallback(async () => {
    await fetchWeather(location, true);
  }, [fetchWeather, location]);

  // Initialize on mount
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  // Auto-refresh interval (only fetches if cache is expired)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchWeather(location, false); // Will use cache if valid
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchWeather, location]);

  return {
    weather,
    location,
    loading,
    error,
    permissionDenied,
    refresh,
  };
}
