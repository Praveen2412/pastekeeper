import React, { useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Platform } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { ClipboardItem as ClipboardItemType } from '../../services/storage';
import { copyToClipboard } from '../../services/clipboard';
import { useSettings } from '../../contexts/SettingsContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../contexts/AuthContext';

interface ClipboardItemProps {
  item: ClipboardItemType;
  onPress?: (id: string) => void;
  onLongPress?: (id: string) => void;
  onFavoritePress?: (id: string) => void;
  onDeletePress?: (id: string) => void;
  onCloudDeletePress?: (id: string) => void;
  onSharePress?: (id: string) => void;
  showActions?: boolean;
  isSelected?: boolean;
  index?: number;
}

const ClipboardItem: React.FC<ClipboardItemProps> = ({
  item,
  onPress,
  onLongPress,
  onFavoritePress,
  onDeletePress,
  onCloudDeletePress,
  onSharePress,
  showActions = true,
  isSelected = false,
  index = 0,
}) => {
  const { colors, isDark = false } = useTheme();
  const { settings } = useSettings();
  const { user } = useAuth();
  const swipeableRef = useRef<Swipeable>(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(50)).current;
  
  // Entrance animation
  useEffect(() => {
    const delay = index * 80; // Stagger the animations (reduced for faster appearance)
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400, // Faster animation
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 400, // Faster animation
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, translateYAnim, index]);
  
  const getTimeAgo = useCallback((timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    
    // Convert to seconds
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) {
      return `${seconds} sec ago`;
    }
    
    // Convert to minutes
    const minutes = Math.floor(seconds / 60);
    
    if (minutes < 60) {
      return `${minutes} min ago`;
    }
    
    // Convert to hours
    const hours = Math.floor(minutes / 60);
    
    if (hours < 24) {
      return `${hours} hr ago`;
    }
    
    // Convert to days
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }, []);
  
  const getTypeIcon = useCallback((type: string) => {
    switch (type) {
      case 'text':
        return 'text-box-outline';
      case 'url':
        return 'link-variant';
      case 'code':
        return 'code-tags';
      default:
        return 'clipboard-text-outline';
    }
  }, []);
  
  const handleCopy = async () => {
    await copyToClipboard(item.content);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (swipeableRef.current) {
      swipeableRef.current.close();
    }
  };
  
  const handleFavorite = () => {
    if (onFavoritePress) {
      onFavoritePress(item.id);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      if (swipeableRef.current) {
        swipeableRef.current.close();
      }
    }
  };
  
  const handleDelete = () => {
    if (onDeletePress) {
      onDeletePress(item.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };
  
  const handleShare = () => {
    if (onSharePress) {
      onSharePress(item.id);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (swipeableRef.current) {
        swipeableRef.current.close();
      }
    }
  };
  
  const renderRightActions = useCallback(() => {
    return (
      <View style={styles.rightActionsContainer}>
        {user && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: 'transparent' }]}
            onPress={() => {
              if (onCloudDeletePress) {
                onCloudDeletePress(item.id);
                if (swipeableRef.current) {
                  swipeableRef.current.close();
                }
              }
            }}
          >
            <MaterialCommunityIcons name="cloud-off-outline" size={24} color={isDark ? '#FFA000' : '#E65100'} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: 'transparent' }]}
          onPress={() => {
            if (onDeletePress) {
              onDeletePress(item.id);
              if (swipeableRef.current) {
                swipeableRef.current.close();
              }
            }
          }}
        >
          <MaterialCommunityIcons name="delete-outline" size={24} color={isDark ? '#F44336' : '#D32F2F'} />
        </TouchableOpacity>
      </View>
    );
  }, [colors, item.id, onDeletePress, onCloudDeletePress, user, isDark]);
  
  const renderLeftActions = (progress: Animated.AnimatedInterpolation<number>) => {
    const trans = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [-64, 0],
    });

    return (
      <Animated.View style={{ transform: [{ translateX: trans }] }}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: isDark ? '#333' : '#f0f0f0' }]} 
          onPress={handleCopy}
        >
          <MaterialCommunityIcons name="content-copy" size={22} color={colors.primary} />
        </TouchableOpacity>
      </Animated.View>
    );
  };
  
  const renderContent = () => {
    if (item.type === 'url') {
      return (
        <View style={styles.urlContainer}>
          <MaterialCommunityIcons name="link" size={16} color={colors.primary} style={styles.urlIcon} />
          <Text 
            style={[styles.content, styles.urlText, { color: colors.primary }]} 
            numberOfLines={2}
            ellipsizeMode="middle"
          >
            {item.content}
          </Text>
        </View>
      );
    }
    
    if (item.type === 'code') {
      return (
        <View style={styles.codeContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.codeScrollView}
          >
            <Text 
              style={[
                styles.content, 
                styles.codeText, 
                { 
                  color: colors.text,
                  backgroundColor: isDark ? '#1E1E1E' : '#F5F5F5',
                }
              ]}
            >
              {item.content}
            </Text>
          </ScrollView>
        </View>
      );
    }
    
    // Default text content
    return (
      <Text 
        style={[styles.content, { color: colors.text }]} 
        numberOfLines={3}
        ellipsizeMode="tail"
      >
        {item.content}
      </Text>
    );
  };
  
  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: translateYAnim }],
      }}
    >
      <Swipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        renderLeftActions={renderLeftActions}
        friction={2}
        rightThreshold={40}
      >
        <TouchableOpacity
          style={[
            styles.container,
            {
              backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
              borderColor: isDark ? '#333333' : '#e0e0e0',
            },
            isSelected && { borderColor: colors.primary, borderWidth: 2 },
          ]}
          onPress={() => onPress && onPress(item.id)}
          onLongPress={() => {
            if (onLongPress) {
              if (Platform.OS === 'ios') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }
              onLongPress(item.id);
            }
          }}
          activeOpacity={0.7}
        >
          <View style={styles.contentContainer}>
            <View style={styles.header}>
              <View style={styles.typeContainer}>
                <MaterialCommunityIcons 
                  name={getTypeIcon(item.type)} 
                  size={18} 
                  color={colors.primary} 
                  style={styles.typeIcon} 
                />
                <Text style={[styles.typeText, { color: colors.primary }]}>
                  {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                </Text>
              </View>
              
              <View style={styles.metaContainer}>
                {settings.showCharCount && (
                  <View style={styles.charCountContainer}>
                    <MaterialCommunityIcons name="counter" size={12} color={colors.text + '80'} style={styles.metaIcon} />
                    <Text style={[styles.charCount, { color: colors.text + '80' }]}>
                      {item.charCount}
                    </Text>
                  </View>
                )}
                <View style={styles.timestampContainer}>
                  <MaterialCommunityIcons name="clock-outline" size={12} color={colors.text + '80'} style={styles.metaIcon} />
                  <Text style={[styles.timestamp, { color: colors.text + '80' }]}>
                    {getTimeAgo(item.timestamp)}
                  </Text>
                </View>
                {item.isFavorite && (
                  <MaterialCommunityIcons name="star" size={14} color="#FFD700" style={styles.favoriteIcon} />
                )}
              </View>
            </View>
            
            {renderContent()}
          </View>

          {showActions && (
            <View style={styles.actionsContainer}>
              {user && (
                <View style={styles.syncIndicator}>
                  <MaterialCommunityIcons
                    name={item.syncStatus === 'synced' ? 'cloud-check' : 'cloud-sync'}
                    size={16}
                    color={
                      item.syncStatus === 'synced'
                        ? '#4CAF50'
                        : item.syncStatus === 'pending'
                        ? '#FFA000'
                        : colors.error
                    }
                  />
                </View>
              )}
              
              <TouchableOpacity
                style={styles.actionIcon}
                onPress={() => onFavoritePress && onFavoritePress(item.id)}
              >
                <MaterialCommunityIcons
                  name={item.isFavorite ? 'star' : 'star-outline'}
                  size={20}
                  color={item.isFavorite ? '#FFC107' : colors.text + '80'}
                />
              </TouchableOpacity>
              
              {onSharePress && (
                <TouchableOpacity
                  style={styles.actionIcon}
                  onPress={() => onSharePress(item.id)}
                >
                  <MaterialCommunityIcons
                    name="share-variant-outline"
                    size={20}
                    color={colors.text + '80'}
                  />
                </TouchableOpacity>
              )}
            </View>
          )}
        </TouchableOpacity>
      </Swipeable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeIcon: {
    marginRight: 4,
  },
  typeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  charCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    marginRight: 4,
  },
  charCount: {
    fontSize: 12,
  },
  timestamp: {
    fontSize: 12,
  },
  favoriteIcon: {
    marginLeft: 8,
  },
  content: {
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  urlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
    padding: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  urlIcon: {
    marginRight: 8,
  },
  urlText: {
    flex: 1,
    fontWeight: '500',
  },
  codeContainer: {
    marginTop: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  codeScrollView: {
    maxHeight: 150,
  },
  codeText: {
    fontFamily: 'monospace',
    padding: 12,
    borderRadius: 8,
  },
  rightActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginLeft: 10,
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    height: '100%',
  },
  syncIndicator: {
    marginRight: 'auto',
    paddingLeft: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  actionIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 8,
  },
});

export default React.memo(ClipboardItem); 