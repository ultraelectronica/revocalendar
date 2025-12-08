import { useState, useEffect, useCallback, useMemo } from 'react';
import { CalendarEvent, EventCategory, EventPriority } from '@/types';
import { loadEvents, saveEvents } from '@/utils/storageUtils';
import { parseDateString, getDaysUntil } from '@/utils/dateUtils';

export function useEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setEvents(loadEvents());
  }, []);

  const addEvent = useCallback((event: CalendarEvent) => {
    setEvents(prev => {
      const newEvents = [...prev, event];
      saveEvents(newEvents);
      return newEvents;
    });
  }, []);

  const updateEvent = useCallback((eventId: string, updatedEvent: CalendarEvent) => {
    setEvents(prev => {
      const newEvents = prev.map(e => e.id === eventId ? updatedEvent : e);
    saveEvents(newEvents);
      return newEvents;
    });
  }, []);

  const deleteEvent = useCallback((eventId: string) => {
    setEvents(prev => {
      const newEvents = prev.filter(e => e.id !== eventId);
    saveEvents(newEvents);
      return newEvents;
    });
  }, []);

  const toggleEventCompletion = useCallback((eventId: string) => {
    setEvents(prev => {
      const newEvents = prev.map(e => 
        e.id === eventId ? { ...e, completed: !e.completed } : e
      );
    saveEvents(newEvents);
      return newEvents;
    });
  }, []);

  const getEventsForDate = useCallback((date: string): CalendarEvent[] => {
    return events.filter(e => e.date === date);
  }, [events]);

  const getEventsForDateRange = useCallback((startDate: string, endDate: string): CalendarEvent[] => {
    const start = parseDateString(startDate);
    const end = parseDateString(endDate);
    
    return events.filter(e => {
      const eventDate = parseDateString(e.date);
      return eventDate >= start && eventDate <= end;
    });
  }, [events]);

  // Search functionality
  const searchEvents = useCallback((query: string): CalendarEvent[] => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return events.filter(e => 
      e.title.toLowerCase().includes(lowerQuery) ||
      (e.description && e.description.toLowerCase().includes(lowerQuery))
    );
  }, [events]);

  // Filtered events based on search
  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return events;
    return searchEvents(searchQuery);
  }, [events, searchQuery, searchEvents]);

  // Upcoming events (sorted by date, upcoming only)
  const upcomingEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return events
      .filter(event => {
        const eventDate = parseDateString(event.date);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate >= today;
      })
      .sort((a, b) => {
        const dateA = parseDateString(a.date);
        const dateB = parseDateString(b.date);
        if (dateA.getTime() !== dateB.getTime()) {
          return dateA.getTime() - dateB.getTime();
        }
        // Secondary sort by time if dates are equal
        if (a.time && b.time) {
          return a.time.localeCompare(b.time);
        }
        return a.time ? -1 : 1;
      });
  }, [events]);

  // Grouped upcoming events (Today, Tomorrow, This Week, Later)
  const groupedUpcomingEvents = useMemo(() => {
    const groups: {
      today: CalendarEvent[];
      tomorrow: CalendarEvent[];
      thisWeek: CalendarEvent[];
      later: CalendarEvent[];
    } = {
      today: [],
      tomorrow: [],
      thisWeek: [],
      later: [],
    };

    upcomingEvents.forEach(event => {
      const daysUntil = getDaysUntil(event.date);
      
      if (daysUntil === 0) {
        groups.today.push(event);
      } else if (daysUntil === 1) {
        groups.tomorrow.push(event);
      } else if (daysUntil <= 7) {
        groups.thisWeek.push(event);
      } else {
        groups.later.push(event);
      }
    });

    return groups;
  }, [upcomingEvents]);

  // Events by category
  const eventsByCategory = useMemo(() => {
    const categories: Record<EventCategory, CalendarEvent[]> = {
      work: [],
      personal: [],
      health: [],
      social: [],
      travel: [],
      finance: [],
      education: [],
      other: [],
    };

    events.forEach(event => {
      categories[event.category].push(event);
    });

    return categories;
  }, [events]);

  // Events by priority
  const eventsByPriority = useMemo(() => {
    const priorities: Record<EventPriority, CalendarEvent[]> = {
      high: [],
      medium: [],
      low: [],
    };

    events.forEach(event => {
      priorities[event.priority].push(event);
    });

    return priorities;
  }, [events]);

  // Statistics
  const stats = useMemo(() => {
    const total = events.length;
    const completed = events.filter(e => e.completed).length;
    const upcoming = upcomingEvents.length;
    const todayCount = groupedUpcomingEvents.today.length;
    const overdue = events.filter(e => {
      const daysUntil = getDaysUntil(e.date);
      return daysUntil < 0 && !e.completed;
    }).length;

    return {
      total,
      completed,
      upcoming,
      todayCount,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [events, upcomingEvents, groupedUpcomingEvents]);

  // Duplicate event
  const duplicateEvent = useCallback((eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      const newEvent: CalendarEvent = {
        ...event,
        id: Date.now().toString(36) + Math.random().toString(36).substring(2),
        title: `${event.title} (copy)`,
        completed: false,
      };
      addEvent(newEvent);
      return newEvent;
    }
    return null;
  }, [events, addEvent]);

  return {
    events,
    filteredEvents,
    upcomingEvents,
    groupedUpcomingEvents,
    eventsByCategory,
    eventsByPriority,
    stats,
    searchQuery,
    setSearchQuery,
    addEvent,
    updateEvent,
    deleteEvent,
    toggleEventCompletion,
    duplicateEvent,
    getEventsForDate,
    getEventsForDateRange,
    searchEvents,
  };
}
