import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useTheme} from '../../hooks/useTheme';
import {useDebounce} from '../../hooks/useDebounce';
import {ProductService} from '../../services/api';
import {Product} from '../../types';
import ProductCard from '../../components/product/ProductCard';
import {hp, wp, fp} from '../../theme/dimensions';

const CATEGORIES = [
  'All',
  'Electronics',
  'Jewelery',
  "Men's Clothing",
  "Women's Clothing",
];

export default function SearchScreen({navigation}: any) {
  const {colors, fonts, fontSizes, fontWeights, isDark} = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedQuery = useDebounce(searchQuery, 400);

  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        let items: Product[] = [];

        // 1. Fetch based on search term
        if (debouncedQuery.trim()) {
          items = await ProductService.searchProducts(debouncedQuery.trim());
        } else {
          // If no search query, show category items or all
          if (selectedCategory === 'All') {
            items = await ProductService.getAllProducts();
          } else {
            items = await ProductService.getProductsByCategory(
              selectedCategory.toLowerCase(),
            );
          }
        }

        // 2. Filter by category locally if a query was active and category is not 'All'
        if (debouncedQuery.trim() && selectedCategory !== 'All') {
          items = items.filter(
            item =>
              item.category.toLowerCase() === selectedCategory.toLowerCase(),
          );
        }

        setResults(items);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch search results.');
        // Offline Fallback for SearchScreen
        try {
          const cachedData = await AsyncStorage.getItem(
            'shop_app_cached_products',
          );
          if (cachedData) {
            let cachedItems: Product[] = JSON.parse(cachedData);
            if (debouncedQuery.trim()) {
              cachedItems = cachedItems.filter(p =>
                p.title
                  .toLowerCase()
                  .includes(debouncedQuery.trim().toLowerCase()),
              );
            }
            if (selectedCategory !== 'All') {
              cachedItems = cachedItems.filter(
                p =>
                  p.category.toLowerCase() === selectedCategory.toLowerCase(),
              );
            }
            setResults(cachedItems);
          }
        } catch (cacheErr) {
          console.error('SearchScreen offline cache error:', cacheErr);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [debouncedQuery, selectedCategory]);

  const clearSearch = () => {
    setSearchQuery('');
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  const renderEmptyState = () => {
    if (loading) {
      return null;
    }
    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="search-outline"
          size={48}
          color={colors.textTertiary}
          style={styles.emptyIcon}
        />
        <Text
          style={[
            styles.emptyTitle,
            {
              color: colors.text,
              fontFamily: fonts.bold,
              fontSize: fontSizes.lg,
            },
          ]}>
          No results found
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
          We couldn't find any products matching "{searchQuery}" in category "
          {selectedCategory}".
        </Text>
        <TouchableOpacity
          style={[styles.resetBtn, {backgroundColor: colors.primary}]}
          onPress={() => {
            setSearchQuery('');
            setSelectedCategory('All');
          }}>
          <Text style={[styles.resetBtnText, {fontFamily: fonts.bold}]}>
            Reset Search & Filters
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* Header Search Input */}
      <View style={styles.header}>
        <View
          style={[
            styles.searchContainer,
            {backgroundColor: colors.surface, borderColor: colors.border},
          ]}>
          <Ionicons
            name="search-outline"
            size={18}
            color={colors.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            placeholder="Search premium items, styles..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[
              styles.input,
              {
                color: colors.text,
                fontFamily: fonts.regular,
                fontSize: fontSizes.md,
              },
            ]}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={clearSearch} style={styles.clearBtn}>
              <Ionicons
                name="close-circle"
                size={18}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Categories Horizontal Scroll */}
      <View style={styles.categoriesContainer}>
        <FlatList
          data={CATEGORIES}
          keyExtractor={item => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
          renderItem={({item}) => {
            const isSelected = selectedCategory === item;
            return (
              <TouchableOpacity
                onPress={() => handleCategorySelect(item)}
                style={[
                  styles.categoryBtn,
                  {
                    backgroundColor: isSelected
                      ? colors.primary
                      : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                activeOpacity={0.8}>
                <Text
                  style={[
                    styles.categoryText,
                    {
                      color: isSelected ? '#FFFFFF' : colors.text,
                      fontFamily: isSelected ? fonts.bold : fonts.medium,
                      fontSize: fontSizes.sm,
                    },
                  ]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Search Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text
            style={[
              styles.loadingText,
              {color: colors.textSecondary, fontFamily: fonts.medium},
            ]}>
            Searching for styles...
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          renderItem={({item}) => (
            <ProductCard
              product={item}
              onPress={() =>
                navigation.navigate('ProductDetail', {productId: item.id})
              }
            />
          )}
        />
      )}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: hp(5.9),
    borderWidth: 1,
    borderRadius: wp(3.73),
    paddingHorizontal: wp(3.2),
  },
  searchIcon: {
    marginRight: wp(2.13),
  },
  input: {
    flex: 1,
    height: '100%',
    padding: 0,
  },
  clearBtn: {
    paddingHorizontal: wp(2.13),
    paddingVertical: hp(0.5),
  },
  categoriesContainer: {
    marginBottom: hp(1.5),
  },
  categoriesList: {
    paddingHorizontal: wp(3.2),
  },
  categoryBtn: {
    paddingHorizontal: wp(4.27),
    paddingVertical: hp(1.0),
    borderRadius: wp(3.2),
    borderWidth: 1,
    marginHorizontal: wp(1.07),
  },
  categoryText: {
    textAlign: 'center',
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
  resetBtn: {
    paddingHorizontal: wp(5.33),
    paddingVertical: hp(1.5),
    borderRadius: wp(3.2),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resetBtnText: {
    color: '#FFFFFF',
    fontSize: fp(3.73),
  },
});
