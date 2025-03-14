import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { View, StyleSheet, StatusBar, TouchableOpacity, Text, Alert, AppState, AppStateStatus, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { useClipboard } from '../contexts/ClipboardContext';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  startClipboardMonitoring, 
  checkClipboardForChanges
} from '../services/clipboard';
import { syncClipboardData, isSyncNeeded } from '../services/sync';
import { deleteClipboardItems } from '../services/supabase';
import { saveClipboardData } from '../services/storage';
import AppBar from '../components/ui/AppBar';
import ClipboardList from '../components/clipboard/ClipboardList';
import CategoryTabs from '../components/clipboard/CategoryTabs';
import AddItemModal from '../components/clipboard/AddItemModal';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import { ClipboardItem } from '../services/storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from '../components/ui/Toast';

// Helper function to generate unique IDs
const generateId = () => {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
};

function HomeScreen() {
  const router = useRouter();
  const { isDark = false, colors } = useTheme();
  const { settings } = useSettings();
  const { user } = useAuth();
  const { 
    clipboardData, 
    addItem, 
    deleteItem, 
    toggleFavorite,
    clearAll,
    isLoading, 
    error,
    deleteMultipleItems
  } = useClipboard();
  
  const [activeCategory, setActiveCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Use a ref to track if monitoring is active to avoid state updates
  const monitoringActiveRef = useRef(false);
  // Use a ref to store the cleanup function
  const stopMonitoringRef = useRef<(() => void) | null>(null);
  // Use a ref to track the app state
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  // Add a state to track clipboard permission errors
  const [hasClipboardPermissionError, setHasClipboardPermissionError] = useState(false);

  // Add sync-related state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncNeeded, setSyncNeeded] = useState(false);

  // Memoize the addItem function to prevent unnecessary re-renders
  const handleNewClipboardContent = useCallback((item: ClipboardItem) => {
    console.log('[HOME] New clipboard content detected:', JSON.stringify(item));
    addItem(item);
  }, [addItem]);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      console.log('[HOME] App state changed from', appStateRef.current, 'to', nextAppState);
      
      // If app is coming to the foreground
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('[HOME] App has come to the foreground');
        
        // Check for clipboard changes when returning to foreground
        checkClipboardForChanges(null, handleNewClipboardContent)
          .then(hasChanges => {
            if (hasChanges) {
              console.log('[HOME] Detected clipboard changes after returning from background');
            }
          })
          .catch(error => console.error('[HOME] Error checking clipboard after background:', error));
        
        // If monitoring was stopped, restart it
        if (!monitoringActiveRef.current && settings.autoStartMonitoring !== false) {
          console.log('[HOME] Restarting clipboard monitoring after returning from background');
          
          // Clean up existing monitoring
          if (stopMonitoringRef.current) {
            stopMonitoringRef.current();
            stopMonitoringRef.current = null;
          }
          
          // Start new monitoring with a short delay to ensure app is fully active
          setTimeout(() => {
            (async () => {
              try {
                const interval = settings.monitoringInterval || 2000;
                console.log(`[HOME] Starting monitoring with ${interval}ms interval`);
                
                const stopMonitoring = await startClipboardMonitoring(
                  handleNewClipboardContent,
                  { interval }
                );
                stopMonitoringRef.current = stopMonitoring;
                monitoringActiveRef.current = true;
              } catch (error) {
                console.error('[HOME] Error restarting clipboard monitoring:', error);
                monitoringActiveRef.current = false;
              }
            })();
          }, 100); // Short delay to ensure app state is fully updated
        }
      }
      
      appStateRef.current = nextAppState;
    };
    
    // Subscribe to app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription.remove();
    };
  }, [settings.autoStartMonitoring, settings.monitoringInterval, handleNewClipboardContent]);

  // Start clipboard monitoring
  useEffect(() => {
    console.log('[HOME] Setting up clipboard monitoring, autoStart:', settings.autoStartMonitoring);
    
    // Clean up any existing monitoring
    if (stopMonitoringRef.current) {
      console.log('[HOME] Cleaning up existing monitoring');
      stopMonitoringRef.current();
      stopMonitoringRef.current = null;
      monitoringActiveRef.current = false;
    }
    
    // Always start monitoring by default, unless explicitly disabled by the user
    const shouldStartMonitoring = settings.autoStartMonitoring !== false;
    
    if (shouldStartMonitoring) {
      console.log('[HOME] Starting clipboard monitoring with interval:', settings.monitoringInterval || 2000);
      
      // Use an async IIFE to handle the async startClipboardMonitoring
      (async () => {
        try {
          // Set monitoring as active
          monitoringActiveRef.current = true;
          
          console.log('[HOME] Starting clipboard monitoring');
          
          const stopMonitoring = await startClipboardMonitoring(
            handleNewClipboardContent,
            { interval: settings.monitoringInterval || 2000 }
          );
          
          // Store the cleanup function in the ref
          stopMonitoringRef.current = stopMonitoring;
        } catch (error) {
          console.error('[HOME] Error starting clipboard monitoring:', error);
          monitoringActiveRef.current = false;
          setHasClipboardPermissionError(true);
          
          // Show an appropriate alert based on the platform
          if (Platform.OS === 'web') {
            Alert.alert(
              'Clipboard Permission Required',
              'This app needs clipboard access to monitor for changes. Please allow clipboard access in your browser settings or click on the page when prompted.',
              [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
            );
          } else {
            // For native platforms
            Alert.alert(
              'Clipboard Access Issue',
              'There was a problem accessing the clipboard. This may affect the app\'s ability to monitor clipboard changes.',
              [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
            );
          }
        }
      })();
    } else {
      console.log('[HOME] Clipboard monitoring disabled by user settings');
      monitoringActiveRef.current = false;
    }
    
    // Cleanup function
    return () => {
      if (stopMonitoringRef.current) {
        console.log('[HOME] Cleaning up clipboard monitoring on unmount');
        stopMonitoringRef.current();
        stopMonitoringRef.current = null;
        monitoringActiveRef.current = false;
      }
    };
  }, [settings.autoStartMonitoring, settings.monitoringInterval, handleNewClipboardContent]);

  // Filter items based on category
  const getFilteredItems = useCallback(() => {
    let filtered = clipboardData.items;
    
    // Filter by category
    if (activeCategory !== 'all' && activeCategory !== 'favorites') {
      if (['json', 'html', 'markdown'].includes(activeCategory)) {
        // For code subcategories, filter by subcategory
        filtered = filtered.filter(item => item.subcategory === activeCategory);
      } else if (['email', 'phone', 'address', 'bank'].includes(activeCategory)) {
        // For text subcategories, filter by subcategory
        filtered = filtered.filter(item => item.subcategory === activeCategory);
      } else {
        // For main categories, filter by type
        filtered = filtered.filter(item => item.type === activeCategory);
      }
    }
    
    // Filter favorites
    if (activeCategory === 'favorites') {
      filtered = filtered.filter(item => clipboardData.favorites.includes(item.id));
    }
    
    return filtered;
  }, [clipboardData.items, clipboardData.favorites, activeCategory]);

  const handleItemPress = useCallback((id: string) => {
    if (isMultiSelectMode) {
      toggleItemSelection(id);
    } else {
      // View item details or copy to clipboard
      const item = clipboardData.items.find(item => item.id === id);
      if (item) {
        // For now, just toggle favorite
        toggleFavorite(id);
      }
    }
  }, [isMultiSelectMode, clipboardData.items, toggleFavorite]);

  const handleItemLongPress = useCallback((id: string) => {
    if (!isMultiSelectMode) {
      setIsMultiSelectMode(true);
      setSelectedItems([id]);
    }
  }, [isMultiSelectMode]);

  const toggleItemSelection = useCallback((id: string) => {
    setSelectedItems(prevSelectedItems => {
      if (prevSelectedItems.includes(id)) {
        const newSelectedItems = prevSelectedItems.filter(itemId => itemId !== id);
        if (newSelectedItems.length === 0) {
          setIsMultiSelectMode(false);
        }
        return newSelectedItems;
      } else {
        return [...prevSelectedItems, id];
      }
    });
  }, []);

  const handleAddItem = useCallback((content: string, type: 'text' | 'url' | 'code') => {
    if (!content.trim()) return;

    const newItem = {
      id: generateId(),
      content,
      type,
      timestamp: Date.now(),
      isFavorite: false,
      charCount: content.length,
    };

    addItem(newItem);
    
    // Show success message
    Toast.show({
      type: 'success',
      text1: 'Item added',
      position: 'bottom',
      visibilityTime: 2000,
    });
  }, [addItem]);
  
  const handleDeleteSelected = useCallback(async () => {
    if (isDeleting || selectedItems.length === 0) return;
    
    try {
      setIsDeleting(true);
      console.log('[HOME] Deleting selected items:', selectedItems);
      
      // Use the bulk delete function instead of deleting one by one
      await deleteMultipleItems(selectedItems);
      
      // Clear selection and exit multi-select mode
      setSelectedItems([]);
      setIsMultiSelectMode(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to delete selected items');
      console.error('[HOME] Error deleting selected items:', error);
    } finally {
      setIsDeleting(false);
    }
  }, [isDeleting, selectedItems, deleteMultipleItems]);

  // Define categories without 'image'
  const categories = useMemo(() => [
    'all', 
    'favorites', 
    'text', 
    'email', 
    'phone', 
    'address', 
    'bank',
    'url', 
    'code', 
    'json', 
    'html', 
    'markdown'
  ], []);

  // Render permission button if needed
  const renderPermissionButton = useCallback(() => {
    if (hasClipboardPermissionError) {
      return (
        <View style={styles.permissionButtonContainer}>
          <TouchableOpacity
            style={[styles.permissionButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              // Just show a message since we removed the permission request function
              Alert.alert(
                'Clipboard Access',
                'Please restart the app to request clipboard permissions again.',
                [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
              );
            }}
          >
            <Text style={styles.permissionButtonText}>
              {Platform.OS === 'web' 
                ? 'Enable Clipboard Access' 
                : 'Request Clipboard Permissions'}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.permissionNote, { color: colors.text + '80' }]}>
            {Platform.OS === 'web'
              ? 'Enable clipboard access in your browser'
              : 'Clipboard permissions help detect text content'}
          </Text>
        </View>
      );
    }
    return null;
  }, [hasClipboardPermissionError, colors.primary, colors.text]);

  // Check if sync is needed
  useEffect(() => {
    const checkSyncStatus = async () => {
      if (user && settings.enableAutoSync !== false) {
        try {
          const needsSync = await isSyncNeeded();
          setSyncNeeded(needsSync);
          
          if (needsSync) {
            console.log('[HOME] Sync needed, will sync automatically');
          }
        } catch (error) {
          console.error('[HOME] Error checking sync status:', error);
        }
      } else {
        // If not signed in or sync disabled, make sure we don't show sync needed
        setSyncNeeded(false);
      }
    };
    
    checkSyncStatus();
  }, [user, settings.enableAutoSync, clipboardData.items]);
  
  // Auto sync when needed
  useEffect(() => {
    const performAutoSync = async () => {
      if (user && settings.enableAutoSync !== false && syncNeeded && !isSyncing) {
        try {
          setIsSyncing(true);
          console.log('[HOME] Starting auto sync');
          
          await syncClipboardData({
            showAlerts: false,
            onComplete: (success, message) => {
              if (success) {
                console.log('[HOME] Auto sync completed successfully');
                setSyncNeeded(false);
                
                // Show a subtle toast notification
                Toast.show({
                  type: 'info',
                  text1: 'Sync completed',
                  position: 'bottom',
                  visibilityTime: 2000,
                });
              } else {
                console.error('[HOME] Auto sync failed:', message);
              }
            },
            onError: (error) => {
              console.error('[HOME] Auto sync error:', error);
            }
          });
        } catch (error) {
          console.error('[HOME] Error during auto sync:', error);
        } finally {
          setIsSyncing(false);
        }
      }
    };
    
    performAutoSync();
  }, [user, settings.enableAutoSync, syncNeeded, isSyncing]);

  // Add sync indicator to the app bar
  const renderSyncIndicator = useCallback(() => {
    if (!user) return null;
    
    return (
      <TouchableOpacity
        style={styles.syncButton}
        onPress={() => router.push('/settings/sync')}
        disabled={isSyncing}
      >
        {isSyncing ? (
          <MaterialCommunityIcons 
            name="sync" 
            size={24} 
            color={colors.primary}
            style={styles.spinningIcon}
          />
        ) : syncNeeded ? (
          <MaterialCommunityIcons 
            name="sync-alert" 
            size={24} 
            color="#FFC107"
          />
        ) : (
          <MaterialCommunityIcons 
            name="sync" 
            size={24} 
            color={colors.primary}
          />
        )}
      </TouchableOpacity>
    );
  }, [user, isSyncing, syncNeeded, colors.primary, router]);

  const handleCloudDelete = useCallback(async (id: string) => {
    if (!user) return;
    
    try {
      // Show confirmation dialog
      Alert.alert(
        'Delete from Cloud',
        'This will remove the item from cloud storage but keep it on your device. Continue?',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                // Delete from Supabase
                const { error } = await deleteClipboardItems([id]);
                
                if (error) {
                  throw error;
                }
                
                // Update the local item's sync status
                const item = clipboardData.items.find(item => item.id === id);
                if (item) {
                  item.syncStatus = 'pending';
                  // Update the item in the clipboard data
                  const updatedItems = clipboardData.items.map(i => 
                    i.id === id ? item : i
                  );
                  
                  // Save the updated items
                  await saveClipboardData({
                    ...clipboardData,
                    items: updatedItems
                  });
                }
                
                Toast.show({
                  type: 'success',
                  text1: 'Item removed from cloud',
                  position: 'bottom',
                  visibilityTime: 2000,
                });
              } catch (error) {
                console.error('[HOME] Error deleting item from cloud:', error);
                Toast.show({
                  type: 'error',
                  text1: 'Failed to delete from cloud',
                  text2: error instanceof Error ? error.message : 'Unknown error',
                  position: 'bottom',
                  visibilityTime: 3000,
                });
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('[HOME] Error in cloud delete handler:', error);
    }
  }, [user, clipboardData]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      <View style={styles.header}>
        <AppBar 
          title="PasteKeeper" 
          showBackButton={false}
          showSettingsButton
        />
        {user && (
          <View style={styles.syncIndicatorContainer}>
            {renderSyncIndicator()}
          </View>
        )}
      </View>
      
      <CategoryTabs
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />
      
      <ClipboardList
        items={getFilteredItems()}
        isLoading={isLoading}
        error={error}
        onItemPress={handleItemPress}
        onItemLongPress={handleItemLongPress}
        onFavoritePress={toggleFavorite}
        onDeletePress={deleteItem}
        onCloudDeletePress={handleCloudDelete}
        selectedItems={selectedItems}
        showActions={!isMultiSelectMode}
      />
      
      {isMultiSelectMode ? (
        <View style={[styles.multiSelectBar, { backgroundColor: isDark ? '#1a1a1a' : colors.primary }]}>
          <Text style={[styles.selectedCount, { color: isDark ? colors.text : 'white' }]}>
            {selectedItems.length} selected
          </Text>
          <View style={styles.multiSelectActions}>
            <TouchableOpacity 
              style={styles.multiSelectAction}
              onPress={handleDeleteSelected}
              disabled={isDeleting || selectedItems.length === 0}
            >
              <MaterialCommunityIcons 
                name="delete-outline" 
                size={22} 
                color={(isDeleting || selectedItems.length === 0) ? (isDark ? '#666' : 'rgba(255,255,255,0.5)') : (isDark ? colors.text : 'white')} 
              />
              <Text style={[
                styles.actionText, 
                { color: isDark ? colors.text : 'white' },
                (isDeleting || selectedItems.length === 0) && { opacity: 0.5 }
              ]}>
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.multiSelectAction}
              onPress={() => {
                setSelectedItems([]);
                setIsMultiSelectMode(false);
              }}
              disabled={isDeleting}
            >
              <MaterialCommunityIcons 
                name="close" 
                size={22} 
                color={isDark ? colors.text : 'white'} 
                style={styles.actionIcon}
              />
              <Text style={[styles.actionText, { color: isDark ? colors.text : 'white' }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity 
          style={[styles.fab, { backgroundColor: colors.primary }]} 
          onPress={() => setShowAddModal(true)}
        >
          <MaterialCommunityIcons name="plus" size={24} color="white" />
        </TouchableOpacity>
      )}
      
      <AddItemModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddItem}
      />
      
      {renderPermissionButton()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  multiSelectBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectedCount: {
    fontWeight: 'bold',
  },
  multiSelectActions: {
    flexDirection: 'row',
  },
  multiSelectAction: {
    marginLeft: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    marginRight: 4,
  },
  actionText: {
    fontWeight: '500',
    marginLeft: 4,
  },
  permissionButtonContainer: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  permissionButton: {
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  permissionNote: {
    marginTop: 8,
    textAlign: 'center',
  },
  syncButton: {
    padding: 8,
  },
  spinningIcon: {
    transform: [{ rotate: '0deg' }],
    // Note: We would normally add an animation here, but we're keeping it simple
  },
  header: {
    position: 'relative',
  },
  syncIndicatorContainer: {
    position: 'absolute',
    right: 60, // Position before the settings button
    top: Platform.OS === 'ios' ? 60 : 30,
    zIndex: 100,
  },
});

export default React.memo(HomeScreen); 