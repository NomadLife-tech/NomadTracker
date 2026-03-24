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
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PieChart } from 'react-native-chart-kit';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useApp } from '../../src/contexts/AppContext';
import { MiniMapCard } from '../../src/components/common/MiniMapCard';
import { 
  isCurrentVisit, 
  calculateSchengenDays,
  getSchengenBreakdown,
  getSchengenExemptVisits,
  getDaysByCountryForYear,
  isSchengenCountry,
  formatDate,
  countsAgainstSchengen,
} from '../../src/utils/dateUtils';
import { getCountryByCode } from '../../src/constants/countries';

const screenWidth = Dimensions.get('window').width;

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

  // Exempt visits (national visas, digital nomad, etc.)
  const schengenExemptVisits = useMemo(() => {
    if (!hasSchengenVisits) return [];
    return getSchengenExemptVisits(visits);
  }, [visits, hasSchengenVisits]);

  // Pie chart data - formatted for react-native-chart-kit
  const rawPieData = useMemo(() => {
    return getDaysByCountryForYear(visits, selectedYear);
  }, [visits, selectedYear]);

  // Transform data for PieChart component
  const pieChartData = useMemo(() => {
    return rawPieData.map((item) => ({
      name: item.country,
      population: item.days,
      color: item.color,
      legendFontColor: colors.textSecondary,
      legendFontSize: 12,
    }));
  }, [rawPieData, colors.textSecondary]);

  // Calculate total days for the year
  const totalDaysInYear = useMemo(() => {
    return rawPieData.reduce((sum, item) => sum + item.days, 0);
  }, [rawPieData]);

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

        {/* Days per Country Pie Chart */}
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

          {pieChartData.length > 0 ? (
            <View style={styles.pieChartWrapper}>
              {/* Total Days Badge */}
              <View style={styles.totalDaysBadge}>
                <Text style={[styles.totalDaysValue, { color: colors.text }]}>{totalDaysInYear}</Text>
                <Text style={[styles.totalDaysLabel, { color: colors.textSecondary }]}>Total Days</Text>
              </View>

              {/* Pie Chart */}
              <PieChart
                data={pieChartData}
                width={screenWidth - 64}
                height={180}
                chartConfig={{
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  labelColor: (opacity = 1) => colors.textSecondary,
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="0"
                absolute={false}
                hasLegend={false}
                center={[(screenWidth - 64) / 4, 0]}
              />

              {/* Custom Legend */}
              <View style={styles.legendContainer}>
                {rawPieData.map((item) => (
                  <View key={item.countryCode} style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                    <Text style={styles.legendFlag}>{getCountryByCode(item.countryCode)?.flag}</Text>
                    <Text style={[styles.legendCountry, { color: colors.text }]} numberOfLines={1}>
                      {item.country}
                    </Text>
                    <Text style={[styles.legendDays, { color: colors.textSecondary }]}>
                      {item.days}d
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.emptyChartContainer}>
              <Ionicons name="pie-chart-outline" size={48} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No data for {selectedYear}
              </Text>
            </View>
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
            
            <ScrollView style={{ maxHeight: '80%' }}>
              {/* Counting Visits Section */}
              {schengenBreakdown.length > 0 && (
                <View style={styles.schengenSection}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="time-outline" size={18} color={colors.danger} />
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                      Counts Against 90/180
                    </Text>
                  </View>
                  {schengenBreakdown.map((item, index) => (
                    <View key={`counting-${index}`} style={[styles.schengenItem, { borderBottomColor: colors.border }]}>
                      <Text style={styles.modalFlag}>{getCountryByCode(item.countryCode)?.flag}</Text>
                      <View style={styles.modalItemInfo}>
                        <Text style={[styles.modalItemTitle, { color: colors.text }]}>{item.countryName}</Text>
                        <Text style={[styles.visaTypeTag, { backgroundColor: colors.danger + '20', color: colors.danger }]}>
                          {item.visaType}
                        </Text>
                      </View>
                      <View style={styles.daysCount}>
                        <Text style={[styles.daysNumber, { color: colors.danger }]}>{item.days}</Text>
                        <Text style={[styles.daysLabel, { color: colors.textSecondary }]}>days</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Exempt Visits Section */}
              {schengenExemptVisits.length > 0 && (
                <View style={styles.schengenSection}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="checkmark-circle-outline" size={18} color={colors.success} />
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                      Exempt (National/Long-Stay Visa)
                    </Text>
                  </View>
                  {schengenExemptVisits.map((item, index) => (
                    <View key={`exempt-${index}`} style={[styles.schengenItem, { borderBottomColor: colors.border }]}>
                      <Text style={styles.modalFlag}>{getCountryByCode(item.countryCode)?.flag}</Text>
                      <View style={styles.modalItemInfo}>
                        <Text style={[styles.modalItemTitle, { color: colors.text }]}>{item.countryName}</Text>
                        <Text style={[styles.visaTypeTag, { backgroundColor: colors.success + '20', color: colors.success }]}>
                          {item.visaType}
                        </Text>
                      </View>
                      <View style={styles.daysCount}>
                        <Text style={[styles.daysNumber, { color: colors.success }]}>{item.days}</Text>
                        <Text style={[styles.daysLabel, { color: colors.textSecondary }]}>days</Text>
                      </View>
                    </View>
                  ))}
                  <Text style={[styles.exemptNote, { color: colors.textSecondary }]}>
                    These days do not count against your 90/180 Schengen limit
                  </Text>
                </View>
              )}

              {schengenBreakdown.length === 0 && schengenExemptVisits.length === 0 && (
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No Schengen visits
                </Text>
              )}
            </ScrollView>
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
  pieChartWrapper: {
    alignItems: 'center',
    marginTop: 8,
  },
  totalDaysBadge: {
    position: 'absolute',
    top: 60,
    left: '50%',
    marginLeft: -40,
    width: 80,
    alignItems: 'center',
    zIndex: 10,
  },
  totalDaysValue: {
    fontSize: 28,
    fontWeight: '800',
  },
  totalDaysLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    marginTop: -2,
  },
  legendContainer: {
    width: '100%',
    marginTop: 12,
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  legendColor: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  legendFlag: {
    fontSize: 18,
    width: 28,
  },
  legendCountry: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  legendDays: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
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
  schengenSection: {
    paddingBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  schengenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  visaTypeTag: {
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
    overflow: 'hidden',
  },
  daysCount: {
    alignItems: 'center',
  },
  daysNumber: {
    fontSize: 20,
    fontWeight: '700',
  },
  daysLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
  },
  exemptNote: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
});
