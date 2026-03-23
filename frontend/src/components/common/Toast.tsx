import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToast } from '../../contexts/ToastContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export function Toast() {
  const { toasts } = useToast();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  if (toasts.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return 'checkmark-circle';
      case 'error': return 'close-circle';
      default: return 'information-circle';
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'success': return colors.success;
      case 'error': return colors.danger;
      default: return colors.primary;
    }
  };

  return (
    <View style={[styles.container, { top: insets.top + 10 }]}>
      {toasts.map((toast) => (
        <Animated.View
          key={toast.id}
          style={[
            styles.toast,
            { backgroundColor: colors.card, borderLeftColor: getColor(toast.type) },
          ]}
        >
          <Ionicons name={getIcon(toast.type) as any} size={24} color={getColor(toast.type)} />
          <Text style={[styles.message, { color: colors.text }]} numberOfLines={2}>
            {toast.message}
          </Text>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderLeftWidth: 4,
    width: '100%',
  },
  message: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '500',
  },
});
