import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Insurance } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { SwipeableItem } from './SwipeableItem';

interface InsuranceCardProps {
  insurance: Insurance;
  onEdit: () => void;
  onDelete: () => void;
  t: (key: string) => string;
}

export function InsuranceCard({ insurance, onEdit, onDelete, t }: InsuranceCardProps) {
  const { colors } = useTheme();

  return (
    <SwipeableItem onDelete={onDelete} onPress={onEdit}>
      <View style={styles.content}>
        <View style={[
          styles.iconContainer, 
          { backgroundColor: insurance.type === 'medical' ? colors.danger + '15' : colors.primary + '15' }
        ]}>
          <Ionicons
            name={insurance.type === 'medical' ? 'medkit' : 'airplane'}
            size={24}
            color={insurance.type === 'medical' ? colors.danger : colors.primary}
          />
        </View>
        <View style={styles.info}>
          <Text style={[styles.title, { color: colors.text }]}>{insurance.provider}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t(insurance.type)} • {insurance.policyNumber}
          </Text>
          {insurance.phone && (
            <View style={styles.phoneRow}>
              <Ionicons name="call-outline" size={12} color={colors.success} />
              <Text style={[styles.phoneText, { color: colors.success }]}>
                {insurance.phone}
              </Text>
            </View>
          )}
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
      </View>
    </SwipeableItem>
  );
}

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  phoneText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
