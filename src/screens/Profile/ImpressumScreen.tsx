import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '../../hooks/useTranslation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
        <View style={{ width: 40 }} />
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: {
    paddingVertical: 4,
    paddingRight: 10,
  },
  backBtnText: {
    fontSize: 15,
    color: '#2563EB',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginTop: 14,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  box: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  companyName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  text: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
  },
  boldText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
});

export default ImpressumScreen;
