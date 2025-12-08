import { CalendarEvent } from '@/types';

interface CalendarDayProps {
  day: number | null;
  date: string | null;
  isToday: boolean;
  events: CalendarEvent[];
  onClick: () => void;
}

export default function CalendarDay({ day, date, isToday, events, onClick }: CalendarDayProps) {
  if (day === null) {
    return (
      <div className="min-h-[120px] p-2 opacity-30" />
    );
  }

  const eventsToShow = events.slice(0, 3);
  const moreCount = events.length - 3;

  return (
    <div
      onClick={onClick}
      className={`
        min-h-[120px] p-2 rounded-xl cursor-pointer
        flex flex-col transition-all duration-300
        ${isToday 
          ? 'bg-blue-500/30 border-2 border-blue-500/60 shadow-lg shadow-blue-500/40' 
          : 'bg-white/5 border border-white/10 hover:bg-white/15 hover:-translate-y-0.5 hover:shadow-lg'
        }
      `}
    >
      <div className={`text-base font-semibold mb-1.5 ${isToday ? 'text-blue-200 font-bold' : 'text-white'}`}>
        {day}
      </div>
      <div className="flex-1 flex flex-col gap-1 mt-1 overflow-hidden">
        {eventsToShow.map(event => (
          <div
            key={event.id}
            className="text-xs px-1.5 py-1 rounded-md text-white overflow-hidden text-ellipsis whitespace-nowrap font-medium opacity-95 shadow-md"
            style={{ backgroundColor: event.color }}
          >
            {event.title}
          </div>
        ))}
        {moreCount > 0 && (
          <div className="text-[10px] px-1.5 py-1 text-white/80 italic opacity-80">
            +{moreCount} more
          </div>
        )}
      </div>
    </div>
  );
}

