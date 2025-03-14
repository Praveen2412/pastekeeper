import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import Toast from '../../components/ui/Toast';

export default function ResetPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { resetPassword } = useAuth();

  const handleResetPassword = async () => {
    if (!email) {
      Toast.show({
        type: 'error',
        text1: 'Email Required',
        text2: 'Please enter your email address',
        position: 'bottom',
        visibilityTime: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        Toast.show({
          type: 'error',
          text1: 'Reset Failed',
          text2: error.message,
          position: 'bottom',
          visibilityTime: 3000,
        });
      } else {
        // Store email for password reset verification
        console.log('Password reset initiated for email:', email);
        
        // Use the same pattern as signup with a longer delay and requestAnimationFrame
        setTimeout(() => {
          requestAnimationFrame(() => {
            // Set a global variable that can be checked in auth context
            global.pendingVerificationEmail = email;
            
            router.push({
              pathname: '/auth/verify-reset',
              params: { email }
            });
          });
        }, 500); // Increased delay
      }
    } catch (error: any) {
      console.error('Error resetting password:', error);
      Toast.show({
        type: 'error',
        text1: 'Reset Failed',
        text2: 'An unexpected error occurred',
        position: 'bottom',
        visibilityTime: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons 
            name="arrow-left" 
            size={24} 
            color={colors.primary} 
          />
        </TouchableOpacity>
        
        <View style={styles.logoContainer}>
          <MaterialCommunityIcons 
            name="lock-reset" 
            size={64} 
            color={colors.primary} 
          />
          <Text style={[styles.appName, { color: colors.text }]}>
            Reset Password
          </Text>
        </View>
        
        <Text style={[styles.subtitle, { color: colors.text + '99' }]}>
          Enter your email address and we'll send you a verification code to reset your password
        </Text>
        
        <View style={styles.form}>
          <View style={[
            styles.inputContainer, 
            { 
              backgroundColor: isDark ? '#333' : '#f5f5f5',
              borderColor: isDark ? '#444' : '#e0e0e0' 
            }
          ]}>
            <MaterialCommunityIcons 
              name="email-outline" 
              size={20} 
              color={colors.text + '80'} 
              style={styles.inputIcon} 
            />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Email"
              placeholderTextColor={colors.text + '60'}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleResetPassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.buttonText}>
                Send Verification Code
              </Text>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.text + '99' }]}>
            Remember your password?
          </Text>
          <Link href="/auth/signin" asChild>
            <TouchableOpacity>
              <Text style={[styles.footerLink, { color: colors.primary }]}>
                Sign In
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
    padding: 8,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 24,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  passwordToggle: {
    padding: 8,
  },
  button: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: 14,
    marginRight: 4,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: 'bold',
  },
}); 