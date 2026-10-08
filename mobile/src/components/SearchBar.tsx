import React, { useState, useEffect } from 'react';
import { View, TextInput, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';

export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: ViewStyle;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search...',
  style,
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (internalValue !== value) {
        onChangeText(internalValue);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [internalValue, value, onChangeText]);

  return (
    <View style={[styles.container, style]}>
      <Ionicons name="search-outline" size={18} color={colors.muted} style={styles.icon} />
      <TextInput
        value={internalValue}
        onChangeText={setInternalValue}
        placeholder={placeholder}
        placeholderTextColor={`${colors.muted}80`}
        style={styles.input}
        accessibilityLabel={placeholder}
        accessibilityRole="search"
      />
      {internalValue.length > 0 && (
        <Pressable
          onPress={() => {
            setInternalValue('');
            onChangeText('');
          }}
          style={styles.clearButton}
          accessibilityRole="button"
          accessibilityLabel="Clear search input"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close-circle" size={18} color={colors.muted} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.subtle,
    borderWidth: 1,
    borderColor: colors.ash,
    borderRadius: spacing.borderRadius,
    height: spacing.touchTarget,
    paddingHorizontal: spacing.md,
  },
  icon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.ink,
    height: '100%',
  },
  clearButton: {
    padding: spacing.xs,
  },
});
