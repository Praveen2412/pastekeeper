import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import SearchBar from './SearchBar';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface AppBarProps {
  title: string;
  showBackButton?: boolean;
  showSettingsButton?: boolean;
  showSearchButton?: boolean;
  searchValue?: string;
  onSearchChange?: (text: string) => void;
  rightContent?: React.ReactNode;
}

const AppBar: React.FC<AppBarProps> = ({
  title,
  showBackButton = false,
  showSettingsButton = true,
  showSearchButton = false,
  searchValue = '',
  onSearchChange,
  rightContent,
}) => {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchAnimation] = useState(new Animated.Value(0));

  const toggleSearch = () => {
    const toValue = isSearchVisible ? 0 : 1;
    
    Animated.timing(searchAnimation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    
    setIsSearchVisible(!isSearchVisible);
  };

  const handleClearSearch = () => {
    if (onSearchChange) {
      onSearchChange('');
    }
  };

  const searchHeight = searchAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 56]
  });

  const searchOpacity = searchAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1]
  });

  const headerBackground = isDark ? '#1a1a1a' : '#f0f0f0';

  return (
    <View style={[styles.container, { backgroundColor: headerBackground, borderBottomColor: isDark ? '#333' : '#e0e0e0' }]}>
      <View style={styles.mainBar}>
        <View style={styles.leftSection}>
          {showBackButton && (
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => router.back()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialCommunityIcons 
                name="arrow-left" 
                size={24} 
                color={colors.primary} 
              />
            </TouchableOpacity>
          )}
          {!isSearchVisible && (
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
              {title === "PasteKeeper" && (
                <MaterialCommunityIcons 
                  name="clipboard-text-multiple" 
                  size={24} 
                  color={colors.primary} 
                  style={styles.titleIcon}
                />
              )}
            </View>
          )}
        </View>
        <View style={styles.rightSection}>
          {rightContent}
          {showSearchButton && (
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={toggleSearch}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialCommunityIcons 
                name="magnify" 
                size={24} 
                color={colors.text} 
              />
            </TouchableOpacity>
          )}
          {showSettingsButton && (
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={() => router.push('/settings')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialCommunityIcons 
                name="cog-outline" 
                size={24} 
                color={colors.text} 
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {isSearchVisible && (
        <Animated.View style={[
          styles.searchContainer, 
          { 
            height: searchHeight, 
            opacity: searchOpacity,
            overflow: 'hidden',
          }
        ]}>
          <SearchBar 
            value={searchValue || ''} 
            onChangeText={onSearchChange || (() => {})} 
            onClear={handleClearSearch}
            placeholder="Search clipboard items..."
          />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    paddingTop: Platform.OS === 'ios' ? 40 : 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    zIndex: 10,
  },
  mainBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  titleIcon: {
    marginLeft: 8,
  },
  backButton: {
    padding: 4,
  },
  iconButton: {
    marginLeft: 20,
    padding: 4,
  },
  searchContainer: {
    width: '100%',
  },
});

export default React.memo(AppBar); 