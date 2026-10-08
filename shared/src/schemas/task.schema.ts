import { z } from 'zod';
import { TASK_PRIORITY_VALUES, TASK_STATUS_VALUES } from '../enums';

const isoDateString = z
  .string()
  .trim()
  .refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format. Expected ISO date string.',
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

export const createTaskSchema = z.object({
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
});

export const updateTaskSchema = z.object({
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
});

export const taskQuerySchema = z.object({
  projectId: z.string().uuid().optional(),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  search: z.string().trim().optional(),
});

export const taskResponseSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable().optional(),
  priority: taskPrioritySchema,
  status: taskStatusSchema,
  dueDate: z.string().nullable().optional(),
  createdAt: z.string().or(z.date()),
  projectName: z.string().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskQueryInput = z.infer<typeof taskQuerySchema>;
export type TaskResponse = z.infer<typeof taskResponseSchema>;
