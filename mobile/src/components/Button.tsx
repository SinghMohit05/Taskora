import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  PressableProps,
} from 'react-native';
import { colors, spacing, typography, shadows } from '../theme';

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon,
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  const getContainerStyle = (pressed: boolean): ViewStyle => {
    let base: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: spacing.borderRadius,
      minHeight: spacing.touchTarget,
    };

    // Size
    if (size === 'sm') {
      base = { ...base, paddingVertical: 8, paddingHorizontal: 14, minHeight: 38, borderRadius: 12 };
    } else if (size === 'lg') {
      base = { ...base, paddingVertical: 14, paddingHorizontal: 24, minHeight: 52 };
    } else {
      base = { ...base, paddingVertical: 12, paddingHorizontal: 18, minHeight: 48 };
    }

    // Variant
    switch (variant) {
      case 'primary':
        base = {
          ...base,
          backgroundColor: pressed ? colors.primaryPressed : colors.primary,
          ...shadows.soft,
        };
        break;
      case 'secondary':
        base = {
          ...base,
          backgroundColor: pressed ? colors.subtleHover : colors.card,
          borderWidth: 1,
          borderColor: colors.ash,
          ...shadows.soft,
        };
        break;
      case 'outline':
        base = {
          ...base,
          backgroundColor: pressed ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
          borderWidth: 1,
          borderColor: colors.ashStrong,
        };
        break;
      case 'danger':
        base = {
          ...base,
          backgroundColor: pressed ? colors.crimsonHover : colors.crimson,
          ...shadows.soft,
        };
        break;
      case 'ghost':
        base = {
          ...base,
          backgroundColor: pressed ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
        };
        break;
    }

    if (isDisabled) {
      base.opacity = 0.5;
    }

    return base;
  };

  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case 'primary':
      case 'danger':
        return { color: colors.white };
      case 'secondary':
      case 'outline':
      case 'ghost':
        return { color: colors.white };
    }
  };

  return (
    <Pressable
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: isLoading }}
      accessibilityLabel={title}
      style={({ pressed }) => [getContainerStyle(pressed), style]}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={colors.white}
          style={styles.spinner}
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text style={[styles.text, getTextStyle(), icon ? styles.textWithIcon : null]}>
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  spinner: {
    marginRight: spacing.sm,
  },
  text: {
    ...typography.captionBold,
    textAlign: 'center',
    fontWeight: '600',
  },
  textWithIcon: {
    marginLeft: spacing.sm,
  },
});
