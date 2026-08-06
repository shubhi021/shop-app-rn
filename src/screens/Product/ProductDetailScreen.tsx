import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Animated,
  Platform,
  ScrollView,
  Share,
  FlatList,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import {useTheme} from '../../hooks/useTheme';
import {ProductService} from '../../services/api';
import {Product} from '../../types';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import {addToCart, updateQuantity} from '../../store/slices/cartSlice';
import {
  addToWishlist,
  removeFromWishlist,
} from '../../store/slices/wishlistSlice';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useTranslation} from '../../hooks/useTranslation';
import {EcoScoreBadge} from '../../components/EcoScoreBadge';
import Button from '../../components/common/Button';
import {hp, wp, fp, SCREEN_WIDTH} from '../../theme/dimensions';

// ─── Mock reviews ──────────────────────────────────────────────────────────────
const MOCK_REVIEWS = [
  {
    id: '1',
    author: 'Sarah M.',
    rating: 5,
    date: 'Jan 2025',
    comment:
      'Absolutely love it! Quality exceeded my expectations. Fast delivery and beautiful packaging.',
  },
  {
    id: '2',
    author: 'Thomas K.',
    rating: 4,
    date: 'Dec 2024',
    comment:
      'Great product for the price. Minor packaging issue but the item itself is perfect.',
  },
  {
    id: '3',
    author: 'Lena W.',
    rating: 5,
    date: 'Nov 2024',
    comment:
      'Bought this as a gift and everyone was impressed. Will definitely order again!',
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL'];
const COLOR_OPTIONS = [
  {label: 'Midnight', value: '#0F172A'},
  {label: 'Slate', value: '#475569'},
  {label: 'Sand', value: '#D4A574'},
  {label: 'Forest', value: '#166534'},
];

function StarRow({rating, count}: {rating: number; count: number}) {
  const {colors, fonts} = useTheme();
  // Build a star breakdown from the global rating
  const breakdown = [
    {stars: 5, pct: Math.min(1, (rating - 3.5) * 2)},
    {stars: 4, pct: 0.65},
    {stars: 3, pct: 0.2},
    {stars: 2, pct: 0.08},
    {stars: 1, pct: 0.04},
  ];
  return (
    <View style={srStyles.container}>
      {breakdown.map(row => (
        <View key={row.stars} style={srStyles.row}>
          <Text
            style={[
              srStyles.starNum,
              {color: colors.textSecondary, fontFamily: fonts.medium},
            ]}>
            {row.stars}
          </Text>
          <Ionicons name="star" size={10} color="#F59E0B" />
          <View style={[srStyles.barBg, {backgroundColor: colors.border}]}>
            <View
              style={[
                srStyles.barFill,
                {
                  backgroundColor: '#F59E0B',
                  width: `${Math.round(row.pct * 100)}%` as any,
                },
              ]}
            />
          </View>
          <Text
            style={[
              srStyles.pctText,
              {color: colors.textTertiary, fontFamily: fonts.regular},
            ]}>
            {Math.round(row.pct * 100)}%
          </Text>
        </View>
      ))}
    </View>
  );
}
const srStyles = StyleSheet.create({
  container: {width: '100%'},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(0.6),
    gap: wp(1.5),
  },
  starNum: {fontSize: fp(2.93), width: wp(3.5), textAlign: 'right'},
  barBg: {flex: 1, height: 5, borderRadius: 3, overflow: 'hidden'},
  barFill: {height: '100%', borderRadius: 3},
  pctText: {fontSize: fp(2.67), width: wp(9)},
});

// ─── Main component ────────────────────────────────────────────────────────────
export default function ProductDetailScreen({route, navigation}: any) {
  const {productId} = route.params;
  const {colors, fonts, fontSizes, fontWeights, isDark} = useTheme();
  const {t, formatCurrency} = useTranslation();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0].value);
  const [descExpanded, setDescExpanded] = useState(false);
  const [inStock] = useState(true);

  const wishlistItems = useAppSelector(state => state.wishlist.items);
  const isWishlisted = wishlistItems.some(
    item => item.product.id === productId,
  );

  const scrollY = useRef(new Animated.Value(0)).current;

  const headerBgOpacity = scrollY.interpolate({
    inputRange: [hp(18), hp(30)],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [hp(24), hp(30)],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const imageScale = scrollY.interpolate({
    inputRange: [-hp(42), 0],
    outputRange: [1.25, 1],
    extrapolate: 'clamp',
  });

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
        // Fetch related products
        try {
          const all = await ProductService.getProductsByCategory(data.category);
          setRelatedProducts(
            all.filter((p: Product) => p.id !== productId).slice(0, 6),
          );
        } catch {
          // ignore related products error
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleShare = useCallback(async () => {
    if (!product) {
      return;
    }
    try {
      await Share.share({
        title: product.title,
        message: `Check out "${product.title}" for ${formatCurrency(
          product.price,
        )} on ShopApp! 🛍️`,
      });
    } catch {
      // ignore
    }
  }, [product, formatCurrency]);

  const handleWishlistToggle = () => {
    if (!product) {
      return;
    }
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

  const handleAddToCart = () => {
    if (!product) {
      return;
    }
    dispatch(addToCart(product));
    if (quantity > 1) {
      dispatch(updateQuantity({productId: product.id, quantity}));
    }
    Toast.show({
      type: 'success',
      text1: 'Added to Cart',
      text2: `${quantity} × ${product.title.substring(0, 20)}... added!`,
    });
  };

  const handleBuyNow = () => {
    if (!product) {
      return;
    }
    dispatch(addToCart(product));
    if (quantity > 1) {
      dispatch(updateQuantity({productId: product.id, quantity}));
    }
    navigation.navigate('Checkout');
  };

  if (loading) {
    return (
      <View style={[styles.container, {backgroundColor: colors.background}]}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
          translucent
        />
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
          ]}>
          <View style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.border} />
          </View>
        </View>
        <View
          style={{
            width: SCREEN_WIDTH,
            height: hp(42),
            backgroundColor: colors.border,
            opacity: 0.3,
          }}
        />
        <View style={styles.infoSection}>
          <View
            style={{
              width: wp(30),
              height: hp(2.5),
              backgroundColor: colors.border,
              opacity: 0.3,
              marginBottom: hp(1.5),
              borderRadius: wp(1),
            }}
          />
          <View
            style={{
              width: wp(80),
              height: hp(4),
              backgroundColor: colors.border,
              opacity: 0.3,
              marginBottom: hp(2),
              borderRadius: wp(1),
            }}
          />
          <View
            style={{
              width: wp(40),
              height: hp(3),
              backgroundColor: colors.border,
              opacity: 0.3,
              marginBottom: hp(2),
              borderRadius: wp(1),
            }}
          />
          <View
            style={[styles.sectionDivider, {backgroundColor: colors.border}]}
          />
          <View
            style={{
              width: wp(20),
              height: hp(2.5),
              backgroundColor: colors.border,
              opacity: 0.3,
              marginBottom: hp(1.5),
              borderRadius: wp(1),
            }}
          />
          <View
            style={{
              width: '100%',
              height: hp(10),
              backgroundColor: colors.border,
              opacity: 0.3,
              borderRadius: wp(1),
            }}
          />
        </View>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View
        style={[styles.errorContainer, {backgroundColor: colors.background}]}>
        <Ionicons
          name="warning-outline"
          size={48}
          color="#F59E0B"
          style={styles.errorIcon}
        />
        <Text
          style={[
            styles.errorText,
            {color: colors.text, fontFamily: fonts.bold},
          ]}>
          Error Loading Product
        </Text>
        <Text
          style={[
            styles.errorSub,
            {color: colors.textSecondary, fontFamily: fonts.regular},
          ]}>
          {error || 'Product not found.'}
        </Text>
        <Button
          title="Go Back"
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        />
      </View>
    );
  }

  const totalPrice = product.price * quantity;
  const isClothing =
    product.category?.includes('clothing') ||
    product.category?.includes('women') ||
    product.category?.includes('men');

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* ── Header Bar ── */}
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
        ]}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}>
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
          numberOfLines={1}>
          {product.title}
        </Animated.Text>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={handleShare}
            activeOpacity={0.7}>
            <Ionicons
              name="share-social-outline"
              size={22}
              color={colors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={handleWishlistToggle}
            activeOpacity={0.7}>
            <Ionicons
              name={isWishlisted ? 'heart' : 'heart-outline'}
              size={22}
              color={isWishlisted ? '#EF4444' : colors.text}
            />
          </TouchableOpacity>
        </View>
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: hp(7.5) + insets.top,
            paddingBottom: hp(16) + insets.bottom,
          },
        ]}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollY}}}],
          {useNativeDriver: true},
        )}>
        {/* ── Hero Image ── */}
        <View style={[styles.heroImageContainer, {backgroundColor: '#FFFFFF'}]}>
          {/* In Stock Badge */}
          <View
            style={[
              styles.stockBadge,
              {backgroundColor: inStock ? '#DCFCE7' : '#FEE2E2'},
            ]}>
            <View
              style={[
                styles.stockDot,
                {backgroundColor: inStock ? '#16A34A' : '#DC2626'},
              ]}
            />
            <Text
              style={[
                styles.stockText,
                {
                  color: inStock ? '#16A34A' : '#DC2626',
                  fontFamily: fonts.semiBold,
                },
              ]}>
              {inStock ? 'In Stock' : 'Out of Stock'}
            </Text>
          </View>

          <Animated.Image
            source={{uri: product.image}}
            style={[
              styles.heroImage,
              {transform: [{scale: imageScale}, {translateY: imageTranslateY}]},
            ]}
            resizeMode="contain"
          />
        </View>

        {/* ── Info Section ── */}
        <View style={styles.infoSection}>
          {/* Category + Best Choice */}
          <View style={styles.categoryRow}>
            <Text
              style={[
                styles.category,
                {color: colors.primary, fontFamily: fonts.bold},
              ]}>
              {product.category.toUpperCase()}
            </Text>
            {product.rating.rate >= 4.0 && (
              <View
                style={[
                  styles.bestSellerBadge,
                  {backgroundColor: colors.primary + '15'},
                ]}>
                <Ionicons
                  name="ribbon-outline"
                  size={12}
                  color={colors.primary}
                />
                <Text
                  style={[
                    styles.bestSellerText,
                    {color: colors.primary, fontFamily: fonts.semiBold},
                  ]}>
                  {t('bestSeller') || 'Best Choice'}
                </Text>
              </View>
            )}
          </View>

          <Text
            style={[
              styles.title,
              {color: colors.text, fontFamily: fonts.bold},
            ]}>
            {product.title}
          </Text>

          {/* Rating Row */}
          <View style={styles.ratingRowContainer}>
            <View
              style={[
                styles.ratingPill,
                {backgroundColor: colors.warning + '18'},
              ]}>
              <Ionicons name="star" size={14} color={colors.warning} />
              <Text
                style={[
                  styles.ratingScoreText,
                  {color: colors.text, fontFamily: fonts.bold},
                ]}>
                {product.rating.rate.toFixed(1)}
              </Text>
            </View>
            <View
              style={[styles.badgeLine, {backgroundColor: colors.border}]}
            />
            <TouchableOpacity onPress={() => {}}>
              <Text
                style={[
                  styles.ratingCount,
                  {color: colors.primary, fontFamily: fonts.medium},
                ]}>
                {product.rating.count} Reviews ↓
              </Text>
            </TouchableOpacity>
          </View>

          {/* Price + Eco Score */}
          <View style={styles.priceRowContainer}>
            <View>
              <Text
                style={[
                  styles.priceLabel,
                  {color: colors.textTertiary, fontFamily: fonts.medium},
                ]}>
                {t('price') || 'Price'}
              </Text>
              <View style={styles.priceRow}>
                <Text
                  style={[
                    styles.price,
                    {color: colors.primary, fontFamily: fonts.bold},
                  ]}>
                  {formatCurrency(product.price)}
                </Text>
                <Text
                  style={[
                    styles.taxLabel,
                    {color: colors.textTertiary, fontFamily: fonts.regular},
                  ]}>
                  ({t('vatIncluded')})
                </Text>
              </View>
            </View>
            <View style={styles.ecoScoreWrapper}>
              <EcoScoreBadge
                score={product.ecoScore || (product.id % 2 === 0 ? 'A' : 'B')}
                co2Grams={product.co2Grams || Math.round(product.price * 25)}
                hasPfand={
                  product.hasPfand || product.category?.includes('beverage')
                }
                size="medium"
              />
            </View>
          </View>

          <View
            style={[styles.sectionDivider, {backgroundColor: colors.border}]}
          />

          {/* ── Size Selector (clothing only) ── */}
          {isClothing && (
            <>
              <View style={styles.selectorHeader}>
                <Text
                  style={[
                    styles.sectionTitle,
                    {color: colors.text, fontFamily: fonts.semiBold},
                  ]}>
                  Size
                </Text>
                <TouchableOpacity>
                  <Text
                    style={[
                      styles.sizeGuide,
                      {color: colors.primary, fontFamily: fonts.medium},
                    ]}>
                    Size Guide →
                  </Text>
                </TouchableOpacity>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipScrollRow}>
                {SIZE_OPTIONS.map(size => (
                  <TouchableOpacity
                    key={size}
                    onPress={() => setSelectedSize(size)}
                    style={[
                      styles.sizeChip,
                      {
                        borderColor:
                          selectedSize === size
                            ? colors.primary
                            : colors.border,
                        backgroundColor:
                          selectedSize === size ? colors.primary : colors.card,
                      },
                    ]}
                    activeOpacity={0.8}>
                    <Text
                      style={[
                        styles.sizeChipText,
                        {
                          color: selectedSize === size ? '#FFF' : colors.text,
                          fontFamily: fonts.semiBold,
                        },
                      ]}>
                      {size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Color Selector */}
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: colors.text,
                    fontFamily: fonts.semiBold,
                    marginBottom: hp(1.2),
                  },
                ]}>
                Color
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipScrollRow}>
                {COLOR_OPTIONS.map(col => (
                  <TouchableOpacity
                    key={col.value}
                    onPress={() => setSelectedColor(col.value)}
                    style={[
                      styles.colorChipOuter,
                      {
                        borderColor:
                          selectedColor === col.value
                            ? colors.primary
                            : 'transparent',
                      },
                    ]}
                    activeOpacity={0.8}>
                    <View
                      style={[styles.colorDot, {backgroundColor: col.value}]}
                    />
                    <Text
                      style={[
                        styles.colorLabel,
                        {
                          color: colors.textSecondary,
                          fontFamily: fonts.regular,
                        },
                      ]}>
                      {col.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View
                style={[
                  styles.sectionDivider,
                  {backgroundColor: colors.border},
                ]}
              />
            </>
          )}

          {/* ── Highlights ── */}
          <View style={styles.highlightsContainer}>
            <View
              style={[
                styles.highlightCard,
                {backgroundColor: colors.card, borderColor: colors.border},
              ]}>
              <Ionicons name="cube-outline" size={20} color={colors.primary} />
              <Text
                style={[
                  styles.highlightTitle,
                  {color: colors.text, fontFamily: fonts.semiBold},
                ]}>
                {t('freeShippingLabel') || 'Free Shipping'}
              </Text>
              <Text
                style={[
                  styles.highlightSubtitle,
                  {color: colors.textSecondary, fontFamily: fonts.regular},
                ]}>
                {t('freeShippingDesc') || 'On orders over €39'}
              </Text>
            </View>
            <View
              style={[
                styles.highlightCard,
                {backgroundColor: colors.card, borderColor: colors.border},
              ]}>
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color={colors.primary}
              />
              <Text
                style={[
                  styles.highlightTitle,
                  {color: colors.text, fontFamily: fonts.semiBold},
                ]}>
                {t('secureCheckout') || 'Secure Pay'}
              </Text>
              <Text
                style={[
                  styles.highlightSubtitle,
                  {color: colors.textSecondary, fontFamily: fonts.regular},
                ]}>
                {t('sslEncrypted') || '100% Secure'}
              </Text>
            </View>
            <View
              style={[
                styles.highlightCard,
                {backgroundColor: colors.card, borderColor: colors.border},
              ]}>
              <Ionicons
                name="refresh-circle-outline"
                size={20}
                color={colors.primary}
              />
              <Text
                style={[
                  styles.highlightTitle,
                  {color: colors.text, fontFamily: fonts.semiBold},
                ]}>
                {t('easyReturns') || 'Easy Returns'}
              </Text>
              <Text
                style={[
                  styles.highlightSubtitle,
                  {color: colors.textSecondary, fontFamily: fonts.regular},
                ]}>
                {t('returnWindow') || '30-Day Window'}
              </Text>
            </View>
          </View>

          <View
            style={[styles.sectionDivider, {backgroundColor: colors.border}]}
          />

          {/* ── Description ── */}
          <Text
            style={[
              styles.sectionTitle,
              {color: colors.text, fontFamily: fonts.semiBold},
            ]}>
            {t('description') || 'Description'}
          </Text>
          <Text
            style={[
              styles.description,
              {color: colors.textSecondary, fontFamily: fonts.regular},
            ]}
            numberOfLines={descExpanded ? undefined : 3}>
            {product.description}
          </Text>
          <TouchableOpacity
            onPress={() => setDescExpanded(v => !v)}
            style={styles.readMoreBtn}
            activeOpacity={0.7}>
            <Text
              style={[
                styles.readMoreText,
                {color: colors.primary, fontFamily: fonts.semiBold},
              ]}>
              {descExpanded ? 'Read Less ↑' : 'Read More ↓'}
            </Text>
          </TouchableOpacity>

          <View
            style={[styles.sectionDivider, {backgroundColor: colors.border}]}
          />

          {/* ── Quantity Selector ── */}
          <View style={styles.quantityContainer}>
            <View>
              <Text
                style={[
                  styles.quantityLabel,
                  {color: colors.text, fontFamily: fonts.semiBold},
                ]}>
                {t('quantity') || 'Quantity'}
              </Text>
              <Text
                style={[
                  styles.quantitySub,
                  {color: colors.textSecondary, fontFamily: fonts.regular},
                ]}>
                {t('selectDesiredQty') || 'Select desired amount'}
              </Text>
            </View>
            <View
              style={[
                styles.quantitySelector,
                {backgroundColor: colors.card, borderColor: colors.border},
              ]}>
              <TouchableOpacity
                onPress={() => quantity > 1 && setQuantity(q => q - 1)}
                style={[
                  styles.qtyBtn,
                  {backgroundColor: isDark ? colors.border : '#F1F5F9'},
                ]}
                activeOpacity={0.7}>
                <Ionicons name="remove" size={16} color={colors.text} />
              </TouchableOpacity>
              <Text
                style={[
                  styles.qtyText,
                  {color: colors.text, fontFamily: fonts.bold},
                ]}>
                {quantity}
              </Text>
              <TouchableOpacity
                onPress={() => setQuantity(q => q + 1)}
                style={[
                  styles.qtyBtn,
                  {backgroundColor: isDark ? colors.border : '#F1F5F9'},
                ]}
                activeOpacity={0.7}>
                <Ionicons name="add" size={16} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          <View
            style={[styles.sectionDivider, {backgroundColor: colors.border}]}
          />

          {/* ── Reviews Section ── */}
          <View style={styles.reviewsHeader}>
            <Text
              style={[
                styles.sectionTitle,
                {color: colors.text, fontFamily: fonts.semiBold},
              ]}>
              Reviews
            </Text>
            <View
              style={[
                styles.overallRatingChip,
                {backgroundColor: colors.warning + '18'},
              ]}>
              <Ionicons name="star" size={14} color={colors.warning} />
              <Text
                style={[
                  styles.overallRatingText,
                  {color: colors.text, fontFamily: fonts.bold},
                ]}>
                {product.rating.rate.toFixed(1)} / 5
              </Text>
            </View>
          </View>

          {/* Star Breakdown */}
          <StarRow rating={product.rating.rate} count={product.rating.count} />

          <View style={{marginTop: hp(2.0)}}>
            {MOCK_REVIEWS.map(rev => (
              <View
                key={rev.id}
                style={[
                  styles.reviewCard,
                  {backgroundColor: colors.card, borderColor: colors.border},
                ]}>
                <View style={styles.reviewTop}>
                  <View
                    style={[
                      styles.reviewAvatar,
                      {backgroundColor: colors.primary + '20'},
                    ]}>
                    <Text
                      style={[
                        styles.reviewAvatarText,
                        {color: colors.primary, fontFamily: fonts.bold},
                      ]}>
                      {rev.author[0]}
                    </Text>
                  </View>
                  <View style={{flex: 1}}>
                    <Text
                      style={[
                        styles.reviewAuthor,
                        {color: colors.text, fontFamily: fonts.semiBold},
                      ]}>
                      {rev.author}
                    </Text>
                    <Text
                      style={[
                        styles.reviewDate,
                        {color: colors.textTertiary, fontFamily: fonts.regular},
                      ]}>
                      {rev.date}
                    </Text>
                  </View>
                  <View style={styles.reviewStars}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <Ionicons
                        key={s}
                        name={s <= rev.rating ? 'star' : 'star-outline'}
                        size={12}
                        color="#F59E0B"
                      />
                    ))}
                  </View>
                </View>
                <Text
                  style={[
                    styles.reviewComment,
                    {color: colors.textSecondary, fontFamily: fonts.regular},
                  ]}>
                  {rev.comment}
                </Text>
              </View>
            ))}
          </View>

          {/* ── Related Products ── */}
          {relatedProducts.length > 0 && (
            <>
              <View
                style={[
                  styles.sectionDivider,
                  {backgroundColor: colors.border},
                ]}
              />
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: colors.text,
                    fontFamily: fonts.semiBold,
                    marginBottom: hp(1.5),
                  },
                ]}>
                You May Also Like
              </Text>
              <FlatList
                data={relatedProducts}
                horizontal
                keyExtractor={item => item.id.toString()}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{gap: wp(3.0)}}
                renderItem={({item}) => (
                  <TouchableOpacity
                    style={[
                      styles.relatedCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() =>
                      navigation.push('ProductDetail', {productId: item.id})
                    }
                    activeOpacity={0.85}>
                    <View style={styles.relatedImageBox}>
                      <Animated.Image
                        source={{uri: item.image}}
                        style={styles.relatedImage}
                        resizeMode="contain"
                      />
                    </View>
                    <Text
                      style={[
                        styles.relatedTitle,
                        {color: colors.text, fontFamily: fonts.semiBold},
                      ]}
                      numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text
                      style={[
                        styles.relatedPrice,
                        {color: colors.primary, fontFamily: fonts.bold},
                      ]}>
                      {formatCurrency(item.price)}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </>
          )}
        </View>
      </Animated.ScrollView>

      {/* ── Anchored Bottom Actions ── */}
      <View
        style={[
          styles.bottomBarActions,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            paddingTop: hp(1.2),
            paddingBottom:
              Platform.OS === 'ios'
                ? Math.max(insets.bottom, hp(1.5))
                : hp(2.0),
          },
        ]}>
        <View style={styles.totalRow}>
          <Text
            style={[
              styles.totalLabel,
              {color: colors.textSecondary, fontFamily: fonts.regular},
            ]}>
            Total
          </Text>
          <Text
            style={[
              styles.totalPrice,
              {color: colors.primary, fontFamily: fonts.bold},
            ]}>
            {formatCurrency(totalPrice)}
          </Text>
        </View>
        <View style={styles.actionBtns}>
          <Button
            title={t('addToCart') || 'Add to Cart'}
            onPress={handleAddToCart}
            variant="outline"
            style={styles.actionBtnOutline}
            textStyle={{fontSize: fp(3.73)}}
          />
          <Button
            title={t('buyNow') || 'Buy Now'}
            onPress={handleBuyNow}
            style={styles.actionBtnSolid}
            textStyle={{fontSize: fp(3.73)}}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
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
  headerRight: {flexDirection: 'row'},
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: fp(4.27),
    marginHorizontal: wp(2.0),
  },
  scrollContent: {},
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
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    overflow: 'hidden',
  },
  stockBadge: {
    position: 'absolute',
    top: hp(1.5),
    right: wp(4.0),
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1.5),
    paddingHorizontal: wp(2.67),
    paddingVertical: hp(0.5),
    borderRadius: wp(4.0),
    zIndex: 2,
  },
  stockDot: {width: 6, height: 6, borderRadius: 3},
  stockText: {fontSize: fp(2.93)},
  heroImage: {width: '100%', height: '100%'},
  infoSection: {paddingHorizontal: wp(5.33), paddingTop: hp(2.5)},
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1.0),
  },
  category: {fontSize: fp(3.2), letterSpacing: 1},
  bestSellerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1.0),
    paddingHorizontal: wp(2.0),
    paddingVertical: hp(0.4),
    borderRadius: wp(1.5),
  },
  bestSellerText: {fontSize: fp(2.93)},
  title: {fontSize: fp(5.33), lineHeight: hp(3.45), marginBottom: hp(1.5)},
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
  ratingScoreText: {fontSize: fp(3.47)},
  badgeLine: {width: 1, height: hp(1.72), marginHorizontal: wp(3.2)},
  ratingCount: {fontSize: fp(3.47)},
  priceRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp(1.5),
  },
  priceLabel: {fontSize: fp(3.2), marginBottom: hp(0.2)},
  priceRow: {flexDirection: 'row', alignItems: 'baseline'},
  price: {fontSize: fp(6.4)},
  taxLabel: {fontSize: fp(3.2), marginLeft: wp(2.13)},
  ecoScoreWrapper: {alignItems: 'flex-end'},
  sectionDivider: {height: 1, width: '100%', marginVertical: hp(2.0)},
  selectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1.2),
  },
  sizeGuide: {fontSize: fp(3.2)},
  chipScrollRow: {marginBottom: hp(2.0)},
  sizeChip: {
    paddingHorizontal: wp(4.5),
    paddingVertical: hp(1.0),
    borderRadius: wp(2.5),
    borderWidth: 1.5,
    marginRight: wp(2.5),
    minWidth: wp(13),
    alignItems: 'center',
  },
  sizeChipText: {fontSize: fp(3.47)},
  colorChipOuter: {
    alignItems: 'center',
    marginRight: wp(4.0),
    paddingVertical: hp(0.5),
    paddingHorizontal: wp(1.0),
    borderRadius: wp(2.0),
    borderWidth: 2,
  },
  colorDot: {
    width: wp(8.0),
    height: wp(8.0),
    borderRadius: wp(4.0),
    marginBottom: hp(0.4),
  },
  colorLabel: {fontSize: fp(2.67)},
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
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  highlightTitle: {fontSize: fp(3.2), marginTop: hp(0.8), textAlign: 'center'},
  highlightSubtitle: {
    fontSize: fp(2.67),
    marginTop: hp(0.2),
    textAlign: 'center',
  },
  sectionTitle: {fontSize: fp(4.53), marginBottom: hp(1.0)},
  description: {fontSize: fp(3.73), lineHeight: hp(2.7)},
  readMoreBtn: {marginTop: hp(0.8), alignSelf: 'flex-start'},
  readMoreText: {fontSize: fp(3.47)},
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: hp(1.0),
  },
  quantityLabel: {fontSize: fp(4.53)},
  quantitySub: {fontSize: fp(2.93), marginTop: hp(0.2)},
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
  qtyText: {fontSize: fp(4.0), textAlign: 'center', minWidth: wp(8.0)},
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1.5),
  },
  overallRatingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1.0),
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.5),
    borderRadius: wp(2.0),
  },
  overallRatingText: {fontSize: fp(3.47)},
  reviewCard: {
    borderWidth: 1,
    borderRadius: wp(4.0),
    padding: wp(4.0),
    marginBottom: hp(1.5),
  },
  reviewTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1.0),
    gap: wp(3.0),
  },
  reviewAvatar: {
    width: wp(9.0),
    height: wp(9.0),
    borderRadius: wp(4.5),
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewAvatarText: {fontSize: fp(4.0)},
  reviewAuthor: {fontSize: fp(3.73)},
  reviewDate: {fontSize: fp(2.93), marginTop: hp(0.2)},
  reviewStars: {flexDirection: 'row', gap: 2},
  reviewComment: {fontSize: fp(3.47), lineHeight: hp(2.5)},
  relatedCard: {
    width: wp(38.0),
    borderRadius: wp(4.0),
    borderWidth: 1,
    padding: wp(3.0),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  relatedImageBox: {
    width: '100%',
    height: hp(12.0),
    backgroundColor: '#FFF',
    borderRadius: wp(3.0),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(1.0),
    overflow: 'hidden',
  },
  relatedImage: {width: '80%', height: '80%'},
  relatedTitle: {fontSize: fp(3.2), lineHeight: hp(2.2), marginBottom: hp(0.5)},
  relatedPrice: {fontSize: fp(3.73)},
  bottomBarActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: wp(5.33),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 8,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp(1.0),
  },
  totalLabel: {fontSize: fp(3.2)},
  totalPrice: {fontSize: fp(5.0)},
  actionBtns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBtnOutline: {flex: 0.48, borderRadius: wp(4.5)},
  actionBtnSolid: {flex: 0.48, borderRadius: wp(4.5)},
  loadingContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  loadingText: {marginTop: hp(1.5), fontSize: fp(3.73)},
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(8.53),
  },
  errorIcon: {marginBottom: hp(1.5)},
  errorText: {fontSize: fp(4.8), marginBottom: hp(1.0)},
  errorSub: {fontSize: fp(3.73), textAlign: 'center', marginBottom: hp(2.96)},
  backBtn: {width: wp(42.67)},
});
