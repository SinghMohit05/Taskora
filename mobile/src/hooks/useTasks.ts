import { useQuery } from '@tanstack/react-query';
import { tasksApi, TaskQueryParams } from '../api/tasks';
import { queryKeys } from './queryKeys';

export function useTasks(params?: TaskQueryParams) {
  return useQuery({
    queryKey: queryKeys.tasks.list(params as Record<string, unknown>),
    queryFn: () => tasksApi.getTasks(params),
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: queryKeys.tasks.detail(id),
    queryFn: () => tasksApi.getTask(id),
    enabled: Boolean(id),
  });
}
