import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useProject } from '../../../src/hooks/useProject';
import { useTasks } from '../../../src/hooks/useTasks';
import { useProjectMutations, useTaskMutations } from '../../../src/hooks/useMutations';
import { TaskRow } from '../../../src/components/TaskRow';
import { Badge } from '../../../src/components/Badge';
import { SearchBar } from '../../../src/components/SearchBar';
import { FilterChips } from '../../../src/components/FilterChips';
import { TaskRowSkeleton } from '../../../src/components/Skeleton';
import { EmptyState } from '../../../src/components/EmptyState';
import { ErrorState } from '../../../src/components/ErrorState';
import { ConfirmDialog } from '../../../src/components/ConfirmDialog';
import { FAB } from '../../../src/components/FAB';
import { colors, spacing, typography, shadows } from '../../../src/theme';
import { formatDate } from '../../../src/utils/date';
import { Ionicons } from '@expo/vector-icons';

const statusFilterOptions = [
  { label: 'All Status', value: '' },
  { label: 'Pending', value: 'Pending' },
  { label: 'In Progress', value: 'In Progress' },
  { label: 'Completed', value: 'Completed' },
];

const priorityFilterOptions = [
  { label: 'All Priority', value: '' },
  { label: 'Low', value: 'Low' },
  { label: 'Medium', value: 'Medium' },
  { label: 'High', value: 'High' },
];

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [showDeleteProject, setShowDeleteProject] = useState(false);

  const {
    data: project,
    isLoading: isProjectLoading,
    isError: isProjectError,
    refetch: refetchProject,
  } = useProject(id);

  const {
    data: tasksData,
    isLoading: isTasksLoading,
    refetch: refetchTasks,
    isRefetching: isTasksRefetching,
  } = useTasks({
    projectId: id,
    search: search || undefined,
    status: status || undefined,
    priority: priority || undefined,
  });

  const { deleteProject } = useProjectMutations();
  const { toggleTaskStatus, deleteTask } = useTaskMutations();

  const handleRefresh = async () => {
    await Promise.all([refetchProject(), refetchTasks()]);
  };

  if (isProjectLoading) {
    return (
      <View style={styles.centerContainer}>
        <TaskRowSkeleton />
      </View>
    );
  }

  if (isProjectError || !project) {
    return (
      <View style={styles.centerContainer}>
        <ErrorState
          title="Project not found"
          message="Could not locate the requested project or its details."
          onRetry={refetchProject}
        />
      </View>
    );
  }

  // Calculate project progress
  const allTasks = tasksData?.tasks || [];
  const totalProjectTasks = allTasks.length;
  const completedProjectTasks = allTasks.filter((t) => t.status === 'Completed').length;
  const progressPercent =
    totalProjectTasks > 0
      ? Math.round((completedProjectTasks / totalProjectTasks) * 100)
      : project.status === 'Completed'
      ? 100
      : project.status === 'In Progress'
      ? 45
      : 0;

  return (
    <View style={styles.container}>
      <FlatList
        data={allTasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isTasksRefetching}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListHeaderComponent={
          <View style={styles.headerComponent}>
            {/* Project Overview Card */}
            <View style={styles.projectCard}>
              <View style={styles.projectTopRow}>
                <View style={styles.projectTitleContainer}>
                  <View style={styles.iconBadge}>
                    <Ionicons name="folder-outline" size={18} color={colors.primary} />
                  </View>
                  <Text style={styles.projectName} numberOfLines={2}>
                    {project.name}
                  </Text>
                </View>
                <Badge label={project.status} variant="status" />
              </View>

              {project.description ? (
                <Text style={styles.projectDescription}>{project.description}</Text>
              ) : null}

              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabelText}>Milestone Progress</Text>
                  <Text style={styles.progressValueText}>
                    {completedProjectTasks}/{totalProjectTasks} completed ({progressPercent}%)
                  </Text>
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
                            : colors.primary,
                      },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.dateRow}>
                <Ionicons name="calendar-outline" size={13} color={colors.steel} />
                <Text style={styles.dateText}>
                  {project.startDate || project.endDate
                    ? `${formatDate(project.startDate)} → ${formatDate(project.endDate)}`
                    : 'No timeline scheduled'}
                </Text>
              </View>

              <View style={styles.projectActions}>
                <Pressable
                  onPress={() => router.push(`/project/${project.id}/edit` as any)}
                  style={styles.actionBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Edit Project"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="create-outline" size={16} color={colors.white} />
                  <Text style={styles.actionBtnText}>Edit</Text>
                </Pressable>

                <Pressable
                  onPress={() => setShowDeleteProject(true)}
                  style={[styles.actionBtn, styles.deleteBtn]}
                  accessibilityRole="button"
                  accessibilityLabel="Delete Project"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="trash-outline" size={16} color={colors.crimson} />
                  <Text style={[styles.actionBtnText, { color: colors.crimson }]}>Delete</Text>
                </Pressable>
              </View>
            </View>

            {/* Tasks Header & Filters */}
            <View style={styles.tasksSectionHeader}>
              <Text style={styles.sectionTitle}>Project Tasks</Text>
              <Text style={styles.taskCountText}>
                {allTasks.length} task{allTasks.length === 1 ? '' : 's'}
              </Text>
            </View>

            <SearchBar
              value={search}
              onChangeText={setSearch}
              placeholder="Search project tasks..."
              style={styles.searchBar}
            />

            <View style={styles.chipRow}>
              <FilterChips
                options={statusFilterOptions}
                selectedValue={status}
                onSelect={setStatus}
              />
            </View>

            <View style={styles.chipRow}>
              <FilterChips
                options={priorityFilterOptions}
                selectedValue={priority}
                onSelect={setPriority}
              />
            </View>
          </View>
        }
        ListEmptyComponent={
          isTasksLoading ? (
            <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <TaskRowSkeleton key={i} />
              ))}
            </View>
          ) : (
            <EmptyState
              icon={<Ionicons name="checkbox-outline" size={40} color={colors.muted} />}
              title="No tasks in this project"
              description={
                search || status || priority
                  ? 'No tasks match the active filters.'
                  : 'Start adding action items and deliverables to this project.'
              }
              actionTitle={search || status || priority ? undefined : 'Add Task'}
              onAction={() =>
                router.push({
                  pathname: '/task/new',
                  params: { projectId: project.id },
                })
              }
            />
          )
        }
        renderItem={({ item }) => (
          <TaskRow
            task={item}
            onToggleStatus={(taskId, newStatus) =>
              toggleTaskStatus.mutate({ id: taskId, status: newStatus })
            }
            onPress={() => router.push(`/task/${item.id}` as any)}
            onDelete={(taskId) => deleteTask.mutate(taskId)}
          />
        )}
      />

      <FAB
        onPress={() =>
          router.push({
            pathname: '/task/new',
            params: { projectId: project.id },
          })
        }
        accessibilityLabel="Add Task"
      />

      <ConfirmDialog
        visible={showDeleteProject}
        title="Delete Project"
        message={`Are you sure you want to delete "${project.name}"? All associated tasks will also be deleted.`}
        confirmTitle="Delete"
        onConfirm={() => {
          setShowDeleteProject(false);
          deleteProject.mutate(project.id, {
            onSuccess: () => router.replace('/(tabs)/projects'),
          });
        }}
        onCancel={() => setShowDeleteProject(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  centerContainer: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
    backgroundColor: colors.paper,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: 90,
  },
  headerComponent: {
    marginBottom: spacing.md,
  },
  projectCard: {
    backgroundColor: colors.card,
    borderRadius: spacing.borderRadius,
    borderWidth: 1,
    borderColor: colors.ash,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  projectTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  projectTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.25)',
  },
  projectName: {
    ...typography.h2,
    color: colors.white,
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
  },
  projectDescription: {
    ...typography.caption,
    color: colors.muted,
    marginBottom: spacing.md,
    lineHeight: 19,
  },
  progressContainer: {
    marginBottom: spacing.md,
    marginTop: spacing.xs,
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
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.xs,
  },
  dateText: {
    ...typography.micro,
    color: colors.muted,
    fontSize: 11,
  },
  projectActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.ash,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.ash,
    backgroundColor: colors.subtle,
  },
  deleteBtn: {
    borderColor: 'rgba(239, 68, 68, 0.3)',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  actionBtnText: {
    ...typography.micro,
    color: colors.white,
    fontWeight: '600',
  },
  tasksSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  taskCountText: {
    ...typography.micro,
    color: colors.muted,
  },
  searchBar: {
    marginBottom: spacing.xs,
  },
  chipRow: {
    marginBottom: spacing.xs,
  },
});
