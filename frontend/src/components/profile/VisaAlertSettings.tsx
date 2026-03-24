import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { AppSettings } from '../../types';

const ALERT_DAY_OPTIONS = [90, 60, 30, 15, 10, 7];

interface VisaAlertSettingsProps {
  visaAlertsEnabled: boolean;
  selectedAlertDays: number[];
  customAlertDays: string;
  alertFrequency: AppSettings['alertFrequency'];
  onToggleAlerts: (enabled: boolean) => void;
  onToggleDay: (day: number) => void;
  onCustomDaysChange: (value: string) => void;
  onFrequencyPress: () => void;
  getFrequencyLabel: (freq: AppSettings['alertFrequency']) => string;
  t: (key: string) => string;
}

export function VisaAlertSettings({
  visaAlertsEnabled,
  selectedAlertDays,
  customAlertDays,
  alertFrequency,
  onToggleAlerts,
  onToggleDay,
  onCustomDaysChange,
  onFrequencyPress,
  getFrequencyLabel,
  t,
}: VisaAlertSettingsProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.section, { backgroundColor: colors.card }]}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        {t('visaExpirationAlerts')}
      </Text>

      {/* Master Toggle */}
      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Ionicons name="notifications" size={22} color={colors.text} />
          <Text style={[styles.settingLabel, { color: colors.text }]}>
            {t('enableAlerts')}
          </Text>
        </View>
        <Switch
          value={visaAlertsEnabled}
          onValueChange={onToggleAlerts}
          trackColor={{ false: colors.border, true: colors.primary }}
        />
      </View>

      {visaAlertsEnabled && (
        <>
          {/* Alert Days Selection */}
          <View style={styles.alertDaysSection}>
            <Text style={[styles.alertDaysLabel, { color: colors.textSecondary }]}>
              {t('alertDaysBefore')}
            </Text>
            <View style={styles.daysGrid}>
              {ALERT_DAY_OPTIONS.map((day) => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayChip,
                    {
                      backgroundColor: selectedAlertDays.includes(day)
                        ? colors.primary
                        : colors.background,
                      borderColor: selectedAlertDays.includes(day)
                        ? colors.primary
                        : colors.border,
                    },
                  ]}
                  onPress={() => onToggleDay(day)}
                >
                  <Text
                    style={[
                      styles.dayChipText,
                      {
                        color: selectedAlertDays.includes(day)
                          ? '#FFFFFF'
                          : colors.text,
                      },
                    ]}
                  >
                    {day}d
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Alert Frequency */}
          <TouchableOpacity style={styles.settingRow} onPress={onFrequencyPress}>
            <View style={styles.settingInfo}>
              <Ionicons name="repeat" size={22} color={colors.text} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {t('alertFrequency')}
              </Text>
            </View>
            <View style={styles.settingValue}>
              <Text style={[styles.settingValueText, { color: colors.textSecondary }]}>
                {getFrequencyLabel(alertFrequency)}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValueText: {
    fontSize: 14,
  },
  alertDaysSection: {
    paddingVertical: 12,
  },
  alertDaysLabel: {
    fontSize: 13,
    marginBottom: 10,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  dayChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
