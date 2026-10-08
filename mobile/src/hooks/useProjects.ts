import { useQuery } from '@tanstack/react-query';
import { projectsApi, ProjectQueryParams } from '../api/projects';
import { queryKeys } from './queryKeys';

export function useProjects(params?: ProjectQueryParams) {
  return useQuery({
    queryKey: queryKeys.projects.list(params as Record<string, unknown>),
    queryFn: () => projectsApi.getProjects(params),
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: queryKeys.projects.detail(id),
    queryFn: () => projectsApi.getProject(id),
    enabled: Boolean(id),
  });
}
