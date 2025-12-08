'use client';

import { CalendarEvent, CATEGORY_CONFIG, PRIORITY_CONFIG } from '@/types';
import { getRelativeDay, formatTime, getDaysUntil } from '@/utils/dateUtils';

interface UpcomingPlansProps {
  groupedEvents: {
    today: CalendarEvent[];
    tomorrow: CalendarEvent[];
    thisWeek: CalendarEvent[];
    later: CalendarEvent[];
  };
  onEventClick: (event: CalendarEvent) => void;
  onToggleComplete: (eventId: string) => void;
}

interface EventGroupProps {
  title: string;
  events: CalendarEvent[];
  icon: React.ReactNode;
  accentColor: string;
  onEventClick: (event: CalendarEvent) => void;
  onToggleComplete: (eventId: string) => void;
}

function EventGroup({ title, events, icon, accentColor, onEventClick, onToggleComplete }: EventGroupProps) {
  if (events.length === 0) return null;

  return (
    <div className="mb-5 last:mb-0">
      {/* Group Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${accentColor}`}>
          {icon}
        </div>
        <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider">
          {title}
        </h4>
        <span className="text-xs text-white/30">({events.length})</span>
      </div>

      {/* Events */}
      <div className="space-y-2">
        {events.map((event, index) => (
          <EventCard 
            key={event.id} 
            event={event} 
            onClick={() => onEventClick(event)}
            onToggleComplete={() => onToggleComplete(event.id)}
            delay={index * 50}
          />
        ))}
      </div>
    </div>
  );
}

interface EventCardProps {
  event: CalendarEvent;
  onClick: () => void;
  onToggleComplete: () => void;
  delay?: number;
}

function EventCard({ event, onClick, onToggleComplete, delay = 0 }: EventCardProps) {
  const daysUntil = getDaysUntil(event.date);
  const isOverdue = daysUntil < 0 && !event.completed;
  const categoryConfig = CATEGORY_CONFIG[event.category];
  const priorityConfig = PRIORITY_CONFIG[event.priority];

  return (
    <div
      style={{ animationDelay: `${delay}ms` }}
      className={`
        glass-card p-3 cursor-pointer transition-all duration-300 fade-in
        group relative overflow-hidden
        ${event.completed ? 'opacity-50' : ''}
        ${isOverdue ? 'border-l-4 border-l-red-500' : ''}
        ${event.priority === 'high' && !event.completed ? 'border-l-4 border-l-orange-500' : ''}
        hover:bg-white/[0.08] hover:scale-[1.01] hover:-translate-x-0.5
      `}
    >
      {/* Background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-transparent group-hover:from-cyan-500/5 group-hover:to-transparent transition-all duration-500" />
      
      <div className="relative flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete();
          }}
          className={`
            mt-0.5 w-5 h-5 rounded-md border-2 flex-shrink-0
            flex items-center justify-center transition-all duration-200
            ${event.completed 
              ? 'bg-emerald-500 border-emerald-500 text-white' 
              : 'border-white/20 hover:border-cyan-500/50 hover:bg-cyan-500/10'
            }
          `}
        >
          {event.completed && (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0" onClick={onClick}>
          {/* Title row */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">{categoryConfig.icon}</span>
            <span className={`
              font-medium text-sm text-white/90 truncate
              ${event.completed ? 'line-through text-white/50' : ''}
            `}>
              {event.title}
            </span>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-2 text-xs text-white/50">
            <span className={`${isOverdue ? 'text-red-400 font-medium' : ''}`}>
              {isOverdue ? 'Overdue' : getRelativeDay(event.date)}
            </span>
            {event.time && (
              <>
                <span>•</span>
                <span className="font-mono text-white/40">{formatTime(event.time)}</span>
              </>
            )}
            {event.priority !== 'medium' && (
              <>
                <span>•</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium`}
                  style={{ 
                    backgroundColor: priorityConfig.color + '20',
                    color: priorityConfig.color 
                  }}>
                  {priorityConfig.label}
                </span>
              </>
            )}
          </div>

          {/* Description preview */}
          {event.description && (
            <p className="text-xs text-white/30 mt-1.5 line-clamp-1">
              {event.description}
            </p>
          )}
        </div>

        {/* Color indicator */}
        <div
          className="w-2 h-full min-h-[40px] rounded-full flex-shrink-0 opacity-60"
          style={{ backgroundColor: event.color }}
        />
      </div>
    </div>
  );
}

export default function UpcomingPlans({ 
  groupedEvents, 
  onEventClick, 
  onToggleComplete 
}: UpcomingPlansProps) {
  const totalEvents = 
    groupedEvents.today.length + 
    groupedEvents.tomorrow.length + 
    groupedEvents.thisWeek.length + 
    groupedEvents.later.length;

  if (totalEvents === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-violet-500/5 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-white/40 text-sm mb-1">No upcoming events</p>
        <p className="text-white/20 text-xs">Click on a day to add one!</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <EventGroup
        title="Today"
        events={groupedEvents.today}
        icon={<svg className="w-3.5 h-3.5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8"/></svg>}
        accentColor="bg-gradient-to-br from-cyan-500/20 to-cyan-500/5"
        onEventClick={onEventClick}
        onToggleComplete={onToggleComplete}
      />
      
      <EventGroup
        title="Tomorrow"
        events={groupedEvents.tomorrow}
        icon={<svg className="w-3.5 h-3.5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" /></svg>}
        accentColor="bg-gradient-to-br from-violet-500/20 to-violet-500/5"
        onEventClick={onEventClick}
        onToggleComplete={onToggleComplete}
      />
      
      <EventGroup
        title="This Week"
        events={groupedEvents.thisWeek}
        icon={<svg className="w-3.5 h-3.5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
        accentColor="bg-gradient-to-br from-orange-500/20 to-orange-500/5"
        onEventClick={onEventClick}
        onToggleComplete={onToggleComplete}
      />
      
      <EventGroup
        title="Later"
        events={groupedEvents.later.slice(0, 5)}
        icon={<svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
        accentColor="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5"
        onEventClick={onEventClick}
        onToggleComplete={onToggleComplete}
      />
      
      {groupedEvents.later.length > 5 && (
        <div className="text-xs text-white/30 text-center py-2">
          +{groupedEvents.later.length - 5} more events later
        </div>
      )}
    </div>
  );
}
