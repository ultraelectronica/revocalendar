import { CalendarEvent } from '@/types';
import { formatDateDisplay } from '@/utils/dateUtils';

interface UpcomingPlansProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

export default function UpcomingPlans({ events, onEventClick }: UpcomingPlansProps) {
  // Get upcoming events sorted by date
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingEvents = events
    .filter(event => {
      const [month, day, year] = event.date.split('/').map(Number);
      const eventDate = new Date(year, month - 1, day);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate >= today;
    })
    .sort((a, b) => {
      const [monthA, dayA, yearA] = a.date.split('/').map(Number);
      const [monthB, dayB, yearB] = b.date.split('/').map(Number);
      const dateA = new Date(yearA, monthA - 1, dayA);
      const dateB = new Date(yearB, monthB - 1, dayB);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 10); // Show up to 10 upcoming events

  if (upcomingEvents.length === 0) {
    return (
      <div className="text-white/60 text-sm text-center py-8">
        No upcoming events
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {upcomingEvents.map(event => {
        const [month, day, year] = event.date.split('/').map(Number);
        const eventDate = new Date(year, month - 1, day);
        const isToday = eventDate.getTime() === today.getTime();

        return (
          <div
            key={event.id}
            onClick={() => onEventClick(event)}
            className={`
              p-3 rounded-lg cursor-pointer transition-all duration-300
              border border-white/10 hover:bg-white/10 hover:border-white/20
              ${isToday ? 'bg-blue-500/20 border-blue-500/40' : 'bg-white/5'}
            `}
          >
            <div className="flex items-start gap-2">
              <div
                className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                style={{ backgroundColor: event.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium text-sm truncate">
                  {event.title}
                </div>
                <div className="text-white/60 text-xs mt-1">
                  {formatDateDisplay(eventDate)}
                  {event.time && ` • ${event.time}`}
                </div>
                {event.description && (
                  <div className="text-white/50 text-xs mt-1 line-clamp-2">
                    {event.description}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

