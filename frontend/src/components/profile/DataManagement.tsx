import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface DataManagementProps {
  onExport: () => void;
  onImport: () => void;
  t: (key: string) => string;
}

export function DataManagement({ onExport, onImport, t }: DataManagementProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.section, { backgroundColor: colors.card }]}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        {t('dataManagement')}
      </Text>

      <TouchableOpacity style={styles.row} onPress={onExport}>
        <View style={styles.rowContent}>
          <Ionicons name="download-outline" size={22} color={colors.text} />
          <Text style={[styles.rowLabel, { color: colors.text }]}>
            {t('exportData')}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.row} onPress={onImport}>
        <View style={styles.rowContent}>
          <Ionicons name="cloud-upload-outline" size={22} color={colors.text} />
          <Text style={[styles.rowLabel, { color: colors.text }]}>
            {t('importData')}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowLabel: {
    fontSize: 16,
  },
});
