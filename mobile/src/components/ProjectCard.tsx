import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProjectResponse } from '@taskforge/shared';
import { colors, spacing, typography, shadows } from '../theme';
import { Badge } from './Badge';
import { ConfirmDialog } from './ConfirmDialog';
import { formatDate } from '../utils/date';

export interface ProjectCardProps {
  project: ProjectResponse;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function ProjectCard({
  project,
  onPress,
  onEdit,
  onDelete,
}: ProjectCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  // Compute progress indicator from actual project data
  const hasTaskCounts = typeof project.taskCount === 'number' && project.taskCount > 0;
  const progressPercent = hasTaskCounts
    ? Math.min(100, Math.round(((project.completedTaskCount || 0) / (project.taskCount || 1)) * 100))
    : project.status === 'Completed'
    ? 100
    : project.status === 'In Progress'
    ? 45
    : 0;

  const progressLabel = hasTaskCounts
    ? `${project.completedTaskCount || 0}/${project.taskCount} tasks (${progressPercent}%)`
    : project.status === 'Completed'
    ? 'Completed (100%)'
    : project.status === 'In Progress'
    ? 'In Progress'
    : 'Not Started';

  return (
    <>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        accessibilityRole="button"
        accessibilityLabel={`Project ${project.name}`}
      >
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View style={styles.iconBadge}>
              <Ionicons name="folder-outline" size={16} color={colors.primary} />
            </View>
            <Text style={styles.title} numberOfLines={1}>
              {project.name}
            </Text>
          </View>
          <Badge label={project.status} variant="status" />
        </View>

        {project.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {project.description}
          </Text>
        ) : null}

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabelText}>Progress</Text>
            <Text style={styles.progressValueText}>{progressLabel}</Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${progressPercent}%`,
                  backgroundColor:
                    progressPercent === 100
                      ? colors.status.completed
                      : progressPercent > 0
                      ? colors.primary
                      : 'transparent',
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.dates}>
            <Ionicons
              name="calendar-outline"
              size={13}
              color={colors.muted}
              style={styles.calendarIcon}
            />
            <Text style={styles.dateText}>
              {project.startDate || project.endDate
                ? `${formatDate(project.startDate)} - ${formatDate(project.endDate)}`
                : 'No timeline set'}
            </Text>
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              style={styles.actionBtn}
              accessibilityRole="button"
              accessibilityLabel={`Edit project ${project.name}`}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="create-outline" size={17} color={colors.muted} />
            </Pressable>

            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                setShowConfirm(true);
              }}
              style={styles.actionBtn}
              accessibilityRole="button"
              accessibilityLabel={`Delete project ${project.name}`}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="trash-outline" size={17} color={colors.crimson} />
            </Pressable>
          </View>
        </View>
      </Pressable>

      <ConfirmDialog
        visible={showConfirm}
        title="Delete Project"
        message={`Are you sure you want to delete "${project.name}"? All associated tasks will also be deleted.`}
        confirmTitle="Delete"
        onConfirm={() => {
          setShowConfirm(false);
          onDelete();
        }}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: spacing.borderRadius,
    borderWidth: 1,
    borderColor: colors.ash,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  cardPressed: {
    backgroundColor: colors.cardElevated,
    borderColor: colors.ashStrong,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.25)',
  },
  title: {
    ...typography.h3,
    color: colors.white,
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
  description: {
    ...typography.caption,
    color: colors.muted,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  progressContainer: {
    marginBottom: spacing.md,
    marginTop: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabelText: {
    ...typography.micro,
    color: colors.muted,
    fontSize: 10,
  },
  progressValueText: {
    ...typography.micro,
    color: colors.inkSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  progressBarTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.subtle,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.ash,
    paddingTop: spacing.sm + 2,
  },
  dates: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarIcon: {
    marginRight: 5,
  },
  dateText: {
    ...typography.micro,
    color: colors.muted,
    fontSize: 11,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionBtn: {
    padding: spacing.xs,
  },
});
