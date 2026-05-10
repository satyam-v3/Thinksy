/**
 * Express Request augmentation.
 *
 * Add fields here that are attached by middleware (e.g. `req.user` from auth,
 * `req.requestId` from a correlation-id middleware) so controllers consume
 * them with full type safety.
 */
import 'express';

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

export {};