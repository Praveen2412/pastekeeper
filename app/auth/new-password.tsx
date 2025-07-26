import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { updatePassword } from '../../services/supabase';
import Toast from '../../components/ui/Toast';
import { Feather } from '@expo/vector-icons';

export default function NewPasswordScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password validation
  const validatePassword = (password: string) => {
    // At least 8 characters, at least one uppercase letter, one lowercase letter and one number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  };

  // Handle password update
  const handleUpdatePassword = async () => {
    // Check if passwords match
    if (password !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Passwords Do Not Match',
        text2: 'Please make sure your passwords match',
        position: 'bottom',
        visibilityTime: 3000,
      });
      return;
    }

    // Validate password strength
    if (!validatePassword(password)) {
      Toast.show({
        type: 'error',
        text1: 'Weak Password',
        text2: 'Password must be at least 8 characters and include uppercase, lowercase, and a number',
        position: 'bottom',
        visibilityTime: 3000,
      });
      return;
    }

    try {
      setIsLoading(true);
      
      console.log('Updating password for:', email);
      
      const { error } = await updatePassword(password);

      if (error) {
        console.error('Password update error:', error);
        Toast.show({
          type: 'error',
          text1: 'Password Update Failed',
          text2: typeof error === 'object' && error !== null && 'message' in error 
            ? String(error.message) 
            : 'Failed to update password',
          position: 'bottom',
          visibilityTime: 3000,
        });
      } else {
        // Clear pending verification email
        if (global.pendingVerificationEmail) {
          console.log('Clearing pending verification email after password update');
          global.pendingVerificationEmail = undefined;
        }
        
        Toast.show({
          type: 'success',
          text1: 'Password Updated',
          text2: 'Your password has been successfully updated!',
          position: 'bottom',
          visibilityTime: 3000,
        });
        
        // Navigate to sign in screen after a short delay
        setTimeout(() => {
          router.replace('/auth/signin');
        }, 1000);
      }
    } catch (error: any) {
      console.error('Unexpected password update error:', error);
      Toast.show({
        type: 'error',
        text1: 'Update Error',
        text2: error.message || 'An error occurred during password update',
        position: 'bottom',
        visibilityTime: 3000,
      });
    } finally {
      setIsLoading(false);
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
            Create New Password
          </Text>
          <Text style={[styles.subtitle, { color: colors.secondary }]}>
            Your identity has been verified. Create a new password for your account
          </Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>
            New Password
          </Text>
          <View style={[styles.inputContainer, { borderColor: colors.border }]}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholder="Enter new password"
              placeholderTextColor={colors.secondary}
              autoCapitalize="none"
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Feather 
                name={showPassword ? "eye-off" : "eye"} 
                size={20} 
                color={colors.secondary}
              />
            </TouchableOpacity>
          </View>

          <Text style={[styles.inputLabel, { color: colors.text, marginTop: 16 }]}>
            Confirm Password
          </Text>
          <View style={[styles.inputContainer, { borderColor: colors.border }]}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              placeholder="Confirm new password"
              placeholderTextColor={colors.secondary}
              autoCapitalize="none"
            />
            <TouchableOpacity 
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
            >
              <Feather 
                name={showConfirmPassword ? "eye-off" : "eye"} 
                size={20} 
                color={colors.secondary}
              />
            </TouchableOpacity>
          </View>

          <Text style={[styles.passwordHint, { color: colors.secondary }]}>
            Password must be at least 8 characters and include uppercase, lowercase, and a number
          </Text>

          <TouchableOpacity
            style={[styles.updateButton, { backgroundColor: colors.primary }]}
            onPress={handleUpdatePassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.updateButtonText}>Update Password</Text>
            )}
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
    padding: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  formContainer: {
    marginBottom: 30,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 8,
    height: 50,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    height: '100%',
  },
  eyeIcon: {
    padding: 10,
  },
  passwordHint: {
    fontSize: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  updateButton: {
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  }
}); 