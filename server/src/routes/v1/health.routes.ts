import { Router } from 'express';

import { healthController } from '../../controllers/health.controller';
import { asyncHandler } from '../../middleware/asyncHandler';

/**
 * Health probes.
 *   GET /api/v1/health        — liveness
 *   GET /api/v1/health/ready  — readiness (extend later with DB/external deps)
 */
export const healthRouter = Router();

healthRouter.get('/', asyncHandler(healthController.live));
healthRouter.get('/ready', asyncHandler(healthController.ready));