import { apiClient } from './client';
import {
  CreateProjectInput,
  UpdateProjectInput,
  ProjectResponse,
} from '@taskforge/shared';
import { ApiResponse } from './auth';

export interface ProjectQueryParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export const projectsApi = {
  async getProjects(params?: ProjectQueryParams): Promise<{
    projects: ProjectResponse[];
    meta: { page: number; limit: number; total: number };
  }> {
    const res = await apiClient.get<ApiResponse<ProjectResponse[]>>('/projects', { params });
    return {
      projects: res.data.data,
      meta: res.data.meta || { page: 1, limit: 10, total: res.data.data.length },
    };
  },

  async getProject(id: string): Promise<ProjectResponse> {
    const res = await apiClient.get<ApiResponse<ProjectResponse>>(`/projects/${id}`);
    return res.data.data;
  },

  async createProject(data: CreateProjectInput): Promise<ProjectResponse> {
    const res = await apiClient.post<ApiResponse<ProjectResponse>>('/projects', data);
    return res.data.data;
  },

  async updateProject(id: string, data: UpdateProjectInput): Promise<ProjectResponse> {
    const res = await apiClient.put<ApiResponse<ProjectResponse>>(`/projects/${id}`, data);
    return res.data.data;
  },

  async deleteProject(id: string): Promise<void> {
    await apiClient.delete(`/projects/${id}`);
  },
};
