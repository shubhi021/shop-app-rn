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
import { useFormik } from 'formik';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Toast from 'react-native-toast-message';
import { auth } from '../../services/firebase';
import { ENV } from '../../config/env';
import { useTheme } from '../../hooks/useTheme';
import { useAppDispatch } from '../../store/hooks';
import { setLoading, setError } from '../../store/slices/authSlice';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { loginSchema } from '../../utils/validationSchemas';

export default function LoginScreen({ navigation }: any) {
  const { colors, fonts, fontSizes } = useTheme();
  const dispatch = useAppDispatch();
  const [isLoadingState, setIsLoadingState] = useState(false);

  useEffect(() => {
    try {
      GoogleSignin.configure({
        webClientId: ENV.GOOGLE_WEB_CLIENT_ID,
        offlineAccess: true,
      });
    } catch (e) {
      console.log('GoogleSignin init warning:', e);
    }
  }, []);

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      setIsLoadingState(true);
      dispatch(setLoading(true));

      try {
        await signInWithEmailAndPassword(auth, values.email.trim(), values.password);
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
    },
  });

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
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
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
            Explore premium products with DACH standards
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email Address"
            placeholder="Enter your email"
            value={formik.values.email}
            onChangeText={formik.handleChange('email')}
            onBlur={formik.handleBlur('email')}
            error={formik.touched.email && formik.errors.email ? formik.errors.email : null}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={formik.values.password}
            onChangeText={formik.handleChange('password')}
            onBlur={formik.handleBlur('password')}
            error={formik.touched.password && formik.errors.password ? formik.errors.password : null}
            secureTextEntry
            autoCapitalize="none"
          />

          <Button
            title="Log In"
            onPress={() => formik.handleSubmit()}
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