// =============================================================================
// envoyer-email — prévient les inscrits d'une activité annulée
// Réservé à l'admin supérieur. Prévu en S6.
//
// POST { activite_id }
//   200 { envoyes: number }
//
// TODO S6 :
// - lire les emails des inscrits (table inscriptions + participants, client admin)
// - envoyer via le SMTP configuré (secrets SMTP_HOTE, SMTP_PORT, SMTP_UTILISATEUR,
//   SMTP_MOT_DE_PASSE, EMAIL_EXPEDITEUR), par lots pour respecter le quota du fournisseur
// - journaliser l'envoi (journaliser_pour, action 'activite.inscrits_prevenus')
// =============================================================================
import { clientAdmin, roleAppelant } from '../_shared/clientAdmin.ts';
import { erreur, preflight } from '../_shared/reponses.ts';

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;

  const appelant = await roleAppelant(req, clientAdmin());
  if (appelant?.role !== 'admin_superieur') return erreur('acces_refuse', 403);

  return erreur('non_implemente', 501);
});
