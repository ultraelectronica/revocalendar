export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
export const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export function formatDateString(month: number, day: number, year: number): string {
  return `${month + 1}/${day}/${year}`;
}

export function parseDateString(dateStr: string): Date {
  const [month, day, year] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day);
}

export function generateEventId(): string {
  return crypto.randomUUID();
}

export function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString('en-us', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

export function formatDateShort(date: Date): string {
  return date.toLocaleDateString('en-us', { 
    month: 'short', 
    day: 'numeric' 
  });
}

export function formatTime(time: string): string {
  if (!time) return '';
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
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

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

export function getRelativeDay(dateStr: string): string {
  const [month, day, year] = dateStr.split('/').map(Number);
  const eventDate = new Date(year, month - 1, day);
  eventDate.setHours(0, 0, 0, 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  if (isSameDay(eventDate, today)) {
    return 'Today';
  } else if (isSameDay(eventDate, tomorrow)) {
    return 'Tomorrow';
  } else if (isSameDay(eventDate, yesterday)) {
    return 'Yesterday';
  } else if (eventDate > today && eventDate < nextWeek) {
    return WEEKDAYS[eventDate.getDay()];
  } else {
    return formatDateShort(eventDate);
  }
}

export function getDaysUntil(dateStr: string): number {
  const [month, day, year] = dateStr.split('/').map(Number);
  const eventDate = new Date(year, month - 1, day);
  eventDate.setHours(0, 0, 0, 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const diffTime = eventDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getWeekDates(date: Date, firstDayOfWeek: 0 | 1 = 0): Date[] {
  const start = new Date(date);
  const day = start.getDay();
  const diff = day - firstDayOfWeek;
  start.setDate(start.getDate() - (diff >= 0 ? diff : diff + 7));
  
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(d);
  }
  return dates;
}

export function getMonthDates(year: number, month: number, firstDayOfWeek: 0 | 1 = 0): Array<{ day: number | null; date: string | null; isCurrentMonth: boolean; isToday: boolean }> {
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let startDay = firstDayOfMonth.getDay() - firstDayOfWeek;
  if (startDay < 0) startDay += 7;
  
  const days: Array<{ day: number | null; date: string | null; isCurrentMonth: boolean; isToday: boolean }> = [];
  
  // Previous month padding
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();
  
  for (let i = startDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const date = formatDateString(prevMonth, day, prevYear);
    const dateObj = new Date(prevYear, prevMonth, day);
    days.push({
      day,
      date,
      isCurrentMonth: false,
      isToday: isSameDay(dateObj, today),
    });
  }
  
  // Current month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = formatDateString(month, day, year);
    const dateObj = new Date(year, month, day);
    days.push({
      day,
      date,
      isCurrentMonth: true,
      isToday: isSameDay(dateObj, today),
    });
  }
  
  // Next month padding (to fill 6 rows = 42 cells)
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  const remaining = 42 - days.length;
  
  for (let day = 1; day <= remaining; day++) {
    const date = formatDateString(nextMonth, day, nextYear);
    const dateObj = new Date(nextYear, nextMonth, day);
    days.push({
      day,
      date,
      isCurrentMonth: false,
      isToday: isSameDay(dateObj, today),
    });
  }
  
  return days;
}

export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}
