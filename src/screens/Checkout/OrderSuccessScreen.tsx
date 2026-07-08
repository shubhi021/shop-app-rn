import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import Button from '../../components/common/Button';

export default function OrderSuccessScreen({ navigation }: any) {
  const { colors, fonts, fontSizes, fontWeights, isDark } = useTheme();

  const handleContinueShopping = () => {
    // Reset the navigation stack to prevent going back to checkout screens
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      <View style={styles.content}>
        {/* Success Icon Badge */}
        <View style={[styles.successIconBadge, { backgroundColor: colors.success + '15' }]}>
          <Text style={styles.successEmoji}>🎉</Text>
        </View>

        {/* Success Text */}
        <Text style={[styles.title, { color: colors.text, fontFamily: fonts.bold, fontSize: fontSizes.xxl }]}>
          Order Placed!
        </Text>
        
        <Text style={[styles.subtitle, { color: colors.textSecondary, fontFamily: fonts.regular, fontSize: fontSizes.md }]}>
          Thank you for your purchase. Your order has been placed successfully and is being processed.
        </Text>

        {/* Info card */}
        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary, fontFamily: fonts.medium }]}>
              Estimated Delivery
            </Text>
            <Text style={[styles.infoValue, { color: colors.text, fontFamily: fonts.bold }]}>
              3–5 Business Days
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Text style={[styles.infoSubText, { color: colors.textTertiary, fontFamily: fonts.regular }]}>
            You can monitor your order history at any time in the Profile tab.
          </Text>
        </View>
      </View>

      {/* Action Button */}
      <View style={styles.footer}>
        <Button
          title="Continue Shopping"
          onPress={handleContinueShopping}
          style={styles.continueBtn}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  successIconBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  successEmoji: {
    fontSize: 54,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  infoCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 12,
  },
  infoSubText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  footer: {
    padding: 24,
  },
  continueBtn: {
    height: 52,
    borderRadius: 14,
  },
});