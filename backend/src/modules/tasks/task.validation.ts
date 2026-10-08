import { z } from 'zod';
import { TASK_PRIORITY_VALUES, TASK_STATUS_VALUES } from '@taskforge/shared';

const isoDateString = z
  .string()
  .trim()
  .refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format. Expected ISO-8601 date string',
  });

export const taskPrioritySchema = z.enum(TASK_PRIORITY_VALUES, {
  errorMap: () => ({
    message: `Priority must be one of: ${TASK_PRIORITY_VALUES.join(', ')}`,
  }),
});

export const taskStatusSchema = z.enum(TASK_STATUS_VALUES, {
  errorMap: () => ({
    message: `Status must be one of: ${TASK_STATUS_VALUES.join(', ')}`,
  }),
});

export const idParamSchema = z
  .object({
    id: z.string({ required_error: 'ID parameter is required' }).uuid({
      message: 'ID parameter must be a valid UUID',
    }),
  })
  .strict();

export const createTaskSchema = z
  .object({
    projectId: z
      .string({ required_error: 'Project ID is required' })
      .uuid({ message: 'Project ID must be a valid UUID' }),
    name: z
      .string({ required_error: 'Task name is required' })
      .trim()
      .min(1, { message: 'Task name cannot be empty' })
      .max(150, { message: 'Task name cannot exceed 150 characters' }),
    description: z.string().trim().max(2000).optional().nullable(),
    priority: taskPrioritySchema.default('Medium'),
    status: taskStatusSchema.default('Pending'),
    dueDate: isoDateString.optional().nullable(),
  })
  .strict();

export const updateTaskSchema = z
  .object({
    projectId: z.string().uuid({ message: 'Project ID must be a valid UUID' }).optional(),
    name: z
      .string()
      .trim()
      .min(1, { message: 'Task name cannot be empty' })
      .max(150, { message: 'Task name cannot exceed 150 characters' })
      .optional(),
    description: z.string().trim().max(2000).optional().nullable(),
    priority: taskPrioritySchema.optional(),
    status: taskStatusSchema.optional(),
    dueDate: isoDateString.optional().nullable(),
  })
  .strict();

export const taskQuerySchema = z
  .object({
    projectId: z.string().uuid({ message: 'Project ID must be a valid UUID' }).optional(),
    status: taskStatusSchema.optional(),
    priority: taskPrioritySchema.optional(),
    search: z.string().trim().optional(),
    page: z.coerce.number().int().positive({ message: 'Page must be greater than 0' }).default(1),
    limit: z.coerce
      .number()
      .int()
      .positive({ message: 'Limit must be greater than 0' })
      .max(100, { message: 'Limit cannot exceed 100' })
      .default(10),
    sortBy: z.enum(['createdAt', 'name', 'dueDate', 'priority', 'status']).default('createdAt'),
    order: z.enum(['asc', 'desc']).default('desc'),
  })
  .strict();

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskQueryInput = z.infer<typeof taskQuerySchema>;
