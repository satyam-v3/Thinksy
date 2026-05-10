import type { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wraps async controllers so that any thrown/rejected error is forwarded to
 * the centralized error middleware via `next(err)`.
 *
 * Usage:
 *   router.get('/things', asyncHandler(async (req, res) => { ... }));
 */
export const asyncHandler =
  <T extends (req: Request, res: Response, next: NextFunction) => Promise<unknown>>(
    fn: T,
  ): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };