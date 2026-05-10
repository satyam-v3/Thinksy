import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { MulterError } from 'multer';

import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { config } from '../config';
import { logger } from '../utils/logger';

/**
 * Map a MulterError to an ApiError so upload failures share the standard
 * response envelope. Multer's `code` values are documented and stable.
 */
function mapMulterError(err: MulterError): ApiError {
  switch (err.code) {
    case 'LIMIT_FILE_SIZE':
      return ApiError.payloadTooLarge('Uploaded file exceeds the size limit', {
        field: err.field,
        maxBytes: config.maxUploadBytes,
      });
    case 'LIMIT_UNEXPECTED_FILE':
      return ApiError.badRequest('Unexpected file field', { field: err.field });
    case 'LIMIT_FILE_COUNT':
      return ApiError.badRequest('Too many files in upload');
    case 'LIMIT_PART_COUNT':
    case 'LIMIT_FIELD_COUNT':
    case 'LIMIT_FIELD_KEY':
    case 'LIMIT_FIELD_VALUE':
      return ApiError.badRequest('Malformed multipart request', { code: err.code });
    default:
      return ApiError.badRequest(err.message || 'Upload error', { code: err.code });
  }
}

/**
 * Centralized error middleware.
 *
 * Every error thrown inside a controller (sync or async via `asyncHandler`)
 * funnels here. It normalizes known error types into a consistent JSON shape
 * and hides internal details in production.
 */
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json(
      ApiResponse.error(err.message, {
        code: err.code,
        details: err.details,
      }),
    );
    return;
  }

  if (err instanceof MulterError) {
    const mapped = mapMulterError(err);
    res.status(mapped.statusCode).json(
      ApiResponse.error(mapped.message, {
        code: mapped.code,
        details: mapped.details,
      }),
    );
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json(
      ApiResponse.error('Validation failed', {
        code: 'VALIDATION_ERROR',
        details: err.flatten(),
      }),
    );
    return;
  }

  logger.error(`Unhandled error on ${req.method} ${req.originalUrl}`, err);

  res.status(500).json(
    ApiResponse.error('Internal server error', {
      code: 'INTERNAL_ERROR',
      details: config.isProd ? undefined : { message: (err as Error)?.message },
    }),
  );
};