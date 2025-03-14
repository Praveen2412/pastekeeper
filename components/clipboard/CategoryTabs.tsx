import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface CategoryTabsProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
}) => {
  const { colors, isDark = false } = useTheme();
  const [showSubcategories, setShowSubcategories] = useState(false);
  const [activeMainCategory, setActiveMainCategory] = useState('all');

  // Code subcategories
  const codeSubcategories = ['json', 'html', 'markdown'];
  
  // Text subcategories
  const textSubcategories = ['email', 'phone', 'address', 'bank'];

  // Main categories (excluding subcategories and image)
  const mainCategories = useMemo(() => 
    categories.filter(
      category => 
        !codeSubcategories.includes(category) && 
        !textSubcategories.includes(category) &&
        category !== 'image'
    ), 
    [categories]
  );

  // Update active main category when active category changes
  useEffect(() => {
    if (codeSubcategories.includes(activeCategory)) {
      setActiveMainCategory('code');
      setShowSubcategories(true);
    } else if (textSubcategories.includes(activeCategory)) {
      setActiveMainCategory('text');
      setShowSubcategories(true);
    } else {
      setActiveMainCategory(activeCategory);
    }
  }, [activeCategory]);

  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case 'all':
        return 'view-dashboard-outline';
      case 'favorites':
        return 'star-outline';
      case 'text':
        return 'text-box-outline';
      case 'url':
        return 'link-variant';
      case 'code':
        return 'code-tags';
      case 'json':
        return 'code-json';
      case 'html':
        return 'language-html5';
      case 'markdown':
        return 'language-markdown';
      case 'email':
        return 'email-outline';
      case 'phone':
        return 'phone-outline';
      case 'address':
        return 'map-marker-outline';
      case 'bank':
        return 'bank-outline';
      default:
        return 'text-box-outline';
    }
  };

  const handleMainCategoryPress = (category: string) => {
    onCategoryChange(category);
    setActiveMainCategory(category);
    
    // Show subcategories only for text and code categories
    if (category === 'text' || category === 'code') {
      setShowSubcategories(true);
    } else {
      setShowSubcategories(false);
    }
  };

  // Get current subcategories based on active main category
  const getCurrentSubcategories = () => {
    if (activeMainCategory === 'code') {
      return codeSubcategories;
    } else if (activeMainCategory === 'text') {
      return textSubcategories;
    }
    return [];
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#1a1a1a' : '#f8f8f8', borderBottomColor: isDark ? '#333' : 'rgba(0,0,0,0.05)' }]}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {mainCategories.map((category) => {
          const isActive = activeMainCategory === category;
          
          return (
            <TouchableOpacity
              key={category}
              style={[
                styles.tab,
                {
                  backgroundColor: isActive
                    ? colors.primary
                    : isDark
                    ? '#1a1a1a'
                    : '#ffffff',
                  borderColor: isActive ? colors.primary : isDark ? '#444' : '#e0e0e0',
                  shadowColor: isDark ? 'transparent' : '#000',
                },
              ]}
              onPress={() => handleMainCategoryPress(category)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name={getCategoryIcon(category) as any}
                size={18}
                color={isActive ? 'white' : colors.text}
                style={styles.icon}
              />
              <Text
                style={[
                  styles.tabText,
                  { color: isActive ? 'white' : colors.text },
                ]}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
              
              {/* Add dropdown indicators for categories with subcategories */}
              {(category === 'code' || category === 'text') && (
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setShowSubcategories(!showSubcategories)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <MaterialCommunityIcons
                    name={(isActive && showSubcategories) ? 'chevron-up' : 'chevron-down' as any}
                    size={16}
                    color={isActive ? 'white' : colors.text}
                  />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      
      {/* Show subcategories only if a category with subcategories is active and showSubcategories is true */}
      {showSubcategories && (activeMainCategory === 'code' || activeMainCategory === 'text') && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.subcategoriesContainer}
        >
          {getCurrentSubcategories().map((subcategory) => {
            const isActive = activeCategory === subcategory;
            
            return (
              <TouchableOpacity
                key={subcategory}
                style={[
                  styles.subtab,
                  {
                    backgroundColor: isActive
                      ? colors.primary + '20'
                      : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                    borderColor: isActive ? colors.primary : 'transparent',
                  },
                ]}
                onPress={() => onCategoryChange(subcategory)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name={getCategoryIcon(subcategory) as any}
                  size={16}
                  color={isActive ? colors.primary : colors.text + '80'}
                  style={styles.icon}
                />
                <Text
                  style={[
                    styles.subtabText,
                    { color: isActive ? colors.primary : colors.text + '80' },
                  ]}
                >
                  {subcategory.charAt(0).toUpperCase() + subcategory.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
    marginRight: 10,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  icon: {
    marginRight: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dropdownButton: {
    marginLeft: 4,
    padding: 2,
  },
  subcategoriesContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  subtab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
  },
  subtabText: {
    fontSize: 13,
    fontWeight: '500',
  },
});

export default React.memo(CategoryTabs); 