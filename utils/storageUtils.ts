import { CalendarEvent, Note, AppSettings } from '../types';

const EVENTS_KEY = 'calendar_events_v2';
const NOTES_KEY = 'calendar_notes_v2';
const SETTINGS_KEY = 'calendar_settings';
const LEGACY_EVENTS_KEY = 'events';
const LEGACY_NOTES_KEY = 'notes';

// Default settings
const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  viewMode: 'month',
  showWeekends: true,
  firstDayOfWeek: 0,
  showCompletedEvents: true,
};

// Migrate old event format to new format
function migrateEvent(oldEvent: Partial<CalendarEvent>): CalendarEvent {
  return {
    id: oldEvent.id || generateId(),
    date: oldEvent.date || '',
    title: oldEvent.title || '',
    time: oldEvent.time || null,
    endTime: oldEvent.endTime || null,
    description: oldEvent.description || null,
    color: oldEvent.color || '#06b6d4',
    category: oldEvent.category || 'other',
    isRecurring: oldEvent.isRecurring || false,
    recurrencePattern: oldEvent.recurrencePattern || null,
    priority: oldEvent.priority || 'medium',
    completed: oldEvent.completed || false,
    reminder: oldEvent.reminder || null,
  };
}

function generateId(): string {
  return crypto.randomUUID();
}

// Events
export function loadEvents(): CalendarEvent[] {
  try {
    // Try new format first
    const stored = localStorage.getItem(EVENTS_KEY);
    if (stored) {
      const events = JSON.parse(stored);
      return events.map(migrateEvent);
    }
    
    // Fallback to legacy format
    const legacy = localStorage.getItem(LEGACY_EVENTS_KEY);
    if (legacy) {
      const legacyEvents = JSON.parse(legacy);
      const migratedEvents = legacyEvents.map(migrateEvent);
      // Save in new format
      saveEvents(migratedEvents);
      return migratedEvents;
    }
    
    return [];
  } catch {
    return [];
  }
}

export function saveEvents(events: CalendarEvent[]): void {
  try {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  } catch (error) {
    console.error('Failed to save events:', error);
  }
}

// Notes (now supports multiple notes)
export function loadNotes(): Note[] {
  try {
    const stored = localStorage.getItem(NOTES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Migrate legacy single note
    const legacyNote = localStorage.getItem(LEGACY_NOTES_KEY);
    if (legacyNote) {
      const notes: Note[] = [{
        id: generateId(),
        content: legacyNote,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pinned: false,
        color: null,
      }];
      saveNotes(notes);
      return notes;
    }
    
    return [];
  } catch {
    return [];
  }
}

export function saveNotes(notes: Note[]): void {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error('Failed to save notes:', error);
  }
}

// Legacy single note support (for backwards compatibility)
export function loadSingleNote(): string {
  try {
    const notes = loadNotes();
    return notes.length > 0 ? notes[0].content : '';
  } catch {
    return '';
  }
}

export function saveSingleNote(content: string): void {
  const notes = loadNotes();
  if (notes.length > 0) {
    notes[0].content = content;
    notes[0].updatedAt = new Date().toISOString();
  } else {
    notes.push({
      id: generateId(),
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pinned: false,
      color: null,
    });
  }
  saveNotes(notes);
}

// Settings
export function loadSettings(): AppSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
    return DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

// Export/Import functionality
export function exportData(): string {
  const data = {
    events: loadEvents(),
    notes: loadNotes(),
    settings: loadSettings(),
    exportedAt: new Date().toISOString(),
    version: 2,
  };
  return JSON.stringify(data, null, 2);
}

export function importData(jsonString: string): { success: boolean; error?: string } {
  try {
    const data = JSON.parse(jsonString);
    
    if (data.events) {
      const events = data.events.map(migrateEvent);
      saveEvents(events);
    }
    
    if (data.notes) {
      saveNotes(data.notes);
    }
    
    if (data.settings) {
      saveSettings({ ...DEFAULT_SETTINGS, ...data.settings });
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Invalid data format' };
  }
}

// Clear all data
export function clearAllData(): void {
  localStorage.removeItem(EVENTS_KEY);
  localStorage.removeItem(NOTES_KEY);
  localStorage.removeItem(SETTINGS_KEY);
  localStorage.removeItem(LEGACY_EVENTS_KEY);
  localStorage.removeItem(LEGACY_NOTES_KEY);
}
