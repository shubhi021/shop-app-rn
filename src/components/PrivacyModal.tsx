import React, {useState, useEffect} from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useTranslation} from '../hooks/useTranslation';
import {hp, wp, fp} from '../theme/dimensions';

interface PrivacyModalProps {
  visible: boolean;
  onClose: () => void;
}

const STORAGE_KEY = 'dsgvo_cookie_consent_v1';

export const PrivacyModal: React.FC<PrivacyModalProps> = ({
  visible,
  onClose,
}) => {
  const {t, formatGermanDate} = useTranslation();

  const [essential] = useState(true); // Always true & disabled
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(data => {
      if (data) {
        try {
          const parsed = JSON.parse(data);
          setAnalytics(!!parsed.analytics);
          setMarketing(!!parsed.marketing);
        } catch (e) {
          // ignore
        }
      }
    });
  }, [visible]);

  const handleSave = async (acceptAll = false) => {
    const preferences = {
      essential: true,
      analytics: acceptAll ? true : analytics,
      marketing: acceptAll ? true : marketing,
      updatedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    Alert.alert('DSGVO Consent Updated', t('savePreferences'));
    onClose();
  };

  const handleExportData = () => {
    const userData = {
      dsgvoArticle: 'Article 15 GDPR - Right of Access',
      exportedAt: formatGermanDate(new Date()),
      consentStatus: {
        essential: true,
        analytics,
        marketing,
      },
      appVersion: '1.0.0-DE',
    };

    Alert.alert(
      'DSGVO Data Export (Art. 15)',
      JSON.stringify(userData, null, 2),
      [{text: 'OK'}],
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Recht auf Vergessenwerden (Art. 17 DSGVO)',
      'Möchten Sie Ihr Benutzerkonto und alle personenbezogenen Daten wirklich unwiderruflich löschen?',
      [
        {text: t('cancel'), style: 'cancel'},
        {
          text: t('confirm'),
          style: 'destructive',
          onPress: () =>
            Alert.alert(
              'Konto Gelöscht',
              'Alle Daten wurden gemäß DSGVO gelöscht.',
            ),
        },
      ],
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Ionicons name="lock-closed-outline" size={20} color="#111827" />
            <Text style={styles.title}>{t('privacySettings')}</Text>
          </View>
          <Text style={styles.subtitle}>{t('privacyManager')}</Text>

          <ScrollView style={styles.scroll}>
            <View style={styles.optionRow}>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>{t('essentialCookies')}</Text>
                <Text style={styles.optionDesc}>
                  Erforderlich für Grundfunktionen wie Anmeldung & Warenkorb.
                </Text>
              </View>
              <Switch
                accessibilityRole="switch"
                accessibilityLabel={t('essentialCookies')}
                accessibilityState={{ checked: essential, disabled: true }}
                value={essential}
                disabled
                trackColor={{true: '#9CA3AF'}}
              />
            </View>

            <View style={styles.optionRow}>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>{t('analyticsCookies')}</Text>
                <Text style={styles.optionDesc}>
                  Anonyme Nutzungsauswertung zur Verbesserung der Performance.
                </Text>
              </View>
              <Switch
                accessibilityRole="switch"
                accessibilityLabel={t('analyticsCookies')}
                accessibilityState={{ checked: analytics }}
                value={analytics}
                onValueChange={setAnalytics}
                trackColor={{false: '#D1D5DB', true: '#2563EB'}}
              />
            </View>

            <View style={styles.optionRow}>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>{t('marketingCookies')}</Text>
                <Text style={styles.optionDesc}>
                  Personalisierte Produktempfehlungen und Angebote.
                </Text>
              </View>
              <Switch
                accessibilityRole="switch"
                accessibilityLabel={t('marketingCookies')}
                accessibilityState={{ checked: marketing }}
                value={marketing}
                onValueChange={setMarketing}
                trackColor={{false: '#D1D5DB', true: '#2563EB'}}
              />
            </View>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.actionBtnSecondary}
              onPress={handleExportData}
              accessibilityRole="button"
              accessibilityLabel={t('exportData')}>
              <View style={styles.buttonRow}>
                <Ionicons name="download-outline" size={16} color="#374151" />
                <Text style={styles.actionBtnSecondaryText}>
                  {t('exportData')}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtnDanger}
              onPress={handleDeleteAccount}
              accessibilityRole="button"
              accessibilityLabel={t('deleteAccount')}>
              <View style={styles.buttonRow}>
                <Ionicons name="trash-outline" size={16} color="#991B1B" />
                <Text style={styles.actionBtnDangerText}>
                  {t('deleteAccount')}
                </Text>
              </View>
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={() => handleSave(false)}
              accessibilityRole="button"
              accessibilityLabel={t('savePreferences')}>
              <Text style={styles.saveBtnText}>{t('savePreferences')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.acceptAllBtn}
              onPress={() => handleSave(true)}
              accessibilityRole="button"
              accessibilityLabel={t('acceptAll')}>
              <Text style={styles.acceptAllBtnText}>{t('acceptAll')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default PrivacyModal;

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
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1.6),
    marginBottom: hp(0.25),
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1.6),
  },
  title: {
    fontSize: fp(4.8),
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: fp(3.2),
    color: '#6B7280',
    marginBottom: hp(2.0),
  },
  scroll: {
    marginBottom: hp(2.0),
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: hp(1.5),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  optionTextContainer: {
    flex: 1,
    paddingRight: wp(3.2),
  },
  optionTitle: {
    fontSize: fp(3.73),
    fontWeight: '600',
    color: '#1F2937',
  },
  optionDesc: {
    fontSize: fp(3.2),
    color: '#6B7280',
    marginTop: hp(0.25),
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: hp(1.5),
  },
  actionBtnSecondary: {
    paddingVertical: hp(1.23),
    alignItems: 'center',
  },
  actionBtnSecondaryText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: fp(3.47),
  },
  actionBtnDanger: {
    paddingVertical: hp(1.23),
    alignItems: 'center',
  },
  actionBtnDangerText: {
    color: '#991B1B',
    fontWeight: '600',
    fontSize: fp(3.47),
  },
  footer: {
    flexDirection: 'row',
    gap: wp(2.67),
    paddingTop: hp(1.23),
  },
  saveBtn: {
    flex: 1,
    paddingVertical: hp(1.5),
    borderRadius: wp(2.7),
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: fp(3.47),
  },
  acceptAllBtn: {
    flex: 1,
    paddingVertical: hp(1.5),
    borderRadius: wp(2.7),
    backgroundColor: '#2563EB',
    alignItems: 'center',
  },
  acceptAllBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: fp(3.47),
  },
});
