import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { TravelStreak } from '../../utils/statisticsUtils';

interface TravelStreaksCardProps {
  streaks: TravelStreak;
  t: (key: string) => string;
}

export function TravelStreaksCard({ streaks, t }: TravelStreaksCardProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <Ionicons name="flame" size={20} color={colors.warning} />
        <Text style={[styles.title, { color: colors.text }]}>
          {t('travelStreaks')}
        </Text>
      </View>

      <View style={styles.streaksGrid}>
        {/* Current Streak */}
        <View style={[styles.streakItem, { backgroundColor: colors.warning + '15' }]}>
          <View style={styles.streakIconContainer}>
            <Ionicons name="flame" size={24} color={colors.warning} />
          </View>
          <Text style={[styles.streakValue, { color: colors.warning }]}>
            {streaks.currentStreak}
          </Text>
          <Text style={[styles.streakLabel, { color: colors.textSecondary }]}>
            {t('currentStreak')}
          </Text>
          <Text style={[styles.streakUnit, { color: colors.textSecondary }]}>
            {streaks.currentStreak === 1 ? t('day') : t('days')}
          </Text>
        </View>

        {/* Longest Streak */}
        <View style={[styles.streakItem, { backgroundColor: colors.success + '15' }]}>
          <View style={styles.streakIconContainer}>
            <Ionicons name="trophy" size={24} color={colors.success} />
          </View>
          <Text style={[styles.streakValue, { color: colors.success }]}>
            {streaks.longestStreak}
          </Text>
          <Text style={[styles.streakLabel, { color: colors.textSecondary }]}>
            {t('longestStreak')}
          </Text>
          <Text style={[styles.streakUnit, { color: colors.textSecondary }]}>
            {streaks.longestStreak === 1 ? t('day') : t('days')}
          </Text>
        </View>

        {/* Total Travel Days */}
        <View style={[styles.streakItem, { backgroundColor: colors.primary + '15' }]}>
          <View style={styles.streakIconContainer}>
            <Ionicons name="airplane" size={24} color={colors.primary} />
          </View>
          <Text style={[styles.streakValue, { color: colors.primary }]}>
            {streaks.totalTravelDays}
          </Text>
          <Text style={[styles.streakLabel, { color: colors.textSecondary }]}>
            {t('totalDaysAbroad')}
          </Text>
          <Text style={[styles.streakUnit, { color: colors.textSecondary }]}>
            {t('allTime')}
          </Text>
        </View>
      </View>
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
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  streaksGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  streakItem: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  streakIconContainer: {
    marginBottom: 8,
  },
  streakValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  streakLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
  },
  streakUnit: {
    fontSize: 10,
    marginTop: 2,
  },
});
