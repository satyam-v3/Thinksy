import type { HealthStatus } from '../types';

/**
 * Health service — domain layer.
 * Returns plain DTOs; HTTP concerns live in the controller.
 *
 * Extend `getReadiness` later to probe downstream dependencies
 * (database, vector store, AI provider, etc.).
 */
export const healthService = {
  async getLiveness(): Promise<HealthStatus> {
    return {
      status: 'ok',
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  },

  async getReadiness(): Promise<HealthStatus> {
    return {
      status: 'ok',
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
      dependencies: {},
    };
  },
};