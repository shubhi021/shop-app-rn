import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme} from '../../hooks/useTheme';
import Button from './Button';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorMessage({message, onRetry}: ErrorMessageProps) {
  const {colors, fontSizes, fontWeights} = useTheme();

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.title,
          {
            color: colors.error,
            fontSize: fontSizes.lg,
            fontWeight: fontWeights.bold,
          },
        ]}>
        Oops!
      </Text>
      <Text
        style={[
          styles.message,
          {color: colors.textSecondary, fontSize: fontSizes.md},
        ]}>
        {message}
      </Text>
      {onRetry ? (
        <Button
          title="Try Again"
          onPress={onRetry}
          variant="outline"
          style={styles.button}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    marginBottom: 8,
  },
  message: {
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    minWidth: 150,
  },
});
