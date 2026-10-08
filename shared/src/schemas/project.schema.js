"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectResponseSchema = exports.projectQuerySchema = exports.updateProjectSchema = exports.createProjectSchema = exports.projectStatusSchema = void 0;
const zod_1 = require("zod");
const enums_1 = require("../enums");
const isoDateString = zod_1.z
    .string()
    .trim()
    .refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format. Expected ISO date string.',
});
exports.projectStatusSchema = zod_1.z.enum(enums_1.PROJECT_STATUS_VALUES, {
    errorMap: () => ({
        message: `Status must be one of: ${enums_1.PROJECT_STATUS_VALUES.join(', ')}`,
    }),
});
exports.createProjectSchema = zod_1.z
    .object({
    name: zod_1.z
        .string({ required_error: 'Project name is required' })
        .trim()
        .min(1, { message: 'Project name cannot be empty' })
        .max(120, { message: 'Project name cannot exceed 120 characters' }),
    description: zod_1.z.string().trim().max(1000).optional().nullable(),
    status: exports.projectStatusSchema.default('Not Started'),
    startDate: isoDateString.optional().nullable(),
    endDate: isoDateString.optional().nullable(),
})
    .refine((data) => {
    if (data.startDate && data.endDate) {
        return new Date(data.endDate).getTime() >= new Date(data.startDate).getTime();
    }
    return true;
}, {
    message: 'End date must be greater than or equal to start date',
    path: ['endDate'],
});
exports.updateProjectSchema = zod_1.z
    .object({
    name: zod_1.z
        .string()
        .trim()
        .min(1, { message: 'Project name cannot be empty' })
        .max(120, { message: 'Project name cannot exceed 120 characters' })
        .optional(),
    description: zod_1.z.string().trim().max(1000).optional().nullable(),
    status: exports.projectStatusSchema.optional(),
    startDate: isoDateString.optional().nullable(),
    endDate: isoDateString.optional().nullable(),
})
    .refine((data) => {
    if (data.startDate && data.endDate) {
        return new Date(data.endDate).getTime() >= new Date(data.startDate).getTime();
    }
    return true;
}, {
    message: 'End date must be greater than or equal to start date',
    path: ['endDate'],
});
exports.projectQuerySchema = zod_1.z.object({
    search: zod_1.z.string().trim().optional(),
    status: exports.projectStatusSchema.optional(),
});
exports.projectResponseSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    ownerId: zod_1.z.string().uuid(),
    name: zod_1.z.string(),
    description: zod_1.z.string().nullable().optional(),
    status: exports.projectStatusSchema,
    startDate: zod_1.z.string().nullable().optional(),
    endDate: zod_1.z.string().nullable().optional(),
    createdAt: zod_1.z.string().or(zod_1.z.date()),
    taskCount: zod_1.z.number().int().nonnegative().optional(),
    completedTaskCount: zod_1.z.number().int().nonnegative().optional(),
});
