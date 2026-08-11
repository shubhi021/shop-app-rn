import React, {useRef, useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Toast from 'react-native-toast-message';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Product} from '../../types';
import {useTheme} from '../../hooks/useTheme';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import {addToCart, updateQuantity} from '../../store/slices/cartSlice';
import {
  addToWishlist,
  removeFromWishlist,
} from '../../store/slices/wishlistSlice';
import {useTranslation} from '../../hooks/useTranslation';
import {EcoScoreBadge} from '../EcoScoreBadge';
import {hp, wp, fp} from '../../theme/dimensions';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

const COLUMN_WIDTH = wp(44.5); // (100% width - margins) / 2 responsive columns

function ProductCard({product, onPress}: ProductCardProps) {
  const {colors, fonts} = useTheme();
  const {formatCurrency} = useTranslation();
  const dispatch = useAppDispatch();

  const isWishlisted = useAppSelector(state =>
    state.wishlist.items.some(item => item.product.id === product.id),
  );

  const quantity = useAppSelector(state => {
    const item = state.cart.items.find(i => i.product.id === product.id);
    return item ? item.quantity : 0;
  });

  // --- ANIMATIONS & STATE DEFINITIONS ---
  const [isAddedToCart, setIsAddedToCart] = useState(false);

  // 1. Entrance Fade & Slide: Fades in card opacity and slides card up from hp(3.0) to 0.
  // We use useNativeDriver: true here because opacity and translateY are natively animatable.
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(hp(3.0))).current;

  // 2. Tactile Card Touch Scaling: Shrinks the card slightly to 0.96 on press and springs back to 1.0.
  // Operates natively (useNativeDriver: true) on the scale transform property.
  const pressScale = useRef(new Animated.Value(1)).current;

  // 3. Wishlist Toggle Pop: Pulses the heart icon to 1.3 on tap toggle before spring-reverting to 1.0.
  // Operates natively (useNativeDriver: true).
  const heartScale = useRef(new Animated.Value(1)).current;

  // 4. Add to Cart Confirmation Animation Values:
  // - cartScale: Pulses the green circular button slightly when clicked.
  // - colorAnim: Fades the background color from primary teal to success green.

  // IMPORTANT: We use useNativeDriver: false for all cart button animations to avoid a Hermes engine
  // thread clash. In React Native, background color interpolations cannot run natively. If we mix
  // native transforms (scale) and JS-driven layout (backgroundColor) on the same Animated.View node,
  // it triggers a driver crash. Unifying them on JS thread driver resolves the error cleanly.
  const cartScale = useRef(new Animated.Value(1)).current;
  const colorAnim = useRef(new Animated.Value(0)).current;

  // Mount Effect: Triggers the entry slide-up and fade-in animations simultaneously on load.
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Card Press Handlers: Springs pressScale down to 0.96 when pressed down, springs back on release.
  const handlePressIn = () => {
    Animated.spring(pressScale, {
      toValue: 0.96,
      useNativeDriver: true,
      friction: 8,
      tension: 100,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressScale, {
      toValue: 1.0,
      useNativeDriver: true,
      friction: 8,
      tension: 100,
    }).start();
  };

  // Wishlist Handler: Pulses the scale of the heart to 1.3, then springs back to 1.0, and toggles Redux state.
  const handleWishlistToggle = (e: any) => {
    e.stopPropagation(); // Prevent card tap navigation

    Animated.sequence([
      Animated.timing(heartScale, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(heartScale, {
        toValue: 1.0,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

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

  // Add to Cart Handler: Triggers color-fade and scale-pulse animations concurrently (JS-driven),
  // dispatches item to Redux cart store, and schedules a reversion sequence back to teal + icon after 1.2s.
  const handleAddToCart = (e: any) => {
    e.stopPropagation(); // Prevent card tap navigation

    if (isAddedToCart) {
      return;
    } // Prevent double taps during active transition

    setIsAddedToCart(true);

    Animated.parallel([
      Animated.sequence([
        Animated.timing(cartScale, {
          toValue: 1.3,
          duration: 100,
          useNativeDriver: false, // JS-driven to match color transition thread
        }),
        Animated.spring(cartScale, {
          toValue: 1.0,
          friction: 4,
          tension: 40,
          useNativeDriver: false,
        }),
      ]),
      Animated.timing(colorAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false, // Background colors must animate on JS driver
      }),
    ]).start();

    dispatch(addToCart(product));
    Toast.show({
      type: 'success',
      text1: 'Added to Cart',
      text2: `${product.title.substring(0, 20)}... added!`,
    });

    // Reversion timeline: fades color back to primary teal, then resets icon state to '+' sign.
    setTimeout(() => {
      Animated.timing(colorAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start(() => {
        setIsAddedToCart(false);
      });
    }, 1200);
  };

  // Interpolates the colorAnim value (0 -> 1) between the primary theme color and success green.
  const interpolatedBgColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.primary, colors.success],
  });

  return (
    <TouchableOpacity
      style={styles.touchableCard}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.95}>
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            opacity: fadeAnim,
            transform: [{translateY: slideAnim}, {scale: pressScale}],
          },
        ]}>
        {/* Image Container with Wishlist Heart */}
        <View style={styles.imageContainer}>
          <Image
            source={{uri: product.image}}
            style={styles.image}
            resizeMode="contain"
          />
          <TouchableOpacity
            style={[styles.wishlistBtn, {backgroundColor: colors.card}]}
            onPress={handleWishlistToggle}
            activeOpacity={0.8}>
            <Animated.View style={{transform: [{scale: heartScale}]}}>
              <Ionicons
                name={isWishlisted ? 'heart' : 'heart-outline'}
                size={18}
                color={isWishlisted ? '#EF4444' : colors.textSecondary}
              />
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View style={styles.infoContainer}>
          <Text
            style={[
              styles.category,
              {color: colors.textSecondary, fontFamily: fonts.medium},
            ]}
            numberOfLines={1}>
            {product.category.toUpperCase()}
          </Text>

          <Text
            style={[
              styles.title,
              {color: colors.text, fontFamily: fonts.semiBold},
            ]}
            numberOfLines={2}>
            {product.title}
          </Text>

          {/* Eco Score Badge */}
          <View style={styles.ecoScoreContainer}>
            <EcoScoreBadge
              score={product.ecoScore || (product.id % 2 === 0 ? 'A' : 'B')}
              co2Grams={product.co2Grams || Math.round(product.price * 25)}
              hasPfand={
                product.hasPfand || product.category?.includes('beverage')
              }
              size="small"
            />
          </View>

          {/* Rating Row */}
          <View style={styles.ratingRow}>
            <Ionicons
              name="star"
              size={13}
              color="#F59E0B"
              style={styles.ratingStar}
            />
            <Text
              style={[
                styles.ratingText,
                {color: colors.text, fontFamily: fonts.medium},
              ]}>
              {product.rating.rate.toFixed(1)}
            </Text>
            <Text
              style={[
                styles.ratingCount,
                {color: colors.textTertiary, fontFamily: fonts.regular},
              ]}>
              ({product.rating.count})
            </Text>
          </View>

          {/* Price & Action Row */}
          <View style={styles.bottomRow}>
            <Text
              style={[
                styles.price,
                {color: colors.primary, fontFamily: fonts.bold},
              ]}>
              {formatCurrency(product.price)}
            </Text>

            {quantity > 0 ? (
              <View
                style={[
                  styles.qtySelector,
                  {
                    borderColor: colors.primary,
                    backgroundColor: colors.surface,
                  },
                ]}>
                <TouchableOpacity
                  onPress={e => {
                    e.stopPropagation();
                    dispatch(
                      updateQuantity({
                        productId: product.id,
                        quantity: quantity - 1,
                      }),
                    );
                  }}
                  style={styles.qtyBtn}
                  activeOpacity={0.7}>
                  <Ionicons name="remove" size={14} color={colors.primary} />
                </TouchableOpacity>
                <Text
                  style={[
                    styles.qtyText,
                    {color: colors.text, fontFamily: fonts.bold},
                  ]}>
                  {quantity}
                </Text>
                <TouchableOpacity
                  onPress={e => {
                    e.stopPropagation();
                    dispatch(
                      updateQuantity({
                        productId: product.id,
                        quantity: quantity + 1,
                      }),
                    );
                  }}
                  style={styles.qtyBtn}
                  activeOpacity={0.7}>
                  <Ionicons name="add" size={14} color={colors.primary} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={handleAddToCart} activeOpacity={0.8}>
                <Animated.View
                  style={[
                    styles.addCartBtn,
                    {
                      backgroundColor: interpolatedBgColor,
                      transform: [{scale: cartScale}],
                    },
                  ]}>
                  <Ionicons
                    name={isAddedToCart ? 'checkmark' : 'add'}
                    size={18}
                    color="#FFFFFF"
                  />
                </Animated.View>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchableCard: {
    width: COLUMN_WIDTH,
    marginBottom: hp(2.0),
  },
  card: {
    width: '100%',
    borderRadius: wp(4.27),
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  imageContainer: {
    height: hp(19.7),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp(3.2),
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  wishlistBtn: {
    position: 'absolute',
    top: hp(1.0),
    right: wp(2.13),
    width: wp(8.53),
    height: wp(8.53),
    borderRadius: wp(4.27),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoContainer: {
    padding: wp(3.2),
    flex: 1,
    justifyContent: 'space-between',
  },
  category: {
    fontSize: fp(2.67),
    letterSpacing: 0.5,
    marginBottom: hp(0.5),
  },
  title: {
    fontSize: fp(3.47),
    lineHeight: hp(2.2),
    height: hp(4.43),
    marginBottom: hp(0.74),
  },
  ecoScoreContainer: {
    marginBottom: hp(0.74),
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1.0),
  },
  ratingStar: {
    marginRight: wp(1.07),
  },
  ratingText: {
    fontSize: fp(3.2),
    marginRight: wp(1.07),
  },
  ratingCount: {
    fontSize: fp(2.93),
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: hp(0.5),
  },
  price: {
    fontSize: fp(4.0),
  },
  addCartBtn: {
    width: wp(8.53),
    height: wp(8.53),
    borderRadius: wp(4.27),
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: wp(4.27),
    height: wp(8.53),
    width: wp(20.0),
    justifyContent: 'space-between',
    paddingHorizontal: wp(1.0),
  },
  qtyBtn: {
    width: wp(6.0),
    height: wp(6.0),
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: fp(3.2),
    textAlign: 'center',
    minWidth: wp(5.0),
  },
});

export default React.memo(ProductCard);
