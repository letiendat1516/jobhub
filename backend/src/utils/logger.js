/**
 * Logger
 * ------------------------------------------------------------------
 * Structured logger built on top of `pino`.
 *
 * - In development: pretty, colorized output for readability.
 * - In production: newline-delimited JSON for log aggregation.
 *
 * Logging rules (see docs/07_AI_AGENT_RULES.md §17):
 *   - Structured logging only.
 *   - No leftover debug logs in production.
 *   - Avoid leaking secrets in log payloads.
 */
import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';
const level = process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug');

const transport = isProduction
  ? undefined
  : {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
        ignore: 'pid,hostname',
      },
    };

const logger = pino({
  level,
  ...(transport ? { transport } : {}),
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      '*.password',
      '*.accessToken',
      '*.refreshToken',
    ],
    censor: '[REDACTED]',
  },
});

export default logger;
