import { z } from 'zod';
import { PROJECT_STATUS_VALUES } from '@taskforge/shared';

const isoDateString = z
  .string()
  .trim()
  .refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format. Expected ISO-8601 date string (e.g. 2026-10-15T00:00:00.000Z)',
  });

export const projectStatusSchema = z.enum(PROJECT_STATUS_VALUES, {
  errorMap: () => ({
    message: `Status must be one of: ${PROJECT_STATUS_VALUES.join(', ')}`,
  }),
});

export const idParamSchema = z
  .object({
    id: z.string({ required_error: 'ID parameter is required' }).uuid({
      message: 'ID parameter must be a valid UUID',
    }),
  })
  .strict();

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
  .strict()
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
  .strict()
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

export const projectQuerySchema = z
  .object({
    search: z.string().trim().optional(),
    status: projectStatusSchema.optional(),
    page: z.coerce.number().int().positive({ message: 'Page must be greater than 0' }).default(1),
    limit: z.coerce
      .number()
      .int()
      .positive({ message: 'Limit must be greater than 0' })
      .max(100, { message: 'Limit cannot exceed 100' })
      .default(10),
    sortBy: z.enum(['createdAt', 'name', 'startDate', 'endDate', 'status']).default('createdAt'),
    order: z.enum(['asc', 'desc']).default('desc'),
  })
  .strict();

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectQueryInput = z.infer<typeof projectQuerySchema>;
