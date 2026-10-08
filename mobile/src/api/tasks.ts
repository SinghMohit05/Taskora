import { apiClient } from './client';
import {
  CreateTaskInput,
  UpdateTaskInput,
  TaskResponse,
} from '@taskforge/shared';
import { ApiResponse } from './auth';

export interface TaskQueryParams {
  projectId?: string;
  status?: string;
  priority?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export const tasksApi = {
  async getTasks(params?: TaskQueryParams): Promise<{
    tasks: TaskResponse[];
    meta: { page: number; limit: number; total: number };
  }> {
    const res = await apiClient.get<ApiResponse<TaskResponse[]>>('/tasks', { params });
    return {
      tasks: res.data.data,
      meta: res.data.meta || { page: 1, limit: 10, total: res.data.data.length },
    };
  },

  async getTask(id: string): Promise<TaskResponse> {
    const res = await apiClient.get<ApiResponse<TaskResponse>>(`/tasks/${id}`);
    return res.data.data;
  },

  async createTask(data: CreateTaskInput): Promise<TaskResponse> {
    const res = await apiClient.post<ApiResponse<TaskResponse>>('/tasks', data);
    return res.data.data;
  },

  async updateTask(id: string, data: UpdateTaskInput): Promise<TaskResponse> {
    const res = await apiClient.put<ApiResponse<TaskResponse>>(`/tasks/${id}`, data);
    return res.data.data;
  },

  async deleteTask(id: string): Promise<void> {
    await apiClient.delete(`/tasks/${id}`);
  },
};
