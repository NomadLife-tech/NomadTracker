import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useApp } from '../../src/contexts/AppContext';
import { useToast } from '../../src/contexts/ToastContext';
import { Visit } from '../../src/types';
import { COUNTRIES, getCountryByCode, getVisaTypesWithCustom, getVisaTypesForPassport, isEUCountry } from '../../src/constants/countries';
import { getDefaultAllowedDays, isCustomVisaType } from '../../src/constants/visaDefaults';
import { DatePickerInput } from '../../src/components/common/DatePickerInput';
import { CountryInfoCard } from '../../src/components/common/CountryInfoCard';
import { generateUUID } from '../../src/utils/uuid';
import { isCurrentVisit } from '../../src/utils/dateUtils';
import { getTranslatedCountryName } from '../../src/utils/countryNames';

export default function AddVisitScreen() {
  const { colors } = useTheme();
  const { addVisit, visits, profile, t, settings } = useApp();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { date: preselectedDate } = useLocalSearchParams<{ date?: string }>();

  // Initialize entry date from query param (from calendar quick-add) or today
  const initialDate = preselectedDate ? new Date(preselectedDate + 'T12:00:00') : new Date();

  const [countryCode, setCountryCode] = useState('');
  const [countryName, setCountryName] = useState('');
  const [entryDate, setEntryDate] = useState<Date | undefined>(initialDate);
  const [exitDate, setExitDate] = useState<Date | undefined>();
  const [visaType, setVisaType] = useState('');
  const [allowedDays, setAllowedDays] = useState('');
  const [passportId, setPassportId] = useState('');
  const [visaNumber, setVisaNumber] = useState('');
  const [notes, setNotes] = useState('');

  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showVisaPicker, setShowVisaPicker] = useState(false);
  const [showPassportPicker, setShowPassportPicker] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  // Check for active visits without exit dates and show friendly reminder
  useEffect(() => {
    const activeVisitsWithoutExit = visits.filter(v => isCurrentVisit(v) && !v.exitDate);
    
    if (activeVisitsWithoutExit.length > 0) {
      const lastActiveVisit = activeVisitsWithoutExit.sort((a, b) => 
        new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
      )[0];
      
      const translatedCountry = getTranslatedCountryName(lastActiveVisit.countryCode, settings.language);
      const entryDateFormatted = new Date(lastActiveVisit.entryDate).toLocaleDateString();
      const message = t('exitDateReminderMessage')
        .replace('{country}', translatedCountry)
        .replace('{date}', entryDateFormatted);
      
      Alert.alert(
        `📍 ${t('friendlyReminder')}`,
        message,
        [{ text: 'OK', style: 'default' }]
      );
    }
  }, []); // Run once when component mounts

  const selectedCountry = countryCode ? getCountryByCode(countryCode) : null;
  
  // Get the selected passport's country code
  const selectedPassportCountry = useMemo(() => {
    if (!passportId) return null;
    const passport = profile.passports.find(p => p.id === passportId);
    return passport?.countryCode || null;
  }, [passportId, profile.passports]);
  
  // Get visa types - includes "EU Citizen" if EU passport + EU destination
  const visaTypes = useMemo(() => {
    if (!countryCode) return [];
    return getVisaTypesForPassport(countryCode, selectedPassportCountry);
  }, [countryCode, selectedPassportCountry]);
  
  // Check if allowed days should be editable (only when Custom is selected)
  // EU Citizen should NOT show allowed days field
  const isAllowedDaysEditable = isCustomVisaType(visaType);
  const isEUCitizen = visaType === 'EU Citizen';

  // Calculate visit duration when both dates are selected
  const visitDuration = useMemo(() => {
    if (!entryDate || !exitDate) return null;
    const diffTime = exitDate.getTime() - entryDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both entry and exit days
    return diffDays > 0 ? diffDays : null;
  }, [entryDate, exitDate]);

  // Auto-populate allowed days when visa type changes
  useEffect(() => {
    if (visaType && !isCustomVisaType(visaType) && visaType !== 'EU Citizen') {
      const defaultDays = getDefaultAllowedDays(visaType);
      setAllowedDays(defaultDays.toString());
    } else if (visaType === 'EU Citizen') {
      // EU Citizens have unlimited stay
      setAllowedDays('0');
    }
  }, [visaType]);
  
  // Auto-select EU Citizen when EU passport selected for EU destination
  // This runs whenever passport or country changes
  useEffect(() => {
    // Only auto-select if we have both a passport and country selected
    if (selectedPassportCountry && countryCode) {
      const isEUPassport = isEUCountry(selectedPassportCountry);
      const isEUDestination = isEUCountry(countryCode);
      
      if (isEUPassport && isEUDestination) {
        // Auto-select EU Citizen visa type
        setVisaType('EU Citizen');
        setAllowedDays('0');
      } else if (visaType === 'EU Citizen') {
        // If currently EU Citizen but conditions no longer apply, reset
        setVisaType('');
      }
    }
  }, [selectedPassportCountry, countryCode]);

  const filteredCountries = countrySearch
    ? COUNTRIES.filter(c =>
        c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
        c.code.toLowerCase().includes(countrySearch.toLowerCase())
      )
    : COUNTRIES;

  const handleSave = async () => {
    // Validate in form order with specific messages
    if (!countryCode) {
      showToast('Please select a country', 'warning');
      return;
    }
    if (!entryDate) {
      showToast('Please set an entry date', 'warning');
      return;
    }
    if (!visaType) {
      showToast('Please select a visa type', 'warning');
      return;
    }

    try {
      const visitId = await generateUUID();
      const visit: Visit = {
        id: visitId,
        countryCode,
        countryName,
        entryDate: entryDate.toISOString(),
        exitDate: exitDate?.toISOString(),
        visaType,
        allowedDays: allowedDays ? parseInt(allowedDays) : 90,
        passportId: passportId || undefined,
        visaNumber: visaNumber || undefined,
        notes: notes || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await addVisit(visit);
      showToast(t('success'), 'success');
      router.back();
    } catch (error) {
      console.error('Error saving visit:', error);
      // Show Alert with actual error message for debugging in Expo Go
      const errorMessage = error instanceof Error ? error.message : String(error);
      Alert.alert(
        t('saveFailed'),
        `Could not save visit. Error: ${errorMessage}`,
        [{ text: 'OK' }]
      );
      showToast(t('errorSavingData'), 'error');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t('addVisit')}</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveHeaderButton}>
            <Text style={[styles.saveHeaderText, { color: colors.primary }]}>{t('save')}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Country Selector */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{t('country')} *</Text>
            <TouchableOpacity
              style={[styles.pickerButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => setShowCountryPicker(true)}
            >
              {countryCode ? (
                <>
                  <Text style={styles.pickerFlag}>{selectedCountry?.flag}</Text>
                  <Text style={[styles.pickerText, { color: colors.text }]}>{countryName}</Text>
                </>
              ) : (
                <Text style={[styles.pickerPlaceholder, { color: colors.textSecondary }]}>
                  {t('selectCountry')}
                </Text>
              )}
              <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Country Info Card */}
          {countryCode && <CountryInfoCard countryCode={countryCode} />}

          {/* Passport Used on Entry - OPTIONAL */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              {t('passportUsed')} ({t('optional')})
            </Text>
            {profile.passports.length > 0 ? (
              <TouchableOpacity
                style={[styles.pickerButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => setShowPassportPicker(true)}
              >
                {passportId ? (
                  <>
                    <Text style={styles.pickerFlag}>
                      {getCountryByCode(profile.passports.find(p => p.id === passportId)?.countryCode || '')?.flag}
                    </Text>
                    <Text style={[styles.pickerText, { color: colors.text }]}>
                      {profile.passports.find(p => p.id === passportId)?.countryName} - {profile.passports.find(p => p.id === passportId)?.passportNumber}
                    </Text>
                  </>
                ) : (
                  <Text style={[styles.pickerPlaceholder, { color: colors.textSecondary }]}>
                    {t('selectPassport')}
                  </Text>
                )}
                <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            ) : (
              <View style={[styles.emptyPassportHint, { backgroundColor: colors.border + '30', borderColor: colors.border }]}>
                <Ionicons name="information-circle-outline" size={18} color={colors.textSecondary} />
                <Text style={[styles.emptyPassportText, { color: colors.textSecondary }]}>
                  {t('noPassportsHint')}
                </Text>
              </View>
            )}
          </View>

          {/* Entry Date */}
          <DatePickerInput
            label={`${t('entryDate')} *`}
            value={entryDate}
            onChange={setEntryDate}
          />

          {/* Exit Date */}
          <DatePickerInput
            label={t('exitDate')}
            value={exitDate}
            onChange={setExitDate}
            optional
            minimumDate={entryDate}
          />

          {/* Visit Duration Preview */}
          {visitDuration && (
            <View style={[styles.durationPreview, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}>
              <Ionicons name="time-outline" size={18} color={colors.primary} />
              <Text style={[styles.durationText, { color: colors.primary }]}>
                {visitDuration} {visitDuration === 1 ? t('day') : t('days')}
              </Text>
              <Text style={[styles.durationLabel, { color: colors.textSecondary }]}>
                {t('visitDuration')}
              </Text>
            </View>
          )}

          {/* Visa Type */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{t('visaType')} *</Text>
            <TouchableOpacity
              style={[
                styles.pickerButton, 
                { 
                  backgroundColor: colors.card, 
                  borderColor: colors.border,
                  opacity: countryCode ? 1 : 0.5,
                }
              ]}
              onPress={() => setShowVisaPicker(true)}
              disabled={!countryCode}
              activeOpacity={0.7}
            >
              {!countryCode && (
                <Ionicons name="lock-closed" size={16} color={colors.textSecondary} style={{ marginRight: 4 }} />
              )}
              {visaType ? (
                <Text style={[styles.pickerText, { color: colors.text }]}>{visaType}</Text>
              ) : (
                <Text style={[styles.pickerPlaceholder, { color: colors.textSecondary }]}>
                  {countryCode ? t('selectVisaType') : t('selectCountryFirst')}
                </Text>
              )}
              <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Allowed Days - Only editable when Custom is selected */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              {t('allowedDays')} {isAllowedDaysEditable ? '' : '(Auto)'}
            </Text>
            <View style={styles.allowedDaysRow}>
              <TextInput
                style={[
                  styles.input,
                  styles.allowedDaysInput,
                  { 
                    backgroundColor: isAllowedDaysEditable ? colors.card : colors.border + '50',
                    color: colors.text, 
                    borderColor: colors.border 
                  }
                ]}
                value={allowedDays}
                onChangeText={setAllowedDays}
                placeholder="90"
                placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad"
                editable={isAllowedDaysEditable}
              />
              {!isAllowedDaysEditable && visaType && (
                <View style={[styles.autoLabel, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons name="information-circle" size={14} color={colors.primary} />
                  <Text style={[styles.autoLabelText, { color: colors.primary }]}>
                    {t('basedOnVisaType')}
                  </Text>
                </View>
              )}
            </View>
            {!isAllowedDaysEditable && (
              <Text style={[styles.hintText, { color: colors.textSecondary }]}>
                {t('selectCustomToEdit')}
              </Text>
            )}
          </View>

          {/* Visa Number */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              {t('visaNumber')} ({t('optional')})
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              value={visaNumber}
              onChangeText={setVisaNumber}
              placeholder={t('visaNumber')}
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {/* Notes */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              {t('notes')} ({t('optional')})
            </Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              value={notes}
              onChangeText={setNotes}
              placeholder={t('notes')}
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={handleSave}
          >
            <Ionicons name="checkmark" size={24} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>{t('save')}</Text>
          </TouchableOpacity>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Country Picker Modal - Full Screen with Keyboard Handling */}
        <Modal visible={showCountryPicker} animationType="slide">
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.fullScreenModal, { backgroundColor: colors.card }]}
          >
            <View style={[styles.fullScreenHeader, { borderBottomColor: colors.border, paddingTop: insets.top }]}>
              <TouchableOpacity onPress={() => {
                setShowCountryPicker(false);
                setCountrySearch('');
              }}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t('selectCountry')}</Text>
              <View style={{ width: 28 }} />
            </View>
            <View style={[styles.searchBar, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Ionicons name="search" size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder={t('searchCountries')}
                placeholderTextColor={colors.textSecondary}
                value={countrySearch}
                onChangeText={setCountrySearch}
                autoFocus={true}
                returnKeyType="search"
              />
              {countrySearch.length > 0 && (
                <TouchableOpacity onPress={() => setCountrySearch('')}>
                  <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => item.code}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.listItem, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    setCountryCode(item.code);
                    setCountryName(item.name);
                    setVisaType('');
                    setAllowedDays('');
                    setShowCountryPicker(false);
                    setCountrySearch('');
                  }}
                >
                  <Text style={styles.listFlag}>{item.flag}</Text>
                  <Text style={[styles.listText, { color: colors.text }]}>{item.name}</Text>
                  {item.isSchengen && (
                    <View style={[styles.schengenBadge, { backgroundColor: colors.primary + '20' }]}>
                      <Text style={[styles.schengenText, { color: colors.primary }]}>Schengen</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyList}>
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    {t('noCountriesFound')} "{countrySearch}"
                  </Text>
                </View>
              }
            />
          </KeyboardAvoidingView>
        </Modal>

        {/* Visa Type Picker Modal */}
        <Modal visible={showVisaPicker} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>{t('visaType')}</Text>
                <TouchableOpacity onPress={() => setShowVisaPicker(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              <FlatList
                data={visaTypes}
                keyExtractor={(item) => item}
                renderItem={({ item }) => {
                  const isCustom = isCustomVisaType(item);
                  const defaultDays = getDefaultAllowedDays(item);
                  return (
                    <TouchableOpacity
                      style={[styles.listItem, { borderBottomColor: colors.border }]}
                      onPress={() => {
                        setVisaType(item);
                        // Auto-populate allowed days unless Custom
                        if (!isCustom) {
                          setAllowedDays(defaultDays.toString());
                        }
                        setShowVisaPicker(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={styles.visaTypeInfo}>
                        <Text style={[styles.listText, { color: colors.text }]}>{item}</Text>
                        {!isCustom && (
                          <Text style={[styles.visaDays, { color: colors.textSecondary }]}>
                            {defaultDays} days
                          </Text>
                        )}
                        {isCustom && (
                          <Text style={[styles.visaDays, { color: colors.primary }]}>
                            {t('setYourOwnDuration')}
                          </Text>
                        )}
                      </View>
                      {visaType === item && (
                        <Ionicons name="checkmark" size={24} color={colors.primary} />
                      )}
                    </TouchableOpacity>
                  );
                }}
                ListEmptyComponent={
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    {t('noVisaTypesAvailable')}
                  </Text>
                }
              />
            </View>
          </View>
        </Modal>

        {/* Passport Picker Modal */}
        <Modal visible={showPassportPicker} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>{t('passport')}</Text>
                <TouchableOpacity onPress={() => setShowPassportPicker(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              <FlatList
                data={profile.passports}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.listItem, { borderBottomColor: colors.border }]}
                    onPress={() => {
                      setPassportId(item.id);
                      setShowPassportPicker(false);
                    }}
                  >
                    <Text style={styles.listFlag}>{getCountryByCode(item.countryCode)?.flag}</Text>
                    <View style={styles.passportInfo}>
                      <Text style={[styles.listText, { color: colors.text }]}>{item.countryName}</Text>
                      <Text style={[styles.passportSub, { color: colors.textSecondary }]}>
                        {t(item.type)} • {item.passportNumber}
                      </Text>
                    </View>
                    {passportId === item.id && (
                      <Ionicons name="checkmark" size={24} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  saveHeaderButton: {
    padding: 4,
  },
  saveHeaderText: {
    fontSize: 17,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  input: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  pickerFlag: {
    fontSize: 24,
  },
  pickerText: {
    flex: 1,
    fontSize: 16,
  },
  pickerPlaceholder: {
    flex: 1,
    fontSize: 16,
  },
  allowedDaysRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  allowedDaysInput: {
    flex: 1,
  },
  autoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  autoLabelText: {
    fontSize: 12,
    fontWeight: '500',
  },
  hintText: {
    fontSize: 12,
    marginTop: 6,
    fontStyle: 'italic',
  },
  durationPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    gap: 8,
  },
  durationText: {
    fontSize: 18,
    fontWeight: '700',
  },
  durationLabel: {
    fontSize: 13,
    marginLeft: 'auto',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 17,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  fullScreenModal: {
    flex: 1,
  },
  fullScreenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  emptyList: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  listFlag: {
    fontSize: 28,
  },
  listText: {
    flex: 1,
    fontSize: 16,
  },
  visaTypeInfo: {
    flex: 1,
  },
  visaDays: {
    fontSize: 13,
    marginTop: 2,
  },
  schengenBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  schengenText: {
    fontSize: 11,
    fontWeight: '600',
  },
  passportInfo: {
    flex: 1,
  },
  passportSub: {
    fontSize: 13,
    marginTop: 2,
  },
  emptyPassportHint: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  emptyPassportText: {
    flex: 1,
    fontSize: 14,
  },
});
