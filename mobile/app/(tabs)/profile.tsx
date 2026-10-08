import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/auth/AuthContext';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { ConfirmDialog } from '../../src/components/ConfirmDialog';
import { colors, spacing, typography, shadows } from '../../src/theme';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
          </Text>
        </View>
        <Text style={styles.name}>{user?.fullName || 'User Profile'}</Text>
        <Text style={styles.email}>{user?.email || 'user@company.com'}</Text>
      </View>

      <Card style={styles.infoCard}>
        <View style={styles.infoRow}>
          <View style={styles.infoIconCircle}>
            <Ionicons name="person-outline" size={18} color={colors.primary} />
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>ACCOUNT NAME</Text>
            <Text style={styles.infoValue}>{user?.fullName || '-'}</Text>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.infoRow}>
          <View style={styles.infoIconCircle}>
            <Ionicons name="mail-outline" size={18} color={colors.steel} />
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>EMAIL ADDRESS</Text>
            <Text style={styles.infoValue}>{user?.email || '-'}</Text>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.infoRow}>
          <View style={styles.infoIconCircle}>
            <Ionicons name="shield-checkmark-outline" size={18} color={colors.status.completed} />
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>SECURITY</Text>
            <Text style={styles.infoValue}>Hardware Keystore JWT Protection</Text>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.infoRow}>
          <View style={styles.infoIconCircle}>
            <Ionicons name="phone-portrait-outline" size={18} color={colors.muted} />
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>APPLICATION VERSION</Text>
            <Text style={styles.infoValue}>Taskora v1.0.0 (Mobile Client)</Text>
          </View>
        </View>
      </Card>

      <Button
        title="Sign Out"
        variant="danger"
        size="md"
        onPress={() => setShowLogoutConfirm(true)}
        icon={<Ionicons name="log-out-outline" size={18} color={colors.white} />}
        style={styles.logoutBtn}
      />

      <ConfirmDialog
        visible={showLogoutConfirm}
        title="Sign Out"
        message="Are you sure you want to sign out of your Taskora workspace?"
        confirmTitle="Sign Out"
        isDestructive={true}
        isLoading={isLoggingOut}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl + 20,
    alignItems: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
    marginTop: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: 'rgba(37, 99, 235, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.elevated,
  },
  avatarText: {
    ...typography.h1,
    color: colors.white,
    fontSize: 32,
    fontWeight: '800',
  },
  name: {
    ...typography.h2,
    color: colors.white,
    marginBottom: 4,
    fontSize: 20,
    fontWeight: '700',
  },
  email: {
    ...typography.caption,
    color: colors.muted,
  },
  infoCard: {
    width: '100%',
    padding: spacing.lg,
    marginBottom: spacing.xxl,
    backgroundColor: colors.card,
    borderRadius: spacing.borderRadius,
    borderWidth: 1,
    borderColor: colors.ash,
    ...shadows.card,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  infoIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.subtle,
    borderWidth: 1,
    borderColor: colors.ash,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    ...typography.micro,
    color: colors.muted,
    marginBottom: 2,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  infoValue: {
    ...typography.captionBold,
    color: colors.white,
    fontSize: 14,
  },
  separator: {
    height: 1,
    backgroundColor: colors.ash,
    marginVertical: spacing.xs,
  },
  logoutBtn: {
    width: '100%',
  },
});
