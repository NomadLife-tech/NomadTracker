import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { GoalProgress } from '../../utils/statisticsUtils';

interface GoalTrackerCardProps {
  progress: GoalProgress;
  onTargetChange: (target: number) => void;
  t: (key: string) => string;
}

export function GoalTrackerCard({ progress, onTargetChange, t }: GoalTrackerCardProps) {
  const { colors } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [inputValue, setInputValue] = useState(progress.targetCountries.toString());

  const handleSave = () => {
    const newTarget = parseInt(inputValue, 10);
    if (newTarget > 0 && newTarget <= 195) {
      onTargetChange(newTarget);
    }
    setShowModal(false);
  };

  const progressColor = 
    progress.progressPercentage >= 100 ? colors.success :
    progress.progressPercentage >= 50 ? colors.primary :
    colors.warning;

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="flag" size={20} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>
            {t('countryGoal')}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: colors.primary + '15' }]}
          onPress={() => setShowModal(true)}
        >
          <Ionicons name="pencil" size={14} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Progress Circle */}
      <View style={styles.progressSection}>
        <View style={styles.circleContainer}>
          <View style={[styles.progressCircle, { borderColor: colors.border }]}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  borderColor: progressColor,
                  transform: [{ rotate: `${(progress.progressPercentage / 100) * 360}deg` }],
                }
              ]} 
            />
            <View style={[styles.circleInner, { backgroundColor: colors.card }]}>
              <Text style={[styles.progressNumber, { color: progressColor }]}>
                {progress.visitedCountries}
              </Text>
              <Text style={[styles.progressTarget, { color: colors.textSecondary }]}>
                / {progress.targetCountries}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.statsColumn}>
          <View style={styles.statRow}>
            <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            <Text style={[styles.statText, { color: colors.text }]}>
              {progress.visitedCountries} {t('visited')}
            </Text>
          </View>
          <View style={styles.statRow}>
            <Ionicons name="globe-outline" size={18} color={colors.textSecondary} />
            <Text style={[styles.statText, { color: colors.text }]}>
              {progress.remainingCountries} {t('toGo')}
            </Text>
          </View>
          <View style={styles.statRow}>
            <Ionicons name="trending-up" size={18} color={progressColor} />
            <Text style={[styles.statText, { color: progressColor }]}>
              {progress.progressPercentage.toFixed(0)}% {t('complete')}
            </Text>
          </View>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
        <View 
          style={[
            styles.progressBarFill, 
            { 
              backgroundColor: progressColor,
              width: `${Math.min(100, progress.progressPercentage)}%`,
            }
          ]} 
        />
      </View>

      {progress.progressPercentage >= 100 && (
        <View style={[styles.achievedBadge, { backgroundColor: colors.success + '15' }]}>
          <Ionicons name="trophy" size={16} color={colors.success} />
          <Text style={[styles.achievedText, { color: colors.success }]}>
            {t('goalAchieved')}
          </Text>
        </View>
      )}

      {/* Edit Modal */}
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {t('setCountryGoal')}
            </Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              value={inputValue}
              onChangeText={setInputValue}
              keyboardType="number-pad"
              maxLength={3}
              placeholder="50"
              placeholderTextColor={colors.textSecondary}
            />
            <Text style={[styles.hint, { color: colors.textSecondary }]}>
              {t('goalHint')}
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.border }]}
                onPress={() => setShowModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>
                  {t('cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleSave}
              >
                <Text style={[styles.modalButtonText, { color: '#FFF' }]}>
                  {t('save')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  editButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 16,
  },
  circleContainer: {
    alignItems: 'center',
  },
  progressCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  progressFill: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 8,
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  circleInner: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressNumber: {
    fontSize: 28,
    fontWeight: '700',
  },
  progressTarget: {
    fontSize: 14,
  },
  statsColumn: {
    flex: 1,
    gap: 10,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statText: {
    fontSize: 14,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  achievedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  achievedText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  hint: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
