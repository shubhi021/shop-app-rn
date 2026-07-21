import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Toast from 'react-native-toast-message';
import { auth } from '../../services/firebase';
import { useTheme } from '../../hooks/useTheme';
import { useAppDispatch } from '../../store/hooks';
import { setLoading, setError } from '../../store/slices/authSlice';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { validateEmail, validatePassword } from '../../utils/validation';

export default function LoginScreen({ navigation }: any) {
  const { colors, fonts, fontSizes, fontWeights } = useTheme();
  const dispatch = useAppDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isLoadingState, setIsLoadingState] = useState(false);

  useEffect(() => {
    // Configure Google Sign-in
    GoogleSignin.configure({
      webClientId: '655029842121-gcr3lg7e0d7cnm7q85pqt04rjsa09tji.apps.googleusercontent.com', // Web Client ID from Google console
      offlineAccess: true,
    });
  }, []);

  const handleLogin = async () => {
    let isValid = true;

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address.');
      isValid = false;
    } else {
      setEmailError(null);
    }

    if (!validatePassword(password)) {
      setPasswordError('Password must be at least 6 characters.');
      isValid = false;
    } else {
      setPasswordError(null);
    }

    if (!isValid) return;

    setIsLoadingState(true);
    dispatch(setLoading(true));

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      Toast.show({
        type: 'success',
        text1: 'Welcome back!',
        text2: 'You have logged in successfully.',
      });
    } catch (err: any) {
      const message = err.message || 'Failed to sign in. Please check your credentials.';
      dispatch(setError(message));
      Toast.show({
        type: 'error',
        text1: 'Authentication Error',
        text2: message,
      });
    } finally {
      setIsLoadingState(false);
      dispatch(setLoading(false));
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoadingState(true);
    dispatch(setLoading(true));
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const signInResult = await GoogleSignin.signIn();

      if (signInResult.type === 'success') {
        const idToken = signInResult.data.idToken;
        if (!idToken) {
          throw new Error('No ID Token returned from Google Sign-In.');
        }

        const credential = GoogleAuthProvider.credential(idToken);
        await signInWithCredential(auth, credential);

        Toast.show({
          type: 'success',
          text1: 'Google Login Success',
          text2: 'Welcome to ShopApp!',
        });
      } else {
        throw new Error('Google Sign-In was cancelled.');
      }
    } catch (err: any) {
      console.error('Google Sign-In Error: ', err);
      // Fallback UI helper for configuration constraints
      const msg = err.code === 'DEVELOPER_ERROR'
        ? 'Google Sign-in configuration missing. Check Firebase console setup.'
        : err.message || 'Google Sign-In cancelled or failed.';

      Toast.show({
        type: 'error',
        text1: 'Google Authentication Failed',
        text2: msg,
      });
    } finally {
      setIsLoadingState(false);
      dispatch(setLoading(false));
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text
            style={[
              styles.logoText,
              { color: colors.primary, fontSize: 32, fontFamily: fonts.bold },
            ]}>
            ShopApp
          </Text>
          <Text
            style={[
              styles.tagline,
              { color: colors.textSecondary, fontSize: fontSizes.md, fontFamily: fonts.regular },
            ]}>
            Explore premium products at Zalando style
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email Address"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            error={emailError}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            error={passwordError}
            secureTextEntry
            autoCapitalize="none"
          />

          <Button
            title="Log In"
            onPress={handleLogin}
            loading={isLoadingState}
            style={styles.loginBtn}
          />

          <View style={styles.dividerContainer}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.textTertiary, fontSize: fontSizes.sm, fontFamily: fonts.medium }]}>
              OR
            </Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          <Button
            title="Continue with Google"
            onPress={handleGoogleSignIn}
            variant="outline"
            style={styles.googleBtn}
          />

          <View style={styles.footer}>
            <Text style={{ color: colors.textSecondary, fontSize: fontSizes.md, fontFamily: fonts.regular }}>
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text
                style={{
                  color: colors.primary,
                  fontSize: fontSizes.md,
                  fontFamily: fonts.bold,
                }}>
                Register
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    marginBottom: 8,
  },
  tagline: {
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  loginBtn: {
    marginTop: 8,
    marginBottom: 20,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
  },
  googleBtn: {
    marginBottom: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
});