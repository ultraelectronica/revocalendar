'use client';

import { useMemo } from 'react';
import { WEEKDAYS_SHORT, MONTHS, getMonthDates } from '@/utils/dateUtils';
import { CalendarEvent } from '@/types';

interface MiniCalendarProps {
  currentMonth: number;
  currentYear: number;
  events: CalendarEvent[];
  onDateClick: (date: string) => void;
  onMonthChange: (month: number, year: number) => void;
}

export default function MiniCalendar({
  currentMonth,
  currentYear,
  events,
  onDateClick,
  onMonthChange,
}: MiniCalendarProps) {
  const days = useMemo(() => {
    return getMonthDates(currentYear, currentMonth);
  }, [currentMonth, currentYear]);

  const eventDates = useMemo(() => {
    const dates = new Set<string>();
    events.forEach(e => dates.add(e.date));
    return dates;
  }, [events]);

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      onMonthChange(11, currentYear - 1);
    } else {
      onMonthChange(currentMonth - 1, currentYear);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      onMonthChange(0, currentYear + 1);
    } else {
      onMonthChange(currentMonth + 1, currentYear);
    }
  };

  const goToToday = () => {
    const today = new Date();
    onMonthChange(today.getMonth(), today.getFullYear());
  };

  return (
    <div className="glass-card p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPrevMonth}
          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
        >
          ‹
        </button>
        <button
          onClick={goToToday}
          className="text-sm font-semibold text-white hover:text-cyan-400 transition-colors"
        >
          {MONTHS[currentMonth]} {currentYear}
        </button>
        <button
          onClick={goToNextMonth}
          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
        >
          ›
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS_SHORT.map(day => (
          <div
            key={day}
            className="text-center text-[10px] font-medium text-white/40 py-1"
          >
            {day.charAt(0)}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((dayData, index) => {
          const hasEvents = dayData.date && eventDates.has(dayData.date);
          
          return (
            <button
              key={index}
              onClick={() => dayData.date && onDateClick(dayData.date)}
              disabled={!dayData.date}
              className={`
                aspect-square rounded-lg text-xs font-medium transition-all duration-200 relative
                ${!dayData.isCurrentMonth ? 'text-white/20' : 'text-white/70 hover:text-white'}
                ${dayData.isToday 
                  ? 'bg-cyan-500 text-slate-900 font-bold shadow-lg shadow-cyan-500/30' 
                  : 'hover:bg-white/10'
                }
              `}
            >
              {dayData.day}
              {hasEvents && !dayData.isToday && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-violet-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

