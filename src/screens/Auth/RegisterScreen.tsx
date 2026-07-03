import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {createUserWithEmailAndPassword, updateProfile} from 'firebase/auth';
import Toast from 'react-native-toast-message';
import {auth} from '../../services/firebase';
import {useTheme} from '../../hooks/useTheme';
import {useAppDispatch} from '../../store/hooks';
import {setLoading, setError, setUser} from '../../store/slices/authSlice';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import {validateEmail, validatePassword} from '../../utils/validation';

export default function RegisterScreen({navigation}: any) {
  const {colors, fontSizes, fontWeights} = useTheme();
  const dispatch = useAppDispatch();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isLoadingState, setIsLoadingState] = useState(false);

  const handleRegister = async () => {
    let isValid = true;

    if (!name.trim()) {
      setNameError('Please enter your name.');
      isValid = false;
    } else {
      setNameError(null);
    }

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
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );
      
      // Update firebase user profile displayName
      await updateProfile(userCredential.user, {
        displayName: name.trim(),
      });

      // Synchronize dispatch update
      dispatch(
        setUser({
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: name.trim(),
          photoURL: userCredential.user.photoURL,
        }),
      );

      Toast.show({
        type: 'success',
        text1: 'Account Created',
        text2: 'Welcome to ShopApp!',
      });
    } catch (err: any) {
      const message = err.message || 'Registration failed. Please try again.';
      dispatch(setError(message));
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: message,
      });
    } finally {
      setIsLoadingState(false);
      dispatch(setLoading(false));
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, {backgroundColor: colors.background}]}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text
            style={[
              styles.logoText,
              {color: colors.primary, fontSize: 32, fontWeight: fontWeights.bold},
            ]}>
            Create Account
          </Text>
          <Text
            style={[
              styles.tagline,
              {color: colors.textSecondary, fontSize: fontSizes.md},
            ]}>
            Sign up to start shopping on ShopApp
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Full Name"
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
            error={nameError}
            autoCapitalize="words"
          />

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
            placeholder="Choose a password"
            value={password}
            onChangeText={setPassword}
            error={passwordError}
            secureTextEntry
            autoCapitalize="none"
          />

          <Button
            title="Sign Up"
            onPress={handleRegister}
            loading={isLoadingState}
            style={styles.registerBtn}
          />

          <View style={styles.footer}>
            <Text style={{color: colors.textSecondary, fontSize: fontSizes.md}}>
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