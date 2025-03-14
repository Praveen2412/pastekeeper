import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export type SortOption = 'newest' | 'oldest' | 'largest' | 'smallest' | 'type';

interface SortOptionsProps {
  currentSort: SortOption;
  onSortChange: (option: SortOption) => void;
}

const SortOptions: React.FC<SortOptionsProps> = ({
  currentSort,
  onSortChange,
}) => {
  const { colors, isDark = false } = useTheme();

  const sortOptions: { value: SortOption; label: string; icon: string }[] = [
    { value: 'newest', label: 'Newest', icon: 'clock-outline' },
    { value: 'oldest', label: 'Oldest', icon: 'clock-time-four-outline' },
    { value: 'largest', label: 'Largest', icon: 'arrow-expand' },
    { value: 'smallest', label: 'Smallest', icon: 'arrow-collapse' },
    { value: 'type', label: 'Type', icon: 'sort-alphabetical-variant' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.sortRow}>
        <View style={styles.optionsContainer}>
          {sortOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.option,
                {
                  backgroundColor:
                    currentSort === option.value
                      ? colors.primary + '20'
                      : 'transparent',
                  borderColor:
                    currentSort === option.value ? colors.primary : 'transparent',
                },
              ]}
              onPress={() => onSortChange(option.value)}
            >
              <MaterialCommunityIcons
                name={option.icon as any}
                size={14}
                color={currentSort === option.value ? colors.primary : colors.text + '80'}
                style={styles.icon}
              />
              <Text
                style={[
                  styles.optionText,
                  {
                    color: currentSort === option.value ? colors.primary : colors.text + '80',
                    fontWeight: currentSort === option.value ? 'bold' : 'normal',
                  },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 2,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginLeft: 2,
  },
  icon: {
    marginRight: 2,
  },
  optionText: {
    fontSize: 11,
  },
});

export default SortOptions; 