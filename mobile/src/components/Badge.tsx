import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, typography } from '../theme';

export interface BadgeProps {
  label: string;
  variant?: 'status' | 'priority' | 'neutral';
  style?: ViewStyle;
}

export function Badge({ label, variant = 'neutral', style }: BadgeProps) {
  const normalized = label.trim().toLowerCase();

  let textColor: string = colors.muted;
  let bgColor: string = 'rgba(255, 255, 255, 0.06)';
  let borderColor: string = 'rgba(255, 255, 255, 0.1)';

  if (variant === 'status') {
    if (normalized === 'completed') {
      textColor = colors.status.completed;
      bgColor = 'rgba(16, 185, 129, 0.12)';
      borderColor = 'rgba(16, 185, 129, 0.25)';
    } else if (normalized === 'in progress') {
      textColor = colors.status.inProgress;
      bgColor = 'rgba(56, 189, 248, 0.12)';
      borderColor = 'rgba(56, 189, 248, 0.25)';
    } else if (normalized === 'not started') {
      textColor = colors.status.notStarted;
      bgColor = 'rgba(148, 163, 184, 0.12)';
      borderColor = 'rgba(148, 163, 184, 0.25)';
    } else {
      textColor = colors.status.pending;
      bgColor = 'rgba(245, 158, 11, 0.12)';
      borderColor = 'rgba(245, 158, 11, 0.25)';
    }
  } else if (variant === 'priority') {
    if (normalized === 'high') {
      textColor = colors.priority.high;
      bgColor = 'rgba(239, 68, 68, 0.12)';
      borderColor = 'rgba(239, 68, 68, 0.25)';
    } else if (normalized === 'medium') {
      textColor = colors.priority.medium;
      bgColor = 'rgba(245, 158, 11, 0.12)';
      borderColor = 'rgba(245, 158, 11, 0.25)';
    } else {
      textColor = colors.priority.low;
      bgColor = 'rgba(20, 184, 166, 0.12)';
      borderColor = 'rgba(20, 184, 166, 0.25)';
    }
  }

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: bgColor, borderColor },
        style,
      ]}
    >
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  label: {
    ...typography.micro,
    fontWeight: '700',
    fontSize: 10,
    letterSpacing: 0.4,
  },
});
