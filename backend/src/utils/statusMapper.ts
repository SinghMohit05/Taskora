import {
  ProjectStatus as PrismaProjectStatus,
  TaskPriority as PrismaTaskPriority,
  TaskStatus as PrismaTaskStatus,
} from '@prisma/client';
import { ProjectStatus, TaskPriority, TaskStatus } from '@taskforge/shared';

// UI to Prisma Mappings
export const toPrismaProjectStatus = (
  status?: string | null
): PrismaProjectStatus | undefined => {
  if (!status) return undefined;
  switch (status) {
    case 'Not Started':
    case 'NOT_STARTED':
      return PrismaProjectStatus.NOT_STARTED;
    case 'In Progress':
    case 'IN_PROGRESS':
      return PrismaProjectStatus.IN_PROGRESS;
    case 'Completed':
    case 'COMPLETED':
      return PrismaProjectStatus.COMPLETED;
    default:
      return undefined;
  }
};

export const toPrismaTaskStatus = (
  status?: string | null
): PrismaTaskStatus | undefined => {
  if (!status) return undefined;
  switch (status) {
    case 'Pending':
    case 'PENDING':
      return PrismaTaskStatus.PENDING;
    case 'In Progress':
    case 'IN_PROGRESS':
      return PrismaTaskStatus.IN_PROGRESS;
    case 'Completed':
    case 'COMPLETED':
      return PrismaTaskStatus.COMPLETED;
    default:
      return undefined;
  }
};

export const toPrismaTaskPriority = (
  priority?: string | null
): PrismaTaskPriority | undefined => {
  if (!priority) return undefined;
  switch (priority) {
    case 'Low':
    case 'LOW':
      return PrismaTaskPriority.LOW;
    case 'Medium':
    case 'MEDIUM':
      return PrismaTaskPriority.MEDIUM;
    case 'High':
    case 'HIGH':
      return PrismaTaskPriority.HIGH;
    default:
      return undefined;
  }
};

// Prisma to UI/Shared Mappings
export const toUiProjectStatus = (status: PrismaProjectStatus): ProjectStatus => {
  switch (status) {
    case PrismaProjectStatus.NOT_STARTED:
      return 'Not Started';
    case PrismaProjectStatus.IN_PROGRESS:
      return 'In Progress';
    case PrismaProjectStatus.COMPLETED:
      return 'Completed';
  }
};

export const toUiTaskStatus = (status: PrismaTaskStatus): TaskStatus => {
  switch (status) {
    case PrismaTaskStatus.PENDING:
      return 'Pending';
    case PrismaTaskStatus.IN_PROGRESS:
      return 'In Progress';
    case PrismaTaskStatus.COMPLETED:
      return 'Completed';
  }
};

export const toUiTaskPriority = (priority: PrismaTaskPriority): TaskPriority => {
  switch (priority) {
    case PrismaTaskPriority.LOW:
      return 'Low';
    case PrismaTaskPriority.MEDIUM:
      return 'Medium';
    case PrismaTaskPriority.HIGH:
      return 'High';
  }
};
