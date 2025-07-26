import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  TouchableOpacity,
  Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface ToastProps {
  type: 'success' | 'error' | 'info' | 'warning';
  text1: string;
  text2?: string;
  position?: 'top' | 'bottom';
  visibilityTime?: number;
  autoHide?: boolean;
  onHide?: () => void;
}

interface ToastOptions extends ToastProps {
  id: string;
}

// Singleton pattern for Toast
class ToastManager {
  private static instance: ToastManager;
  private toasts: ToastOptions[] = [];
  private listeners: ((toasts: ToastOptions[]) => void)[] = [];

  private constructor() {}

  public static getInstance(): ToastManager {
    if (!ToastManager.instance) {
      ToastManager.instance = new ToastManager();
    }
    return ToastManager.instance;
  }

  public show(options: ToastProps): string {
    const id = Math.random().toString(36).substring(2, 9);
    const toast = { ...options, id };
    this.toasts = [...this.toasts, toast];
    this.notifyListeners();
    
    if (options.autoHide !== false) {
      setTimeout(() => {
        this.hide(id);
      }, options.visibilityTime || 3000);
    }
    
    return id;
  }

  public hide(id: string): void {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.notifyListeners();
  }

  public getToasts(): ToastOptions[] {
    return this.toasts;
  }

  public addListener(listener: (toasts: ToastOptions[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.toasts));
  }
}

// Toast component
const ToastComponent: React.FC<ToastProps & { id: string }> = ({ 
  type, 
  text1, 
  text2, 
  position = 'bottom',
  id
}) => {
  const { colors, isDark } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(position === 'top' ? -100 : 100)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();

    return () => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: position === 'top' ? -100 : 100,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    };
  }, [fadeAnim, translateY, position]);

  const getIconName = () => {
    switch (type) {
      case 'success': return 'check-circle';
      case 'error': return 'alert-circle';
      case 'warning': return 'alert';
      case 'info': return 'information';
      default: return 'information';
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success': return isDark ? '#1e4620' : '#e6f4ea';
      case 'error': return isDark ? '#4e1c1c' : '#fce8e8';
      case 'warning': return isDark ? '#4d3c14' : '#fff8e1';
      case 'info': return isDark ? '#1e3a5f' : '#e8f0fe';
      default: return isDark ? '#2d2d2d' : '#f5f5f5';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success': return '#34a853';
      case 'error': return '#ea4335';
      case 'warning': return '#fbbc05';
      case 'info': return '#4285f4';
      default: return colors.text;
    }
  };

  const handleClose = () => {
    ToastManager.getInstance().hide(id);
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          transform: [{ translateY }],
          opacity: fadeAnim,
        },
        position === 'top' ? styles.topPosition : styles.bottomPosition
      ]}
    >
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons 
          name={getIconName()} 
          size={24} 
          color={getIconColor()} 
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.text1, { color: colors.text }]}>{text1}</Text>
        {text2 && <Text style={[styles.text2, { color: colors.text + '99' }]}>{text2}</Text>}
      </View>
      <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
        <MaterialCommunityIcons 
          name="close" 
          size={20} 
          color={colors.text + '99'} 
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

// Toast Container
const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastOptions[]>([]);

  useEffect(() => {
    const unsubscribe = ToastManager.getInstance().addListener(setToasts);
    return unsubscribe;
  }, []);

  return (
    <>
      {toasts.map(toast => (
        <ToastComponent key={toast.id} {...toast} />
      ))}
    </>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 9999,
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  topPosition: {
    top: Platform.OS === 'ios' ? 50 : 20,
  },
  bottomPosition: {
    bottom: Platform.OS === 'ios' ? 50 : 20,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  text1: {
    fontSize: 16,
    fontWeight: '500',
  },
  text2: {
    fontSize: 14,
    marginTop: 4,
  },
  closeButton: {
    padding: 4,
  },
});

// Export the Toast container and the show/hide methods
const Toast = {
  show: (options: ToastProps) => ToastManager.getInstance().show(options),
  hide: (id: string) => ToastManager.getInstance().hide(id),
  Container: ToastContainer,
};

export default Toast; 