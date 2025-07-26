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

// Declare the global variable for TypeScript
declare global {
  var pendingVerificationEmail: string | undefined;
}

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signUp, isLoading } = useAuth();
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please fill in all fields',
        position: 'bottom',
        visibilityTime: 3000,
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Password Mismatch',
        text2: 'Passwords do not match',
        position: 'bottom',
        visibilityTime: 3000,
      });
      return;
    }

    if (password.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Weak Password',
        text2: 'Password must be at least 6 characters long',
        position: 'bottom',
        visibilityTime: 3000,
      });
      return;
    }

    const { error } = await signUp(email, password);
    
    if (!error) {
      // Store email in AsyncStorage for navigation after layout mounts
      console.log('Signed up successfully with email:', email);
      
      // Use a longer delay and requestAnimationFrame to ensure we don't navigate too early
      setTimeout(() => {
        requestAnimationFrame(() => {
          // Set a global variable that can be checked in the _layout.tsx
          global.pendingVerificationEmail = email;
          
          router.push({
            pathname: '/auth/verify-email',
            params: { email }
          });
        });
      }, 500); // Increase delay to 500ms
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
        <View style={styles.logoContainer}>
          <MaterialCommunityIcons 
            name="clipboard-text-multiple" 
            size={64} 
            color={colors.primary} 
          />
          <Text style={[styles.appName, { color: colors.text }]}>PasteKeeper</Text>
        </View>
        
        <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
        <Text style={[styles.subtitle, { color: colors.text + '99' }]}>
          Sign up to start syncing your clipboard across devices
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
          
          <View style={[
            styles.inputContainer, 
            { 
              backgroundColor: isDark ? '#333' : '#f5f5f5',
              borderColor: isDark ? '#444' : '#e0e0e0' 
            }
          ]}>
            <MaterialCommunityIcons 
              name="lock-outline" 
              size={20} 
              color={colors.text + '80'} 
              style={styles.inputIcon} 
            />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Password"
              placeholderTextColor={colors.text + '60'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)}
              style={styles.passwordToggle}
            >
              <MaterialCommunityIcons 
                name={showPassword ? "eye-off" : "eye"} 
                size={20} 
                color={colors.text + '80'} 
              />
            </TouchableOpacity>
          </View>
          
          <View style={[
            styles.inputContainer, 
            { 
              backgroundColor: isDark ? '#333' : '#f5f5f5',
              borderColor: isDark ? '#444' : '#e0e0e0' 
            }
          ]}>
            <MaterialCommunityIcons 
              name="lock-check-outline" 
              size={20} 
              color={colors.text + '80'} 
              style={styles.inputIcon} 
            />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Confirm Password"
              placeholderTextColor={colors.text + '60'}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
          </View>
          
          <Text style={[styles.termsText, { color: colors.text + '80' }]}>
            By signing up, you agree to our Terms of Service and Privacy Policy
          </Text>
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleSignUp}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.buttonText}>Sign Up</Text>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.text + '99' }]}>
            Already have an account?
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
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
    marginBottom: 16,
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
  termsText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 24,
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