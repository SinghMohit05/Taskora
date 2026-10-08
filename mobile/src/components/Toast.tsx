import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors, spacing, typography, shadows } from '../theme';

export interface ToastOptions {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
}

type ToastListener = (options: ToastOptions) => void;
const listeners: ToastListener[] = [];

export function showToast(options: ToastOptions) {
  listeners.forEach((listener) => listener(options));
}

export function ToastContainer() {
  const [toast, setToast] = useState<ToastOptions | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const handleToast: ToastListener = (options) => {
      setToast(options);
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.delay(options.duration || 3000),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setToast(null);
      });
    };

    listeners.push(handleToast);
    return () => {
      const idx = listeners.indexOf(handleToast);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  }, [fadeAnim]);

  if (!toast) return null;

  const bgColors = {
    success: colors.status.completed,
    error: colors.crimson,
    info: colors.forge,
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: bgColors[toast.type || 'info'], opacity: fadeAnim },
      ]}
      pointerEvents="none"
    >
      <Text style={styles.text}>{toast.message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80,
    left: spacing.lg,
    right: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.borderRadius,
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.elevated,
  },
  text: {
    ...typography.captionBold,
    color: colors.white,
    textAlign: 'center',
  },
});
