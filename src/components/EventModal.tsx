import { useState, useEffect } from 'react';
import { CalendarEvent, EVENT_COLORS, EventColor } from '../types';
import { generateEventId } from '../utils/dateUtils';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
  selectedDate: string | null;
  editingEvent: CalendarEvent | null;
}

export default function EventModal({
  isOpen,
  onClose,
  onSave,
  selectedDate,
  editingEvent,
}: EventModalProps) {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState<EventColor>('#3b82f6');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title);
      setTime(editingEvent.time || '');
      setDescription(editingEvent.description || '');
      setSelectedColor(editingEvent.color as EventColor);
    } else {
      setTitle('');
      setTime('');
      setDescription('');
      setSelectedColor('#3b82f6');
    }
    setError(false);
  }, [editingEvent, isOpen]);

  if (!isOpen || !selectedDate) return null;

  const handleSave = () => {
    if (!title.trim()) {
      setError(true);
      return;
    }

    const event: CalendarEvent = {
      id: editingEvent?.id || generateEventId(),
      date: selectedDate,
      title: title.trim(),
      time: time || null,
      description: description.trim() || null,
      color: selectedColor,
    };

    onSave(event);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
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
            {editingEvent ? 'Edit Event' : 'New Event'}
          </h2>
          <button
            onClick={onClose}
            className="bg-transparent border-none text-white text-3xl leading-none p-0 w-8 h-8 flex items-center justify-center cursor-pointer rounded-full transition-all duration-300 hover:bg-white/10 hover:rotate-90"
          >
            ×
          </button>
        </div>
        <div className="p-6">
          <div className="mb-5">
            <label className="block mb-2 font-medium text-sm text-white/90">
              Event Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError(false);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Enter event title"
              className={`
                w-full p-3 rounded-lg outline-none border bg-white/10 text-white font-sans text-sm
                transition-all duration-300 placeholder:text-white/50
                ${error 
                  ? 'border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.2)]' 
                  : 'border-white/20 focus:border-blue-500/60 focus:bg-white/15 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)]'
                }
              `}
            />
          </div>
          <div className="mb-5">
            <label className="block mb-2 font-medium text-sm text-white/90">
              Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full p-3 rounded-lg outline-none border border-white/20 bg-white/10 text-white font-sans text-sm transition-all duration-300 focus:border-blue-500/60 focus:bg-white/15 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)]"
            />
          </div>
          <div className="mb-5">
            <label className="block mb-2 font-medium text-sm text-white/90">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add event description (optional)"
              rows={3}
              className="w-full p-3 rounded-lg outline-none border border-white/20 bg-white/10 text-white font-sans text-sm transition-all duration-300 resize-y min-h-[80px] placeholder:text-white/50 focus:border-blue-500/60 focus:bg-white/15 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)]"
            />
          </div>
          <div className="mb-5">
            <label className="block mb-2 font-medium text-sm text-white/90">
              Color
            </label>
            <div className="flex gap-3 flex-wrap">
              {EVENT_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`
                    w-10 h-10 rounded-full cursor-pointer transition-all duration-300 shadow-md
                    ${selectedColor === color
                      ? 'border-4 border-white scale-110 shadow-[0_0_0_3px_rgba(255,255,255,0.3),0_4px_12px_rgba(0,0,0,0.4)]'
                      : 'border-4 border-transparent hover:scale-110 hover:shadow-lg'
                    }
                  `}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3 justify-end mt-6 pt-5 border-t border-white/10">
            <button
              onClick={handleSave}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 font-semibold rounded-lg shadow-lg shadow-blue-500/40 transition-all duration-300 hover:from-blue-600 hover:to-blue-700 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/50"
            >
              Save
            </button>
            <button
              onClick={onClose}
              className="bg-white/10 text-white px-6 py-3 rounded-lg border border-white/20 transition-all duration-300 hover:bg-white/20 hover:-translate-y-0.5"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

