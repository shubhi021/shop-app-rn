import React from 'react';
import {View, Text, StyleSheet, StatusBar} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useTranslation} from '../hooks/useTranslation';
import {SafeAreaView} from 'react-native-safe-area-context';
import {hp, wp, fp} from '../theme/dimensions';

interface OfflineBannerProps {
  isOffline: boolean;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({isOffline}) => {
  const {t} = useTranslation();

  if (!isOffline) {
    return null;
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#D97706"
        animated={true}
      />
      <View
        style={styles.banner}
        accessibilityRole="alert"
        accessibilityLiveRegion="assertive">
        <Ionicons name="wifi-outline" size={14} color="#FFFFFF" />
        <Text style={styles.text}>
          {t('offlineMode')} — {t('offlineNotice')}
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default OfflineBanner;

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#D97706',
    paddingTop: hp(4),
  },
  banner: {
    backgroundColor: '#D97706',
    paddingVertical: hp(1.0),
    paddingHorizontal: wp(4.3),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(2.1),
  },
  text: {
    color: '#FFFFFF',
    fontSize: fp(3.2),
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
