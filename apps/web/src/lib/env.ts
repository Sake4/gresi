import { DELAI_ANTI_REBOND_MS_DEFAUT, DUREE_RESULTAT_MS_DEFAUT } from '@gresi/shared';
import { z } from 'zod';

/**
 * Lecture et validation des variables VITE_* au démarrage.
 * Une variable manquante fait échouer l'application immédiatement,
 * avec un message clair, plutôt que de provoquer des erreurs obscures plus tard.
 */
const schemaEnv = z.object({
  VITE_SUPABASE_URL: z.url('VITE_SUPABASE_URL doit être une URL'),
  VITE_SUPABASE_PUBLISHABLE_KEY: z.string().min(20, 'VITE_SUPABASE_PUBLISHABLE_KEY manquante'),
  VITE_ENV: z.enum(['dev', 'preprod', 'prod']).default('dev'),
  VITE_DELAI_ANTI_REBOND_MS: z.coerce.number().int().positive().default(DELAI_ANTI_REBOND_MS_DEFAUT),
  VITE_DUREE_RESULTAT_MS: z.coerce.number().int().positive().default(DUREE_RESULTAT_MS_DEFAUT),
});

const resultat = schemaEnv.safeParse(import.meta.env);

if (!resultat.success) {
  const details = resultat.error.issues.map((i) => `- ${i.path.join('.')} : ${i.message}`).join('\n');
  throw new Error(`Configuration invalide (voir apps/web/.env.example) :\n${details}`);
}

export const env = {
  supabaseUrl: resultat.data.VITE_SUPABASE_URL,
  supabaseCle: resultat.data.VITE_SUPABASE_PUBLISHABLE_KEY,
  environnement: resultat.data.VITE_ENV,
  delaiAntiRebondMs: resultat.data.VITE_DELAI_ANTI_REBOND_MS,
  dureeResultatMs: resultat.data.VITE_DUREE_RESULTAT_MS,
} as const;
