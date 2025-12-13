export interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  time: string | null;
  endTime: string | null;
  description: string | null;
  color: string;
  category: EventCategory;
  isRecurring: boolean;
  recurrencePattern: RecurrencePattern | null;
  priority: EventPriority;
  completed: boolean;
  reminder: ReminderType | null;
}

export type EventCategory = 
  | 'work'
  | 'personal'
  | 'health'
  | 'social'
  | 'travel'
  | 'finance'
  | 'education'
  | 'other';

export type EventPriority = 'low' | 'medium' | 'high';

export type RecurrencePattern = 
  | 'daily'
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'yearly';

export type ReminderType =
  | '5min'
  | '15min'
  | '30min'
  | '1hour'
  | '1day';

export type EventColor = 
  | '#06b6d4' // cyan
  | '#8b5cf6' // violet
  | '#f97316' // orange
  | '#10b981' // emerald
  | '#ec4899' // pink
  | '#eab308' // yellow
  | '#3b82f6' // blue
  | '#ef4444'; // red

export const EVENT_COLORS: EventColor[] = [
  '#06b6d4',
  '#8b5cf6',
  '#f97316',
  '#10b981',
  '#ec4899',
  '#eab308',
  '#3b82f6',
  '#ef4444',
];

export const CATEGORY_CONFIG: Record<EventCategory, { label: string; icon: string; color: string }> = {
  work: { label: 'Work', icon: '💼', color: '#3b82f6' },
  personal: { label: 'Personal', icon: '🏠', color: '#8b5cf6' },
  health: { label: 'Health', icon: '💪', color: '#10b981' },
  social: { label: 'Social', icon: '👥', color: '#ec4899' },
  travel: { label: 'Travel', icon: '✈️', color: '#f97316' },
  finance: { label: 'Finance', icon: '💰', color: '#eab308' },
  education: { label: 'Education', icon: '📚', color: '#06b6d4' },
  other: { label: 'Other', icon: '📌', color: '#6b7280' },
};

export const PRIORITY_CONFIG: Record<EventPriority, { label: string; color: string }> = {
  low: { label: 'Low', color: '#6b7280' },
  medium: { label: 'Medium', color: '#eab308' },
  high: { label: 'High', color: '#ef4444' },
};

export type ViewMode = 'month' | 'week';

export interface Note {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  pinned: boolean;
  color: string | null;
}

export type AlarmSound = 
  | 'blob'
  | 'completion'
  | 'dimple'
  | 'echo'
  | 'notification'
  | 'paint'
  | 'pollen'
  | 'raid'
  | 'success'
  | 'surprise'
  | 'wink';

export const ALARM_SOUNDS: { id: AlarmSound; name: string; icon: string }[] = [
  { id: 'blob', name: 'Blob', icon: '🫧' },
  { id: 'completion', name: 'Completion', icon: '✅' },
  { id: 'dimple', name: 'Dimple', icon: '💫' },
  { id: 'echo', name: 'Echo', icon: '🔔' },
  { id: 'notification', name: 'Notification', icon: '📢' },
  { id: 'paint', name: 'Paint', icon: '🎨' },
  { id: 'pollen', name: 'Pollen', icon: '🌸' },
  { id: 'raid', name: 'Raid', icon: '⚔️' },
  { id: 'success', name: 'Success', icon: '🎉' },
  { id: 'surprise', name: 'Surprise', icon: '🎁' },
  { id: 'wink', name: 'Wink', icon: '😉' },
];

export interface AppSettings {
  theme: 'dark' | 'light';
  viewMode: ViewMode;
  showWeekends: boolean;
  firstDayOfWeek: 0 | 1; // 0 = Sunday, 1 = Monday
  showCompletedEvents: boolean;
  timezone: string; // IANA timezone string (e.g., 'America/New_York')
  alarmSound: AlarmSound; // Sound file to use for timer/alarm notifications
}
