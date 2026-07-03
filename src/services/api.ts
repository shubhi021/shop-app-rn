import axios from 'axios';
import {Product} from '../types';
import {API_BASE_URL, ENDPOINTS} from '../constants/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — logs every request
apiClient.interceptors.request.use(
  config => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  error => Promise.reject(error),
);

// Response interceptor — handles errors globally
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timed out. Check your connection.');
    }
    if (!error.response) {
      throw new Error('Network error. Check your internet connection.');
    }
    throw new Error(error.response.data?.message || 'Something went wrong.');
  },
);

export const ProductService = {
  getAllProducts: async (limit?: number): Promise<Product[]> => {
    const url = limit
      ? `${ENDPOINTS.products}?limit=${limit}`
      : ENDPOINTS.products;
    const response = await apiClient.get<Product[]>(url);
    return response.data;
  },

  getProductById: async (id: number): Promise<Product> => {
    const response = await apiClient.get<Product>(ENDPOINTS.product(id));
    return response.data;
  },

  getCategories: async (): Promise<string[]> => {
    const response = await apiClient.get<string[]>(ENDPOINTS.categories);
    return response.data;
  },

  getProductsByCategory: async (category: string): Promise<Product[]> => {
    const response = await apiClient.get<Product[]>(
      ENDPOINTS.productsByCategory(category),
    );
    return response.data;
  },

  searchProducts: async (query: string): Promise<Product[]> => {
    const all = await ProductService.getAllProducts();
    return all.filter(
      p =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase()),
    );
  },
};