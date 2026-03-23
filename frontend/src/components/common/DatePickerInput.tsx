import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Modal, TextInput } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { formatDate } from '../../utils/dateUtils';
import { Ionicons } from '@expo/vector-icons';

// Only import DateTimePicker for native platforms
let DateTimePicker: any = null;
if (Platform.OS !== 'web') {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
}

interface DatePickerInputProps {
  label: string;
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  optional?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
}

// Helper to format date as YYYY-MM-DD for web input
const formatDateForWebInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function DatePickerInput({
  label,
  value,
  onChange,
  placeholder = 'Select date',
  optional = false,
  minimumDate,
  maximumDate,
}: DatePickerInputProps) {
  const { colors } = useTheme();
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(value || new Date());
  
  // Web-specific state
  const [webYear, setWebYear] = useState(value ? value.getFullYear().toString() : new Date().getFullYear().toString());
  const [webMonth, setWebMonth] = useState(value ? String(value.getMonth() + 1).padStart(2, '0') : String(new Date().getMonth() + 1).padStart(2, '0'));
  const [webDay, setWebDay] = useState(value ? String(value.getDate()).padStart(2, '0') : String(new Date().getDate()).padStart(2, '0'));

  const handleClear = () => {
    onChange(undefined);
  };

  const openPicker = () => {
    if (value) {
      setTempDate(value);
      setWebYear(value.getFullYear().toString());
      setWebMonth(String(value.getMonth() + 1).padStart(2, '0'));
      setWebDay(String(value.getDate()).padStart(2, '0'));
    } else {
      const now = new Date();
      setTempDate(now);
      setWebYear(now.getFullYear().toString());
      setWebMonth(String(now.getMonth() + 1).padStart(2, '0'));
      setWebDay(String(now.getDate()).padStart(2, '0'));
    }
    setShowPicker(true);
  };

  // Native handlers
  const handleNativeDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
      if (event.type === 'dismissed') {
        return;
      }
    }
    if (selectedDate) {
      setTempDate(selectedDate);
      if (Platform.OS === 'android') {
        onChange(selectedDate);
      }
    }
  };

  const handleNativeConfirm = () => {
    onChange(tempDate);
    setShowPicker(false);
  };

  // Web handlers
  const handleWebConfirm = () => {
    const year = parseInt(webYear);
    const month = parseInt(webMonth);
    const day = parseInt(webDay);
    
    if (year && month && day && year >= 1900 && year <= 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const newDate = new Date(year, month - 1, day);
      // Validate the date is real (e.g., Feb 30 would become Mar 2)
      if (newDate.getMonth() === month - 1 && newDate.getDate() === day) {
        onChange(newDate);
        setShowPicker(false);
      }
    }
  };

  // Generate options for dropdowns
  const years = Array.from({ length: 50 }, (_, i) => {
    const year = new Date().getFullYear() - 10 + i;
    return { label: year.toString(), value: year.toString() };
  });
  
  const months = [
    { label: 'January', value: '01' },
    { label: 'February', value: '02' },
    { label: 'March', value: '03' },
    { label: 'April', value: '04' },
    { label: 'May', value: '05' },
    { label: 'June', value: '06' },
    { label: 'July', value: '07' },
    { label: 'August', value: '08' },
    { label: 'September', value: '09' },
    { label: 'October', value: '10' },
    { label: 'November', value: '11' },
    { label: 'December', value: '12' },
  ];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const daysInCurrentMonth = getDaysInMonth(parseInt(webYear) || 2025, parseInt(webMonth) || 1);
  const days = Array.from({ length: daysInCurrentMonth }, (_, i) => {
    const day = i + 1;
    return { label: day.toString(), value: String(day).padStart(2, '0') };
  });

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        {label}
        {optional && <Text style={{ color: colors.textSecondary }}> (Optional)</Text>}
      </Text>
      
      <TouchableOpacity
        style={[
          styles.input,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
        onPress={openPicker}
      >
        <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
        <Text
          style={[
            styles.inputText,
            { color: value ? colors.text : colors.textSecondary },
          ]}
        >
          {value ? formatDate(value, 'MMM d, yyyy') : placeholder}
        </Text>
        {value && optional && (
          <TouchableOpacity onPress={handleClear} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {/* Web Date Picker Modal */}
      {Platform.OS === 'web' && showPicker && (
        <Modal
          visible={showPicker}
          transparent
          animationType="fade"
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.webModalContent, { backgroundColor: colors.card }]}>
              <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => setShowPicker(false)}>
                  <Text style={[styles.modalButton, { color: colors.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Select Date</Text>
                <TouchableOpacity onPress={handleWebConfirm}>
                  <Text style={[styles.modalButton, { color: colors.primary }]}>Done</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.webPickerContainer}>
                {/* Month Selector */}
                <View style={styles.webPickerColumn}>
                  <Text style={[styles.webPickerLabel, { color: colors.textSecondary }]}>Month</Text>
                  <View style={[styles.webPickerSelect, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    {months.map((month) => (
                      <TouchableOpacity
                        key={month.value}
                        style={[
                          styles.webPickerOption,
                          webMonth === month.value && { backgroundColor: colors.primary + '20' }
                        ]}
                        onPress={() => setWebMonth(month.value)}
                      >
                        <Text style={[
                          styles.webPickerOptionText,
                          { color: webMonth === month.value ? colors.primary : colors.text }
                        ]}>
                          {month.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Day Selector */}
                <View style={styles.webPickerColumn}>
                  <Text style={[styles.webPickerLabel, { color: colors.textSecondary }]}>Day</Text>
                  <View style={[styles.webPickerSelect, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    {days.map((day) => (
                      <TouchableOpacity
                        key={day.value}
                        style={[
                          styles.webPickerOption,
                          webDay === day.value && { backgroundColor: colors.primary + '20' }
                        ]}
                        onPress={() => setWebDay(day.value)}
                      >
                        <Text style={[
                          styles.webPickerOptionText,
                          { color: webDay === day.value ? colors.primary : colors.text }
                        ]}>
                          {day.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Year Selector */}
                <View style={styles.webPickerColumn}>
                  <Text style={[styles.webPickerLabel, { color: colors.textSecondary }]}>Year</Text>
                  <View style={[styles.webPickerSelect, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    {years.map((year) => (
                      <TouchableOpacity
                        key={year.value}
                        style={[
                          styles.webPickerOption,
                          webYear === year.value && { backgroundColor: colors.primary + '20' }
                        ]}
                        onPress={() => setWebYear(year.value)}
                      >
                        <Text style={[
                          styles.webPickerOptionText,
                          { color: webYear === year.value ? colors.primary : colors.text }
                        ]}>
                          {year.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              {/* Selected Date Preview */}
              <View style={[styles.selectedPreview, { backgroundColor: colors.background }]}>
                <Text style={[styles.selectedPreviewText, { color: colors.text }]}>
                  Selected: {months.find(m => m.value === webMonth)?.label} {parseInt(webDay)}, {webYear}
                </Text>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Android Date Picker */}
      {Platform.OS === 'android' && showPicker && DateTimePicker && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="default"
          onChange={handleNativeDateChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}

      {/* iOS Date Picker */}
      {Platform.OS === 'ios' && showPicker && DateTimePicker && (
        <Modal
          visible={showPicker}
          transparent
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => setShowPicker(false)}>
                  <Text style={[styles.modalButton, { color: colors.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleNativeConfirm}>
                  <Text style={[styles.modalButton, { color: colors.primary }]}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={handleNativeDateChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                style={styles.picker}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  inputText: {
    flex: 1,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  webModalContent: {
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  modalButton: {
    fontSize: 17,
    fontWeight: '600',
  },
  picker: {
    height: 200,
  },
  webPickerContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  webPickerColumn: {
    flex: 1,
  },
  webPickerLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
    textAlign: 'center',
  },
  webPickerSelect: {
    borderRadius: 12,
    borderWidth: 1,
    maxHeight: 200,
    overflow: 'scroll' as any,
  },
  webPickerOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  webPickerOptionText: {
    fontSize: 14,
    textAlign: 'center',
  },
  selectedPreview: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedPreviewText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
