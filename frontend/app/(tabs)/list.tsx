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
  }, [visits, searchQuery, statusFilter, sortBy]);

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
          style={[styles.filterButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="options" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Hint */}
      <Text style={[styles.hint, { color: colors.textSecondary }]}>
        {t('swipeToDelete')}
      </Text>

      {/* List */}
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

            <View style={styles.filterSection}>
              <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>{t('sortBy')}</Text>
              <View style={styles.filterOptions}>
                {(['recent', 'oldest', 'byCountry', 'byDuration'] as const).map((sort) => {
                  const sortValue = sort === 'byCountry' ? 'country' : sort === 'byDuration' ? 'duration' : sort;
                  return (
                    <TouchableOpacity
                      key={sort}
                      style={[
                        styles.filterChip,
                        { borderColor: colors.border },
                        sortBy === sortValue && { backgroundColor: colors.primary, borderColor: colors.primary },
                      ]}
                      onPress={() => setSortBy(sortValue as any)}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          { color: sortBy === sortValue ? '#FFFFFF' : colors.text },
                        ]}
                      >
                        {t(sort)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.clearButton, { borderColor: colors.border }]}
              onPress={() => {
                setStatusFilter('all');
                setSortBy('recent');
              }}
            >
              <Text style={[styles.clearButtonText, { color: colors.danger }]}>{t('clearFilters')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.applyButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.applyButtonText}>{t('apply')}</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  clearButton: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 12,
  },
  clearButtonText: {
    fontWeight: '600',
  },
  applyButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
