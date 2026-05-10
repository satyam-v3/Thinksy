/**
 * Shared types used across layers.
 * Feature-specific types should live in `src/types/<feature>.types.ts`.
 */

export type ISODateString = string;

export interface HealthStatus {
  status: 'ok' | 'degraded' | 'down';
  uptimeSeconds: number;
  timestamp: ISODateString;
  dependencies?: Record<string, 'ok' | 'degraded' | 'down'>;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
}

export interface Paginated<T> {
  items: T[];
  pagination: Pagination;
}