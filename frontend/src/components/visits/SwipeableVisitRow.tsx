import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Visit } from '../../types';
import { isCurrentVisit, calculateDaysInCountry, formatDate } from '../../utils/dateUtils';
import { getCountryByCode } from '../../constants/countries';

interface SwipeableVisitRowProps {
  visit: Visit;
  onDelete: () => void;
  onPress: () => void;
  colors: {
    card: string;
    text: string;
    textSecondary: string;
    primary: string;
    success: string;
    danger: string;
  };
  t: (key: string) => string;
}

export function SwipeableVisitRow({ visit, onDelete, onPress, colors, t }: SwipeableVisitRowProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const isActive = isCurrentVisit(visit);
  const daysCount = calculateDaysInCountry(visit.entryDate, visit.exitDate);
  const country = getCountryByCode(visit.countryCode);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          translateX.setValue(Math.max(-80, gestureState.dx));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -40) {
          Animated.spring(translateX, {
            toValue: -80,
            useNativeDriver: true,
          }).start();
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const closeSwipe = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.swipeContainer}>
      <TouchableOpacity
        style={[styles.deleteAction, { backgroundColor: colors.danger }]}
        onPress={() => {
          closeSwipe();
          onDelete();
        }}
      >
        <Ionicons name="trash" size={24} color="#FFFFFF" />
      </TouchableOpacity>
      <Animated.View
        style={[{ transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={[styles.visitItem, { backgroundColor: colors.card }]}
          onPress={onPress}
          activeOpacity={0.7}
        >
          <Text style={styles.flag}>{country?.flag}</Text>
          <View style={styles.visitInfo}>
            <View style={styles.visitHeader}>
              <Text style={[styles.visitCountry, { color: colors.text }]}>{visit.countryName}</Text>
              {isActive && (
                <View style={[styles.activeBadge, { backgroundColor: colors.success + '20' }]}>
                  <Text style={[styles.activeBadgeText, { color: colors.success }]}>{t('active')}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.visitVisa, { color: colors.textSecondary }]}>{visit.visaType}</Text>
            <View style={styles.visitDates}>
              <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
              <Text style={[styles.visitDateText, { color: colors.textSecondary }]}>
                {formatDate(visit.entryDate, 'MMM d, yyyy')}
                {visit.exitDate && ` - ${formatDate(visit.exitDate, 'MMM d, yyyy')}`}
              </Text>
            </View>
          </View>
          <View style={styles.visitDaysContainer}>
            <Text style={[styles.visitDays, { color: colors.primary }]}>{daysCount}</Text>
            <Text style={[styles.visitDaysLabel, { color: colors.textSecondary }]}>{t('days')}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  swipeContainer: {
    marginBottom: 12,
  },
  deleteAction: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  flag: {
    fontSize: 36,
  },
  visitInfo: {
    flex: 1,
  },
  visitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  visitCountry: {
    fontSize: 17,
    fontWeight: '600',
  },
  activeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  visitVisa: {
    fontSize: 13,
    marginTop: 2,
  },
  visitDates: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  visitDateText: {
    fontSize: 12,
  },
  visitDaysContainer: {
    alignItems: 'center',
  },
  visitDays: {
    fontSize: 24,
    fontWeight: '700',
  },
  visitDaysLabel: {
    fontSize: 11,
  },
});
