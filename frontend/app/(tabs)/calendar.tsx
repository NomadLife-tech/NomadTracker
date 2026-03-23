import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useApp } from '../../src/contexts/AppContext';
import { getVisitsForDate, generateCalendarMarks, formatDate } from '../../src/utils/dateUtils';
import { getCountryByCode } from '../../src/constants/countries';

export default function CalendarScreen() {
  const { colors, isDark } = useTheme();
  const { visits, refreshVisits, t } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState<string>('');
  const [showModal, setShowModal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refreshVisits();
    }, [])
  );

  const markedDates = useMemo(() => {
    const marks = generateCalendarMarks(visits);
    
    // Add selection mark if date is selected
    if (selectedDate) {
      marks[selectedDate] = {
        ...marks[selectedDate],
        selected: true,
        selectedColor: colors.primary,
      };
    }
    
    return marks;
  }, [visits, selectedDate, colors]);

  const selectedVisits = useMemo(() => {
    if (!selectedDate) return [];
    return getVisitsForDate(visits, new Date(selectedDate));
  }, [visits, selectedDate]);

  const handleDayPress = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
    const dayVisits = getVisitsForDate(visits, new Date(day.dateString));
    if (dayVisits.length > 0) {
      setShowModal(true);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <Calendar
        style={[styles.calendar, { backgroundColor: colors.card }]}
        theme={{
          calendarBackground: colors.card,
          textSectionTitleColor: colors.textSecondary,
          selectedDayBackgroundColor: colors.primary,
          selectedDayTextColor: '#FFFFFF',
          todayTextColor: colors.primary,
          dayTextColor: colors.text,
          textDisabledColor: colors.textSecondary + '50',
          dotColor: colors.primary,
          selectedDotColor: '#FFFFFF',
          arrowColor: colors.primary,
          monthTextColor: colors.text,
          indicatorColor: colors.primary,
          textDayFontWeight: '500',
          textMonthFontWeight: '700',
          textDayHeaderFontWeight: '600',
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 13,
        }}
        markedDates={markedDates}
        markingType="multi-period"
        onDayPress={handleDayPress}
        enableSwipeMonths
      />

      {/* Selected date info */}
      {selectedDate && (
        <View style={[styles.selectedInfo, { backgroundColor: colors.card }]}>
          <Text style={[styles.selectedDate, { color: colors.text }]}>
            {formatDate(selectedDate, 'EEEE, MMMM d, yyyy')}
          </Text>
          <Text style={[styles.selectedVisits, { color: colors.textSecondary }]}>
            {selectedVisits.length === 0
              ? t('noVisitsOnDate')
              : `${selectedVisits.length} visit${selectedVisits.length > 1 ? 's' : ''}`}
          </Text>
          {selectedVisits.length > 0 && (
            <TouchableOpacity
              style={[styles.viewButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowModal(true)}
            >
              <Text style={styles.viewButtonText}>{t('details')}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Visits Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {selectedDate && formatDate(selectedDate, 'MMM d, yyyy')}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={selectedVisits}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.visitItem, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    setShowModal(false);
                    router.push(`/visit/${item.id}`);
                  }}
                >
                  <Text style={styles.flag}>{getCountryByCode(item.countryCode)?.flag}</Text>
                  <View style={styles.visitInfo}>
                    <Text style={[styles.visitCountry, { color: colors.text }]}>{item.countryName}</Text>
                    <Text style={[styles.visitVisa, { color: colors.textSecondary }]}>{item.visaType}</Text>
                    <Text style={[styles.visitDates, { color: colors.textSecondary }]}>
                      {formatDate(item.entryDate, 'MMM d')}
                      {item.exitDate && ` - ${formatDate(item.exitDate, 'MMM d, yyyy')}`}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  {t('noVisitsOnDate')}
                </Text>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  calendar: {
    margin: 16,
    borderRadius: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  selectedInfo: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  selectedDate: {
    fontSize: 18,
    fontWeight: '600',
  },
  selectedVisits: {
    fontSize: 14,
    marginTop: 4,
  },
  viewButton: {
    marginTop: 12,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  visitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  flag: {
    fontSize: 32,
  },
  visitInfo: {
    flex: 1,
  },
  visitCountry: {
    fontSize: 16,
    fontWeight: '600',
  },
  visitVisa: {
    fontSize: 13,
    marginTop: 2,
  },
  visitDates: {
    fontSize: 12,
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    padding: 40,
    fontSize: 14,
  },
});
