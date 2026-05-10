/**
 * Standard JSON response envelope used by every endpoint.
 *
 * Success: { success: true,  data: T }
 * Error:   { success: false, error: { message, code, details? } }
 *
 * Keeping a single shape lets the frontend write one transport layer
 * regardless of which feature it talks to.
 */
export interface ApiSuccess<T> {
    success: true;
    data: T;
  }
  
  export interface ApiFailure {
    success: false;
    error: {
      message: string;
      code: string;
      details?: unknown;
    };
  }
  
  export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;
  
  export const ApiResponse = {
    success<T>(data: T): ApiSuccess<T> {
      return { success: true, data };
    },
  
    error(
      message: string,
      opts: { code?: string; details?: unknown } = {},
    ): ApiFailure {
      return {
        success: false,
        error: {
          message,
          code: opts.code ?? 'API_ERROR',
          details: opts.details,
        },
      };
    },
  };