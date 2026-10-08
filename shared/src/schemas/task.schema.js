"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskResponseSchema = exports.taskQuerySchema = exports.updateTaskSchema = exports.createTaskSchema = exports.taskStatusSchema = exports.taskPrioritySchema = void 0;
const zod_1 = require("zod");
const enums_1 = require("../enums");
const isoDateString = zod_1.z
    .string()
    .trim()
    .refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format. Expected ISO date string.',
});
exports.taskPrioritySchema = zod_1.z.enum(enums_1.TASK_PRIORITY_VALUES, {
    errorMap: () => ({
        message: `Priority must be one of: ${enums_1.TASK_PRIORITY_VALUES.join(', ')}`,
    }),
});
exports.taskStatusSchema = zod_1.z.enum(enums_1.TASK_STATUS_VALUES, {
    errorMap: () => ({
        message: `Status must be one of: ${enums_1.TASK_STATUS_VALUES.join(', ')}`,
    }),
});
exports.createTaskSchema = zod_1.z.object({
    projectId: zod_1.z
        .string({ required_error: 'Project ID is required' })
        .uuid({ message: 'Project ID must be a valid UUID' }),
    name: zod_1.z
        .string({ required_error: 'Task name is required' })
        .trim()
        .min(1, { message: 'Task name cannot be empty' })
        .max(150, { message: 'Task name cannot exceed 150 characters' }),
    description: zod_1.z.string().trim().max(2000).optional().nullable(),
    priority: exports.taskPrioritySchema.default('Medium'),
    status: exports.taskStatusSchema.default('Pending'),
    dueDate: isoDateString.optional().nullable(),
});
exports.updateTaskSchema = zod_1.z.object({
    projectId: zod_1.z.string().uuid({ message: 'Project ID must be a valid UUID' }).optional(),
    name: zod_1.z
        .string()
        .trim()
        .min(1, { message: 'Task name cannot be empty' })
        .max(150, { message: 'Task name cannot exceed 150 characters' })
        .optional(),
    description: zod_1.z.string().trim().max(2000).optional().nullable(),
    priority: exports.taskPrioritySchema.optional(),
    status: exports.taskStatusSchema.optional(),
    dueDate: isoDateString.optional().nullable(),
});
exports.taskQuerySchema = zod_1.z.object({
    projectId: zod_1.z.string().uuid().optional(),
    status: exports.taskStatusSchema.optional(),
    priority: exports.taskPrioritySchema.optional(),
    search: zod_1.z.string().trim().optional(),
});
exports.taskResponseSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    projectId: zod_1.z.string().uuid(),
    name: zod_1.z.string(),
    description: zod_1.z.string().nullable().optional(),
    priority: exports.taskPrioritySchema,
    status: exports.taskStatusSchema,
    dueDate: zod_1.z.string().nullable().optional(),
    createdAt: zod_1.z.string().or(zod_1.z.date()),
    projectName: zod_1.z.string().optional(),
});
