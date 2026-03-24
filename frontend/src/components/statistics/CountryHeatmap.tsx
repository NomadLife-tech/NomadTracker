import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { CountryHeatmapData } from '../../utils/statisticsUtils';

interface CountryHeatmapProps {
  data: CountryHeatmapData[];
  onCountryPress?: (country: CountryHeatmapData) => void;
  t: (key: string) => string;
}

export function CountryHeatmap({ data, onCountryPress, t }: CountryHeatmapProps) {
  const { colors } = useTheme();

  const getHeatColor = (intensity: number) => {
    // Gradient from light blue to dark blue
    if (intensity < 0.2) return '#E3F2FD';
    if (intensity < 0.4) return '#90CAF9';
    if (intensity < 0.6) return '#42A5F5';
    if (intensity < 0.8) return '#1E88E5';
    return '#1565C0';
  };

  if (data.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.card }]}>
        <View style={styles.header}>
          <Ionicons name="map" size={20} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>
            {t('countryHeatmap')}
          </Text>
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="globe-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {t('noVisitsYet')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <Ionicons name="map" size={20} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>
          {t('countryHeatmap')}
        </Text>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>
          {t('lessTime')}
        </Text>
        <View style={styles.legendGradient}>
          {['#E3F2FD', '#90CAF9', '#42A5F5', '#1E88E5', '#1565C0'].map((color, i) => (
            <View key={i} style={[styles.legendBlock, { backgroundColor: color }]} />
          ))}
        </View>
        <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>
          {t('moreTime')}
        </Text>
      </View>

      {/* Country Grid */}
      <View style={styles.grid}>
        {data.slice(0, 12).map((country) => (
          <TouchableOpacity
            key={country.countryCode}
            style={[
              styles.countryItem,
              { backgroundColor: getHeatColor(country.intensity) },
            ]}
            onPress={() => onCountryPress?.(country)}
            activeOpacity={0.7}
          >
            <Text style={styles.countryFlag}>{country.flag}</Text>
            <Text style={[styles.countryCode, { color: country.intensity > 0.5 ? '#FFF' : '#333' }]}>
              {country.countryCode}
            </Text>
            <Text style={[styles.countryDays, { color: country.intensity > 0.5 ? '#FFF' : '#666' }]}>
              {country.totalDays}d
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {data.length > 12 && (
        <Text style={[styles.moreText, { color: colors.textSecondary }]}>
          +{data.length - 12} {t('moreCountries')}
        </Text>
      )}
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
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  legendLabel: {
    fontSize: 10,
  },
  legendGradient: {
    flexDirection: 'row',
    borderRadius: 4,
    overflow: 'hidden',
  },
  legendBlock: {
    width: 20,
    height: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  countryItem: {
    width: '23%',
    aspectRatio: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  countryFlag: {
    fontSize: 20,
  },
  countryCode: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  countryDays: {
    fontSize: 9,
  },
  moreText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
  },
});
