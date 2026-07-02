import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {CartItem, Product} from '../../types';

interface CartState {
  items: CartItem[];
  total: number;
}

const initialState: CartState = {
  items: [],
  total: 0,
};

const calculateTotal = (items: CartItem[]): number => {
  return items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
};

const saveCartToStorage = async (items: CartItem[]) => {
  try {
    await AsyncStorage.setItem('shop_app_cart', JSON.stringify(items));
  } catch (error) {
    console.error('Error saving cart to storage:', error);
  }
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      state.total = calculateTotal(state.items);
    },

    addToCart: (state, action: PayloadAction<Product>) => {
      const existing = state.items.find(
        item => item.product.id === action.payload.id,
      );
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({product: action.payload, quantity: 1});
      }
      state.total = calculateTotal(state.items);
      saveCartToStorage(state.items);
    },

    removeFromCart: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(
        item => item.product.id !== action.payload,
      );
      state.total = calculateTotal(state.items);
      saveCartToStorage(state.items);
    },

    updateQuantity: (
      state,
      action: PayloadAction<{productId: number; quantity: number}>,
    ) => {
      const item = state.items.find(
        i => i.product.id === action.payload.productId,
      );
      if (item) {
        item.quantity = action.payload.quantity;
        if (item.quantity <= 0) {
          state.items = state.items.filter(
            i => i.product.id !== action.payload.productId,
          );
        }
      }
      state.total = calculateTotal(state.items);
      saveCartToStorage(state.items);
    },

    clearCart: state => {
      state.items = [];
      state.total = 0;
      saveCartToStorage([]);
    },
  },
});

export const {setCart, addToCart, removeFromCart, updateQuantity, clearCart} =
  cartSlice.actions;
export default cartSlice.reducer;