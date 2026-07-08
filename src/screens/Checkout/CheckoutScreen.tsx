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
import { formatPrice } from '../../utils/formatPrice';
import { db } from '../../services/firebase';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export default function CheckoutScreen({ navigation }: any) {
  const { colors, fonts, fontSizes, fontWeights, isDark } = useTheme();
  const dispatch = useAppDispatch();

  const reduxUser = useAppSelector((state) => state.auth.user);
  const { items, total: subtotal } = useAppSelector((state) => state.cart);

  // Math calculations
  const shippingFee = subtotal > 50 ? 0 : 5.00;
  const tax = subtotal * 0.08;
  const grandTotal = subtotal + shippingFee + tax;

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

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod' | 'paypal'>('card');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const validateForm = (): boolean => {
    let isValid = true;

    if (!fullName.trim()) {
      setFullNameError('Full name is required.');
      isValid = false;
    } else {
      setFullNameError(null);
    }

    if (!phone.trim() || phone.length < 9) {
      setPhoneError('Please enter a valid phone number.');
      isValid = false;
    } else {
      setPhoneError(null);
    }

    if (!address.trim()) {
      setAddressError('Street address is required.');
      isValid = false;
    } else {
      setAddressError(null);
    }

    if (!city.trim()) {
      setCityError('City is required.');
      isValid = false;
    } else {
      setCityError(null);
    }

    if (!zipCode.trim() || zipCode.length < 4) {
      setZipCodeError('Please enter a valid postal code.');
      isValid = false;
    } else {
      setZipCodeError(null);
    }

    return isValid;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;
    if (!reduxUser?.uid) {
      Toast.show({
        type: 'error',
        text1: 'Authentication Error',
        text2: 'You must be signed in to place an order.',
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
        text1: 'Order Placed!',
        text2: 'Thank you for shopping with us.',
      });

      // Navigate to success screen
      navigation.replace('OrderSuccess');
    } catch (err: any) {
      console.error('Order placement failed:', err);
      Toast.show({
        type: 'error',
        text1: 'Order Failed',
        text2: err.message || 'An error occurred during checkout.',
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Progress / Step indicator */}
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fonts.bold }]}>
            Shipping Address
          </Text>

          {/* Form */}
          <View style={styles.formContainer}>
            <Input
              label="Full Name"
              placeholder="e.g. John Doe"
              value={fullName}
              onChangeText={setFullName}
              error={fullNameError}
              autoCapitalize="words"
            />
            <Input
              label="Phone Number"
              placeholder="e.g. +1 234 567 890"
              value={phone}
              onChangeText={setPhone}
              error={phoneError}
              keyboardType="phone-pad"
            />
            <Input
              label="Street Address"
              placeholder="e.g. 123 Main St, Apt 4B"
              value={address}
              onChangeText={setAddress}
              error={addressError}
            />
            <View style={styles.rowInputs}>
              <Input
                label="City"
                placeholder="e.g. New York"
                value={city}
                onChangeText={setCity}
                error={cityError}
                style={{ flex: 0.58 }}
                autoCapitalize="words"
              />
              <Input
                label="Postal Code"
                placeholder="10001"
                value={zipCode}
                onChangeText={setZipCode}
                error={zipCodeError}
                style={{ flex: 0.38 }}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Payment Method */}
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fonts.bold }]}>
            Payment Method
          </Text>
          <View style={[styles.paymentCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TouchableOpacity
              onPress={() => setPaymentMethod('card')}
              style={[
                styles.paymentOption,
                { borderBottomWidth: 1, borderBottomColor: colors.border },
              ]}
              activeOpacity={0.8}
            >
              <View style={[styles.radioCircle, { borderColor: colors.primary }]}>
                {paymentMethod === 'card' && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
              </View>
              <View style={styles.paymentInfo}>
                <Text style={[styles.paymentLabel, { color: colors.text, fontFamily: fonts.semiBold }]}>
                  Credit/Debit Card
                </Text>
                <Text style={[styles.paymentSub, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
                  Pay securely with Visa, Mastercard, or Amex
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setPaymentMethod('cod')}
              style={[
                styles.paymentOption,
                { borderBottomWidth: 1, borderBottomColor: colors.border },
              ]}
              activeOpacity={0.8}
            >
              <View style={[styles.radioCircle, { borderColor: colors.primary }]}>
                {paymentMethod === 'cod' && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
              </View>
              <View style={styles.paymentInfo}>
                <Text style={[styles.paymentLabel, { color: colors.text, fontFamily: fonts.semiBold }]}>
                  Cash on Delivery (COD)
                </Text>
                <Text style={[styles.paymentSub, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
                  Pay in cash when order is delivered
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setPaymentMethod('paypal')}
              style={styles.paymentOption}
              activeOpacity={0.8}
            >
              <View style={[styles.radioCircle, { borderColor: colors.primary }]}>
                {paymentMethod === 'paypal' && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
              </View>
              <View style={styles.paymentInfo}>
                <Text style={[styles.paymentLabel, { color: colors.text, fontFamily: fonts.semiBold }]}>
                  PayPal
                </Text>
                <Text style={[styles.paymentSub, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
                  Fast and secure checkout using your account
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Pricing Recap */}
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fonts.bold }]}>
            Summary
          </Text>
          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
                Items Count
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text, fontFamily: fonts.medium }]}>
                {items.length} items
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
                Subtotal
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text, fontFamily: fonts.medium }]}>
                {formatPrice(subtotal)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
                Shipping
              </Text>
              <Text style={[styles.summaryValue, { color: shippingFee === 0 ? colors.success : colors.text, fontFamily: fonts.medium }]}>
                {shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
                Tax (8%)
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text, fontFamily: fonts.medium }]}>
                {formatPrice(tax)}
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={[styles.summaryRow, { marginTop: 8, marginBottom: 0 }]}>
              <Text style={[styles.totalLabel, { color: colors.text, fontFamily: fonts.bold }]}>
                Total Cost
              </Text>
              <Text style={[styles.totalValue, { color: colors.primary, fontFamily: fonts.bold }]}>
                {formatPrice(grandTotal)}
              </Text>
            </View>
          </View>

          <Button
            title="Place Order"
            onPress={handlePlaceOrder}
            loading={isPlacingOrder}
            style={styles.placeOrderBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 12,
    marginTop: 8,
  },
  formContainer: {
    marginBottom: 8,
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  paymentCard: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentLabel: {
    fontSize: 14,
    marginBottom: 2,
  },
  paymentSub: {
    fontSize: 11,
  },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 13,
  },
  summaryValue: {
    fontSize: 13,
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 6,
  },
  totalLabel: {
    fontSize: 15,
  },
  totalValue: {
    fontSize: 16,
  },
  placeOrderBtn: {
    height: 52,
    borderRadius: 14,
  },
});