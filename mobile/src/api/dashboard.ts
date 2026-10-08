import { apiClient } from './client';
import { DashboardResponse, ProjectResponse } from '@taskforge/shared';
import { ApiResponse } from './auth';

export interface ExtendedDashboardResponse extends DashboardResponse {
  recentProjects?: ProjectResponse[];
}

export const dashboardApi = {
  async getDashboard(): Promise<ExtendedDashboardResponse> {
    const res = await apiClient.get<ApiResponse<ExtendedDashboardResponse>>('/dashboard');
    return res.data.data;
  },
};
