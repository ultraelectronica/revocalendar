import { useMemo } from 'react';
import { CalendarEvent } from '@/types';
import { formatDateString, WEEKDAYS, isToday } from '@/utils/dateUtils';
import CalendarDay from './CalendarDay';

interface CalendarProps {
  nav: number;
  events: CalendarEvent[];
  onDayClick: (date: string) => void;
}

export default function Calendar({ nav, events, onDayClick }: CalendarProps) {
  const { days } = useMemo(() => {
    const dt = new Date();
    if (nav !== 0) {
      dt.setMonth(new Date().getMonth() + nav);
    }

    const today = new Date();
    const month = dt.getMonth();
    const year = dt.getFullYear();

    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const dateString = firstDayOfMonth.toLocaleDateString('en-us', {
      weekday: 'long',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
    const paddingDays = WEEKDAYS.indexOf(dateString.split(', ')[0]);

    const days: Array<{ day: number | null; date: string | null; isToday: boolean }> = [];

    for (let i = 1; i <= paddingDays + daysInMonth; i++) {
      if (i <= paddingDays) {
        days.push({ day: null, date: null, isToday: false });
      } else {
        const currentDay = i - paddingDays;
        const date = formatDateString(month, currentDay, year);
        days.push({
          day: currentDay,
          date,
          isToday: isToday(currentDay, month, year, nav),
        });
      }
    }

    return { days };
  }, [nav]);

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 gap-2 p-2">
        {WEEKDAYS.map(day => (
          <div
            key={day}
            className="p-3 text-center font-semibold text-sm text-white/90"
          >
            {day.slice(0, 3)}
          </div>
        ))}
        {days.map((dayData, index) => (
          <CalendarDay
            key={index}
            day={dayData.day}
            date={dayData.date}
            isToday={dayData.isToday}
            events={dayData.date ? events.filter(e => e.date === dayData.date) : []}
            onClick={() => dayData.date && onDayClick(dayData.date)}
          />
        ))}
      </div>
    </div>
  );
}

