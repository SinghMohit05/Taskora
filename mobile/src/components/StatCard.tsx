import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, typography, shadows } from '../theme';

export interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  iconBgColor?: string;
  subtext?: string;
  subtextColor?: string;
  style?: ViewStyle;
}

export function StatCard({
  title,
  value,
  icon,
  iconBgColor = colors.primaryTint,
  subtext,
  subtextColor = colors.muted,
  style,
}: StatCardProps) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.topRow}>
        <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
          {icon as any}
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.value}>{value}</Text>
      </View>

      {subtext ? (
        <View style={styles.subtextRow}>
          <Text style={[styles.subtext, { color: subtextColor }]} numberOfLines={1}>
            {subtext}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: spacing.borderRadius + 2,
    borderWidth: 1,
    borderColor: colors.ash,
    padding: spacing.md + 2,
    justifyContent: 'space-between',
    minHeight: 120,
    ...shadows.card,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    marginTop: 2,
  },
  title: {
    ...typography.micro,
    color: colors.muted,
    fontSize: 11,
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  value: {
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -0.5,
  },
  subtextRow: {
    marginTop: spacing.xs + 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtext: {
    ...typography.micro,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
