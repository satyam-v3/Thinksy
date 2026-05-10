import type { Application } from 'express';

import { config } from '../config';
import { v1Router } from './v1';

/**
 * Mounts all versioned API routers onto the Express app.
 *
 * Adding a new API version:
 *   1. Create `src/routes/v2/index.ts`
 *   2. Import it here and mount under `${config.apiPrefix}/v2`
 *
 * Older versions remain mounted to preserve backward compatibility.
 */
export function registerRoutes(app: Application): void {
  app.get('/', (_req, res) => {
    res.json({
      name: 'ai-learning-companion-server',
      status: 'ok',
      api: `${config.apiPrefix}/${config.apiVersion}`,
    });
  });

  app.use(`${config.apiPrefix}/v1`, v1Router);
}