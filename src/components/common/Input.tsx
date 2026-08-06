import React, {useMemo} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  KeyboardTypeOptions,
  TextInputProps,
} from 'react-native';
import {useTheme} from '../../hooks/useTheme';
import {hp, wp, fp} from '../../theme/dimensions';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string | null;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

const Input = React.forwardRef<TextInput, InputProps>(
  ({label, error, style, inputStyle, ...restProps}, ref) => {
    const {colors, fonts, fontSizes} = useTheme();

    const combinedInputStyle = useMemo(
      () => [
        styles.input,
        {
          color: colors.text,
          borderColor: error ? colors.error : colors.border,
          backgroundColor: colors.surface,
          fontSize: fontSizes.md,
          fontFamily: fonts.regular,
        },
        inputStyle,
      ],
      [
        colors.text,
        colors.error,
        colors.border,
        colors.surface,
        error,
        fontSizes.md,
        fonts.regular,
        inputStyle,
      ],
    );

    return (
      <View style={[styles.container, style]}>
        {label ? (
          <Text
            style={[
              styles.label,
              {
                color: colors.textSecondary,
                fontSize: fontSizes.sm,
                fontFamily: fonts.medium,
              },
            ]}>
            {label}
          </Text>
        ) : null}
        <TextInput
          ref={ref}
          placeholderTextColor={colors.textTertiary}
          style={combinedInputStyle}
          {...restProps}
        />
        {error ? (
          <Text
            style={[
              styles.errorText,
              {
                color: colors.error,
                fontSize: fontSizes.sm,
                fontFamily: fonts.regular,
              },
            ]}>
            {error}
          </Text>
        ) : null}
      </View>
    );
  },
);

export default Input;

const styles = StyleSheet.create({
  container: {
    marginBottom: hp(2.0),
    width: '100%',
  },
  label: {
    marginBottom: hp(0.74),
  },
  input: {
    height: hp(5.9),
    borderWidth: 1,
    borderRadius: wp(3.2),
    paddingHorizontal: wp(4.27),
  },
  errorText: {
    marginTop: hp(0.5),
    fontWeight: '400',
  },
});
