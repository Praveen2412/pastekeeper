// Example file showing how to load environment variables in your app
// You can create a similar file in your project root or services directory

import * as dotenv from 'dotenv';
import { Platform } from 'react-native';

// For React Native, you might need to use a different approach
// as dotenv is primarily for Node.js environments
// Consider using react-native-dotenv or react-native-config packages

// This is a simplified example
export const getEnvVariables = () => {
  // For web or server environments
  if (typeof process !== 'undefined' && process.env) {
    dotenv.config();
    return {
      supabaseUrl: process.env.SUPABASE_URL || '',
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
    };
  }
  
  // For React Native, you might hardcode these values after getting them from .env
  // or use a package like react-native-dotenv
  return {
    supabaseUrl: 'YOUR_SUPABASE_URL', // Replace with actual value or import from .env
    supabaseAnonKey: 'YOUR_SUPABASE_ANON_KEY', // Replace with actual value or import from .env
  };
};

// Usage example:
// import { getEnvVariables } from './env-config';
// const { supabaseUrl, supabaseAnonKey } = getEnvVariables();
// const supabase = createClient(supabaseUrl, supabaseAnonKey); 