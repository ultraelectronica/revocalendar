import { useState, useEffect, useCallback } from 'react';
import { AppSettings } from '@/types';
import { loadSettings, saveSettings } from '@/utils/storageUtils';

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  viewMode: 'month',
  showWeekends: true,
  firstDayOfWeek: 0,
  showCompletedEvents: true,
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      saveSettings(updated);
      return updated;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    saveSettings(DEFAULT_SETTINGS);
  }, []);

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
  };
}

