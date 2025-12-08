'use client';

import { CalendarEvent, CATEGORY_CONFIG } from '@/types';

interface CalendarDayProps {
  day: number | null;
  date: string | null;
  isToday: boolean;
  isCurrentMonth: boolean;
  events: CalendarEvent[];
  onClick: () => void;
  animationDelay?: number;
}

export default function CalendarDay({ 
  day, 
  date, 
  isToday, 
  isCurrentMonth, 
  events, 
  onClick,
  animationDelay = 0 
}: CalendarDayProps) {
  if (day === null) {
    return <div className="min-h-[90px] p-2 opacity-30" />;
  }

  const eventsToShow = events.slice(0, 3);
  const moreCount = events.length - 3;
  const hasHighPriority = events.some(e => e.priority === 'high' && !e.completed);
  const allCompleted = events.length > 0 && events.every(e => e.completed);

  return (
    <div
      onClick={onClick}
      style={{ animationDelay: `${animationDelay}ms` }}
      className={`
        min-h-[90px] p-2 rounded-xl cursor-pointer
        flex flex-col transition-all duration-300 fade-in
        group relative overflow-hidden
        ${isToday 
          ? 'bg-gradient-to-br from-cyan-500/30 to-cyan-500/10 border-2 border-cyan-500/60 shadow-lg shadow-cyan-500/20' 
          : isCurrentMonth
            ? 'bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] hover:border-white/20'
            : 'bg-transparent border border-transparent hover:bg-white/[0.03]'
        }
        hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-md
      `}
    >
      {/* Hover gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-violet-500/0 group-hover:from-cyan-500/5 group-hover:to-violet-500/5 transition-all duration-500 rounded-xl" />
      
      {/* Day Number */}
      <div className="relative flex items-center justify-between mb-1">
        <span className={`
          text-sm font-semibold
          ${isToday 
            ? 'text-cyan-300 text-glow-cyan' 
            : isCurrentMonth 
              ? 'text-white/90' 
              : 'text-white/30'
          }
        `}>
          {day}
        </span>
        
        {/* Priority indicator */}
        {hasHighPriority && (
          <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" title="High priority event" />
        )}
        
        {/* All completed indicator */}
        {allCompleted && (
          <span className="text-emerald-400 text-xs">✓</span>
        )}
      </div>

      {/* Events */}
      <div className="relative flex-1 flex flex-col gap-1 overflow-hidden">
        {eventsToShow.map((event, index) => (
          <div
            key={event.id}
            className={`
              group/event relative text-[10px] px-1.5 py-0.5 rounded-md 
              text-white/90 overflow-hidden text-ellipsis whitespace-nowrap 
              font-medium transition-all duration-200
              hover:scale-[1.02] hover:shadow-md
              ${event.completed ? 'opacity-50 line-through' : 'opacity-95'}
            `}
            style={{ 
              backgroundColor: event.color + '40',
              borderLeft: `2px solid ${event.color}`
            }}
            title={`${event.title}${event.time ? ` @ ${event.time}` : ''}`}
          >
            <span className="flex items-center gap-1">
              <span className="text-[8px]">{CATEGORY_CONFIG[event.category].icon}</span>
              <span className="truncate">{event.title}</span>
            </span>
          </div>
        ))}
        
        {moreCount > 0 && (
          <div className="text-[9px] px-1.5 py-0.5 text-white/50 font-medium">
            +{moreCount} more
          </div>
        )}
      </div>

      {/* Event count badge */}
      {events.length > 0 && (
        <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/60">
            {events.length}
          </span>
        </div>
      )}
    </div>
  );
}
