import React, { useState } from 'react';
import { View, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { useProjects } from '../../../src/hooks/useProjects';
import { useProjectMutations } from '../../../src/hooks/useMutations';
import { ProjectCard } from '../../../src/components/ProjectCard';
import { SearchBar } from '../../../src/components/SearchBar';
import { FilterChips } from '../../../src/components/FilterChips';
import { ProjectCardSkeleton } from '../../../src/components/Skeleton';
import { EmptyState } from '../../../src/components/EmptyState';
import { ErrorState } from '../../../src/components/ErrorState';
import { FAB } from '../../../src/components/FAB';
import { colors, spacing } from '../../../src/theme';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const statusFilterOptions = [
  { label: 'All Projects', value: '' },
  { label: 'Not Started', value: 'Not Started' },
  { label: 'In Progress', value: 'In Progress' },
  { label: 'Completed', value: 'Completed' },
];

export default function ProjectsListScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const { data, isLoading, isError, refetch, isRefetching } = useProjects({
    search: search || undefined,
    status: status || undefined,
    limit: 50,
  });

  const { deleteProject } = useProjectMutations();

  return (
    <View style={styles.container}>
      <View style={styles.filterBar}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search projects..."
          style={styles.searchBar}
        />
        <FilterChips
          options={statusFilterOptions}
          selectedValue={status}
          onSelect={setStatus}
          style={styles.chipScroll}
        />
      </View>

      {isLoading ? (
        <View style={styles.listContent}>
          {Array.from({ length: 4 }).map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </View>
      ) : isError ? (
        <View style={styles.listContent}>
          <ErrorState onRetry={refetch} />
        </View>
      ) : (
        <FlatList
          data={data?.projects || []}
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
              icon={<Ionicons name="folder-open-outline" size={44} color={colors.muted} />}
              title="No projects found"
              description={
                search || status
                  ? 'No projects match your current filters. Try resetting search or status.'
                  : 'Get started by creating your first project.'
              }
              actionTitle={search || status ? undefined : 'Create Project'}
              onAction={() => router.push('/project/new')}
            />
          }
          renderItem={({ item }) => (
            <ProjectCard
              project={item}
              onPress={() => router.push(`/(tabs)/projects/${item.id}` as any)}
              onEdit={() => router.push(`/project/${item.id}/edit` as any)}
              onDelete={() => deleteProject.mutate(item.id)}
            />
          )}
        />
      )}

      <FAB
        onPress={() => router.push('/project/new')}
        accessibilityLabel="Create Project"
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
  chipScroll: {
    paddingVertical: spacing.xs,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: 90,
  },
});
