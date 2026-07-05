/**
 * Application configuration
 * ------------------------------------------------------------------
 * Single source of truth for runtime configuration.
 *
 * Reads from environment variables via dotenv. Never hardcode secrets,
 * connection strings, or feature flags — always read them here.
 *
 * Required variables are validated on boot so the server fails fast
 * with a clear message instead of failing later at runtime.
 */
import dotenv from 'dotenv';

dotenv.config();

const required = (key) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const optional = (key, fallback = undefined) => process.env[key] ?? fallback;

const config = {
  env: optional('NODE_ENV', 'development'),
  isProduction: process.env.NODE_ENV === 'production',
  port: Number(optional('PORT', '5000')),

  clientUrl: optional('CLIENT_URL', 'http://localhost:5173'),

  jwt: {
    secret: optional('JWT_SECRET', 'change-me-in-production'),
    accessTokenTtl: optional('JWT_ACCESS_TOKEN_TTL', '15m'),
    refreshTokenTtl: optional('JWT_REFRESH_TOKEN_TTL', '7d'),
  },

  supabase: {
    url: optional('SUPABASE_URL', ''),
    anonKey: optional('SUPABASE_ANON_KEY', ''),
    serviceRoleKey: optional('SUPABASE_SERVICE_ROLE_KEY', ''),
  },

  deepseek: {
    apiKey: optional('DEEPSEEK_API_KEY', ''),
    baseUrl: optional('DEEPSEEK_BASE_URL', 'https://api.deepseek.com'),
    model: optional('DEEPSEEK_MODEL', 'deepseek-chat'),
  },

  log: {
    level: optional('LOG_LEVEL', undefined),
  },
};

/**
 * Validates that production-critical secrets are present.
 * Called once from server.js on boot. Missing secrets throw and stop
 * the process rather than running in a broken state.
 */
export const assertRequiredEnv = () => {
  if (config.isProduction) {
    required('JWT_SECRET');
    required('SUPABASE_URL');
    required('SUPABASE_SERVICE_ROLE_KEY');
  }
};

export default config;
