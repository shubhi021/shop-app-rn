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
  Dimensions,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useProducts } from '../../hooks/useProducts';
import ProductCard from '../../components/product/ProductCard';

const { width } = Dimensions.get('window');

const BANNERS = [
  {
    id: 1,
    title: 'Summer Sale',
    subtitle: 'Up to 50% Off on all categories',
    tag: 'LIMITED TIME',
    code: 'SUMMER50',
    backgroundColor: '#6366F1',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: 2,
    title: 'New Arrivals',
    subtitle: 'Explore the latest fashion styles',
    tag: 'TRENDING',
    code: 'NEWSTYLE',
    backgroundColor: '#06B6D4',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=500&auto=format&fit=crop&q=60',
  },
];

const CATEGORIES = ['All', 'Electronics', 'Jewelery', "Men's Clothing", "Women's Clothing"];

// Custom pulsing skeleton item
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

  const cardWidth = (width - 40) / 2;

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

  const renderHeader = () => {
    return (
      <View>
        {/* Mock Search Input Header */}
        <TouchableOpacity
          style={[styles.searchBarMock, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => navigation.navigate('Search')}
          activeOpacity={0.9}
        >
          <Text style={styles.searchIcon}>🔍</Text>
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
                    <Text style={styles.tagText}>{item.tag}</Text>
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
                (index - 1) * width,
                index * width,
                (index + 1) * width,
              ];
              const dotWidth = bannerScrollX.interpolate({
                inputRange,
                outputRange: [8, 16, 8],
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
      
      {/* App Logo Header */}
      <View style={styles.header}>
        <Text style={[styles.logo, { color: colors.primary, fontFamily: fonts.bold }]}>
          ShopApp
        </Text>
        <Text style={[styles.tagline, { color: colors.textSecondary, fontFamily: fonts.medium }]}>
          Explore premium items
        </Text>
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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  logo: {
    fontSize: 24,
  },
  tagline: {
    fontSize: 12,
    marginTop: 2,
  },
  searchBarMock: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
    height: 48,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  searchTextMock: {
    fontSize: 14,
  },
  carouselContainer: {
    height: 180,
    marginBottom: 16,
    position: 'relative',
  },
  bannerCard: {
    width: width - 32,
    marginHorizontal: 16,
    height: 180,
    borderRadius: 18,
    flexDirection: 'row',
    overflow: 'hidden',
    position: 'relative',
  },
  bannerInfo: {
    flex: 1.2,
    padding: 20,
    justifyContent: 'center',
    zIndex: 2,
  },
  tagBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    marginBottom: 4,
  },
  bannerSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    marginBottom: 10,
  },
  bannerPromoCode: {
    color: '#FFFFFF',
    fontSize: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  bannerImage: {
    flex: 0.8,
    height: '100%',
    opacity: 0.9,
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    letterSpacing: 0.2,
  },
  categoriesScroll: {
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  categoryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  categoryBtnText: {
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 24,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  skeletonCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  skeletonImage: {
    height: 160,
    width: '100%',
  },
  skeletonInfo: {
    padding: 12,
  },
  skeletonTextShort: {
    height: 10,
    width: '40%',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonTextLong: {
    height: 12,
    width: '90%',
    borderRadius: 4,
    marginBottom: 12,
  },
  skeletonBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  skeletonTextPrice: {
    height: 14,
    width: '50%',
    borderRadius: 4,
  },
  skeletonBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
});