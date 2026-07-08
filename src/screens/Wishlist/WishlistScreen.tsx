import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAppSelector } from '../../store/hooks';
import ProductCard from '../../components/product/ProductCard';
import Button from '../../components/common/Button';

export default function WishlistScreen({ navigation }: any) {
  const { colors, fonts, fontSizes, fontWeights, isDark } = useTheme();
  const wishlistItems = useAppSelector((state) => state.wishlist.items);

  const renderEmptyState = () => {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>❤️</Text>
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitle: {
    letterSpacing: 0.2,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: 64,
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
  exploreBtn: {
    width: 180,
    height: 48,
  },
});