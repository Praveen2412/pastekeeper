import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Switch, 
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { syncClipboardData, isSyncNeeded } from '../../services/sync';
import * as Device from 'expo-device';
import { getDevices } from '../../services/supabase';

export default function SyncSettingsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const { settings, updateSettings } = useSettings();
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncMessage, setSyncMessage] = useState('');
  const [needsSync, setNeedsSync] = useState(false);
  const [devices, setDevices] = useState<any[]>([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);
  
  // Check if sync is needed
  useEffect(() => {
    const checkSyncStatus = async () => {
      if (user) {
        const syncNeeded = await isSyncNeeded();
        setNeedsSync(syncNeeded);
      } else {
        setNeedsSync(false);
      }
    };
    
    checkSyncStatus();
  }, [user]);
  
  // Load devices
  useEffect(() => {
    const loadDevices = async () => {
      if (!user) {
        setDevices([]);
        setIsLoadingDevices(false);
        return;
      }
      
      try {
        setIsLoadingDevices(true);
        const { data, error } = await getDevices();
        
        if (error) {
          console.error('Error loading devices:', error);
          return;
        }
        
        if (data) {
          setDevices(data);
        }
      } catch (error) {
        console.error('Error loading devices:', error);
      } finally {
        setIsLoadingDevices(false);
      }
    };
    
    loadDevices();
  }, [user]);
  
  // Handle sync
  const handleSync = async () => {
    if (isSyncing || !user) return;
    
    try {
      setIsSyncing(true);
      setSyncProgress(0);
      setSyncMessage('Preparing to sync...');
      
      await syncClipboardData({
        forceSync: true,
        showAlerts: false,
        onProgress: (progress, message) => {
          setSyncProgress(progress);
          setSyncMessage(message);
        },
        onComplete: (success, message) => {
          if (success) {
            Alert.alert('Sync Complete', message);
            setNeedsSync(false);
          } else {
            Alert.alert('Sync Failed', message);
          }
        },
        onError: (error) => {
          console.error('Sync error:', error);
        },
      });
    } catch (error) {
      console.error('Error syncing:', error);
      Alert.alert('Sync Error', 'An unexpected error occurred during sync.');
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Handle toggle auto sync
  const handleToggleAutoSync = (value: boolean) => {
    updateSettings({ enableAutoSync: value });
  };
  
  // Handle toggle background sync
  const handleToggleBackgroundSync = (value: boolean) => {
    updateSettings({ enableBackgroundSync: value });
  };
  
  // Get current device info
  const getCurrentDeviceInfo = () => {
    const deviceName = Device.deviceName || 'Unknown Device';
    const deviceType = Device.deviceType === Device.DeviceType.PHONE 
      ? 'Phone' 
      : Device.deviceType === Device.DeviceType.TABLET 
        ? 'Tablet' 
        : 'Desktop';
    
    return `${deviceName} (${deviceType}, ${Platform.OS})`;
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <View style={[styles.header, { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons 
            name="arrow-left" 
            size={24} 
            color={colors.primary} 
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Sync Settings</Text>
        <View style={styles.headerRight} />
      </View>
      
      <ScrollView style={styles.content}>
        {!user ? (
          <View style={styles.signInContainer}>
            <MaterialCommunityIcons 
              name="account-lock" 
              size={64} 
              color={colors.primary} 
            />
            <Text style={[styles.signInTitle, { color: colors.text }]}>
              Sign In Required
            </Text>
            <Text style={[styles.signInSubtitle, { color: colors.text + '99' }]}>
              Please sign in to enable cloud sync and access your clipboard items across devices.
              This is optional - you can continue using the app without signing in.
            </Text>
            <TouchableOpacity
              style={[styles.signInButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/auth/signin')}
            >
              <Text style={styles.signInButtonText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Sync Status
              </Text>
              
              <View style={[
                styles.card, 
                { 
                  backgroundColor: isDark ? '#1a1a1a' : 'white',
                  borderColor: isDark ? '#333' : '#e0e0e0',
                }
              ]}>
                <View style={styles.statusRow}>
                  <MaterialCommunityIcons 
                    name="account-check" 
                    size={20} 
                    color={colors.primary} 
                  />
                  <Text style={[styles.statusLabel, { color: colors.text }]}>
                    Signed in as:
                  </Text>
                  <Text style={[styles.statusValue, { color: colors.text }]}>
                    {user.email}
                  </Text>
                </View>
                
                <View style={styles.statusRow}>
                  <MaterialCommunityIcons 
                    name="devices" 
                    size={20} 
                    color={colors.primary} 
                  />
                  <Text style={[styles.statusLabel, { color: colors.text }]}>
                    Current device:
                  </Text>
                  <Text style={[styles.statusValue, { color: colors.text }]}>
                    {getCurrentDeviceInfo()}
                  </Text>
                </View>
                
                <View style={styles.statusRow}>
                  <MaterialCommunityIcons 
                    name={needsSync ? "sync-alert" : "sync-circle"} 
                    size={20} 
                    color={needsSync ? '#FFC107' : '#4CAF50'} 
                  />
                  <Text style={[styles.statusLabel, { color: colors.text }]}>
                    Sync status:
                  </Text>
                  <Text 
                    style={[
                      styles.statusValue, 
                      { 
                        color: needsSync ? '#FFC107' : '#4CAF50',
                        fontWeight: 'bold',
                      }
                    ]}
                  >
                    {needsSync ? 'Sync needed' : 'Up to date'}
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity
                style={[
                  styles.syncButton, 
                  { 
                    backgroundColor: isSyncing ? (isDark ? '#333' : '#e0e0e0') : colors.primary,
                    opacity: isSyncing ? 0.8 : 1,
                  }
                ]}
                onPress={handleSync}
                disabled={isSyncing}
              >
                {isSyncing ? (
                  <View style={styles.syncingContainer}>
                    <ActivityIndicator color={isDark ? 'white' : colors.primary} size="small" />
                    <Text style={[
                      styles.syncButtonText, 
                      { color: isDark ? 'white' : colors.primary }
                    ]}>
                      {syncMessage} ({syncProgress}%)
                    </Text>
                  </View>
                ) : (
                  <>
                    <MaterialCommunityIcons name="sync" size={20} color="white" />
                    <Text style={styles.syncButtonText}>Sync Now</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
            
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Sync Settings
              </Text>
              
              <View style={[
                styles.card, 
                { 
                  backgroundColor: isDark ? '#1a1a1a' : 'white',
                  borderColor: isDark ? '#333' : '#e0e0e0',
                }
              ]}>
                <View style={styles.settingRow}>
                  <View style={styles.settingTextContainer}>
                    <Text style={[styles.settingLabel, { color: colors.text }]}>
                      Auto Sync
                    </Text>
                    <Text style={[styles.settingDescription, { color: colors.text + '99' }]}>
                      Automatically sync when app starts and when clipboard changes
                    </Text>
                  </View>
                  <Switch
                    value={settings.enableAutoSync !== false}
                    onValueChange={handleToggleAutoSync}
                    trackColor={{ false: '#767577', true: colors.primary + '80' }}
                    thumbColor={settings.enableAutoSync !== false ? colors.primary : '#f4f3f4'}
                  />
                </View>
                
                <View style={styles.divider} />
                
                <View style={styles.settingRow}>
                  <View style={styles.settingTextContainer}>
                    <Text style={[styles.settingLabel, { color: colors.text }]}>
                      Background Sync
                    </Text>
                    <Text style={[styles.settingDescription, { color: colors.text + '99' }]}>
                      Periodically sync in the background (may affect battery life)
                    </Text>
                  </View>
                  <Switch
                    value={settings.enableBackgroundSync === true}
                    onValueChange={handleToggleBackgroundSync}
                    trackColor={{ false: '#767577', true: colors.primary + '80' }}
                    thumbColor={settings.enableBackgroundSync === true ? colors.primary : '#f4f3f4'}
                  />
                </View>
              </View>
            </View>
            
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Connected Devices
              </Text>
              
              <View style={[
                styles.card, 
                { 
                  backgroundColor: isDark ? '#1a1a1a' : 'white',
                  borderColor: isDark ? '#333' : '#e0e0e0',
                }
              ]}>
                {isLoadingDevices ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color={colors.primary} size="small" />
                    <Text style={[styles.loadingText, { color: colors.text }]}>
                      Loading devices...
                    </Text>
                  </View>
                ) : devices.length === 0 ? (
                  <Text style={[styles.noDevicesText, { color: colors.text + '99' }]}>
                    No devices found
                  </Text>
                ) : (
                  devices.map((device, index) => (
                    <React.Fragment key={device.device_id}>
                      <View style={styles.deviceRow}>
                        <View style={styles.deviceInfo}>
                          <View style={styles.deviceNameRow}>
                            <MaterialCommunityIcons 
                              name={
                                device.device_type === 'phone' ? 'cellphone' :
                                device.device_type === 'tablet' ? 'tablet' :
                                'laptop'
                              } 
                              size={20} 
                              color={colors.primary} 
                              style={styles.deviceIcon}
                            />
                            <Text style={[styles.deviceName, { color: colors.text }]}>
                              {device.device_name}
                            </Text>
                          </View>
                          <Text style={[styles.deviceDetails, { color: colors.text + '99' }]}>
                            {device.platform} • Last sync: {formatDate(device.last_sync)}
                          </Text>
                        </View>
                        
                        {Device.modelId === device.device_id && (
                          <View style={[
                            styles.currentDeviceBadge, 
                            { backgroundColor: colors.primary + '20' }
                          ]}>
                            <Text style={[
                              styles.currentDeviceText, 
                              { color: colors.primary }
                            ]}>
                              Current
                            </Text>
                          </View>
                        )}
                      </View>
                      
                      {index < devices.length - 1 && <View style={styles.divider} />}
                    </React.Fragment>
                  ))
                )}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 14,
    marginLeft: 8,
    width: 100,
  },
  statusValue: {
    fontSize: 14,
    flex: 1,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 24,
  },
  syncButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  syncingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginVertical: 12,
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  deviceIcon: {
    marginRight: 8,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '500',
  },
  deviceDetails: {
    fontSize: 14,
    marginLeft: 28,
  },
  currentDeviceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentDeviceText: {
    fontSize: 12,
    fontWeight: '500',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
  },
  noDevicesText: {
    textAlign: 'center',
    padding: 16,
    fontSize: 14,
  },
  signInContainer: {
    alignItems: 'center',
    padding: 24,
  },
  signInTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  signInSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  signInButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  signInButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 