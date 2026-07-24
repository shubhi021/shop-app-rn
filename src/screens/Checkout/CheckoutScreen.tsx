import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { addDoc, collection } from 'firebase/firestore';
import { useTheme } from '../../hooks/useTheme';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { clearCart } from '../../store/slices/cartSlice';
import { db } from '../../services/firebase';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useTranslation } from '../../hooks/useTranslation';
import { CO2FootprintCard } from '../../components/CO2FootprintCard';
import { TaxBreakdownCard } from '../../components/TaxBreakdownCard';
import { KlarnaPaymentModal } from '../../components/KlarnaPaymentModal';
import { hp, wp, fp } from '../../theme/dimensions';

export default function CheckoutScreen({ navigation }: any) {
  const { colors, fonts, isDark } = useTheme();
  const { t, formatCurrency, validateGermanPLZ } = useTranslation();
  const dispatch = useAppDispatch();

  const reduxUser = useAppSelector((state) => state.auth.user);
  const { items, total: subtotal, totalPfand, isGoGreenShipping, vat19Amount, vat7Amount } = useAppSelector(
    (state) => state.cart
  );

  // Shipping logic
  const shippingFee = subtotal > 39 ? 0 : 4.99;
  const greenOffset = isGoGreenShipping ? 0.99 : 0;
  const grandTotal = subtotal + shippingFee + greenOffset;

  // Form Fields
  const [fullName, setFullName] = useState(reduxUser?.displayName || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');

  // Form Errors
  const [fullNameError, setFullNameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [cityError, setCityError] = useState<string | null>(null);
  const [zipCodeError, setZipCodeError] = useState<string | null>(null);

  // Payment Selection (DACH Region Focused)
  const [paymentMethod, setPaymentMethod] = useState<'klarna' | 'sofort' | 'sepa' | 'applePay' | 'card'>('klarna');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showKlarnaModal, setShowKlarnaModal] = useState(false);

  const validateForm = (): boolean => {
    let isValid = true;

    if (!fullName.trim()) {
      setFullNameError('Name ist erforderlich.');
      isValid = false;
    } else {
      setFullNameError(null);
    }

    if (!phone.trim() || phone.length < 8) {
      setPhoneError('Gültige Telefonnummer erforderlich.');
      isValid = false;
    } else {
      setPhoneError(null);
    }

    if (!address.trim()) {
      setAddressError('Straße & Hausnummer erforderlich.');
      isValid = false;
    } else {
      setAddressError(null);
    }

    if (!city.trim()) {
      setCityError('Stadt erforderlich.');
      isValid = false;
    } else {
      setCityError(null);
    }

    if (!validateGermanPLZ(zipCode)) {
      setZipCodeError('Gültige 5-stellige deutsche PLZ eingeben (z.B. 10115).');
      isValid = false;
    } else {
      setZipCodeError(null);
    }

    return isValid;
  };

  const executeOrder = async () => {
    if (!reduxUser?.uid) {
      Toast.show({
        type: 'error',
        text1: 'Anmeldung Erforderlich',
        text2: 'Bitte melden Sie sich an, um zu bestellen.',
      });
      return;
    }

    setIsPlacingOrder(true);
    try {
      const orderPayload = {
        userId: reduxUser.uid,
        items: items.map((item) => ({
          productId: item.product.id,
          title: item.product.title,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.image,
        })),
        total: grandTotal,
        pfandTotal: totalPfand,
        vat19: vat19Amount,
        vat7: vat7Amount,
        isGoGreenShipping,
        shippingAddress: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          city: city.trim(),
          zipCode: zipCode.trim(),
        },
        paymentMethod,
        createdAt: new Date().toISOString(),
      };

      // Save order to Firestore
      await addDoc(collection(db, 'orders'), orderPayload);

      // Clear Cart state & storage
      dispatch(clearCart());

      Toast.show({
        type: 'success',
        text1: 'Bestellung Erfolgreich! 🎉',
        text2: 'Vielen Dank für Ihren Einkauf.',
      });

      // Navigate to success screen
      navigation.replace('OrderSuccess');
    } catch (err: any) {
      console.error('Order placement failed:', err);
      Toast.show({
        type: 'error',
        text1: 'Bestellfehler',
        text2: err.message || 'Ein Fehler ist aufgetreten.',
      });
    } finally {
      setIsPlacingOrder(false);
      setShowKlarnaModal(false);
    }
  };

  const handlePlaceOrderClick = () => {
    if (!validateForm()) return;

    if (paymentMethod === 'klarna') {
      setShowKlarnaModal(true);
    } else {
      executeOrder();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Ionicons name="location-outline" size={20} color={colors.text} />
            <Text style={[styles.sectionTitle, styles.headerTitle, { color: colors.text, fontFamily: fonts.bold }]}>
              Lieferadresse
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <Input
              label="Vollständiger Name"
              placeholder="z.B. Max Mustermann"
              value={fullName}
              onChangeText={setFullName}
              error={fullNameError}
              autoCapitalize="words"
            />
            <Input
              label="Telefonnummer"
              placeholder="z.B. +49 170 1234567"
              value={phone}
              onChangeText={setPhone}
              error={phoneError}
              keyboardType="phone-pad"
            />
            <Input
              label="Straße & Hausnummer"
              placeholder="z.B. Unter den Linden 10"
              value={address}
              onChangeText={setAddress}
              error={addressError}
            />
            <View style={styles.rowInputs}>
              <Input
                label={t('cityPlaceholder')}
                placeholder="z.B. Berlin"
                value={city}
                onChangeText={setCity}
                error={cityError}
                style={{ flex: 0.58 }}
                autoCapitalize="words"
              />
              <Input
                label="PLZ (Postleitzahl)"
                placeholder="10115"
                value={zipCode}
                onChangeText={setZipCode}
                error={zipCodeError}
                style={{ flex: 0.38 }}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Eco Sustainability Section */}
          <CO2FootprintCard />

          {/* Payment Method Selector */}
          <View style={styles.headerRow}>
            <Ionicons name="card-outline" size={20} color={colors.text} />
            <Text style={[styles.sectionTitle, styles.headerTitle, { color: colors.text, fontFamily: fonts.bold }]}>
              {t('paymentMethod')} (DACH Region)
            </Text>
          </View>

          <View style={[styles.paymentCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {/* Klarna */}
            <TouchableOpacity
              onPress={() => setPaymentMethod('klarna')}
              style={[
                styles.paymentOption,
                { borderBottomWidth: 1, borderBottomColor: colors.border },
              ]}
              activeOpacity={0.8}
            >
              <View style={[styles.radioCircle, { borderColor: colors.primary }]}>
                {paymentMethod === 'klarna' && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
              </View>
              <View style={styles.paymentInfo}>
                <Text style={[styles.paymentLabel, { color: colors.text, fontFamily: fonts.semiBold }]}>
                  {t('klarnaPayLater')}
                </Text>
                <Text style={[styles.paymentSub, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
                  {t('payIn30Days')}
                </Text>
              </View>
              <Ionicons name="heart" size={18} color="#FFB3C7" />
            </TouchableOpacity>

            {/* Sofortüberweisung */}
            <TouchableOpacity
              onPress={() => setPaymentMethod('sofort')}
              style={[
                styles.paymentOption,
                { borderBottomWidth: 1, borderBottomColor: colors.border },
              ]}
              activeOpacity={0.8}
            >
              <View style={[styles.radioCircle, { borderColor: colors.primary }]}>
                {paymentMethod === 'sofort' && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
              </View>
              <View style={styles.paymentInfo}>
                <Text style={[styles.paymentLabel, { color: colors.text, fontFamily: fonts.semiBold }]}>
                  {t('sofortBank')}
                </Text>
                <Text style={[styles.paymentSub, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
                  Direktes Online-Banking mit PIN/TAN
                </Text>
              </View>
              <Ionicons name="business-outline" size={18} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* SEPA */}
            <TouchableOpacity
              onPress={() => setPaymentMethod('sepa')}
              style={[
                styles.paymentOption,
                { borderBottomWidth: 1, borderBottomColor: colors.border },
              ]}
              activeOpacity={0.8}
            >
              <View style={[styles.radioCircle, { borderColor: colors.primary }]}>
                {paymentMethod === 'sepa' && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
              </View>
              <View style={styles.paymentInfo}>
                <Text style={[styles.paymentLabel, { color: colors.text, fontFamily: fonts.semiBold }]}>
                  {t('sepaDebit')}
                </Text>
                <Text style={[styles.paymentSub, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
                  Bequem per IBAN abbuchen lassen
                </Text>
              </View>
              <Ionicons name="wallet-outline" size={18} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* Apple Pay */}
            <TouchableOpacity
              onPress={() => setPaymentMethod('applePay')}
              style={styles.paymentOption}
              activeOpacity={0.8}
            >
              <View style={[styles.radioCircle, { borderColor: colors.primary }]}>
                {paymentMethod === 'applePay' && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
              </View>
              <View style={styles.paymentInfo}>
                <Text style={[styles.paymentLabel, { color: colors.text, fontFamily: fonts.semiBold }]}>
                  {t('applePay')}
                </Text>
                <Text style={[styles.paymentSub, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
                  Schnell & sicher mit Touch/Face ID
                </Text>
              </View>
              <Ionicons name="logo-apple" size={18} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Tax Breakdown */}
          <TaxBreakdownCard />

          {/* Summary Card */}
          <View style={styles.headerRow}>
            <Ionicons name="stats-chart-outline" size={18} color={colors.text} />
            <Text style={[styles.sectionTitle, styles.headerTitle, { color: colors.text, fontFamily: fonts.bold }]}>
              {t('orderTotal')}
            </Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                {t('subtotal')}
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {formatCurrency(subtotal)}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Versandkosten
              </Text>
              <Text style={[styles.summaryValue, { color: shippingFee === 0 ? colors.success : colors.text }]}>
                {shippingFee === 0 ? 'KOSTENLOS' : formatCurrency(shippingFee)}
              </Text>
            </View>

            {isGoGreenShipping ? (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: '#059669' }]}>
                  🌱 DHL GoGreen Klima-Offset
                </Text>
                <Text style={[styles.summaryValue, { color: '#059669' }]}>
                  {formatCurrency(greenOffset)}
                </Text>
              </View>
            ) : null}

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={[styles.summaryRow, { marginTop: hp(1.0) }]}>
              <Text style={[styles.totalLabel, { color: colors.text, fontFamily: fonts.bold }]}>
                {t('orderTotal')}
              </Text>
              <Text style={[styles.totalValue, { color: colors.primary, fontFamily: fonts.bold }]}>
                {formatCurrency(grandTotal)}
              </Text>
            </View>
          </View>

          <Button
            title={t('placeOrder')}
            onPress={handlePlaceOrderClick}
            loading={isPlacingOrder}
            style={styles.placeOrderBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <KlarnaPaymentModal
        visible={showKlarnaModal}
        amount={grandTotal}
        onConfirm={executeOrder}
        onCancel={() => setShowKlarnaModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: wp(4.27),
    paddingBottom: hp(4.9),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1.6),
    marginBottom: hp(1.5),
    marginTop: hp(1.0),
  },
  headerTitle: {
    marginBottom: 0,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: fp(4.27),
    marginBottom: hp(1.5),
    marginTop: hp(1.0),
  },
  formContainer: {
    marginBottom: hp(1.0),
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  paymentCard: {
    borderWidth: 1,
    borderRadius: wp(4.27),
    overflow: 'hidden',
    marginBottom: hp(2.0),
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp(4.27),
  },
  radioCircle: {
    width: wp(5.33),
    height: wp(5.33),
    borderRadius: wp(2.67),
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3.73),
  },
  radioDot: {
    width: wp(2.67),
    height: wp(2.67),
    borderRadius: wp(1.33),
  },
  paymentInfo: {
    flex: 1,
  },
  paymentLabel: {
    fontSize: fp(3.73),
    marginBottom: hp(0.25),
  },
  paymentSub: {
    fontSize: fp(2.93),
  },
  summaryCard: {
    borderWidth: 1,
    borderRadius: wp(4.27),
    padding: wp(4.27),
    marginBottom: hp(2.96),
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(1.23),
  },
  summaryLabel: {
    fontSize: fp(3.47),
  },
  summaryValue: {
    fontSize: fp(3.47),
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: hp(0.74),
  },
  totalLabel: {
    fontSize: fp(4.0),
  },
  totalValue: {
    fontSize: fp(4.27),
  },
  placeOrderBtn: {
    height: hp(6.4),
    borderRadius: wp(3.73),
  },
});