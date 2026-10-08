import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  Pressable,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  isPassword?: boolean;
  leftIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export const Input = React.forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      helperText,
      isPassword = false,
      leftIcon,
      containerStyle,
      style,
      secureTextEntry,
      ...props
    },
    ref
  ) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    return (
      <View style={[styles.container, containerStyle]}>
        {label && <Text style={styles.label}>{label}</Text>}

        <View
          style={[
            styles.inputWrapper,
            isFocused && styles.inputWrapperFocused,
            Boolean(error) && styles.inputWrapperError,
          ]}
        >
          {leftIcon ? <View style={styles.leftIconContainer}>{leftIcon as any}</View> : null}

          <TextInput
            ref={ref}
            style={[styles.input, style]}
            placeholderTextColor={`${colors.muted}80`}
            secureTextEntry={isPassword ? !isPasswordVisible : secureTextEntry}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            accessibilityLabel={label || props.placeholder}
            aria-invalid={Boolean(error)}
            {...props}
          />

          {isPassword && (
            <Pressable
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              style={styles.eyeIcon}
              accessibilityRole="button"
              accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={colors.muted}
              />
            </Pressable>
          )}
        </View>

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : helperText ? (
          <Text style={styles.helperText}>{helperText}</Text>
        ) : null}
      </View>
    );
  }
);

Input.displayName = 'Input';

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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.subtle,
    borderWidth: 1,
    borderColor: colors.ash,
    borderRadius: spacing.borderRadius,
    minHeight: spacing.touchTarget,
    paddingHorizontal: spacing.md,
  },
  leftIconContainer: {
    marginRight: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWrapperFocused: {
    borderColor: colors.primary,
    backgroundColor: `${colors.cardElevated}`,
  },
  inputWrapperError: {
    borderColor: colors.crimson,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.ink,
    paddingVertical: spacing.sm,
  },
  eyeIcon: {
    padding: spacing.xs,
  },
  errorText: {
    ...typography.micro,
    color: colors.crimson,
    marginTop: spacing.xs,
  },
  helperText: {
    ...typography.caption,
    color: colors.muted,
    marginTop: spacing.xs,
  },
});
