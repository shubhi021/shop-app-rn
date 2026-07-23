import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from '../hooks/useTranslation';

interface EcoScoreBadgeProps {
  score?: 'A' | 'B' | 'C' | 'D' | 'E';
  co2Grams?: number;
  hasPfand?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const SCORE_COLORS: Record<string, string> = {
  A: '#10B981', // Emerald green
  B: '#34D399', // Mint green
  C: '#FBBF24', // Amber/Yellow
  D: '#F97316', // Orange
  E: '#EF4444', // Red
};

export const EcoScoreBadge: React.FC<EcoScoreBadgeProps> = ({
  score = 'B',
  co2Grams,
  hasPfand,
  size = 'medium',
}) => {
  const { t } = useTranslation();
  const color = SCORE_COLORS[score] || SCORE_COLORS.B;

  const isSmall = size === 'small';
  const isLarge = size === 'large';
  const iconSize = isSmall ? 10 : isLarge ? 14 : 12;

  return (
    <View style={styles.container}>
      <View style={[styles.badge, { backgroundColor: color }, isSmall && styles.badgeSmall, isLarge && styles.badgeLarge]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
          <Ionicons name="leaf" size={iconSize} color="#FFFFFF" />
          <Text style={[styles.badgeText, isSmall && styles.textSmall, isLarge && styles.textLarge]}>
            {score}
          </Text>
        </View>
      </View>
      {co2Grams && !isSmall ? (
        <Text style={styles.co2Text}>
          {co2Grams} {t('gCO2e')}
        </Text>
      ) : null}
      {hasPfand && !isSmall ? (
        <View style={styles.pfandPill}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
            <Ionicons name="refresh-circle-outline" size={12} color="#047857" />
            <Text style={styles.pfandText}>{t('pfandIncluded')}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
};

export default EcoScoreBadge;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeSmall: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  badgeLarge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  textSmall: {
    fontSize: 10,
  },
  textLarge: {
    fontSize: 15,
  },
  co2Text: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
  },
  pfandPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#A7F3D0',
  },
  pfandText: {
    fontSize: 10,
    color: '#047857',
    fontWeight: '600',
  },
});
