import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Replace with your Supabase URL and anon key
// You can find these in your Supabase dashboard under Settings > API
const SUPABASE_URL = 'https://ocflkuqlrxbhklvplbca.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZmxrdXFscnhiaGtsdnBsYmNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1NTcxNzUsImV4cCI6MjA1NzEzMzE3NX0.CS6IfTmogVckokgl-cw5SgLrpjtVa_NK5bLXqDYxWKs';

// Create a custom storage implementation for AsyncStorage
const AsyncStorageAdapter = {
  getItem: (key: string) => AsyncStorage.getItem(key),
  setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
  removeItem: (key: string) => AsyncStorage.removeItem(key),
};

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});

// Authentication functions
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Don't use email redirect when using OTP
      emailRedirectTo: undefined,
      data: {
        app_version: '1.0.0',
        device_platform: Platform.OS,
      }
    }
  });
  
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const resetPassword = async (email: string) => {
  // For OTP-based password reset
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: undefined, // Don't use redirectTo for OTP flow
  });
  
  return { data, error };
};

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  return { user: data.user, error };
};

export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  return { session: data.session, error };
};

// Add these new OTP authentication functions
export const verifyOtp = async ({ 
  email, 
  token, 
  type = 'signup' 
}: { 
  email: string; 
  token: string; 
  type: 'signup' | 'recovery' 
}) => {
  try {
    console.log(`Verifying OTP for ${email} with type: ${type}`);
    
    if (type === 'signup') {
      console.log('Using signup verification flow');
      const response = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup',
      });
      
      console.log('Signup verification response:', response);
      return response;
    } else {
      console.log('Using recovery verification flow');
      const response = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'recovery',
      });
      
      console.log('Recovery verification response:', response);
      return response;
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return { error };
  }
};

export const resetPasswordWithOtp = async ({ 
  email, 
  token, 
  newPassword 
}: { 
  email: string; 
  token: string; 
  newPassword: string 
}) => {
  try {
    // First verify the OTP
    const { error: verifyError } = await verifyOtp({
      email,
      token,
      type: 'recovery'
    });
    
    if (verifyError) {
      return { error: verifyError };
    }
    
    // Then update the password
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    return { data, error };
  } catch (error: any) {
    console.error('Error resetting password with OTP:', error);
    return { data: null, error };
  }
};

// Database functions for clipboard items
export const syncClipboardItems = async (items: any[]) => {
  const { data, error } = await supabase
    .from('clipboard_items')
    .upsert(items, { onConflict: 'id' });
  
  return { data, error };
};

export const getClipboardItems = async () => {
  const { data, error } = await supabase
    .from('clipboard_items')
    .select('*')
    .order('timestamp', { ascending: false });
  
  return { data, error };
};

export const deleteClipboardItems = async (ids: string[]) => {
  const { data, error } = await supabase
    .from('clipboard_items')
    .delete()
    .in('id', ids);
  
  return { data, error };
};

// Device registration
export const registerDevice = async (deviceInfo: any) => {
  const { data, error } = await supabase
    .from('devices')
    .upsert(deviceInfo, { onConflict: 'device_id' });
  
  return { data, error };
};

export const getDevices = async () => {
  const { data, error } = await supabase
    .from('devices')
    .select('*');
  
  return { data, error };
};

// Sync status tracking
export const updateSyncStatus = async (itemId: string, status: 'synced' | 'pending' | 'conflict') => {
  const { data, error } = await supabase
    .from('clipboard_items')
    .update({ sync_status: status })
    .eq('id', itemId);
  
  return { data, error };
};

export const getSyncHistory = async () => {
  const { data, error } = await supabase
    .from('sync_history')
    .select('*')
    .order('created_at', { ascending: false });
  
  return { data, error };
};

export const logSyncEvent = async (event: any) => {
  const { data, error } = await supabase
    .from('sync_history')
    .insert(event);
  
  return { data, error };
};

/**
 * Update user password (after OTP verification)
 */
export const updatePassword = async (newPassword: string) => {
  try {
    return await supabase.auth.updateUser({
      password: newPassword
    });
  } catch (error) {
    console.error('Error updating password:', error);
    return { error };
  }
}; 