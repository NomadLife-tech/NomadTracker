import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useSyncStatus } from '../../hooks/useSyncStatus';

interface SyncStatusCardProps {
  t: (key: string) => string;
}

export function SyncStatusCard({ t }: SyncStatusCardProps) {
  const { colors } = useTheme();
  const { pendingCount, failedCount, isSyncing, retryFailed, clearFailed } = useSyncStatus();

  if (pendingCount === 0 && failedCount === 0) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <Ionicons 
          name={isSyncing ? 'sync' : failedCount > 0 ? 'warning' : 'cloud-upload'} 
          size={20} 
          color={failedCount > 0 ? colors.warning : colors.primary} 
        />
        <Text style={[styles.title, { color: colors.text }]}>
          {t('syncStatus')}
        </Text>
      </View>

      {pendingCount > 0 && (
        <View style={styles.statusRow}>
          <Text style={[styles.statusText, { color: colors.textSecondary }]}>
            {isSyncing ? t('syncing') : `${pendingCount} ${t('pendingChanges')}`}
          </Text>
        </View>
      )}

      {failedCount > 0 && (
        <View style={styles.failedSection}>
          <Text style={[styles.failedText, { color: colors.danger }]}>
            {failedCount} {t('failedSync')}
          </Text>
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary + '15' }]}
              onPress={retryFailed}
            >
              <Ionicons name="refresh" size={16} color={colors.primary} />
              <Text style={[styles.actionText, { color: colors.primary }]}>
                {t('retry')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.danger + '15' }]}
              onPress={clearFailed}
            >
              <Ionicons name="close" size={16} color={colors.danger} />
              <Text style={[styles.actionText, { color: colors.danger }]}>
                {t('dismiss')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusRow: {
    marginTop: 8,
  },
  statusText: {
    fontSize: 13,
  },
  failedSection: {
    marginTop: 10,
  },
  failedText: {
    fontSize: 13,
    marginBottom: 10,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
