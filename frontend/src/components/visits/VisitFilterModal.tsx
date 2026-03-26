import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type GroupByOption = 'none' | 'month' | 'year';
type StatusFilter = 'all' | 'active' | 'completed';
type SortBy = 'recent' | 'oldest' | 'country' | 'duration';

interface VisitFilterModalProps {
  visible: boolean;
  onClose: () => void;
  colors: {
    card: string;
    background: string;
    border: string;
    text: string;
    textSecondary: string;
    primary: string;
    warning: string;
  };
  t: (key: string) => string;
  // Filters
  selectedYear: number | null;
  selectedMonth: number | null;
  groupBy: GroupByOption;
  statusFilter: StatusFilter;
  sortBy: SortBy;
  monthNames: string[];
  // Callbacks
  onYearPickerOpen: () => void;
  onMonthPickerOpen: () => void;
  onGroupByChange: (value: GroupByOption) => void;
  onStatusFilterChange: (value: StatusFilter) => void;
  onSortByChange: (value: SortBy) => void;
  onClearFilters: () => void;
}

export function VisitFilterModal({
  visible,
  onClose,
  colors,
  t,
  selectedYear,
  selectedMonth,
  groupBy,
  statusFilter,
  sortBy,
  monthNames,
  onYearPickerOpen,
  onMonthPickerOpen,
  onGroupByChange,
  onStatusFilterChange,
  onSortByChange,
  onClearFilters,
}: VisitFilterModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: colors.card }]}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text }]}>{t('advancedFilters')}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            {/* Group By */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>GROUP BY</Text>
              <View style={styles.options}>
                {(['none', 'month', 'year'] as const).map((option) => {
                  const labels: Record<string, string> = {
                    none: 'No Grouping',
                    month: 'Month',
                    year: 'Year'
                  };
                  return (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.chip,
                        { borderColor: colors.border },
                        groupBy === option && { backgroundColor: colors.warning, borderColor: colors.warning },
                      ]}
                      onPress={() => onGroupByChange(option)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          { color: groupBy === option ? '#FFFFFF' : colors.text },
                        ]}
                      >
                        {labels[option]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Status Filter */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>{t('filterByStatus')}</Text>
              <View style={styles.options}>
                {(['all', 'active', 'completed'] as const).map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.chip,
                      { borderColor: colors.border },
                      statusFilter === status && { backgroundColor: colors.primary, borderColor: colors.primary },
                    ]}
                    onPress={() => onStatusFilterChange(status)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: statusFilter === status ? '#FFFFFF' : colors.text },
                      ]}
                    >
                      {t(status)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Sort By */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>SORT BY</Text>
              <View style={styles.options}>
                {(['recent', 'oldest', 'country', 'duration'] as const).map((sort) => {
                  const sortLabels: Record<string, string> = {
                    recent: 'Recent',
                    oldest: 'Oldest',
                    country: 'Country',
                    duration: 'Duration'
                  };
                  return (
                    <TouchableOpacity
                      key={sort}
                      style={[
                        styles.chip,
                        { borderColor: colors.border },
                        sortBy === sort && { backgroundColor: colors.primary, borderColor: colors.primary },
                      ]}
                      onPress={() => onSortByChange(sort)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          { color: sortBy === sort ? '#FFFFFF' : colors.text },
                        ]}
                      >
                        {sortLabels[sort]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.clearButton, { borderColor: colors.border }]}
              onPress={onClearFilters}
            >
              <Text style={[styles.clearButtonText, { color: colors.text }]}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.applyButton, { backgroundColor: colors.primary }]}
              onPress={onClose}
            >
              <Text style={styles.applyButtonText}>{t('apply')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  scroll: {
    maxHeight: 400,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  dropdownText: {
    flex: 1,
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  clearButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  clearButtonText: {
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
