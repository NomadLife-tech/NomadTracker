import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useApp } from '../../contexts/AppContext';

interface SyncIndicatorProps {
  loading?: boolean;
}

export function SyncIndicator({ loading = false }: SyncIndicatorProps) {
  const { colors } = useTheme();
  const { t } = useApp();

  if (!loading) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.primary + '20' }]}>
      <ActivityIndicator size="small" color={colors.primary} />
      <Text style={[styles.text, { color: colors.primary }]}>
        {t('loading')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 20,
    alignSelf: 'center',
    marginVertical: 8,
    gap: 8,
  },
  text: {
    fontSize: 13,
    fontWeight: '500',
  },
});
