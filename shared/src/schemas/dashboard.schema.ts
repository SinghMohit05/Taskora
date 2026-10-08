import { z } from 'zod';

export const dashboardResponseSchema = z.object({
  totalProjects: z.number().int().nonnegative(),
  totalTasks: z.number().int().nonnegative(),
  completedTasks: z.number().int().nonnegative(),
  pendingTasks: z.number().int().nonnegative(),
  projectsInProgress: z.number().int().nonnegative(),
});

export type DashboardResponse = z.infer<typeof dashboardResponseSchema>;
