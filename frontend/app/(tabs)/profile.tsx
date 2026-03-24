import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Modal,
  FlatList,
  Animated,
  PanResponder,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useApp } from '../../src/contexts/AppContext';
import { useToast } from '../../src/contexts/ToastContext';
import { Passport, Insurance, SupportedLanguage, Attachment } from '../../src/types';
import { COUNTRIES, getCountryByCode } from '../../src/constants/countries';
import { LANGUAGE_NAMES } from '../../src/constants/translations';
import { DatePickerInput } from '../../src/components/common/DatePickerInput';
import { exportData, importData } from '../../src/services/dataExport';
import { v4 as uuidv4 } from 'uuid';

const PRESET_AVATARS = ['🌍', '🌎', '🌏', '✈️', '🚶', '🧭', '💼', '🏞️', '🏖️', '🛳️'];

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { profile, settings, updateProfile, setDarkMode, setLanguage, refreshAll, t } = useApp();
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();

  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showPassportModal, setShowPassportModal] = useState(false);
  const [showInsuranceModal, setShowInsuranceModal] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  const [editingPassport, setEditingPassport] = useState<Passport | null>(null);
  const [editingInsurance, setEditingInsurance] = useState<Insurance | null>(null);

  // Passport form state
  const [passportCountry, setPassportCountry] = useState('');
  const [passportCountryName, setPassportCountryName] = useState('');
  const [passportType, setPassportType] = useState<'primary' | 'secondary' | 'tertiary'>('primary');
  const [passportNumber, setPassportNumber] = useState('');
  const [passportIssueDate, setPassportIssueDate] = useState<Date | undefined>();
  const [passportExpiryDate, setPassportExpiryDate] = useState<Date | undefined>();

  // Insurance form state
  const [insuranceType, setInsuranceType] = useState<'medical' | 'travel'>('medical');
  const [insuranceProvider, setInsuranceProvider] = useState('');
  const [insurancePolicyNumber, setInsurancePolicyNumber] = useState('');
  const [insurancePhone, setInsurancePhone] = useState('');
  const [insuranceNotes, setInsuranceNotes] = useState('');

  // Attachment states
  const [passportAttachments, setPassportAttachments] = useState<Attachment[]>([]);
  const [insuranceAttachments, setInsuranceAttachments] = useState<Attachment[]>([]);

  useFocusEffect(
    useCallback(() => {
      refreshAll();
    }, [])
  );

  const handleNameChange = async (field: 'firstName' | 'lastName', value: string) => {
    await updateProfile({ ...profile, [field]: value });
  };

  const handleAvatarSelect = async (avatar: string) => {
    await updateProfile({ ...profile, avatar, avatarType: 'preset' });
    setShowAvatarModal(false);
    showToast(t('success'), 'success');
  };

  const handleCustomPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      await updateProfile({
        ...profile,
        avatar: `data:image/jpeg;base64,${result.assets[0].base64}`,
        avatarType: 'custom',
      });
      setShowAvatarModal(false);
      showToast(t('success'), 'success');
    }
  };

  const handleDeletePhoto = async () => {
    if (Platform.OS === 'web') {
      // Use window.confirm for web
      const confirmed = window.confirm(t('confirmDeletePhoto'));
      if (confirmed) {
        await updateProfile({
          ...profile,
          avatar: '🌍',
          avatarType: 'preset',
        });
        showToast(t('success'), 'success');
      }
    } else {
      // Use Alert for native
      Alert.alert(
        t('deletePhoto'),
        t('confirmDeletePhoto'),
        [
          { text: t('cancel'), style: 'cancel' },
          {
            text: t('delete'),
            style: 'destructive',
            onPress: async () => {
              await updateProfile({
                ...profile,
                avatar: '🌍',
                avatarType: 'preset',
              });
              showToast(t('success'), 'success');
            },
          },
        ]
      );
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showToast(t('permissionDenied'), 'error');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      await updateProfile({
        ...profile,
        avatar: `data:image/jpeg;base64,${result.assets[0].base64}`,
        avatarType: 'custom',
      });
      setShowAvatarModal(false);
      showToast(t('success'), 'success');
    }
  };

  const resetPassportForm = () => {
    setPassportCountry('');
    setPassportCountryName('');
    setPassportType('primary');
    setPassportNumber('');
    setPassportIssueDate(undefined);
    setPassportExpiryDate(undefined);
    setPassportAttachments([]);
    setEditingPassport(null);
  };

  const resetInsuranceForm = () => {
    setInsuranceType('medical');
    setInsuranceProvider('');
    setInsurancePolicyNumber('');
    setInsurancePhone('');
    setInsuranceNotes('');
    setInsuranceAttachments([]);
    setEditingInsurance(null);
  };

  // Attachment picker function
  const pickAttachment = async (type: 'passport' | 'insurance') => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/png'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const file = result.assets[0];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      // Validate file type
      if (!['pdf', 'jpg', 'jpeg', 'png'].includes(fileExtension || '')) {
        showToast('Only PDF, JPG, and PNG files are allowed', 'error');
        return;
      }

      // Read file as base64 for storage
      let uri = file.uri;
      let base64Data = '';
      
      if (Platform.OS !== 'web') {
        try {
          base64Data = await FileSystem.readAsStringAsync(file.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          uri = `data:${file.mimeType};base64,${base64Data}`;
        } catch (e) {
          // Fall back to URI if base64 fails
          uri = file.uri;
        }
      }

      const attachment: Attachment = {
        id: uuidv4(),
        name: file.name,
        type: fileExtension === 'pdf' ? 'pdf' : fileExtension === 'png' ? 'png' : 'jpg',
        mimeType: file.mimeType || 'application/octet-stream',
        size: file.size || 0,
        uri: uri,
        createdAt: new Date().toISOString(),
      };

      if (type === 'passport') {
        setPassportAttachments(prev => [...prev, attachment]);
      } else {
        setInsuranceAttachments(prev => [...prev, attachment]);
      }
      
      showToast('File attached successfully', 'success');
    } catch (error) {
      console.error('Error picking document:', error);
      showToast('Failed to attach file', 'error');
    }
  };

  // Pick image from gallery
  const pickImageAttachment = async (type: 'passport' | 'insurance') => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        base64: true,
      });

      if (result.canceled || !result.assets[0]) {
        return;
      }

      const asset = result.assets[0];
      const fileExtension = asset.uri.split('.').pop()?.toLowerCase() || 'jpg';
      
      const attachment: Attachment = {
        id: uuidv4(),
        name: `image_${Date.now()}.${fileExtension}`,
        type: fileExtension === 'png' ? 'png' : 'jpg',
        mimeType: fileExtension === 'png' ? 'image/png' : 'image/jpeg',
        size: asset.fileSize || 0,
        uri: asset.base64 ? `data:image/${fileExtension};base64,${asset.base64}` : asset.uri,
        createdAt: new Date().toISOString(),
      };

      if (type === 'passport') {
        setPassportAttachments(prev => [...prev, attachment]);
      } else {
        setInsuranceAttachments(prev => [...prev, attachment]);
      }
      
      showToast('Image attached successfully', 'success');
    } catch (error) {
      console.error('Error picking image:', error);
      showToast('Failed to attach image', 'error');
    }
  };

  // Remove attachment
  const removeAttachment = (type: 'passport' | 'insurance', attachmentId: string) => {
    if (type === 'passport') {
      setPassportAttachments(prev => prev.filter(a => a.id !== attachmentId));
    } else {
      setInsuranceAttachments(prev => prev.filter(a => a.id !== attachmentId));
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const openPassportModal = (passport?: Passport) => {
    if (passport) {
      setEditingPassport(passport);
      setPassportCountry(passport.countryCode);
      setPassportCountryName(passport.countryName);
      setPassportType(passport.type);
      setPassportNumber(passport.passportNumber);
      setPassportIssueDate(new Date(passport.issueDate));
      setPassportExpiryDate(new Date(passport.expiryDate));
      setPassportAttachments(passport.attachments || []);
    } else {
      resetPassportForm();
    }
    setShowPassportModal(true);
  };

  const openInsuranceModal = (insurance?: Insurance) => {
    if (insurance) {
      setEditingInsurance(insurance);
      setInsuranceType(insurance.type);
      setInsuranceProvider(insurance.provider);
      setInsurancePolicyNumber(insurance.policyNumber);
      setInsurancePhone(insurance.phone || '');
      setInsuranceNotes(insurance.notes || '');
      setInsuranceAttachments(insurance.attachments || []);
    } else {
      resetInsuranceForm();
    }
    setShowInsuranceModal(true);
  };

  const savePassport = async () => {
    if (!passportCountry || !passportNumber || !passportIssueDate || !passportExpiryDate) {
      showToast(t('error'), 'error');
      return;
    }

    const passportData: Passport = {
      id: editingPassport?.id || uuidv4(),
      type: passportType,
      countryCode: passportCountry,
      countryName: passportCountryName,
      passportNumber,
      issueDate: passportIssueDate.toISOString(),
      expiryDate: passportExpiryDate.toISOString(),
      attachments: passportAttachments,
    };

    let updatedPassports: Passport[];
    if (editingPassport) {
      updatedPassports = profile.passports.map(p =>
        p.id === editingPassport.id ? passportData : p
      );
    } else {
      updatedPassports = [...profile.passports, passportData];
    }

    await updateProfile({ ...profile, passports: updatedPassports });
    setShowPassportModal(false);
    resetPassportForm();
    showToast(t('success'), 'success');
  };

  const deletePassport = async (passportId: string) => {
    const updatedPassports = profile.passports.filter(p => p.id !== passportId);
    await updateProfile({ ...profile, passports: updatedPassports });
    showToast(t('success'), 'success');
  };

  const saveInsurance = async () => {
    if (!insuranceProvider || !insurancePolicyNumber) {
      showToast(t('error'), 'error');
      return;
    }

    const insuranceData: Insurance = {
      id: editingInsurance?.id || uuidv4(),
      type: insuranceType,
      provider: insuranceProvider,
      policyNumber: insurancePolicyNumber,
      phone: insurancePhone || undefined,
      notes: insuranceNotes || undefined,
      attachments: insuranceAttachments,
    };

    let updatedInsurances: Insurance[];
    if (editingInsurance) {
      updatedInsurances = profile.insurances.map(i =>
        i.id === editingInsurance.id ? insuranceData : i
      );
    } else {
      updatedInsurances = [...profile.insurances, insuranceData];
    }

    await updateProfile({ ...profile, insurances: updatedInsurances });
    setShowInsuranceModal(false);
    resetInsuranceForm();
    showToast(t('success'), 'success');
  };

  const deleteInsurance = async (insuranceId: string) => {
    const updatedInsurances = profile.insurances.filter(i => i.id !== insuranceId);
    await updateProfile({ ...profile, insurances: updatedInsurances });
    showToast(t('success'), 'success');
  };

  const handleExport = async () => {
    const success = await exportData();
    showToast(success ? t('success') : t('error'), success ? 'success' : 'error');
  };

  const handleImport = async () => {
    const success = await importData();
    if (success) {
      await refreshAll();
      showToast(t('success'), 'success');
    } else {
      showToast(t('error'), 'error');
    }
  };

  const SwipeableItem = ({ item, onDelete, onPress, renderContent }: any) => {
    const translateX = useRef(new Animated.Value(0)).current;

    const panResponder = useRef(
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 10,
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dx < 0) {
            translateX.setValue(Math.max(-80, gestureState.dx));
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx < -40) {
            Animated.spring(translateX, { toValue: -80, useNativeDriver: true }).start();
          } else {
            Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
          }
        },
      })
    ).current;

    return (
      <View style={styles.swipeContainer}>
        <TouchableOpacity
          style={[styles.deleteAction, { backgroundColor: colors.danger }]}
          onPress={onDelete}
        >
          <Ionicons name="trash" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Animated.View style={[{ transform: [{ translateX }] }]} {...panResponder.panHandlers}>
          <TouchableOpacity
            style={[styles.itemCard, { backgroundColor: colors.card }]}
            onPress={onPress}
            activeOpacity={0.7}
          >
            {renderContent()}
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  const filteredCountries = countrySearch
    ? COUNTRIES.filter(c =>
        c.name.toLowerCase().includes(countrySearch.toLowerCase())
      )
    : COUNTRIES;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Personal Info */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {t('personalInfo')}
          </Text>

          {/* Avatar / Profile Photo */}
          <View style={styles.profilePhotoSection}>
            <View style={[styles.avatar, { backgroundColor: colors.border }]}>
              {profile.avatarType === 'custom' && profile.avatar?.startsWith('data:image') ? (
                <Image 
                  source={{ uri: profile.avatar }} 
                  style={styles.avatarImage} 
                  resizeMode="cover"
                />
              ) : (
                <Text style={styles.avatarEmoji}>{profile.avatar || '🌍'}</Text>
              )}
            </View>
            <View style={styles.photoActions}>
              <TouchableOpacity 
                style={[styles.photoActionButton, { backgroundColor: colors.primary }]} 
                onPress={() => setShowAvatarModal(true)}
              >
                <Ionicons name="camera" size={18} color="#FFFFFF" />
                <Text style={styles.photoActionText}>
                  {profile.avatarType === 'custom' ? t('changePhoto') : t('addPhoto')}
                </Text>
              </TouchableOpacity>
              {profile.avatarType === 'custom' && profile.avatar?.startsWith('data:image') && (
                <TouchableOpacity 
                  style={[styles.photoActionButton, styles.deletePhotoButton, { backgroundColor: colors.danger }]} 
                  onPress={handleDeletePhoto}
                >
                  <Ionicons name="trash" size={18} color="#FFFFFF" />
                  <Text style={styles.photoActionText}>{t('deletePhoto')}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Name Fields */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{t('firstName')}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              value={profile.firstName}
              onChangeText={(value) => handleNameChange('firstName', value)}
              placeholder={t('firstName')}
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{t('lastName')}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              value={profile.lastName}
              onChangeText={(value) => handleNameChange('lastName', value)}
              placeholder={t('lastName')}
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </View>

        {/* App Settings */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {t('appSettings')}
          </Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="moon" size={22} color={colors.text} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>{t('darkMode')}</Text>
            </View>
            <Switch
              value={settings.darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          <TouchableOpacity style={styles.settingRow} onPress={() => setShowLanguageModal(true)}>
            <View style={styles.settingInfo}>
              <Ionicons name="language" size={22} color={colors.text} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>{t('language')}</Text>
            </View>
            <View style={styles.settingValue}>
              <Text style={[styles.settingValueText, { color: colors.textSecondary }]}>
                {LANGUAGE_NAMES[settings.language]}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Passports */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              {t('passports')}
            </Text>
            {profile.passports.length < 3 && (
              <TouchableOpacity onPress={() => openPassportModal()}>
                <Ionicons name="add-circle" size={24} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>
          {profile.passports.length >= 3 && (
            <Text style={[styles.maxNote, { color: colors.textSecondary }]}>
              {t('maxPassportsReached')}
            </Text>
          )}
          <Text style={[styles.hint, { color: colors.textSecondary }]}>{t('swipeToDelete')}</Text>
          {profile.passports.map((passport) => (
            <SwipeableItem
              key={passport.id}
              item={passport}
              onDelete={() => deletePassport(passport.id)}
              onPress={() => openPassportModal(passport)}
              renderContent={() => (
                <View style={styles.passportContent}>
                  <Text style={styles.itemFlag}>{getCountryByCode(passport.countryCode)?.flag}</Text>
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemTitle, { color: colors.text }]}>{passport.countryName}</Text>
                    <Text style={[styles.itemSub, { color: colors.textSecondary }]}>
                      {t(passport.type)} • {passport.passportNumber}
                    </Text>
                  </View>
                </View>
              )}
            />
          ))}
        </View>

        {/* Insurance */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              {t('insurance')}
            </Text>
            <TouchableOpacity onPress={() => openInsuranceModal()}>
              <Ionicons name="add-circle" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.hint, { color: colors.textSecondary }]}>{t('swipeToDelete')}</Text>
          {profile.insurances.map((insurance) => (
            <SwipeableItem
              key={insurance.id}
              item={insurance}
              onDelete={() => deleteInsurance(insurance.id)}
              onPress={() => openInsuranceModal(insurance)}
              renderContent={() => (
                <View style={styles.insuranceContent}>
                  <Ionicons
                    name={insurance.type === 'medical' ? 'medkit' : 'airplane'}
                    size={24}
                    color={colors.primary}
                  />
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemTitle, { color: colors.text }]}>{insurance.provider}</Text>
                    <Text style={[styles.itemSub, { color: colors.textSecondary }]}>
                      {t(insurance.type)} • {insurance.policyNumber}
                    </Text>
                  </View>
                </View>
              )}
            />
          ))}
        </View>

        {/* Data Management */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {t('dataManagement')}
          </Text>

          <TouchableOpacity
            style={[styles.dataButton, { backgroundColor: colors.primary }]}
            onPress={handleExport}
          >
            <Ionicons name="download" size={20} color="#FFFFFF" />
            <Text style={styles.dataButtonText}>{t('exportData')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dataButton, { backgroundColor: colors.success, marginTop: 12 }]}
            onPress={handleImport}
          >
            <Ionicons name="cloud-upload" size={20} color="#FFFFFF" />
            <Text style={styles.dataButtonText}>{t('importData')}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Avatar Modal */}
      <Modal visible={showAvatarModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t('selectProfileImage')}</Text>
              <TouchableOpacity onPress={() => setShowAvatarModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            {/* Photo Options */}
            <View style={styles.photoOptionsSection}>
              <Text style={[styles.photoOptionsTitle, { color: colors.textSecondary }]}>
                {t('uploadPhoto')}
              </Text>
              <View style={styles.photoOptionsRow}>
                <TouchableOpacity
                  style={[styles.photoOptionButton, { backgroundColor: colors.primary }]}
                  onPress={handleTakePhoto}
                >
                  <Ionicons name="camera" size={24} color="#FFFFFF" />
                  <Text style={styles.photoOptionText}>{t('takePhoto')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.photoOptionButton, { backgroundColor: colors.success }]}
                  onPress={handleCustomPhoto}
                >
                  <Ionicons name="images" size={24} color="#FFFFFF" />
                  <Text style={styles.photoOptionText}>{t('chooseFromLibrary')}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Divider */}
            <View style={[styles.divider, { backgroundColor: colors.border }]}>
              <Text style={[styles.dividerText, { color: colors.textSecondary, backgroundColor: colors.card }]}>
                {t('orSelectEmoji')}
              </Text>
            </View>

            {/* Emoji Avatars */}
            <View style={styles.avatarGrid}>
              {PRESET_AVATARS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={[
                    styles.avatarOption, 
                    { borderColor: colors.border },
                    profile.avatar === emoji && profile.avatarType === 'preset' && { borderColor: colors.primary, borderWidth: 2 }
                  ]}
                  onPress={() => handleAvatarSelect(emoji)}
                >
                  <Text style={styles.avatarOptionEmoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Language Modal */}
      <Modal visible={showLanguageModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t('language')}</Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={Object.entries(LANGUAGE_NAMES) as [SupportedLanguage, string][]}
              keyExtractor={([code]) => code}
              renderItem={({ item: [code, name] }) => (
                <TouchableOpacity
                  style={[styles.languageItem, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    setLanguage(code);
                    setShowLanguageModal(false);
                  }}
                >
                  <Text style={[styles.languageName, { color: colors.text }]}>{name}</Text>
                  {settings.language === code && (
                    <Ionicons name="checkmark" size={24} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Passport Modal */}
      <Modal visible={showPassportModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalKeyboard}
          >
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {editingPassport ? t('editPassport') : t('addPassport')}
                </Text>
                <TouchableOpacity onPress={() => { setShowPassportModal(false); resetPassportForm(); }}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.formScroll}>
                {/* Country Selector */}
                <TouchableOpacity
                  style={[styles.pickerButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                  onPress={() => setShowCountryPicker(true)}
                >
                  {passportCountry ? (
                    <>
                      <Text style={styles.pickerFlag}>{getCountryByCode(passportCountry)?.flag}</Text>
                      <Text style={[styles.pickerText, { color: colors.text }]}>{passportCountryName}</Text>
                    </>
                  ) : (
                    <Text style={[styles.pickerPlaceholder, { color: colors.textSecondary }]}>
                      {t('selectCountry')}
                    </Text>
                  )}
                  <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
                </TouchableOpacity>

                {/* Passport Type */}
                <View style={styles.typeSelector}>
                  {(['primary', 'secondary', 'tertiary'] as const).map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeChip,
                        { borderColor: colors.border },
                        passportType === type && { backgroundColor: colors.primary, borderColor: colors.primary },
                      ]}
                      onPress={() => setPassportType(type)}
                    >
                      <Text
                        style={[
                          styles.typeChipText,
                          { color: passportType === type ? '#FFFFFF' : colors.text },
                        ]}
                      >
                        {t(type)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{t('passportNumber')}</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                    value={passportNumber}
                    onChangeText={setPassportNumber}
                    placeholder={t('passportNumber')}
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>

                <DatePickerInput
                  label={t('issueDate')}
                  value={passportIssueDate}
                  onChange={setPassportIssueDate}
                />

                <DatePickerInput
                  label={t('expiryDate')}
                  value={passportExpiryDate}
                  onChange={setPassportExpiryDate}
                />

                {/* Attachments Section */}
                <View style={styles.attachmentSection}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                    Attachments (PDF, JPG, PNG)
                  </Text>
                  
                  {/* Attachment List */}
                  {passportAttachments.length > 0 && (
                    <View style={styles.attachmentList}>
                      {passportAttachments.map((attachment) => (
                        <View key={attachment.id} style={[styles.attachmentItem, { backgroundColor: colors.background, borderColor: colors.border }]}>
                          <View style={[styles.attachmentIcon, { backgroundColor: attachment.type === 'pdf' ? '#FF3B30' : '#007AFF' }]}>
                            <Ionicons 
                              name={attachment.type === 'pdf' ? 'document' : 'image'} 
                              size={18} 
                              color="#FFFFFF" 
                            />
                          </View>
                          <View style={styles.attachmentInfo}>
                            <Text style={[styles.attachmentName, { color: colors.text }]} numberOfLines={1}>
                              {attachment.name}
                            </Text>
                            <Text style={[styles.attachmentSize, { color: colors.textSecondary }]}>
                              {formatFileSize(attachment.size)} • {attachment.type.toUpperCase()}
                            </Text>
                          </View>
                          <TouchableOpacity
                            style={styles.removeAttachment}
                            onPress={() => removeAttachment('passport', attachment.id)}
                          >
                            <Ionicons name="close-circle" size={22} color={colors.danger} />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Add Attachment Buttons */}
                  <View style={styles.attachmentButtons}>
                    <TouchableOpacity
                      style={[styles.attachButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                      onPress={() => pickAttachment('passport')}
                    >
                      <Ionicons name="document-attach" size={20} color={colors.primary} />
                      <Text style={[styles.attachButtonText, { color: colors.text }]}>Add File</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.attachButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                      onPress={() => pickImageAttachment('passport')}
                    >
                      <Ionicons name="camera" size={20} color={colors.primary} />
                      <Text style={[styles.attachButtonText, { color: colors.text }]}>Add Photo</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.saveButton, { backgroundColor: colors.primary }]}
                  onPress={savePassport}
                >
                  <Text style={styles.saveButtonText}>{t('save')}</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Insurance Modal */}
      <Modal visible={showInsuranceModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalKeyboard}
          >
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {editingInsurance ? t('editInsurance') : t('addInsurance')}
                </Text>
                <TouchableOpacity onPress={() => { setShowInsuranceModal(false); resetInsuranceForm(); }}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.formScroll}>
                {/* Insurance Type */}
                <View style={styles.typeSelector}>
                  {(['medical', 'travel'] as const).map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeChip,
                        { borderColor: colors.border, flex: 1 },
                        insuranceType === type && { backgroundColor: colors.primary, borderColor: colors.primary },
                      ]}
                      onPress={() => setInsuranceType(type)}
                    >
                      <Text
                        style={[
                          styles.typeChipText,
                          { color: insuranceType === type ? '#FFFFFF' : colors.text },
                        ]}
                      >
                        {t(type)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{t('provider')}</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                    value={insuranceProvider}
                    onChangeText={setInsuranceProvider}
                    placeholder={t('provider')}
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{t('policyNumber')}</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                    value={insurancePolicyNumber}
                    onChangeText={setInsurancePolicyNumber}
                    placeholder={t('policyNumber')}
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{t('phone')} ({t('optional')})</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                    value={insurancePhone}
                    onChangeText={setInsurancePhone}
                    placeholder={t('phone')}
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{t('notes')} ({t('optional')})</Text>
                  <TextInput
                    style={[styles.input, styles.textArea, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                    value={insuranceNotes}
                    onChangeText={setInsuranceNotes}
                    placeholder={t('notes')}
                    placeholderTextColor={colors.textSecondary}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                {/* Attachments Section */}
                <View style={styles.attachmentSection}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                    Attachments (PDF, JPG, PNG)
                  </Text>
                  
                  {/* Attachment List */}
                  {insuranceAttachments.length > 0 && (
                    <View style={styles.attachmentList}>
                      {insuranceAttachments.map((attachment) => (
                        <View key={attachment.id} style={[styles.attachmentItem, { backgroundColor: colors.background, borderColor: colors.border }]}>
                          <View style={[styles.attachmentIcon, { backgroundColor: attachment.type === 'pdf' ? '#FF3B30' : '#007AFF' }]}>
                            <Ionicons 
                              name={attachment.type === 'pdf' ? 'document' : 'image'} 
                              size={18} 
                              color="#FFFFFF" 
                            />
                          </View>
                          <View style={styles.attachmentInfo}>
                            <Text style={[styles.attachmentName, { color: colors.text }]} numberOfLines={1}>
                              {attachment.name}
                            </Text>
                            <Text style={[styles.attachmentSize, { color: colors.textSecondary }]}>
                              {formatFileSize(attachment.size)} • {attachment.type.toUpperCase()}
                            </Text>
                          </View>
                          <TouchableOpacity
                            style={styles.removeAttachment}
                            onPress={() => removeAttachment('insurance', attachment.id)}
                          >
                            <Ionicons name="close-circle" size={22} color={colors.danger} />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Add Attachment Buttons */}
                  <View style={styles.attachmentButtons}>
                    <TouchableOpacity
                      style={[styles.attachButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                      onPress={() => pickAttachment('insurance')}
                    >
                      <Ionicons name="document-attach" size={20} color={colors.primary} />
                      <Text style={[styles.attachButtonText, { color: colors.text }]}>Add File</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.attachButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                      onPress={() => pickImageAttachment('insurance')}
                    >
                      <Ionicons name="camera" size={20} color={colors.primary} />
                      <Text style={[styles.attachButtonText, { color: colors.text }]}>Add Photo</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.saveButton, { backgroundColor: colors.primary }]}
                  onPress={saveInsurance}
                >
                  <Text style={styles.saveButtonText}>{t('save')}</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Country Picker Modal */}
      <Modal visible={showCountryPicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, maxHeight: '80%' }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t('selectCountry')}</Text>
              <TouchableOpacity onPress={() => setShowCountryPicker(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <View style={[styles.searchBar, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Ionicons name="search" size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search..."
                placeholderTextColor={colors.textSecondary}
                value={countrySearch}
                onChangeText={setCountrySearch}
              />
            </View>
            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.countryItem, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    setPassportCountry(item.code);
                    setPassportCountryName(item.name);
                    setShowCountryPicker(false);
                    setCountrySearch('');
                  }}
                >
                  <Text style={styles.countryFlag}>{item.flag}</Text>
                  <Text style={[styles.countryName, { color: colors.text }]}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  avatarRow: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  customAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 50,
  },
  avatarLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  profilePhotoSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  photoActions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 10,
  },
  photoActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
  },
  deletePhotoButton: {
    // Additional styles for delete button if needed
  },
  photoActionText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  photoOptionsSection: {
    padding: 16,
    paddingBottom: 8,
  },
  photoOptionsTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  photoOptionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  photoOptionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 12,
    gap: 8,
  },
  photoOptionText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
    marginVertical: 16,
    position: 'relative',
  },
  dividerText: {
    position: 'absolute',
    left: '50%',
    top: -10,
    paddingHorizontal: 12,
    fontSize: 12,
    textTransform: 'uppercase',
    transform: [{ translateX: -50 }],
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  settingValueText: {
    fontSize: 14,
  },
  hint: {
    fontSize: 12,
    marginBottom: 8,
  },
  maxNote: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: -8,
    marginBottom: 8,
  },
  swipeContainer: {
    marginBottom: 8,
  },
  deleteAction: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemCard: {
    padding: 12,
    borderRadius: 12,
  },
  passportContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  insuranceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemFlag: {
    fontSize: 32,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemSub: {
    fontSize: 13,
    marginTop: 2,
  },
  dataButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  dataButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalKeyboard: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
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
  formScroll: {
    padding: 16,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
    justifyContent: 'center',
  },
  avatarOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarOptionEmoji: {
    fontSize: 30,
  },
  customPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    marginTop: 0,
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  customPhotoText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  languageName: {
    fontSize: 16,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
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
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  typeChipText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  saveButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
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
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  countryFlag: {
    fontSize: 28,
  },
  countryName: {
    fontSize: 16,
  },
  attachmentSection: {
    marginTop: 16,
    marginBottom: 8,
  },
  attachmentList: {
    marginTop: 10,
    gap: 8,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  attachmentIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachmentInfo: {
    flex: 1,
  },
  attachmentName: {
    fontSize: 14,
    fontWeight: '500',
  },
  attachmentSize: {
    fontSize: 12,
    marginTop: 2,
  },
  removeAttachment: {
    padding: 4,
  },
  attachmentButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  attachButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  attachButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
