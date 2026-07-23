import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from '../hooks/useTranslation';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { toggleGoGreenShipping } from '../store/slices/cartSlice';

export const CO2FootprintCard: React.FC = () => {
  const { t, formatCurrency } = useTranslation();
  const dispatch = useAppDispatch();

  const { totalCo2Grams, totalPfand, isGoGreenShipping } = useAppSelector(
    state => state.cart
  );

  const co2Display =
    totalCo2Grams > 1000
      ? `${(totalCo2Grams / 1000).toFixed(2)} ${t('kgCO2e')}`
      : `${totalCo2Grams} ${t('gCO2e')}`;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="leaf-outline" size={18} color="#065F46" style={{ marginRight: 6 }} />
        <Text style={styles.title}>{t('sustainabilityScore')}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>{t('co2Emissions')}:</Text>
        <Text style={styles.co2Value}>{co2Display}</Text>
      </View>

      {totalPfand > 0 ? (
        <View style={styles.row}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="refresh-circle-outline" size={16} color="#047857" />
            <Text style={styles.label}>{t('pfandDeposit')}:</Text>
          </View>
          <Text style={styles.pfandValue}>{formatCurrency(totalPfand)}</Text>
        </View>
      ) : null}

      <View style={styles.divider} />

      <View style={styles.shippingRow}>
        <View style={styles.shippingTextContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="cube-outline" size={16} color="#065F46" />
            <Text style={styles.shippingTitle}>{t('greenShipping')}</Text>
          </View>
          <Text style={styles.shippingDesc}>{t('greenShippingDesc')}</Text>
        </View>
        <Switch
          value={isGoGreenShipping}
          onValueChange={val => dispatch(toggleGoGreenShipping(val))}
          trackColor={{ false: '#D1D5DB', true: '#10B981' }}
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
    borderRadius: 12,
    padding: 14,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  leafIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#065F46',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 3,
  },
  label: {
    fontSize: 13,
    color: '#047857',
  },
  co2Value: {
    fontSize: 13,
    fontWeight: '700',
    color: '#065F46',
  },
  pfandValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#047857',
  },
  divider: {
    height: 1,
    backgroundColor: '#A7F3D0',
    marginVertical: 8,
  },
  shippingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shippingTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  shippingTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#065F46',
  },
  shippingDesc: {
    fontSize: 11,
    color: '#047857',
    marginTop: 1,
  },
});
