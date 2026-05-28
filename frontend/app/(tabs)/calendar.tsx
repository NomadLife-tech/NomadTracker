import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useApp } from '../../src/contexts/AppContext';
import { getVisitsForDate, formatDate } from '../../src/utils/dateUtils';
import { getCountryByCode } from '../../src/constants/countries';
import { getTranslatedCountryName } from '../../src/utils/countryNames';
import { format, parseISO, eachDayOfInterval } from 'date-fns';

// Calendar locale configurations for all supported languages
const CALENDAR_LOCALES: Record<string, any> = {
  en: {
    monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  },
  es: {
    monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  },
  fr: {
    monthNames: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
    monthNamesShort: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
    dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
    dayNamesShort: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
  },
  de: {
    monthNames: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
    monthNamesShort: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
    dayNames: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
    dayNamesShort: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
  },
  pt: {
    monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
    monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
    dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  },
  zh: {
    monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
    monthNamesShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
    dayNamesShort: ['日', '一', '二', '三', '四', '五', '六'],
  },
  ja: {
    monthNames: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    monthNamesShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    dayNames: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
    dayNamesShort: ['日', '月', '火', '水', '木', '金', '土'],
  },
  ko: {
    monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
    dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  },
};

// Register all locales
Object.keys(CALENDAR_LOCALES).forEach(lang => {
  LocaleConfig.locales[lang] = CALENDAR_LOCALES[lang];
});

// Helper function to format date in the current locale
const formatLocalizedDate = (dateStr: string, lang: string): string => {
  const date = parseISO(dateStr);
  const locale = CALENDAR_LOCALES[lang] || CALENDAR_LOCALES.en;
  const dayName = locale.dayNames[date.getDay()];
  const monthName = locale.monthNames[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  
  // Different date formats based on language
  switch (lang) {
    case 'zh':
    case 'ja':
    case 'ko':
      return `${year}${lang === 'zh' ? '年' : '년'} ${monthName} ${day}${lang === 'zh' ? '日' : '일'} ${dayName}`;
    case 'de':
      return `${dayName}, ${day}. ${monthName} ${year}`;
    default:
      return `${dayName}, ${monthName} ${day}, ${year}`;
  }
};

export default function CalendarScreen() {
  const { colors, isDark } = useTheme();
  const { visits, refreshVisits, t, settings } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  
  // Set calendar locale based on app language
  useEffect(() => {
    LocaleConfig.defaultLocale = settings.language || 'en';
  }, [settings.language]);
  
  const goToToday = () => {
    setCurrentMonth(todayStr);
    setSelectedDate(todayStr);
  };

  // Note: Removed useFocusEffect with refreshVisits() that caused race condition
  // AppContext already manages state updates properly

  // Generate marked dates with flag info for custom rendering
  // Supports multiple flags per day for overlapping visits (e.g., travel days)
  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    
    visits.forEach(visit => {
      const entryDate = parseISO(visit.entryDate);
      const exitDate = visit.exitDate ? parseISO(visit.exitDate) : new Date();
      
      const days = eachDayOfInterval({ start: entryDate, end: exitDate });
      const country = getCountryByCode(visit.countryCode);
      
      days.forEach((day) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        
        if (!marks[dateStr]) {
          // First visit for this date
          marks[dateStr] = {
            customStyles: {
              container: {},
              text: {},
            },
            flags: [{ flag: country?.flag || '🏳️', countryCode: visit.countryCode }],
            hasVisit: true,
          };
        } else if (marks[dateStr].hasVisit) {
          // Additional visit on same date - add flag if not already present
          const existingFlags = marks[dateStr].flags || [];
          const flagExists = existingFlags.some((f: any) => f.countryCode === visit.countryCode);
          if (!flagExists) {
            marks[dateStr].flags = [...existingFlags, { flag: country?.flag || '🏳️', countryCode: visit.countryCode }];
          }
        }
      });
    });
    
    // Add selection styling
    if (selectedDate && marks[selectedDate]) {
      marks[selectedDate] = {
        ...marks[selectedDate],
        selected: true,
      };
    } else if (selectedDate) {
      marks[selectedDate] = {
        selected: true,
        customStyles: {
          container: {},
          text: {},
        },
      };
    }
    
    return marks;
  }, [visits, selectedDate]);

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

  // Custom day component with flag emoji - supports multiple flags per day
  const renderDay = (date: any, state: any) => {
    if (!date) return <View style={[styles.emptyDay, { backgroundColor: colors.card }]} />;
    
    const dateStr = date.dateString;
    const marking = markedDates[dateStr];
    const isSelected = selectedDate === dateStr;
    const isToday = dateStr === format(new Date(), 'yyyy-MM-dd');
    const isDisabled = state === 'disabled';
    const flags = marking?.flags || [];
    
    return (
      <TouchableOpacity
        style={[
          styles.dayContainer,
          { backgroundColor: colors.card },
          isSelected && [styles.selectedDay, { backgroundColor: colors.primary }],
        ]}
        onPress={() => handleDayPress({ dateString: dateStr })}
        disabled={isDisabled}
      >
        {marking?.hasVisit ? (
          // Day with visit(s) - show flag(s)
          <View style={styles.flagDayContent}>
            {flags.length === 1 ? (
              // Single flag - show normally
              <Text style={[
                styles.flagEmoji,
                isSelected && styles.selectedFlagEmoji,
              ]}>
                {flags[0].flag}
              </Text>
            ) : flags.length === 2 ? (
              // Two flags - show side by side
              <View style={styles.doubleFlagContainer}>
                <Text style={[styles.smallFlagEmoji, isSelected && styles.selectedFlagEmoji]}>
                  {flags[0].flag}
                </Text>
                <Text style={[styles.smallFlagEmoji, isSelected && styles.selectedFlagEmoji]}>
                  {flags[1].flag}
                </Text>
              </View>
            ) : (
              // More than 2 flags - show first flag with count
              <View style={styles.multiFlagContainer}>
                <Text style={[styles.smallFlagEmoji, isSelected && styles.selectedFlagEmoji]}>
                  {flags[0].flag}
                </Text>
                <Text style={[styles.flagCount, { color: isSelected ? '#FFFFFF' : colors.primary }]}>
                  +{flags.length - 1}
                </Text>
              </View>
            )}
            <Text style={[
              styles.dayNumber,
              { color: isSelected ? '#FFFFFF' : colors.textSecondary },
              isToday && !isSelected && { color: colors.primary },
              isDisabled && { color: colors.textSecondary + '40' },
            ]}>
              {date.day}
            </Text>
          </View>
        ) : (
          // Day without visit - normal display
          <View style={styles.normalDayContent}>
            <Text style={[
              styles.dayText,
              isSelected && styles.selectedDayText,
              isToday && !isSelected && { color: colors.primary, fontWeight: '700' },
              isDisabled && { color: colors.textSecondary + '40' },
              { color: isSelected ? '#FFFFFF' : colors.text },
            ]}>
              {date.day}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('calendar')}</Text>
        <TouchableOpacity
          style={[styles.todayButton, { backgroundColor: colors.primary + '20' }]}
          onPress={goToToday}
        >
          <Ionicons name="today-outline" size={16} color={colors.primary} />
          <Text style={[styles.todayButtonText, { color: colors.primary }]}>{t('today')}</Text>
        </TouchableOpacity>
      </View>

      <Calendar
        key={`${isDark ? 'dark' : 'light'}-${currentMonth}`}
        current={currentMonth}
        style={[styles.calendar, { backgroundColor: colors.card }]}
        theme={{
          calendarBackground: colors.card,
          backgroundColor: colors.card,
          textSectionTitleColor: colors.textSecondary,
          arrowColor: colors.primary,
          monthTextColor: colors.text,
          dayTextColor: colors.text,
          textDisabledColor: colors.textSecondary + '40',
          todayTextColor: colors.primary,
          selectedDayBackgroundColor: colors.primary,
          selectedDayTextColor: '#FFFFFF',
          textMonthFontWeight: '700',
          textDayHeaderFontWeight: '600',
          textMonthFontSize: 18,
          textDayHeaderFontSize: 13,
        } as any}
        dayComponent={({ date, state }) => renderDay(date, state)}
        onDayPress={handleDayPress}
        onMonthChange={(month: { dateString: string }) => setCurrentMonth(month.dateString)}
        enableSwipeMonths
        hideExtraDays={false}
      />

      {/* Legend */}
      <View style={[styles.legend, { backgroundColor: colors.card }]}>
        <Text style={[styles.legendTitle, { color: colors.textSecondary }]}>{t('legend')}</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <Text style={styles.legendFlag}>🇺🇸</Text>
            <Text style={[styles.legendText, { color: colors.text }]}>{t('visitDay')}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.todayDot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.legendText, { color: colors.text }]}>{t('today')}</Text>
          </View>
        </View>
      </View>

      {/* Selected date info */}
      {selectedDate && (
        <View style={[styles.selectedInfo, { backgroundColor: colors.card }]}>
          <Text style={[styles.selectedDate, { color: colors.text }]}>
            {formatLocalizedDate(selectedDate, settings.language)}
          </Text>
          {selectedVisits.length > 0 ? (
            <View style={styles.selectedVisitPreview}>
              {selectedVisits.map((visit, index) => (
                <View key={visit.id} style={styles.visitPreviewItem}>
                  <Text style={styles.previewFlag}>{getCountryByCode(visit.countryCode)?.flag}</Text>
                  <Text style={[styles.previewCountry, { color: colors.text }]}>{getTranslatedCountryName(visit.countryCode, settings.language)}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[styles.noVisits, { color: colors.textSecondary }]}>
              {t('noVisitsOnDate')}
            </Text>
          )}
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
                  <View style={[styles.visitFlagBubble, { backgroundColor: colors.background }]}>
                    <Text style={styles.visitFlag}>{getCountryByCode(item.countryCode)?.flag}</Text>
                  </View>
                  <View style={styles.visitInfo}>
                    <Text style={[styles.visitCountry, { color: colors.text }]}>{getTranslatedCountryName(item.countryCode, settings.language)}</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
  },
  todayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  todayButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  calendar: {
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  emptyDay: {
    width: 44,
    height: 44,
  },
  dayContainer: {
    width: 44,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  selectedDay: {
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  flagDayContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagEmoji: {
    fontSize: 20,
    marginBottom: -2,
  },
  selectedFlagEmoji: {
    fontSize: 18,
  },
  smallFlagEmoji: {
    fontSize: 13,
  },
  doubleFlagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    marginBottom: -2,
  },
  multiFlagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: -2,
  },
  flagCount: {
    fontSize: 8,
    fontWeight: '700',
    marginLeft: 1,
  },
  dayNumber: {
    fontSize: 10,
    fontWeight: '600',
  },
  normalDayContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  legend: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
  },
  legendTitle: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  legendItems: {
    flexDirection: 'row',
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendFlag: {
    fontSize: 16,
  },
  todayDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 13,
  },
  selectedInfo: {
    margin: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  selectedDate: {
    fontSize: 17,
    fontWeight: '600',
  },
  selectedVisitPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
    justifyContent: 'center',
  },
  visitPreviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(0,122,255,0.1)',
    borderRadius: 16,
  },
  previewFlag: {
    fontSize: 18,
  },
  previewCountry: {
    fontSize: 13,
    fontWeight: '500',
  },
  noVisits: {
    fontSize: 14,
    marginTop: 6,
  },
  viewButton: {
    marginTop: 14,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  visitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    gap: 14,
  },
  visitFlagBubble: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visitFlag: {
    fontSize: 28,
  },
  visitInfo: {
    flex: 1,
  },
  visitCountry: {
    fontSize: 17,
    fontWeight: '600',
  },
  visitVisa: {
    fontSize: 13,
    marginTop: 3,
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
