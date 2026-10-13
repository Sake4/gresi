import { corsHeaders } from './cors.ts';

export function json(corps: unknown, statut = 200): Response {
  return new Response(JSON.stringify(corps), {
    status: statut,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/** Erreur métier : `code` correspond à une clé de MESSAGES_ERREUR (packages/shared/src/erreurs.ts) */
export function erreur(code: string, statut = 400): Response {
  return json({ erreur: code }, statut);
}

/** Réponse au pré-vol CORS ; renvoie null pour les autres requêtes */
export function preflight(req: Request): Response | null {
  return req.method === 'OPTIONS' ? new Response('ok', { headers: corsHeaders }) : null;
}
