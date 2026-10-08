import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TaskResponse, TaskStatus } from '@taskforge/shared';
import { colors, spacing, typography, shadows } from '../theme';
import { Badge } from './Badge';
import { ConfirmDialog } from './ConfirmDialog';
import { formatDate, isOverdue } from '../utils/date';

export interface TaskRowProps {
  task: TaskResponse;
  showProjectName?: boolean;
  onToggleStatus: (id: string, status: TaskStatus) => void;
  onPress: () => void;
  onDelete: (id: string) => void;
}

export function TaskRow({
  task,
  showProjectName = false,
  onToggleStatus,
  onPress,
  onDelete,
}: TaskRowProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const isCompleted = task.status === 'Completed';
  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <>
      <Pressable
        onPress={onPress}
        onLongPress={() => setShowConfirm(true)}
        style={({ pressed }) => [
          styles.row,
          isCompleted && styles.rowCompleted,
          pressed && styles.rowPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Task ${task.name}`}
        accessibilityHint="Tap to edit, long press to delete"
      >
        <Pressable
          onPress={() => onToggleStatus(task.id, isCompleted ? 'Pending' : 'Completed')}
          style={[styles.checkbox, isCompleted && styles.checkboxCompleted]}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: isCompleted }}
          accessibilityLabel={isCompleted ? 'Mark as pending' : 'Mark as completed'}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {isCompleted && <Ionicons name="checkmark" size={14} color={colors.white} />}
        </Pressable>

        <View style={styles.content}>
          <Text
            style={[styles.title, isCompleted && styles.titleCompleted]}
            numberOfLines={1}
          >
            {task.name}
          </Text>

          {task.description ? (
            <Text
              style={[styles.description, isCompleted && styles.descriptionCompleted]}
              numberOfLines={1}
            >
              {task.description}
            </Text>
          ) : null}

          {showProjectName && task.projectName ? (
            <View style={styles.projectPill}>
              <Ionicons name="folder-outline" size={11} color={colors.steel} style={{ marginRight: 3 }} />
              <Text style={styles.projectName} numberOfLines={1}>
                {task.projectName}
              </Text>
            </View>
          ) : null}

          <View style={styles.metaRow}>
            <Badge label={task.priority} variant="priority" style={styles.badge} />
            <Badge label={task.status} variant="status" style={styles.badge} />

            {task.dueDate ? (
              <View style={[styles.dueContainer, overdue && styles.dueOverdue]}>
                <Ionicons
                  name="calendar-outline"
                  size={11}
                  color={overdue ? colors.crimson : colors.muted}
                />
                <Text style={[styles.dueText, overdue && styles.dueTextOverdue]}>
                  {formatDate(task.dueDate)}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.actionRow}>
          <Pressable
            onPress={() => setShowConfirm(true)}
            style={styles.deleteBtn}
            accessibilityRole="button"
            accessibilityLabel={`Delete task ${task.name}`}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={17} color={colors.muted} />
          </Pressable>
        </View>
      </Pressable>

      <ConfirmDialog
        visible={showConfirm}
        title="Delete Task"
        message={`Are you sure you want to delete "${task.name}"?`}
        confirmTitle="Delete"
        onConfirm={() => {
          setShowConfirm(false);
          onDelete(task.id);
        }}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.card,
    borderRadius: spacing.borderRadius,
    borderWidth: 1,
    borderColor: colors.ash,
    padding: spacing.md + 2,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.soft,
  },
  rowCompleted: {
    opacity: 0.65,
    backgroundColor: 'rgba(18, 22, 34, 0.7)',
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  rowPressed: {
    backgroundColor: colors.cardElevated,
    borderColor: colors.ashStrong,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    backgroundColor: colors.subtle,
  },
  checkboxCompleted: {
    backgroundColor: colors.status.completed,
    borderColor: colors.status.completed,
  },
  content: {
    flex: 1,
    paddingRight: spacing.xs,
  },
  title: {
    ...typography.captionBold,
    color: colors.white,
    fontSize: 15,
    marginBottom: 2,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.muted,
  },
  description: {
    ...typography.caption,
    color: colors.muted,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 4,
  },
  descriptionCompleted: {
    textDecorationLine: 'line-through',
    color: `${colors.muted}80`,
  },
  projectPill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  projectName: {
    ...typography.micro,
    color: colors.steel,
    fontSize: 11,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: 2,
  },
  badge: {
    marginRight: spacing.xs,
  },
  dueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: colors.subtle,
    borderWidth: 1,
    borderColor: colors.ash,
    gap: 4,
  },
  dueOverdue: {
    backgroundColor: colors.errorTint,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  dueText: {
    ...typography.micro,
    color: colors.muted,
    fontSize: 10,
  },
  dueTextOverdue: {
    color: colors.crimson,
    fontWeight: '700',
  },
  actionRow: {
    marginLeft: spacing.xs,
  },
  deleteBtn: {
    padding: spacing.xs,
  },
});
