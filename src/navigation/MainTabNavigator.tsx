import React, { useState, useEffect, useRef } from 'react';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
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
import { hp, wp, fp, SCREEN_WIDTH } from '../theme/dimensions';

const Tab = createBottomTabNavigator<MainTabParamList>();

interface TabButtonProps {
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  colors: any;
  fonts: any;
  label: string;
  badge?: number;
  iconName: string;
  focusedIconName: string;
  fallbackGlyph: string;
}

const TabButton: React.FC<TabButtonProps> = ({
  isFocused,
  onPress,
  onLongPress,
  colors,
  fonts,
  label,
  badge,
  iconName,
  focusedIconName,
  fallbackGlyph,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [hasFontError, setHasFontError] = useState(false);

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isFocused ? 1.15 : 1.0,
      useNativeDriver: true,
      friction: 6,
      tension: 60,
    }).start();
  }, [isFocused]);

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabButton}
      activeOpacity={0.8}
    >
      <Animated.View style={[styles.iconWrapper, { transform: [{ scale: scaleAnim }] }]}>
        {!hasFontError ? (
          <Ionicons
            name={isFocused ? focusedIconName : iconName}
            size={22}
            color={isFocused ? colors.primary : colors.textTertiary}
            onError={() => setHasFontError(true)}
          />
        ) : (
          <Text style={[styles.fallbackText, { color: isFocused ? colors.primary : colors.textTertiary }]}>
            {fallbackGlyph}
          </Text>
        )}
        {badge && badge > 0 ? (
          <View style={[styles.badge, { backgroundColor: '#EF4444' }]}>
            <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
          </View>
        ) : null}
      </Animated.View>
      <Animated.Text
        numberOfLines={1}
        style={[
          styles.tabLabel,
          {
            color: isFocused ? colors.primary : colors.textTertiary,
            fontFamily: isFocused ? fonts.bold : fonts.medium,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {label}
      </Animated.Text>
    </TouchableOpacity>
  );
};

const CustomTabBar = ({ state, descriptors, navigation, colors, fonts }: BottomTabBarProps & { colors: any; fonts: any }) => {
  const paddingHorizontal = wp(2.0);
  const marginHorizontal = wp(4.27);
  const availableWidth = SCREEN_WIDTH - marginHorizontal * 2 - paddingHorizontal * 2;
  const tabWidth = availableWidth / state.routes.length;

  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: state.index * tabWidth,
      useNativeDriver: true,
      friction: 8,
      tension: 50,
    }).start();
  }, [state.index, tabWidth]);

  const getTabConfig = (routeName: string) => {
    switch (routeName) {
      case 'Home':
        return { icon: 'home-outline', focusedIcon: 'home', glyph: '🏠' };
      case 'Search':
        return { icon: 'search-outline', focusedIcon: 'search', glyph: '🔍' };
      case 'Cart':
        return { icon: 'bag-handle-outline', focusedIcon: 'bag-handle', glyph: '🛍️' };
      case 'Wishlist':
        return { icon: 'heart-outline', focusedIcon: 'heart', glyph: '❤️' };
      case 'Profile':
        return { icon: 'person-outline', focusedIcon: 'person', glyph: '👤' };
      default:
        return { icon: 'cube-outline', focusedIcon: 'cube', glyph: '📦' };
    }
  };

  const cartItems = useAppSelector((state) => state.cart.items);
  const wishlistItems = useAppSelector((state) => state.wishlist.items);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const getBadgeCount = (routeName: string) => {
    if (routeName === 'Cart') return cartCount;
    if (routeName === 'Wishlist') return wishlistItems.length;
    return undefined;
  };

  return (
    <View style={[styles.tabBarContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Animated.View
        style={[
          styles.slidingIndicator,
          {
            width: tabWidth,
            left: paddingHorizontal,
            transform: [{ translateX: slideAnim }],
            backgroundColor: colors.primary + '12',
          },
        ]}
      />

      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const config = getTabConfig(route.name);
        const badge = getBadgeCount(route.name);

        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TabButton
            key={route.key}
            isFocused={isFocused}
            onPress={onPress}
            onLongPress={onLongPress}
            colors={colors}
            fonts={fonts}
            label={label as string}
            badge={badge}
            iconName={config.icon}
            focusedIconName={config.focusedIcon}
            fallbackGlyph={config.glyph}
          />
        );
      })}
    </View>
  );
};

export default function MainTabNavigator() {
  const { colors, fonts } = useTheme();
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} colors={colors} fonts={fonts} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: t('home'),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: t('search'),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarLabel: t('cart'),
        }}
      />
      <Tab.Screen
        name="Wishlist"
        component={WishlistScreen}
        options={{
          tabBarLabel: t('wishlist'),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: t('profile'),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    height: hp(8.5),
    borderRadius: wp(5.33),
    borderWidth: 1,
    marginHorizontal: wp(4.27),
    marginBottom: hp(2.0),
    marginTop: hp(0.5),
    paddingHorizontal: wp(2.0),
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  slidingIndicator: {
    position: 'absolute',
    height: hp(6.2),
    borderRadius: wp(4.0),
    zIndex: 0,
  },
  tabButton: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  iconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: wp(8.53),
    height: hp(3.45),
    marginBottom: hp(0.25),
  },
  tabLabel: {
    fontSize: fp(2.67),
    marginTop: hp(0.25),
  },
  fallbackText: {
    fontSize: fp(4.8),
  },
  badge: {
    position: 'absolute',
    top: -hp(0.5),
    right: -wp(2.13),
    minWidth: wp(4.27),
    height: wp(4.27),
    borderRadius: wp(2.13),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(1.07),
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: fp(2.2),
    fontWeight: '800',
  },
});