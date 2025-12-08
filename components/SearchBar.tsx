'use client';

import { useState, useRef, useEffect } from 'react';
import { CalendarEvent } from '@/types';
import { getRelativeDay, formatTime } from '@/utils/dateUtils';

interface SearchBarProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function SearchBar({ 
  events, 
  onEventClick, 
  searchQuery, 
  setSearchQuery 
}: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredEvents = searchQuery.trim()
    ? events.filter(e => 
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.description && e.description.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 8)
    : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleEventClick = (event: CalendarEvent) => {
    onEventClick(event);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
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
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search events..."
          className="w-full pl-10 pr-16 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:bg-white/10 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded bg-white/10 text-white/40 text-xs font-mono hidden sm:inline-block">
          ⌘K
        </kbd>
      </div>

      {/* Dropdown Results */}
      {isOpen && searchQuery.trim() && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 scale-in">
          {filteredEvents.length > 0 ? (
            <div className="max-h-80 overflow-y-auto">
              {filteredEvents.map((event, index) => (
                <button
                  key={event.id}
                  onClick={() => handleEventClick(event)}
                  className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-left ${
                    index !== filteredEvents.length - 1 ? 'border-b border-white/5' : ''
                  }`}
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: event.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium text-sm truncate">
                      {event.title}
                    </div>
                    <div className="text-white/50 text-xs flex items-center gap-2">
                      <span>{getRelativeDay(event.date)}</span>
                      {event.time && (
                        <>
                          <span>•</span>
                          <span className="font-mono">{formatTime(event.time)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {event.completed && (
                    <span className="text-emerald-400 text-xs">✓</span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-white/40 text-sm">
              No events found for "{searchQuery}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}

