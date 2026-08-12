import wishlistReducer, {
  addToWishlist,
  clearWishlist,
  removeFromWishlist,
  setWishlist,
} from '../src/store/slices/wishlistSlice';
import {Product} from '../src/types';

describe('wishlistSlice reducer', () => {
  const initialState = {
    items: [],
  };

  const mockProduct: Product = {
    id: 1,
    title: 'Test Product',
    price: 10,
    description: 'Test Description',
    category: 'Test Category',
    image: 'https://example.com/image.jpg',
    rating: {rate: 4.5, count: 10},
  };

  it('should handle initial state', () => {
    expect(wishlistReducer(undefined, {type: 'unknown'})).toEqual(initialState);
  });

  it('should handle setWishlist', () => {
    const mockWishlistItem = {product: mockProduct, addedAt: 123456789};
    const nextState = wishlistReducer(
      initialState,
      setWishlist([mockWishlistItem]),
    );
    expect(nextState.items.length).toBe(1);
    expect(nextState.items[0]).toEqual(mockWishlistItem);
  });

  it('should handle addToWishlist with new product', () => {
    const nextState = wishlistReducer(initialState, addToWishlist(mockProduct));
    expect(nextState.items.length).toBe(1);
    expect(nextState.items[0].product).toEqual(mockProduct);
    expect(nextState.items[0].addedAt).toBeDefined();
  });

  it('should handle addToWishlist with existing product (should not duplicate)', () => {
    const stateWithItem = wishlistReducer(
      initialState,
      addToWishlist(mockProduct),
    );
    const nextState = wishlistReducer(
      stateWithItem,
      addToWishlist(mockProduct),
    );
    expect(nextState.items.length).toBe(1);
  });

  it('should handle removeFromWishlist', () => {
    const stateWithItem = wishlistReducer(
      initialState,
      addToWishlist(mockProduct),
    );
    const nextState = wishlistReducer(
      stateWithItem,
      removeFromWishlist(mockProduct.id),
    );
    expect(nextState.items.length).toBe(0);
  });

  it('should handle clearWishlist', () => {
    const stateWithItem = wishlistReducer(
      initialState,
      addToWishlist(mockProduct),
    );
    const nextState = wishlistReducer(stateWithItem, clearWishlist());
    expect(nextState.items.length).toBe(0);
  });
});
