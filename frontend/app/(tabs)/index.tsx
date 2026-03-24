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
import { PieChart } from 'react-native-gifted-charts';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useApp } from '../../src/contexts/AppContext';
import { MiniMapCard } from '../../src/components/common/MiniMapCard';
import { 
  CountryHeatmap,
} from '../../src/components/statistics';
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
import {
  calculateCountryHeatmap,
} from '../../src/utils/statisticsUtils';
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
    return visits.some(v => isSchengenCountry(v.countryCode) && countsAgainstSchengen(v.visaType));
  }, [visits]);

  const schengenStatus = useMemo(() => {
    if (!hasSchengenVisits) return null;
    return calculateSchengenDays(visits);
  }, [visits, hasSchengenVisits]);

  const countryHeatmapData = useMemo(() => {
    return calculateCountryHeatmap(visits);
  }, [visits]);

  // Active visas (visits with entry date in past/today AND (no exit date OR exit date in future))
  const activeVisas = useMemo(() => {
    return visits
      .filter(v => {
        // Has visa type
        if (!v.visaType) return false;
        // Check if visit is currently active
        return isCurrentVisit(v);
      })
      .sort((a, b) => {
        // Sort by entry date descending (most recent first)
        return new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime();
      })
      .slice(0, 5); // Limit to 5 most recent
  }, [visits]);

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

  // Transform data for modern 3D Pie Chart (gifted-charts format)
  const pieChartData = useMemo(() => {
    // Enhanced colors with gradients for 3D effect
    const enhancedColors = [
      { front: '#FF6B6B', gradient: '#FF8E8E' },
      { front: '#4ECDC4', gradient: '#7EDDD6' },
      { front: '#45B7D1', gradient: '#75CCE0' },
      { front: '#96CEB4', gradient: '#B5DEC9' },
      { front: '#FFEAA7', gradient: '#FFF3C4' },
      { front: '#DDA0DD', gradient: '#E8C0E8' },
      { front: '#98D8C8', gradient: '#B8E8DC' },
      { front: '#F7DC6F', gradient: '#FAE99F' },
    ];
    
    return rawPieData.map((item, index) => ({
      value: item.days,
      color: enhancedColors[index % enhancedColors.length].front,
      gradientCenterColor: enhancedColors[index % enhancedColors.length].gradient,
      text: `${item.days}`,
      textColor: '#FFFFFF',
      textSize: 12,
      shiftTextX: 0,
      focused: index === 0,
      // Store additional data for legend
      countryCode: item.countryCode,
      countryName: item.country,
    }));
  }, [rawPieData]);

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

        {/* Schengen Calculator - Only shown when user has Schengen travel */}
        {hasSchengenVisits && schengenStatus && (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: colors.textSecondary }]}>
                {t('schengenCalculator')}
              </Text>
            </View>
            <View style={styles.schengenContent}>
              {/* Row 1: Days Used */}
              <TouchableOpacity
                style={[styles.schengenItemFull, { backgroundColor: colors.warning + '15' }]}
                onPress={() => setShowSchengenModal(true)}
              >
                <View style={styles.schengenItemRow}>
                  <View style={styles.schengenItemLeft}>
                    <Text style={[styles.schengenValue, { color: colors.warning }]}>
                      {schengenStatus.daysUsedInPeriod}
                    </Text>
                    <Text style={[styles.schengenLabel, { color: colors.textSecondary }]}>
                      {t('daysUsed')}
                    </Text>
                  </View>
                  <View style={[styles.detailsBadge, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={[styles.detailsBadgeText, { color: colors.primary }]}>
                      {t('details')}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Row 2: Days Remaining */}
              <View style={[styles.schengenItemFull, { backgroundColor: colors.success + '15' }]}>
                <View style={styles.schengenItemRow}>
                  <View style={styles.schengenItemLeft}>
                    <Text style={[styles.schengenValue, { color: colors.success }]}>
                      {schengenStatus.daysRemainingInPeriod}
                    </Text>
                    <Text style={[styles.schengenLabel, { color: colors.textSecondary }]}>
                      {t('daysRemaining')}
                    </Text>
                  </View>
                  <Text style={[styles.schengenOutOf, { color: colors.textSecondary }]}>
                    / 90
                  </Text>
                </View>
              </View>

              {/* Row 3: Progress Bar */}
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

        {/* Active Visas Table - Shown when no Schengen travel */}
        {!hasSchengenVisits && (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: colors.textSecondary }]}>
                {t('activeVisas')}
              </Text>
            </View>
            {activeVisas.length > 0 ? (
              <View style={styles.activeVisasTable}>
                {/* Table Header */}
                <View style={[styles.tableHeader, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.tableHeaderCell, styles.tableCountryCell, { color: colors.textSecondary }]}>
                    {t('country')}
                  </Text>
                  <Text style={[styles.tableHeaderCell, styles.tableVisaCell, { color: colors.textSecondary }]}>
                    {t('visaType')}
                  </Text>
                  <Text style={[styles.tableHeaderCell, styles.tableDateCell, { color: colors.textSecondary }]}>
                    {t('validUntil')}
                  </Text>
                </View>
                {/* Table Rows */}
                {activeVisas.map((visa, index) => {
                  const country = getCountryByCode(visa.countryCode);
                  const isActive = isCurrentVisit(visa);
                  return (
                    <TouchableOpacity
                      key={visa.id}
                      style={[
                        styles.tableRow,
                        { borderBottomColor: colors.border },
                        index === activeVisas.length - 1 && { borderBottomWidth: 0 },
                        isActive && { backgroundColor: colors.success + '08' },
                      ]}
                      onPress={() => router.push(`/visit/${visa.id}`)}
                    >
                      <View style={[styles.tableCell, styles.tableCountryCell]}>
                        <Text style={styles.tableFlag}>{country?.flag}</Text>
                        <Text style={[styles.tableCellText, styles.tableCountryName, { color: colors.text }]} numberOfLines={1}>
                          {country?.name}
                        </Text>
                        {isActive && (
                          <View style={[styles.activeBadge, { backgroundColor: colors.success }]}>
                            <Text style={styles.activeBadgeText}>{t('live')}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.tableCell, styles.tableCellText, styles.tableVisaCell, { color: colors.text }]} numberOfLines={1}>
                        {visa.visaType}
                      </Text>
                      <Text style={[styles.tableCell, styles.tableCellText, styles.tableDateCell, { color: colors.textSecondary }]}>
                        {visa.exitDate ? formatDate(visa.exitDate, 'MMM d, yyyy') : '—'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View style={styles.emptyActiveVisas}>
                <Ionicons name="document-text-outline" size={40} color={colors.textSecondary} />
                <Text style={[styles.emptyActiveVisasText, { color: colors.textSecondary }]}>
                  {t('noActiveVisas')}
                </Text>
                <TouchableOpacity
                  style={[styles.addVisaButton, { backgroundColor: colors.primary }]}
                  onPress={() => router.push('/visit/add')}
                  activeOpacity={0.8}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="add" size={18} color="#FFFFFF" />
                  <Text style={styles.addVisaButtonText}>{t('addNewVisit')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Country Heatmap */}
        <CountryHeatmap data={countryHeatmapData} t={t} />

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
              {/* Modern 3D Pie Chart */}
              <View style={styles.chartContainer}>
                <PieChart
                  data={pieChartData}
                  donut
                  showGradient
                  sectionAutoFocus
                  focusOnPress
                  radius={90}
                  innerRadius={55}
                  innerCircleColor={colors.card}
                  centerLabelComponent={() => (
                    <View style={styles.centerLabel}>
                      <Text style={[styles.centerValue, { color: colors.text }]}>{totalDaysInYear}</Text>
                      <Text style={[styles.centerTitle, { color: colors.textSecondary }]}>Days</Text>
                    </View>
                  )}
                  showText
                  textColor="#FFFFFF"
                  textSize={11}
                  fontWeight="600"
                  showValuesAsLabels
                  labelsPosition="outward"
                />
              </View>

              {/* Custom Legend with Flags */}
              <View style={styles.legendContainer}>
                {rawPieData.map((item, index) => {
                  const enhancedColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
                  return (
                    <View key={item.countryCode} style={styles.legendItem}>
                      <View style={[styles.legendColor, { backgroundColor: enhancedColors[index % enhancedColors.length] }]} />
                      <Text style={styles.legendFlag}>{getCountryByCode(item.countryCode)?.flag}</Text>
                      <Text style={[styles.legendCountry, { color: colors.text }]} numberOfLines={1}>
                        {item.country}
                      </Text>
                      <Text style={[styles.legendDays, { color: colors.textSecondary }]}>
                        {item.days}d
                      </Text>
                    </View>
                  );
                })}
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
  schengenItemFull: {
    padding: 16,
    borderRadius: 12,
  },
  schengenItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  schengenItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: 14,
  },
  schengenOutOf: {
    fontSize: 16,
    fontWeight: '600',
  },
  detailsBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
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
  progressContainer: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginVertical: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
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
    marginTop: 16,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  centerLabel: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerValue: {
    fontSize: 28,
    fontWeight: '800',
  },
  centerTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: -2,
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
  // Active Visas Table Styles
  activeVisasTable: {
    marginTop: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  tableHeaderCell: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  tableCell: {
    paddingVertical: 2,
  },
  tableCellText: {
    fontSize: 14,
  },
  tableCountryCell: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tableVisaCell: {
    flex: 1.5,
  },
  tableDateCell: {
    flex: 1.2,
    textAlign: 'right',
  },
  tableFlag: {
    fontSize: 20,
  },
  tableCountryName: {
    fontWeight: '600',
    flex: 1,
  },
  activeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 4,
  },
  activeBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  emptyActiveVisas: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  emptyActiveVisasText: {
    fontSize: 14,
    textAlign: 'center',
  },
  addVisaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    marginTop: 8,
  },
  addVisaButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
