import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';

/**
 * Client avec la clé service_role : CONTOURNE LA RLS.
 * À n'utiliser que dans les Edge Functions, jamais côté navigateur.
 * SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont fournies automatiquement par Supabase.
 */
export function clientAdmin(): SupabaseClient {
  return createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export type RolePersonnel = 'distributeur' | 'admin' | 'admin_superieur';

/**
 * Identifie l'appelant à partir de son jeton (en-tête Authorization)
 * et renvoie son rôle de personnel actif, ou null.
 */
export async function roleAppelant(
  req: Request,
  admin: SupabaseClient,
): Promise<{ id: string; role: RolePersonnel | null } | null> {
  const jeton = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
  if (!jeton) return null;

  const { data, error } = await admin.auth.getUser(jeton);
  if (error || !data.user) return null;

  const { data: personnel } = await admin
    .from('personnel')
    .select('role, est_actif')
    .eq('id', data.user.id)
    .maybeSingle();

  return {
    id: data.user.id,
    role: personnel?.est_actif ? (personnel.role as RolePersonnel) : null,
  };
}

/** Mot de passe temporaire lisible (sans caractères ambigus) */
export function motDePasseTemporaire(longueur = 14): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const octets = crypto.getRandomValues(new Uint8Array(longueur));
  return Array.from(octets, (o) => alphabet[o % alphabet.length]).join('');
}
