/**
 * Application-level typed error.
 *
 * Controllers and services throw `ApiError` for any expected failure
 * (bad input, missing resource, forbidden action, etc.). The central error
 * middleware turns these into well-formed JSON responses.
 *
 * Use the static factories rather than `new ApiError(...)` directly for
 * readability and consistent codes.
 */
export class ApiError extends Error {
    public readonly statusCode: number;
    public readonly code: string;
    public readonly details?: unknown;
    public readonly isOperational: boolean;
  
    constructor(statusCode: number, message: string, code = 'API_ERROR', details?: unknown) {
      super(message);
      this.name = 'ApiError';
      this.statusCode = statusCode;
      this.code = code;
      this.details = details;
      this.isOperational = true;
      Error.captureStackTrace?.(this, this.constructor);
    }
  
    static badRequest(message = 'Bad request', details?: unknown): ApiError {
      return new ApiError(400, message, 'BAD_REQUEST', details);
    }
  
    static unauthorized(message = 'Unauthorized'): ApiError {
      return new ApiError(401, message, 'UNAUTHORIZED');
    }
  
    static forbidden(message = 'Forbidden'): ApiError {
      return new ApiError(403, message, 'FORBIDDEN');
    }
  
    static notFound(message = 'Not found'): ApiError {
      return new ApiError(404, message, 'NOT_FOUND');
    }
  
    static conflict(message = 'Conflict', details?: unknown): ApiError {
      return new ApiError(409, message, 'CONFLICT', details);
    }
  
    static unprocessable(message = 'Unprocessable entity', details?: unknown): ApiError {
      return new ApiError(422, message, 'UNPROCESSABLE_ENTITY', details);
    }
  
    static tooMany(message = 'Too many requests'): ApiError {
      return new ApiError(429, message, 'TOO_MANY_REQUESTS');
    }
  
    static internal(message = 'Internal server error', details?: unknown): ApiError {
      return new ApiError(500, message, 'INTERNAL_ERROR', details);
    }

    static payloadTooLarge(message = 'Payload too large', details?: unknown): ApiError {
      return new ApiError(413, message, 'PAYLOAD_TOO_LARGE', details);
    }
  }