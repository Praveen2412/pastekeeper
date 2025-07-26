import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const KEYS = {
  CLIPBOARD_DATA: 'clipboard_data',
  SETTINGS: 'settings',
};

// Types
export interface ClipboardItem {
  id: string;
  content: string; // text content or data URL for images
  type: 'text' | 'url' | 'code' | 'json' | 'html' | 'markdown' | 'image';
  subcategory?: string; // For more specific categorization
  timestamp: number;
  isFavorite: boolean;
  charCount: number;
  syncStatus?: 'synced' | 'pending' | 'conflict';
  deviceId?: string; // for tracking which device created the item
  metadata?: Record<string, any>; // Additional metadata for specific item types
}

export interface ClipboardData {
  items: ClipboardItem[];
  favorites: string[]; // Array of item IDs
  lastUpdated: number; // timestamp
  version: string;
}

export interface Settings {
  maxHistoryItems: number; // default: 100
  maxTextLength: number; // default: 10000
  showCharCount: boolean; // default: true
  enableVerboseLogging: boolean; // default: false
  theme: 'light' | 'dark' | 'system'; // default: 'system'
  fontSize: 'small' | 'medium' | 'large'; // default: 'medium'
  accentColor: string; // default: '#007AFF'
  autoStartMonitoring: boolean; // default: true
  monitoringInterval: number; // in ms, default: 2000
  enableAutoSync: boolean; // default: true
  enableBackgroundSync: boolean; // default: false
}

// Default values
export const DEFAULT_CLIPBOARD_DATA: ClipboardData = {
  items: [],
  favorites: [],
  lastUpdated: Date.now(),
  version: '1.0.0',
};

export const DEFAULT_SETTINGS: Settings = {
  maxHistoryItems: 100,
  maxTextLength: 10000,
  showCharCount: true,
  enableVerboseLogging: false,
  theme: 'system',
  fontSize: 'medium',
  accentColor: '#007AFF',
  autoStartMonitoring: true,
  monitoringInterval: 2000,
  enableAutoSync: true,
  enableBackgroundSync: false,
};

// Storage functions
export const saveClipboardData = async (data: ClipboardData): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(KEYS.CLIPBOARD_DATA, jsonValue);
  } catch (error) {
    console.error('Error saving clipboard data:', error);
    throw error;
  }
};

export const loadClipboardData = async (): Promise<ClipboardData> => {
  try {
    const jsonValue = await AsyncStorage.getItem(KEYS.CLIPBOARD_DATA);
    return jsonValue ? JSON.parse(jsonValue) : DEFAULT_CLIPBOARD_DATA;
  } catch (error) {
    console.error('Error loading clipboard data:', error);
    return DEFAULT_CLIPBOARD_DATA;
  }
};

export const saveSettings = async (settings: Settings): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(settings);
    await AsyncStorage.setItem(KEYS.SETTINGS, jsonValue);
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
};

export const loadSettings = async (): Promise<Settings> => {
  try {
    const jsonValue = await AsyncStorage.getItem(KEYS.SETTINGS);
    return jsonValue ? { ...DEFAULT_SETTINGS, ...JSON.parse(jsonValue) } : DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error loading settings:', error);
    return DEFAULT_SETTINGS;
  }
};

export const clearStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing storage:', error);
    throw error;
  }
}; 