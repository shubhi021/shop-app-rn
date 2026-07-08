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
  Dimensions,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../hooks/useTheme';
import { ProductService } from '../../services/api';
import { Product } from '../../types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addToCart, updateQuantity } from '../../store/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../../store/slices/wishlistSlice';
import { formatPrice } from '../../utils/formatPrice';
import Button from '../../components/common/Button';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen({ route, navigation }: any) {
  const { productId } = route.params;
  const { colors, fonts, fontSizes, fontWeights, isDark } = useTheme();
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
    // Dispatch add to cart multiple times if quantity > 1, or handle custom quantity injection.
    // Since cartSlice.addToCart adds 1, we can dispatch it 'quantity' times or modify quantity.
    // Wait, cartSlice has an action updateQuantity where we can set exact quantity.
    // Let's first dispatch addToCart, then if quantity > 1, dispatch updateQuantity with total.
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
        <Text style={styles.errorIcon}>⚠️</Text>
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
          <Text style={[styles.headerIconText, { color: colors.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text, fontFamily: fonts.bold }]} numberOfLines={1}>
          {product.title}
        </Text>
        <TouchableOpacity style={styles.headerBtn} onPress={handleWishlistToggle}>
          <Text style={styles.headerIconText}>{isWishlisted ? '❤️' : '🤍'}</Text>
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

          {/* Rating Block */}
          <View style={styles.ratingRow}>
            <View style={styles.starsContainer}>
              <Text style={styles.starText}>⭐ {product.rating.rate.toFixed(1)}</Text>
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
              {formatPrice(product.price)}
            </Text>
            <Text style={[styles.taxLabel, { color: colors.textTertiary, fontFamily: fonts.regular }]}>
              (Inclusive of all taxes)
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
    paddingHorizontal: 16,
    height: 56,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIconText: {
    fontSize: 22,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    marginHorizontal: 12,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  imageCard: {
    width: width - 32,
    height: 320,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    marginTop: 8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  category: {
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    lineHeight: 28,
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  badgeLine: {
    width: 1,
    height: 14,
    marginHorizontal: 12,
  },
  ratingCount: {
    fontSize: 13,
  },
  divider: {
    height: 1,
    width: '100%',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingVertical: 16,
  },
  price: {
    fontSize: 24,
  },
  taxLabel: {
    fontSize: 12,
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 16,
  },
  quantityLabel: {
    fontSize: 16,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    height: 40,
    width: 120,
  },
  qtyBtn: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: {
    fontSize: 18,
    fontWeight: '500',
  },
  qtyText: {
    width: 40,
    textAlign: 'center',
    fontSize: 15,
  },
  bottomActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    marginTop: 12,
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 8,
  },
  errorSub: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  backBtn: {
    width: 160,
  },
});