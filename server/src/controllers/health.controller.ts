import type { Request, Response } from 'express';

import { healthService } from '../services/health.service';
import { ApiResponse } from '../utils/ApiResponse';

/**
 * Health controller — thin HTTP layer over `healthService`.
 * Controllers should never contain business logic; they only translate
 * between HTTP requests and service calls.
 */
export const healthController = {
  live: async (_req: Request, res: Response): Promise<void> => {
    const data = await healthService.getLiveness();
    res.status(200).json(ApiResponse.success(data));
  },

  ready: async (_req: Request, res: Response): Promise<void> => {
    const data = await healthService.getReadiness();
    res.status(200).json(ApiResponse.success(data));
  },
};