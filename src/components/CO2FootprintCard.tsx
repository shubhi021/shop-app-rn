import React from 'react';
import {View, Text, StyleSheet, Switch} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useTranslation} from '../hooks/useTranslation';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {toggleGoGreenShipping} from '../store/slices/cartSlice';
import {hp, wp, fp} from '../theme/dimensions';

export const CO2FootprintCard: React.FC = () => {
  const {t, formatCurrency} = useTranslation();
  const dispatch = useAppDispatch();

  const {totalCo2Grams, totalPfand, isGoGreenShipping} = useAppSelector(
    state => state.cart,
  );

  const co2Display =
    totalCo2Grams > 1000
      ? `${(totalCo2Grams / 1000).toFixed(2)} ${t('kgCO2e')}`
      : `${totalCo2Grams} ${t('gCO2e')}`;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons
          name="leaf-outline"
          size={18}
          color="#065F46"
          style={styles.headerIcon}
        />
        <Text style={styles.title}>{t('sustainabilityScore')}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>{t('co2Emissions')}:</Text>
        <Text style={styles.co2Value}>{co2Display}</Text>
      </View>

      {totalPfand > 0 ? (
        <View style={styles.row}>
          <View style={styles.rowLabelContainer}>
            <Ionicons name="refresh-circle-outline" size={16} color="#047857" />
            <Text style={styles.label}>{t('pfandDeposit')}:</Text>
          </View>
          <Text style={styles.pfandValue}>{formatCurrency(totalPfand)}</Text>
        </View>
      ) : null}

      <View style={styles.divider} />

      <View style={styles.shippingRow}>
        <View style={styles.shippingTextContainer}>
          <View style={styles.rowLabelContainer}>
            <Ionicons name="cube-outline" size={16} color="#065F46" />
            <Text style={styles.shippingTitle}>{t('greenShipping')}</Text>
          </View>
          <Text style={styles.shippingDesc}>{t('greenShippingDesc')}</Text>
        </View>
        <Switch
          value={isGoGreenShipping}
          onValueChange={val => {
            dispatch(toggleGoGreenShipping(val));
          }}
          trackColor={{false: '#D1D5DB', true: '#10B981'}}
          thumbColor={isGoGreenShipping ? '#FFFFFF' : '#F3F4F6'}
        />
      </View>
    </View>
  );
};

export default CO2FootprintCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F0FDF4',
    borderRadius: wp(3.2),
    padding: wp(3.73),
    marginVertical: hp(1.23),
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1.0),
  },
  headerIcon: {
    marginRight: wp(1.6),
  },
  rowLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1.07),
  },
  leafIcon: {
    fontSize: fp(4.27),
    marginRight: wp(1.6),
  },
  title: {
    fontSize: fp(3.73),
    fontWeight: '700',
    color: '#065F46',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: hp(0.37),
  },
  label: {
    fontSize: fp(3.47),
    color: '#047857',
  },
  co2Value: {
    fontSize: fp(3.47),
    fontWeight: '700',
    color: '#065F46',
  },
  pfandValue: {
    fontSize: fp(3.47),
    fontWeight: '700',
    color: '#047857',
  },
  divider: {
    height: 1,
    backgroundColor: '#A7F3D0',
    marginVertical: hp(1.0),
  },
  shippingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shippingTextContainer: {
    flex: 1,
    paddingRight: wp(2.67),
  },
  shippingTitle: {
    fontSize: fp(3.47),
    fontWeight: '600',
    color: '#065F46',
  },
  shippingDesc: {
    fontSize: fp(2.93),
    color: '#047857',
    marginTop: hp(0.12),
  },
});
