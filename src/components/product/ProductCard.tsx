import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Toast from 'react-native-toast-message';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Product } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addToCart } from '../../store/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../../store/slices/wishlistSlice';
import { useTranslation } from '../../hooks/useTranslation';
import { EcoScoreBadge } from '../EcoScoreBadge';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 40) / 2; // Spacing adjustment for 2 columns

export default function ProductCard({ product, onPress }: ProductCardProps) {
  const { colors, fonts } = useTheme();
  const { formatCurrency } = useTranslation();
  const dispatch = useAppDispatch();
  const wishlistItems = useAppSelector(state => state.wishlist.items);
  
  const isWishlisted = wishlistItems.some(item => item.product.id === product.id);

  const handleWishlistToggle = (e: any) => {
    e.stopPropagation(); // Prevent card tap trigger
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

  const handleAddToCart = (e: any) => {
    e.stopPropagation(); // Prevent card tap trigger
    dispatch(addToCart(product));
    Toast.show({
      type: 'success',
      text1: 'Added to Cart',
      text2: `${product.title.substring(0, 20)}... added!`,
    });
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Image Container with Wishlist Heart */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.image }}
          style={styles.image}
          resizeMode="contain"
        />
        <TouchableOpacity
          style={[styles.wishlistBtn, { backgroundColor: colors.card }]}
          onPress={handleWishlistToggle}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isWishlisted ? 'heart' : 'heart-outline'}
            size={18}
            color={isWishlisted ? '#EF4444' : colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Info Section */}
      <View style={styles.infoContainer}>
        <Text
          style={[styles.category, { color: colors.textSecondary, fontFamily: fonts.medium }]}
          numberOfLines={1}
        >
          {product.category.toUpperCase()}
        </Text>
        
        <Text
          style={[styles.title, { color: colors.text, fontFamily: fonts.semiBold }]}
          numberOfLines={2}
        >
          {product.title}
        </Text>

        {/* Eco Score Badge */}
        <View style={{ marginBottom: 6 }}>
          <EcoScoreBadge
            score={product.ecoScore || (product.id % 2 === 0 ? 'A' : 'B')}
            co2Grams={product.co2Grams || Math.round(product.price * 25)}
            hasPfand={product.hasPfand || product.category?.includes('beverage')}
            size="small"
          />
        </View>

        {/* Rating Row */}
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={13} color="#F59E0B" style={{ marginRight: 4 }} />
          <Text style={[styles.ratingText, { color: colors.text, fontFamily: fonts.medium }]}>
            {product.rating.rate.toFixed(1)}
          </Text>
          <Text style={[styles.ratingCount, { color: colors.textTertiary, fontFamily: fonts.regular }]}>
            ({product.rating.count})
          </Text>
        </View>

        {/* Price & Action Row */}
        <View style={styles.bottomRow}>
          <Text style={[styles.price, { color: colors.primary, fontFamily: fonts.bold }]}>
            {formatCurrency(product.price)}
          </Text>
          
          <TouchableOpacity
            style={[styles.addCartBtn, { backgroundColor: colors.primary }]}
            onPress={handleAddToCart}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: COLUMN_WIDTH,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  imageContainer: {
    height: 160,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  wishlistBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  heartIcon: {
    fontSize: 16,
  },
  infoContainer: {
    padding: 12,
    flex: 1,
    justifyContent: 'space-between',
  },
  category: {
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  title: {
    fontSize: 13,
    lineHeight: 18,
    height: 36, // Force double line height boundary
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  star: {
    fontSize: 12,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 12,
    marginRight: 4,
  },
  ratingCount: {
    fontSize: 11,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  price: {
    fontSize: 15,
  },
  addCartBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCartBtnText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
});
