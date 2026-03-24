import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type GroupByOption = 'none' | 'month' | 'year';

interface FilterPillsProps {
  selectedYear: number | null;
  selectedMonth: number | null;
  groupBy: GroupByOption;
  monthNames: string[];
  colors: {
    primary: string;
    success: string;
    warning: string;
    danger: string;
  };
  t: (key: string) => string;
  onClearYear: () => void;
  onClearMonth: () => void;
  onClearGroupBy: () => void;
  onClearAll: () => void;
}

export function FilterPills({
  selectedYear,
  selectedMonth,
  groupBy,
  monthNames,
  colors,
  t,
  onClearYear,
  onClearMonth,
  onClearGroupBy,
  onClearAll,
}: FilterPillsProps) {
  const hasActiveFilters = selectedYear !== null || selectedMonth !== null || groupBy !== 'none';

  if (!hasActiveFilters) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {selectedYear && (
        <TouchableOpacity
          style={[styles.pill, { backgroundColor: colors.primary + '20', borderColor: colors.primary }]}
          onPress={onClearYear}
        >
          <Ionicons name="calendar" size={14} color={colors.primary} />
          <Text style={[styles.pillText, { color: colors.primary }]}>{selectedYear}</Text>
          <Ionicons name="close-circle" size={14} color={colors.primary} />
        </TouchableOpacity>
      )}
      {selectedMonth !== null && (
        <TouchableOpacity
          style={[styles.pill, { backgroundColor: colors.success + '20', borderColor: colors.success }]}
          onPress={onClearMonth}
        >
          <Ionicons name="calendar-outline" size={14} color={colors.success} />
          <Text style={[styles.pillText, { color: colors.success }]}>{monthNames[selectedMonth]}</Text>
          <Ionicons name="close-circle" size={14} color={colors.success} />
        </TouchableOpacity>
      )}
      {groupBy !== 'none' && (
        <TouchableOpacity
          style={[styles.pill, { backgroundColor: colors.warning + '20', borderColor: colors.warning }]}
          onPress={onClearGroupBy}
        >
          <Ionicons name="layers" size={14} color={colors.warning} />
          <Text style={[styles.pillText, { color: colors.warning }]}>
            {t(groupBy === 'year' ? 'groupByYear' : 'groupByMonth')}
          </Text>
          <Ionicons name="close-circle" size={14} color={colors.warning} />
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={[styles.clearAllPill, { borderColor: colors.danger }]}
        onPress={onClearAll}
      >
        <Text style={[styles.clearAllText, { color: colors.danger }]}>{t('clearAll')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: 44,
    marginBottom: 8,
  },
  content: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '500',
  },
  clearAllPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  clearAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
