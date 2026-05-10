import { config } from '../config';

/**
 * Minimal logging facade.
 *
 * Intentionally tiny so it can be swapped for pino/winston later without
 * touching call sites. Honors `LOG_LEVEL` from config.
 */
type Level = 'debug' | 'info' | 'warn' | 'error';

const order: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };

function shouldLog(level: Level): boolean {
  return order[level] >= order[config.logLevel];
}

function emit(level: Level, message: string, meta?: unknown): void {
  if (!shouldLog(level)) return;
  const ts = new Date().toISOString();
  const prefix = `[${ts}] [${level.toUpperCase()}]`;
  const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
  if (meta !== undefined) {
    fn(prefix, message, meta);
  } else {
    fn(prefix, message);
  }
}

export const logger = {
  debug: (msg: string, meta?: unknown) => emit('debug', msg, meta),
  info: (msg: string, meta?: unknown) => emit('info', msg, meta),
  warn: (msg: string, meta?: unknown) => emit('warn', msg, meta),
  error: (msg: string, meta?: unknown) => emit('error', msg, meta),
};