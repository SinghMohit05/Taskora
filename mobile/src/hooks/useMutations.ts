import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '../api/projects';
import { tasksApi } from '../api/tasks';
import { queryKeys } from './queryKeys';
import {
  CreateProjectInput,
  UpdateProjectInput,
  CreateTaskInput,
  UpdateTaskInput,
  TaskResponse,
  TaskStatus,
} from '@taskforge/shared';
import { showToast } from '../components/Toast';

export function useProjectMutations() {
  const queryClient = useQueryClient();

  const createProject = useMutation({
    mutationFn: (data: CreateProjectInput) => projectsApi.createProject(data),
    onSuccess: () => {
      showToast({ message: 'Project created successfully', type: 'success' });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
    onError: (err: { message?: string }) => {
      showToast({ message: err.message || 'Failed to create project', type: 'error' });
    },
  });

  const updateProject = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectInput }) =>
      projectsApi.updateProject(id, data),
    onSuccess: (data) => {
      showToast({ message: 'Project updated successfully', type: 'success' });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
    onError: (err: { message?: string }) => {
      showToast({ message: err.message || 'Failed to update project', type: 'error' });
    },
  });

  const deleteProject = useMutation({
    mutationFn: (id: string) => projectsApi.deleteProject(id),
    onSuccess: () => {
      showToast({ message: 'Project deleted successfully', type: 'success' });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
    onError: (err: { message?: string }) => {
      showToast({ message: err.message || 'Failed to delete project', type: 'error' });
    },
  });

  return { createProject, updateProject, deleteProject };
}

export function useTaskMutations() {
  const queryClient = useQueryClient();

  const createTask = useMutation({
    mutationFn: (data: CreateTaskInput) => tasksApi.createTask(data),
    onSuccess: (data) => {
      showToast({ message: 'Task created successfully', type: 'success' });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      if (data.projectId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(data.projectId) });
      }
    },
    onError: (err: { message?: string }) => {
      showToast({ message: err.message || 'Failed to create task', type: 'error' });
    },
  });

  const updateTask = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskInput }) =>
      tasksApi.updateTask(id, data),
    onSuccess: (data) => {
      showToast({ message: 'Task updated successfully', type: 'success' });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      if (data.projectId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(data.projectId) });
      }
    },
    onError: (err: { message?: string }) => {
      showToast({ message: err.message || 'Failed to update task', type: 'error' });
    },
  });

  const toggleTaskStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      tasksApi.updateTask(id, { status }),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.all });

      const previousQueries = queryClient.getQueriesData<{
        tasks: TaskResponse[];
        meta: { page: number; limit: number; total: number };
      }>({
        queryKey: queryKeys.tasks.all,
      });

      // Optimistically update all task query lists
      queryClient.setQueriesData<{
        tasks: TaskResponse[];
        meta: { page: number; limit: number; total: number };
      }>(
        { queryKey: queryKeys.tasks.all },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            tasks: old.tasks.map((task) => (task.id === id ? { ...task, status } : task)),
          };
        }
      );

      return { previousQueries };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      showToast({ message: 'Failed to update task status. Rolled back.', type: 'error' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });

  const deleteTask = useMutation({
    mutationFn: (id: string) => tasksApi.deleteTask(id),
    onSuccess: () => {
      showToast({ message: 'Task deleted successfully', type: 'success' });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
    onError: (err: { message?: string }) => {
      showToast({ message: err.message || 'Failed to delete task', type: 'error' });
    },
  });

  return { createTask, updateTask, toggleTaskStatus, deleteTask };
}
