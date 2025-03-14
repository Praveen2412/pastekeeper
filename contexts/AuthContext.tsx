import React, { createContext, useState, useEffect, useContext, ReactNode, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import { Session, User } from '@supabase/supabase-js';
import { 
  supabase, 
  signIn as supabaseSignIn, 
  signUp as supabaseSignUp,
  signOut as supabaseSignOut,
  resetPassword as supabaseResetPassword,
  getCurrentUser,
  getSession,
  registerDevice
} from '../services/supabase';
import * as Device from 'expo-device';
import { useRouter, useSegments } from 'expo-router';
import Toast from '../components/ui/Toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();
  const isMounted = useRef(false);

  // Initialize auth state
  useEffect(() => {
    // Set the mounted flag
    isMounted.current = true;
    
    const initializeAuth = async () => {
      try {
        // Get current session
        const { session: currentSession, error: sessionError } = await getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          setIsLoading(false);
          return;
        }
        
        if (currentSession) {
          setSession(currentSession);
          
          // Get current user
          const { user: currentUser, error: userError } = await getCurrentUser();
          
          if (userError) {
            console.error('Error getting user:', userError);
          } else if (currentUser) {
            setUser(currentUser);
            
            // Register device
            registerDeviceIfNeeded(currentUser.id);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
    
    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state changed:', event);
        setSession(newSession);
        
        if (event === 'SIGNED_IN' && newSession) {
          const { user: newUser } = await getCurrentUser();
          setUser(newUser);
          
          if (newUser) {
            registerDeviceIfNeeded(newUser.id);
            
            // Check if there's a pending verification
            const hasPendingVerification = global.pendingVerificationEmail !== undefined;
            
            // Don't navigate automatically if there's a pending verification
            // or if the user is on a verification screen
            const inAuthGroup = segments[0] === 'auth';
            const inVerifyScreen = segments.some(s => s.includes('verify'));
            
            if (inAuthGroup && !inVerifyScreen && !hasPendingVerification) {
              // Delay navigation to ensure root layout is mounted
              setTimeout(() => {
                requestAnimationFrame(() => {
                  if (isMounted.current) {
                    router.replace('/');
                  }
                });
              }, 500);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          router.replace('/auth/signin');
        }
      }
    );
    
    return () => {
      isMounted.current = false;
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [router, segments]);

  // Register device for sync
  const registerDeviceIfNeeded = async (userId: string) => {
    try {
      const deviceName = Device.deviceName || 'Unknown Device';
      const deviceType = Device.deviceType === Device.DeviceType.PHONE 
        ? 'phone' 
        : Device.deviceType === Device.DeviceType.TABLET 
          ? 'tablet' 
          : 'desktop';
      
      const deviceId = Device.modelId || Device.modelName || `${Platform.OS}-${Date.now()}`;
      
      await registerDevice({
        device_id: deviceId,
        user_id: userId,
        device_name: deviceName,
        device_type: deviceType,
        platform: Platform.OS,
        last_sync: new Date().toISOString(),
      });
      
      console.log('Device registered successfully');
    } catch (error) {
      console.error('Error registering device:', error);
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabaseSignIn(email, password);
      
      if (error) {
        Toast.show({
          type: 'error',
          text1: 'Sign In Error',
          text2: error.message,
          position: 'bottom',
          visibilityTime: 3000,
        });
        return { error };
      }
      
      return { error: null };
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Sign In Error',
        text2: error.message || 'An unexpected error occurred',
        position: 'bottom',
        visibilityTime: 3000,
      });
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabaseSignUp(email, password);
      
      if (error) {
        Toast.show({
          type: 'error',
          text1: 'Sign Up Error',
          text2: error.message,
          position: 'bottom',
          visibilityTime: 3000,
        });
        return { error };
      }
      
      Toast.show({
        type: 'success',
        text1: 'Verification Code Sent',
        text2: 'Please check your email for a verification code',
        position: 'bottom',
        visibilityTime: 3000,
      });
      
      // Don't navigate here, let the signup screen handle it
      
      return { error: null };
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Sign Up Error',
        text2: error.message || 'An unexpected error occurred',
        position: 'bottom',
        visibilityTime: 3000,
      });
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabaseSignOut();
      
      if (error) {
        Toast.show({
          type: 'error',
          text1: 'Sign Out Error',
          text2: error.message,
          position: 'bottom',
          visibilityTime: 3000,
        });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Sign Out Error',
        text2: error.message || 'An unexpected error occurred',
        position: 'bottom',
        visibilityTime: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabaseResetPassword(email);
      
      if (error) {
        Toast.show({
          type: 'error',
          text1: 'Reset Password Error',
          text2: error.message,
          position: 'bottom',
          visibilityTime: 3000,
        });
        return { error };
      }
      
      Toast.show({
        type: 'success',
        text1: 'Verification Code Sent',
        text2: 'Please check your email for a verification code',
        position: 'bottom',
        visibilityTime: 3000,
      });
      
      // Don't navigate here, let the reset password screen handle it
      
      return { error: null };
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Reset Password Error',
        text2: error.message || 'An unexpected error occurred',
        position: 'bottom',
        visibilityTime: 3000,
      });
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 