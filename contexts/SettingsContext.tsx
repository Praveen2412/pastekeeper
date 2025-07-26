import React, { createContext, useState, useContext, useEffect } from 'react';
import { loadSettings, saveSettings, Settings, DEFAULT_SETTINGS } from '../services/storage';

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSettingsData = async () => {
      try {
        setIsLoading(true);
        const loadedSettings = await loadSettings();
        setSettings(loadedSettings);
        setError(null);
      } catch (err) {
        setError('Failed to load settings');
        console.error('Error loading settings:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettingsData();
  }, []);

  const updateSettings = async (newSettings: Partial<Settings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      await saveSettings(updatedSettings);
    } catch (err) {
      setError('Failed to save settings');
      console.error('Error saving settings:', err);
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        isLoading,
        error,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}; 