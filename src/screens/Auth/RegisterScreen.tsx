import React, { useState, useRef, useEffect } from 'react';
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
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import Toast from 'react-native-toast-message';
import { auth } from '../../services/firebase';
import { useTheme } from '../../hooks/useTheme';
import { useAppDispatch } from '../../store/hooks';
import { setLoading, setError, setUser } from '../../store/slices/authSlice';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { registerSchema } from '../../utils/validationSchemas';

export default function RegisterScreen({ navigation }: any) {
  const { colors, fontSizes, fontWeights } = useTheme();
  const dispatch = useAppDispatch();
  const isMounted = useRef(true);
  const [isLoadingState, setIsLoadingState] = useState(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const formatAuthError = (err: any): string => {
    const code = err?.code || '';
    if (code.includes('email-already-in-use')) {
      return 'An account with this email address already exists.';
    }
    if (code.includes('invalid-email')) {
      return 'Please enter a valid email address.';
    }
    if (code.includes('weak-password')) {
      return 'Password should be at least 6 characters long.';
    }
    return err?.message || 'Registration failed. Please try again.';
  };

  const formik = useFormik({
    initialValues: { name: '', email: '', password: '' },
    validationSchema: registerSchema,
    onSubmit: async (values) => {
      if (isMounted.current) setIsLoadingState(true);
      dispatch(setLoading(true));

      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          values.email.trim(),
          values.password,
        );

        if (userCredential.user) {
          await updateProfile(userCredential.user, {
            displayName: values.name.trim(),
          }).catch(e => console.log('Profile update background error:', e));

          dispatch(
            setUser({
              uid: userCredential.user.uid,
              email: userCredential.user.email,
              displayName: values.name.trim(),
              photoURL: userCredential.user.photoURL,
            }),
          );
        }

        Toast.show({
          type: 'success',
          text1: 'Account Created 🎉',
          text2: 'Welcome to ShopApp!',
        });
      } catch (err: any) {
        const message = formatAuthError(err);
        dispatch(setError(message));
        Toast.show({
          type: 'error',
          text1: 'Registration Failed',
          text2: message,
        });
      } finally {
        if (isMounted.current) {
          setIsLoadingState(false);
        }
        dispatch(setLoading(false));
      }
    },
  });

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
              { color: colors.primary, fontSize: 32, fontWeight: fontWeights.bold },
            ]}>
            Create Account
          </Text>
          <Text
            style={[
              styles.tagline,
              { color: colors.textSecondary, fontSize: fontSizes.md },
            ]}>
            Sign up to start shopping on ShopApp DE
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Full Name"
            placeholder="Enter your name"
            value={formik.values.name}
            onChangeText={formik.handleChange('name')}
            onBlur={formik.handleBlur('name')}
            error={formik.touched.name && formik.errors.name ? formik.errors.name : null}
            autoCapitalize="words"
          />

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
            placeholder="Choose a password"
            value={formik.values.password}
            onChangeText={formik.handleChange('password')}
            onBlur={formik.handleBlur('password')}
            error={formik.touched.password && formik.errors.password ? formik.errors.password : null}
            secureTextEntry
            autoCapitalize="none"
          />

          <Button
            title="Sign Up"
            onPress={() => formik.handleSubmit()}
            loading={isLoadingState}
            style={styles.registerBtn}
          />

          <View style={styles.footer}>
            <Text style={{ color: colors.textSecondary, fontSize: fontSizes.md }}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text
                style={{
                  color: colors.primary,
                  fontSize: fontSizes.md,
                  fontWeight: fontWeights.bold,
                }}>
                Log In
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
  registerBtn: {
    marginTop: 8,
    marginBottom: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
});