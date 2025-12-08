import { CalendarEvent } from '@/types';
import { formatDateDisplay } from '@/utils/dateUtils';

interface EventListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEvent: () => void;
  onEditEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (eventId: string) => void;
  selectedDate: string | null;
  events: CalendarEvent[];
}

export default function EventListModal({
  isOpen,
  onClose,
  onAddEvent,
  onEditEvent,
  onDeleteEvent,
  selectedDate,
  events,
}: EventListModalProps) {
  if (!isOpen || !selectedDate) return null;

  const dateObj = new Date(selectedDate);
  const formattedDate = formatDateDisplay(dateObj);

  const handleDelete = (eventId: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      onDeleteEvent(eventId);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-10"
        onClick={onClose}
      />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-[#14141e]/95 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl w-[90%] max-w-[500px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-5 border-b border-white/10">
          <h2 className="text-2xl font-semibold text-white m-0">
            Events - {formattedDate}
          </h2>
          <button
            onClick={onClose}
            className="bg-transparent border-none text-white text-3xl leading-none p-0 w-8 h-8 flex items-center justify-center cursor-pointer rounded-full transition-all duration-300 hover:bg-white/10 hover:rotate-90"
          >
            ×
          </button>
        </div>
        <div className="p-6">
          <div className="max-h-[400px] overflow-y-auto mb-5">
            {events.length === 0 ? (
              <p className="text-center text-white/60 py-10 px-5 italic">
                No events for this day. Click "Add Event" to create one.
              </p>
            ) : (
              <div className="space-y-3">
                {events.map(event => (
                  <div
                    key={event.id}
                    className="bg-white/5 border border-white/10 rounded-xl p-4 transition-all duration-300 hover:bg-white/10 hover:translate-x-1"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0 shadow-md"
                        style={{ backgroundColor: event.color }}
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-base mb-1 text-white">
                          {event.title}
                        </div>
                        {event.time && (
                          <div className="text-sm text-white/70">
                            {event.time}
                          </div>
                        )}
                      </div>
                    </div>
                    {event.description && (
                      <div className="text-sm text-white/80 my-2 leading-relaxed">
                        {event.description}
                      </div>
                    )}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => onEditEvent(event)}
                        className="px-4 py-2 text-sm rounded-md font-medium bg-blue-500/30 text-white border border-blue-500/50 transition-all duration-300 hover:bg-blue-500/50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="px-4 py-2 text-sm rounded-md font-medium bg-red-500/30 text-white border border-red-500/50 transition-all duration-300 hover:bg-red-500/50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-3 justify-end pt-5 border-t border-white/10">
            <button
              onClick={onAddEvent}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 font-semibold rounded-lg shadow-lg shadow-blue-500/40 transition-all duration-300 hover:from-blue-600 hover:to-blue-700 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/50"
            >
              Add Event
            </button>
            <button
              onClick={onClose}
              className="bg-white/10 text-white px-6 py-3 rounded-lg border border-white/20 transition-all duration-300 hover:bg-white/20 hover:-translate-y-0.5"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

