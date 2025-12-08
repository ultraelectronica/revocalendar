import { CalendarEvent } from '../types';

const STORAGE_KEY = 'events';
const NOTES_STORAGE_KEY = 'notes';

export function loadEvents(): CalendarEvent[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveEvents(events: CalendarEvent[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (error) {
    console.error('Failed to save events:', error);
  }
}

export function loadNotes(): string {
  try {
    const stored = localStorage.getItem(NOTES_STORAGE_KEY);
    return stored || '';
  } catch {
    return '';
  }
}

export function saveNotes(notes: string): void {
  try {
    localStorage.setItem(NOTES_STORAGE_KEY, notes);
  } catch (error) {
    console.error('Failed to save notes:', error);
  }
}

