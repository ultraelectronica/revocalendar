'use client';

import { useState, useEffect } from 'react';
import { 
  CalendarEvent, 
  EVENT_COLORS, 
  EventColor, 
  EventCategory, 
  EventPriority,
  CATEGORY_CONFIG,
  PRIORITY_CONFIG 
} from '@/types';
import { generateEventId, formatDateDisplay, parseDateString } from '@/utils/dateUtils';

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
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState<EventColor>('#06b6d4');
  const [category, setCategory] = useState<EventCategory>('other');
  const [priority, setPriority] = useState<EventPriority>('medium');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title);
      setTime(editingEvent.time || '');
      setEndTime(editingEvent.endTime || '');
      setDescription(editingEvent.description || '');
      setSelectedColor(editingEvent.color as EventColor);
      setCategory(editingEvent.category);
      setPriority(editingEvent.priority);
    } else {
      setTitle('');
      setTime('');
      setEndTime('');
      setDescription('');
      setSelectedColor('#06b6d4');
      setCategory('other');
      setPriority('medium');
    }
    setError(false);
  }, [editingEvent, isOpen]);

  if (!isOpen || !selectedDate) return null;

  const dateObj = parseDateString(selectedDate);
  const formattedDate = formatDateDisplay(dateObj);

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
      endTime: endTime || null,
      description: description.trim() || null,
      color: selectedColor,
      category,
      isRecurring: false,
      recurrencePattern: null,
      priority,
      completed: editingEvent?.completed || false,
      reminder: null,
    };

    onSave(event);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && e.target instanceof HTMLInputElement) {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 sm:w-[95%] sm:max-w-[520px] sm:max-h-[90vh] overflow-hidden scale-in flex flex-col">
        <div className="bg-slate-900/95 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex-1 flex flex-col max-h-full">
          {/* Header */}
          <div className="relative px-4 sm:px-6 py-4 sm:py-5 border-b border-white/10 flex-shrink-0">
            {/* Gradient accent */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 via-violet-500 to-orange-500" />
            
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white mb-1">
                  {editingEvent ? 'Edit Event' : 'New Event'}
                </h2>
                <p className="text-xs sm:text-sm text-white/50">{formattedDate}</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all hover:rotate-90 duration-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 sm:px-6 py-4 sm:py-5 overflow-y-auto flex-1 space-y-4 sm:space-y-5">
            {/* Title */}
            <div>
              <label className="block mb-1.5 sm:mb-2 text-xs sm:text-sm font-medium text-white/70">
                Event Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setError(false);
                }}
                onKeyDown={handleKeyDown}
                placeholder="What's happening?"
                autoFocus
                className={`input-field text-sm sm:text-base ${error ? 'border-red-500 ring-2 ring-red-500/20' : ''}`}
              />
              {error && (
                <p className="mt-1 text-xs text-red-400">Please enter a title</p>
              )}
            </div>

            {/* Time Row */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block mb-1.5 sm:mb-2 text-xs sm:text-sm font-medium text-white/70">
                  Start Time
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="input-field font-mono text-sm"
                />
              </div>
              <div>
                <label className="block mb-1.5 sm:mb-2 text-xs sm:text-sm font-medium text-white/70">
                  End Time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="input-field font-mono text-sm"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block mb-1.5 sm:mb-2 text-xs sm:text-sm font-medium text-white/70">
                Category
              </label>
              <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                {(Object.keys(CATEGORY_CONFIG) as EventCategory[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`
                      p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-medium transition-all duration-200
                      flex flex-col items-center gap-0.5 sm:gap-1
                      ${category === cat 
                        ? 'bg-white/15 border-2 border-cyan-500/50 scale-105' 
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }
                    `}
                  >
                    <span className="text-sm sm:text-lg">{CATEGORY_CONFIG[cat].icon}</span>
                    <span className="text-white/70 hidden xs:inline">{CATEGORY_CONFIG[cat].label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block mb-1.5 sm:mb-2 text-xs sm:text-sm font-medium text-white/70">
                Priority
              </label>
              <div className="flex gap-2">
                {(Object.keys(PRIORITY_CONFIG) as EventPriority[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`
                      flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-200
                      ${priority === p 
                        ? 'scale-105' 
                        : 'bg-white/5 border border-white/10 hover:bg-white/10 text-white/70'
                      }
                    `}
                    style={priority === p ? {
                      backgroundColor: PRIORITY_CONFIG[p].color + '30',
                      borderColor: PRIORITY_CONFIG[p].color + '50',
                      color: PRIORITY_CONFIG[p].color,
                      borderWidth: '2px',
                    } : {}}
                  >
                    {PRIORITY_CONFIG[p].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block mb-1.5 sm:mb-2 text-xs sm:text-sm font-medium text-white/70">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details..."
                rows={3}
                className="input-field resize-y min-h-[70px] sm:min-h-[80px] text-sm"
              />
            </div>

            {/* Color */}
            <div>
              <label className="block mb-1.5 sm:mb-2 text-xs sm:text-sm font-medium text-white/70">
                Color
              </label>
              <div className="flex gap-2 sm:gap-3 flex-wrap">
                {EVENT_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`
                      w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl cursor-pointer transition-all duration-300
                      ${selectedColor === color
                        ? 'scale-125 ring-2 ring-white/50 ring-offset-2 ring-offset-slate-900'
                        : 'hover:scale-110'
                      }
                    `}
                    style={{ 
                      backgroundColor: color,
                      boxShadow: selectedColor === color ? `0 0 20px ${color}60` : 'none'
                    }}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-white/10 flex gap-2 sm:gap-3 justify-end bg-white/[0.02] flex-shrink-0">
            <button onClick={onClose} className="btn-secondary text-xs sm:text-sm px-3 sm:px-5 py-2 sm:py-2.5">
              Cancel
            </button>
            <button onClick={handleSave} className="btn-primary text-xs sm:text-sm px-3 sm:px-5 py-2 sm:py-2.5">
              {editingEvent ? 'Save Changes' : 'Create Event'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
