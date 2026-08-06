import cartReducer, {addToCart, clearCart} from '../src/store/slices/cartSlice';
import {Product} from '../src/types';

describe('cartSlice reducer', () => {
  const initialState = {
    items: [],
    total: 0,
    totalCo2Grams: 0,
    totalPfand: 0,
    isGoGreenShipping: true,
    vat19Amount: 0,
    vat7Amount: 0,
  };

  const mockProduct: Product = {
    id: 1,
    title: 'Test Product',
    price: 10,
    description: 'Test Description',
    category: 'Test Category',
    image: 'https://example.com/image.jpg',
    rating: {rate: 4.5, count: 10},
    co2Grams: 500,
    hasPfand: true,
    pfandAmount: 0.25,
    vatRate: 0.19,
  };

  it('should handle initial state', () => {
    expect(cartReducer(undefined, {type: 'unknown'})).toEqual(initialState);
  });

  it('should handle addToCart and calculate totals including CO2 and VAT', () => {
    const nextState = cartReducer(initialState, addToCart(mockProduct));

    expect(nextState.items.length).toBe(1);
    expect(nextState.items[0].quantity).toBe(1);
    expect(nextState.total).toBe(10);
    expect(nextState.totalCo2Grams).toBe(500);
    expect(nextState.totalPfand).toBe(0.25);
    // 10 * (0.19 / 1.19) = 1.5966...
    expect(nextState.vat19Amount).toBeCloseTo(1.5966, 3);
  });

  it('should handle clearCart', () => {
    const stateWithItems = cartReducer(initialState, addToCart(mockProduct));
    expect(stateWithItems.items.length).toBe(1);

    const clearedState = cartReducer(stateWithItems, clearCart());
    expect(clearedState.items.length).toBe(0);
    expect(clearedState.total).toBe(0);
    expect(clearedState.totalCo2Grams).toBe(0);
  });
});
