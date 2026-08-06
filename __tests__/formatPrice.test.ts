import {formatPrice} from '../src/utils/formatPrice';

describe('formatPrice utility', () => {
  it('formats positive numbers correctly', () => {
    expect(formatPrice(10)).toBe('$10.00');
    expect(formatPrice(10.5)).toBe('$10.50');
    expect(formatPrice(9.99)).toBe('$9.99');
  });

  it('formats zero correctly', () => {
    expect(formatPrice(0)).toBe('$0.00');
  });

  it('rounds numbers with more than 2 decimal places', () => {
    expect(formatPrice(10.556)).toBe('$10.56');
    expect(formatPrice(10.554)).toBe('$10.55');
  });
});
