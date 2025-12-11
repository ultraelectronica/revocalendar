'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

// Curated list of major timezone cities organized by region
const TIMEZONE_DATA = {
  Americas: [
    { id: 'America/New_York', city: 'New York', abbr: 'EST/EDT', offset: -5 },
    { id: 'America/Los_Angeles', city: 'Los Angeles', abbr: 'PST/PDT', offset: -8 },
    { id: 'America/Chicago', city: 'Chicago', abbr: 'CST/CDT', offset: -6 },
    { id: 'America/Denver', city: 'Denver', abbr: 'MST/MDT', offset: -7 },
    { id: 'America/Toronto', city: 'Toronto', abbr: 'EST/EDT', offset: -5 },
    { id: 'America/Vancouver', city: 'Vancouver', abbr: 'PST/PDT', offset: -8 },
    { id: 'America/Mexico_City', city: 'Mexico City', abbr: 'CST', offset: -6 },
    { id: 'America/Sao_Paulo', city: 'São Paulo', abbr: 'BRT', offset: -3 },
    { id: 'America/Buenos_Aires', city: 'Buenos Aires', abbr: 'ART', offset: -3 },
    { id: 'America/Lima', city: 'Lima', abbr: 'PET', offset: -5 },
  ],
  Europe: [
    { id: 'Europe/London', city: 'London', abbr: 'GMT/BST', offset: 0 },
    { id: 'Europe/Paris', city: 'Paris', abbr: 'CET/CEST', offset: 1 },
    { id: 'Europe/Berlin', city: 'Berlin', abbr: 'CET/CEST', offset: 1 },
    { id: 'Europe/Moscow', city: 'Moscow', abbr: 'MSK', offset: 3 },
    { id: 'Europe/Rome', city: 'Rome', abbr: 'CET/CEST', offset: 1 },
    { id: 'Europe/Madrid', city: 'Madrid', abbr: 'CET/CEST', offset: 1 },
    { id: 'Europe/Amsterdam', city: 'Amsterdam', abbr: 'CET/CEST', offset: 1 },
    { id: 'Europe/Stockholm', city: 'Stockholm', abbr: 'CET/CEST', offset: 1 },
    { id: 'Europe/Istanbul', city: 'Istanbul', abbr: 'TRT', offset: 3 },
    { id: 'Europe/Athens', city: 'Athens', abbr: 'EET/EEST', offset: 2 },
  ],
  'Asia & Pacific': [
    { id: 'Asia/Tokyo', city: 'Tokyo', abbr: 'JST', offset: 9 },
    { id: 'Asia/Shanghai', city: 'Shanghai', abbr: 'CST', offset: 8 },
    { id: 'Asia/Hong_Kong', city: 'Hong Kong', abbr: 'HKT', offset: 8 },
    { id: 'Asia/Singapore', city: 'Singapore', abbr: 'SGT', offset: 8 },
    { id: 'Asia/Manila', city: 'Manila', abbr: 'PHT', offset: 8 },
    { id: 'Asia/Seoul', city: 'Seoul', abbr: 'KST', offset: 9 },
    { id: 'Asia/Dubai', city: 'Dubai', abbr: 'GST', offset: 4 },
    { id: 'Asia/Kolkata', city: 'Mumbai', abbr: 'IST', offset: 5.5 },
    { id: 'Asia/Bangkok', city: 'Bangkok', abbr: 'ICT', offset: 7 },
    { id: 'Asia/Jakarta', city: 'Jakarta', abbr: 'WIB', offset: 7 },
  ],
  'Australia & Oceania': [
    { id: 'Australia/Sydney', city: 'Sydney', abbr: 'AEST/AEDT', offset: 10 },
    { id: 'Australia/Melbourne', city: 'Melbourne', abbr: 'AEST/AEDT', offset: 10 },
    { id: 'Australia/Perth', city: 'Perth', abbr: 'AWST', offset: 8 },
    { id: 'Australia/Brisbane', city: 'Brisbane', abbr: 'AEST', offset: 10 },
    { id: 'Pacific/Auckland', city: 'Auckland', abbr: 'NZST/NZDT', offset: 12 },
    { id: 'Pacific/Fiji', city: 'Fiji', abbr: 'FJT', offset: 12 },
    { id: 'Pacific/Honolulu', city: 'Honolulu', abbr: 'HST', offset: -10 },
  ],
  'Africa & Middle East': [
    { id: 'Africa/Cairo', city: 'Cairo', abbr: 'EET', offset: 2 },
    { id: 'Africa/Lagos', city: 'Lagos', abbr: 'WAT', offset: 1 },
    { id: 'Africa/Johannesburg', city: 'Johannesburg', abbr: 'SAST', offset: 2 },
    { id: 'Africa/Nairobi', city: 'Nairobi', abbr: 'EAT', offset: 3 },
    { id: 'Asia/Jerusalem', city: 'Jerusalem', abbr: 'IST/IDT', offset: 2 },
    { id: 'Asia/Riyadh', city: 'Riyadh', abbr: 'AST', offset: 3 },
  ],
};

// Get all timezones flattened
const ALL_TIMEZONES = Object.entries(TIMEZONE_DATA).flatMap(([region, zones]) =>
  zones.map((zone) => ({ ...zone, region }))
);

interface TimezoneSelectorProps {
  timezone: string;
  onTimezoneChange: (timezone: string) => void;
}

export default function TimezoneSelector({
  timezone,
  onTimezoneChange,
}: TimezoneSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [time, setTime] = useState(new Date());
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Focus search input when expanded
  useEffect(() => {
    if (isExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isExpanded]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
        setSearchQuery('');
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsExpanded(false);
        setSearchQuery('');
      }
    };

    if (isExpanded) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded]);

  // Get current timezone info
  const currentTimezoneInfo = useMemo(() => {
    const found = ALL_TIMEZONES.find((tz) => tz.id === timezone);
    if (found) return found;

    // Fallback: try to derive info from the timezone string
    const parts = timezone.split('/');
    const city = parts[parts.length - 1].replace(/_/g, ' ');
    return {
      id: timezone,
      city,
      abbr: 'Local',
      offset: 0,
      region: 'Local',
    };
  }, [timezone]);

  // Get local timezone for offset calculation
  const localTimezone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    []
  );

  // Calculate offset from local time
  const offsetFromLocal = useMemo(() => {
    const localDate = new Date();
    const localOffset = localDate.getTimezoneOffset() * -1; // in minutes
    const selectedOffset = currentTimezoneInfo.offset * 60; // convert hours to minutes
    const diffMinutes = selectedOffset - localOffset;
    const diffHours = diffMinutes / 60;

    if (diffHours === 0) return null;
    const sign = diffHours > 0 ? '+' : '';
    const absHours = Math.abs(diffHours);
    const hours = Math.floor(absHours);
    const minutes = (absHours - hours) * 60;

    if (minutes === 0) {
      return `${sign}${diffHours}h`;
    }
    return `${sign}${hours}h ${minutes}m`;
  }, [currentTimezoneInfo.offset]);

  // Format time for display
  const formattedTime = useMemo(() => {
    try {
      return time.toLocaleTimeString('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
    } catch {
      return time.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
    }
  }, [time, timezone]);

  // Format date for display
  const formattedDate = useMemo(() => {
    try {
      return time.toLocaleDateString('en-US', {
        timeZone: timezone,
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return time.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    }
  }, [time, timezone]);

  // Filter timezones based on search
  const filteredTimezones = useMemo(() => {
    if (!searchQuery.trim()) return TIMEZONE_DATA;

    const query = searchQuery.toLowerCase();
    const filtered: typeof TIMEZONE_DATA = {} as typeof TIMEZONE_DATA;

    Object.entries(TIMEZONE_DATA).forEach(([region, zones]) => {
      const matchingZones = zones.filter(
        (zone) =>
          zone.city.toLowerCase().includes(query) ||
          zone.abbr.toLowerCase().includes(query) ||
          zone.id.toLowerCase().includes(query) ||
          `gmt${zone.offset >= 0 ? '+' : ''}${zone.offset}`.includes(query) ||
          `utc${zone.offset >= 0 ? '+' : ''}${zone.offset}`.includes(query)
      );
      if (matchingZones.length > 0) {
        (filtered as Record<string, typeof zones>)[region] = matchingZones;
      }
    });

    return filtered;
  }, [searchQuery]);

  // Get time for a specific timezone
  const getTimeForTimezone = useCallback(
    (tz: string) => {
      try {
        return time.toLocaleTimeString('en-US', {
          timeZone: tz,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
      } catch {
        return '--:--';
      }
    },
    [time]
  );

  // Handle timezone selection
  const handleSelect = (tzId: string) => {
    onTimezoneChange(tzId);
    setIsExpanded(false);
    setSearchQuery('');
  };

  // Calculate orbital animation rotation
  const orbitalRotation = useMemo(() => {
    const seconds = time.getSeconds();
    return (seconds / 60) * 360;
  }, [time]);

  return (
    <div ref={containerRef} className="relative">
      {/* Collapsed State - Elegant Time Display */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          w-full glass-card p-4 transition-all duration-500 group cursor-pointer
          ${isExpanded ? 'ring-2 ring-cyan-500/30' : ''}
          ${isHovered && !isExpanded ? 'bg-gradient-to-br from-white/[0.12] to-white/[0.04]' : ''}
        `}
      >
        <div className="flex items-center justify-between">
          {/* Left: Time Display with Orbital Animation */}
          <div className="flex items-center gap-4">
            {/* Orbital Clock Icon */}
            <div className="relative w-12 h-12 flex items-center justify-center">
              {/* Static sun/core */}
              <div className="absolute w-4 h-4 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-orange-500/40" />

              {/* Orbiting ring */}
              <div
                className="absolute w-full h-full rounded-full border border-cyan-500/30"
                style={{
                  transform: `rotate(${orbitalRotation}deg)`,
                  transition: 'transform 1s linear',
                }}
              >
                {/* Orbiting dot (planet) */}
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 shadow-lg shadow-cyan-500/50" />
              </div>

              {/* Second orbit ring */}
              <div
                className="absolute w-9 h-9 rounded-full border border-violet-500/20"
                style={{
                  transform: `rotate(${-orbitalRotation * 0.7}deg)`,
                  transition: 'transform 1s linear',
                }}
              >
                <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-violet-400/70" />
              </div>
            </div>

            {/* Time & Date */}
            <div className="text-left">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-white tracking-wide text-glow-cyan">
                  {formattedTime.split(' ')[0]}
                </span>
                <span className="text-sm font-medium text-cyan-400/80">
                  {formattedTime.split(' ')[1]}
                </span>
              </div>
              <p className="text-xs text-white/40">{formattedDate}</p>
            </div>
          </div>

          {/* Right: Timezone Info */}
          <div className="flex items-center gap-3">
            {/* Offset Indicator */}
            {offsetFromLocal && timezone !== localTimezone && (
              <div
                className={`
                  px-2 py-1 rounded-md text-xs font-medium animate-pulse-subtle
                  ${offsetFromLocal.startsWith('+') 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                  }
                `}
              >
                {offsetFromLocal}
              </div>
            )}

            {/* City & Timezone */}
            <div className="text-right">
              <p className="text-sm font-semibold text-white">
                {currentTimezoneInfo.city}
              </p>
              <p className="text-xs text-white/40">{currentTimezoneInfo.abbr}</p>
            </div>

            {/* Expand Indicator */}
            <svg
              className={`w-5 h-5 text-white/40 transition-transform duration-300 ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </button>

      {/* Expanded State - Timezone Picker */}
      {isExpanded && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="glass-card p-4 max-h-[400px] overflow-hidden flex flex-col">
            {/* Search Bar */}
            <div className="relative mb-4">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search city, timezone, or GMT offset..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:bg-white/10 focus:border-cyan-500/50 transition-all"
              />
            </div>

            {/* Timezone List */}
            <div className="overflow-y-auto flex-1 pr-1 space-y-4">
              {Object.entries(filteredTimezones).map(([region, zones]) => (
                <div key={region}>
                  {/* Region Header */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                      {region}
                    </span>
                    <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
                  </div>

                  {/* Timezone Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    {zones.map((zone) => {
                      const isSelected = zone.id === timezone;
                      const zoneTime = getTimeForTimezone(zone.id);

                      return (
                        <button
                          key={zone.id}
                          onClick={() => handleSelect(zone.id)}
                          className={`
                            relative p-3 rounded-xl text-left transition-all duration-200 group/item
                            ${
                              isSelected
                                ? 'bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/30'
                                : 'bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20'
                            }
                          `}
                        >
                          {/* Selected Indicator */}
                          {isSelected && (
                            <div className="absolute top-2 right-2">
                              <svg
                                className="w-4 h-4 text-cyan-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          )}

                          {/* City & Time */}
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`text-sm font-medium ${
                                isSelected ? 'text-white' : 'text-white/80'
                              }`}
                            >
                              {zone.city}
                            </span>
                            <span
                              className={`text-xs font-mono ${
                                isSelected ? 'text-cyan-400' : 'text-white/40'
                              }`}
                            >
                              {zoneTime}
                            </span>
                          </div>

                          {/* Timezone Abbr */}
                          <p className="text-xs text-white/40 mt-0.5">
                            {zone.abbr} • GMT{zone.offset >= 0 ? '+' : ''}{zone.offset}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* No Results */}
              {Object.keys(filteredTimezones).length === 0 && (
                <div className="text-center py-8">
                  <svg
                    className="w-12 h-12 mx-auto text-white/20 mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-white/40 text-sm">No timezones found</p>
                  <p className="text-white/20 text-xs mt-1">
                    Try searching for a city or GMT offset
                  </p>
                </div>
              )}
            </div>

            {/* Footer Hint */}
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
              <span className="text-xs text-white/30">
                <kbd className="px-1.5 py-0.5 bg-white/10 rounded">Esc</kbd> to close
              </span>
              <span className="text-xs text-white/30">
                {ALL_TIMEZONES.length} timezones available
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
