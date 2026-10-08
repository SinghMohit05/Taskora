import React, { useState } from 'react';
import { View, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { useTasks } from '../../src/hooks/useTasks';
import { useTaskMutations } from '../../src/hooks/useMutations';
import { TaskRow } from '../../src/components/TaskRow';
import { SearchBar } from '../../src/components/SearchBar';
import { FilterChips } from '../../src/components/FilterChips';
import { TaskRowSkeleton } from '../../src/components/Skeleton';
import { EmptyState } from '../../src/components/EmptyState';
import { ErrorState } from '../../src/components/ErrorState';
import { FAB } from '../../src/components/FAB';
import { colors, spacing } from '../../src/theme';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const statusFilterOptions = [
  { label: 'All Status', value: '' },
  { label: 'Pending', value: 'Pending' },
  { label: 'In Progress', value: 'In Progress' },
  { label: 'Completed', value: 'Completed' },
];

const priorityFilterOptions = [
  { label: 'All Priority', value: '' },
  { label: 'High', value: 'High' },
  { label: 'Medium', value: 'Medium' },
  { label: 'Low', value: 'Low' },
];

export default function TasksScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');

  const { data, isLoading, isError, refetch, isRefetching } = useTasks({
    search: search || undefined,
    status: status || undefined,
    priority: priority || undefined,
    limit: 50,
  });

  const { toggleTaskStatus, deleteTask } = useTaskMutations();

  return (
    <View style={styles.container}>
      <View style={styles.filterBar}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search all tasks..."
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

      {isLoading ? (
        <View style={styles.listContent}>
          {Array.from({ length: 6 }).map((_, i) => (
            <TaskRowSkeleton key={i} />
          ))}
        </View>
      ) : isError ? (
        <View style={styles.listContent}>
          <ErrorState onRetry={refetch} />
        </View>
      ) : (
        <FlatList
          data={data?.tasks || []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon={<Ionicons name="checkbox-outline" size={44} color={colors.muted} />}
              title="No tasks found"
              description={
                search || status || priority
                  ? 'No tasks matched your current filter criteria.'
                  : 'Start capturing your action items by adding a new task.'
              }
              actionTitle={search || status || priority ? undefined : 'Add Task'}
              onAction={() => router.push('/task/new')}
            />
          }
          renderItem={({ item }) => (
            <TaskRow
              task={item}
              showProjectName={true}
              onToggleStatus={(taskId, newStatus) =>
                toggleTaskStatus.mutate({ id: taskId, status: newStatus })
              }
              onPress={() => router.push(`/task/${item.id}` as any)}
              onDelete={(taskId) => deleteTask.mutate(taskId)}
            />
          )}
        />
      )}

      <FAB
        onPress={() => router.push('/task/new')}
        accessibilityLabel="Create Task"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  filterBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.paper,
    borderBottomWidth: 1,
    borderBottomColor: colors.ash,
  },
  searchBar: {
    marginBottom: spacing.xs,
  },
  chipRow: {
    marginBottom: 2,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: 90,
  },
});
