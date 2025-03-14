import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  initialValue?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Search clipboard items...',
  initialValue = '',
}) => {
  const { colors, isDark = false } = useTheme();
  const [searchQuery, setSearchQuery] = useState(initialValue);

  const handleClear = () => {
    setSearchQuery('');
    onSearch('');
  };

  const handleChangeText = (text: string) => {
    setSearchQuery(text);
    onSearch(text);
  };

  return (
    <View style={[
      styles.container,
      { 
        backgroundColor: isDark ? colors.background : '#f5f5f5',
        borderColor: colors.border 
      }
    ]}>
      <MaterialCommunityIcons 
        name="magnify" 
        size={20} 
        color={colors.text + '80'} 
        style={styles.searchIcon} 
      />
      <TextInput
        style={[styles.input, { color: colors.text }]}
        placeholder={placeholder}
        placeholderTextColor={colors.text + '60'}
        value={searchQuery}
        onChangeText={handleChangeText}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <MaterialCommunityIcons 
            name="close-circle" 
            size={16} 
            color={colors.text + '80'} 
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
});

export default SearchBar; 