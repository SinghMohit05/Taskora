import { z } from 'zod';
import { PROJECT_STATUS_VALUES } from '../enums';

const isoDateString = z
  .string()
  .trim()
  .refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format. Expected ISO date string.',
  });

export const projectStatusSchema = z.enum(PROJECT_STATUS_VALUES, {
  errorMap: () => ({
    message: `Status must be one of: ${PROJECT_STATUS_VALUES.join(', ')}`,
  }),
});

export const createProjectSchema = z
  .object({
    name: z
      .string({ required_error: 'Project name is required' })
      .trim()
      .min(1, { message: 'Project name cannot be empty' })
      .max(120, { message: 'Project name cannot exceed 120 characters' }),
    description: z.string().trim().max(1000).optional().nullable(),
    status: projectStatusSchema.default('Not Started'),
    startDate: isoDateString.optional().nullable(),
    endDate: isoDateString.optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.endDate).getTime() >= new Date(data.startDate).getTime();
      }
      return true;
    },
    {
      message: 'End date must be greater than or equal to start date',
      path: ['endDate'],
    }
  );

export const updateProjectSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, { message: 'Project name cannot be empty' })
      .max(120, { message: 'Project name cannot exceed 120 characters' })
      .optional(),
    description: z.string().trim().max(1000).optional().nullable(),
    status: projectStatusSchema.optional(),
    startDate: isoDateString.optional().nullable(),
    endDate: isoDateString.optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.endDate).getTime() >= new Date(data.startDate).getTime();
      }
      return true;
    },
    {
      message: 'End date must be greater than or equal to start date',
      path: ['endDate'],
    }
  );

export const projectQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: projectStatusSchema.optional(),
});

export const projectResponseSchema = z.object({
  id: z.string().uuid(),
  ownerId: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable().optional(),
  status: projectStatusSchema,
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  createdAt: z.string().or(z.date()),
  taskCount: z.number().int().nonnegative().optional(),
  completedTaskCount: z.number().int().nonnegative().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectQueryInput = z.infer<typeof projectQuerySchema>;
export type ProjectResponse = z.infer<typeof projectResponseSchema>;
