import React, { useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  KeyboardTypeOptions,
} from 'react-native';
import {useTheme} from '../../hooks/useTheme';
import { hp, wp, fp } from '../../theme/dimensions';

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: (e: any) => void;
  placeholder?: string;
  error?: string | null;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

export default function Input({
  label,
  value,
  onChangeText,
  onBlur,
  placeholder,
  error,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'none',
  style,
  inputStyle,
}: InputProps) {
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
    [colors.text, colors.error, colors.border, colors.surface, error, fontSizes.md, fonts.regular, inputStyle]
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
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        style={combinedInputStyle}
      />
      {error ? (
        <Text
          style={[
            styles.errorText,
            {color: colors.error, fontSize: fontSizes.sm, fontFamily: fonts.regular},
          ]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

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
