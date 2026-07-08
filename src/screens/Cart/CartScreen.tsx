import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateQuantity, removeFromCart } from '../../store/slices/cartSlice';
import { formatPrice } from '../../utils/formatPrice';
import Button from '../../components/common/Button';

const { width } = Dimensions.get('window');

export default function CartScreen({ navigation }: any) {
  const { colors, fonts, fontSizes, fontWeights, isDark } = useTheme();
  const dispatch = useAppDispatch();

  const { items, total: subtotal } = useAppSelector((state) => state.cart);

  // Math calculations
  const shippingFee = subtotal > 50 || subtotal === 0 ? 0 : 5.00;
  const tax = subtotal * 0.08;
  const total = subtotal + shippingFee + tax;
  const freeShippingThreshold = 50;
  const remainingForFreeShipping = freeShippingThreshold - subtotal;

  const handleIncrement = (productId: number, currentQty: number) => {
    dispatch(updateQuantity({ productId, quantity: currentQty + 1 }));
  };

  const handleDecrement = (productId: number, currentQty: number) => {
    if (currentQty > 1) {
      dispatch(updateQuantity({ productId, quantity: currentQty - 1 }));
    } else {
      dispatch(removeFromCart(productId));
    }
  };

  const handleRemove = (productId: number) => {
    dispatch(removeFromCart(productId));
  };

  const renderCartItem = ({ item }: { item: any }) => {
    const { product, quantity } = item;
    return (
      <View style={[styles.itemRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.itemImageCard}>
          <Image source={{ uri: product.image }} style={styles.itemImage} resizeMode="contain" />
        </View>
        <View style={styles.itemInfo}>
          <View style={styles.itemHeaderRow}>
            <Text style={[styles.itemCategory, { color: colors.textSecondary, fontFamily: fonts.medium }]} numberOfLines={1}>
              {product.category.toUpperCase()}
            </Text>
            <TouchableOpacity onPress={() => handleRemove(product.id)} style={styles.removeBtn}>
              <Text style={styles.removeIcon}>🗑️</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.itemTitle, { color: colors.text, fontFamily: fonts.semiBold }]} numberOfLines={1}>
            {product.title}
          </Text>
          <Text style={[styles.itemPrice, { color: colors.primary, fontFamily: fonts.bold }]}>
            {formatPrice(product.price)}
          </Text>

          {/* Quantity Actions */}
          <View style={styles.itemBottomRow}>
            <View style={[styles.qtySelector, { borderColor: colors.border }]}>
              <TouchableOpacity onPress={() => handleDecrement(product.id, quantity)} style={styles.qtyBtn}>
                <Text style={[styles.qtyBtnText, { color: colors.text }]}>−</Text>
              </TouchableOpacity>
              <Text style={[styles.qtyText, { color: colors.text, fontFamily: fonts.bold }]}>
                {quantity}
              </Text>
              <TouchableOpacity onPress={() => handleIncrement(product.id, quantity)} style={styles.qtyBtn}>
                <Text style={[styles.qtyBtnText, { color: colors.text }]}>+</Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.itemSubtotal, { color: colors.text, fontFamily: fonts.semiBold }]}>
              Sub: {formatPrice(product.price * quantity)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center' }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={[styles.emptyTitle, { color: colors.text, fontFamily: fonts.bold, fontSize: fontSizes.lg }]}>
            Your cart is empty
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary, fontFamily: fonts.regular, fontSize: fontSizes.md }]}>
            Looks like you haven't added anything to your cart yet. Explore premium products now!
          </Text>
          <Button title="Shop Now" onPress={() => navigation.navigate('Home')} style={styles.shopNowBtn} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
      {/* Title */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text, fontFamily: fonts.bold, fontSize: fontSizes.lg }]}>
          Shopping Cart ({items.length})
        </Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.product.id.toString()}
        renderItem={renderCartItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          subtotal < freeShippingThreshold ? (
            <View style={[styles.shippingBanner, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.shippingBannerText, { color: colors.text, fontFamily: fonts.medium }]}>
                Add <Text style={{ color: colors.primary, fontWeight: 'bold' }}>{formatPrice(remainingForFreeShipping)}</Text> more for <Text style={{ fontWeight: 'bold' }}>FREE shipping!</Text>
              </Text>
            </View>
          ) : (
            <View style={[styles.shippingBannerSuccess, { backgroundColor: colors.success + '20', borderColor: colors.success }]}>
              <Text style={[styles.shippingBannerText, { color: colors.success, fontFamily: fonts.bold }]}>
                🎉 You've unlocked FREE shipping!
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          <View style={styles.footerContainer}>
            {/* Promo code mock */}
            <View style={[styles.promoRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.promoLabel, { color: colors.textSecondary, fontFamily: fonts.medium }]}>
                Have a coupon code?
              </Text>
              <TouchableOpacity>
                <Text style={[styles.promoAction, { color: colors.primary, fontFamily: fonts.bold }]}>
                  Apply Coupon
                </Text>
              </TouchableOpacity>
            </View>

            {/* Calculations Card */}
            <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.summaryTitle, { color: colors.text, fontFamily: fonts.bold }]}>
                Order Summary
              </Text>
              
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
                  Subtotal
                </Text>
                <Text style={[styles.summaryValue, { color: colors.text, fontFamily: fonts.semiBold }]}>
                  {formatPrice(subtotal)}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
                  Shipping
                </Text>
                <Text style={[styles.summaryValue, { color: shippingFee === 0 ? colors.success : colors.text, fontFamily: fonts.semiBold }]}>
                  {shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
                  Estimated Tax (8%)
                </Text>
                <Text style={[styles.summaryValue, { color: colors.text, fontFamily: fonts.semiBold }]}>
                  {formatPrice(tax)}
                </Text>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <View style={[styles.summaryRow, { marginTop: 8 }]}>
                <Text style={[styles.totalLabel, { color: colors.text, fontFamily: fonts.bold }]}>
                  Order Total
                </Text>
                <Text style={[styles.totalValue, { color: colors.primary, fontFamily: fonts.bold }]}>
                  {formatPrice(total)}
                </Text>
              </View>
            </View>

            <Button
              title="Proceed to Checkout"
              onPress={() => navigation.navigate('Checkout')}
              style={styles.checkoutBtn}
            />
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitle: {
    letterSpacing: 0.2,
  },
  listContent: {
    paddingBottom: 32,
  },
  shippingBanner: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  shippingBannerSuccess: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  shippingBannerText: {
    fontSize: 13,
  },
  itemRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  itemImageCard: {
    width: 90,
    height: 100,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'space-between',
  },
  itemHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemCategory: {
    fontSize: 9,
    letterSpacing: 0.5,
    flex: 1,
  },
  removeBtn: {
    padding: 4,
  },
  removeIcon: {
    fontSize: 14,
  },
  itemTitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 15,
    marginBottom: 8,
  },
  itemBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qtySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    height: 32,
    width: 100,
  },
  qtyBtn: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: {
    fontSize: 16,
    fontWeight: '500',
  },
  qtyText: {
    width: 32,
    textAlign: 'center',
    fontSize: 13,
  },
  itemSubtotal: {
    fontSize: 13,
  },
  footerContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  promoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 16,
  },
  promoLabel: {
    fontSize: 13,
  },
  promoAction: {
    fontSize: 13,
  },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  summaryTitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 4,
  },
  totalLabel: {
    fontSize: 16,
  },
  totalValue: {
    fontSize: 18,
  },
  checkoutBtn: {
    height: 52,
    borderRadius: 14,
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    marginBottom: 8,
  },
  emptySubtitle: {
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  shopNowBtn: {
    width: 180,
    height: 48,
  },
});
