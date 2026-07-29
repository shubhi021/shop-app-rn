import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../hooks/useTheme';
import { useAppSelector } from '../../store/hooks';
import ProductCard from '../../components/product/ProductCard';
import Button from '../../components/common/Button';
import { hp, wp, fp } from '../../theme/dimensions';

export default function WishlistScreen({ navigation }: any) {
  const { colors, fonts, fontSizes, fontWeights, isDark } = useTheme();
  const wishlistItems = useAppSelector((state) => state.wishlist.items);

  const renderEmptyState = () => {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="heart-outline" size={64} color="#EF4444" style={styles.emptyIcon} />
        <Text style={[styles.emptyTitle, { color: colors.text, fontFamily: fonts.bold, fontSize: fontSizes.lg }]}>
          Your Wishlist is empty
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.textSecondary, fontFamily: fonts.regular, fontSize: fontSizes.md }]}>
          Keep track of items you love by tapping the heart icon on any product.
        </Text>
        <Button title="Explore Products" onPress={() => navigation.navigate('Home')} style={styles.exploreBtn} />
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      {/* Header Title */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text, fontFamily: fonts.bold, fontSize: fontSizes.lg }]}>
          My Wishlist ({wishlistItems.length})
        </Text>
      </View>

      <FlatList
        data={wishlistItems}
        keyExtractor={(item) => item.product.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        renderItem={({ item }) => (
          <ProductCard
            product={item.product}
            onPress={() => navigation.navigate('ProductDetail', { productId: item.product.id })}
          />
        )}
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
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: wp(4.27),
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: hp(2.96),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(8.53),
    marginTop: hp(7.88),
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
  exploreBtn: {
    width: wp(48.0),
    height: hp(5.9),
  },
});