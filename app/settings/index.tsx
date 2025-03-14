import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Switch, TextInput, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { useSettings } from '../../contexts/SettingsContext';
import { useClipboard } from '../../contexts/ClipboardContext';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AppBar from '../../components/ui/AppBar';
import LoadingIndicator from '../../components/ui/LoadingIndicator';
import Button from '../../components/ui/Button';

function SettingsScreen() {
  const { theme, isDark, setTheme, colors } = useTheme();
  const { settings, updateSettings, isLoading, error } = useSettings();
  const { clearAll } = useClipboard();
  const { user, signOut } = useAuth();
  const router = useRouter();
  
  const [showHistoryLimitModal, setShowHistoryLimitModal] = useState(false);
  const [historyLimit, setHistoryLimit] = useState(settings.maxHistoryItems.toString());
  
  const [showIntervalModal, setShowIntervalModal] = useState(false);
  const [monitoringInterval, setMonitoringInterval] = useState((settings.monitoringInterval / 1000).toString());
  
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);

  if (isLoading) {
    return <LoadingIndicator message="Loading settings..." />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }
  
  const saveHistoryLimit = () => {
    const limit = parseInt(historyLimit);
    if (!isNaN(limit) && limit > 0) {
      updateSettings({ maxHistoryItems: limit });
    }
    setShowHistoryLimitModal(false);
  };
  
  const saveMonitoringInterval = () => {
    const interval = parseFloat(monitoringInterval);
    if (!isNaN(interval) && interval > 0) {
      updateSettings({ monitoringInterval: interval * 1000 });
    }
    setShowIntervalModal(false);
  };
  
  const handleClearAll = () => {
    clearAll();
    setShowClearConfirmModal(false);
  };

  const handleToggleAutoStartMonitoring = (value: boolean) => {
    updateSettings({ autoStartMonitoring: value });
  };

  const handleToggleShowCharCount = (value: boolean) => {
    updateSettings({ showCharCount: value });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <AppBar 
        title="Settings" 
        showBackButton 
        showSettingsButton={false}
      />
      
      <ScrollView>
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.primary }]}>Appearance</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>Light Theme</Text>
              <Text style={[styles.description, { color: isDark ? '#aaa' : '#666' }]}>Use light theme</Text>
            </View>
            <Switch
              value={theme === 'light'}
              onValueChange={value => {
                if (value) {
                  setTheme('light');
                  updateSettings({ theme: 'light' });
                }
              }}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>Dark Theme</Text>
              <Text style={[styles.description, { color: isDark ? '#aaa' : '#666' }]}>Use dark theme</Text>
            </View>
            <Switch
              value={theme === 'dark'}
              onValueChange={value => {
                if (value) {
                  setTheme('dark');
                  updateSettings({ theme: 'dark' });
                }
              }}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>System Theme</Text>
              <Text style={[styles.description, { color: isDark ? '#aaa' : '#666' }]}>Follow system theme</Text>
            </View>
            <Switch
              value={theme === 'system'}
              onValueChange={value => {
                if (value) {
                  setTheme('system');
                  updateSettings({ theme: 'system' });
                }
              }}
            />
          </View>
        </View>
        
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.primary }]}>Cloud Sync</Text>
          
          {!user ? (
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => router.push('/auth/signin')}
            >
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Sign In</Text>
                <Text style={[styles.description, { color: isDark ? '#aaa' : '#666' }]}>
                  Sign in to enable cloud sync (optional)
                </Text>
              </View>
              <View style={styles.iconContainer}>
                <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.badgeText}>Sign In</Text>
                </View>
                <MaterialCommunityIcons 
                  name="chevron-right" 
                  size={24} 
                  color={isDark ? '#aaa' : '#666'} 
                />
              </View>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity 
                style={styles.settingItem}
                onPress={() => router.push('/settings/sync')}
              >
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>Sync Settings</Text>
                  <Text style={[styles.description, { color: isDark ? '#aaa' : '#666' }]}>
                    Manage sync preferences and devices
                  </Text>
                </View>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons 
                    name="chevron-right" 
                    size={24} 
                    color={isDark ? '#aaa' : '#666'} 
                  />
                </View>
              </TouchableOpacity>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>Auto Sync</Text>
                  <Text style={[styles.description, { color: isDark ? '#aaa' : '#666' }]}>
                    Automatically sync when app starts and when clipboard changes
                  </Text>
                </View>
                <Switch
                  value={settings.enableAutoSync !== false}
                  onValueChange={(value) => updateSettings({ enableAutoSync: value })}
                  trackColor={{ false: '#767577', true: colors.primary + '80' }}
                  thumbColor={settings.enableAutoSync !== false ? colors.primary : '#f4f3f4'}
                />
              </View>
              
              <TouchableOpacity 
                style={styles.settingItem}
                onPress={() => {
                  Alert.alert(
                    'Sign Out',
                    'Are you sure you want to sign out?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { 
                        text: 'Sign Out', 
                        style: 'destructive',
                        onPress: async () => {
                          try {
                            await signOut();
                          } catch (error) {
                            console.error('Error signing out:', error);
                          }
                        }
                      }
                    ]
                  );
                }}
              >
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, { color: '#FF3B30' }]}>Sign Out</Text>
                  <Text style={[styles.description, { color: isDark ? '#aaa' : '#666' }]}>
                    Sign out of your account
                  </Text>
                </View>
                <MaterialCommunityIcons 
                  name="logout" 
                  size={24} 
                  color="#FF3B30" 
                />
              </TouchableOpacity>
            </>
          )}
        </View>
        
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.primary }]}>Clipboard</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => setShowHistoryLimitModal(true)}
          >
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>History Limit</Text>
              <Text style={[styles.description, { color: isDark ? '#aaa' : '#666' }]}>
                {settings.maxHistoryItems} items
              </Text>
            </View>
            <Text style={{ color: colors.primary }}>Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => setShowIntervalModal(true)}
          >
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>Monitoring Interval</Text>
              <Text style={[styles.description, { color: isDark ? '#aaa' : '#666' }]}>
                {settings.monitoringInterval / 1000} seconds
              </Text>
            </View>
            <Text style={{ color: colors.primary }}>Edit</Text>
          </TouchableOpacity>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>Auto-start monitoring</Text>
              <Text style={[styles.description, { color: isDark ? '#aaa' : '#666' }]}>
                Automatically start monitoring clipboard when app launches
              </Text>
            </View>
            <Switch
              value={settings.autoStartMonitoring}
              onValueChange={handleToggleAutoStartMonitoring}
              trackColor={{ false: '#767577', true: colors.primary + '80' }}
              thumbColor={settings.autoStartMonitoring ? colors.primary : '#f4f3f4'}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>Show character count</Text>
              <Text style={[styles.description, { color: isDark ? '#aaa' : '#666' }]}>
                Display the number of characters for each clipboard item
              </Text>
            </View>
            <Switch
              value={settings.showCharCount}
              onValueChange={handleToggleShowCharCount}
              trackColor={{ false: '#767577', true: colors.primary + '80' }}
              thumbColor={settings.showCharCount ? colors.primary : '#f4f3f4'}
            />
          </View>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => setShowClearConfirmModal(true)}
          >
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: 'red' }]}>Clear All Data</Text>
              <Text style={[styles.description, { color: isDark ? '#aaa' : '#666' }]}>
                Delete all clipboard history
              </Text>
            </View>
            <Text style={{ color: '#FF3B30' }}>Clear</Text>
          </TouchableOpacity>
        </View>
        
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.primary }]}>About</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>Version</Text>
              <Text style={[styles.description, { color: isDark ? '#aaa' : '#666' }]}>1.0.0</Text>
            </View>
          </View>
        </View>
      </ScrollView>
      
      {/* History Limit Modal */}
      <Modal
        visible={showHistoryLimitModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>History Limit</Text>
            <Text style={[styles.modalDescription, { color: isDark ? '#aaa' : '#666' }]}>
              Set the maximum number of clipboard items to keep in history
            </Text>
            
            <TextInput
              style={[styles.input, { 
                color: colors.text,
                borderColor: colors.border,
                backgroundColor: isDark ? '#333' : '#f5f5f5'
              }]}
              value={historyLimit}
              onChangeText={setHistoryLimit}
              keyboardType="number-pad"
              placeholder="Enter limit"
              placeholderTextColor={isDark ? '#aaa' : '#666'}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowHistoryLimitModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={saveHistoryLimit}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Monitoring Interval Modal */}
      <Modal
        visible={showIntervalModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Monitoring Interval</Text>
            <Text style={[styles.modalDescription, { color: isDark ? '#aaa' : '#666' }]}>
              Set how often the app checks for clipboard changes (in seconds)
            </Text>
            
            <TextInput
              style={[styles.input, { 
                color: colors.text,
                borderColor: colors.border,
                backgroundColor: isDark ? '#333' : '#f5f5f5'
              }]}
              value={monitoringInterval}
              onChangeText={setMonitoringInterval}
              keyboardType="decimal-pad"
              placeholder="Enter interval in seconds"
              placeholderTextColor={isDark ? '#aaa' : '#666'}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowIntervalModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={saveMonitoringInterval}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Clear Confirm Modal */}
      <Modal
        visible={showClearConfirmModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Clear All Data</Text>
            <Text style={[styles.modalDescription, { color: isDark ? '#aaa' : '#666' }]}>
              Are you sure you want to delete all clipboard history? This action cannot be undone.
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowClearConfirmModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.deleteButton]}
                onPress={handleClearAll}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
  },
  divider: {
    height: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  cancelButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default SettingsScreen; 