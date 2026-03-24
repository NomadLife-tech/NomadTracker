import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { SupportedLanguage } from '../../types';
import { LANGUAGE_NAMES } from '../../constants/translations';

interface AppSettingsSectionProps {
  darkMode: boolean;
  language: SupportedLanguage;
  cloudSaveEnabled: boolean;
  onDarkModeChange: (enabled: boolean) => void;
  onLanguagePress: () => void;
  onCloudSaveChange: (enabled: boolean) => void;
  t: (key: string) => string;
}

export function AppSettingsSection({
  darkMode,
  language,
  cloudSaveEnabled,
  onDarkModeChange,
  onLanguagePress,
  onCloudSaveChange,
  t,
}: AppSettingsSectionProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.section, { backgroundColor: colors.card }]}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        {t('appSettings')}
      </Text>

      {/* Dark Mode */}
      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Ionicons name="moon" size={22} color={colors.text} />
          <Text style={[styles.settingLabel, { color: colors.text }]}>
            {t('darkMode')}
          </Text>
        </View>
        <Switch
          value={darkMode}
          onValueChange={onDarkModeChange}
          trackColor={{ false: colors.border, true: colors.primary }}
        />
      </View>

      {/* Language */}
      <TouchableOpacity style={styles.settingRow} onPress={onLanguagePress}>
        <View style={styles.settingInfo}>
          <Ionicons name="language" size={22} color={colors.text} />
          <Text style={[styles.settingLabel, { color: colors.text }]}>
            {t('language')}
          </Text>
        </View>
        <View style={styles.settingValue}>
          <Text style={[styles.settingValueText, { color: colors.textSecondary }]}>
            {LANGUAGE_NAMES[language]}
          </Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </View>
      </TouchableOpacity>

      {/* Cloud Save */}
      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Ionicons name="cloud" size={22} color={colors.text} />
          <View>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              {t('cloudSave')}
            </Text>
            <Text style={[styles.settingHint, { color: colors.textSecondary }]}>
              {t('cloudSaveHint')}
            </Text>
          </View>
        </View>
        <Switch
          value={cloudSaveEnabled}
          onValueChange={onCloudSaveChange}
          trackColor={{ false: colors.border, true: colors.primary }}
        />
      </View>
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
  settingHint: {
    fontSize: 11,
    marginTop: 2,
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValueText: {
    fontSize: 14,
  },
});
