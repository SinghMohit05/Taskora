"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authResponseSchema = exports.userResponseSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    fullName: zod_1.z
        .string({ required_error: 'Full name is required' })
        .trim()
        .min(2, { message: 'Full name must be at least 2 characters' })
        .max(100, { message: 'Full name cannot exceed 100 characters' }),
    email: zod_1.z
        .string({ required_error: 'Email address is required' })
        .trim()
        .toLowerCase()
        .email({ message: 'Invalid email address format' })
        .max(255, { message: 'Email address cannot exceed 255 characters' }),
    password: zod_1.z
        .string({ required_error: 'Password is required' })
        .min(6, { message: 'Password must be at least 6 characters' })
        .max(100, { message: 'Password cannot exceed 100 characters' }),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z
        .string({ required_error: 'Email address is required' })
        .trim()
        .toLowerCase()
        .email({ message: 'Invalid email address format' }),
    password: zod_1.z
        .string({ required_error: 'Password is required' })
        .min(1, { message: 'Password is required' }),
});
exports.userResponseSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    fullName: zod_1.z.string(),
    email: zod_1.z.string().email(),
    createdAt: zod_1.z.string().or(zod_1.z.date()),
});
exports.authResponseSchema = zod_1.z.object({
    token: zod_1.z.string(),
    user: exports.userResponseSchema,
});
