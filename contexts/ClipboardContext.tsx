import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { 
  loadClipboardData, 
  saveClipboardData, 
  ClipboardData, 
  ClipboardItem, 
  DEFAULT_CLIPBOARD_DATA 
} from '../services/storage';
import { useSettings } from './SettingsContext';

interface ClipboardContextType {
  clipboardData: ClipboardData;
  addItem: (item: Omit<ClipboardItem, 'id' | 'timestamp'>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  deleteMultipleItems: (ids: string[]) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const ClipboardContext = createContext<ClipboardContextType | undefined>(undefined);

export const ClipboardProvider = ({ children }: { children: React.ReactNode }) => {
  const [clipboardData, setClipboardData] = useState<ClipboardData>(DEFAULT_CLIPBOARD_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { settings } = useSettings();
  
  // Use a ref to track the latest clipboard data to avoid race conditions
  const clipboardDataRef = useRef<ClipboardData>(DEFAULT_CLIPBOARD_DATA);
  
  // Update the ref whenever clipboardData changes
  useEffect(() => {
    clipboardDataRef.current = clipboardData;
  }, [clipboardData]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await loadClipboardData();
        console.log('[CONTEXT] Loaded clipboard data:', JSON.stringify(data));
        setClipboardData(data);
        clipboardDataRef.current = data;
        setError(null);
      } catch (err) {
        setError('Failed to load clipboard data');
        console.error('[CONTEXT] Error loading clipboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const saveData = async (data: ClipboardData) => {
    try {
      console.log('[CONTEXT] Saving clipboard data:', JSON.stringify(data));
      await saveClipboardData(data);
      setClipboardData(data);
      clipboardDataRef.current = data;
    } catch (err) {
      setError('Failed to save clipboard data');
      console.error('[CONTEXT] Error saving clipboard data:', err);
    }
  };

  const addItem = async (item: Omit<ClipboardItem, 'id' | 'timestamp'>) => {
    try {
      console.log('[CONTEXT] Adding item:', JSON.stringify(item));
      
      // Use the ref to get the latest clipboard data
      const currentData = clipboardDataRef.current;
      console.log('[CONTEXT] Current items count:', currentData.items.length);
      
      // Check if this content already exists to avoid duplicates
      const existingItemIndex = currentData.items.findIndex(
        existingItem => existingItem.content === item.content
      );
      
      console.log('[CONTEXT] Existing item index:', existingItemIndex);
      
      let updatedItems;
      const now = Date.now();
      
      if (existingItemIndex !== -1) {
        // Get the existing item
        const existingItem = currentData.items[existingItemIndex];
        console.log('[CONTEXT] Found existing item:', JSON.stringify(existingItem));
        
        // Update the existing item's timestamp but preserve all other properties
        // This ensures we don't lose favorite status or other metadata
        const updatedExistingItem = {
          ...existingItem,
          timestamp: now
        };
        
        console.log('[CONTEXT] Updated existing item:', JSON.stringify(updatedExistingItem));
        
        // Create a new array with the updated item at the beginning and all other items
        updatedItems = [
          updatedExistingItem,
          ...currentData.items.filter((_, index) => index !== existingItemIndex)
        ];
      } else {
        // If it doesn't exist, create a new item with a unique ID and add it to the beginning
        const newItem: ClipboardItem = {
          ...item,
          id: now.toString(),
          timestamp: now,
        };
        
        console.log('[CONTEXT] Creating new item:', JSON.stringify(newItem));
        updatedItems = [newItem, ...currentData.items];
      }
      
      // Limit to max history items
      updatedItems = updatedItems.slice(0, settings.maxHistoryItems);
      
      console.log('[CONTEXT] Saving updated items, count:', updatedItems.length);
      
      const updatedData = {
        ...currentData,
        items: updatedItems,
        lastUpdated: now,
      };
      
      await saveData(updatedData);
      console.log('[CONTEXT] Save complete, new items count:', updatedData.items.length);
    } catch (err) {
      setError('Failed to add item');
      console.error('[CONTEXT] Error adding item:', err);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      console.log('[CONTEXT] Deleting item:', id);
      
      // Use the ref to get the latest clipboard data
      const currentData = clipboardDataRef.current;
      
      const updatedItems = currentData.items.filter(item => item.id !== id);
      const updatedFavorites = currentData.favorites.filter(favId => favId !== id);
      
      await saveData({
        ...currentData,
        items: updatedItems,
        favorites: updatedFavorites,
        lastUpdated: Date.now(),
      });
    } catch (err) {
      setError('Failed to delete item');
      console.error('[CONTEXT] Error deleting item:', err);
    }
  };
  
  const deleteMultipleItems = async (ids: string[]) => {
    try {
      if (ids.length === 0) return;
      
      console.log('[CONTEXT] Deleting multiple items:', ids);
      
      // Use the ref to get the latest clipboard data
      const currentData = clipboardDataRef.current;
      
      // Filter out all items with IDs in the ids array
      const updatedItems = currentData.items.filter(item => !ids.includes(item.id));
      const updatedFavorites = currentData.favorites.filter(favId => !ids.includes(favId));
      
      await saveData({
        ...currentData,
        items: updatedItems,
        favorites: updatedFavorites,
        lastUpdated: Date.now(),
      });
    } catch (err) {
      setError('Failed to delete multiple items');
      console.error('[CONTEXT] Error deleting multiple items:', err);
      throw err; // Re-throw to allow handling in the UI
    }
  };

  const toggleFavorite = async (id: string) => {
    try {
      console.log('[CONTEXT] Toggling favorite for item:', id);
      
      // Use the ref to get the latest clipboard data
      const currentData = clipboardDataRef.current;
      
      const isFavorite = currentData.favorites.includes(id);
      let updatedFavorites: string[];
      let updatedItems = [...currentData.items];
      
      // Update the item's isFavorite property
      const itemIndex = updatedItems.findIndex(item => item.id === id);
      if (itemIndex !== -1) {
        updatedItems[itemIndex] = {
          ...updatedItems[itemIndex],
          isFavorite: !isFavorite
        };
      }
      
      if (isFavorite) {
        updatedFavorites = currentData.favorites.filter(favId => favId !== id);
      } else {
        updatedFavorites = [...currentData.favorites, id];
      }
      
      await saveData({
        ...currentData,
        items: updatedItems,
        favorites: updatedFavorites,
        lastUpdated: Date.now(),
      });
    } catch (err) {
      setError('Failed to toggle favorite');
      console.error('[CONTEXT] Error toggling favorite:', err);
    }
  };

  const clearAll = async () => {
    try {
      console.log('[CONTEXT] Clearing all clipboard data');
      
      await saveData({
        ...DEFAULT_CLIPBOARD_DATA,
        lastUpdated: Date.now(),
      });
    } catch (err) {
      setError('Failed to clear clipboard data');
      console.error('[CONTEXT] Error clearing clipboard data:', err);
    }
  };

  return (
    <ClipboardContext.Provider
      value={{
        clipboardData,
        addItem,
        deleteItem,
        deleteMultipleItems,
        toggleFavorite,
        clearAll,
        isLoading,
        error,
      }}
    >
      {children}
    </ClipboardContext.Provider>
  );
};

export const useClipboard = (): ClipboardContextType => {
  const context = useContext(ClipboardContext);
  if (context === undefined) {
    throw new Error('useClipboard must be used within a ClipboardProvider');
  }
  return context;
}; 