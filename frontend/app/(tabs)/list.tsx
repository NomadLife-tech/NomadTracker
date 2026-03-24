import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Animated,
  PanResponder,
  Modal,
  SectionList,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useApp } from '../../src/contexts/AppContext';
import { useToast } from '../../src/contexts/ToastContext';
import { Visit } from '../../src/types';
import { isCurrentVisit, calculateDaysInCountry, formatDate } from '../../src/utils/dateUtils';
import { getCountryByCode } from '../../src/constants/countries';

type GroupByOption = 'none' | 'month' | 'year';

interface VisitSection {
  title: string;
  data: Visit[];
}

interface SwipeableRowProps {
  visit: Visit;
  onDelete: () => void;
  onPress: () => void;
  colors: any;
  t: (key: string) => string;
}

function SwipeableRow({ visit, onDelete, onPress, colors, t }: SwipeableRowProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const isActive = isCurrentVisit(visit);
  const daysCount = calculateDaysInCountry(visit.entryDate, visit.exitDate);
  const country = getCountryByCode(visit.countryCode);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          translateX.setValue(Math.max(-80, gestureState.dx));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -40) {
          Animated.spring(translateX, {
            toValue: -80,
            useNativeDriver: true,
          }).start();
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const closeSwipe = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.swipeContainer}>
      <TouchableOpacity
        style={[styles.deleteAction, { backgroundColor: colors.danger }]}
        onPress={() => {
          closeSwipe();
          onDelete();
        }}
      >
        <Ionicons name="trash" size={24} color="#FFFFFF" />
      </TouchableOpacity>
      <Animated.View
        style={[{ transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={[styles.visitItem, { backgroundColor: colors.card }]}
          onPress={onPress}
          activeOpacity={0.7}
        >
          <Text style={styles.flag}>{country?.flag}</Text>
          <View style={styles.visitInfo}>
            <View style={styles.visitHeader}>
              <Text style={[styles.visitCountry, { color: colors.text }]}>{visit.countryName}</Text>
              {isActive && (
                <View style={[styles.activeBadge, { backgroundColor: colors.success + '20' }]}>
                  <Text style={[styles.activeBadgeText, { color: colors.success }]}>{t('active')}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.visitVisa, { color: colors.textSecondary }]}>{visit.visaType}</Text>
            <View style={styles.visitDates}>
              <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
              <Text style={[styles.visitDateText, { color: colors.textSecondary }]}>
                {formatDate(visit.entryDate, 'MMM d, yyyy')}
                {visit.exitDate && ` - ${formatDate(visit.exitDate, 'MMM d, yyyy')}`}
              </Text>
            </View>
          </View>
          <View style={styles.visitDaysContainer}>
            <Text style={[styles.visitDays, { color: colors.primary }]}>{daysCount}</Text>
            <Text style={[styles.visitDaysLabel, { color: colors.textSecondary }]}>{t('days')}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

export default function VisitsListScreen() {
  const { colors } = useTheme();
  const { visits, deleteVisit, refreshVisits, t } = useApp();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'country' | 'duration'>('recent');
  const [groupBy, setGroupBy] = useState<GroupByOption>('none');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  // Get available years and months from visits
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    visits.forEach(v => {
      years.add(new Date(v.entryDate).getFullYear());
    });
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

  const monthNames = [
    t('january'), t('february'), t('march'), t('april'),
    t('may'), t('june'), t('july'), t('august'),
    t('september'), t('october'), t('november'), t('december')
  ];

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
      result = result.filter(v => {
        const year = new Date(v.entryDate).getFullYear();
        return year === selectedYear;
      });
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
      let key: string;

      if (groupBy === 'year') {
        key = date.getFullYear().toString();
      } else {
        key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(visit);
    });

    // Sort sections by date (most recent first)
    return Object.entries(groups)
      .map(([title, data]) => ({ title, data }))
      .sort((a, b) => {
        if (groupBy === 'year') {
          return parseInt(b.title) - parseInt(a.title);
        }
        // For month grouping, parse the date
        const dateA = new Date(a.data[0].entryDate);
        const dateB = new Date(b.data[0].entryDate);
        return dateB.getTime() - dateA.getTime();
      });
  }, [filteredVisits, groupBy, monthNames]);

  const clearFilters = () => {
    setSelectedYear(null);
    setSelectedMonth(null);
    setStatusFilter('all');
    setSortBy('recent');
    setGroupBy('none');
  };

  const hasActiveFilters = selectedYear !== null || selectedMonth !== null || 
    statusFilter !== 'all' || groupBy !== 'none';

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
            hasActiveFilters && { backgroundColor: colors.primary, borderColor: colors.primary }
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
      {hasActiveFilters && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterPillsContainer}
          contentContainerStyle={styles.filterPillsContent}
        >
          {selectedYear && (
            <TouchableOpacity
              style={[styles.filterPill, { backgroundColor: colors.primary + '20', borderColor: colors.primary }]}
              onPress={() => { setSelectedYear(null); setSelectedMonth(null); }}
            >
              <Ionicons name="calendar" size={14} color={colors.primary} />
              <Text style={[styles.filterPillText, { color: colors.primary }]}>{selectedYear}</Text>
              <Ionicons name="close-circle" size={14} color={colors.primary} />
            </TouchableOpacity>
          )}
          {selectedMonth !== null && (
            <TouchableOpacity
              style={[styles.filterPill, { backgroundColor: colors.success + '20', borderColor: colors.success }]}
              onPress={() => setSelectedMonth(null)}
            >
              <Ionicons name="calendar-outline" size={14} color={colors.success} />
              <Text style={[styles.filterPillText, { color: colors.success }]}>{monthNames[selectedMonth]}</Text>
              <Ionicons name="close-circle" size={14} color={colors.success} />
            </TouchableOpacity>
          )}
          {groupBy !== 'none' && (
            <TouchableOpacity
              style={[styles.filterPill, { backgroundColor: colors.warning + '20', borderColor: colors.warning }]}
              onPress={() => setGroupBy('none')}
            >
              <Ionicons name="layers" size={14} color={colors.warning} />
              <Text style={[styles.filterPillText, { color: colors.warning }]}>
                {t(groupBy === 'year' ? 'groupByYear' : 'groupByMonth')}
              </Text>
              <Ionicons name="close-circle" size={14} color={colors.warning} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.clearAllPill, { borderColor: colors.danger }]}
            onPress={clearFilters}
          >
            <Text style={[styles.clearAllText, { color: colors.danger }]}>{t('clearAll')}</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Hint */}
      <Text style={[styles.hint, { color: colors.textSecondary }]}>
        {t('swipeToDelete')} • {filteredVisits.length} {t('visits').toLowerCase()}
      </Text>

      {/* List with Grouping */}
      {groupBy === 'none' ? (
        <FlatList
          data={filteredVisits}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SwipeableRow
              visit={item}
              onDelete={() => handleDelete(item.id)}
              onPress={() => router.push(`/visit/${item.id}`)}
              colors={colors}
              t={t}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="airplane" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {t('noVisitsFound')}
              </Text>
              <TouchableOpacity
                style={[styles.emptyButton, { backgroundColor: colors.primary }]}
                onPress={() => router.push('/visit/add')}
              >
                <Text style={styles.emptyButtonText}>{t('addNewVisit')}</Text>
              </TouchableOpacity>
            </View>
          }
        />
      ) : (
        <SectionList
          sections={groupedVisits}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SwipeableRow
              visit={item}
              onDelete={() => handleDelete(item.id)}
              onPress={() => router.push(`/visit/${item.id}`)}
              colors={colors}
              t={t}
            />
          )}
          renderSectionHeader={({ section: { title, data } }) => (
            <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
              <View style={[styles.sectionBadge, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.sectionBadgeText, { color: colors.primary }]}>
                  {data.length}
                </Text>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="airplane" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {t('noVisitsFound')}
              </Text>
            </View>
          }
        />
      )}

      {/* Filters Modal */}
      <Modal visible={showFilters} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t('advancedFilters')}</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {/* Year Filter */}
              <View style={styles.filterSection}>
                <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>{t('filterByYear')}</Text>
                <TouchableOpacity
                  style={[styles.dropdown, { backgroundColor: colors.background, borderColor: colors.border }]}
                  onPress={() => setShowYearPicker(true)}
                >
                  <Ionicons name="calendar" size={18} color={colors.primary} />
                  <Text style={[styles.dropdownText, { color: selectedYear ? colors.text : colors.textSecondary }]}>
                    {selectedYear || t('allYears')}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Month Filter (only if year is selected) */}
              {selectedYear && (
                <View style={styles.filterSection}>
                  <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>{t('filterByMonth')}</Text>
                  <TouchableOpacity
                    style={[styles.dropdown, { backgroundColor: colors.background, borderColor: colors.border }]}
                    onPress={() => setShowMonthPicker(true)}
                  >
                    <Ionicons name="calendar-outline" size={18} color={colors.success} />
                    <Text style={[styles.dropdownText, { color: selectedMonth !== null ? colors.text : colors.textSecondary }]}>
                      {selectedMonth !== null ? monthNames[selectedMonth] : t('allMonths')}
                    </Text>
                    <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              )}

              {/* Group By */}
              <View style={styles.filterSection}>
                <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>{t('groupBy')}</Text>
                <View style={styles.filterOptions}>
                  {(['none', 'month', 'year'] as const).map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.filterChip,
                        { borderColor: colors.border },
                        groupBy === option && { backgroundColor: colors.warning, borderColor: colors.warning },
                      ]}
                      onPress={() => setGroupBy(option)}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          { color: groupBy === option ? '#FFFFFF' : colors.text },
                        ]}
                      >
                        {t(option === 'none' ? 'noGrouping' : option === 'year' ? 'year' : 'month')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Status Filter */}
              <View style={styles.filterSection}>
                <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>{t('filterByStatus')}</Text>
                <View style={styles.filterOptions}>
                  {(['all', 'active', 'completed'] as const).map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.filterChip,
                        { borderColor: colors.border },
                        statusFilter === status && { backgroundColor: colors.primary, borderColor: colors.primary },
                      ]}
                      onPress={() => setStatusFilter(status)}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
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
              <View style={styles.filterSection}>
                <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>{t('sortBy')}</Text>
                <View style={styles.filterOptions}>
                  {(['recent', 'oldest', 'country', 'duration'] as const).map((sort) => (
                    <TouchableOpacity
                      key={sort}
                      style={[
                        styles.filterChip,
                        { borderColor: colors.border },
                        sortBy === sort && { backgroundColor: colors.primary, borderColor: colors.primary },
                      ]}
                      onPress={() => setSortBy(sort)}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          { color: sortBy === sort ? '#FFFFFF' : colors.text },
                        ]}
                      >
                        {t(sort)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            {/* Apply Button */}
            <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
              <TouchableOpacity
                style={[styles.clearButton, { borderColor: colors.border }]}
                onPress={clearFilters}
              >
                <Text style={[styles.clearButtonText, { color: colors.text }]}>{t('clearAll')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.applyButton, { backgroundColor: colors.primary }]}
                onPress={() => setShowFilters(false)}
              >
                <Text style={styles.applyButtonText}>{t('apply')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Year Picker Modal */}
      <Modal visible={showYearPicker} animationType="fade" transparent>
        <TouchableOpacity 
          style={styles.pickerOverlay} 
          activeOpacity={1} 
          onPress={() => setShowYearPicker(false)}
        >
          <View style={[styles.pickerContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.pickerTitle, { color: colors.text }]}>{t('selectYear')}</Text>
            <TouchableOpacity
              style={[styles.pickerItem, { borderBottomColor: colors.border }]}
              onPress={() => { setSelectedYear(null); setSelectedMonth(null); setShowYearPicker(false); }}
            >
              <Text style={[styles.pickerItemText, { color: colors.primary }]}>{t('allYears')}</Text>
            </TouchableOpacity>
            <ScrollView style={styles.pickerScroll}>
              {availableYears.map((year) => (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.pickerItem, 
                    { borderBottomColor: colors.border },
                    selectedYear === year && { backgroundColor: colors.primary + '15' }
                  ]}
                  onPress={() => { setSelectedYear(year); setSelectedMonth(null); setShowYearPicker(false); }}
                >
                  <Text style={[
                    styles.pickerItemText, 
                    { color: selectedYear === year ? colors.primary : colors.text }
                  ]}>
                    {year}
                  </Text>
                  {selectedYear === year && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Month Picker Modal */}
      <Modal visible={showMonthPicker} animationType="fade" transparent>
        <TouchableOpacity 
          style={styles.pickerOverlay} 
          activeOpacity={1} 
          onPress={() => setShowMonthPicker(false)}
        >
          <View style={[styles.pickerContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.pickerTitle, { color: colors.text }]}>{t('selectMonth')}</Text>
            <TouchableOpacity
              style={[styles.pickerItem, { borderBottomColor: colors.border }]}
              onPress={() => { setSelectedMonth(null); setShowMonthPicker(false); }}
            >
              <Text style={[styles.pickerItemText, { color: colors.primary }]}>{t('allMonths')}</Text>
            </TouchableOpacity>
            <ScrollView style={styles.pickerScroll}>
              {availableMonths.map((monthIndex) => (
                <TouchableOpacity
                  key={monthIndex}
                  style={[
                    styles.pickerItem, 
                    { borderBottomColor: colors.border },
                    selectedMonth === monthIndex && { backgroundColor: colors.success + '15' }
                  ]}
                  onPress={() => { setSelectedMonth(monthIndex); setShowMonthPicker(false); }}
                >
                  <Text style={[
                    styles.pickerItemText, 
                    { color: selectedMonth === monthIndex ? colors.success : colors.text }
                  ]}>
                    {monthNames[monthIndex]}
                  </Text>
                  {selectedMonth === monthIndex && (
                    <Ionicons name="checkmark" size={20} color={colors.success} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
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
  filterPillsContainer: {
    maxHeight: 44,
    marginBottom: 8,
  },
  filterPillsContent: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterPillText: {
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
  swipeContainer: {
    marginBottom: 12,
  },
  deleteAction: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  flag: {
    fontSize: 36,
  },
  visitInfo: {
    flex: 1,
  },
  visitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  visitCountry: {
    fontSize: 17,
    fontWeight: '600',
  },
  activeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  visitVisa: {
    fontSize: 13,
    marginTop: 2,
  },
  visitDates: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  visitDateText: {
    fontSize: 12,
  },
  visitDaysContainer: {
    alignItems: 'center',
  },
  visitDays: {
    fontSize: 24,
    fontWeight: '700',
  },
  visitDaysLabel: {
    fontSize: 11,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  filterSection: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalScroll: {
    maxHeight: 400,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
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
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContent: {
    width: '80%',
    maxHeight: '60%',
    borderRadius: 16,
    padding: 16,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  pickerScroll: {
    maxHeight: 300,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
  },
  pickerItemText: {
    fontSize: 16,
  },
});
