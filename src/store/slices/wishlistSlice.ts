import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Product, WishlistItem} from '../../types';

interface WishlistState {
  items: WishlistItem[];
}

const initialState: WishlistState = {
  items: [],
};

const saveWishlistToStorage = async (items: WishlistItem[]) => {
  try {
    await AsyncStorage.setItem('shop_app_wishlist', JSON.stringify(items));
  } catch (error) {
    console.error('Error saving wishlist to storage:', error);
  }
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    setWishlist: (state, action: PayloadAction<WishlistItem[]>) => {
      state.items = action.payload;
    },

    addToWishlist: (state, action: PayloadAction<Product>) => {
      const exists = state.items.find(
        item => item.product.id === action.payload.id,
      );
      if (!exists) {
        state.items.push({
          product: action.payload,
          addedAt: Date.now(),
        });
        saveWishlistToStorage(state.items);
      }
    },

    removeFromWishlist: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(
        item => item.product.id !== action.payload,
      );
      saveWishlistToStorage(state.items);
    },

    clearWishlist: state => {
      state.items = [];
      saveWishlistToStorage([]);
    },
  },
});

export const {setWishlist, addToWishlist, removeFromWishlist, clearWishlist} =
  wishlistSlice.actions;
export default wishlistSlice.reducer;