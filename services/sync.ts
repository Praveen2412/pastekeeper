import { Alert, Platform } from 'react-native';
import { 
  syncClipboardItems, 
  getClipboardItems, 
  updateSyncStatus, 
  logSyncEvent,
  registerDevice,
  supabase
} from './supabase';
import { loadClipboardData, saveClipboardData, ClipboardItem } from './storage';
import * as Device from 'expo-device';

// Sync options interface
interface SyncOptions {
  forceSync?: boolean;
  showAlerts?: boolean;
  onProgress?: (progress: number, message: string) => void;
  onComplete?: (success: boolean, message: string) => void;
  onError?: (error: Error) => void;
}

// Default sync options
const defaultSyncOptions: SyncOptions = {
  forceSync: false,
  showAlerts: true,
  onProgress: () => {},
  onComplete: () => {},
  onError: () => {},
};

/**
 * Check if network is available (simplified version)
 */
const isNetworkAvailable = async (): Promise<boolean> => {
  try {
    // Simple network check by trying to fetch a small resource
    const response = await fetch('https://www.google.com/favicon.ico', { 
      method: 'HEAD',
      cache: 'no-cache',
      mode: 'no-cors',
    });
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Sync clipboard data with the server
 */
export const syncClipboardData = async (options: SyncOptions = {}) => {
  // Merge options with defaults
  const opts = { ...defaultSyncOptions, ...options };
  const { forceSync, showAlerts, onProgress, onComplete, onError } = opts;
  
  try {
    // Check if user is authenticated
    let isAuthenticated = false;
    let userId = null;
    try {
      const session = await supabase.auth.getSession();
      isAuthenticated = !!session?.data?.session;
      userId = session?.data?.session?.user?.id || null;
    } catch (authError) {
      console.log('Not authenticated or error checking auth:', authError);
      isAuthenticated = false;
    }

    // If not authenticated, skip sync but don't treat as error
    if (!isAuthenticated) {
      const message = 'Not signed in. Sync skipped.';
      console.log(message);
      onComplete?.(true, message);
      return true;
    }

    // Check network connectivity
    const isConnected = await isNetworkAvailable();
    if (!isConnected) {
      const message = 'No internet connection. Sync aborted.';
      if (showAlerts) {
        Alert.alert('Sync Failed', message);
      }
      onComplete?.(false, message);
      return false;
    }
    
    onProgress?.(10, 'Preparing to sync...');
    
    // Load local data
    const localData = await loadClipboardData();
    
    // Check if there are any items to sync
    if (localData.items.length === 0) {
      const message = 'No clipboard items to sync. Add some items first!';
      if (showAlerts) {
        Alert.alert('Nothing to Sync', message);
      }
      onComplete?.(true, message);
      return true;
    }
    
    // Get items that need to be synced (not synced or modified)
    const itemsToSync = localData.items.filter(
      item => item.syncStatus !== 'synced' || forceSync
    );
    
    if (itemsToSync.length === 0 && !forceSync) {
      const message = 'All items are already synced.';
      onComplete?.(true, message);
      return true;
    }
    
    onProgress?.(30, `Syncing ${itemsToSync.length} items...`);
    
    // Prepare items for sync
    const preparedItems = itemsToSync.map(item => ({
      id: item.id,
      content: item.content,
      type: item.type,
      subcategory: item.subcategory || null,
      timestamp: item.timestamp,
      is_favorite: item.isFavorite,
      char_count: item.charCount,
      device_id: Device.modelId || Device.modelName || `${Platform.OS}-${Date.now()}`,
      user_id: userId, // Explicitly set user_id from the authenticated session
      created_at: new Date(item.timestamp).toISOString(),
      updated_at: new Date().toISOString(),
    }));
    
    // Upload items to server
    const { error: syncError } = await syncClipboardItems(preparedItems);
    
    if (syncError) {
      console.error('Sync error details:', syncError);
      throw new Error(`Error syncing items: ${syncError.message || 'Unknown error'}`);
    }
    
    onProgress?.(60, 'Downloading latest data...');
    
    // Get latest data from server
    const { data: serverItems, error: fetchError } = await getClipboardItems();
    
    if (fetchError) {
      console.error('Fetch error details:', fetchError);
      throw new Error(`Error fetching items: ${fetchError.message || 'Unknown error'}`);
    }
    
    // Handle case where server returns null or empty array
    if (!serverItems || serverItems.length === 0) {
      console.log('No items found on server, using local items only');
      
      // Mark all synced items as synced
      const updatedItems = localData.items.map(item => ({
        ...item,
        syncStatus: 'synced' as 'synced' | 'pending' | 'conflict'
      }));
      
      // Update local data
      const updatedLocalData = {
        ...localData,
        items: updatedItems,
        lastUpdated: Date.now(),
      };
      
      // Save updated data locally
      await saveClipboardData(updatedLocalData);
      
      onProgress?.(100, 'Sync completed successfully');
      
      const message = `Synced ${itemsToSync.length} items. No items on server.`;
      if (showAlerts) {
        Alert.alert('Sync Complete', message);
      }
      
      onComplete?.(true, message);
      return true;
    }
    
    onProgress?.(80, 'Merging data...');
    
    // Convert server items to local format
    const convertedServerItems: ClipboardItem[] = serverItems.map(item => ({
      id: item.id,
      content: item.content,
      type: item.type,
      subcategory: item.subcategory || undefined,
      timestamp: new Date(item.timestamp).getTime(),
      isFavorite: item.is_favorite,
      charCount: item.char_count,
      syncStatus: 'synced',
      deviceId: item.device_id,
      metadata: item.metadata || {},
    }));
    
    // Merge local and server items, preferring server items
    const mergedItems = mergeItems(localData.items, convertedServerItems);
    
    // Update local data
    const updatedLocalData = {
      ...localData,
      items: mergedItems,
      lastUpdated: Date.now(),
    };
    
    // Save merged data locally
    await saveClipboardData(updatedLocalData);
    
    // Update device last sync time
    try {
      const deviceId = Device.modelId || Device.modelName || `${Platform.OS}-${Date.now()}`;
      await registerDevice({
        device_id: deviceId,
        last_sync: new Date().toISOString(),
      });
    } catch (deviceError) {
      console.error('Error updating device sync time:', deviceError);
    }
    
    // Log sync event
    try {
      await logSyncEvent({
        device_id: Device.modelId || Device.modelName || `${Platform.OS}-${Date.now()}`,
        items_synced: itemsToSync.length,
        items_received: serverItems.length,
        sync_type: forceSync ? 'force' : 'normal',
        platform: Platform.OS,
        success: true,
      });
    } catch (logError) {
      console.error('Error logging sync event:', logError);
    }
    
    onProgress?.(100, 'Sync completed successfully');
    
    const message = `Synced ${itemsToSync.length} items. Received ${serverItems.length} items.`;
    if (showAlerts) {
      Alert.alert('Sync Complete', message);
    }
    
    onComplete?.(true, message);
    return true;
  } catch (error: any) {
    console.error('Sync error:', error);
    
    // Log sync failure
    try {
      await logSyncEvent({
        device_id: Device.modelId || Device.modelName || `${Platform.OS}-${Date.now()}`,
        items_synced: 0,
        items_received: 0,
        sync_type: forceSync ? 'force' : 'normal',
        platform: Platform.OS,
        success: false,
        error_message: error.message,
      });
    } catch (logError) {
      console.error('Error logging sync failure:', logError);
    }
    
    const message = `Sync failed: ${error.message}`;
    if (showAlerts) {
      Alert.alert('Sync Failed', message);
    }
    
    onError?.(error);
    onComplete?.(false, message);
    return false;
  }
};

/**
 * Merge local and server items, preferring server items for conflicts
 */
const mergeItems = (localItems: ClipboardItem[], serverItems: ClipboardItem[]): ClipboardItem[] => {
  // Create a map of server items by ID for quick lookup
  const serverItemsMap = new Map<string, ClipboardItem>();
  serverItems.forEach(item => serverItemsMap.set(item.id, item));
  
  // Create a map of local items by ID for quick lookup
  const localItemsMap = new Map<string, ClipboardItem>();
  localItems.forEach(item => localItemsMap.set(item.id, item));
  
  // Start with all server items
  const mergedItems = [...serverItems];
  
  // Add local items that don't exist on the server
  localItems.forEach(localItem => {
    if (!serverItemsMap.has(localItem.id)) {
      // This is a new local item, mark it for sync next time
      mergedItems.push({
        ...localItem,
        syncStatus: 'pending',
      });
    }
  });
  
  // Sort by timestamp (newest first)
  return mergedItems.sort((a, b) => b.timestamp - a.timestamp);
};

/**
 * Schedule periodic background sync
 */
export const scheduleBackgroundSync = (intervalMinutes = 30) => {
  // Convert minutes to milliseconds
  const interval = intervalMinutes * 60 * 1000;
  
  // Set up interval
  const timerId = setInterval(async () => {
    try {
      // Check if network is available before syncing
      const isConnected = await isNetworkAvailable();
      if (isConnected) {
        await syncClipboardData({
          showAlerts: false,
          forceSync: false,
        });
      }
    } catch (error) {
      console.error('Background sync error:', error);
    }
  }, interval);
  
  // Return function to cancel the interval
  return () => clearInterval(timerId);
};

/**
 * Check if sync is needed
 */
export const isSyncNeeded = async (): Promise<boolean> => {
  try {
    // Check if user is authenticated
    try {
      const session = await supabase.auth.getSession();
      const isAuthenticated = !!session?.data?.session;
      
      // If not authenticated, no sync is needed
      if (!isAuthenticated) {
        return false;
      }
    } catch (authError) {
      console.log('Not authenticated or error checking auth:', authError);
      return false;
    }
    
    const localData = await loadClipboardData();
    
    // Check if there are any items that need to be synced
    const pendingItems = localData.items.filter(
      item => item.syncStatus !== 'synced'
    );
    
    return pendingItems.length > 0;
  } catch (error) {
    console.error('Error checking if sync is needed:', error);
    return false;
  }
}; 