'use client';

import { useMemo } from 'react';
import { CalendarEvent } from '@/types';
import { WEEKDAYS_SHORT, getMonthDates } from '@/utils/dateUtils';
import CalendarDay from './CalendarDay';

interface CalendarProps {
  nav: number;
  events: CalendarEvent[];
  onDayClick: (date: string) => void;
}

export default function Calendar({ nav, events, onDayClick }: CalendarProps) {
  const { days } = useMemo(() => {
    const dt = new Date();
    dt.setMonth(dt.getMonth() + nav);

    const month = dt.getMonth();
    const year = dt.getFullYear();
    const days = getMonthDates(year, month);

    return { days, month, year };
  }, [nav]);

  return (
    <div className="w-full">
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 sm:mb-3">
        {WEEKDAYS_SHORT.map((day, index) => (
          <div
            key={day}
            className={`
              py-1 sm:py-2 text-center text-[10px] sm:text-xs font-semibold uppercase tracking-wider
              ${index === 0 || index === 6 ? 'text-white/40' : 'text-white/60'}
            `}
          >
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{day.charAt(0)}</span>
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {days.map((dayData, index) => (
          <CalendarDay
            key={`${dayData.date}-${index}`}
            day={dayData.day}
            date={dayData.date}
            isToday={dayData.isToday}
            isCurrentMonth={dayData.isCurrentMonth}
            events={dayData.date ? events.filter(e => e.date === dayData.date) : []}
            onClick={() => dayData.date && onDayClick(dayData.date)}
            animationDelay={index * 10}
          />
        ))}
      </div>
    </div>
  );
}
