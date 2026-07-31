import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../hooks/useTheme';
import { useProducts } from '../../hooks/useProducts';
import { useAppSelector } from '../../store/hooks';
import ProductCard from '../../components/product/ProductCard';
import { hp, wp, fp, SCREEN_WIDTH } from '../../theme/dimensions';

const BANNERS = [
  {
    id: 1,
    title: 'Minimalist Tech',
    subtitle: 'Selected items from premium DACH designers',
    tag: 'NEW ARRIVALS',
    code: 'TECHMIN',
    backgroundColor: '#0F172A',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
  },
  {
    id: 2,
    title: 'Go Green Impact',
    subtitle: 'Offset your carbon footprint with every order',
    tag: 'SUSTAINABILITY',
    code: 'GOGREEN',
    backgroundColor: '#064E3B',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
  },
  {
    id: 3,
    title: 'Premium Member',
    subtitle: 'Free delivery and priority packaging',
    tag: 'MEMBER EXCLUSIVE',
    code: 'MEMBERVIP',
    backgroundColor: '#78350F',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=500&auto=format&fit=crop&q=60',
  },
];

const CATEGORIES = ['All', 'Electronics', 'Jewelery', "Men's Clothing", "Women's Clothing"];

const SkeletonProduct = () => {
  const { colors } = useTheme();
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const cardWidth = wp(44.5);

  return (
    <View style={[styles.skeletonCard, { width: cardWidth, backgroundColor: colors.card, borderColor: colors.border }]}>
      <Animated.View style={[styles.skeletonImage, { backgroundColor: colors.border, opacity: pulseAnim }]} />
      <View style={styles.skeletonInfo}>
        <Animated.View style={[styles.skeletonTextShort, { backgroundColor: colors.border, opacity: pulseAnim }]} />
        <Animated.View style={[styles.skeletonTextLong, { backgroundColor: colors.border, opacity: pulseAnim }]} />
        <View style={styles.skeletonBottom}>
          <Animated.View style={[styles.skeletonTextPrice, { backgroundColor: colors.border, opacity: pulseAnim }]} />
          <Animated.View style={[styles.skeletonBtn, { backgroundColor: colors.border, opacity: pulseAnim }]} />
        </View>
      </View>
    </View>
  );
};

export default function HomeScreen({ navigation }: any) {
  const { colors, fonts, fontSizes, fontWeights, isDark } = useTheme();
  const reduxUser = useAppSelector((state) => state.auth.user);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { products, loading, refreshProducts, refetchWithCategory } = useProducts(selectedCategory);

  const bannerScrollX = useRef(new Animated.Value(0)).current;

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    refetchWithCategory(category);
  };

  const handleRefresh = () => {
    refreshProducts(selectedCategory);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'All':
        return 'sparkles-outline';
      case 'Electronics':
        return 'hardware-chip-outline';
      case 'Jewelery':
        return 'rose-outline';
      case "Men's Clothing":
        return 'shirt-outline';
      case "Women's Clothing":
        return 'shirt-outline';
      default:
        return 'apps-outline';
    }
  };

  const renderHeader = () => {
    return (
      <View>
        {/* GoGreen Impact Tracker Banner */}
        <View style={[styles.ecoTrackerCard, { backgroundColor: colors.primary + '08', borderColor: colors.primary + '20' }]}>
          <Ionicons name="leaf-outline" size={18} color={colors.primary} />
          <Text style={[styles.ecoTrackerText, { color: colors.text, fontFamily: fonts.semiBold }]}>
            Dein GoGreen Impact: <Text style={{ color: colors.primary, fontFamily: fonts.bold }}>2.4 kg CO2</Text> gespart 🌱
          </Text>
        </View>

        {/* Mock Search Input Header */}
        <TouchableOpacity
          style={[styles.searchBarMock, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => navigation.navigate('Search')}
          activeOpacity={0.9}
        >
          <Ionicons name="search-outline" size={18} color={colors.textSecondary} style={styles.searchIcon} />
          <Text style={[styles.searchTextMock, { color: colors.textTertiary, fontFamily: fonts.regular }]}>
            Search premium items, styles...
          </Text>
        </TouchableOpacity>

        {/* Banners Carousel */}
        <View style={styles.carouselContainer}>
          <FlatList
            data={BANNERS}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: bannerScrollX } } }],
              { useNativeDriver: false }
            )}
            renderItem={({ item }) => (
              <View style={[styles.bannerCard, { backgroundColor: item.backgroundColor }]}>
                <View style={styles.bannerInfo}>
                  <View style={styles.tagBadge}>
                    <Text style={[styles.tagText, { fontFamily: fonts.bold }]}>{item.tag}</Text>
                  </View>
                  <Text style={[styles.bannerTitle, { fontFamily: fonts.bold }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.bannerSubtitle, { fontFamily: fonts.medium }]}>
                    {item.subtitle}
                  </Text>
                  <Text style={[styles.bannerPromoCode, { fontFamily: fonts.semiBold }]}>
                    Code: {item.code}
                  </Text>
                </View>
                <Image source={{ uri: item.image }} style={styles.bannerImage} />
              </View>
            )}
          />
          {/* Indicator dots */}
          <View style={styles.indicatorContainer}>
            {BANNERS.map((_, index) => {
              const inputRange = [
                (index - 1) * (SCREEN_WIDTH - wp(8.53)),
                index * (SCREEN_WIDTH - wp(8.53)),
                (index + 1) * (SCREEN_WIDTH - wp(8.53)),
              ];
              const dotWidth = bannerScrollX.interpolate({
                inputRange,
                outputRange: [wp(2.13), wp(4.27), wp(2.13)],
                extrapolate: 'clamp',
              });
              const opacity = bannerScrollX.interpolate({
                inputRange,
                outputRange: [0.3, 1, 0.3],
                extrapolate: 'clamp',
              });
              return (
                <Animated.View
                  key={index}
                  style={[
                    styles.dot,
                    {
                      width: dotWidth,
                      opacity,
                      backgroundColor: '#FFFFFF',
                    },
                  ]}
                />
              );
            })}
          </View>
        </View>

        {/* Categories Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fonts.bold, fontSize: fontSizes.lg }]}>
            Categories
          </Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryBtn,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => handleCategorySelect(category)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={getCategoryIcon(category)}
                  size={14}
                  color={isSelected ? '#FFFFFF' : colors.textSecondary}
                  style={{ marginRight: wp(1.6) }}
                />
                <Text
                  style={[
                    styles.categoryBtnText,
                    {
                      color: isSelected ? '#FFFFFF' : colors.text,
                      fontFamily: isSelected ? fonts.bold : fonts.medium,
                      fontSize: fontSizes.sm,
                    },
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Products Title */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fonts.bold, fontSize: fontSizes.lg }]}>
            Trending Now
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      {/* App Logo & Greeting Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary, fontFamily: fonts.medium }]}>
              {reduxUser?.displayName ? `Hallo, ${reduxUser.displayName.split(' ')[0]}` : 'Hallo, Guten Tag'}
            </Text>
            <Text style={[styles.logo, { color: colors.primary, fontFamily: fonts.bold }]}>
              ShopApp
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.notificationBtn, { borderColor: colors.border }]}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={20} color={colors.text} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>
      </View>

      {loading && products.length === 0 ? (
        <View style={styles.loadingContainer}>
          {renderHeader()}
          <View style={styles.skeletonGrid}>
            <SkeletonProduct />
            <SkeletonProduct />
            <SkeletonProduct />
            <SkeletonProduct />
          </View>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderHeader}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: wp(4.27),
    paddingTop: hp(1.5),
    paddingBottom: hp(1.0),
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greeting: {
    fontSize: fp(3.2),
    marginBottom: hp(0.25),
  },
  logo: {
    fontSize: fp(6.4),
  },
  notificationBtn: {
    width: wp(10.67),
    height: wp(10.67),
    borderRadius: wp(5.33),
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: hp(1.0),
    right: wp(2.67),
    width: wp(2.13),
    height: wp(2.13),
    borderRadius: wp(1.07),
    backgroundColor: '#EF4444',
  },
  ecoTrackerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: wp(4.27),
    marginTop: hp(1.0),
    marginBottom: hp(1.0),
    paddingVertical: hp(1.23),
    paddingHorizontal: wp(3.73),
    borderRadius: wp(3.2),
    borderWidth: 1,
  },
  ecoTrackerText: {
    fontSize: fp(3.2),
    marginLeft: wp(2.13),
  },
  searchBarMock: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: wp(4.27),
    marginTop: hp(1.0),
    marginBottom: hp(2.0),
    height: hp(5.9),
    borderWidth: 1,
    borderRadius: wp(3.73),
    paddingHorizontal: wp(4.27),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  searchIcon: {
    marginRight: wp(2.13),
  },
  searchTextMock: {
    fontSize: fp(3.73),
    flex: 1,
  },
  carouselContainer: {
    height: hp(22.16),
    marginBottom: hp(2.0),
    position: 'relative',
  },
  bannerCard: {
    width: SCREEN_WIDTH - wp(8.53),
    marginHorizontal: wp(4.27),
    height: hp(22.16),
    borderRadius: wp(4.8),
    flexDirection: 'row',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  bannerInfo: {
    flex: 1.25,
    padding: wp(5.33),
    justifyContent: 'center',
    zIndex: 2,
  },
  tagBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: wp(2.13),
    paddingVertical: hp(0.5),
    borderRadius: wp(2.13),
    alignSelf: 'flex-start',
    marginBottom: hp(1.0),
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: fp(2.4),
    letterSpacing: 0.5,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: fp(5.33),
    marginBottom: hp(0.5),
    lineHeight: hp(3.45),
  },
  bannerSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: fp(3.2),
    marginBottom: hp(1.23),
    lineHeight: hp(2.2),
  },
  bannerPromoCode: {
    color: '#FFFFFF',
    fontSize: fp(2.93),
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingHorizontal: wp(2.67),
    paddingVertical: hp(0.62),
    borderRadius: wp(1.6),
    alignSelf: 'flex-start',
  },
  bannerImage: {
    flex: 0.75,
    height: '100%',
    opacity: 0.9,
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: hp(1.5),
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    height: hp(1.0),
    borderRadius: wp(1.07),
    marginHorizontal: wp(1.07),
  },
  sectionHeader: {
    paddingHorizontal: wp(4.27),
    marginBottom: hp(1.5),
    marginTop: hp(1.0),
  },
  sectionTitle: {
    letterSpacing: 0.2,
  },
  categoriesScroll: {
    paddingHorizontal: wp(3.2),
    marginBottom: hp(2.46),
  },
  categoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4.27),
    paddingVertical: hp(1.23),
    borderRadius: wp(4.27),
    borderWidth: 1,
    marginHorizontal: wp(1.07),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  categoryBtnText: {
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: hp(11.0),
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: wp(4.27),
  },
  loadingContainer: {
    flex: 1,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4.27),
  },
  skeletonCard: {
    borderRadius: wp(4.27),
    borderWidth: 1,
    marginBottom: hp(2.0),
    overflow: 'hidden',
  },
  skeletonImage: {
    height: hp(19.7),
    width: '100%',
  },
  skeletonInfo: {
    padding: wp(3.2),
  },
  skeletonTextShort: {
    height: hp(1.23),
    width: '40%',
    borderRadius: wp(1.07),
    marginBottom: hp(1.0),
  },
  skeletonTextLong: {
    height: hp(1.48),
    width: '90%',
    borderRadius: wp(1.07),
    marginBottom: hp(1.5),
  },
  skeletonBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: hp(0.5),
  },
  skeletonTextPrice: {
    height: hp(1.72),
    width: '50%',
    borderRadius: wp(1.07),
  },
  skeletonBtn: {
    width: wp(6.4),
    height: wp(6.4),
    borderRadius: wp(3.2),
  },
});