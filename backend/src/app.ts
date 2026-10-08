import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { httpLogger } from './lib/logger';
import { generalApiLimiter } from './middleware/rateLimiter';
import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './modules/auth/auth.routes';
import projectRoutes from './modules/projects/project.routes';
import taskRoutes from './modules/tasks/task.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import { AppError } from './utils/AppError';

export const createApp = (): Express => {
  const app = express();

  // 1. Trust proxy configuration (for deployment behind Render / Railway / reverse proxies)
  app.set('trust proxy', env.TRUST_PROXY);

  // 2. Security headers via Helmet
  app.use(helmet());

  // 3. CORS configuration
  const rawOrigins = env.CORS_ORIGINS.split(',').map((origin) => origin.trim());
  app.use(
    cors({
      origin: (origin, callback) => {
        // Mobile apps (React Native / Expo) and CLI tools (curl / Postman) send no origin
        if (!origin) {
          return callback(null, true);
        }

        const isAllowedOrigin = rawOrigins.includes(origin);
        const isLocalhostDev =
          env.NODE_ENV === 'development' &&
          (origin.startsWith('http://localhost:') ||
            origin.startsWith('http://127.0.0.1:') ||
            origin.startsWith('http://192.168.') ||
            origin.startsWith('http://10.') ||
            origin.startsWith('http://172.'));

        if (isAllowedOrigin || isLocalhostDev) {
          return callback(null, true);
        }

        return callback(
          new AppError(403, 'FORBIDDEN', `Origin '${origin}' not permitted by CORS policy`)
        );
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
    })
  );

  // 4. Request payload parsing with 100kb payload size limit
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: true, limit: '100kb' }));

  // 5. Pino HTTP Request Logger with automated header/password redaction
  app.use(httpLogger);

  // 6. Global API Rate Limiting for general abuse prevention
  app.use('/api', generalApiLimiter);

  // 7. Health Check Endpoint
  app.get('/api/health', (_req, res) => {
    res.status(200).json({
      success: true,
      data: {
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        environment: env.NODE_ENV,
      },
    });
  });

  // 8. REST API Module Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/tasks', taskRoutes);
  app.use('/api/dashboard', dashboardRoutes);

  // 9. Unmatched Route Handler (404)
  app.use(notFound);

  // 10. Centralized Error Handler
  app.use(errorHandler);

  return app;
};

const app = createApp();

export default app;
