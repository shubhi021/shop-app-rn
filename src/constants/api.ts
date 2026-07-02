export const API_BASE_URL = 'https://fakestoreapi.com';

export const ENDPOINTS = {
  products: '/products',
  categories: '/products/categories',
  productsByCategory: (category: string) =>
    `/products/category/${category}`,
  product: (id: number) => `/products/${id}`,
};