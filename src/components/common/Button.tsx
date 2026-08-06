import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import {useTheme} from '../../hooks/useTheme';
import {hp, wp, fp} from '../../theme/dimensions';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'solid' | 'outline' | 'text';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export default function Button({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'solid',
  style,
  textStyle,
}: ButtonProps) {
  const {colors, fonts, fontSizes, fontWeights} = useTheme();

  const getButtonStyle = (): ViewStyle => {
    const base: ViewStyle = {
      height: variant === 'text' ? undefined : hp(5.9),
      borderRadius: wp(3.2),
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: variant === 'text' ? 0 : wp(4.27),
      flexDirection: 'row',
    };

    if (variant === 'solid') {
      return {
        ...base,
        backgroundColor: disabled ? colors.border : colors.primary,
      };
    } else if (variant === 'outline') {
      return {
        ...base,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: disabled ? colors.border : colors.primary,
      };
    } else {
      return {
        ...base,
        height: 'auto',
        paddingHorizontal: 0,
        backgroundColor: 'transparent',
      };
    }
  };

  const getTextStyle = () => {
    const base: TextStyle = {
      fontSize: fontSizes.md,
      fontFamily: fonts.semiBold,
    };

    if (variant === 'solid') {
      return {
        ...base,
        color: '#FFFFFF',
      };
    } else {
      return {
        ...base,
        color: disabled ? colors.textTertiary : colors.primary,
      };
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[getButtonStyle(), style]}
      activeOpacity={0.8}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'solid' ? '#FFFFFF' : colors.primary}
        />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
