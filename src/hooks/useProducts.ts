import {useState, useEffect, useCallback} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Product} from '../types';
import {ProductService} from '../services/api';

const CACHE_KEY = 'shop_app_cached_products';

export const useProducts = (initialCategory: string = 'All') => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async (category: string) => {
    setLoading(true);
    setError(null);
    try {
      let data: Product[];
      if (category && category !== 'All') {
        const apiCategory = category.toLowerCase();
        data = await ProductService.getProductsByCategory(apiCategory);
      } else {
        data = await ProductService.getAllProducts();
      }

      setProducts(data);

      // Save to local cache for offline resilience
      if (data && data.length > 0) {
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
      }
    } catch (err: any) {
      console.log(
        'Network fetch failed, loading offline cached products...',
        err,
      );
      setError(err.message || 'Failed to fetch products');

      // Offline Fallback: Load cached products from AsyncStorage
      try {
        const cachedData = await AsyncStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const parsed: Product[] = JSON.parse(cachedData);
          if (category && category !== 'All') {
            const filtered = parsed.filter(
              p => p.category.toLowerCase() === category.toLowerCase(),
            );
            setProducts(filtered);
          } else {
            setProducts(parsed);
          }
        }
      } catch (cacheErr) {
        console.error('Failed to load offline product cache:', cacheErr);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(initialCategory);
  }, [initialCategory, fetchProducts]);

  return {
    products,
    loading,
    error,
    refreshProducts: (category: string = 'All') => fetchProducts(category),
    refetchWithCategory: (category: string) => fetchProducts(category),
  };
};
