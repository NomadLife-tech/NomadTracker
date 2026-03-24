import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { YearComparison } from '../../utils/statisticsUtils';

interface YearComparisonCardProps {
  comparisons: YearComparison[];
  t: (key: string) => string;
}

export function YearComparisonCard({ comparisons, t }: YearComparisonCardProps) {
  const { colors } = useTheme();

  if (comparisons.length === 0) {
    return null;
  }

  const getChangeIndicator = (current: number, previous: number | undefined) => {
    if (previous === undefined) return null;
    const diff = current - previous;
    if (diff > 0) {
      return { icon: 'arrow-up' as const, color: colors.success, text: `+${diff}` };
    } else if (diff < 0) {
      return { icon: 'arrow-down' as const, color: colors.danger, text: `${diff}` };
    }
    return { icon: 'remove' as const, color: colors.textSecondary, text: '0' };
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <Ionicons name="analytics" size={20} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>
          {t('yearOverYear')}
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.tableContainer}>
          {/* Header Row */}
          <View style={[styles.row, styles.headerRow, { borderBottomColor: colors.border }]}>
            <View style={[styles.cell, styles.yearCell]}>
              <Text style={[styles.headerText, { color: colors.textSecondary }]}>
                {t('year')}
              </Text>
            </View>
            <View style={styles.cell}>
              <Text style={[styles.headerText, { color: colors.textSecondary }]}>
                {t('visits')}
              </Text>
            </View>
            <View style={styles.cell}>
              <Text style={[styles.headerText, { color: colors.textSecondary }]}>
                {t('countries')}
              </Text>
            </View>
            <View style={styles.cell}>
              <Text style={[styles.headerText, { color: colors.textSecondary }]}>
                {t('daysAbroad')}
              </Text>
            </View>
            <View style={styles.cell}>
              <Text style={[styles.headerText, { color: colors.textSecondary }]}>
                {t('newCountries')}
              </Text>
            </View>
          </View>

          {/* Data Rows */}
          {comparisons.map((yearData, index) => {
            const prevYear = comparisons[index + 1];
            const visitsChange = getChangeIndicator(yearData.totalVisits, prevYear?.totalVisits);
            const countriesChange = getChangeIndicator(yearData.countriesVisited, prevYear?.countriesVisited);
            const daysChange = getChangeIndicator(yearData.daysAbroad, prevYear?.daysAbroad);

            return (
              <View 
                key={yearData.year} 
                style={[
                  styles.row, 
                  index === 0 && { backgroundColor: colors.primary + '08' },
                  { borderBottomColor: colors.border }
                ]}
              >
                <View style={[styles.cell, styles.yearCell]}>
                  <Text style={[styles.yearText, { color: colors.text }]}>
                    {yearData.year}
                  </Text>
                  {index === 0 && (
                    <View style={[styles.currentBadge, { backgroundColor: colors.primary }]}>
                      <Text style={styles.currentBadgeText}>{t('current')}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.cell}>
                  <Text style={[styles.cellValue, { color: colors.text }]}>
                    {yearData.totalVisits}
                  </Text>
                  {visitsChange && (
                    <View style={styles.changeIndicator}>
                      <Ionicons name={visitsChange.icon} size={10} color={visitsChange.color} />
                    </View>
                  )}
                </View>
                <View style={styles.cell}>
                  <Text style={[styles.cellValue, { color: colors.text }]}>
                    {yearData.countriesVisited}
                  </Text>
                  {countriesChange && (
                    <View style={styles.changeIndicator}>
                      <Ionicons name={countriesChange.icon} size={10} color={countriesChange.color} />
                    </View>
                  )}
                </View>
                <View style={styles.cell}>
                  <Text style={[styles.cellValue, { color: colors.text }]}>
                    {yearData.daysAbroad}
                  </Text>
                  {daysChange && (
                    <View style={styles.changeIndicator}>
                      <Ionicons name={daysChange.icon} size={10} color={daysChange.color} />
                    </View>
                  )}
                </View>
                <View style={styles.cell}>
                  {yearData.newCountries > 0 ? (
                    <View style={[styles.newCountriesBadge, { backgroundColor: colors.success + '15' }]}>
                      <Ionicons name="add" size={12} color={colors.success} />
                      <Text style={[styles.newCountriesText, { color: colors.success }]}>
                        {yearData.newCountries}
                      </Text>
                    </View>
                  ) : (
                    <Text style={[styles.cellValue, { color: colors.textSecondary }]}>-</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  tableContainer: {
    minWidth: '100%',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  headerRow: {
    paddingBottom: 8,
  },
  cell: {
    width: 70,
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  yearCell: {
    width: 80,
    justifyContent: 'flex-start',
    gap: 6,
  },
  headerText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  yearText: {
    fontSize: 15,
    fontWeight: '600',
  },
  currentBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  currentBadgeText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cellValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  changeIndicator: {
    marginLeft: 2,
  },
  newCountriesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  newCountriesText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
