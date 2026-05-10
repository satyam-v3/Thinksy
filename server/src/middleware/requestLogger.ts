import morgan from 'morgan';

import { config } from '../config';

/**
 * HTTP request logger.
 * Uses `dev` format locally for readability and `combined` in production
 * for aggregator-friendly output.
 */
export const requestLogger = morgan(config.isProd ? 'combined' : 'dev');