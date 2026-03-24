import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Passport } from '../../types';
import { getCountryByCode } from '../../constants/countries';
import { formatDate } from '../../utils/dateUtils';
import { useTheme } from '../../contexts/ThemeContext';
import { SwipeableItem } from './SwipeableItem';

interface PassportCardProps {
  passport: Passport;
  onEdit: () => void;
  onDelete: () => void;
  t: (key: string) => string;
}

export function PassportCard({ passport, onEdit, onDelete, t }: PassportCardProps) {
  const { colors } = useTheme();
  const country = passport.countryCode ? getCountryByCode(passport.countryCode) : null;
  
  // Safely calculate expiry status - handle empty or invalid dates
  const hasValidExpiryDate = passport.expiryDate && passport.expiryDate.length > 0;
  const expiryDate = hasValidExpiryDate ? new Date(passport.expiryDate) : null;
  const isValidDate = expiryDate && !isNaN(expiryDate.getTime());
  
  const today = new Date();
  const daysUntilExpiry = isValidDate 
    ? Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 180 && daysUntilExpiry > 0;
  const isExpired = daysUntilExpiry !== null && daysUntilExpiry <= 0;

  // Format expiry date safely
  const formattedExpiryDate = isValidDate 
    ? formatDate(passport.expiryDate, 'MMM d, yyyy')
    : null;

  return (
    <SwipeableItem onDelete={onDelete} onPress={onEdit}>
      <View style={styles.content}>
        <Text style={styles.flag}>{country?.flag || '🌍'}</Text>
        <View style={styles.info}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              {country?.name || passport.countryName || t('noCountry') || 'Passport'}
            </Text>
            {isExpired && (
              <View style={[styles.badge, { backgroundColor: colors.danger }]}>
                <Text style={styles.badgeText}>{t('expired')}</Text>
              </View>
            )}
            {isExpiringSoon && !isExpired && (
              <View style={[styles.badge, { backgroundColor: colors.warning }]}>
                <Text style={styles.badgeText}>{daysUntilExpiry}d</Text>
              </View>
            )}
          </View>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t(passport.type)}{passport.passportNumber ? ` • ${passport.passportNumber}` : ''}
          </Text>
          {formattedExpiryDate && (
            <View style={styles.expiryRow}>
              <Ionicons name="calendar-outline" size={12} color={colors.textSecondary} />
              <Text style={[styles.expiryText, { color: colors.textSecondary }]}>
                {t('expires')}: {formattedExpiryDate}
              </Text>
            </View>
          )}
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
      </View>
    </SwipeableItem>
  );
}

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flag: {
    fontSize: 32,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  expiryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  expiryText: {
    fontSize: 11,
  },
});
