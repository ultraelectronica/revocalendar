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
      <div className="min-h-[70px] p-1 opacity-30" />
    );
  }

  const eventsToShow = events.slice(0, 2);
  const moreCount = events.length - 2;

  return (
    <div
      onClick={onClick}
      className={`
        min-h-[70px] p-1.5 rounded-lg cursor-pointer
        flex flex-col transition-all duration-300
        ${isToday 
          ? 'bg-blue-500/30 border-2 border-blue-500/60 shadow-lg shadow-blue-500/40' 
          : 'bg-white/5 border border-white/10 hover:bg-white/15 hover:-translate-y-0.5 hover:shadow-lg'
        }
      `}
    >
      <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-blue-200 font-bold' : 'text-white'}`}>
        {day}
      </div>
      <div className="flex-1 flex flex-col gap-0.5 mt-0.5 overflow-hidden">
        {eventsToShow.map(event => (
          <div
            key={event.id}
            className="text-[10px] px-1 py-0.5 rounded text-white overflow-hidden text-ellipsis whitespace-nowrap font-medium opacity-95 shadow-sm"
            style={{ backgroundColor: event.color }}
          >
            {event.title}
          </div>
        ))}
        {moreCount > 0 && (
          <div className="text-[9px] px-1 py-0.5 text-white/80 italic opacity-80">
            +{moreCount}
          </div>
        )}
      </div>
    </div>
  );
}

