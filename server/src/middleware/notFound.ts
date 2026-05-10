import type { RequestHandler } from 'express';

import { ApiError } from '../utils/ApiError';

/**
 * Catches any request that did not match a registered route and forwards a
 * 404 ApiError to the central error handler.
 */
export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};