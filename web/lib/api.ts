/**
 * TaskForge API Client
 * All client-side requests go to the Next.js BFF proxy at /bff/...
 * which forwards them to the Express backend with the session cookie as a Bearer token.
 */

const BFF_BASE = '/bff';

interface RequestOptions {
  method?: string;
  body?: unknown;
  params?: Record<string, string | number | undefined>;
}

class ApiError extends Error {
  status: number;
  code: string;
  details?: Array<{ field?: string; message: string }>;

  constructor(status: number, code: string, message: string, details?: Array<{ field?: string; message: string }>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, params } = options;

  let url = `${BFF_BASE}${path}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.set(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) url += `?${queryString}`;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  const json = await res.json();

  if (!res.ok || json.success === false) {
    throw new ApiError(
      res.status,
      json.error?.code || 'UNKNOWN_ERROR',
      json.error?.message || 'An unexpected error occurred',
      json.error?.details,
    );
  }

  return json;
}

// ─── Auth (goes to Next.js API routes, not BFF) ─────────────────────────
export const authApi = {
  login: (data: { email: string; password: string }) =>
    fetch('/api/session/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    }).then(async (res) => {
      const json = await res.json();
      if (!res.ok) throw new ApiError(res.status, json.error?.code || 'UNAUTHORIZED', json.error?.message || 'Login failed');
      return json;
    }),

  register: (data: { fullName: string; email: string; password: string }) =>
    fetch('/api/session/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    }).then(async (res) => {
      const json = await res.json();
      if (!res.ok) throw new ApiError(res.status, json.error?.code || 'CONFLICT', json.error?.message || 'Registration failed');
      return json;
    }),

  logout: () =>
    fetch('/api/session/logout', {
      method: 'POST',
      credentials: 'include',
    }).then(async (res) => {
      const json = await res.json();
      if (!res.ok) throw new ApiError(res.status, json.error?.code || 'ERROR', json.error?.message || 'Logout failed');
      return json;
    }),

  getSession: () =>
    fetch('/api/session', {
      credentials: 'include',
    }).then(async (res) => {
      const json = await res.json();
      return json;
    }),
};

// ─── Dashboard ──────────────────────────────────────────────────────────
export const dashboardApi = {
  getMetrics: () =>
    request<{ success: true; data: DashboardMetrics }>('/api/dashboard').then((r) => r.data),
};

// ─── Projects ───────────────────────────────────────────────────────────
export const projectsApi = {
  list: (params?: ProjectQueryParams) =>
    request<{ success: true; data: Project[]; meta: PaginationMeta }>('/api/projects', { params: params as any }),

  getById: (id: string) =>
    request<{ success: true; data: ProjectDetail }>(`/api/projects/${id}`).then((r) => r.data),

  create: (data: CreateProjectInput) =>
    request<{ success: true; data: Project }>('/api/projects', { method: 'POST', body: data }).then((r) => r.data),

  update: (id: string, data: UpdateProjectInput) =>
    request<{ success: true; data: Project }>(`/api/projects/${id}`, { method: 'PUT', body: data }).then((r) => r.data),

  delete: (id: string) =>
    request<{ success: true; data: { id: string; message: string } }>(`/api/projects/${id}`, { method: 'DELETE' }).then((r) => r.data),
};

// ─── Tasks ──────────────────────────────────────────────────────────────
export const tasksApi = {
  list: (params?: TaskQueryParams) =>
    request<{ success: true; data: Task[]; meta: PaginationMeta }>('/api/tasks', { params: params as any }),

  getById: (id: string) =>
    request<{ success: true; data: Task }>(`/api/tasks/${id}`).then((r) => r.data),

  create: (data: CreateTaskInput) =>
    request<{ success: true; data: Task }>('/api/tasks', { method: 'POST', body: data }).then((r) => r.data),

  update: (id: string, data: UpdateTaskInput) =>
    request<{ success: true; data: Task }>(`/api/tasks/${id}`, { method: 'PUT', body: data }).then((r) => r.data),

  delete: (id: string) =>
    request<{ success: true; data: { id: string; message: string } }>(`/api/tasks/${id}`, { method: 'DELETE' }).then((r) => r.data),
};

// ─── Types ──────────────────────────────────────────────────────────────
export type ProjectStatus = 'Not Started' | 'In Progress' | 'Completed';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface DashboardMetrics {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  projectsInProgress: number;
}

export interface Project {
  id: string;
  ownerId: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  taskCount: number;
  completedTaskCount: number;
}

export interface ProjectDetail extends Project {
  tasks: Task[];
}

export interface Task {
  id: string;
  projectId: string;
  projectName?: string;
  name: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
  createdAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProjectQueryParams {
  search?: string;
  status?: ProjectStatus;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface TaskQueryParams {
  projectId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface CreateProjectInput {
  name: string;
  description?: string | null;
  status?: ProjectStatus;
  startDate?: string | null;
  endDate?: string | null;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string | null;
  status?: ProjectStatus;
  startDate?: string | null;
  endDate?: string | null;
}

export interface CreateTaskInput {
  projectId: string;
  name: string;
  description?: string | null;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: string | null;
}

export interface UpdateTaskInput {
  projectId?: string;
  name?: string;
  description?: string | null;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: string | null;
}

export { ApiError };
