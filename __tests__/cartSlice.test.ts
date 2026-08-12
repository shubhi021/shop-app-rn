import cartReducer, {
  addToCart,
  clearCart,
  removeFromCart,
  setCart,
  toggleGoGreenShipping,
  updateQuantity,
} from '../src/store/slices/cartSlice';
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

  const mockProduct2: Product = {
    id: 2,
    title: 'Another Product',
    price: 20,
    description: 'Another Description',
    category: 'Test Category',
    image: 'https://example.com/image2.jpg',
    rating: {rate: 4.0, count: 5},
    co2Grams: 100,
    hasPfand: false,
    pfandAmount: 0,
    vatRate: 0.07,
  };

  it('should handle initial state', () => {
    expect(cartReducer(undefined, {type: 'unknown'})).toEqual(initialState);
  });

  it('should handle setCart', () => {
    const nextState = cartReducer(
      initialState,
      setCart([{product: mockProduct, quantity: 2}]),
    );
    expect(nextState.items.length).toBe(1);
    expect(nextState.items[0].quantity).toBe(2);
    expect(nextState.total).toBe(20);
    expect(nextState.totalCo2Grams).toBe(1000);
    expect(nextState.totalPfand).toBe(0.5);
    // 20 * (0.19 / 1.19)
    expect(nextState.vat19Amount).toBeCloseTo(3.193, 2);
  });

  it('should handle addToCart with new product', () => {
    const nextState = cartReducer(initialState, addToCart(mockProduct));

    expect(nextState.items.length).toBe(1);
    expect(nextState.items[0].quantity).toBe(1);
    expect(nextState.total).toBe(10);
    expect(nextState.totalCo2Grams).toBe(500);
    expect(nextState.totalPfand).toBe(0.25);
    expect(nextState.vat19Amount).toBeCloseTo(1.5966, 3);
  });

  it('should handle addToCart with existing product', () => {
    const stateWithItem = cartReducer(initialState, addToCart(mockProduct));
    const nextState = cartReducer(stateWithItem, addToCart(mockProduct));

    expect(nextState.items.length).toBe(1);
    expect(nextState.items[0].quantity).toBe(2);
    expect(nextState.total).toBe(20);
    expect(nextState.totalCo2Grams).toBe(1000);
    expect(nextState.totalPfand).toBe(0.5);
  });

  it('should handle removeFromCart', () => {
    const stateWithItems = cartReducer(
      initialState,
      setCart([
        {product: mockProduct, quantity: 1},
        {product: mockProduct2, quantity: 1},
      ]),
    );
    expect(stateWithItems.items.length).toBe(2);

    const nextState = cartReducer(
      stateWithItems,
      removeFromCart(mockProduct.id),
    );
    expect(nextState.items.length).toBe(1);
    expect(nextState.items[0].product.id).toBe(mockProduct2.id);
    expect(nextState.total).toBe(20);
    expect(nextState.totalCo2Grams).toBe(100);
    expect(nextState.totalPfand).toBe(0);
    expect(nextState.vat19Amount).toBe(0);
    expect(nextState.vat7Amount).toBeCloseTo(1.308, 2); // 20 * (0.07 / 1.07)
  });

  it('should handle updateQuantity to a valid quantity', () => {
    const stateWithItem = cartReducer(initialState, addToCart(mockProduct));
    const nextState = cartReducer(
      stateWithItem,
      updateQuantity({productId: mockProduct.id, quantity: 5}),
    );

    expect(nextState.items[0].quantity).toBe(5);
    expect(nextState.total).toBe(50);
  });

  it('should handle updateQuantity to zero (removes item)', () => {
    const stateWithItem = cartReducer(initialState, addToCart(mockProduct));
    const nextState = cartReducer(
      stateWithItem,
      updateQuantity({productId: mockProduct.id, quantity: 0}),
    );

    expect(nextState.items.length).toBe(0);
    expect(nextState.total).toBe(0);
  });

  it('should handle toggleGoGreenShipping without payload', () => {
    expect(initialState.isGoGreenShipping).toBe(true);
    const nextState = cartReducer(initialState, toggleGoGreenShipping());
    expect(nextState.isGoGreenShipping).toBe(false);
    const state2 = cartReducer(nextState, toggleGoGreenShipping());
    expect(state2.isGoGreenShipping).toBe(true);
  });

  it('should handle toggleGoGreenShipping with payload', () => {
    const nextState = cartReducer(initialState, toggleGoGreenShipping(false));
    expect(nextState.isGoGreenShipping).toBe(false);
    const state2 = cartReducer(nextState, toggleGoGreenShipping(false));
    expect(state2.isGoGreenShipping).toBe(false);
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
