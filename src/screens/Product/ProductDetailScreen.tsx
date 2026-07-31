import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Animated,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../hooks/useTheme';
import { ProductService } from '../../services/api';
import { Product } from '../../types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addToCart, updateQuantity } from '../../store/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../../store/slices/wishlistSlice';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from '../../hooks/useTranslation';
import { EcoScoreBadge } from '../../components/EcoScoreBadge';
import Button from '../../components/common/Button';
import { hp, wp, fp, SCREEN_WIDTH } from '../../theme/dimensions';

export default function ProductDetailScreen({ route, navigation }: any) {
  const { productId } = route.params;
  const { colors, fonts, fontSizes, fontWeights, isDark } = useTheme();
  const { t, formatCurrency } = useTranslation();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const wishlistItems = useAppSelector((state) => state.wishlist.items);
  const isWishlisted = wishlistItems.some((item) => item.product.id === productId);

  const scrollY = useRef(new Animated.Value(0)).current;

  // Header background opacity animation
  const headerBgOpacity = scrollY.interpolate({
    inputRange: [hp(18), hp(30)],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // Header title opacity animation
  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [hp(24), hp(30)],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // Hero image scale parallax animation on pull down
  const imageScale = scrollY.interpolate({
    inputRange: [-hp(42), 0],
    outputRange: [1.25, 1],
    extrapolate: 'clamp',
  });

  // Hero image translate parallax animation only on pull down
  const imageTranslateY = scrollY.interpolate({
    inputRange: [-hp(42), 0],
    outputRange: [-hp(21), 0],
    extrapolateRight: 'clamp',
  });

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await ProductService.getProductById(productId);
        setProduct(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleWishlistToggle = () => {
    if (!product) return;
    if (isWishlisted) {
      dispatch(removeFromWishlist(product.id));
      Toast.show({
        type: 'info',
        text1: 'Removed from Wishlist',
        text2: `${product.title.substring(0, 20)}... removed.`,
      });
    } else {
      dispatch(addToWishlist(product));
      Toast.show({
        type: 'success',
        text1: 'Added to Wishlist',
        text2: `${product.title.substring(0, 20)}... added!`,
      });
    }
  };

  const handleIncrement = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    dispatch(addToCart(product));
    if (quantity > 1) {
      dispatch(
        updateQuantity({
          productId: product.id,
          quantity: quantity,
        })
      );
    }
    Toast.show({
      type: 'success',
      text1: 'Added to Cart',
      text2: `${quantity} x ${product.title.substring(0, 20)}... added!`,
    });
  };

  const handleBuyNow = () => {
    if (!product) return;
    dispatch(addToCart(product));
    if (quantity > 1) {
      dispatch(
        updateQuantity({
          productId: product.id,
          quantity: quantity,
        })
      );
    }
    navigation.navigate('Checkout');
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary, fontFamily: fonts.medium }]}>
          Loading details...
        </Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="warning-outline" size={48} color="#F59E0B" style={styles.errorIcon} />
        <Text style={[styles.errorText, { color: colors.text, fontFamily: fonts.bold }]}>
          Error Loading Product
        </Text>
        <Text style={[styles.errorSub, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
          {error || 'Product not found.'}
        </Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} style={styles.backBtn} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* Solid Header Bar */}
      <View
        style={[
          styles.headerBar,
          {
            backgroundColor: colors.background,
            paddingTop: insets.top,
            height: hp(7.5) + insets.top,
            borderBottomColor: colors.border,
            borderBottomWidth: 1,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>

        <Animated.Text
          style={[
            styles.headerTitle,
            {
              color: colors.text,
              fontFamily: fonts.bold,
              opacity: headerTitleOpacity,
            },
          ]}
          numberOfLines={1}
        >
          {product.title}
        </Animated.Text>

        <TouchableOpacity
          style={styles.headerBtn}
          onPress={handleWishlistToggle}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isWishlisted ? 'heart' : 'heart-outline'}
            size={22}
            color={isWishlisted ? '#EF4444' : colors.text}
          />
        </TouchableOpacity>
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: hp(7.5) + insets.top,
            paddingBottom: hp(15) + insets.bottom,
          },
        ]}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        {/* Full-bleed Hero Image Container */}
        <View
          style={[
            styles.heroImageContainer,
            {
              backgroundColor: '#FFFFFF',
            },
          ]}
        >
          <Animated.Image
            source={{ uri: product.image }}
            style={[
              styles.heroImage,
              {
                transform: [
                  { scale: imageScale },
                  { translateY: imageTranslateY },
                ],
              },
            ]}
            resizeMode="contain"
          />
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.categoryRow}>
            <Text style={[styles.category, { color: colors.primary, fontFamily: fonts.bold }]}>
              {product.category.toUpperCase()}
            </Text>
            {product.rating.rate >= 4.0 && (
              <View style={[styles.bestSellerBadge, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="ribbon-outline" size={12} color={colors.primary} />
                <Text style={[styles.bestSellerText, { color: colors.primary, fontFamily: fonts.semiBold }]}>
                  {t('bestSeller') || 'Best Choice'}
                </Text>
              </View>
            )}
          </View>

          <Text style={[styles.title, { color: colors.text, fontFamily: fonts.bold }]}>
            {product.title}
          </Text>

          {/* Rating Block */}
          <View style={styles.ratingRowContainer}>
            <View style={[styles.ratingPill, { backgroundColor: colors.warning + '18' }]}>
              <Ionicons name="star" size={14} color={colors.warning} />
              <Text style={[styles.ratingScoreText, { color: colors.text, fontFamily: fonts.bold }]}>
                {product.rating.rate.toFixed(1)}
              </Text>
            </View>
            <View style={[styles.badgeLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.ratingCount, { color: colors.textSecondary, fontFamily: fonts.medium }]}>
              {product.rating.count} {t('reviewsCount') || 'Reviews'}
            </Text>
          </View>

          {/* Price Block */}
          <View style={styles.priceRowContainer}>
            <View>
              <Text style={[styles.priceLabel, { color: colors.textTertiary, fontFamily: fonts.medium }]}>
                {t('price') || 'Price'}
              </Text>
              <View style={styles.priceRow}>
                <Text style={[styles.price, { color: colors.primary, fontFamily: fonts.bold }]}>
                  {formatCurrency(product.price)}
                </Text>
                <Text style={[styles.taxLabel, { color: colors.textTertiary, fontFamily: fonts.regular }]}>
                  ({t('vatIncluded')})
                </Text>
              </View>
            </View>

            {/* Eco Score Badge */}
            <View style={styles.ecoScoreWrapper}>
              <EcoScoreBadge
                score={product.ecoScore || (product.id % 2 === 0 ? 'A' : 'B')}
                co2Grams={product.co2Grams || Math.round(product.price * 25)}
                hasPfand={product.hasPfand || product.category?.includes('beverage')}
                size="medium"
              />
            </View>
          </View>

          <View style={[styles.sectionDivider, { backgroundColor: colors.border }]} />

          {/* Highlights Row */}
          <View style={styles.highlightsContainer}>
            <View style={[styles.highlightCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="cube-outline" size={20} color={colors.primary} />
              <Text style={[styles.highlightTitle, { color: colors.text, fontFamily: fonts.semiBold }]}>
                {t('freeShippingLabel') || 'Free Shipping'}
              </Text>
              <Text style={[styles.highlightSubtitle, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
                {t('freeShippingDesc') || 'On orders over €39'}
              </Text>
            </View>
            <View style={[styles.highlightCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
              <Text style={[styles.highlightTitle, { color: colors.text, fontFamily: fonts.semiBold }]}>
                {t('secureCheckout') || 'Secure Pay'}
              </Text>
              <Text style={[styles.highlightSubtitle, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
                {t('sslEncrypted') || '100% Secure'}
              </Text>
            </View>
            <View style={[styles.highlightCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="refresh-circle-outline" size={20} color={colors.primary} />
              <Text style={[styles.highlightTitle, { color: colors.text, fontFamily: fonts.semiBold }]}>
                {t('easyReturns') || 'Easy Returns'}
              </Text>
              <Text style={[styles.highlightSubtitle, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
                {t('returnWindow') || '30-Day Window'}
              </Text>
            </View>
          </View>

          <View style={[styles.sectionDivider, { backgroundColor: colors.border }]} />

          {/* Description Section */}
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fonts.semiBold }]}>
            {t('description') || 'Description'}
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
            {product.description}
          </Text>

          <View style={[styles.sectionDivider, { backgroundColor: colors.border }]} />

          {/* Quantity Selector Section */}
          <View style={styles.quantityContainer}>
            <View>
              <Text style={[styles.quantityLabel, { color: colors.text, fontFamily: fonts.semiBold }]}>
                {t('quantity') || 'Quantity'}
              </Text>
              <Text style={[styles.quantitySub, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
                {t('selectDesiredQty') || 'Select desired amount'}
              </Text>
            </View>
            <View style={[styles.quantitySelector, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TouchableOpacity
                onPress={handleDecrement}
                style={[styles.qtyBtn, { backgroundColor: isDark ? colors.border : '#F1F5F9' }]}
                activeOpacity={0.7}
              >
                <Ionicons name="remove" size={16} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.qtyText, { color: colors.text, fontFamily: fonts.bold }]}>
                {quantity}
              </Text>
              <TouchableOpacity
                onPress={handleIncrement}
                style={[styles.qtyBtn, { backgroundColor: isDark ? colors.border : '#F1F5F9' }]}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={16} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.ScrollView>

      {/* Anchored Bottom Actions */}
      <View
        style={[
          styles.bottomBarActions,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            paddingTop: hp(1.5),
            paddingBottom: Platform.OS === 'ios' ? Math.max(insets.bottom, hp(1.5)) : hp(2.0),
          },
        ]}
      >
        <Button
          title={t('addToCart') || 'Add to Cart'}
          onPress={handleAddToCart}
          variant="outline"
          style={styles.actionBtnOutline}
          textStyle={{ fontSize: fp(3.73) }}
        />
        <Button
          title={t('buyNow') || 'Buy Now'}
          onPress={handleBuyNow}
          style={styles.actionBtnSolid}
          textStyle={{ fontSize: fp(3.73) }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4.27),
  },
  headerBtn: {
    width: wp(10.67),
    height: wp(10.67),
    borderRadius: wp(5.33),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: fp(4.27),
    marginHorizontal: wp(3.2),
  },
  scrollContent: {
    // paddingBottom set dynamically based on safe area insets
  },
  heroImageContainer: {
    width: SCREEN_WIDTH,
    height: hp(42),
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: hp(2.0),
    paddingHorizontal: wp(8.0),
    borderBottomLeftRadius: wp(8.0),
    borderBottomRightRadius: wp(8.0),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    overflow: 'hidden', // Clips parallax scaling/translation to keep it within the hero card
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  infoSection: {
    paddingHorizontal: wp(5.33),
    paddingTop: hp(2.5),
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1.0),
  },
  category: {
    fontSize: fp(3.2),
    letterSpacing: 1,
  },
  bestSellerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1.0),
    paddingHorizontal: wp(2.0),
    paddingVertical: hp(0.4),
    borderRadius: wp(1.5),
  },
  bestSellerText: {
    fontSize: fp(2.93),
  },
  title: {
    fontSize: fp(5.33),
    lineHeight: hp(3.45),
    marginBottom: hp(1.5),
  },
  ratingRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(2.0),
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1.0),
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.5),
    borderRadius: wp(2.0),
  },
  ratingScoreText: {
    fontSize: fp(3.47),
  },
  badgeLine: {
    width: 1,
    height: hp(1.72),
    marginHorizontal: wp(3.2),
  },
  ratingCount: {
    fontSize: fp(3.47),
  },
  priceRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp(1.5),
  },
  priceLabel: {
    fontSize: fp(3.2),
    marginBottom: hp(0.2),
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: fp(6.4),
  },
  taxLabel: {
    fontSize: fp(3.2),
    marginLeft: wp(2.13),
  },
  ecoScoreWrapper: {
    alignItems: 'flex-end',
  },
  sectionDivider: {
    height: 1,
    width: '100%',
    marginVertical: hp(2.0),
  },
  highlightsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: wp(2.0),
  },
  highlightCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(2.0),
    borderRadius: wp(3.0),
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  highlightTitle: {
    fontSize: fp(3.2),
    marginTop: hp(0.8),
    textAlign: 'center',
  },
  highlightSubtitle: {
    fontSize: fp(2.67),
    marginTop: hp(0.2),
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: fp(4.53),
    marginBottom: hp(1.0),
  },
  description: {
    fontSize: fp(3.73),
    lineHeight: hp(2.7),
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: hp(2.0),
  },
  quantityLabel: {
    fontSize: fp(4.53),
  },
  quantitySub: {
    fontSize: fp(2.93),
    marginTop: hp(0.2),
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: wp(5.0),
    height: hp(5.2),
    width: wp(34.0),
    paddingHorizontal: wp(1.2),
    justifyContent: 'space-between',
  },
  qtyBtn: {
    width: wp(8.53),
    height: wp(8.53),
    borderRadius: wp(4.27),
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: fp(4.0),
    textAlign: 'center',
    minWidth: wp(8.0),
  },
  bottomBarActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: wp(5.33),
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 8,
  },
  actionBtnOutline: {
    flex: 0.48,
    borderRadius: wp(4.5),
  },
  actionBtnSolid: {
    flex: 0.48,
    borderRadius: wp(4.5),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: hp(1.5),
    fontSize: fp(3.73),
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(8.53),
  },
  errorIcon: {
    marginBottom: hp(1.5),
  },
  errorText: {
    fontSize: fp(4.8),
    marginBottom: hp(1.0),
  },
  errorSub: {
    fontSize: fp(3.73),
    textAlign: 'center',
    marginBottom: hp(2.96),
  },
  backBtn: {
    width: wp(42.67),
  },
});