import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from '../hooks/useTranslation';
import { hp, wp, fp } from '../theme/dimensions';

interface KlarnaPaymentModalProps {
  visible: boolean;
  amount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export const KlarnaPaymentModal: React.FC<KlarnaPaymentModalProps> = ({
  visible,
  amount,
  onConfirm,
  onCancel,
}) => {
  const { t, formatCurrency, formatGermanDate } = useTranslation();

  const dueDate = formatGermanDate(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Klarna Header */}
          <View style={styles.klarnaHeader}>
            <Text style={styles.klarnaLogo}>klarna.</Text>
            <Text style={styles.klarnaSubtitle}>{t('klarnaPayLater')}</Text>
          </View>

          <ScrollView style={styles.scroll}>
            <View style={styles.amountBox}>
              <Text style={styles.amountLabel}>{t('orderTotal')}</Text>
              <Text style={styles.amountValue}>{formatCurrency(amount)}</Text>
            </View>

            <View style={styles.detailCard}>
              <View style={styles.row}>
                <View style={styles.rowLabelContainer}>
                  <Ionicons name="calendar-outline" size={14} color="#4B5563" />
                  <Text style={styles.label}>Fälligkeitsdatum:</Text>
                </View>
                <Text style={styles.value}>{dueDate} (in 30 Tagen)</Text>
              </View>

              <View style={styles.row}>
                <View style={styles.rowLabelContainer}>
                  <Ionicons name="shield-checkmark-outline" size={14} color="#4B5563" />
                  <Text style={styles.label}>Klarna Käuferschutz:</Text>
                </View>
                <Text style={styles.value}>Inklusive</Text>
              </View>

              <View style={styles.row}>
                <View style={styles.rowLabelContainer}>
                  <Ionicons name="card-outline" size={14} color="#4B5563" />
                  <Text style={styles.label}>Zinsen:</Text>
                </View>
                <Text style={styles.value}>0,00 € (0% APR)</Text>
              </View>
            </View>

            <Text style={styles.termsText}>
              Mit Bestätigung des Kaufs auf Rechnung gehen Sie eine Zahlungsvereinbarung mit Klarna Bank AB (publ) ein. Es gelten die AGB und Datenschutzbestimmungen von Klarna DE.
            </Text>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
              <Text style={styles.cancelBtnText}>{t('cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm}>
              <Text style={styles.confirmBtnText}>Jetzt Kaufen (in 30 Tagen zahlen)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default KlarnaPaymentModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: wp(5.3),
    borderTopRightRadius: wp(5.3),
    padding: wp(5.3),
    maxHeight: '80%',
  },
  klarnaHeader: {
    alignItems: 'center',
    marginBottom: hp(2.0),
    paddingBottom: hp(1.5),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  klarnaLogo: {
    fontSize: fp(7.47),
    fontWeight: '900',
    color: '#FFB3C7',
    letterSpacing: -1,
  },
  klarnaSubtitle: {
    fontSize: fp(3.47),
    color: '#374151',
    fontWeight: '600',
    marginTop: hp(0.25),
  },
  scroll: {
    marginBottom: hp(2.0),
  },
  amountBox: {
    backgroundColor: '#FFF1F2',
    padding: wp(3.73),
    borderRadius: wp(2.7),
    alignItems: 'center',
    marginBottom: hp(1.72),
  },
  amountLabel: {
    fontSize: fp(3.2),
    color: '#9F1239',
  },
  amountValue: {
    fontSize: fp(5.87),
    fontWeight: '800',
    color: '#BE123C',
    marginTop: hp(0.25),
  },
  detailCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: wp(2.7),
    padding: wp(3.2),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: hp(1.5),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: hp(0.5),
  },
  rowLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1.07),
  },
  label: {
    fontSize: fp(3.2),
    color: '#4B5563',
  },
  value: {
    fontSize: fp(3.2),
    fontWeight: '600',
    color: '#111827',
  },
  termsText: {
    fontSize: fp(2.93),
    color: '#9CA3AF',
    lineHeight: hp(1.85),
  },
  footer: {
    flexDirection: 'row',
    gap: wp(2.67),
  },
  cancelBtn: {
    flex: 0.35,
    paddingVertical: hp(1.5),
    borderRadius: wp(2.7),
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#374151',
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 0.65,
    paddingVertical: hp(1.5),
    borderRadius: wp(2.7),
    backgroundColor: '#FFB3C7',
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#111827',
    fontWeight: '700',
    fontSize: fp(3.2),
  },
});
