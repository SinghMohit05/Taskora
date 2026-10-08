import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing } from '../theme';

export interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}: SkeletonProps) {
  const opacityAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.75,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacityAnim]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width as any,
          height,
          borderRadius,
          opacity: opacityAnim,
        },
        style,
      ]}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <View style={styles.cardSkeleton}>
      <View style={{ flex: 1 }}>
        <Skeleton width="60%" height={12} style={{ marginBottom: 8 }} />
        <Skeleton width="40%" height={24} />
      </View>
      <Skeleton width={38} height={38} borderRadius={12} />
    </View>
  );
}

export function ProjectCardSkeleton() {
  return (
    <View style={styles.projectSkeleton}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
        <Skeleton width="60%" height={18} />
        <Skeleton width={70} height={20} borderRadius={6} />
      </View>
      <Skeleton width="100%" height={14} style={{ marginBottom: 6 }} />
      <Skeleton width="80%" height={14} style={{ marginBottom: 16 }} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Skeleton width="45%" height={12} />
        <Skeleton width="20%" height={12} />
      </View>
    </View>
  );
}

export function TaskRowSkeleton() {
  return (
    <View style={styles.taskSkeleton}>
      <Skeleton width={22} height={22} borderRadius={7} style={{ marginRight: 12 }} />
      <View style={{ flex: 1 }}>
        <Skeleton width="70%" height={16} style={{ marginBottom: 6 }} />
        <Skeleton width="40%" height={12} />
      </View>
      <Skeleton width={60} height={20} borderRadius={6} />
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: 'rgba(255, 255, 255, 0.09)',
  },
  cardSkeleton: {
    backgroundColor: colors.card,
    borderRadius: spacing.borderRadius + 2,
    borderWidth: 1,
    borderColor: colors.ash,
    padding: spacing.md + 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 110,
  },
  projectSkeleton: {
    backgroundColor: colors.card,
    borderRadius: spacing.borderRadius,
    borderWidth: 1,
    borderColor: colors.ash,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  taskSkeleton: {
    backgroundColor: colors.card,
    borderRadius: spacing.borderRadius,
    borderWidth: 1,
    borderColor: colors.ash,
    padding: spacing.md + 2,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
});
