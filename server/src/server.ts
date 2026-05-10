import { createApp } from './app';
import { config } from './config';
import { logger } from './utils/logger';

/**
 * Server entry point.
 * Responsible only for booting the HTTP listener and wiring process-level
 * signal handlers. All Express wiring lives in `app.ts` so the app can be
 * imported by tests without starting a network listener.
 */
async function bootstrap(): Promise<void> {
  const app = createApp();

  const server = app.listen(config.port, () => {
    logger.info(
      `Server listening on port ${config.port} (env=${config.nodeEnv}, api=${config.apiPrefix}/${config.apiVersion})`,
    );
  });

  const shutdown = (signal: string) => {
    logger.info(`Received ${signal}, shutting down gracefully...`);
    server.close((err) => {
      if (err) {
        logger.error('Error during shutdown', err);
        process.exit(1);
      }
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled promise rejection', reason);
  });
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception', err);
    process.exit(1);
  });
}

void bootstrap();