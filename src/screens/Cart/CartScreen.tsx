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
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../hooks/useTheme';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateQuantity, removeFromCart } from '../../store/slices/cartSlice';
import { formatPrice } from '../../utils/formatPrice';
import { useTranslation } from '../../hooks/useTranslation';
import { EcoScoreBadge } from '../../components/EcoScoreBadge';
import { CO2FootprintCard } from '../../components/CO2FootprintCard';
import { TaxBreakdownCard } from '../../components/TaxBreakdownCard';
import Button from '../../components/common/Button';
import { hp, wp, fp } from '../../theme/dimensions';

export default function CartScreen({ navigation }: any) {
  const { colors, fonts, fontSizes, fontWeights, isDark } = useTheme();
  const { t, formatCurrency } = useTranslation();
  const dispatch = useAppDispatch();

  const { items, total: subtotal, isGoGreenShipping } = useAppSelector((state) => state.cart);

  // Shipping & Offset logic
  const freeShippingThreshold = 39;
  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 4.99;
  const greenOffset = isGoGreenShipping ? 0.99 : 0;
  const total = subtotal + shippingFee + greenOffset;
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
              <Ionicons name="trash-outline" size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
          <Text style={[styles.itemTitle, { color: colors.text, fontFamily: fonts.semiBold }]} numberOfLines={1}>
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

          {/* Quantity Actions */}
          <View style={styles.itemBottomRow}>
            <View style={[styles.qtySelector, { borderColor: colors.border }]}>
              <TouchableOpacity onPress={() => handleDecrement(product.id, quantity)} style={styles.qtyBtn}>
                <Ionicons name="remove" size={16} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.qtyText, { color: colors.text, fontFamily: fonts.bold }]}>
                {quantity}
              </Text>
              <TouchableOpacity onPress={() => handleIncrement(product.id, quantity)} style={styles.qtyBtn}>
                <Ionicons name="add" size={16} color={colors.text} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.itemSubtotal, { color: colors.text, fontFamily: fonts.semiBold }]}>
              Summe: {formatCurrency(product.price * quantity)}
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
          <Ionicons name="cart-outline" size={64} color={colors.primary} style={styles.emptyIcon} />
          <Text style={[styles.emptyTitle, { color: colors.text, fontFamily: fonts.bold, fontSize: fontSizes.lg }]}>
            {t('emptyCart')}
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary, fontFamily: fonts.regular, fontSize: fontSizes.md }]}>
            Ihr Warenkorb ist leer. Entdecken Sie jetzt nachhaltige Produkte!
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
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text, fontFamily: fonts.bold, fontSize: fontSizes.lg }]}>
          {t('cart')} ({items.length})
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
                {t('freeShipping')}! Noch <Text style={{ color: colors.primary, fontWeight: 'bold' }}>{formatCurrency(remainingForFreeShipping)}</Text> hinzufügen.
              </Text>
            </View>
          ) : (
            <View style={[styles.shippingBannerSuccess, { backgroundColor: colors.success + '20', borderColor: colors.success }]}>
              <Text style={[styles.shippingBannerText, { color: colors.success, fontFamily: fonts.bold }]}>
                🎉 Kostenloser Versand freigeschaltet!
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          <View style={styles.footerContainer}>
            {/* Sustainability Card */}
            <CO2FootprintCard />

            {/* German MwSt Tax Card */}
            <TaxBreakdownCard />

            {/* Calculations Card */}
            <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.summaryTitle, { color: colors.text, fontFamily: fonts.bold }]}>
                {t('orderTotal')}
              </Text>
              
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                  {t('subtotal')}
                </Text>
                <Text style={[styles.summaryValue, { color: colors.text, fontFamily: fonts.semiBold }]}>
                  {formatCurrency(subtotal)}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                  Versandkosten
                </Text>
                <Text style={[styles.summaryValue, { color: shippingFee === 0 ? colors.success : colors.text, fontFamily: fonts.semiBold }]}>
                  {shippingFee === 0 ? 'KOSTENLOS' : formatCurrency(shippingFee)}
                </Text>
              </View>

              {isGoGreenShipping ? (
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: '#059669' }]}>
                    🌱 DHL GoGreen
                  </Text>
                  <Text style={[styles.summaryValue, { color: '#059669', fontFamily: fonts.semiBold }]}>
                    {formatCurrency(greenOffset)}
                  </Text>
                </View>
              ) : null}

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <View style={styles.summaryTotalRow}>
                <Text style={[styles.totalLabel, { color: colors.text, fontFamily: fonts.bold }]}>
                  {t('orderTotal')}
                </Text>
                <Text style={[styles.totalValue, { color: colors.primary, fontFamily: fonts.bold }]}>
                  {formatCurrency(total)}
                </Text>
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
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: wp(4.27),
    paddingTop: hp(1.5),
    paddingBottom: hp(1.0),
  },
  headerTitle: {
    letterSpacing: 0.2,
  },
  listContent: {
    paddingBottom: hp(3.94),
  },
  shippingBanner: {
    marginHorizontal: wp(4.27),
    marginTop: hp(1.0),
    marginBottom: hp(2.0),
    padding: wp(3.2),
    borderRadius: wp(3.2),
    borderWidth: 1,
    alignItems: 'center',
  },
  shippingBannerSuccess: {
    marginHorizontal: wp(4.27),
    marginTop: hp(1.0),
    marginBottom: hp(2.0),
    padding: wp(3.2),
    borderRadius: wp(3.2),
    borderWidth: 1,
    alignItems: 'center',
  },
  shippingBannerText: {
    fontSize: fp(3.47),
  },
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
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemInfo: {
    flex: 1,
    marginLeft: wp(4.27),
    justifyContent: 'space-between',
  },
  itemHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemCategory: {
    fontSize: fp(2.4),
    letterSpacing: 0.5,
    flex: 1,
  },
  removeBtn: {
    padding: wp(1.07),
  },
  itemTitle: {
    fontSize: fp(3.73),
    marginBottom: hp(0.5),
  },
  ecoScoreContainer: {
    marginVertical: hp(0.5),
  },
  itemPrice: {
    fontSize: fp(4.0),
    marginBottom: hp(1.0),
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
    borderRadius: wp(2.13),
    height: hp(3.94),
    width: wp(26.67),
  },
  qtyBtn: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    width: wp(8.53),
    textAlign: 'center',
    fontSize: fp(3.47),
  },
  itemSubtotal: {
    fontSize: fp(3.47),
  },
  footerContainer: {
    paddingHorizontal: wp(4.27),
    marginTop: hp(1.0),
  },
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
  summaryTitle: {
    fontSize: fp(4.27),
    marginBottom: hp(2.0),
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(1.5),
  },
  summaryLabel: {
    fontSize: fp(3.73),
  },
  summaryValue: {
    fontSize: fp(3.73),
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: hp(0.5),
  },
  summaryTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp(1.0),
  },
  totalLabel: {
    fontSize: fp(4.27),
  },
  totalValue: {
    fontSize: fp(4.8),
  },
  checkoutBtn: {
    height: hp(6.4),
    borderRadius: wp(3.73),
    marginBottom: hp(2.0),
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: wp(8.53),
  },
  emptyIcon: {
    marginBottom: hp(2.0),
  },
  emptyTitle: {
    marginBottom: hp(1.0),
  },
  emptySubtitle: {
    textAlign: 'center',
    lineHeight: hp(2.46),
    marginBottom: hp(2.96),
  },
  shopNowBtn: {
    width: wp(48.0),
    height: hp(5.9),
  },
});
