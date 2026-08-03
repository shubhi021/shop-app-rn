import React, { useState, useRef } from 'react';
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
  Image,
  TextInput as RNTextInput,
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

const CHECKOUT_STEPS = ['Address', 'Payment', 'Review'];

export default function CheckoutScreen({ navigation }: any) {
  const { colors, fonts, isDark } = useTheme();
  const { t, formatCurrency, validateGermanPLZ } = useTranslation();
  const dispatch = useAppDispatch();

  const reduxUser = useAppSelector((state) => state.auth.user);
  const { items, total: subtotal, totalPfand, isGoGreenShipping, vat19Amount, vat7Amount } = useAppSelector(
    (state) => state.cart
  );

  const shippingFee = subtotal > 39 ? 0 : 4.99;
  const greenOffset = isGoGreenShipping ? 0.99 : 0;
  const grandTotal = subtotal + shippingFee + greenOffset;

  const [currentStep, setCurrentStep] = useState(0);
  const [cartExpanded, setCartExpanded] = useState(false);

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

  // Refs for auto-focus
  const phoneRef = useRef<any>(null);
  const addressRef = useRef<any>(null);
  const cityRef = useRef<any>(null);
  const zipRef = useRef<any>(null);

  const [paymentMethod, setPaymentMethod] = useState<'klarna' | 'sofort' | 'sepa' | 'applePay' | 'card'>('klarna');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showKlarnaModal, setShowKlarnaModal] = useState(false);

  const validateForm = (): boolean => {
    let isValid = true;
    if (!fullName.trim()) { setFullNameError('Name ist erforderlich.'); isValid = false; } else setFullNameError(null);
    if (!phone.trim() || phone.length < 8) { setPhoneError('Gültige Telefonnummer erforderlich.'); isValid = false; } else setPhoneError(null);
    if (!address.trim()) { setAddressError('Straße & Hausnummer erforderlich.'); isValid = false; } else setAddressError(null);
    if (!city.trim()) { setCityError('Stadt erforderlich.'); isValid = false; } else setCityError(null);
    if (!validateGermanPLZ(zipCode)) { setZipCodeError('Gültige 5-stellige PLZ eingeben (z.B. 10115).'); isValid = false; } else setZipCodeError(null);
    return isValid;
  };

  const executeOrder = async () => {
    if (!reduxUser?.uid) {
      Toast.show({ type: 'error', text1: 'Anmeldung Erforderlich', text2: 'Bitte melden Sie sich an.' });
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
        shippingAddress: { fullName: fullName.trim(), phone: phone.trim(), address: address.trim(), city: city.trim(), zipCode: zipCode.trim() },
        paymentMethod,
        createdAt: new Date().toISOString(),
      };
      await addDoc(collection(db, 'orders'), orderPayload);
      dispatch(clearCart());
      Toast.show({ type: 'success', text1: 'Bestellung Erfolgreich! 🎉', text2: 'Vielen Dank für Ihren Einkauf.' });
      navigation.replace('OrderSuccess');
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Bestellfehler', text2: err.message || 'Ein Fehler ist aufgetreten.' });
    } finally {
      setIsPlacingOrder(false);
      setShowKlarnaModal(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 0) {
      if (!validateForm()) return;
      setCurrentStep(1);
    } else if (currentStep === 1) {
      setCurrentStep(2);
    } else {
      // Place order
      if (paymentMethod === 'klarna') {
        setShowKlarnaModal(true);
      } else {
        executeOrder();
      }
    }
  };

  const PAYMENT_OPTIONS = [
    { id: 'klarna', label: t('klarnaPayLater'), sub: t('payIn30Days'), icon: 'heart' as const, iconColor: '#FFB3C7' },
    { id: 'sofort', label: t('sofortBank'), sub: 'Direktes Online-Banking mit PIN/TAN', icon: 'business-outline' as const, iconColor: colors.textSecondary },
    { id: 'sepa', label: t('sepaDebit'), sub: 'Bequem per IBAN abbuchen lassen', icon: 'wallet-outline' as const, iconColor: colors.textSecondary },
    { id: 'applePay', label: t('applePay'), sub: 'Schnell & sicher mit Touch/Face ID', icon: 'logo-apple' as const, iconColor: colors.text },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        {/* ── Step Progress Indicator ── */}
        <View style={[styles.stepProgress, { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
          {CHECKOUT_STEPS.map((step, idx) => (
            <React.Fragment key={step}>
              <TouchableOpacity
                onPress={() => idx < currentStep && setCurrentStep(idx)}
                style={styles.stepItem}
                activeOpacity={idx < currentStep ? 0.7 : 1}
              >
                <View
                  style={[
                    styles.stepCircle,
                    {
                      backgroundColor:
                        idx < currentStep
                          ? colors.success
                          : idx === currentStep
                          ? colors.primary
                          : colors.border,
                    },
                  ]}
                >
                  {idx < currentStep ? (
                    <Ionicons name="checkmark" size={12} color="#FFF" />
                  ) : (
                    <Text style={[styles.stepNum, { fontFamily: fonts.bold }]}>{idx + 1}</Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    {
                      color: idx === currentStep ? colors.primary : idx < currentStep ? colors.success : colors.textTertiary,
                      fontFamily: idx === currentStep ? fonts.bold : fonts.regular,
                    },
                  ]}
                >
                  {step}
                </Text>
              </TouchableOpacity>
              {idx < CHECKOUT_STEPS.length - 1 && (
                <View style={[styles.stepConnector, { backgroundColor: idx < currentStep ? colors.success : colors.border }]} />
              )}
            </React.Fragment>
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* ── Mini Cart Summary (collapsible) ── */}
          <TouchableOpacity
            style={[styles.miniCartHeader, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setCartExpanded(v => !v)}
            activeOpacity={0.8}
          >
            <View style={styles.miniCartLeft}>
              <Ionicons name="cart-outline" size={16} color={colors.primary} />
              <Text style={[styles.miniCartTitle, { color: colors.text, fontFamily: fonts.semiBold }]}>
                {items.length} {items.length === 1 ? 'item' : 'items'} in cart
              </Text>
            </View>
            <View style={styles.miniCartRight}>
              <Text style={[styles.miniCartTotal, { color: colors.primary, fontFamily: fonts.bold }]}>
                {formatCurrency(subtotal)}
              </Text>
              <Ionicons
                name={cartExpanded ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={colors.textSecondary}
              />
            </View>
          </TouchableOpacity>

          {cartExpanded && (
            <View style={[styles.miniCartExpanded, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {items.map(item => (
                <View key={item.product.id} style={styles.miniCartItem}>
                  <View style={styles.miniCartImageBox}>
                    <Image source={{ uri: item.product.image }} style={styles.miniCartImage} resizeMode="contain" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.miniCartItemTitle, { color: colors.text, fontFamily: fonts.medium }]} numberOfLines={1}>
                      {item.product.title}
                    </Text>
                    <Text style={[styles.miniCartItemMeta, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
                      Qty: {item.quantity} · {formatCurrency(item.product.price * item.quantity)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* ── STEP 0: Address ── */}
          {currentStep === 0 && (
            <>
              <View style={styles.headerRow}>
                <Ionicons name="location-outline" size={20} color={colors.text} />
                <Text style={[styles.sectionTitle, styles.headerTitle, { color: colors.text, fontFamily: fonts.bold }]}>
                  Lieferadresse
                </Text>
              </View>
              <View style={styles.formContainer}>
                <Input
                  label="Vollständiger Name"
                  placeholder="z.B. Max Mustermann"
                  value={fullName}
                  onChangeText={setFullName}
                  error={fullNameError}
                  autoCapitalize="words"
                  returnKeyType="next"
                  onSubmitEditing={() => phoneRef.current?.focus()}
                />
                <Input
                  ref={phoneRef}
                  label="Telefonnummer"
                  placeholder="z.B. +49 170 1234567"
                  value={phone}
                  onChangeText={setPhone}
                  error={phoneError}
                  keyboardType="phone-pad"
                  returnKeyType="next"
                  onSubmitEditing={() => addressRef.current?.focus()}
                />
                <Input
                  ref={addressRef}
                  label="Straße & Hausnummer"
                  placeholder="z.B. Unter den Linden 10"
                  value={address}
                  onChangeText={setAddress}
                  error={addressError}
                  returnKeyType="next"
                  onSubmitEditing={() => cityRef.current?.focus()}
                />
                <View style={styles.rowInputs}>
                  <Input
                    ref={cityRef}
                    label={t('cityPlaceholder')}
                    placeholder="z.B. Berlin"
                    value={city}
                    onChangeText={setCity}
                    error={cityError}
                    style={{ flex: 0.58 }}
                    autoCapitalize="words"
                    returnKeyType="next"
                    onSubmitEditing={() => zipRef.current?.focus()}
                  />
                  <Input
                    ref={zipRef}
                    label="PLZ (Postleitzahl)"
                    placeholder="10115"
                    value={zipCode}
                    onChangeText={setZipCode}
                    error={zipCodeError}
                    style={{ flex: 0.38 }}
                    keyboardType="numeric"
                    returnKeyType="done"
                  />
                </View>
              </View>
            </>
          )}

          {/* ── STEP 1: Payment ── */}
          {currentStep === 1 && (
            <>
              <CO2FootprintCard />
              <View style={styles.headerRow}>
                <Ionicons name="card-outline" size={20} color={colors.text} />
                <Text style={[styles.sectionTitle, styles.headerTitle, { color: colors.text, fontFamily: fonts.bold }]}>
                  {t('paymentMethod')} (DACH Region)
                </Text>
              </View>

              <View style={[styles.paymentCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {PAYMENT_OPTIONS.map((opt, idx) => (
                  <TouchableOpacity
                    key={opt.id}
                    onPress={() => setPaymentMethod(opt.id as any)}
                    style={[
                      styles.paymentOption,
                      idx < PAYMENT_OPTIONS.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                      paymentMethod === opt.id && { backgroundColor: colors.primary + '08' },
                    ]}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.radioCircle, { borderColor: colors.primary }]}>
                      {paymentMethod === opt.id && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
                    </View>
                    <View style={styles.paymentInfo}>
                      <Text style={[styles.paymentLabel, { color: colors.text, fontFamily: fonts.semiBold }]}>{opt.label}</Text>
                      <Text style={[styles.paymentSub, { color: colors.textSecondary, fontFamily: fonts.regular }]}>{opt.sub}</Text>
                    </View>
                    <Ionicons name={opt.icon} size={18} color={opt.iconColor} />
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* ── STEP 2: Review ── */}
          {currentStep === 2 && (
            <>
              {/* Address summary */}
              <View style={[styles.reviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.reviewCardHeader}>
                  <Ionicons name="location-outline" size={16} color={colors.primary} />
                  <Text style={[styles.reviewCardTitle, { color: colors.text, fontFamily: fonts.bold }]}>Delivery Address</Text>
                  <TouchableOpacity onPress={() => setCurrentStep(0)}>
                    <Text style={[styles.editLink, { color: colors.primary, fontFamily: fonts.medium }]}>Edit</Text>
                  </TouchableOpacity>
                </View>
                <Text style={[styles.reviewText, { color: colors.textSecondary, fontFamily: fonts.regular }]}>{fullName}</Text>
                <Text style={[styles.reviewText, { color: colors.textSecondary, fontFamily: fonts.regular }]}>{address}, {city} {zipCode}</Text>
                <Text style={[styles.reviewText, { color: colors.textSecondary, fontFamily: fonts.regular }]}>{phone}</Text>
              </View>

              {/* Payment summary */}
              <View style={[styles.reviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.reviewCardHeader}>
                  <Ionicons name="card-outline" size={16} color={colors.primary} />
                  <Text style={[styles.reviewCardTitle, { color: colors.text, fontFamily: fonts.bold }]}>Payment Method</Text>
                  <TouchableOpacity onPress={() => setCurrentStep(1)}>
                    <Text style={[styles.editLink, { color: colors.primary, fontFamily: fonts.medium }]}>Edit</Text>
                  </TouchableOpacity>
                </View>
                <Text style={[styles.reviewText, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
                  {PAYMENT_OPTIONS.find(p => p.id === paymentMethod)?.label || paymentMethod}
                </Text>
              </View>

              <TaxBreakdownCard />
            </>
          )}

          {/* ── Order Total Summary (always visible) ── */}
          <View style={styles.headerRow}>
            <Ionicons name="stats-chart-outline" size={18} color={colors.text} />
            <Text style={[styles.sectionTitle, styles.headerTitle, { color: colors.text, fontFamily: fonts.bold }]}>
              {t('orderTotal')}
            </Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{t('subtotal')}</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{formatCurrency(subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Versandkosten</Text>
              <Text style={[styles.summaryValue, { color: shippingFee === 0 ? '#16A34A' : colors.text }]}>
                {shippingFee === 0 ? 'KOSTENLOS' : formatCurrency(shippingFee)}
              </Text>
            </View>
            {isGoGreenShipping && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: '#059669' }]}>🌱 DHL GoGreen Klima-Offset</Text>
                <Text style={[styles.summaryValue, { color: '#059669' }]}>{formatCurrency(greenOffset)}</Text>
              </View>
            )}
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={[styles.summaryRow, { marginTop: hp(1.0) }]}>
              <Text style={[styles.totalLabel, { color: colors.text, fontFamily: fonts.bold }]}>{t('orderTotal')}</Text>
              <Text style={[styles.totalValue, { color: colors.primary, fontFamily: fonts.bold }]}>{formatCurrency(grandTotal)}</Text>
            </View>
          </View>

          {/* ── CTA Button ── */}
          <Button
            title={
              currentStep === 0 ? 'Continue to Payment →' :
              currentStep === 1 ? 'Review Order →' :
              t('placeOrder')
            }
            onPress={handleNext}
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
  container: { flex: 1 },
  stepProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(6.0),
    paddingVertical: hp(1.8),
  },
  stepItem: { alignItems: 'center', gap: hp(0.5) },
  stepCircle: {
    width: wp(7.5),
    height: wp(7.5),
    borderRadius: wp(3.75),
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNum: { color: '#FFF', fontSize: fp(3.2) },
  stepLabel: { fontSize: fp(2.93) },
  stepConnector: { flex: 1, height: 2, marginHorizontal: wp(1.5), borderRadius: 1 },
  scrollContent: { padding: wp(4.27), paddingBottom: hp(4.9) },
  miniCartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp(3.5),
    borderRadius: wp(3.5),
    borderWidth: 1,
    marginBottom: hp(0.5),
  },
  miniCartLeft: { flexDirection: 'row', alignItems: 'center', gap: wp(2.0) },
  miniCartRight: { flexDirection: 'row', alignItems: 'center', gap: wp(2.0) },
  miniCartTitle: { fontSize: fp(3.47) },
  miniCartTotal: { fontSize: fp(3.73) },
  miniCartExpanded: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderRadius: wp(3.5),
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    paddingHorizontal: wp(3.5),
    paddingBottom: hp(1.0),
    marginBottom: hp(2.0),
  },
  miniCartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(3.0),
    paddingVertical: hp(1.0),
  },
  miniCartImageBox: {
    width: wp(12.0),
    height: wp(12.0),
    backgroundColor: '#FFF',
    borderRadius: wp(2.0),
    overflow: 'hidden',
  },
  miniCartImage: { width: '100%', height: '100%' },
  miniCartItemTitle: { fontSize: fp(3.47), marginBottom: hp(0.3) },
  miniCartItemMeta: { fontSize: fp(3.0) },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1.6),
    marginBottom: hp(1.5),
    marginTop: hp(1.5),
  },
  headerTitle: { marginBottom: 0, marginTop: 0 },
  sectionTitle: { fontSize: fp(4.27), marginBottom: hp(1.5), marginTop: hp(1.0) },
  formContainer: { marginBottom: hp(1.0) },
  rowInputs: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  paymentCard: {
    borderWidth: 1,
    borderRadius: wp(4.27),
    overflow: 'hidden',
    marginBottom: hp(2.0),
  },
  paymentOption: { flexDirection: 'row', alignItems: 'center', padding: wp(4.27) },
  radioCircle: {
    width: wp(5.33),
    height: wp(5.33),
    borderRadius: wp(2.67),
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3.73),
  },
  radioDot: { width: wp(2.67), height: wp(2.67), borderRadius: wp(1.33) },
  paymentInfo: { flex: 1 },
  paymentLabel: { fontSize: fp(3.73), marginBottom: hp(0.25) },
  paymentSub: { fontSize: fp(2.93) },
  reviewCard: {
    borderWidth: 1,
    borderRadius: wp(4.0),
    padding: wp(4.0),
    marginBottom: hp(1.5),
  },
  reviewCardHeader: { flexDirection: 'row', alignItems: 'center', gap: wp(2.0), marginBottom: hp(1.0) },
  reviewCardTitle: { fontSize: fp(4.0), flex: 1 },
  editLink: { fontSize: fp(3.47) },
  reviewText: { fontSize: fp(3.47), lineHeight: hp(2.5) },
  summaryCard: {
    borderWidth: 1,
    borderRadius: wp(4.27),
    padding: wp(4.27),
    marginBottom: hp(2.96),
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: hp(1.23) },
  summaryLabel: { fontSize: fp(3.47) },
  summaryValue: { fontSize: fp(3.47) },
  divider: { height: 1, width: '100%', marginVertical: hp(0.74) },
  totalLabel: { fontSize: fp(4.0) },
  totalValue: { fontSize: fp(4.27) },
  placeOrderBtn: { height: hp(6.4), borderRadius: wp(3.73) },
});