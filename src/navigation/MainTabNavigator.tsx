import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { MainTabParamList } from '../types';
import { useTheme } from '../hooks/useTheme';
import { useTranslation } from '../hooks/useTranslation';
import { useAppSelector } from '../store/hooks';
import HomeScreen from '../screens/Home/HomeScreen';
import SearchScreen from '../screens/Home/SearchScreen';
import CartScreen from '../screens/Cart/CartScreen';
import WishlistScreen from '../screens/Wishlist/WishlistScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

interface TabIconProps {
  name: string;
  focusedName: string;
  fallbackGlyph: string;
  focused: boolean;
  color: string;
  badge?: number;
}

const TabIcon: React.FC<TabIconProps> = ({
  name,
  focusedName,
  fallbackGlyph,
  focused,
  color,
  badge,
}) => {
  const [hasFontError, setHasFontError] = useState(false);

  return (
    <View style={styles.iconContainer}>
      {!hasFontError ? (
        <Ionicons
          name={focused ? focusedName : name}
          size={24}
          color={color}
          onError={() => setHasFontError(true)}
        />
      ) : (
        <Text style={[styles.fallbackText, { color, opacity: focused ? 1 : 0.6 }]}>
          {fallbackGlyph}
        </Text>
      )}
      {badge && badge > 0 ? (
        <View style={[styles.badge, { backgroundColor: '#EF4444' }]}>
          <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
        </View>
      ) : null}
    </View>
  );
};

export default function MainTabNavigator() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const cartItems = useAppSelector(state => state.cart.items);
  const wishlistItems = useAppSelector(state => state.wishlist.items);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
          paddingBottom: 8,
          paddingTop: 8,
          height: 62,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: t('home'),
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name="home-outline"
              focusedName="home"
              fallbackGlyph="🏠"
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: t('search'),
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name="search-outline"
              focusedName="search"
              fallbackGlyph="🔍"
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarLabel: t('cart'),
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name="bag-handle-outline"
              focusedName="bag-handle"
              fallbackGlyph="🛍️"
              focused={focused}
              color={color}
              badge={cartCount}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Wishlist"
        component={WishlistScreen}
        options={{
          tabBarLabel: t('wishlist'),
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name="heart-outline"
              focusedName="heart"
              fallbackGlyph="❤️"
              focused={focused}
              color={color}
              badge={wishlistItems.length}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: t('profile'),
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name="person-outline"
              focusedName="person"
              fallbackGlyph="👤"
              focused={focused}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 28,
  },
  fallbackText: {
    fontSize: 20,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
});