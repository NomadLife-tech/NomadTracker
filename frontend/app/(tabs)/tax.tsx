import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useApp } from '../../src/contexts/AppContext';
import { calculateTaxDays } from '../../src/utils/dateUtils';
import { getCountryByCode } from '../../src/constants/countries';

export default function TaxScreen() {
  const { colors } = useTheme();
  const { visits, refreshVisits, t } = useApp();
  const insets = useSafeAreaInsets();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Note: Removed useFocusEffect with refreshVisits() that caused race condition
  // AppContext already manages state updates properly

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshVisits();
    setRefreshing(false);
  };

  const taxData = useMemo(() => {
    return calculateTaxDays(visits, selectedYear);
  }, [visits, selectedYear]);

  const currentYear = new Date().getFullYear();

  const changeYear = (delta: number) => {
    setSelectedYear(prev => prev + delta);
  };

  const getRiskLevel = (days: number): { level: string; color: string } => {
    if (days >= 183) {
      return { level: t('high'), color: colors.danger };
    } else if (days >= 120) {
      return { level: t('medium'), color: colors.warning };
    }
    return { level: t('low'), color: colors.success };
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{t('taxResidency')}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t('taxThreshold')}
          </Text>
        </View>

        {/* Year Selector */}
        <View style={[styles.yearSelector, { backgroundColor: colors.card }]}>
          <TouchableOpacity
            onPress={() => changeYear(-1)}
            style={[styles.yearButton, { backgroundColor: colors.border }]}
          >
            <Ionicons name="chevron-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.yearText, { color: colors.text }]}>{selectedYear}</Text>
          <TouchableOpacity
            onPress={() => changeYear(1)}
            disabled={selectedYear >= currentYear}
            style={[
              styles.yearButton,
              { backgroundColor: selectedYear >= currentYear ? colors.border + '50' : colors.border },
            ]}
          >
            <Ionicons
              name="chevron-forward"
              size={20}
              color={selectedYear >= currentYear ? colors.textSecondary : colors.text}
            />
          </TouchableOpacity>
        </View>

        {/* Tax Info Card */}
        <View style={[styles.infoCard, { backgroundColor: colors.primary + '15' }]}>
          <Ionicons name="information-circle" size={20} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            Many countries consider you a tax resident if you spend 183 or more days in a calendar year.
          </Text>
        </View>

        {/* Country List */}
        {taxData.length > 0 ? (
          taxData.map((item) => {
            const country = getCountryByCode(item.countryCode);
            const risk = getRiskLevel(item.days);
            const percentage = Math.min(100, (item.days / 183) * 100);

            return (
              <View key={item.countryCode} style={[styles.countryCard, { backgroundColor: colors.card }]}>
                <View style={styles.countryHeader}>
                  <View style={styles.countryInfo}>
                    <Text style={styles.flag}>{country?.flag}</Text>
                    <View>
                      <Text style={[styles.countryName, { color: colors.text }]}>{item.countryName}</Text>
                      <Text style={[styles.countryDays, { color: colors.textSecondary }]}>
                        {item.days} {t('days')} ({item.percentOfYear.toFixed(1)}% of year)
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.riskBadge, { backgroundColor: risk.color + '20' }]}>
                    <Text style={[styles.riskText, { color: risk.color }]}>{risk.level}</Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressSection}>
                  <View style={[styles.progressContainer, { backgroundColor: colors.border }]}>
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: `${percentage}%`,
                          backgroundColor: risk.color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
                    {item.days} / 183 {t('days')}
                  </Text>
                </View>

                {item.days >= 183 && (
                  <View style={[styles.warningBanner, { backgroundColor: colors.danger + '15' }]}>
                    <Ionicons name="warning" size={16} color={colors.danger} />
                    <Text style={[styles.warningText, { color: colors.danger }]}>
                      Tax residency threshold reached
                    </Text>
                  </View>
                )}
              </View>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="calculator-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No visits recorded for {selectedYear}
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  yearSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    gap: 16,
  },
  yearButton: {
    padding: 8,
    borderRadius: 8,
  },
  yearText: {
    fontSize: 20,
    fontWeight: '700',
    minWidth: 60,
    textAlign: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  countryCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  countryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  countryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flag: {
    fontSize: 36,
  },
  countryName: {
    fontSize: 17,
    fontWeight: '600',
  },
  countryDays: {
    fontSize: 13,
    marginTop: 2,
  },
  riskBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  riskText: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressSection: {
    gap: 6,
  },
  progressContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressLabel: {
    fontSize: 12,
    textAlign: 'right',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  warningText: {
    fontSize: 13,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
  },
});
