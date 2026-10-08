import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDashboard } from '../../src/hooks/useDashboard';
import { useAuth } from '../../src/auth/AuthContext';
import { StatCard } from '../../src/components/StatCard';
import { StatCardSkeleton } from '../../src/components/Skeleton';
import { ErrorState } from '../../src/components/ErrorState';
import { Badge } from '../../src/components/Badge';
import { Button } from '../../src/components/Button';
import { colors, spacing, typography, shadows } from '../../src/theme';
import { useRouter } from 'expo-router';
import { formatDate } from '../../src/utils/date';

export default function DashboardScreen() {
  const { data: stats, isLoading, isError, refetch, isRefetching } = useDashboard();
  const { user } = useAuth();
  const router = useRouter();

  // User Greeting
  const firstName = user?.fullName ? user.fullName.split(' ')[0] : 'Executive';
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const formattedDate = now.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  // Rates computed from real stats
  const totalTasks = stats?.totalTasks || 0;
  const completedTasks = stats?.completedTasks || 0;
  const pendingTasks = stats?.pendingTasks || 0;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const pendingRate = totalTasks > 0 ? Math.round((pendingTasks / totalTasks) * 100) : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      {/* ─── 1. Executive Header ────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingTitle}>
            {greeting}, {firstName} 👋
          </Text>
          <Text style={styles.greetingSubtitle}>
            Here's what's happening with your workspace today.
          </Text>
        </View>

        <View style={styles.datePill}>
          <Ionicons name="calendar-outline" size={13} color={colors.muted} />
          <Text style={styles.dateText}>{formattedDate}</Text>
        </View>
      </View>

      {/* ─── 2. Quick Actions ──────────────────────────────────────────────── */}
      <View style={styles.actionsRow}>
        <Button
          title="New Project"
          variant="secondary"
          size="sm"
          onPress={() => router.push('/project/new')}
          icon={<Ionicons name="folder-outline" size={16} color={colors.white} />}
          style={styles.actionBtn}
        />
        <Button
          title="New Task"
          variant="primary"
          size="sm"
          onPress={() => router.push('/task/new')}
          icon={<Ionicons name="add" size={18} color={colors.white} />}
          style={styles.actionBtn}
        />
      </View>

      {/* ─── 3. KPI Statistics Cards (5 Required Cards) ────────────────────── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <Text style={styles.sectionSubtitle}>Real-time executive metrics</Text>
      </View>

      {isLoading ? (
        <View style={styles.statsGrid}>
          {Array.from({ length: 5 }).map((_, i) => (
            <View key={i} style={i === 4 ? styles.gridItemFull : styles.gridItem}>
              <StatCardSkeleton />
            </View>
          ))}
        </View>
      ) : isError || !stats ? (
        <ErrorState onRetry={refetch} />
      ) : (
        <View style={styles.statsGrid}>
          {/* Card 1: Total Projects */}
          <View style={styles.gridItem}>
            <StatCard
              title="Total Projects"
              value={stats.totalProjects}
              icon={<Ionicons name="folder-outline" size={20} color={colors.primary} />}
              iconBgColor={colors.primaryTint}
              subtext={`↗ ${stats.projectsInProgress} in progress`}
              subtextColor={colors.status.inProgress}
            />
          </View>

          {/* Card 2: Total Tasks */}
          <View style={styles.gridItem}>
            <StatCard
              title="Total Tasks"
              value={stats.totalTasks}
              icon={<Ionicons name="checkbox-outline" size={20} color={colors.purpleAccent} />}
              iconBgColor={colors.purpleTint}
              subtext={`↗ ${pendingTasks} active`}
              subtextColor={colors.purpleAccent}
            />
          </View>

          {/* Card 3: Completed Tasks */}
          <View style={styles.gridItem}>
            <StatCard
              title="Completed"
              value={stats.completedTasks}
              icon={<Ionicons name="checkmark-done" size={20} color={colors.status.completed} />}
              iconBgColor="rgba(16, 185, 129, 0.15)"
              subtext={`↗ ${completionRate}% rate`}
              subtextColor={colors.status.completed}
            />
          </View>

          {/* Card 4: Pending Tasks */}
          <View style={styles.gridItem}>
            <StatCard
              title="Pending"
              value={stats.pendingTasks}
              icon={<Ionicons name="time-outline" size={20} color={colors.status.pending} />}
              iconBgColor="rgba(245, 158, 11, 0.15)"
              subtext={`• ${pendingRate}% remaining`}
              subtextColor={colors.status.pending}
            />
          </View>

          {/* Card 5: Projects In Progress */}
          <View style={[styles.gridItem, styles.gridItemFull]}>
            <StatCard
              title="Projects In Progress"
              value={stats.projectsInProgress}
              icon={<Ionicons name="sync-outline" size={20} color={colors.steel} />}
              iconBgColor="rgba(56, 189, 248, 0.15)"
              subtext="Active pipeline workflows"
              subtextColor={colors.steel}
            />
          </View>
        </View>
      )}

      {/* ─── 4. Velocity & Completion Summary Card ─────────────────────────── */}
      {stats && stats.totalTasks > 0 ? (
        <View style={styles.velocityCard}>
          <View style={styles.velocityHeader}>
            <View>
              <Text style={styles.velocityTitle}>Task Completion Rate</Text>
              <Text style={styles.velocitySubtitle}>
                {completedTasks} completed out of {totalTasks} total tasks
              </Text>
            </View>
            <View style={styles.velocityBadge}>
              <Text style={styles.velocityBadgeText}>{completionRate}%</Text>
            </View>
          </View>

          <View style={styles.velocityProgressTrack}>
            <View
              style={[
                styles.velocityProgressFill,
                { width: `${completionRate}%` },
              ]}
            />
          </View>
        </View>
      ) : null}

      {/* ─── 5. Recent Projects Section ───────────────────────────────────── */}
      <View style={[styles.sectionHeader, { marginTop: spacing.xl }]}>
        <View>
          <Text style={styles.sectionTitle}>Recent Projects</Text>
          <Text style={styles.sectionSubtitle}>Latest active deliverables</Text>
        </View>
        <Pressable
          onPress={() => router.push('/(tabs)/projects')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.viewAllText}>View all</Text>
        </Pressable>
      </View>

      {stats?.recentProjects && stats.recentProjects.length > 0 ? (
        <View style={styles.recentList}>
          {stats.recentProjects.map((proj) => (
            <Pressable
              key={proj.id}
              style={({ pressed }) => [
                styles.recentItem,
                pressed && styles.recentItemPressed,
              ]}
              onPress={() => router.push(`/(tabs)/projects/${proj.id}` as any)}
              accessibilityRole="button"
              accessibilityLabel={`View ${proj.name}`}
            >
              <View style={styles.recentIconWrapper}>
                <Ionicons name="folder-outline" size={17} color={colors.primary} />
              </View>

              <View style={styles.recentItemInfo}>
                <Text style={styles.recentItemName} numberOfLines={1}>
                  {proj.name}
                </Text>
                <Text style={styles.recentItemDate}>
                  Created {formatDate(proj.createdAt)}
                </Text>
              </View>

              <View style={styles.recentItemRight}>
                <Badge label={proj.status} variant="status" />
                <Ionicons name="chevron-forward" size={16} color={colors.muted} />
              </View>
            </Pressable>
          ))}
        </View>
      ) : (
        <View style={styles.emptyRecent}>
          <Ionicons name="folder-open-outline" size={32} color={colors.muted} />
          <Text style={styles.emptyRecentTitle}>No projects yet</Text>
          <Text style={styles.emptyRecentText}>
            Create your first project to start tracking milestones.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl + 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  greetingContainer: {
    flex: 1,
  },
  greetingTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -0.5,
  },
  greetingSubtitle: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 3,
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.ash,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.inkSecondary,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  actionBtn: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    fontSize: 18,
    color: colors.white,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 1,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.decorativeEmber,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  gridItem: {
    width: '47.5%',
  },
  gridItemFull: {
    width: '100%',
  },
  velocityCard: {
    backgroundColor: colors.card,
    borderRadius: spacing.borderRadius,
    borderWidth: 1,
    borderColor: colors.ash,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  velocityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  velocityTitle: {
    ...typography.captionBold,
    color: colors.white,
    fontSize: 14,
  },
  velocitySubtitle: {
    ...typography.caption,
    color: colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
  velocityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  velocityBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.status.completed,
  },
  velocityProgressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.subtle,
    overflow: 'hidden',
  },
  velocityProgressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.status.completed,
  },
  recentList: {
    backgroundColor: colors.card,
    borderRadius: spacing.borderRadius,
    borderWidth: 1,
    borderColor: colors.ash,
    overflow: 'hidden',
    ...shadows.card,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.ash,
  },
  recentItemPressed: {
    backgroundColor: colors.cardElevated,
  },
  recentIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.25)',
  },
  recentItemInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  recentItemName: {
    ...typography.captionBold,
    color: colors.white,
    fontSize: 14,
    marginBottom: 2,
  },
  recentItemDate: {
    ...typography.micro,
    color: colors.muted,
    fontSize: 11,
  },
  recentItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyRecent: {
    backgroundColor: colors.card,
    borderRadius: spacing.borderRadius,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.ash,
    padding: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  emptyRecentTitle: {
    ...typography.captionBold,
    color: colors.white,
    marginTop: spacing.xs,
  },
  emptyRecentText: {
    ...typography.caption,
    color: colors.muted,
    textAlign: 'center',
    maxWidth: 240,
  },
});
