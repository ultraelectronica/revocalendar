import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { CalendarEvent, EventCategory, EventPriority } from '@/types';
import { loadEvents, saveEvents } from '@/utils/storageUtils';
import { parseDateString, getDaysUntil } from '@/utils/dateUtils';
import { createClient, DbEvent } from '@/lib/supabase';

// Fields to encrypt in events
const ENCRYPTED_EVENT_FIELDS: (keyof CalendarEvent)[] = ['title', 'description'];

// Map database event to local CalendarEvent type
function mapDbEventToLocal(dbEvent: DbEvent): CalendarEvent {
  return {
    id: dbEvent.id,
    date: dbEvent.date,
    title: dbEvent.title,
    time: dbEvent.time,
    endTime: dbEvent.end_time,
    description: dbEvent.description,
    color: dbEvent.color,
    category: dbEvent.category as EventCategory,
    isRecurring: dbEvent.is_recurring,
    recurrencePattern: dbEvent.recurrence_pattern as CalendarEvent['recurrencePattern'],
    priority: dbEvent.priority as EventPriority,
    completed: dbEvent.completed,
    reminder: dbEvent.reminder as CalendarEvent['reminder'],
  };
}

// Map local CalendarEvent to database format
function mapLocalEventToDb(event: Omit<CalendarEvent, 'id'>, userId: string): Omit<DbEvent, 'id' | 'created_at' | 'updated_at'> {
  return {
    user_id: userId,
    date: event.date,
    title: event.title,
    time: event.time,
    end_time: event.endTime,
    description: event.description,
    color: event.color,
    category: event.category,
    is_recurring: event.isRecurring,
    recurrence_pattern: event.recurrencePattern,
    priority: event.priority,
    completed: event.completed,
    reminder: event.reminder,
  };
}

interface EncryptionHelpers {
  encrypt: (value: string) => Promise<string>;
  decrypt: (value: string) => Promise<string>;
  encryptFields: <T extends object>(obj: T, fields: (keyof T)[]) => Promise<T>;
  decryptFields: <T extends object>(obj: T, fields: (keyof T)[]) => Promise<T>;
  isUnlocked: boolean;
}

interface UseEventsOptions {
  userId?: string | null;
  encryption?: EncryptionHelpers | null;
}

export function useEvents(options: UseEventsOptions = {}) {
  const { userId, encryption } = options;
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const supabaseRef = useRef(createClient());
  const hasMigratedRef = useRef(false);

  // Use ref for encryption to avoid dependency changes triggering refetch
  const encryptionRef = useRef(encryption);
  encryptionRef.current = encryption;

  // Encrypt event sensitive fields (using stable ref)
  const encryptEvent = useCallback(async (event: CalendarEvent): Promise<CalendarEvent> => {
    const enc = encryptionRef.current;
    if (!enc?.isUnlocked) return event;
    return enc.encryptFields(event, ENCRYPTED_EVENT_FIELDS);
  }, []);

  // Decrypt event sensitive fields (using stable ref)
  const decryptEvent = useCallback(async (event: CalendarEvent): Promise<CalendarEvent> => {
    const enc = encryptionRef.current;
    if (!enc?.isUnlocked) return event;
    return enc.decryptFields(event, ENCRYPTED_EVENT_FIELDS);
  }, []);

  // Decrypt multiple events (using stable ref)
  const decryptEvents = useCallback(async (events: CalendarEvent[]): Promise<CalendarEvent[]> => {
    const enc = encryptionRef.current;
    if (!enc?.isUnlocked) return events;
    return Promise.all(events.map(e => enc.decryptFields(e, ENCRYPTED_EVENT_FIELDS)));
  }, []);

  // Migrate localStorage data to Supabase (one-time)
  const migrateLocalToSupabase = useCallback(async (uid: string) => {
    if (hasMigratedRef.current) return;
    
    const supabase = supabaseRef.current;
    
    // Check if user already has events in Supabase
    const { count } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', uid);

    if (count && count > 0) {
      hasMigratedRef.current = true;
      return;
    }

    // Load from localStorage
    const localEvents = loadEvents();
    
    if (localEvents.length > 0) {
      // Encrypt events before migrating
      const encryptedEvents = await Promise.all(
        localEvents.map(async (e) => {
          const encrypted = await encryptEvent(e);
          return {
            ...mapLocalEventToDb(encrypted, uid),
            id: e.id,
          };
        })
      );
      
      await supabase.from('events').insert(encryptedEvents);
      console.log(`Migrated ${localEvents.length} events to Supabase`);
    }
    
    hasMigratedRef.current = true;
  }, [encryptEvent]);

  // Fetch events from Supabase or localStorage
  // Only refetch when userId changes, not when encryption changes
  useEffect(() => {
    const supabase = supabaseRef.current;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let isMounted = true;

    const fetchEvents = async () => {
      if (!isMounted) return;
      setLoading(true);

      if (userId) {
        // Migrate localStorage data if needed
        await migrateLocalToSupabase(userId);

        // Fetch from Supabase
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: true });

        if (!error && data && isMounted) {
          const mappedEvents = data.map(mapDbEventToLocal);
          const decryptedEvents = await decryptEvents(mappedEvents);
          if (isMounted) {
            setEvents(decryptedEvents);
          }
        }

        // Set up real-time subscription
        channel = supabase
          .channel(`events-${userId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'events',
              filter: `user_id=eq.${userId}`,
            },
            async (payload) => {
              if (!isMounted) return;
              if (payload.eventType === 'INSERT') {
                const mapped = mapDbEventToLocal(payload.new as DbEvent);
                const decrypted = await decryptEvent(mapped);
                if (isMounted) {
                  setEvents(prev => [...prev, decrypted]);
                }
              } else if (payload.eventType === 'UPDATE') {
                const mapped = mapDbEventToLocal(payload.new as DbEvent);
                const decrypted = await decryptEvent(mapped);
                if (isMounted) {
                  setEvents(prev =>
                    prev.map(e => e.id === decrypted.id ? decrypted : e)
                  );
                }
              } else if (payload.eventType === 'DELETE') {
                if (isMounted) {
                  setEvents(prev => prev.filter(e => e.id !== (payload.old as DbEvent).id));
                }
              }
            }
          )
          .subscribe();
      } else {
        // Fallback to localStorage for unauthenticated users
        if (isMounted) {
          setEvents(loadEvents());
        }
      }

      if (isMounted) {
        setLoading(false);
      }
    };

    fetchEvents();

    return () => {
      isMounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [userId, migrateLocalToSupabase, decryptEvents, decryptEvent]);

  const addEvent = useCallback(async (event: CalendarEvent) => {
    const supabase = supabaseRef.current;

    if (userId) {
      setSyncing(true);
      
      // Encrypt before saving
      const encryptedEvent = await encryptEvent(event);
      
      const { data, error } = await supabase
        .from('events')
        .insert({
          ...mapLocalEventToDb(encryptedEvent, userId),
          id: event.id,
        })
        .select()
        .single();

      if (!error && data) {
        // Add the original (unencrypted) event to local state
        setEvents(prev => [...prev, event]);
      }
      setSyncing(false);
    } else {
      // localStorage fallback
    setEvents(prev => {
      const newEvents = [...prev, event];
      saveEvents(newEvents);
      return newEvents;
    });
    }
  }, [userId, encryptEvent]);

  const updateEvent = useCallback(async (eventId: string, updatedEvent: CalendarEvent) => {
    const supabase = supabaseRef.current;

    if (userId) {
      setSyncing(true);
      
      // Encrypt before saving
      const encryptedEvent = await encryptEvent(updatedEvent);
      
      const { error } = await supabase
        .from('events')
        .update({
          date: encryptedEvent.date,
          title: encryptedEvent.title,
          time: encryptedEvent.time,
          end_time: encryptedEvent.endTime,
          description: encryptedEvent.description,
          color: encryptedEvent.color,
          category: encryptedEvent.category,
          is_recurring: encryptedEvent.isRecurring,
          recurrence_pattern: encryptedEvent.recurrencePattern,
          priority: encryptedEvent.priority,
          completed: encryptedEvent.completed,
          reminder: encryptedEvent.reminder,
          updated_at: new Date().toISOString(),
        })
        .eq('id', eventId)
        .eq('user_id', userId);

      if (!error) {
        // Update with original (unencrypted) event
        setEvents(prev => prev.map(e => e.id === eventId ? updatedEvent : e));
      }
      setSyncing(false);
    } else {
    setEvents(prev => {
      const newEvents = prev.map(e => e.id === eventId ? updatedEvent : e);
    saveEvents(newEvents);
      return newEvents;
    });
    }
  }, [userId, encryptEvent]);

  const deleteEvent = useCallback(async (eventId: string) => {
    const supabase = supabaseRef.current;

    if (userId) {
      setSyncing(true);
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)
        .eq('user_id', userId);

      if (!error) {
        // Optimistic update
        setEvents(prev => prev.filter(e => e.id !== eventId));
      }
      setSyncing(false);
    } else {
    setEvents(prev => {
      const newEvents = prev.filter(e => e.id !== eventId);
    saveEvents(newEvents);
      return newEvents;
    });
    }
  }, [userId]);

  const toggleEventCompletion = useCallback(async (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    const updatedEvent = { ...event, completed: !event.completed };
    await updateEvent(eventId, updatedEvent);
  }, [events, updateEvent]);

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
  const duplicateEvent = useCallback(async (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      const newEvent: CalendarEvent = {
        ...event,
        id: crypto.randomUUID(),
        title: `${event.title} (copy)`,
        completed: false,
      };
      await addEvent(newEvent);
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
    loading,
    syncing,
  };
}
