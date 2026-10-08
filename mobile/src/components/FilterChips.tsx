import React from 'react';
import { ScrollView, Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, typography } from '../theme';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterChipsProps {
  options: FilterOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  style?: ViewStyle;
}

export function FilterChips({
  options,
  selectedValue,
  onSelect,
  style,
}: FilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.container, style]}
    >
      {options.map((opt) => {
        const isSelected = opt.value === selectedValue;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onSelect(opt.value)}
            style={[styles.chip, isSelected && styles.chipSelected]}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`Filter: ${opt.label}`}
          >
            <Text style={[styles.text, isSelected && styles.textSelected]}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.ash,
    minHeight: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  text: {
    ...typography.captionBold,
    fontSize: 12,
    color: colors.muted,
  },
  textSelected: {
    color: colors.white,
    fontWeight: '700',
  },
});
