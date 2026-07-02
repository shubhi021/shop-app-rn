import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {View, Text, StyleSheet} from 'react-native';
import {MainTabParamList} from '../types';
import {useTheme} from '../hooks/useTheme';
import {useAppSelector} from '../store/hooks';
import HomeScreen from '../screens/Home/HomeScreen';
import SearchScreen from '../screens/Home/SearchScreen';
import CartScreen from '../screens/Cart/CartScreen';
import WishlistScreen from '../screens/Wishlist/WishlistScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';


const Tab = createBottomTabNavigator<MainTabParamList>();

const TabIcon = ({
  icon,
  focused,
  color,
  badge,
}: {
  icon: string;
  focused: boolean;
  color: string;
  badge?: number;
}) => (
  <View style={styles.iconContainer}>
    <Text style={[styles.icon, {opacity: focused ? 1 : 0.5}]}>{icon}</Text>
    {badge && badge > 0 ? (
      <View style={[styles.badge, {backgroundColor: color}]}>
        <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
      </View>
    ) : null}
  </View>
);

export default function MainTabNavigator() {
  const {colors, isDark} = useTheme();

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
          height: 60,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 2,
        },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({focused, color}) => (
            <TabIcon icon="🏠" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: 'Search',
          tabBarIcon: ({focused, color}) => (
            <TabIcon icon="🔍" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarLabel: 'Cart',
          tabBarIcon: ({focused, color}) => (
            <TabIcon
              icon="🛒"
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
          tabBarLabel: 'Wishlist',
          tabBarIcon: ({focused, color}) => (
            <TabIcon
              icon="❤️"
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
          tabBarLabel: 'Profile',
          tabBarIcon: ({focused, color}) => (
            <TabIcon icon="👤" focused={focused} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconContainer: {position: 'relative', alignItems: 'center'},
  icon: {fontSize: 22},
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {color: '#fff', fontSize: 9, fontWeight: '700'},
});