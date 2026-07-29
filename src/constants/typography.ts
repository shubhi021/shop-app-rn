import { Platform } from 'react-native';
import { fp } from '../theme/dimensions';

export const Fonts = {
  regular: Platform.OS === 'ios' ? 'Inter18pt-Regular' : 'Inter_18pt-Regular',
  medium: Platform.OS === 'ios' ? 'Inter18pt-Medium' : 'Inter_18pt-Medium',
  semiBold: Platform.OS === 'ios' ? 'Inter18pt-SemiBold' : 'Inter_18pt-SemiBold',
  bold: Platform.OS === 'ios' ? 'Inter18pt-Bold' : 'Inter_18pt-Bold',
};

export const FontSizes = {
  xs: fp(2.93),  // 11
  sm: fp(3.47),  // 13
  md: fp(4.0),   // 15
  lg: fp(4.53),  // 17
  xl: fp(5.33),  // 20
  xxl: fp(6.4),  // 24
  xxxl: fp(8.0), // 30
};

export const FontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
};