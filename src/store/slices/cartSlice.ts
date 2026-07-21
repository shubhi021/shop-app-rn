import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {CartItem, Product} from '../../types';

interface CartState {
  items: CartItem[];
  total: number;
  totalCo2Grams: number;
  totalPfand: number;
  isGoGreenShipping: boolean;
  vat19Amount: number;
  vat7Amount: number;
}

const initialState: CartState = {
  items: [],
  total: 0,
  totalCo2Grams: 0,
  totalPfand: 0,
  isGoGreenShipping: true,
  vat19Amount: 0,
  vat7Amount: 0,
};

const calculateTotal = (items: CartItem[]): number => {
  return items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
};

const calculateCo2 = (items: CartItem[]): number => {
  return items.reduce((sum, item) => {
    const co2PerUnit = item.product.co2Grams || Math.round(item.product.price * 25);
    return sum + co2PerUnit * item.quantity;
  }, 0);
};

const calculatePfand = (items: CartItem[]): number => {
  return items.reduce((sum, item) => {
    const pfand = item.product.pfandAmount || (item.product.hasPfand ? 0.25 : 0);
    return sum + pfand * item.quantity;
  }, 0);
};

const calculateVat = (items: CartItem[]) => {
  let vat19 = 0;
  let vat7 = 0;
  items.forEach(item => {
    const itemTotal = item.product.price * item.quantity;
    const rate = item.product.vatRate || 0.19;
    // German MwSt calculation from gross price: tax = gross * (rate / (1 + rate))
    const tax = itemTotal * (rate / (1 + rate));
    if (rate === 0.07) {
      vat7 += tax;
    } else {
      vat19 += tax;
    }
  });
  return { vat19Amount: vat19, vat7Amount: vat7 };
};

const saveCartToStorage = async (items: CartItem[]) => {
  try {
    await AsyncStorage.setItem('shop_app_cart', JSON.stringify(items));
  } catch (error) {
    console.error('Error saving cart to storage:', error);
  }
};

const updateStateTotals = (state: CartState) => {
  state.total = calculateTotal(state.items);
  state.totalCo2Grams = calculateCo2(state.items);
  state.totalPfand = calculatePfand(state.items);
  const { vat19Amount, vat7Amount } = calculateVat(state.items);
  state.vat19Amount = vat19Amount;
  state.vat7Amount = vat7Amount;
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      updateStateTotals(state);
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
      updateStateTotals(state);
      saveCartToStorage(state.items);
    },

    removeFromCart: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(
        item => item.product.id !== action.payload,
      );
      updateStateTotals(state);
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
      updateStateTotals(state);
      saveCartToStorage(state.items);
    },

    toggleGoGreenShipping: (state, action: PayloadAction<boolean | undefined>) => {
      state.isGoGreenShipping = action.payload !== undefined ? action.payload : !state.isGoGreenShipping;
    },

    clearCart: state => {
      state.items = [];
      state.total = 0;
      state.totalCo2Grams = 0;
      state.totalPfand = 0;
      state.vat19Amount = 0;
      state.vat7Amount = 0;
      saveCartToStorage([]);
    },
  },
});

export const {setCart, addToCart, removeFromCart, updateQuantity, toggleGoGreenShipping, clearCart} =
  cartSlice.actions;
export default cartSlice.reducer;