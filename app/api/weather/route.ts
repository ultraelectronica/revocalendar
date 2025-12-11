import { NextResponse } from 'next/server';

const WEATHER_API_KEY = process.env.WEATHER_API || process.env.NEXT_PUBLIC_WEATHER_API;
const WEATHER_API_BASE = 'https://api.weatherapi.com/v1';

// Default location: Manila, Philippines
const DEFAULT_LAT = 14.5995;
const DEFAULT_LON = 120.9842;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Get coordinates from query params, fallback to Manila
  const lat = searchParams.get('lat') || DEFAULT_LAT.toString();
  const lon = searchParams.get('lon') || DEFAULT_LON.toString();
  
  if (!WEATHER_API_KEY) {
    console.error('[Weather API] Missing API key');
    return NextResponse.json(
      { error: 'Weather API key not configured' },
      { status: 500 }
    );
  }

  try {
    // Fetch current weather with forecast, air quality, and astronomy data
    const response = await fetch(
      `${WEATHER_API_BASE}/forecast.json?key=${WEATHER_API_KEY}&q=${lat},${lon}&days=3&aqi=yes`,
      { 
        next: { revalidate: 1800 }, // Cache for 30 minutes
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Weather API] Error response:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to fetch weather data' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Transform data for frontend consumption
    const weatherData = {
      location: {
        name: data.location.name,
        region: data.location.region,
        country: data.location.country,
        localtime: data.location.localtime,
      },
      current: {
        temp_c: data.current.temp_c,
        temp_f: data.current.temp_f,
        feelslike_c: data.current.feelslike_c,
        feelslike_f: data.current.feelslike_f,
        humidity: data.current.humidity,
        wind_kph: data.current.wind_kph,
        wind_dir: data.current.wind_dir,
        uv: data.current.uv,
        condition: {
          text: data.current.condition.text,
          icon: data.current.condition.icon,
          code: data.current.condition.code,
        },
        air_quality: data.current.air_quality ? {
          pm2_5: data.current.air_quality.pm2_5,
          pm10: data.current.air_quality.pm10,
          us_epa_index: data.current.air_quality['us-epa-index'],
          gb_defra_index: data.current.air_quality['gb-defra-index'],
        } : null,
      },
      forecast: data.forecast.forecastday.map((day: any) => ({
        date: day.date,
        maxtemp_c: day.day.maxtemp_c,
        mintemp_c: day.day.mintemp_c,
        condition: {
          text: day.day.condition.text,
          icon: day.day.condition.icon,
          code: day.day.condition.code,
        },
        astro: {
          sunrise: day.astro.sunrise,
          sunset: day.astro.sunset,
          moonrise: day.astro.moonrise,
          moonset: day.astro.moonset,
          moon_phase: day.astro.moon_phase,
        },
        daily_chance_of_rain: day.day.daily_chance_of_rain,
        uv: day.day.uv,
      })),
    };

    return NextResponse.json(weatherData);
  } catch (error) {
    console.error('[Weather API] Fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}
