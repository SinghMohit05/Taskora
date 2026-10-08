import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '@taskforge/shared';
import { useAuth } from '../../src/auth/AuthContext';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { BrandLogo } from '../../src/components/BrandLogo';
import { colors, spacing, typography, shadows } from '../../src/theme';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const { login, sessionExpiredMessage, clearSessionExpiredMessage } = useAuth();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setServerError(null);
    clearSessionExpiredMessage();

    try {
      await login(data);
      router.replace('/(tabs)');
    } catch (err: any) {
      setServerError(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Brand Header */}
          <View style={styles.brandContainer}>
            <BrandLogo size="lg" showText={true} showTagline={true} layout="vertical" />
          </View>

          {/* Screen Title */}
          <View style={styles.header}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>
              Sign in to access your executive workspace
            </Text>
          </View>

          {/* Session Expired Banner */}
          {sessionExpiredMessage ? (
            <View style={styles.sessionExpiredBanner}>
              <Ionicons name="time-outline" size={18} color={colors.primary} />
              <Text style={styles.sessionExpiredText}>{sessionExpiredMessage}</Text>
            </View>
          ) : null}

          {/* Server Error Banner */}
          {serverError ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={18} color={colors.crimson} />
              <Text style={styles.errorBannerText}>{serverError}</Text>
            </View>
          ) : null}

          {/* Form Card */}
          <View style={styles.formCard}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="EMAIL ADDRESS"
                  placeholder="name@company.com"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={errors.email?.message}
                  leftIcon={
                    <Ionicons name="mail-outline" size={18} color={colors.muted} />
                  }
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="PASSWORD"
                  placeholder="Enter your password"
                  isPassword
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={errors.password?.message}
                  leftIcon={
                    <Ionicons name="lock-closed-outline" size={18} color={colors.muted} />
                  }
                />
              )}
            />

            <Button
              title="Sign In"
              onPress={handleSubmit(onSubmit)}
              isLoading={isLoading}
              icon={<Ionicons name="arrow-forward" size={17} color={colors.white} />}
              style={styles.submitBtn}
            />
          </View>

          {/* Register Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Pressable
              onPress={() => router.push('/(auth)/register')}
              accessibilityRole="button"
              accessibilityLabel="Create account"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.linkText}>Create an account</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    fontSize: 26,
    color: colors.white,
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
  },
  subtitle: {
    ...typography.caption,
    color: colors.muted,
    textAlign: 'center',
    fontSize: 14,
  },
  sessionExpiredBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryTint,
    borderRadius: spacing.borderRadius,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    gap: spacing.sm,
  },
  sessionExpiredText: {
    ...typography.captionBold,
    color: colors.decorativeEmber,
    flex: 1,
    fontSize: 13,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorTint,
    borderRadius: spacing.borderRadius,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    gap: spacing.sm,
  },
  errorBannerText: {
    ...typography.captionBold,
    color: colors.crimson,
    flex: 1,
    fontSize: 13,
  },
  formCard: {
    backgroundColor: colors.card,
    borderRadius: spacing.borderRadius + 2,
    borderWidth: 1,
    borderColor: colors.ash,
    padding: spacing.xl,
    ...shadows.card,
  },
  submitBtn: {
    marginTop: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  footerText: {
    ...typography.caption,
    color: colors.muted,
    fontSize: 14,
  },
  linkText: {
    ...typography.captionBold,
    color: colors.decorativeEmber,
    fontSize: 14,
    fontWeight: '700',
  },
});
