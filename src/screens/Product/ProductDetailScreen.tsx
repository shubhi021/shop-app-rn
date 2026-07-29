import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../hooks/useTheme';
import { ProductService } from '../../services/api';
import { Product } from '../../types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addToCart, updateQuantity } from '../../store/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../../store/slices/wishlistSlice';
import { formatPrice } from '../../utils/formatPrice';
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

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const wishlistItems = useAppSelector((state) => state.wishlist.items);
  const isWishlisted = wishlistItems.some((item) => item.product.id === productId);

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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text, fontFamily: fonts.bold }]} numberOfLines={1}>
          {product.title}
        </Text>
        <TouchableOpacity style={styles.headerBtn} onPress={handleWishlistToggle}>
          <Ionicons
            name={isWishlisted ? 'heart' : 'heart-outline'}
            size={22}
            color={isWishlisted ? '#EF4444' : colors.text}
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Product Image Card */}
        <View style={styles.imageCard}>
          <Image source={{ uri: product.image }} style={styles.image} resizeMode="contain" />
        </View>

        {/* Product Info */}
        <View style={styles.infoSection}>
          <Text style={[styles.category, { color: colors.primary, fontFamily: fonts.bold }]}>
            {product.category.toUpperCase()}
          </Text>
          <Text style={[styles.title, { color: colors.text, fontFamily: fonts.bold }]}>
            {product.title}
          </Text>

          {/* Eco Score Badge */}
          <View style={styles.ecoScoreContainer}>
            <EcoScoreBadge
              score={product.ecoScore || (product.id % 2 === 0 ? 'A' : 'B')}
              co2Grams={product.co2Grams || Math.round(product.price * 25)}
              hasPfand={product.hasPfand || product.category?.includes('beverage')}
              size="medium"
            />
          </View>

          {/* Rating Block */}
          <View style={styles.ratingRow}>
            <View style={styles.starsContainer}>
              <View style={styles.ratingRowStars}>
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text style={styles.starText}>{product.rating.rate.toFixed(1)}</Text>
              </View>
            </View>
            <View style={[styles.badgeLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.ratingCount, { color: colors.textSecondary, fontFamily: fonts.medium }]}>
              {product.rating.count} Customer Reviews
            </Text>
          </View>

          {/* Price Block */}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: colors.primary, fontFamily: fonts.bold }]}>
              {formatCurrency(product.price)}
            </Text>
            <Text style={[styles.taxLabel, { color: colors.textTertiary, fontFamily: fonts.regular }]}>
              ({t('vatIncluded')})
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Description Section */}
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fonts.semiBold }]}>
            Description
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
            {product.description}
          </Text>

          {/* Quantity Selector Section */}
          <View style={styles.quantityContainer}>
            <Text style={[styles.quantityLabel, { color: colors.text, fontFamily: fonts.semiBold }]}>
              Quantity
            </Text>
            <View style={[styles.quantitySelector, { borderColor: colors.border }]}>
              <TouchableOpacity
                onPress={handleDecrement}
                style={[styles.qtyBtn, { borderRightColor: colors.border, borderRightWidth: 1 }]}
              >
                <Text style={[styles.qtyBtnText, { color: colors.text }]}>−</Text>
              </TouchableOpacity>
              <Text style={[styles.qtyText, { color: colors.text, fontFamily: fonts.bold }]}>
                {quantity}
              </Text>
              <TouchableOpacity
                onPress={handleIncrement}
                style={[styles.qtyBtn, { borderLeftColor: colors.border, borderLeftWidth: 1 }]}
              >
                <Text style={[styles.qtyBtnText, { color: colors.text }]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Actions */}
      <View style={[styles.bottomActions, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <Button
          title="Add to Cart"
          onPress={handleAddToCart}
          variant="outline"
          style={styles.actionBtnOutline}
        />
        <Button
          title="Buy Now"
          onPress={handleBuyNow}
          style={styles.actionBtnSolid}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4.27),
    height: hp(6.9),
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
    paddingBottom: hp(4.9),
  },
  imageCard: {
    width: SCREEN_WIDTH - wp(8.53),
    height: hp(39.4),
    marginHorizontal: wp(4.27),
    backgroundColor: '#FFFFFF',
    borderRadius: wp(6.4),
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp(6.4),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    marginTop: hp(1.0),
  },
  image: {
    width: '100%',
    height: '100%',
  },
  infoSection: {
    paddingHorizontal: wp(5.33),
    paddingTop: hp(2.96),
  },
  category: {
    fontSize: fp(3.2),
    letterSpacing: 1,
    marginBottom: hp(1.0),
  },
  title: {
    fontSize: fp(5.33),
    lineHeight: hp(3.45),
    marginBottom: hp(1.5),
  },
  ecoScoreContainer: {
    marginVertical: hp(1.0),
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(2.0),
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingRowStars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1.07),
  },
  starText: {
    fontSize: fp(3.73),
    fontWeight: 'bold',
  },
  badgeLine: {
    width: 1,
    height: hp(1.72),
    marginHorizontal: wp(3.2),
  },
  ratingCount: {
    fontSize: fp(3.47),
  },
  divider: {
    height: 1,
    width: '100%',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingVertical: hp(2.0),
  },
  price: {
    fontSize: fp(6.4),
  },
  taxLabel: {
    fontSize: fp(3.2),
    marginLeft: wp(2.13),
  },
  sectionTitle: {
    fontSize: fp(4.27),
    marginTop: hp(2.0),
    marginBottom: hp(1.0),
  },
  description: {
    fontSize: fp(3.73),
    lineHeight: hp(2.7),
    marginBottom: hp(2.0),
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: hp(1.5),
    marginBottom: hp(2.0),
  },
  quantityLabel: {
    fontSize: fp(4.27),
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: wp(3.2),
    height: hp(4.9),
    width: wp(32.0),
  },
  qtyBtn: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: {
    fontSize: fp(4.8),
    fontWeight: '500',
  },
  qtyText: {
    width: wp(10.67),
    textAlign: 'center',
    fontSize: fp(4.0),
  },
  bottomActions: {
    flexDirection: 'row',
    paddingHorizontal: wp(4.27),
    paddingVertical: hp(1.5),
    borderTopWidth: 1,
    justifyContent: 'space-between',
  },
  actionBtnOutline: {
    flex: 0.48,
  },
  actionBtnSolid: {
    flex: 0.48,
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