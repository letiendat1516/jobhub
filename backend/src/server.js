/**
 * Server entry point
 * ------------------------------------------------------------------
 * Validates environment, boots the Express app, and binds to the port.
 *
 * Run:
 *   npm run dev     (development with auto-reload via nodemon)
 *   npm start       (production)
 */
import app from './app.js';
import config, { assertRequiredEnv } from './config/index.js';
import logger from './utils/logger.js';

const startServer = () => {
  try {
    assertRequiredEnv();

    const server = app.listen(config.port, () => {
      logger.info(
        `JobHub API listening on http://localhost:${config.port} (${config.env})`,
      );
    });

    const shutdown = (signal) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(() => {
        logger.info('Server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error(error, 'Failed to start server');
    process.exit(1);
  }
};

startServer();
