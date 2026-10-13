import type { Database } from '@gresi/shared';
import { createClient } from '@supabase/supabase-js';
import { env } from './env';

/**
 * Client Supabase UNIQUE de l'application.
 * Les appels à Supabase se font dans les fichiers `features/<domaine>/api.ts`,
 * jamais directement dans les composants.
 */
export const supabase = createClient<Database>(env.supabaseUrl, env.supabaseCle, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
