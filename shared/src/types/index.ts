import { ErrorCode } from '../constants/api';

export * from '../enums';
export * from '../schemas/auth.schema';
export * from '../schemas/project.schema';
export * from '../schemas/task.schema';
export * from '../schemas/dashboard.schema';

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
}

export interface ApiErrorPayload {
  code: ErrorCode | string;
  message: string;
  details?: ApiErrorDetail[];
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorPayload;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface JwtPayload {
  userId: string;
  email: string;
}
