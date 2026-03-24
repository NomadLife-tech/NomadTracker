import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  SectionList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useApp } from '../../src/contexts/AppContext';
import { useToast } from '../../src/contexts/ToastContext';
import { Visit } from '../../src/types';
import { isCurrentVisit, calculateDaysInCountry } from '../../src/utils/dateUtils';
import {
  SwipeableVisitRow,
  FilterPills,
  VisitFilterModal,
  PickerModal,
} from '../../src/components/visits';

type GroupByOption = 'none' | 'month' | 'year';
type StatusFilter = 'all' | 'active' | 'completed';
type SortBy = 'recent' | 'oldest' | 'country' | 'duration';

interface VisitSection {
  title: string;
  data: Visit[];
}

export default function VisitsListScreen() {
  const { colors } = useTheme();
  const { visits, deleteVisit, refreshVisits, t } = useApp();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Search and refresh state
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('recent');
  const [groupBy, setGroupBy] = useState<GroupByOption>('none');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  // Picker modal state
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  // Month names (localized)
  const monthNames = useMemo(() => [
    t('january'), t('february'), t('march'), t('april'),
    t('may'), t('june'), t('july'), t('august'),
    t('september'), t('october'), t('november'), t('december')
  ], [t]);

  // Get available years and months from visits
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    visits.forEach(v => years.add(new Date(v.entryDate).getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  }, [visits]);

  const availableMonths = useMemo(() => {
    if (!selectedYear) return [];
    const months = new Set<number>();
    visits.forEach(v => {
      const date = new Date(v.entryDate);
      if (date.getFullYear() === selectedYear) {
        months.add(date.getMonth());
      }
    });
    return Array.from(months).sort((a, b) => a - b);
  }, [visits, selectedYear]);

  // Refresh on focus
  useFocusEffect(
    useCallback(() => {
      refreshVisits();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshVisits();
    setRefreshing(false);
  };

  const handleDelete = async (visitId: string) => {
    await deleteVisit(visitId);
    showToast(t('success'), 'success');
  };

  // Filter and sort visits
  const filteredVisits = useMemo(() => {
    let result = [...visits];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(v =>
        v.countryName.toLowerCase().includes(query) ||
        v.visaType.toLowerCase().includes(query)
      );
    }

    // Year filter
    if (selectedYear) {
      result = result.filter(v => new Date(v.entryDate).getFullYear() === selectedYear);
    }

    // Month filter
    if (selectedMonth !== null && selectedYear) {
      result = result.filter(v => {
        const date = new Date(v.entryDate);
        return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
      });
    }

    // Status filter
    if (statusFilter === 'active') {
      result = result.filter(v => isCurrentVisit(v));
    } else if (statusFilter === 'completed') {
      result = result.filter(v => !isCurrentVisit(v));
    }

    // Sort
    switch (sortBy) {
      case 'recent':
        result.sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime());
        break;
      case 'country':
        result.sort((a, b) => a.countryName.localeCompare(b.countryName));
        break;
      case 'duration':
        result.sort((a, b) => {
          const daysA = calculateDaysInCountry(a.entryDate, a.exitDate);
          const daysB = calculateDaysInCountry(b.entryDate, b.exitDate);
          return daysB - daysA;
        });
        break;
    }

    return result;
  }, [visits, searchQuery, statusFilter, sortBy, selectedYear, selectedMonth]);

  // Group visits into sections
  const groupedVisits = useMemo((): VisitSection[] => {
    if (groupBy === 'none') {
      return [{ title: '', data: filteredVisits }];
    }

    const groups: Record<string, Visit[]> = {};

    filteredVisits.forEach(visit => {
      const date = new Date(visit.entryDate);
      const key = groupBy === 'year'
        ? date.getFullYear().toString()
        : `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

      if (!groups[key]) groups[key] = [];
      groups[key].push(visit);
    });

    return Object.entries(groups)
      .map(([title, data]) => ({ title, data }))
      .sort((a, b) => {
        if (groupBy === 'year') return parseInt(b.title) - parseInt(a.title);
        const dateA = new Date(a.data[0].entryDate);
        const dateB = new Date(b.data[0].entryDate);
        return dateB.getTime() - dateA.getTime();
      });
  }, [filteredVisits, groupBy, monthNames]);

  // Clear filters
  const clearFilters = useCallback(() => {
    setSelectedYear(null);
    setSelectedMonth(null);
    setStatusFilter('all');
    setSortBy('recent');
    setGroupBy('none');
  }, []);

  const hasActiveFilters = selectedYear !== null || selectedMonth !== null ||
    statusFilter !== 'all' || groupBy !== 'none';

  // Render section header
  const renderSectionHeader = useCallback(({ section: { title, data } }: { section: VisitSection }) => (
    <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      <View style={[styles.sectionBadge, { backgroundColor: colors.primary + '20' }]}>
        <Text style={[styles.sectionBadgeText, { color: colors.primary }]}>{data.length}</Text>
      </View>
    </View>
  ), [colors]);

  // Render visit item
  const renderVisitItem = useCallback(({ item }: { item: Visit }) => (
    <SwipeableVisitRow
      visit={item}
      onDelete={() => handleDelete(item.id)}
      onPress={() => router.push(`/visit/${item.id}`)}
      colors={colors}
      t={t}
    />
  ), [colors, t, router, handleDelete]);

  // Render empty state
  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Ionicons name="airplane" size={48} color={colors.textSecondary} />
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('noVisitsFound')}</Text>
      <TouchableOpacity
        style={[styles.emptyButton, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/visit/add')}
      >
        <Text style={styles.emptyButtonText}>{t('addNewVisit')}</Text>
      </TouchableOpacity>
    </View>
  ), [colors, t, router]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Bar */}
      <View style={[styles.searchContainer, { paddingTop: insets.top + 8 }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={t('searchVisits')}
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[
            styles.filterButton,
            { backgroundColor: colors.card, borderColor: colors.border },
            hasActiveFilters && { backgroundColor: colors.primary, borderColor: colors.primary },
          ]}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="options" size={20} color={hasActiveFilters ? '#FFFFFF' : colors.primary} />
          {hasActiveFilters && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>!</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Active Filter Pills */}
      <FilterPills
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        groupBy={groupBy}
        monthNames={monthNames}
        colors={colors}
        t={t}
        onClearYear={() => { setSelectedYear(null); setSelectedMonth(null); }}
        onClearMonth={() => setSelectedMonth(null)}
        onClearGroupBy={() => setGroupBy('none')}
        onClearAll={clearFilters}
      />

      {/* Hint */}
      <Text style={[styles.hint, { color: colors.textSecondary }]}>
        {t('swipeToDelete')} • {filteredVisits.length} {t('visits').toLowerCase()}
      </Text>

      {/* List */}
      {groupBy === 'none' ? (
        <FlatList
          data={filteredVisits}
          keyExtractor={(item) => item.id}
          renderItem={renderVisitItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListEmptyComponent={renderEmptyState}
        />
      ) : (
        <SectionList
          sections={groupedVisits}
          keyExtractor={(item) => item.id}
          renderItem={renderVisitItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListEmptyComponent={renderEmptyState}
        />
      )}

      {/* Filters Modal */}
      <VisitFilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        colors={colors}
        t={t}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        groupBy={groupBy}
        statusFilter={statusFilter}
        sortBy={sortBy}
        monthNames={monthNames}
        onYearPickerOpen={() => setShowYearPicker(true)}
        onMonthPickerOpen={() => setShowMonthPicker(true)}
        onGroupByChange={setGroupBy}
        onStatusFilterChange={setStatusFilter}
        onSortByChange={setSortBy}
        onClearFilters={clearFilters}
      />

      {/* Year Picker Modal */}
      <PickerModal
        visible={showYearPicker}
        onClose={() => setShowYearPicker(false)}
        title={t('selectYear')}
        items={availableYears}
        selectedItem={selectedYear}
        allItemsLabel={t('allYears')}
        onSelectItem={(year) => {
          setSelectedYear(year);
          setSelectedMonth(null);
        }}
        colors={colors}
      />

      {/* Month Picker Modal */}
      <PickerModal
        visible={showMonthPicker}
        onClose={() => setShowMonthPicker(false)}
        title={t('selectMonth')}
        items={availableMonths}
        selectedItem={selectedMonth}
        allItemsLabel={t('allMonths')}
        onSelectItem={setSelectedMonth}
        renderItem={(monthIndex) => monthNames[monthIndex]}
        colors={colors}
        highlightColor={colors.success}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  hint: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sectionBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
