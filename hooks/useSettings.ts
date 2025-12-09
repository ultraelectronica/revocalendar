import { useState, useEffect, useCallback, useRef } from 'react';
import { AppSettings } from '@/types';
import { loadSettings, saveSettings } from '@/utils/storageUtils';
import { createClient, DbUserSettings } from '@/lib/supabase';

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  viewMode: 'month',
  showWeekends: true,
  firstDayOfWeek: 0,
  showCompletedEvents: true,
};

// Map database settings to local AppSettings type
function mapDbSettingsToLocal(dbSettings: DbUserSettings): AppSettings {
  return {
    theme: dbSettings.theme as 'dark' | 'light',
    viewMode: dbSettings.view_mode as 'month' | 'week',
    showWeekends: dbSettings.show_weekends,
    firstDayOfWeek: dbSettings.first_day_of_week as 0 | 1,
    showCompletedEvents: dbSettings.show_completed_events,
  };
}

interface UseSettingsOptions {
  userId?: string | null;
}

export function useSettings(options: UseSettingsOptions = {}) {
  const { userId } = options;
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const supabaseRef = useRef(createClient());
  const hasMigratedRef = useRef(false);

  // Migrate localStorage settings to Supabase (one-time)
  const migrateLocalToSupabase = useCallback(async (uid: string) => {
    if (hasMigratedRef.current) return;
    
    const supabase = supabaseRef.current;
    
    // Check if user already has settings in Supabase
    const { data: existingSettings } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', uid)
      .single();

    if (existingSettings) {
      hasMigratedRef.current = true;
      return;
    }

    // Load from localStorage and save to Supabase
    const localSettings = loadSettings();
    
    await supabase.from('user_settings').upsert({
      user_id: uid,
      theme: localSettings.theme,
      view_mode: localSettings.viewMode,
      show_weekends: localSettings.showWeekends,
      first_day_of_week: localSettings.firstDayOfWeek,
      show_completed_events: localSettings.showCompletedEvents,
    });
    
    hasMigratedRef.current = true;
  }, []);

  // Fetch settings from Supabase or localStorage
  useEffect(() => {
    const supabase = supabaseRef.current;

    const fetchSettings = async () => {
      setLoading(true);

      if (userId) {
        // Migrate localStorage data if needed
        await migrateLocalToSupabase(userId);

        // Fetch from Supabase
        const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (!error && data) {
          setSettings(mapDbSettingsToLocal(data));
        }
      } else {
        // Fallback to localStorage for unauthenticated users
    setSettings(loadSettings());
      }

      setLoading(false);
    };

    fetchSettings();
  }, [userId, migrateLocalToSupabase]);

  const updateSettings = useCallback(async (newSettings: Partial<AppSettings>) => {
    const supabase = supabaseRef.current;

    // Optimistically update local state
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      
      // Also save to localStorage as fallback
      if (!userId) {
      saveSettings(updated);
      }
      
      return updated;
    });

    if (userId) {
      setSyncing(true);
      
      // Build the update object with snake_case keys
      const dbUpdate: Partial<Record<string, unknown>> = {
        updated_at: new Date().toISOString(),
      };
      
      if (newSettings.theme !== undefined) dbUpdate.theme = newSettings.theme;
      if (newSettings.viewMode !== undefined) dbUpdate.view_mode = newSettings.viewMode;
      if (newSettings.showWeekends !== undefined) dbUpdate.show_weekends = newSettings.showWeekends;
      if (newSettings.firstDayOfWeek !== undefined) dbUpdate.first_day_of_week = newSettings.firstDayOfWeek;
      if (newSettings.showCompletedEvents !== undefined) dbUpdate.show_completed_events = newSettings.showCompletedEvents;

      await supabase
        .from('user_settings')
        .update(dbUpdate)
        .eq('user_id', userId);

      setSyncing(false);
    }
  }, [userId]);

  const resetSettings = useCallback(async () => {
    setSettings(DEFAULT_SETTINGS);
    
    if (userId) {
      const supabase = supabaseRef.current;
      setSyncing(true);
      
      await supabase
        .from('user_settings')
        .update({
          theme: DEFAULT_SETTINGS.theme,
          view_mode: DEFAULT_SETTINGS.viewMode,
          show_weekends: DEFAULT_SETTINGS.showWeekends,
          first_day_of_week: DEFAULT_SETTINGS.firstDayOfWeek,
          show_completed_events: DEFAULT_SETTINGS.showCompletedEvents,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);
      
      setSyncing(false);
    } else {
    saveSettings(DEFAULT_SETTINGS);
    }
  }, [userId]);

  const toggleTheme = useCallback(() => {
    updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
  }, [settings.theme, updateSettings]);

  const toggleViewMode = useCallback(() => {
    updateSettings({ viewMode: settings.viewMode === 'month' ? 'week' : 'month' });
  }, [settings.viewMode, updateSettings]);

  return {
    settings,
    updateSettings,
    resetSettings,
    toggleTheme,
    toggleViewMode,
    loading,
    syncing,
  };
}
