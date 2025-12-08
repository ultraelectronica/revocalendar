'use client';

import { useState } from 'react';
import { CalendarEvent, CATEGORY_CONFIG, PRIORITY_CONFIG } from '@/types';
import { formatDateDisplay, parseDateString, formatTime } from '@/utils/dateUtils';

interface EventListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEvent: () => void;
  onEditEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (eventId: string) => void;
  onToggleComplete: (eventId: string) => void;
  selectedDate: string | null;
  events: CalendarEvent[];
}

export default function EventListModal({
  isOpen,
  onClose,
  onAddEvent,
  onEditEvent,
  onDeleteEvent,
  onToggleComplete,
  selectedDate,
  events,
}: EventListModalProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  if (!isOpen || !selectedDate) return null;

  const dateObj = parseDateString(selectedDate);
  const formattedDate = formatDateDisplay(dateObj);

  const handleDelete = (eventId: string) => {
    if (deleteConfirm === eventId) {
      onDeleteEvent(eventId);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(eventId);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  // Sort events: incomplete first, then by time, then by priority
  const sortedEvents = [...events].sort((a, b) => {
    // Completed events go to bottom
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    // Then sort by time
    if (a.time && b.time) return a.time.localeCompare(b.time);
    if (a.time) return -1;
    if (b.time) return 1;
    // Then by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[95%] max-w-[520px] max-h-[85vh] overflow-hidden scale-in">
        <div className="bg-slate-900/95 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="relative px-6 py-5 border-b border-white/10">
            {/* Gradient accent */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-cyan-500 to-emerald-500" />
            
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">
                  Events
                </h2>
                <p className="text-sm text-white/50">{formattedDate}</p>
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
          <div className="px-6 py-4 max-h-[50vh] overflow-y-auto">
            {sortedEvents.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <p className="text-white/40 mb-1">No events for this day</p>
                <p className="text-white/20 text-sm">Click the button below to add one</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedEvents.map((event, index) => (
                  <div
                    key={event.id}
                    style={{ animationDelay: `${index * 50}ms` }}
                    className={`
                      glass-card p-4 transition-all duration-300 fade-in group
                      ${event.completed ? 'opacity-60' : ''}
                      ${event.priority === 'high' && !event.completed ? 'border-l-4 border-l-orange-500' : ''}
                    `}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <button
                        onClick={() => onToggleComplete(event.id)}
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
                      <div className="flex-1 min-w-0">
                        {/* Title & Category */}
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-lg">{CATEGORY_CONFIG[event.category].icon}</span>
                          <h3 className={`
                            font-semibold text-white truncate
                            ${event.completed ? 'line-through text-white/50' : ''}
                          `}>
                            {event.title}
                          </h3>
                        </div>

                        {/* Meta */}
                        <div className="flex items-center gap-2 text-xs text-white/50 mb-2">
                          {event.time && (
                            <span className="font-mono bg-white/5 px-2 py-0.5 rounded">
                              {formatTime(event.time)}
                              {event.endTime && ` - ${formatTime(event.endTime)}`}
                            </span>
                          )}
                          <span 
                            className="px-2 py-0.5 rounded text-[10px] font-medium"
                            style={{ 
                              backgroundColor: PRIORITY_CONFIG[event.priority].color + '20',
                              color: PRIORITY_CONFIG[event.priority].color 
                            }}
                          >
                            {PRIORITY_CONFIG[event.priority].label}
                          </span>
                        </div>

                        {/* Description */}
                        {event.description && (
                          <p className="text-sm text-white/40 leading-relaxed">
                            {event.description}
                          </p>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onEditEvent(event)}
                            className="px-3 py-1.5 text-xs rounded-lg font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-all hover:bg-cyan-500/30"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(event.id)}
                            className={`
                              px-3 py-1.5 text-xs rounded-lg font-medium transition-all
                              ${deleteConfirm === event.id
                                ? 'bg-red-500 text-white'
                                : 'bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30'
                              }
                            `}
                          >
                            {deleteConfirm === event.id ? 'Confirm?' : 'Delete'}
                          </button>
                        </div>
                      </div>

                      {/* Color indicator */}
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0 shadow-lg"
                        style={{ 
                          backgroundColor: event.color,
                          boxShadow: `0 0 10px ${event.color}40`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-white/10 flex gap-3 justify-between bg-white/[0.02]">
            <div className="text-xs text-white/30">
              {events.length} event{events.length !== 1 ? 's' : ''} • 
              {events.filter(e => e.completed).length} completed
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="btn-secondary">
                Close
              </button>
              <button onClick={onAddEvent} className="btn-primary">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Event
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
