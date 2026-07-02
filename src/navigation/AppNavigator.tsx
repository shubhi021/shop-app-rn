import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setUser } from '../store/slices/authSlice';
import { setCart } from '../store/slices/cartSlice';
import { setWishlist } from '../store/slices/wishlistSlice';
import { useAppDispatch } from '../store/hooks';
import { RootStackParamList } from '../types';
import { useTheme } from '../hooks/useTheme';
import MainTabNavigator from './MainTabNavigator';
import ProductDetailScreen from '../screens/Product/ProductDetailScreen';
import CheckoutScreen from '../screens/Checkout/CheckoutScreen';
import OrderSuccessScreen from '../screens/Checkout/OrderSuccessScreen';
import AuthNavigator from './AuthNavigator';
import { auth } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const dispatch = useAppDispatch();
  const { colors } = useTheme();

  useEffect(() => {
    // Hydrate store from AsyncStorage on startup
    const hydrateStore = async () => {
      try {
        const storedCart = await AsyncStorage.getItem('shop_app_cart');
        if (storedCart) {
          dispatch(setCart(JSON.parse(storedCart)));
        }
        const storedWishlist = await AsyncStorage.getItem('shop_app_wishlist');
        if (storedWishlist) {
          dispatch(setWishlist(JSON.parse(storedWishlist)));
        }
      } catch (e) {
        console.error('Failed to load local storage state:', e);
      }
    };

    hydrateStore();

    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        dispatch(
          setUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
          }),
        );
        setIsAuthenticated(true);
      } else {
        dispatch(setUser(null));
        setIsAuthenticated(false);
      }

      setIsLoading(false);
    });

    return unsubscribe;
  }, [dispatch]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
        }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Group>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen
              name="ProductDetail"
              component={ProductDetailScreen}
              options={{ headerShown: true, title: '' }}
            />
            <Stack.Screen
              name="Checkout"
              component={CheckoutScreen}
              options={{ headerShown: true, title: 'Checkout' }}
            />
            <Stack.Screen
              name="OrderSuccess"
              component={OrderSuccessScreen}
              options={{ headerShown: false }}
            />
          </Stack.Group>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
