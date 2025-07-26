import React, { useEffect, useRef } from 'react';
import { Stack, useRouter, useSegments, Slot } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '../contexts/ThemeContext';
import { SettingsProvider } from '../contexts/SettingsContext';
import { ClipboardProvider } from '../contexts/ClipboardContext';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, Text, View } from 'react-native';
import Toast from '../components/ui/Toast';
import { useDeepLinking } from '../services/deepLinking';

// Declare the global variable for TypeScript
declare global {
  var pendingVerificationEmail: string | undefined;
}

// Auth protection component
function AuthProtection({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const isMounted = useRef(false);
  const initialAuthCheckDone = useRef(false);
  const navigationAttempted = useRef(false);
  
  // Initialize deep linking
  useDeepLinking();

  // Effect to handle initial mounting
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Effect to handle navigation after authentication state changes
  useEffect(() => {
    // Don't navigate if still loading
    if (isLoading) return;
    
    // Make sure component is mounted
    if (!isMounted.current) return;
    
    // Make sure we only do the initial redirect once
    if (!initialAuthCheckDone.current) {
      initialAuthCheckDone.current = true;
      
      const inAuthGroup = segments[0] === 'auth';
      
      // Only redirect from auth screens to home if user is authenticated
      // and not in a verification process (which would be a path containing 'verify')
      // and there's no pending verification
      if (user && inAuthGroup && !segments.some(s => s.includes('verify'))) {
        // Check for pending verification
        const hasPendingVerification = global.pendingVerificationEmail !== undefined;
        
        if (!hasPendingVerification) {
          // Prevent navigation during the first render cycle
          if (navigationAttempted.current) {
            // Use requestAnimationFrame to ensure navigation happens in the next render cycle
            requestAnimationFrame(() => {
              if (isMounted.current) {
                router.replace('/');
              }
            });
          } else {
            navigationAttempted.current = true;
          }
        } else {
          console.log('Not redirecting - pending verification detected');
        }
      }
    }
  }, [user, isLoading, segments, router]);

  // Show loading placeholder during initial authentication check
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return <>{children}</>;
}

function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <ThemeProvider>
        <SettingsProvider>
          <AuthProvider>
            <ClipboardProvider>
              <SafeAreaProvider>
                <AuthProtection>
                  <Slot />
                </AuthProtection>
                <Toast.Container />
              </SafeAreaProvider>
            </ClipboardProvider>
          </AuthProvider>
        </SettingsProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RootLayout; 