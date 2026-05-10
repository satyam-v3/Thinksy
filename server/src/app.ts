import express, { type Application, type RequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';

import { config } from './config';
import { registerRoutes } from './routes';
import { requestLogger } from './middleware/requestLogger';
import { notFoundHandler } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';

/**
 * Express application factory.
 *
 * Builds and returns a fully-wired Express instance without starting a
 * listener. Exported as a function so integration tests can spin up an
 * isolated app per suite.
 */
export function createApp(): Application {
  const app = express();

  // --- Core middleware (order matters) ---
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: config.corsOrigin, credentials: true }));
  app.use(compression() as unknown as RequestHandler);
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);

  // --- Versioned API routes ---
  registerRoutes(app);

  // --- Tail handlers (must be registered last) ---
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}