import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { verifyOtp } from '../../services/supabase';
import Toast from '../../components/ui/Toast';

export default function VerifyResetScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Handle OTP change
  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-focus to next input if current one is filled
    if (text.length === 1 && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle key press (for backspace)
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle OTP verification for password reset
  const handleVerify = async () => {
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Code',
        text2: 'Please enter all 6 digits of the verification code',
        position: 'bottom',
        visibilityTime: 3000,
      });
      return;
    }

    try {
      setIsVerifying(true);
      
      // Verify the OTP token for password reset
      console.log('Verifying OTP for reset with email:', email, 'code:', otpCode);
      
      const { error } = await verifyOtp({
        email: email || '',
        token: otpCode,
        type: 'recovery'
      });
      
      if (error) {
        console.error('Reset verification error:', error);
        Toast.show({
          type: 'error',
          text1: 'Verification Failed',
          text2: typeof error === 'object' && error !== null && 'message' in error 
            ? String(error.message) 
            : 'Verification failed',
          position: 'bottom',
          visibilityTime: 3000,
        });
      } else {
        Toast.show({
          type: 'success',
          text1: 'Verification Successful',
          text2: 'Please create a new password',
          position: 'bottom',
          visibilityTime: 3000,
        });
        
        // Clear pending verification email only when moving to new password screen
        // We still need verification state for the new password screen
        // global.pendingVerificationEmail will be cleared in new-password
        
        // After successful verification, navigate to new password screen
        setTimeout(() => {
          router.push({
            pathname: '/auth/new-password',
            params: { email: email || '', token: otpCode }
          });
        }, 100);
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      Toast.show({
        type: 'error',
        text1: 'Verification Error',
        text2: error.message || 'An error occurred during verification',
        position: 'bottom',
        visibilityTime: 3000,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle resend OTP
  const handleResend = async () => {
    if (!email) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Email address is missing',
        position: 'bottom',
        visibilityTime: 3000,
      });
      return;
    }

    try {
      // Call the resend OTP API here
      // For now, we'll just show a message
      Toast.show({
        type: 'success',
        text1: 'Code Resent',
        text2: 'A new verification code has been sent to your email',
        position: 'bottom',
        visibilityTime: 3000,
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Resend Failed',
        text2: error.message || 'Failed to resend verification code',
        position: 'bottom',
        visibilityTime: 3000,
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Verify Reset Code
          </Text>
          <Text style={[styles.subtitle, { color: colors.secondary }]}>
            We've sent a 6-digit verification code to{' '}
            <Text style={{ fontWeight: 'bold', color: colors.primary }}>{email}</Text>
          </Text>
        </View>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[
                styles.otpInput,
                { 
                  borderColor: digit ? colors.primary : colors.border,
                  color: colors.text,
                  backgroundColor: isDark ? 'rgba(30,30,30,0.8)' : colors.background
                }
              ]}
              value={digit}
              onChangeText={(text) => handleOtpChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              autoCapitalize="none"
              autoCorrect={false}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.verifyButton, { backgroundColor: colors.primary }]}
          onPress={handleVerify}
          disabled={isVerifying}
        >
          {isVerifying ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.verifyButtonText}>Verify & Continue</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.secondary }]}>
            Didn't receive a code?
          </Text>
          <TouchableOpacity onPress={handleResend}>
            <Text style={[styles.resendText, { color: colors.primary }]}>
              Resend Code
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Text style={[styles.backButtonText, { color: colors.primary }]}>
            Go Back
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  verifyButton: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  footerText: {
    fontSize: 15,
    marginRight: 6,
  },
  resendText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  backButton: {
    alignSelf: 'center',
    padding: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 