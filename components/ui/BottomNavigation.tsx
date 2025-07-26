import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';

interface TabItem {
  key: string;
  label: string;
  icon: string;
  path: string;
}

interface BottomNavigationProps {
  tabs: TabItem[];
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ tabs }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
      {tabs.map((tab) => {
        const isActive = pathname === tab.path;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => router.push(tab.path)}
          >
            <Text style={[styles.icon, { color: isActive ? colors.primary : colors.text }]}>
              {tab.icon}
            </Text>
            <Text
              style={[
                styles.label,
                { color: isActive ? colors.primary : colors.text },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 60,
    borderTopWidth: 1,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  icon: {
    fontSize: 24,
    marginBottom: 2,
  },
  label: {
    fontSize: 12,
  },
});

export default BottomNavigation; 