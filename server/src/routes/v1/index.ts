import { Router } from 'express';

import { healthRouter } from './health.routes';
import { pdfRouter } from './pdf.routes';
import { chatRouter, debugRouter } from './chat.routes';

/**
 * v1 route registry.
 *
 * Each feature module exposes a `Router` and is mounted here under its
 * resource path. Feature modules to be added later (deferred):
 *   - chatRouter      → /chat
 *   - quizRouter      → /quiz
 *   - analyticsRouter → /analytics
 *   - roadmapRouter   → /roadmap
 */
export const v1Router = Router();

v1Router.use('/health', healthRouter);
v1Router.use('/pdf', pdfRouter);
v1Router.use('/chat', chatRouter);
v1Router.use('/debug', debugRouter);