'use client';

import { useState, useEffect } from 'react';
import { useWeather, WeatherData } from '@/hooks/useWeather';

// Weather condition code to icon mapping
function getWeatherIcon(code: number, isDay: boolean = true): string {
  // WeatherAPI condition codes: https://www.weatherapi.com/docs/weather_conditions.json
  const sunnyDayCodes = [1000];
  const partlyCloudyCodes = [1003, 1006];
  const cloudyCodes = [1009];
  const mistCodes = [1030, 1135, 1147];
  const rainCodes = [1063, 1150, 1153, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246];
  const snowCodes = [1066, 1114, 1117, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258, 1279, 1282];
  const thunderCodes = [1087, 1273, 1276];
  
  if (sunnyDayCodes.includes(code)) return isDay ? '☀️' : '🌙';
  if (partlyCloudyCodes.includes(code)) return isDay ? '⛅' : '☁️';
  if (cloudyCodes.includes(code)) return '☁️';
  if (mistCodes.includes(code)) return '🌫️';
  if (rainCodes.includes(code)) return '🌧️';
  if (snowCodes.includes(code)) return '❄️';
  if (thunderCodes.includes(code)) return '⛈️';
  return '🌤️';
}

// UV Index severity levels
function getUVLevel(uv: number): { label: string; color: string; bgColor: string } {
  if (uv <= 2) return { label: 'Low', color: 'text-emerald-400', bgColor: 'bg-emerald-500/20' };
  if (uv <= 5) return { label: 'Moderate', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' };
  if (uv <= 7) return { label: 'High', color: 'text-orange-400', bgColor: 'bg-orange-500/20' };
  if (uv <= 10) return { label: 'Very High', color: 'text-red-400', bgColor: 'bg-red-500/20' };
  return { label: 'Extreme', color: 'text-purple-400', bgColor: 'bg-purple-500/20' };
}

// Air Quality Index levels (US EPA)
function getAQILevel(aqi: number): { label: string; color: string; advice: string } {
  if (aqi === 1) return { label: 'Good', color: 'text-emerald-400', advice: 'Air quality is satisfactory' };
  if (aqi === 2) return { label: 'Moderate', color: 'text-yellow-400', advice: 'Acceptable for most people' };
  if (aqi === 3) return { label: 'Unhealthy (Sensitive)', color: 'text-orange-400', advice: 'Sensitive groups may experience effects' };
  if (aqi === 4) return { label: 'Unhealthy', color: 'text-red-400', advice: 'Everyone may experience effects' };
  if (aqi === 5) return { label: 'Very Unhealthy', color: 'text-purple-400', advice: 'Health alert for everyone' };
  return { label: 'Hazardous', color: 'text-rose-400', advice: 'Emergency health warning' };
}

// Format time from "06:30 AM" to "6:30"
function formatTime(time: string): string {
  const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return time;
  let hours = parseInt(match[1]);
  const minutes = match[2];
  const period = match[3].toUpperCase();
  
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  
  return `${hours}:${minutes}`;
}

// Sunrise/Sunset timeline - horizontal design for narrow containers
function SunTimeline({ sunrise, sunset, currentTime }: { sunrise: string; sunset: string; currentTime: string }) {
  const sunriseMinutes = parseTimeToMinutes(sunrise);
  const sunsetMinutes = parseTimeToMinutes(sunset);
  const currentMinutes = parseTimeToMinutes(currentTime);
  
  const dayLength = sunsetMinutes - sunriseMinutes;
  const elapsed = Math.max(0, Math.min(dayLength, currentMinutes - sunriseMinutes));
  const progress = dayLength > 0 ? (elapsed / dayLength) * 100 : 50;
  const isDay = currentMinutes >= sunriseMinutes && currentMinutes <= sunsetMinutes;
  
  return (
    <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-orange-500/5 via-amber-500/10 to-violet-500/5 border border-white/5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{isDay ? '☀️' : '🌙'}</span>
          <span className="text-xs text-white/60">{isDay ? 'Daylight' : 'Night'}</span>
        </div>
        {isDay && (
          <span className="text-[10px] text-white/40">
            {Math.round(progress)}% of day
          </span>
        )}
      </div>
      
      {/* Timeline track */}
      <div className="relative h-2 bg-white/10 rounded-full overflow-visible">
        {/* Progress fill */}
        <div 
          className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-orange-400 via-amber-400 to-amber-300 transition-all duration-500"
          style={{ width: `${isDay ? progress : 0}%` }}
        />
        
        {/* Sun indicator */}
        {isDay && (
          <div 
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-500"
            style={{ left: `${progress}%` }}
          >
            {/* Glow */}
            <div className="absolute inset-0 w-5 h-5 -m-0.5 rounded-full bg-amber-400/40 blur-sm animate-pulse" />
            {/* Sun circle */}
            <div className="relative w-4 h-4 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 border-2 border-amber-200 shadow-lg shadow-amber-500/50" />
          </div>
        )}
        
        {/* Night moon indicator */}
        {!isDay && (
          <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 border border-slate-200/50 shadow-lg shadow-slate-400/30" />
          </div>
        )}
      </div>
      
      {/* Labels */}
      <div className="flex justify-between mt-2 text-[10px]">
        <div className="flex items-center gap-1">
          <span className="text-orange-400">↑</span>
          <span className="text-white/60">{formatTime(sunrise)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-white/60">{formatTime(sunset)}</span>
          <span className="text-violet-400">↓</span>
        </div>
      </div>
    </div>
  );
}

function parseTimeToMinutes(time: string): number {
  const match = time.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!match) return 0;
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const period = match[3]?.toUpperCase();
  
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  
  return hours * 60 + minutes;
}

// Forecast day card
function ForecastCard({ day, index }: { day: WeatherData['forecast'][0]; index: number }) {
  const date = new Date(day.date);
  const dayName = index === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' });
  
  return (
    <div className="flex-1 min-w-0 p-2 rounded-xl bg-white/5 border border-white/5 text-center group hover:bg-white/10 transition-all">
      <div className="text-[10px] text-white/50 mb-1">{dayName}</div>
      <div className="text-xl mb-1 group-hover:scale-110 transition-transform">
        {getWeatherIcon(day.condition.code)}
      </div>
      <div className="flex justify-center gap-1 text-xs">
        <span className="text-white font-medium">{Math.round(day.maxtemp_c)}°</span>
        <span className="text-white/40">{Math.round(day.mintemp_c)}°</span>
      </div>
      {day.daily_chance_of_rain > 0 && (
        <div className="text-[10px] text-cyan-400 mt-1 flex items-center justify-center gap-0.5">
          <span>💧</span>
          <span>{day.daily_chance_of_rain}%</span>
        </div>
      )}
    </div>
  );
}

// Loading skeleton
function WeatherSkeleton() {
  return (
    <div className="glass-card p-4 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 w-20 bg-white/10 rounded" />
        <div className="h-3 w-16 bg-white/10 rounded" />
      </div>
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 bg-white/10 rounded-full" />
        <div className="space-y-2">
          <div className="h-8 w-20 bg-white/10 rounded" />
          <div className="h-3 w-24 bg-white/10 rounded" />
        </div>
      </div>
      <div className="flex gap-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex-1 h-20 bg-white/10 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// Error state
function WeatherError({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-3 text-red-400">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span className="text-sm">{error}</span>
      </div>
      <button
        onClick={onRetry}
        className="mt-3 w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-sm transition-all"
      >
        Retry
      </button>
    </div>
  );
}

export default function WeatherWidget() {
  const { weather, loading, error, permissionDenied, refresh } = useWeather();
  const [expanded, setExpanded] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState('');

  // Update current time every minute
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(`${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <WeatherSkeleton />;
  if (error) return <WeatherError error={error} onRetry={refresh} />;
  if (!weather) return null;

  const { current, location, forecast } = weather;
  const uvLevel = getUVLevel(current.uv);
  const aqiLevel = current.air_quality ? getAQILevel(current.air_quality.us_epa_index) : null;
  const today = forecast[0];
  
  // Determine if it's day or night
  const now = new Date();
  const hours = now.getHours();
  const isDay = hours >= 6 && hours < 18;

  return (
    <div className="glass-card p-4 group">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getWeatherIcon(current.condition.code, isDay)}</span>
          <div>
            <h3 className="text-sm font-medium text-white">{location.name}</h3>
            {permissionDenied && (
              <span className="text-[10px] text-amber-400/70">Default location</span>
            )}
          </div>
        </div>
        <button
          onClick={refresh}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all"
          title="Refresh weather"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Current Temperature */}
      <div className="flex items-center gap-4 mb-4">
        <div className="text-5xl font-light text-white">
          {Math.round(current.temp_c)}°
        </div>
        <div className="space-y-1">
          <div className="text-xs text-white/50">
            Feels like {Math.round(current.feelslike_c)}°
          </div>
          <div className="text-xs text-white/70 capitalize">
            {current.condition.text}
          </div>
          <div className="flex items-center gap-2 text-[10px] text-white/40">
            <span>💨 {current.wind_kph} km/h</span>
            <span>💧 {current.humidity}%</span>
          </div>
        </div>
      </div>

      {/* UV & AQI Quick View */}
      <div className="flex gap-2 mb-3">
        <div className={`flex-1 px-2 py-1.5 rounded-lg ${uvLevel.bgColor} border border-white/5`}>
          <div className="flex items-center gap-1.5">
            <span className="text-xs">☀️</span>
            <span className={`text-xs font-medium ${uvLevel.color}`}>UV {current.uv}</span>
          </div>
          <div className="text-[10px] text-white/50">{uvLevel.label}</div>
        </div>
        {aqiLevel && (
          <div className="flex-1 px-2 py-1.5 rounded-lg bg-white/5 border border-white/5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs">🌬️</span>
              <span className={`text-xs font-medium ${aqiLevel.color}`}>AQI</span>
            </div>
            <div className="text-[10px] text-white/50">{aqiLevel.label}</div>
          </div>
        )}
      </div>

      {/* Sunrise/Sunset Timeline */}
      {today && (
        <SunTimeline 
          sunrise={today.astro.sunrise}
          sunset={today.astro.sunset}
          currentTime={currentTimeStr}
        />
      )}

      {/* Expand/Collapse Toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full mt-3 py-1.5 flex items-center justify-center gap-1 text-[10px] text-white/40 hover:text-white/60 transition-all"
      >
        <span>{expanded ? 'Less' : '3-Day Forecast'}</span>
        <svg 
          className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Forecast Cards */}
      {expanded && (
        <div className="flex gap-2 mt-2 animate-in slide-in-from-top-2 duration-200">
          {forecast.map((day, index) => (
            <ForecastCard key={day.date} day={day} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
