import { useState, useEffect } from 'react';
import { CalendarEvent } from '@/types';
import { loadEvents, saveEvents } from '@/utils/storageUtils';

export function useEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    setEvents(loadEvents());
  }, []);

  const addEvent = (event: CalendarEvent) => {
    const newEvents = [...events, event];
    setEvents(newEvents);
    saveEvents(newEvents);
  };

  const updateEvent = (eventId: string, updatedEvent: CalendarEvent) => {
    const newEvents = events.map(e => e.id === eventId ? updatedEvent : e);
    setEvents(newEvents);
    saveEvents(newEvents);
  };

  const deleteEvent = (eventId: string) => {
    const newEvents = events.filter(e => e.id !== eventId);
    setEvents(newEvents);
    saveEvents(newEvents);
  };

  const getEventsForDate = (date: string): CalendarEvent[] => {
    return events.filter(e => e.date === date);
  };

  return {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventsForDate,
  };
}

