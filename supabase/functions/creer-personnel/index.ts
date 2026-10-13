// =============================================================================
// creer-personnel — création d'un compte distributeur, admin ou admin supérieur
// Réservé à l'admin supérieur.
//
// POST { email, nom, prenom, role }
//   201 { id, email, mot_de_passe_temporaire }   ← à transmettre une seule fois
// =============================================================================
import {
  clientAdmin,
  motDePasseTemporaire,
  roleAppelant,
  type RolePersonnel,
} from '../_shared/clientAdmin.ts';
import { erreur, json, preflight } from '../_shared/reponses.ts';

const ROLES: RolePersonnel[] = ['distributeur', 'admin', 'admin_superieur'];

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  if (req.method !== 'POST') return erreur('methode_non_autorisee', 405);

  const admin = clientAdmin();
  const appelant = await roleAppelant(req, admin);
  if (appelant?.role !== 'admin_superieur') return erreur('acces_refuse', 403);

  let corps: Record<string, unknown>;
  try {
    corps = await req.json();
  } catch {
    return erreur('parametres_invalides');
  }
  const email = typeof corps.email === 'string' ? corps.email.trim().toLowerCase() : '';
  const nom = typeof corps.nom === 'string' ? corps.nom.trim() : '';
  const prenom = typeof corps.prenom === 'string' ? corps.prenom.trim() : '';
  const role = corps.role as RolePersonnel;
  if (!email.includes('@') || !nom || !prenom || !ROLES.includes(role)) {
    return erreur('parametres_invalides');
  }

  const motDePasse = motDePasseTemporaire();
  const { data: cree, error: erreurAuth } = await admin.auth.admin.createUser({
    email,
    password: motDePasse,
    email_confirm: true,
  });
  if (erreurAuth || !cree.user) {
    console.error('creer-personnel / auth', erreurAuth);
    return erreur('email_deja_utilise', 409);
  }

  const { error } = await admin.from('personnel').insert({ id: cree.user.id, role, nom, prenom });
  if (error) {
    // Pas de compte Auth orphelin
    await admin.auth.admin.deleteUser(cree.user.id);
    console.error('creer-personnel / personnel', error);
    return erreur('erreur_interne', 500);
  }

  // L'insertion est tracée par le trigger d'audit (auteur = système) ;
  // on ajoute l'auteur réel de l'action.
  await admin.rpc('journaliser_pour', {
    p_auteur_id: appelant.id,
    p_action: 'personnel.cree_par',
    p_cible_table: 'personnel',
    p_cible_id: cree.user.id,
  });

  return json({ id: cree.user.id, email, mot_de_passe_temporaire: motDePasse }, 201);
});
