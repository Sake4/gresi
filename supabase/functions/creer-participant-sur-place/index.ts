// =============================================================================
// creer-participant-sur-place — inscription d'un retardataire au point d'accueil (UC6)
// Réservé aux admins (admin et admin supérieur).
//
// POST {
//   email, type: 'etudiant_inphb' | 'externe', nom, prenom,
//   matricule?, statut?, structure?, telephone?,
//   activite_id?            ← inscription immédiate au créneau en cours
// }
//   201 { participant_id, qr_token }
// Le participant reçoit un email pour choisir son mot de passe.
// =============================================================================
import { clientAdmin, motDePasseTemporaire, roleAppelant } from '../_shared/clientAdmin.ts';
import { erreur, json, preflight } from '../_shared/reponses.ts';

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;
  if (req.method !== 'POST') return erreur('methode_non_autorisee', 405);

  const admin = clientAdmin();
  const appelant = await roleAppelant(req, admin);
  if (appelant?.role !== 'admin' && appelant?.role !== 'admin_superieur') {
    return erreur('acces_refuse', 403);
  }

  let corps: Record<string, string | undefined>;
  try {
    corps = await req.json();
  } catch {
    return erreur('parametres_invalides');
  }
  const email = corps.email?.trim().toLowerCase() ?? '';
  if (!email.includes('@') || (corps.type !== 'etudiant_inphb' && corps.type !== 'externe')) {
    return erreur('parametres_invalides');
  }

  // 1. Compte Auth, email considéré comme vérifié par l'admin présent sur place
  const { data: cree, error: erreurAuth } = await admin.auth.admin.createUser({
    email,
    password: motDePasseTemporaire(),
    email_confirm: true,
  });
  if (erreurAuth || !cree.user) return erreur('email_deja_utilise', 409);
  const userId = cree.user.id;

  // 2. Fiche participant + QR (mêmes contrôles que l'inscription en ligne)
  const { data: participant, error } = await admin.rpc('_creer_participant', {
    p_user_id: userId,
    p_type: corps.type,
    p_nom: corps.nom ?? '',
    p_prenom: corps.prenom ?? '',
    p_consentement: true, // consentement recueilli oralement par l'admin (case cochée dans l'écran)
    p_telephone: corps.telephone ?? null,
    p_matricule: corps.matricule ?? null,
    p_statut: corps.statut ?? null,
    p_structure: corps.structure ?? null,
  });
  if (error) {
    await admin.auth.admin.deleteUser(userId);
    return erreur(error.message, 400); // ex. matricule_deja_utilise
  }

  // 3. Inscription au créneau en cours (le verrou horaire ne s'applique pas côté serveur)
  if (corps.activite_id) {
    const { data: activite } = await admin
      .from('activites')
      .select('id, jour, creneau, statut')
      .eq('id', corps.activite_id)
      .maybeSingle();
    if (activite?.statut === 'publiee') {
      await admin.from('inscriptions').upsert(
        {
          participant_id: userId,
          activite_id: activite.id,
          jour: activite.jour,
          creneau: activite.creneau,
        },
        { onConflict: 'participant_id,jour,creneau' },
      );
    }
  }

  // 4. Email pour choisir son mot de passe
  await admin.auth.resetPasswordForEmail(email, {
    redirectTo: `${Deno.env.get('URL_APPLICATION') ?? ''}/mot-de-passe-oublie`,
  });

  await admin.rpc('journaliser_pour', {
    p_auteur_id: appelant.id,
    p_action: 'participant.cree_sur_place',
    p_cible_table: 'participants',
    p_cible_id: userId,
  });

  return json(participant, 201);
});
