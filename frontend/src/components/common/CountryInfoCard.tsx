import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useApp } from '../../contexts/AppContext';
import { getCountryInfo } from '../../constants/countryInfo';
import { Ionicons } from '@expo/vector-icons';

interface CountryInfoCardProps {
  countryCode: string;
}

export function CountryInfoCard({ countryCode }: CountryInfoCardProps) {
  const { colors } = useTheme();
  const { t } = useApp();
  const [expanded, setExpanded] = useState(false);
  
  const info = getCountryInfo(countryCode);
  
  if (!info) {
    return null;
  }

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
      >
        <View style={styles.headerLeft}>
          <Ionicons name="information-circle" size={20} color={colors.primary} />
          <Text style={[styles.headerText, { color: colors.primary }]}>
            {t('viewEmergencyInfo')}
          </Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.content}>
          {/* Emergency Numbers */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('emergencyNumbers')}
            </Text>
            <View style={[styles.numbersGrid, { borderColor: colors.border }]}>
              <View style={styles.numberRow}>
                <View style={styles.numberItem}>
                  <Ionicons name="shield" size={16} color={colors.danger} />
                  <Text style={[styles.numberLabel, { color: colors.textSecondary }]}>{t('police')}</Text>
                  <Text style={[styles.numberValue, { color: colors.text }]}>{info.emergencyNumbers.police}</Text>
                </View>
                <View style={styles.numberItem}>
                  <Ionicons name="medkit" size={16} color={colors.success} />
                  <Text style={[styles.numberLabel, { color: colors.textSecondary }]}>{t('ambulance')}</Text>
                  <Text style={[styles.numberValue, { color: colors.text }]}>{info.emergencyNumbers.ambulance}</Text>
                </View>
              </View>
              <View style={styles.numberRow}>
                <View style={styles.numberItem}>
                  <Ionicons name="flame" size={16} color={colors.warning} />
                  <Text style={[styles.numberLabel, { color: colors.textSecondary }]}>{t('fire')}</Text>
                  <Text style={[styles.numberValue, { color: colors.text }]}>{info.emergencyNumbers.fire}</Text>
                </View>
                {info.emergencyNumbers.general && (
                  <View style={styles.numberItem}>
                    <Ionicons name="call" size={16} color={colors.primary} />
                    <Text style={[styles.numberLabel, { color: colors.textSecondary }]}>{t('general')}</Text>
                    <Text style={[styles.numberValue, { color: colors.text }]}>{info.emergencyNumbers.general}</Text>
                  </View>
                )}
              </View>
              {info.emergencyNumbers.tourist && (
                <View style={styles.numberRow}>
                  <View style={[styles.numberItem, { flex: 1 }]}>
                    <Ionicons name="person" size={16} color={colors.primary} />
                    <Text style={[styles.numberLabel, { color: colors.textSecondary }]}>{t('tourist')}</Text>
                    <Text style={[styles.numberValue, { color: colors.text }]}>{info.emergencyNumbers.tourist}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Visa Resources */}
          {info.visaResources && info.visaResources.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t('visaResources')}
              </Text>
              {info.visaResources.map((resource, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.resourceItem, { borderColor: colors.border }]}
                  onPress={() => openLink(resource.url)}
                >
                  <View style={styles.resourceLeft}>
                    <Ionicons
                      name={resource.type === 'embassy' ? 'business' : 'document-text'}
                      size={18}
                      color={colors.primary}
                    />
                    <Text style={[styles.resourceName, { color: colors.text }]} numberOfLines={1}>
                      {resource.name}
                    </Text>
                  </View>
                  <Ionicons name="open-outline" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerText: {
    fontSize: 15,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  numbersGrid: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  numberRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  numberItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  numberLabel: {
    fontSize: 12,
  },
  numberValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  resourceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  resourceName: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
});
