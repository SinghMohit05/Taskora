import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma';
import { env } from '../../config/env';
import { AppError } from '../../utils/AppError';
import { signToken } from '../../utils/jwt';
import { RegisterInput, LoginInput } from './auth.validation';

// Pre-computed 10-round bcrypt hash to ensure constant-time response for unknown email addresses
const DUMMY_BCRYPT_HASH =
  '$2a$10$n.UdV/Vrw4qvHP/A23iNr.A9qE7EeOTGM6NyVFSYGY31KhIR7jB1a';

export class AuthService {
  async register(input: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new AppError(409, 'CONFLICT', 'An account with this email address already exists');
    }

    const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        fullName: input.fullName,
        email: input.email,
        passwordHash,
        tokenVersion: 0,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        tokenVersion: true,
        createdAt: true,
      },
    });

    const token = signToken({
      id: user.id,
      email: user.email,
      tokenVersion: user.tokenVersion,
    });

    return {
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        createdAt: user.createdAt,
      },
    };
  }

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      select: {
        id: true,
        fullName: true,
        email: true,
        passwordHash: true,
        tokenVersion: true,
        createdAt: true,
      },
    });

    // Constant-time execution path to defend against timing attacks
    if (!user) {
      await bcrypt.compare(input.password, DUMMY_BCRYPT_HASH);
      throw new AppError(401, 'UNAUTHORIZED', 'Invalid email or password');
    }

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!isMatch) {
      throw new AppError(401, 'UNAUTHORIZED', 'Invalid email or password');
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      tokenVersion: user.tokenVersion,
    });

    return {
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        createdAt: user.createdAt,
      },
    };
  }

  async logout(userId: string) {
    // Incrementing tokenVersion invalidates all existing JWTs for this user
    await prisma.user.update({
      where: { id: userId },
      data: {
        tokenVersion: {
          increment: 1,
        },
      },
    });

    return {
      message: 'Successfully logged out. All active session tokens have been invalidated.',
    };
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'NOT_FOUND', 'User profile not found');
    }

    return user;
  }
}

export const authService = new AuthService();
