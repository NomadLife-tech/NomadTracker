import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../contexts/ThemeContext';
import { formatDate } from '../../utils/dateUtils';
import { Ionicons } from '@expo/vector-icons';

interface DatePickerInputProps {
  label: string;
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  optional?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
}

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

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (event.type === 'dismissed') {
      return;
    }
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  const handleConfirm = () => {
    setShowPicker(false);
  };

  const handleClear = () => {
    onChange(undefined);
  };

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
        onPress={() => setShowPicker(true)}
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

      {showPicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}

      {showPicker && Platform.OS !== 'android' && (
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
                <TouchableOpacity onPress={handleConfirm}>
                  <Text style={[styles.modalButton, { color: colors.primary }]}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={value || new Date()}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
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
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalButton: {
    fontSize: 17,
    fontWeight: '600',
  },
  picker: {
    height: 200,
  },
});
