import { createBrowserClient } from '@supabase/ssr';

function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'Supabase env vars are missing. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_URL and SUPABASE_ANON_KEY) in your env.'
    );
  }

  return { url, anonKey };
}

export function createClient() {
  const { url, anonKey } = getSupabaseEnv();
  return createBrowserClient(url, anonKey);
}

// Database types for type safety
export interface DbEvent {
  id: string;
  user_id: string;
  date: string;
  title: string;
  time: string | null;
  end_time: string | null;
  description: string | null;
  color: string;
  category: string;
  is_recurring: boolean;
  recurrence_pattern: string | null;
  priority: string;
  completed: boolean;
  reminder: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbNote {
  id: string;
  user_id: string;
  content: string;
  pinned: boolean;
  color: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbUserSettings {
  user_id: string;
  theme: string;
  view_mode: string;
  show_weekends: boolean;
  first_day_of_week: number;
  show_completed_events: boolean;
  timezone: string | null;
  alarm_sound: string | null;
  updated_at: string;
}

export interface DbProfile {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

