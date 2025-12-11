'use client';

import { useState, useEffect, useCallback } from 'react';

// Default location: Manila, Philippines
const DEFAULT_LOCATION = {
  lat: 14.5995,
  lon: 120.9842,
  name: 'Manila',
};

const STORAGE_KEY = 'weather_location';
const REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes

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

  // Fetch weather data from API
  const fetchWeather = useCallback(async (loc: WeatherLocation) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/weather?lat=${loc.lat}&lon=${loc.lon}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }
      
      const data = await response.json();
      setWeather(data);
    } catch (err) {
      console.error('[useWeather] Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load weather');
    } finally {
      setLoading(false);
    }
  }, []);

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

  // Manual refresh
  const refresh = useCallback(async () => {
    await fetchWeather(location);
  }, [fetchWeather, location]);

  // Initialize on mount
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  // Auto-refresh interval
  useEffect(() => {
    const interval = setInterval(() => {
      fetchWeather(location);
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
