import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '../../hooks/useTranslation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { hp, wp, fp } from '../../theme/dimensions';

type Props = NativeStackScreenProps<RootStackParamList, 'Impressum'>;

export const ImpressumScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="#2563EB" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('impressum')}</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>{t('legalNotice')}</Text>

        <View style={styles.box}>
          <Text style={styles.companyName}>ShopApp DE Technologies GmbH</Text>
          <Text style={styles.text}>Friedrichstraße 123</Text>
          <Text style={styles.text}>10117 Berlin, Deutschland</Text>
          <Text style={styles.text}>Vertreten durch die Geschäftsführung: Jane Doe, John Smith</Text>
        </View>

        <Text style={styles.sectionTitle}>Handelsregister & USt-ID</Text>
        <View style={styles.box}>
          <Text style={styles.text}>Registergericht: Amtsgericht Berlin-Charlottenburg</Text>
          <Text style={styles.text}>Registernummer: HRB 987654 B</Text>
          <Text style={styles.text}>Umsatzsteuer-Identifikationsnummer (USt-IdNr.): DE 123 456 789</Text>
          <Text style={styles.text}>Wirtschafts-ID: DE-WID-999888777</Text>
        </View>

        <Text style={styles.sectionTitle}>Kontakt</Text>
        <View style={styles.box}>
          <Text style={styles.text}>E-Mail: impressum@shopapp-de.example.com</Text>
          <Text style={styles.text}>Telefon: +49 (0) 30 12345678</Text>
        </View>

        <Text style={styles.sectionTitle}>{t('widerruf')}</Text>
        <View style={styles.box}>
          <Text style={styles.boldText}>Widerrufsrecht für Verbraucher</Text>
          <Text style={styles.text}>
            Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag, an dem Sie oder ein von Ihnen benannter Dritter die Waren in Besitz genommen haben.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Streitbeilegung (OS-Plattform)</Text>
        <View style={styles.box}>
          <Text style={styles.text}>
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: https://ec.europa.eu/consumers/odr. Wir sind nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4.27),
    paddingVertical: hp(1.5),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: {
    paddingVertical: hp(0.5),
    paddingRight: wp(2.67),
  },
  backBtnText: {
    fontSize: fp(4.0),
    color: '#2563EB',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: fp(4.27),
    fontWeight: '700',
    color: '#111827',
  },
  headerRightPlaceholder: {
    width: wp(10.67),
  },
  content: {
    padding: wp(4.27),
  },
  sectionTitle: {
    fontSize: fp(3.73),
    fontWeight: '700',
    color: '#374151',
    marginTop: hp(1.72),
    marginBottom: hp(0.74),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  box: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp(2.67),
    padding: wp(3.73),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  companyName: {
    fontSize: fp(4.0),
    fontWeight: '700',
    color: '#111827',
    marginBottom: hp(0.74),
  },
  text: {
    fontSize: fp(3.47),
    color: '#4B5563',
    lineHeight: hp(2.46),
  },
  boldText: {
    fontSize: fp(3.47),
    fontWeight: '700',
    color: '#111827',
    marginBottom: hp(0.5),
  },
});

export default ImpressumScreen;
