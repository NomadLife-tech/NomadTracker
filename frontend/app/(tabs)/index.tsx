import React, { useState, useMemo } from 'react';
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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PieChart } from 'react-native-gifted-charts';
import { format } from 'date-fns';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useApp } from '../../src/contexts/AppContext';
import { MiniMapCard } from '../../src/components/common/MiniMapCard';
import { 
  CountryHeatmap,
} from '../../src/components/statistics';
// REFACTORED: Import from new EU-compliant Schengen engine
import { 
  isCurrentVisit, 
  getDaysByCountryForYear,
  formatDate,
} from '../../src/utils/dateUtils';
import {
  calculateSchengenStatusExtended,
  isSchengenCountry,
  countsAgainstSchengen,
  visitCountsForSchengen,
  SchengenStatusExtended,
} from '../../src/utils/schengenEngine';
import {
  calculateCountryHeatmap,
} from '../../src/utils/statisticsUtils';
import { getCountryByCode } from '../../src/constants/countries';
import { getTranslatedCountryName } from '../../src/utils/countryNames';

const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen() {
  const { colors } = useTheme();
  const { visits, profile, t, refreshAll, isLoading, settings } = useApp();
  const router = useRouter();
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showVisitsModal, setShowVisitsModal] = useState(false);
  const [showCountriesModal, setShowCountriesModal] = useState(false);
  const [showSchengenModal, setShowSchengenModal] = useState(false);

  // Note: Removed useFocusEffect with refreshAll() that caused race condition
  // AppContext already manages state updates properly

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  };

  // Get active visit - the most recent visit based on entry date
  // Among visits that are current (entry date <= today AND no exit or exit >= today),
  // select the one with the most recent entry date
  const activeVisit = useMemo(() => {
    // Filter to only current/active visits
    const currentVisits = visits.filter(v => isCurrentVisit(v));
    
    if (currentVisits.length === 0) return undefined;
    if (currentVisits.length === 1) return currentVisits[0];
    
    // If multiple "active" visits (e.g., user forgot exit date on old trips),
    // return the one with the most recent entry date
    return currentVisits.sort((a, b) => {
      const dateA = new Date(a.entryDate).getTime();
      const dateB = new Date(b.entryDate).getTime();
      return dateB - dateA; // Most recent first
    })[0];
  }, [visits]);

  // Statistics
  const totalVisits = visits.length;
  const uniqueCountries = useMemo(() => {
    const codes = new Set(visits.map(v => v.countryCode));
    return codes.size;
  }, [visits]);

  // REFACTORED: Use new EU-compliant Schengen engine
  // Calculates extended status with max stay, re-entry dates, etc.
  const hasSchengenVisits = useMemo(() => {
    return visits.some(v => 
      isSchengenCountry(v.countryCode) && 
      countsAgainstSchengen(v.visaType) &&
      visitCountsForSchengen(v, profile.passports)
    );
  }, [visits, profile.passports]);

  // REFACTORED: Use calculateSchengenStatusExtended from new engine
  const schengenStatus: SchengenStatusExtended | null = useMemo(() => {
    if (!hasSchengenVisits) return null;
    return calculateSchengenStatusExtended(visits, profile.passports);
  }, [visits, hasSchengenVisits, profile.passports]);

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

  // REFACTORED: Get breakdown from extended status
  const schengenBreakdown = useMemo(() => {
    if (!schengenStatus) return [];
    return schengenStatus.countryBreakdown;
  }, [schengenStatus]);

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
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Current Visit Mini Map Card - Always Light Mode */}
        <MiniMapCard
          activeVisit={activeVisit || null}
          allVisits={visits}
          passports={profile.passports}
          onPress={() => activeVisit && router.push(`/visit/${activeVisit.id}`)}
          onAddVisit={() => router.push('/visit/add')}
          t={t}
          language={settings.language}
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
        {/* REFACTORED: Uses new EU-compliant Schengen engine with extended status */}
        {hasSchengenVisits && schengenStatus && (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: colors.textSecondary }]}>
                {t('schengenCalculator')}
              </Text>
              {/* Compliance Badge */}
              <View style={[styles.complianceBadge, { backgroundColor: schengenStatus.valid ? colors.success + '20' : colors.danger + '20' }]}>
                <View style={[styles.complianceDot, { backgroundColor: schengenStatus.valid ? colors.success : colors.danger }]} />
                <Text style={[styles.complianceText, { color: schengenStatus.valid ? colors.success : colors.danger }]}>
                  {schengenStatus.valid ? t('compliant') : t('overstay')}
                </Text>
              </View>
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
                      {schengenStatus.daysUsed}
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

              {/* Row 2: Days Remaining & Max Stay */}
              <View style={styles.schengenRow}>
                <View style={[styles.schengenItemHalf, { backgroundColor: colors.success + '15' }]}>
                  <Text style={[styles.schengenValue, { color: colors.success }]}>
                    {schengenStatus.daysRemaining}
                  </Text>
                  <Text style={[styles.schengenLabel, { color: colors.textSecondary }]}>
                    {t('daysRemaining')}
                  </Text>
                </View>
                <View style={[styles.schengenItemHalf, { backgroundColor: colors.primary + '15' }]}>
                  <Text style={[styles.schengenValue, { color: colors.primary }]}>
                    {schengenStatus.maxStayFromToday}
                  </Text>
                  <Text style={[styles.schengenLabel, { color: colors.textSecondary }]}>
                    {t('maxStay')}
                  </Text>
                </View>
              </View>

              {/* Row 3: Progress Bar */}
              <View style={[styles.progressContainer, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${Math.min(100, (schengenStatus.daysUsed / 90) * 100)}%`,
                      backgroundColor: getProgressColor((schengenStatus.daysUsed / 90) * 100),
                    },
                  ]}
                />
              </View>
              <Text style={[styles.schengenPeriod, { color: colors.textSecondary }]}>
                {formatDate(schengenStatus.periodStartDate, 'MMM d')} - {formatDate(schengenStatus.periodEndDate, 'MMM d, yyyy')}
              </Text>

              {/* NEW: Legal Full Re-Entry Date Widget */}
              <View style={[styles.reEntryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.reEntryHeader}>
                  <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                  <Text style={[styles.reEntryTitle, { color: colors.text }]}>
                    {t('fresh90DayAllowance')}
                  </Text>
                </View>
                <Text style={[styles.reEntryDate, { color: colors.primary }]}>
                  {format(schengenStatus.legalFullReEntryDate, 'MMMM d, yyyy')}
                </Text>
                <Text style={[styles.reEntrySubtext, { color: colors.textSecondary }]}>
                  {schengenStatus.daysRemaining >= 90 
                    ? t('availableNow90Days')
                    : t('onThisDateFull90')}
                </Text>
                {/* Show days since last Schengen exit instead of misleading reset badge */}
                {schengenStatus.lastSchengenExit && (
                  <View style={[styles.resetBadge, { backgroundColor: colors.textSecondary + '15' }]}>
                    <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                    <Text style={[styles.resetBadgeText, { color: colors.textSecondary }]}>
                      {(() => {
                        const daysSinceExit = Math.floor(
                          (new Date().getTime() - schengenStatus.lastSchengenExit!.getTime()) / (1000 * 60 * 60 * 24)
                        );
                        return `${daysSinceExit} ${t('daysSinceExit')}`;
                      })()}
                    </Text>
                  </View>
                )}
              </View>
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
        <CountryHeatmap 
          data={countryHeatmapData} 
          t={t} 
          onShowAllCountries={() => setShowCountriesModal(true)}
        />

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
                        {getTranslatedCountryName(item.countryCode, settings.language)}
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
                {t('noDataForYear')} {selectedYear}
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
                    <Text style={[styles.modalItemTitle, { color: colors.text }]}>{getTranslatedCountryName(item.countryCode, settings.language)}</Text>
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
                    <Text style={[styles.modalItemTitle, { color: colors.text }]}>{getTranslatedCountryName(item.code, settings.language)}</Text>
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
                        <Text style={[styles.modalItemTitle, { color: colors.text }]}>{getTranslatedCountryName(item.countryCode, settings.language)}</Text>
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

              {schengenBreakdown.length === 0 && (
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
  // REFACTORED: New styles for EU-compliant Schengen calculator
  complianceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  complianceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  complianceText: {
    fontSize: 11,
    fontWeight: '600',
  },
  schengenItemHalf: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  reEntryCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  reEntryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  reEntryTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  reEntryDate: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  reEntrySubtext: {
    fontSize: 12,
  },
  resetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  resetBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
