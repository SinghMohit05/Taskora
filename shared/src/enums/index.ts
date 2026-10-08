/**
 * TaskForge Enums and Literal Types
 * Strictly aligned with assessment requirements.
 */

export const PROJECT_STATUS = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
} as const;

export type ProjectStatus = (typeof PROJECT_STATUS)[keyof typeof PROJECT_STATUS];
export const PROJECT_STATUS_VALUES = Object.values(PROJECT_STATUS) as [ProjectStatus, ...ProjectStatus[]];

export const TASK_PRIORITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
} as const;

export type TaskPriority = (typeof TASK_PRIORITY)[keyof typeof TASK_PRIORITY];
export const TASK_PRIORITY_VALUES = Object.values(TASK_PRIORITY) as [TaskPriority, ...TaskPriority[]];

export const TASK_STATUS = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
} as const;

export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS];
export const TASK_STATUS_VALUES = Object.values(TASK_STATUS) as [TaskStatus, ...TaskStatus[]];
