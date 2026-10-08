import { apiClient } from './client';
import { LoginInput, RegisterInput, AuthResponse, UserResponse } from '@taskforge/shared';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

export const authApi = {
  async login(credentials: LoginInput): Promise<AuthResponse> {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    return res.data.data;
  },

  async register(data: RegisterInput): Promise<AuthResponse> {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return res.data.data;
  },

  async getMe(): Promise<UserResponse> {
    const res = await apiClient.get<ApiResponse<UserResponse>>('/auth/me');
    return res.data.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },
};
