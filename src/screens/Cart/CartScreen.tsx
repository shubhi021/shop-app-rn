import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Animated,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../hooks/useTheme';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateQuantity, removeFromCart } from '../../store/slices/cartSlice';
import { addToWishlist } from '../../store/slices/wishlistSlice';
import { formatPrice } from '../../utils/formatPrice';
import { useTranslation } from '../../hooks/useTranslation';
import { EcoScoreBadge } from '../../components/EcoScoreBadge';
import { CO2FootprintCard } from '../../components/CO2FootprintCard';
import { TaxBreakdownCard } from '../../components/TaxBreakdownCard';
import Button from '../../components/common/Button';
import { hp, wp, fp } from '../../theme/dimensions';
import Toast from 'react-native-toast-message';

const VALID_PROMO_CODES: Record<string, { discount: number; label: string }> = {
  SAVE10: { discount: 0.1, label: '10% Off' },
  TECHMIN: { discount: 0.15, label: '15% Off' },
  GOGREEN: { discount: 0.05, label: '5% Eco Discount' },
};

export default function CartScreen({ navigation }: any) {
  const { colors, fonts, fontSizes, isDark } = useTheme();
  const { t, formatCurrency } = useTranslation();
  const dispatch = useAppDispatch();

  const { items, total: subtotal, isGoGreenShipping } = useAppSelector((state) => state.cart);

  const freeShippingThreshold = 39;
  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 4.99;
  const greenOffset = isGoGreenShipping ? 0.99 : 0;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const shippingProgress = Math.min(1, subtotal / freeShippingThreshold);

  // Promo code state
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number; label: string } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  const discountAmount = appliedPromo ? subtotal * appliedPromo.discount : 0;
  const total = subtotal + shippingFee + greenOffset - discountAmount;

  const handleApplyPromo = () => {
    const code = promoInput.toUpperCase().trim();
    if (!code) { setPromoError('Enter a promo code.'); return; }
    const found = VALID_PROMO_CODES[code];
    if (found) {
      setAppliedPromo({ code, ...found });
      setPromoError(null);
      setPromoInput('');
      Toast.show({ type: 'success', text1: `Promo Applied! ${found.label}`, text2: `Code "${code}" activated.` });
    } else {
      setPromoError('Invalid promo code. Try SAVE10 or GOGREEN.');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    Toast.show({ type: 'info', text1: 'Promo Removed' });
  };

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

  const handleSaveForLater = (item: any) => {
    dispatch(addToWishlist(item.product));
    dispatch(removeFromCart(item.product.id));
    Toast.show({ type: 'success', text1: 'Saved for Later', text2: `${item.product.title.substring(0, 22)}... moved to Wishlist.` });
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
              <Ionicons name="trash-outline" size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>

          <Text style={[styles.itemTitle, { color: colors.text, fontFamily: fonts.semiBold }]} numberOfLines={2}>
            {product.title}
          </Text>

          <View style={styles.ecoScoreContainer}>
            <EcoScoreBadge
              score={product.ecoScore || (product.id % 2 === 0 ? 'A' : 'B')}
              co2Grams={product.co2Grams || Math.round(product.price * 25)}
              hasPfand={product.hasPfand || product.category?.includes('beverage')}
              size="small"
            />
          </View>

          <Text style={[styles.itemPrice, { color: colors.primary, fontFamily: fonts.bold }]}>
            {formatCurrency(product.price)}
          </Text>

          <View style={styles.itemBottomRow}>
            <View style={[styles.qtySelector, { borderColor: colors.border }]}>
              <TouchableOpacity onPress={() => handleDecrement(product.id, quantity)} style={styles.qtyBtn}>
                <Ionicons name="remove" size={16} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.qtyText, { color: colors.text, fontFamily: fonts.bold }]}>{quantity}</Text>
              <TouchableOpacity onPress={() => handleIncrement(product.id, quantity)} style={styles.qtyBtn}>
                <Ionicons name="add" size={16} color={colors.text} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.itemSubtotal, { color: colors.text, fontFamily: fonts.semiBold }]}>
              {formatCurrency(product.price * quantity)}
            </Text>
          </View>

          {/* Save for Later */}
          <TouchableOpacity onPress={() => handleSaveForLater(item)} style={styles.saveForLaterBtn} activeOpacity={0.7}>
            <Ionicons name="heart-outline" size={13} color={colors.primary} />
            <Text style={[styles.saveForLaterText, { color: colors.primary, fontFamily: fonts.medium }]}>Save for Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center' }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={64} color={colors.primary} style={styles.emptyIcon} />
          <Text style={[styles.emptyTitle, { color: colors.text, fontFamily: fonts.bold, fontSize: fontSizes.lg }]}>
            {t('emptyCart')}
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary, fontFamily: fonts.regular, fontSize: fontSizes.md }]}>
            Your cart is empty. Discover sustainable products now!
          </Text>
          <Button title={t('home')} onPress={() => navigation.navigate('Home')} style={styles.shopNowBtn} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      {/* Title */}
      <View style={[styles.header, { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
        <Text style={[styles.headerTitle, { color: colors.text, fontFamily: fonts.bold, fontSize: fontSizes.lg }]}>
          {t('cart')}
        </Text>
        <View style={[styles.itemCountBadge, { backgroundColor: colors.primary }]}>
          <Text style={[styles.itemCountText, { fontFamily: fonts.bold }]}>{items.length}</Text>
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.product.id.toString()}
        renderItem={renderCartItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.shippingProgressWrapper}>
            {subtotal < freeShippingThreshold ? (
              <View style={[styles.shippingBanner, { backgroundColor: colors.surface || colors.card, borderColor: colors.border }]}>
                <View style={styles.shippingBannerTop}>
                  <Ionicons name="cube-outline" size={16} color={colors.text} />
                  <Text style={[styles.shippingBannerText, { color: colors.text, fontFamily: fonts.medium }]}>
                    Add <Text style={{ color: colors.primary, fontFamily: fonts.bold }}>{formatCurrency(remainingForFreeShipping)}</Text> for free shipping
                  </Text>
                </View>
                {/* Progress Bar */}
                <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        backgroundColor: colors.primary,
                        width: `${Math.round(shippingProgress * 100)}%` as any,
                      },
                    ]}
                  />
                </View>
              </View>
            ) : (
              <View style={[styles.shippingBannerSuccess, { backgroundColor: '#DCFCE7', borderColor: '#16A34A' }]}>
                <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
                <Text style={[styles.shippingBannerText, { color: '#16A34A', fontFamily: fonts.bold }]}>
                  🎉 Free Shipping Unlocked!
                </Text>
              </View>
            )}
          </View>
        }
        ListFooterComponent={
          <View style={styles.footerContainer}>
            <CO2FootprintCard />
            <TaxBreakdownCard />

            {/* ── Promo Code Input ── */}
            <View style={[styles.promoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.promoTitle, { color: colors.text, fontFamily: fonts.semiBold }]}>Promo Code</Text>
              {appliedPromo ? (
                <View style={styles.appliedPromoRow}>
                  <View style={[styles.appliedPromoBadge, { backgroundColor: colors.primary + '15' }]}>
                    <Ionicons name="ticket-outline" size={16} color={colors.primary} />
                    <Text style={[styles.appliedPromoCode, { color: colors.primary, fontFamily: fonts.bold }]}>{appliedPromo.code}</Text>
                    <Text style={[styles.appliedPromoLabel, { color: colors.primary, fontFamily: fonts.medium }]}>— {appliedPromo.label}</Text>
                  </View>
                  <TouchableOpacity onPress={handleRemovePromo} style={styles.removePromoBtn}>
                    <Ionicons name="close-circle" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <View style={[styles.promoInputRow, { borderColor: colors.border }]}>
                    <TextInput
                      value={promoInput}
                      onChangeText={v => { setPromoInput(v); setPromoError(null); }}
                      placeholder="e.g. SAVE10"
                      placeholderTextColor={colors.textTertiary}
                      style={[styles.promoInput, { color: colors.text, fontFamily: fonts.medium }]}
                      autoCapitalize="characters"
                      returnKeyType="done"
                      onSubmitEditing={handleApplyPromo}
                    />
                    <TouchableOpacity
                      onPress={handleApplyPromo}
                      style={[styles.applyBtn, { backgroundColor: colors.primary }]}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.applyBtnText, { fontFamily: fonts.bold }]}>Apply</Text>
                    </TouchableOpacity>
                  </View>
                  {promoError && (
                    <Text style={[styles.promoError, { color: '#EF4444', fontFamily: fonts.regular }]}>{promoError}</Text>
                  )}
                </>
              )}
            </View>

            {/* ── Summary Card ── */}
            <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.summaryTitle, { color: colors.text, fontFamily: fonts.bold }]}>{t('orderTotal')}</Text>

              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t('subtotal')}</Text>
                <Text style={[styles.summaryValue, { color: colors.text, fontFamily: fonts.semiBold }]}>{formatCurrency(subtotal)}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Shipping</Text>
                <Text style={[styles.summaryValue, { color: shippingFee === 0 ? '#16A34A' : colors.text, fontFamily: fonts.semiBold }]}>
                  {shippingFee === 0 ? 'FREE' : formatCurrency(shippingFee)}
                </Text>
              </View>

              {isGoGreenShipping && (
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: '#059669' }]}>🌱 DHL GoGreen</Text>
                  <Text style={[styles.summaryValue, { color: '#059669', fontFamily: fonts.semiBold }]}>{formatCurrency(greenOffset)}</Text>
                </View>
              )}

              {appliedPromo && (
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: '#16A34A' }]}>🎟 {appliedPromo.code} ({appliedPromo.label})</Text>
                  <Text style={[styles.summaryValue, { color: '#16A34A', fontFamily: fonts.semiBold }]}>-{formatCurrency(discountAmount)}</Text>
                </View>
              )}

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <View style={styles.summaryTotalRow}>
                <Text style={[styles.totalLabel, { color: colors.text, fontFamily: fonts.bold }]}>{t('orderTotal')}</Text>
                <Text style={[styles.totalValue, { color: colors.primary, fontFamily: fonts.bold }]}>{formatCurrency(total)}</Text>
              </View>
            </View>

            <Button
              title={t('checkout')}
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
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2.5),
    paddingHorizontal: wp(4.27),
    paddingTop: hp(1.5),
    paddingBottom: hp(1.2),
  },
  headerTitle: { letterSpacing: 0.2 },
  itemCountBadge: {
    width: wp(6.5),
    height: wp(6.5),
    borderRadius: wp(3.25),
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemCountText: { color: '#FFF', fontSize: fp(3.2) },
  listContent: { paddingBottom: hp(3.94) },
  shippingProgressWrapper: { marginHorizontal: wp(4.27), marginTop: hp(1.0), marginBottom: hp(2.0) },
  shippingBanner: {
    padding: wp(3.2),
    borderRadius: wp(3.2),
    borderWidth: 1,
  },
  shippingBannerTop: { flexDirection: 'row', alignItems: 'center', gap: wp(2.0), marginBottom: hp(1.2) },
  shippingBannerSuccess: {
    padding: wp(3.2),
    borderRadius: wp(3.2),
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2.0),
  },
  shippingBannerText: { fontSize: fp(3.47) },
  progressBarBg: { height: 6, borderRadius: 3, overflow: 'hidden', width: '100%' },
  progressBarFill: { height: '100%', borderRadius: 3 },
  itemRow: {
    flexDirection: 'row',
    marginHorizontal: wp(4.27),
    marginBottom: hp(2.0),
    borderRadius: wp(4.27),
    borderWidth: 1,
    padding: wp(3.2),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  itemImageCard: {
    width: wp(24.0),
    height: hp(12.31),
    backgroundColor: '#FFFFFF',
    borderRadius: wp(3.2),
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp(2.13),
  },
  itemImage: { width: '100%', height: '100%' },
  itemInfo: { flex: 1, marginLeft: wp(4.27), justifyContent: 'space-between' },
  itemHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemCategory: { fontSize: fp(2.4), letterSpacing: 0.5, flex: 1 },
  removeBtn: { padding: wp(1.07) },
  itemTitle: { fontSize: fp(3.47), marginBottom: hp(0.5), lineHeight: hp(2.3) },
  ecoScoreContainer: { marginVertical: hp(0.5) },
  itemPrice: { fontSize: fp(4.0), marginBottom: hp(1.0) },
  itemBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  qtySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: wp(2.13),
    height: hp(3.94),
    width: wp(26.67),
  },
  qtyBtn: { flex: 1, height: '100%', justifyContent: 'center', alignItems: 'center' },
  qtyText: { width: wp(8.53), textAlign: 'center', fontSize: fp(3.47) },
  itemSubtotal: { fontSize: fp(3.47) },
  saveForLaterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1.5),
    marginTop: hp(0.8),
  },
  saveForLaterText: { fontSize: fp(3.0) },
  footerContainer: { paddingHorizontal: wp(4.27), marginTop: hp(1.0) },
  promoCard: {
    borderWidth: 1,
    borderRadius: wp(4.27),
    padding: wp(4.27),
    marginBottom: hp(2.0),
  },
  promoTitle: { fontSize: fp(4.0), marginBottom: hp(1.5) },
  promoInputRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: wp(3.0),
    overflow: 'hidden',
    height: hp(5.5),
  },
  promoInput: { flex: 1, paddingHorizontal: wp(3.5), fontSize: fp(3.73), letterSpacing: 1 },
  applyBtn: { paddingHorizontal: wp(5.0), justifyContent: 'center', alignItems: 'center' },
  applyBtnText: { color: '#FFF', fontSize: fp(3.47) },
  promoError: { fontSize: fp(3.0), marginTop: hp(0.8) },
  appliedPromoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  appliedPromoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2.0),
    paddingHorizontal: wp(3.0),
    paddingVertical: hp(0.8),
    borderRadius: wp(2.5),
  },
  appliedPromoCode: { fontSize: fp(3.73) },
  appliedPromoLabel: { fontSize: fp(3.2) },
  removePromoBtn: { padding: wp(1.0) },
  summaryCard: {
    borderWidth: 1,
    borderRadius: wp(4.27),
    padding: wp(4.27),
    marginBottom: hp(2.46),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  summaryTitle: { fontSize: fp(4.27), marginBottom: hp(2.0) },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: hp(1.5) },
  summaryLabel: { fontSize: fp(3.73) },
  summaryValue: { fontSize: fp(3.73) },
  divider: { height: 1, width: '100%', marginVertical: hp(0.5) },
  summaryTotalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: hp(1.0) },
  totalLabel: { fontSize: fp(4.27) },
  totalValue: { fontSize: fp(4.8) },
  checkoutBtn: { height: hp(6.4), borderRadius: wp(3.73), marginBottom: hp(2.0) },
  emptyContainer: { alignItems: 'center', paddingHorizontal: wp(8.53) },
  emptyIcon: { marginBottom: hp(2.0) },
  emptyTitle: { marginBottom: hp(1.0) },
  emptySubtitle: { textAlign: 'center', lineHeight: hp(2.46), marginBottom: hp(2.96) },
  shopNowBtn: { width: wp(48.0), height: hp(5.9) },
});
