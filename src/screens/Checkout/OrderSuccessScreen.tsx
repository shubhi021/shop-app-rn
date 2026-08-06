import React, {useRef, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Share,
  Animated,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useTheme} from '../../hooks/useTheme';
import Button from '../../components/common/Button';
import {hp, wp, fp} from '../../theme/dimensions';

// Generate a random order ID
function generateOrderId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'ORD-';
  for (let i = 0; i < 8; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

const DELIVERY_STEPS = [
  {
    icon: 'checkmark-circle',
    label: 'Order Confirmed',
    desc: 'Just now',
    done: true,
  },
  {
    icon: 'construct-outline',
    label: 'Processing',
    desc: 'Est. 1–2 hours',
    done: true,
  },
  {
    icon: 'airplane-outline',
    label: 'Shipped',
    desc: 'Est. 1–2 days',
    done: false,
  },
  {
    icon: 'home-outline',
    label: 'Delivered',
    desc: 'Est. 3–5 days',
    done: false,
  },
];

export default function OrderSuccessScreen({navigation, route}: any) {
  const {colors, fonts, fontSizes, isDark} = useTheme();

  const [orderId] = useState(() => generateOrderId());

  // Animations
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const ringAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Bounce icon in
    Animated.spring(scaleAnim, {
      toValue: 1,
      damping: 10,
      mass: 0.8,
      stiffness: 180,
      useNativeDriver: true,
    }).start();

    // Pulsing ring
    const ring = Animated.loop(
      Animated.sequence([
        Animated.timing(ringAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(ringAnim, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );
    ring.start();

    // Fade in content
    Animated.parallel([
      Animated.timing(contentAnim, {
        toValue: 1,
        duration: 500,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.timing(contentSlide, {
        toValue: 0,
        duration: 500,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();

    return () => ring.stop();
  }, []);

  const ringScale = ringAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.18],
  });
  const ringOpacity = ringAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 0],
  });

  const handleShare = async () => {
    try {
      await Share.share({
        message: `I just placed an order on ShopApp! 🛍️ Order ${orderId} is on its way! #ShopApp`,
      });
    } catch {}
  };

  const handleContinueShopping = () => {
    navigation.reset({index: 0, routes: [{name: 'Main'}]});
  };

  const handleTrackOrder = () => {
    navigation.reset({index: 0, routes: [{name: 'Main'}]});
    // Small delay then navigate to notifications which simulates tracking
    setTimeout(() => navigation.navigate('Notifications'), 100);
  };

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* ── Animated Success Icon ── */}
        <View style={styles.iconArea}>
          {/* Pulsing ring */}
          <Animated.View
            style={[
              styles.pulseRing,
              {
                borderColor: colors.success + '80',
                transform: [{scale: ringScale}],
                opacity: ringOpacity,
              },
            ]}
          />
          {/* Icon badge */}
          <Animated.View
            style={[
              styles.successIconBadge,
              {
                backgroundColor: colors.success + '15',
                transform: [{scale: scaleAnim}],
              },
            ]}>
            <Ionicons
              name="checkmark-circle"
              size={64}
              color={colors.success}
            />
          </Animated.View>
        </View>

        <Animated.View
          style={{
            opacity: contentAnim,
            transform: [{translateY: contentSlide}],
          }}>
          {/* ── Title ── */}
          <Text
            style={[
              styles.title,
              {
                color: colors.text,
                fontFamily: fonts.bold,
                fontSize: fontSizes.xxl,
              },
            ]}>
            Order Placed! 🎉
          </Text>
          <Text
            style={[
              styles.subtitle,
              {
                color: colors.textSecondary,
                fontFamily: fonts.regular,
                fontSize: fontSizes.md,
              },
            ]}>
            Thank you for your purchase. Your order is confirmed and being
            processed.
          </Text>

          {/* ── Order ID Card ── */}
          <View
            style={[
              styles.orderIdCard,
              {backgroundColor: colors.card, borderColor: colors.border},
            ]}>
            <View style={styles.orderIdRow}>
              <Text
                style={[
                  styles.orderIdLabel,
                  {color: colors.textSecondary, fontFamily: fonts.medium},
                ]}>
                Order Number
              </Text>
              <TouchableOpacity
                onPress={handleShare}
                style={styles.shareBtn}
                activeOpacity={0.7}>
                <Ionicons
                  name="share-social-outline"
                  size={16}
                  color={colors.primary}
                />
                <Text
                  style={[
                    styles.shareText,
                    {color: colors.primary, fontFamily: fonts.medium},
                  ]}>
                  Share
                </Text>
              </TouchableOpacity>
            </View>
            <Text
              style={[
                styles.orderId,
                {color: colors.text, fontFamily: fonts.bold},
              ]}>
              {orderId}
            </Text>
          </View>

          {/* ── Delivery Timeline ── */}
          <View
            style={[
              styles.timelineCard,
              {backgroundColor: colors.card, borderColor: colors.border},
            ]}>
            <Text
              style={[
                styles.timelineTitle,
                {color: colors.text, fontFamily: fonts.bold},
              ]}>
              Delivery Status
            </Text>
            {DELIVERY_STEPS.map((step, idx) => (
              <View key={idx} style={styles.stepRow}>
                {/* Connector line */}
                <View style={styles.stepLeft}>
                  <View
                    style={[
                      styles.stepDot,
                      {
                        backgroundColor: step.done
                          ? colors.success
                          : colors.border,
                        borderColor: step.done ? colors.success : colors.border,
                      },
                    ]}>
                    {step.done ? (
                      <Ionicons name="checkmark" size={10} color="#FFF" />
                    ) : (
                      <View
                        style={[
                          styles.stepDotInner,
                          {backgroundColor: colors.background},
                        ]}
                      />
                    )}
                  </View>
                  {idx < DELIVERY_STEPS.length - 1 && (
                    <View
                      style={[
                        styles.stepLine,
                        {
                          backgroundColor: step.done
                            ? colors.success + '50'
                            : colors.border,
                        },
                      ]}
                    />
                  )}
                </View>

                <View style={styles.stepContent}>
                  <View style={styles.stepLabelRow}>
                    <Ionicons
                      name={step.icon as any}
                      size={16}
                      color={step.done ? colors.success : colors.textTertiary}
                    />
                    <Text
                      style={[
                        styles.stepLabel,
                        {
                          color: step.done ? colors.text : colors.textSecondary,
                          fontFamily: step.done
                            ? fonts.semiBold
                            : fonts.regular,
                        },
                      ]}>
                      {step.label}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.stepDesc,
                      {color: colors.textTertiary, fontFamily: fonts.regular},
                    ]}>
                    {step.desc}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* ── Eco Impact Card ── */}
          <View
            style={[
              styles.ecoCard,
              {backgroundColor: '#064E3B', borderColor: '#059669'},
            ]}>
            <Ionicons name="leaf" size={20} color="#34D399" />
            <View style={{flex: 1}}>
              <Text style={[styles.ecoTitle, {fontFamily: fonts.bold}]}>
                You're helping the planet! 🌱
              </Text>
              <Text style={[styles.ecoDesc, {fontFamily: fonts.regular}]}>
                Your order contributes to our DHL GoGreen CO₂ offset program.
                Together, we've offset 847 kg this month.
              </Text>
            </View>
          </View>

          {/* ── Info Row (Delivery estimate) ── */}
          <View
            style={[
              styles.infoCard,
              {
                backgroundColor: colors.surface || colors.card,
                borderColor: colors.border,
              },
            ]}>
            <View style={styles.infoRow}>
              <Text
                style={[
                  styles.infoLabel,
                  {color: colors.textSecondary, fontFamily: fonts.medium},
                ]}>
                Estimated Delivery
              </Text>
              <Text
                style={[
                  styles.infoValue,
                  {color: colors.text, fontFamily: fonts.bold},
                ]}>
                3–5 Business Days
              </Text>
            </View>
            <View style={[styles.divider, {backgroundColor: colors.border}]} />
            <Text
              style={[
                styles.infoSubText,
                {color: colors.textTertiary, fontFamily: fonts.regular},
              ]}>
              Track your order anytime from the Notifications tab in your
              profile.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* ── Action Buttons ── */}
      <Animated.View style={[styles.footer, {opacity: contentAnim}]}>
        <TouchableOpacity
          onPress={handleTrackOrder}
          style={[
            styles.trackBtn,
            {
              borderColor: colors.primary,
              borderWidth: 1.5,
              backgroundColor: colors.primary + '10',
            },
          ]}
          activeOpacity={0.8}>
          <Ionicons name="navigate-outline" size={18} color={colors.primary} />
          <Text
            style={[
              styles.trackBtnText,
              {color: colors.primary, fontFamily: fonts.semiBold},
            ]}>
            Track Order
          </Text>
        </TouchableOpacity>
        <Button
          title="Continue Shopping"
          onPress={handleContinueShopping}
          style={styles.continueBtn}
        />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  scrollContent: {
    paddingHorizontal: wp(6.4),
    paddingTop: hp(3.0),
    paddingBottom: hp(2.0),
    alignItems: 'center',
  },
  iconArea: {
    width: wp(32),
    height: wp(32),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(2.5),
  },
  pulseRing: {
    position: 'absolute',
    width: wp(32),
    height: wp(32),
    borderRadius: wp(16),
    borderWidth: 3,
  },
  successIconBadge: {
    width: wp(24),
    height: wp(24),
    borderRadius: wp(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: hp(1.0),
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: hp(2.7),
    marginBottom: hp(2.5),
  },
  orderIdCard: {
    width: '100%',
    padding: wp(4.27),
    borderRadius: wp(4.0),
    borderWidth: 1,
    marginBottom: hp(2.0),
  },
  orderIdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(0.8),
  },
  orderIdLabel: {fontSize: fp(3.2)},
  shareBtn: {flexDirection: 'row', alignItems: 'center', gap: wp(1.0)},
  shareText: {fontSize: fp(3.2)},
  orderId: {fontSize: fp(5.0), letterSpacing: 1.5},
  timelineCard: {
    width: '100%',
    padding: wp(4.27),
    borderRadius: wp(4.0),
    borderWidth: 1,
    marginBottom: hp(2.0),
  },
  timelineTitle: {fontSize: fp(4.27), marginBottom: hp(2.0)},
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: hp(0.5),
  },
  stepLeft: {alignItems: 'center', width: wp(6.0), marginRight: wp(3.5)},
  stepDot: {
    width: wp(5.5),
    height: wp(5.5),
    borderRadius: wp(2.75),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    zIndex: 1,
  },
  stepDotInner: {
    width: wp(2.5),
    height: wp(2.5),
    borderRadius: wp(1.25),
  },
  stepLine: {
    width: 2,
    flex: 1,
    minHeight: hp(3.5),
    marginTop: 2,
    borderRadius: 1,
  },
  stepContent: {
    flex: 1,
    paddingBottom: hp(2.0),
  },
  stepLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2.0),
    marginBottom: hp(0.3),
  },
  stepLabel: {fontSize: fp(3.73)},
  stepDesc: {fontSize: fp(3.0), paddingLeft: wp(5.5)},
  ecoCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: wp(3.0),
    padding: wp(4.0),
    borderRadius: wp(4.0),
    borderWidth: 1,
    marginBottom: hp(2.0),
  },
  ecoTitle: {color: '#34D399', fontSize: fp(3.73), marginBottom: hp(0.4)},
  ecoDesc: {color: '#86EFAC', fontSize: fp(3.2), lineHeight: hp(2.3)},
  infoCard: {
    width: '100%',
    padding: wp(4.27),
    borderRadius: wp(4.27),
    borderWidth: 1,
    marginBottom: hp(2.0),
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {fontSize: fp(3.73)},
  infoValue: {fontSize: fp(3.73)},
  divider: {height: 1, marginVertical: hp(1.5)},
  infoSubText: {fontSize: fp(3.2), lineHeight: hp(1.97)},
  footer: {
    padding: wp(6.4),
    paddingTop: hp(1.0),
    gap: hp(1.5),
  },
  trackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(2.0),
    height: hp(6.4),
    borderRadius: wp(3.73),
  },
  trackBtnText: {fontSize: fp(4.0)},
  continueBtn: {height: hp(6.4)},
});
