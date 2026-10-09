import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { AppError } from '../utils/AppError';
import { verifyToken, TokenPayload } from '../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(
        401,
        'UNAUTHORIZED',
        'Authentication token is required. Format: Bearer <token>'
      );
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication token is missing');
    }

    let payload: TokenPayload;
    try {
      payload = verifyToken(token);
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw new AppError(
          401,
          'TOKEN_EXPIRED',
          'Authentication token has expired. Please log in again.'
        );
      }
      throw new AppError(401, 'UNAUTHORIZED', 'Invalid or malformed authentication token');
    }

    // Check if the token version in the DB matches the token payload.
    // This allows us to easily revoke all active sessions if a user resets their password or logs out.
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        email: true,
        tokenVersion: true,
      },
    });

    if (!user) {
      throw new AppError(401, 'UNAUTHORIZED', 'User associated with token no longer exists');
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      throw new AppError(
        401,
        'UNAUTHORIZED',
        'Session has been invalidated. Please log in again.'
      );
    }

    req.user = {
      id: user.id,
      email: user.email,
    };

    next();
  } catch (error) {
    next(error);
  }
};
