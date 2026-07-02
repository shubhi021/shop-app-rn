import {useState, useEffect, useCallback} from 'react';
import {Product} from '../types';
import {ProductService} from '../services/api';

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
        // Map clean category names to API format
        const apiCategory = category.toLowerCase();
        data = await ProductService.getProductsByCategory(apiCategory);
      } else {
        data = await ProductService.getAllProducts();
      }
      setProducts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products');
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
