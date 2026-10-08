import { ProjectStatus, TaskStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma';

export class DashboardService {
  async getMetrics(userId: string) {
    /**
     * Requirement:
     * Returns { totalProjects, totalTasks, completedTasks, pendingTasks, projectsInProgress }
     * for the authenticated user only, using Prisma count/aggregate queries (never load all rows).
     *
     * Note on status definition:
     * - Pending = task status "Pending" (mapped to TaskStatus.PENDING in database).
     *   Tasks with status "In Progress" are separate from "Pending" tasks.
     * - projectsInProgress = projects with status "In Progress" (ProjectStatus.IN_PROGRESS).
     *
     * All queries run concurrently via Promise.all and leverage PostgreSQL indexes
     * on owner_id, status, and project_id for sub-millisecond execution.
     */
    const [
      totalProjects,
      projectsInProgress,
      totalTasks,
      completedTasks,
      pendingTasks,
    ] = await Promise.all([
      // 1. Total projects owned by user
      prisma.project.count({
        where: {
          ownerId: userId,
        },
      }),

      // 2. Active projects in progress
      prisma.project.count({
        where: {
          ownerId: userId,
          status: ProjectStatus.IN_PROGRESS,
        },
      }),

      // 3. Total tasks across all projects owned by user
      prisma.task.count({
        where: {
          project: {
            ownerId: userId,
          },
        },
      }),

      // 4. Completed tasks across all projects owned by user
      prisma.task.count({
        where: {
          project: {
            ownerId: userId,
          },
          status: TaskStatus.COMPLETED,
        },
      }),

      // 5. Pending tasks across all projects owned by user
      // Note: "Pending" refers specifically to tasks with status TaskStatus.PENDING ("Pending")
      prisma.task.count({
        where: {
          project: {
            ownerId: userId,
          },
          status: TaskStatus.PENDING,
        },
      }),
    ]);

    return {
      totalProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      projectsInProgress,
    };
  }
}

export const dashboardService = new DashboardService();
