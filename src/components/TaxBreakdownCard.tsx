import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from '../hooks/useTranslation';
import { useAppSelector } from '../store/hooks';

export const TaxBreakdownCard: React.FC = () => {
  const { t, formatCurrency } = useTranslation();
  const { total, totalPfand, vat19Amount, vat7Amount } = useAppSelector(
    state => state.cart
  );

  const totalVat = vat19Amount + vat7Amount;
  const netTotal = total - totalVat;

  return (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <Ionicons name="receipt-outline" size={16} color="#374151" />
        <Text style={styles.title}>{t('vatIncluded')}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>{t('netTotal')}:</Text>
        <Text style={styles.value}>{formatCurrency(netTotal)}</Text>
      </View>

      {vat19Amount > 0 ? (
        <View style={styles.row}>
          <Text style={styles.sublabel}>• {t('standardVat')}:</Text>
          <Text style={styles.subvalue}>{formatCurrency(vat19Amount)}</Text>
        </View>
      ) : null}

      {vat7Amount > 0 ? (
        <View style={styles.row}>
          <Text style={styles.sublabel}>• {t('reducedVat')}:</Text>
          <Text style={styles.subvalue}>{formatCurrency(vat7Amount)}</Text>
        </View>
      ) : null}

      {totalPfand > 0 ? (
        <View style={styles.row}>
          <Text style={styles.sublabel}>• {t('pfandDeposit')}:</Text>
          <Text style={styles.subvalue}>{formatCurrency(totalPfand)}</Text>
        </View>
      ) : null}

      <View style={styles.divider} />

      <Text style={styles.disclaimer}>
        * Alle Preise verstehen sich inkl. der gesetzlichen Mehrwertsteuer und Verpackungsverordnung (§ 6 VerpackG).
      </Text>
    </View>
  );
};

export default TaxBreakdownCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 2,
  },
  label: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '600',
  },
  value: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },
  sublabel: {
    fontSize: 11,
    color: '#6B7280',
    paddingLeft: 6,
  },
  subvalue: {
    fontSize: 11,
    color: '#4B5563',
  },
  divider: {
    height: 0.5,
    backgroundColor: '#D1D5DB',
    marginVertical: 8,
  },
  disclaimer: {
    fontSize: 10,
    color: '#9CA3AF',
    fontStyle: 'italic',
    lineHeight: 13,
  },
});
