import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface DataManagementProps {
  onExport: () => void;
  onImport: () => void;
  onClearData: () => void;
  t: (key: string) => string;
}

export function DataManagement({ onExport, onImport, onClearData, t }: DataManagementProps) {
  const { colors } = useTheme();

  const handleClearData = () => {
    const title = t('clearAllData') || 'Clear All Data';
    const message = t('confirmClearData') || 'This will permanently delete all your visits, passports, and insurance data. This action cannot be undone. Are you sure you want to continue?';
    const cancelText = t('cancel') || 'Cancel';
    const confirmText = t('clearData') || 'Delete All';

    if (Platform.OS === 'web') {
      // Web: Use window.confirm
      const confirmed = window.confirm(`${title}\n\n${message}`);
      if (confirmed) {
        console.log('[DataManagement] User confirmed clear data on web');
        onClearData();
      }
    } else {
      // Native: Use Alert.alert
      Alert.alert(
        title,
        message,
        [
          { 
            text: cancelText, 
            style: 'cancel',
            onPress: () => console.log('[DataManagement] User cancelled clear data'),
          },
          { 
            text: confirmText, 
            style: 'destructive', 
            onPress: () => {
              console.log('[DataManagement] User confirmed clear data on native');
              onClearData();
            },
          },
        ],
        { cancelable: true }
      );
    }
  };

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

      <TouchableOpacity style={styles.row} onPress={handleClearData}>
        <View style={styles.rowContent}>
          <Ionicons name="trash-outline" size={22} color={colors.danger} />
          <Text style={[styles.rowLabel, { color: colors.danger }]}>
            {t('clearAllData')}
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
