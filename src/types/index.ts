export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
  co2Grams?: number; // CO2 footprint in grams
  ecoScore?: 'A' | 'B' | 'C' | 'D' | 'E'; // Sustainability score
  hasPfand?: boolean; // Bottle deposit
  pfandAmount?: number; // Pfand amount in EUR (e.g. 0.25)
  vatRate?: number; // 0.19 or 0.07 (German MwSt)
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface WishlistItem {
  product: Product;
  addedAt: number;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  ProductDetail: { productId: number };
  Checkout: undefined;
  OrderSuccess: undefined;
  Impressum: undefined;
  PrivacySettings: undefined;
  Notifications: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Cart: undefined;
  Wishlist: undefined;
  Profile: undefined;
};

declare module 'firebase/auth' {
  export function getReactNativePersistence(storage: any): any;
}