export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function formatDateString(month: number, day: number, year: number): string {
  return `${month + 1}/${day}/${year}`;
}

export function generateEventId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString('en-us', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

export function isToday(day: number, month: number, year: number, nav: number): boolean {
  if (nav !== 0) return false;
  const today = new Date();
  return (
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear()
  );
}

