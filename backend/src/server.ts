import app from './app';
import { env } from './config/env';
import { logger } from './lib/logger';
import { prisma } from './lib/prisma';

const server = app.listen(env.PORT, '0.0.0.0', () => {
  logger.info(
    {
      port: env.PORT,
      environment: env.NODE_ENV,
      pid: process.pid,
    },
    `🚀 TaskForge Backend API listening on port ${env.PORT}`
  );
});

// Graceful shutdown handling
const handleGracefulShutdown = async (signal: string) => {
  logger.info({ signal }, `Received ${signal}. Initiating graceful shutdown...`);

  // Stop accepting new connections
  server.close(async () => {
    logger.info('HTTP server closed successfully.');

    try {
      // Disconnect Prisma client connection pool
      await prisma.$disconnect();
      logger.info('Database connection pool disconnected.');
      process.exit(0);
    } catch (err) {
      logger.error({ err }, 'Error during database disconnection.');
      process.exit(1);
    }
  });

  // Force shutdown after 10-second timeout safeguard
  setTimeout(() => {
    logger.error('Graceful shutdown timed out. Forcing termination.');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled Promise Rejection detected');
});

process.on('uncaughtException', (error) => {
  logger.fatal({ error }, 'Uncaught Exception detected. Process exiting.');
  process.exit(1);
});
