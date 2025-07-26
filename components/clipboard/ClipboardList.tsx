import React, { useState, useMemo, useEffect } from 'react';
import { FlatList, StyleSheet, View, Text, RefreshControl, Animated, Easing, useWindowDimensions } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { ClipboardItem as ClipboardItemType } from '../../services/storage';
import ClipboardItem from './ClipboardItem';
import LoadingIndicator from '../ui/LoadingIndicator';
import SearchBar from './SearchBar';
import SortOptions, { SortOption } from './SortOptions';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ClipboardListProps {
  items: ClipboardItemType[];
  isLoading?: boolean;
  error?: string | null;
  onItemPress?: (id: string) => void;
  onItemLongPress?: (id: string) => void;
  onFavoritePress?: (id: string) => void;
  onDeletePress?: (id: string) => void;
  onCloudDeletePress?: (id: string) => void;
  selectedItems?: string[];
  showActions?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
}

const ClipboardList: React.FC<ClipboardListProps> = ({
  items,
  isLoading = false,
  error = null,
  onItemPress,
  onItemLongPress,
  onFavoritePress,
  onDeletePress,
  onCloudDeletePress,
  selectedItems = [],
  showActions = true,
  onRefresh,
  refreshing = false,
}) => {
  const { colors, isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const { width, height } = useWindowDimensions();
  const [numColumns, setNumColumns] = useState(1);
  
  // Determine number of columns based on screen width
  useEffect(() => {
    if (width > 900) {
      setNumColumns(3); // Large tablets, landscape
    } else if (width > 600) {
      setNumColumns(2); // Small tablets, large phones in landscape
    } else {
      setNumColumns(1); // Phones in portrait
    }
  }, [width]);
  
  const filteredAndSortedItems = useMemo(() => {
    // First filter by search query
    let result = items;
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = items.filter(item => 
        item.content.toLowerCase().includes(query)
      );
    }
    
    // Then sort according to selected option
    return [...result].sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return b.timestamp - a.timestamp;
        case 'oldest':
          return a.timestamp - b.timestamp;
        case 'largest':
          return b.charCount - a.charCount;
        case 'smallest':
          return a.charCount - b.charCount;
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });
  }, [items, searchQuery, sortOption]);
  
  // Animation for empty state
  React.useEffect(() => {
    if (items.length === 0 || (searchQuery && filteredAndSortedItems.length === 0)) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
          easing: Easing.out(Easing.back(1.5)),
        }),
      ]).start();
    }
  }, [items.length, searchQuery, filteredAndSortedItems.length]);

  if (isLoading && !refreshing) {
    return <LoadingIndicator message="Loading clipboard items..." />;
  }

  if (error) {
    return (
      <View style={styles.messageContainer}>
        <MaterialCommunityIcons 
          name="alert-circle-outline" 
          size={48} 
          color="red" 
          style={styles.errorIcon}
        />
        <Text style={[styles.errorMessage, { color: 'red' }]}>{error}</Text>
      </View>
    );
  }

  const renderEmptyMessage = () => {
    if (searchQuery && items.length > 0) {
      return (
        <Animated.View 
          style={[
            styles.messageContainer, 
            { 
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <MaterialCommunityIcons 
            name="magnify-close" 
            size={64} 
            color={colors.text + '60'} 
            style={styles.emptyIcon}
          />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No results found
          </Text>
          <Text style={[styles.emptyMessage, { color: colors.text + '80' }]}>
            No clipboard items match "{searchQuery}"
          </Text>
        </Animated.View>
      );
    }
    
    return (
      <Animated.View 
        style={[
          styles.messageContainer, 
          { 
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <MaterialCommunityIcons 
          name="clipboard-text-outline" 
          size={64} 
          color={colors.primary + '80'} 
          style={styles.emptyIcon}
        />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          Clipboard is empty
        </Text>
        <Text style={[styles.emptyMessage, { color: colors.text + '80' }]}>
          Copy something to get started!
        </Text>
      </Animated.View>
    );
  };

  // Adjust item rendering for grid layout
  const renderItem = ({ item, index }: { item: ClipboardItemType; index: number }) => (
    <View style={{ 
      flex: 1/numColumns, 
      maxWidth: numColumns > 1 ? `${100/numColumns}%` : '100%',
    }}>
      <ClipboardItem
        item={item}
        index={index}
        onPress={onItemPress}
        onLongPress={onItemLongPress}
        onFavoritePress={onFavoritePress}
        onDeletePress={onDeletePress}
        onCloudDeletePress={onCloudDeletePress}
        showActions={showActions}
        isSelected={selectedItems.includes(item.id)}
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SearchBar 
        onSearch={setSearchQuery} 
        placeholder="Search clipboard items..." 
        initialValue={searchQuery}
      />
      
      <SortOptions 
        currentSort={sortOption} 
        onSortChange={setSortOption} 
      />
      
      {filteredAndSortedItems.length === 0 ? (
        renderEmptyMessage()
      ) : (
        <FlatList
          data={filteredAndSortedItems}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={numColumns}
          key={`list-${numColumns}`} // Force re-render when columns change
          contentContainerStyle={[
            styles.listContent,
            numColumns > 1 && styles.gridContent
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
              title="Pull to refresh..."
              titleColor={colors.text}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
  },
  gridContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  errorIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    maxWidth: '80%',
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    maxWidth: '80%',
  },
});

export default ClipboardList; 