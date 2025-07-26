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
  ScrollView,
  Image
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, isLoading } = useAuth();
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const handleSignIn = async () => {
    if (!email || !password) {
      alert('Please enter both email and password');
      return;
    }

    const { error } = await signIn(email, password);
    
    if (!error) {
      // Navigation is handled by the auth state listener in AuthContext
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
        
        <Text style={[styles.title, { color: colors.text }]}>Sign In</Text>
        <Text style={[styles.subtitle, { color: colors.text + '99' }]}>
          Welcome back! Please sign in to continue
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
          
          <Link href="/auth/reset-password" asChild>
            <TouchableOpacity style={styles.forgotPasswordContainer}>
              <Text style={[styles.forgotPassword, { color: colors.primary }]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>
          </Link>
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.text + '99' }]}>
            Don't have an account?
          </Text>
          <Link href="/auth/signup" asChild>
            <TouchableOpacity>
              <Text style={[styles.footerLink, { color: colors.primary }]}>
                Sign Up
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
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPassword: {
    fontSize: 14,
    fontWeight: '500',
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