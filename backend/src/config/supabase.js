/**
 * Supabase client
 * ------------------------------------------------------------------
 * Supabase is used ONLY as a relational database (PostgreSQL).
 *
 * Per docs/02_ARCHITECTURE.md:
 *   - Supabase Authentication is NOT used.
 *   - Authentication is implemented manually in the Service layer using JWT.
 *
 * The client created here is the single shared connection handed to the
 * Repository layer. Only repositories may import and use this client.
 *
 * NOTE: Database integration is intentionally disabled in this scaffold
 * phase (see docs/07_AI_AGENT_RULES.md §22 workflow). The client is
 * instantiated lazily so the server can boot without live credentials.
 */
import { createClient } from '@supabase/supabase-js';
import config from './index.js';
import logger from '../utils/logger.js';

let client = null;

/**
 * Returns the shared Supabase client, creating it on first use.
 * Uses the service-role key so Row-Level-Security policies can be
 * enforced entirely inside the Repository layer.
 *
 * @returns {import('@supabase/supabase-js').SupabaseClient | null}
 */
export const getSupabaseClient = () => {
  if (client) {
    return client;
  }

  const { url, serviceRoleKey } = config.supabase;
  if (!url || !serviceRoleKey) {
    logger.warn(
      'Supabase credentials are not configured. Database features are disabled (scaffold phase).',
    );
    return null;
  }

  client = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return client;
};

export default getSupabaseClient;
