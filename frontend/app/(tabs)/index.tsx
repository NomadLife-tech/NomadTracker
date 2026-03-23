import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useApp } from '../../src/contexts/AppContext';
import { MiniMapCard } from '../../src/components/common/MiniMapCard';
import { 
  isCurrentVisit, 
  calculateSchengenDays,
  getSchengenBreakdown,
  getDaysByCountryForYear,
  isSchengenCountry,
  formatDate,
} from '../../src/utils/dateUtils';
import { getCountryByCode } from '../../src/constants/countries';

export default function DashboardScreen() {
  const { colors } = useTheme();
  const { visits, t, refreshAll, isLoading } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showVisitsModal, setShowVisitsModal] = useState(false);
  const [showCountriesModal, setShowCountriesModal] = useState(false);
  const [showSchengenModal, setShowSchengenModal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refreshAll();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  };

  // Get active visit
  const activeVisit = useMemo(() => {
    return visits.find(v => isCurrentVisit(v));
  }, [visits]);

  // Statistics
  const totalVisits = visits.length;
  const uniqueCountries = useMemo(() => {
    const codes = new Set(visits.map(v => v.countryCode));
    return codes.size;
  }, [visits]);

  // Schengen status
  const hasSchengenVisits = useMemo(() => {
    return visits.some(v => isSchengenCountry(v.countryCode));
  }, [visits]);

  const schengenStatus = useMemo(() => {
    if (!hasSchengenVisits) return null;
    return calculateSchengenDays(visits);
  }, [visits, hasSchengenVisits]);

  const schengenBreakdown = useMemo(() => {
    if (!hasSchengenVisits) return [];
    return getSchengenBreakdown(visits);
  }, [visits, hasSchengenVisits]);

  // Pie chart data
  const pieData = useMemo(() => {
    return getDaysByCountryForYear(visits, selectedYear);
  }, [visits, selectedYear]);

  // Colors for Schengen progress
  const getProgressColor = (percentage: number) => {
    if (percentage < 70) return colors.success;
    if (percentage < 90) return colors.warning;
    return colors.danger;
  };

  const changeYear = (delta: number) => {
    setSelectedYear(prev => prev + delta);
  };

  const currentYear = new Date().getFullYear();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Current Visit Mini Map Card - Always Light Mode */}
        <MiniMapCard
          activeVisit={activeVisit || null}
          onPress={() => activeVisit && router.push(`/visit/${activeVisit.id}`)}
          onAddVisit={() => router.push('/visit/add')}
          t={t}
        />

        {/* Statistics Card */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.textSecondary }]}>
            {t('statistics')}
          </Text>
          <View style={styles.statsGrid}>
            <TouchableOpacity
              style={[styles.statCard, { backgroundColor: colors.primary + '15' }]}
              onPress={() => setShowVisitsModal(true)}
            >
              <Text style={[styles.statCardValue, { color: colors.primary }]}>{totalVisits}</Text>
              <Text style={[styles.statCardLabel, { color: colors.textSecondary }]}>
                {t('totalVisits')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.statCard, { backgroundColor: colors.success + '15' }]}
              onPress={() => setShowCountriesModal(true)}
            >
              <Text style={[styles.statCardValue, { color: colors.success }]}>{uniqueCountries}</Text>
              <Text style={[styles.statCardLabel, { color: colors.textSecondary }]}>
                {t('countriesVisited')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Schengen Calculator */}
        {hasSchengenVisits && schengenStatus && (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: colors.textSecondary }]}>
                {t('schengenCalculator')}
              </Text>
            </View>
            <View style={styles.schengenContent}>
              <View style={styles.schengenRow}>
                <TouchableOpacity
                  style={[styles.schengenItem, { backgroundColor: colors.warning + '15' }]}
                  onPress={() => setShowSchengenModal(true)}
                >
                  <Text style={[styles.schengenValue, { color: colors.warning }]}>
                    {schengenStatus.daysUsedInPeriod}
                  </Text>
                  <Text style={[styles.schengenLabel, { color: colors.textSecondary }]}>
                    {t('daysUsed')}
                  </Text>
                  <View style={[styles.detailsBadge, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={[styles.detailsBadgeText, { color: colors.primary }]}>
                      {t('details')}
                    </Text>
                  </View>
                </TouchableOpacity>
                <View style={[styles.schengenItem, { backgroundColor: colors.success + '15' }]}>
                  <Text style={[styles.schengenValue, { color: colors.success }]}>
                    {schengenStatus.daysRemainingInPeriod}
                  </Text>
                  <Text style={[styles.schengenLabel, { color: colors.textSecondary }]}>
                    {t('daysRemaining')}
                  </Text>
                </View>
              </View>
              <View style={[styles.progressContainer, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${Math.min(100, (schengenStatus.daysUsedInPeriod / 90) * 100)}%`,
                      backgroundColor: getProgressColor((schengenStatus.daysUsedInPeriod / 90) * 100),
                    },
                  ]}
                />
              </View>
              <Text style={[styles.schengenPeriod, { color: colors.textSecondary }]}>
                {formatDate(schengenStatus.periodStartDate, 'MMM d')} - {formatDate(schengenStatus.periodEndDate, 'MMM d, yyyy')}
              </Text>
            </View>
          </View>
        )}

        {/* Days per Country Chart */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.textSecondary }]}>
              {t('daysPerCountry')}
            </Text>
            <View style={styles.yearSelector}>
              <TouchableOpacity
                onPress={() => changeYear(-1)}
                style={[styles.yearButton, { backgroundColor: colors.border }]}
              >
                <Ionicons name="chevron-back" size={18} color={colors.text} />
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
                  size={18}
                  color={selectedYear >= currentYear ? colors.textSecondary : colors.text}
                />
              </TouchableOpacity>
            </View>
          </View>

          {pieData.length > 0 ? (
            <View style={styles.chartContainer}>
              {pieData.map((item, index) => (
                <View key={item.countryCode} style={styles.chartItem}>
                  <View style={[styles.chartColor, { backgroundColor: item.color }]} />
                  <Text style={[styles.chartFlag, { fontSize: 16 }]}>
                    {getCountryByCode(item.countryCode)?.flag}
                  </Text>
                  <Text style={[styles.chartCountry, { color: colors.text }]} numberOfLines={1}>
                    {item.country}
                  </Text>
                  <Text style={[styles.chartDays, { color: colors.textSecondary }]}>
                    {item.days} {t('days')}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No data for {selectedYear}
            </Text>
          )}
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Visits Drill-down Modal */}
      <Modal visible={showVisitsModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t('totalVisits')}</Text>
              <TouchableOpacity onPress={() => setShowVisitsModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={visits.sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime())}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    setShowVisitsModal(false);
                    router.push(`/visit/${item.id}`);
                  }}
                >
                  <Text style={styles.modalFlag}>{getCountryByCode(item.countryCode)?.flag}</Text>
                  <View style={styles.modalItemInfo}>
                    <Text style={[styles.modalItemTitle, { color: colors.text }]}>{item.countryName}</Text>
                    <Text style={[styles.modalItemSub, { color: colors.textSecondary }]}>
                      {formatDate(item.entryDate, 'MMM d, yyyy')}
                      {item.exitDate && ` - ${formatDate(item.exitDate, 'MMM d, yyyy')}`}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  {t('noVisitsFound')}
                </Text>
              }
            />
          </View>
        </View>
      </Modal>

      {/* Countries Drill-down Modal */}
      <Modal visible={showCountriesModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t('countriesVisited')}</Text>
              <TouchableOpacity onPress={() => setShowCountriesModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={Array.from(new Set(visits.map(v => v.countryCode))).map(code => ({
                code,
                country: getCountryByCode(code),
                visits: visits.filter(v => v.countryCode === code).length,
              }))}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <View style={[styles.modalItem, { borderBottomColor: colors.border }]}>
                  <Text style={styles.modalFlag}>{item.country?.flag}</Text>
                  <View style={styles.modalItemInfo}>
                    <Text style={[styles.modalItemTitle, { color: colors.text }]}>{item.country?.name}</Text>
                    <Text style={[styles.modalItemSub, { color: colors.textSecondary }]}>
                      {item.visits} {item.visits === 1 ? 'visit' : 'visits'}
                    </Text>
                  </View>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Schengen Drill-down Modal */}
      <Modal visible={showSchengenModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t('schengenBreakdown')}</Text>
              <TouchableOpacity onPress={() => setShowSchengenModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={schengenBreakdown}
              keyExtractor={(item) => item.countryCode}
              renderItem={({ item }) => (
                <View style={[styles.modalItem, { borderBottomColor: colors.border }]}>
                  <Text style={styles.modalFlag}>{getCountryByCode(item.countryCode)?.flag}</Text>
                  <View style={styles.modalItemInfo}>
                    <Text style={[styles.modalItemTitle, { color: colors.text }]}>{item.countryName}</Text>
                    <Text style={[styles.modalItemSub, { color: colors.textSecondary }]}>
                      {item.days} {t('days')} ({item.visits.length} visits)
                    </Text>
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No Schengen visits
                </Text>
              }
            />
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
  content: {
    padding: 16,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statCardValue: {
    fontSize: 32,
    fontWeight: '800',
  },
  statCardLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  schengenContent: {
    gap: 12,
  },
  schengenRow: {
    flexDirection: 'row',
    gap: 12,
  },
  schengenItem: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  schengenValue: {
    fontSize: 28,
    fontWeight: '800',
  },
  schengenLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  detailsBadge: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  detailsBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  schengenPeriod: {
    textAlign: 'center',
    fontSize: 12,
  },
  yearSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  yearButton: {
    padding: 6,
    borderRadius: 8,
  },
  yearText: {
    fontSize: 16,
    fontWeight: '600',
    minWidth: 50,
    textAlign: 'center',
  },
  chartContainer: {
    marginTop: 8,
    gap: 8,
  },
  chartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  chartColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  chartFlag: {
    width: 24,
  },
  chartCountry: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  chartDays: {
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  modalFlag: {
    fontSize: 32,
  },
  modalItemInfo: {
    flex: 1,
  },
  modalItemTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalItemSub: {
    fontSize: 13,
    marginTop: 2,
  },
});
