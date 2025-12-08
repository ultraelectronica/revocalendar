export interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  time: string | null;
  description: string | null;
  color: string;
}

export type EventColor = 
  | '#3b82f6' 
  | '#10b981' 
  | '#f59e0b' 
  | '#ef4444' 
  | '#8b5cf6' 
  | '#ec4899';

export const EVENT_COLORS: EventColor[] = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
];

