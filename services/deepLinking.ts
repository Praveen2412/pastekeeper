import { Linking } from 'react-native';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from './supabase';
import Toast from '../components/ui/Toast';

/**
 * Hook to handle deep linking for authentication flows
 * Note: This is now primarily for backward compatibility
 * as we've moved to OTP-based authentication
 */
export function useDeepLinking() {
  const router = useRouter();

  useEffect(() => {
    // Handle deep links (for backward compatibility)
    const handleDeepLink = async (event: { url: string }) => {
      const url = event.url;
      console.log('Deep link detected:', url);

      // For backward compatibility, handle any existing deep links
      if (url.includes('auth/reset-password') || url.includes('auth/confirmation')) {
        Toast.show({
          type: 'info',
          text1: 'Authentication Update',
          text2: 'We now use verification codes instead of links. Please check your email for a code.',
          position: 'bottom',
          visibilityTime: 5000,
        });
        
        // Redirect to the appropriate screen
        if (url.includes('reset-password')) {
          router.replace('/auth/reset-password');
        } else if (url.includes('confirmation')) {
          router.replace('/auth/signin');
        }
      }
    };

    // Add event listener for deep links
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check for initial URL (app opened via deep link)
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    // Clean up
    return () => {
      subscription.remove();
    };
  }, [router]);
}

/**
 * Function to handle password reset with a new password
 * @deprecated Use resetPasswordWithOtp from supabase.ts instead
 */
export async function resetPasswordWithToken(newPassword: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw error;
    }

    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error resetting password:', error);
    return { success: false, error };
  }
} 