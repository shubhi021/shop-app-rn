import { Platform } from 'react-native';

export const Fonts = {
  regular: Platform.OS === 'ios' ? 'Inter18pt-Regular' : 'Inter_18pt-Regular',
  medium: Platform.OS === 'ios' ? 'Inter18pt-Medium' : 'Inter_18pt-Medium',
  semiBold: Platform.OS === 'ios' ? 'Inter18pt-SemiBold' : 'Inter_18pt-SemiBold',
  bold: Platform.OS === 'ios' ? 'Inter18pt-Bold' : 'Inter_18pt-Bold',
};

export const FontSizes = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 30,
};

export const FontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
};