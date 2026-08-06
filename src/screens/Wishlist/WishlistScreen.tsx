import React, {useState, useRef, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useTheme} from '../../hooks/useTheme';
import {useAppSelector, useAppDispatch} from '../../store/hooks';
import ProductCard from '../../components/product/ProductCard';
import Button from '../../components/common/Button';
import {hp, wp, fp} from '../../theme/dimensions';
import {removeFromWishlist} from '../../store/slices/wishlistSlice';
import {addToCart} from '../../store/slices/cartSlice';
import {useTranslation} from '../../hooks/useTranslation';
import Toast from 'react-native-toast-message';
import {WishlistItem} from '../../types';

type SortOption = 'recent' | 'price_asc' | 'price_desc';

const SORT_OPTIONS: {key: SortOption; label: string}[] = [
  {key: 'recent', label: 'Recent'},
  {key: 'price_asc', label: 'Price ↑'},
  {key: 'price_desc', label: 'Price ↓'},
];

export default function WishlistScreen({navigation}: any) {
  const {colors, fonts, fontSizes, isDark} = useTheme();
  const {formatCurrency} = useTranslation();
  const dispatch = useAppDispatch();
  const wishlistItems = useAppSelector(state => state.wishlist.items);

  const [sortBy, setSortBy] = useState<SortOption>('recent');

  // Sort wishlist items
  const sortedItems: WishlistItem[] = [...wishlistItems].sort((a, b) => {
    if (sortBy === 'price_asc') {
      return a.product.price - b.product.price;
    }
    if (sortBy === 'price_desc') {
      return b.product.price - a.product.price;
    }
    return (b.addedAt || 0) - (a.addedAt || 0); // recent
  });

  const totalValue = wishlistItems.reduce(
    (sum, item) => sum + item.product.price,
    0,
  );

  const handleAddAllToCart = useCallback(() => {
    wishlistItems.forEach(item => dispatch(addToCart(item.product)));
    Toast.show({
      type: 'success',
      text1: 'Added All to Cart',
      text2: `${wishlistItems.length} items added!`,
    });
  }, [wishlistItems, dispatch]);

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name="heart-outline"
        size={64}
        color="#EF4444"
        style={styles.emptyIcon}
      />
      <Text
        style={[
          styles.emptyTitle,
          {color: colors.text, fontFamily: fonts.bold, fontSize: fontSizes.lg},
        ]}>
        Your Wishlist is empty
      </Text>
      <Text
        style={[
          styles.emptySubtitle,
          {
            color: colors.textSecondary,
            fontFamily: fonts.regular,
            fontSize: fontSizes.md,
          },
        ]}>
        Keep track of items you love by tapping the heart icon on any product.
      </Text>
      <Button
        title="Explore Products"
        onPress={() => navigation.navigate('Home')}
        style={styles.exploreBtn}
      />
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* ── Header ── */}
      <View
        style={[
          styles.header,
          {borderBottomColor: colors.border, borderBottomWidth: 1},
        ]}>
        <View>
          <Text
            style={[
              styles.headerTitle,
              {
                color: colors.text,
                fontFamily: fonts.bold,
                fontSize: fontSizes.lg,
              },
            ]}>
            My Wishlist
          </Text>
          {wishlistItems.length > 0 && (
            <Text
              style={[
                styles.headerSub,
                {color: colors.textSecondary, fontFamily: fonts.regular},
              ]}>
              {wishlistItems.length}{' '}
              {wishlistItems.length === 1 ? 'item' : 'items'}
            </Text>
          )}
        </View>

        {/* Total Value Chip */}
        {wishlistItems.length > 0 && (
          <View
            style={[
              styles.totalChip,
              {
                backgroundColor: colors.primary + '15',
                borderColor: colors.primary + '30',
              },
            ]}>
            <Ionicons
              name="pricetag-outline"
              size={14}
              color={colors.primary}
            />
            <Text
              style={[
                styles.totalChipText,
                {color: colors.primary, fontFamily: fonts.bold},
              ]}>
              {formatCurrency(totalValue)}
            </Text>
          </View>
        )}
      </View>

      {wishlistItems.length > 0 && (
        <>
          {/* ── Sort Bar ── */}
          <View
            style={[
              styles.sortBar,
              {borderBottomColor: colors.border, borderBottomWidth: 1},
            ]}>
            <Text
              style={[
                styles.sortLabel,
                {color: colors.textSecondary, fontFamily: fonts.medium},
              ]}>
              Sort by:
            </Text>
            <View style={styles.sortChips}>
              {SORT_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.key}
                  onPress={() => setSortBy(opt.key)}
                  style={[
                    styles.sortChip,
                    {
                      backgroundColor:
                        sortBy === opt.key ? colors.primary : colors.card,
                      borderColor:
                        sortBy === opt.key ? colors.primary : colors.border,
                    },
                  ]}
                  activeOpacity={0.8}>
                  <Text
                    style={[
                      styles.sortChipText,
                      {
                        color:
                          sortBy === opt.key ? '#FFF' : colors.textSecondary,
                        fontFamily:
                          sortBy === opt.key ? fonts.semiBold : fonts.regular,
                      },
                    ]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ── Product Grid ── */}
          <FlatList
            data={sortedItems}
            keyExtractor={item => item.product.id.toString()}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({item}) => (
              <View style={styles.cardWrapper}>
                <ProductCard
                  product={item.product}
                  onPress={() =>
                    navigation.navigate('ProductDetail', {
                      productId: item.product.id,
                    })
                  }
                />
              </View>
            )}
          />

          {/* ── Add All to Cart Bottom Button ── */}
          <View
            style={[
              styles.bottomBar,
              {
                backgroundColor: colors.card,
                borderTopColor: colors.border,
                borderTopWidth: 1,
              },
            ]}>
            <Button
              title={`Add All to Cart (${wishlistItems.length})`}
              onPress={handleAddAllToCart}
              style={styles.addAllBtn}
            />
          </View>
        </>
      )}

      {wishlistItems.length === 0 && renderEmptyState()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(4.27),
    paddingTop: hp(1.5),
    paddingBottom: hp(1.5),
  },
  headerTitle: {letterSpacing: 0.2},
  headerSub: {fontSize: fp(3.2), marginTop: hp(0.25)},
  totalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1.5),
    paddingHorizontal: wp(3.5),
    paddingVertical: hp(0.8),
    borderRadius: wp(5.0),
    borderWidth: 1,
  },
  totalChipText: {fontSize: fp(3.73)},
  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4.27),
    paddingVertical: hp(1.2),
    gap: wp(3.0),
  },
  sortLabel: {fontSize: fp(3.2)},
  sortChips: {flexDirection: 'row', gap: wp(2.0)},
  sortChip: {
    paddingHorizontal: wp(3.2),
    paddingVertical: hp(0.6),
    borderRadius: wp(3.5),
    borderWidth: 1,
  },
  sortChipText: {fontSize: fp(3.2)},
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: wp(4.27),
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: hp(10),
    paddingTop: hp(1.0),
  },
  cardWrapper: {flex: 0.48},
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: wp(4.27),
    paddingVertical: hp(1.5),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 8,
  },
  addAllBtn: {height: hp(6.4), borderRadius: wp(3.73)},
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(8.53),
    marginTop: hp(7.88),
  },
  emptyIcon: {marginBottom: hp(2.0)},
  emptyTitle: {marginBottom: hp(1.0)},
  emptySubtitle: {
    textAlign: 'center',
    lineHeight: hp(2.46),
    marginBottom: hp(2.96),
  },
  exploreBtn: {width: wp(48.0), height: hp(5.9)},
});
