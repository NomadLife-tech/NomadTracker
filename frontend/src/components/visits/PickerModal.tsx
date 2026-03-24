import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PickerModalProps<T extends string | number> {
  visible: boolean;
  onClose: () => void;
  title: string;
  items: T[];
  selectedItem: T | null;
  allItemsLabel: string;
  onSelectItem: (item: T | null) => void;
  renderItem?: (item: T) => string;
  colors: {
    card: string;
    border: string;
    text: string;
    primary: string;
    success?: string;
  };
  highlightColor?: string;
}

export function PickerModal<T extends string | number>({
  visible,
  onClose,
  title,
  items,
  selectedItem,
  allItemsLabel,
  onSelectItem,
  renderItem,
  colors,
  highlightColor,
}: PickerModalProps<T>) {
  const activeColor = highlightColor || colors.primary;

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={[styles.content, { backgroundColor: colors.card }]}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          
          {/* All Items Option */}
          <TouchableOpacity
            style={[styles.item, { borderBottomColor: colors.border }]}
            onPress={() => {
              onSelectItem(null);
              onClose();
            }}
          >
            <Text style={[styles.itemText, { color: activeColor }]}>{allItemsLabel}</Text>
          </TouchableOpacity>

          <ScrollView style={styles.scroll}>
            {items.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.item,
                  { borderBottomColor: colors.border },
                  selectedItem === item && { backgroundColor: activeColor + '15' },
                ]}
                onPress={() => {
                  onSelectItem(item);
                  onClose();
                }}
              >
                <Text
                  style={[
                    styles.itemText,
                    { color: selectedItem === item ? activeColor : colors.text },
                  ]}
                >
                  {renderItem ? renderItem(item) : String(item)}
                </Text>
                {selectedItem === item && (
                  <Ionicons name="checkmark" size={20} color={activeColor} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '80%',
    maxHeight: '60%',
    borderRadius: 16,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  scroll: {
    maxHeight: 300,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
  },
  itemText: {
    fontSize: 16,
  },
});
