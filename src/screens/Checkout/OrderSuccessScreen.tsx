import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../hooks/useTheme';
import Button from '../../components/common/Button';
import { hp, wp, fp } from '../../theme/dimensions';

export default function OrderSuccessScreen({ navigation }: any) {
  const { colors, fonts, fontSizes, isDark } = useTheme();

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
          <Ionicons name="checkmark-circle-outline" size={56} color={colors.success} />
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp(6.4),
  },
  successIconBadge: {
    width: wp(25.6),
    height: wp(25.6),
    borderRadius: wp(12.8),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(2.96),
  },
  title: {
    marginBottom: hp(1.0),
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: hp(2.7),
    marginBottom: hp(3.94),
  },
  infoCard: {
    width: '100%',
    padding: wp(4.27),
    borderRadius: wp(4.27),
    borderWidth: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: fp(3.73),
  },
  infoValue: {
    fontSize: fp(3.73),
  },
  divider: {
    height: 1,
    marginVertical: hp(1.5),
  },
  infoSubText: {
    fontSize: fp(3.2),
    lineHeight: hp(1.97),
  },
  footer: {
    padding: wp(6.4),
  },
  continueBtn: {
    height: hp(6.4),
  },
});