import { z } from 'zod';

export const registerSchema = z
  .object({
    fullName: z
      .string({ required_error: 'Full name is required' })
      .trim()
      .min(2, { message: 'Full name must be at least 2 characters' })
      .max(100, { message: 'Full name cannot exceed 100 characters' }),
    email: z
      .string({ required_error: 'Email address is required' })
      .trim()
      .toLowerCase()
      .email({ message: 'Invalid email address format' })
      .max(255, { message: 'Email address cannot exceed 255 characters' }),
    password: z
      .string({ required_error: 'Password is required' })
      .min(8, { message: 'Password must be at least 8 characters long' })
      .max(100, { message: 'Password cannot exceed 100 characters' })
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d)/,
        { message: 'Password must contain at least one letter and one number' }
      ),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z
      .string({ required_error: 'Email address is required' })
      .trim()
      .toLowerCase()
      .email({ message: 'Invalid email address format' }),
    password: z
      .string({ required_error: 'Password is required' })
      .min(1, { message: 'Password is required' }),
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
