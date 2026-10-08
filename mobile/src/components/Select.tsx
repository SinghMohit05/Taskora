import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  FlatList,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, shadows } from '../theme';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps {
  label?: string;
  value?: string;
  options: SelectOption[];
  onSelect: (value: string) => void;
  placeholder?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export function Select({
  label,
  value,
  options,
  onSelect,
  placeholder = 'Select an option',
  error,
  containerStyle,
}: SelectProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <Pressable
        onPress={() => setModalVisible(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label || 'Select'}: ${selectedOption?.label || placeholder}`}
        style={[styles.selectBox, Boolean(error) && styles.selectBoxError]}
      >
        <Text style={[styles.valueText, !selectedOption && styles.placeholderText]}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.muted} />
      </Pressable>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || 'Select'}</Text>
              <Pressable
                onPress={() => setModalVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Close select modal"
                style={styles.closeButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={20} color={colors.white} />
              </Pressable>
            </View>

            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => {
                const isSelected = item.value === value;
                return (
                  <Pressable
                    onPress={() => {
                      onSelect(item.value);
                      setModalVisible(false);
                    }}
                    style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Text
                      style={[styles.optionText, isSelected && styles.optionTextSelected]}
                    >
                      {item.label}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark" size={20} color={colors.primary} />
                    )}
                  </Pressable>
                );
              }}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: spacing.md,
  },
  label: {
    ...typography.micro,
    color: colors.muted,
    marginBottom: spacing.xs,
    letterSpacing: 0.6,
  },
  selectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.subtle,
    borderWidth: 1,
    borderColor: colors.ash,
    borderRadius: spacing.borderRadius,
    minHeight: spacing.touchTarget,
    paddingHorizontal: spacing.md,
  },
  selectBoxError: {
    borderColor: colors.crimson,
  },
  valueText: {
    ...typography.body,
    color: colors.ink,
  },
  placeholderText: {
    color: `${colors.muted}80`,
  },
  errorText: {
    ...typography.micro,
    color: colors.crimson,
    marginTop: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: spacing.borderRadius * 1.5,
    borderTopRightRadius: spacing.borderRadius * 1.5,
    borderWidth: 1,
    borderColor: colors.ash,
    maxHeight: '60%',
    paddingBottom: spacing.xxl,
    ...shadows.elevated,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.ash,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.white,
  },
  closeButton: {
    padding: spacing.xs,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.ash,
    minHeight: spacing.touchTarget,
  },
  optionRowSelected: {
    backgroundColor: colors.primaryTint,
  },
  optionText: {
    ...typography.body,
    color: colors.ink,
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
});
