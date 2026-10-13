/**
 * Codes d'erreur métier levés par la base (`raise exception '<code>'`)
 * et messages affichés à l'utilisateur.
 * Toute nouvelle erreur SQL doit être ajoutée ici.
 */
export const MESSAGES_ERREUR = {
  // Comptes
  non_authentifie: 'Votre session a expiré. Reconnectez-vous.',
  email_non_confirme: 'Confirmez d’abord votre adresse email grâce au lien reçu.',
  utilisateur_inconnu: 'Compte introuvable.',
  compte_personnel: 'Ce compte appartient au personnel et ne peut pas s’inscrire comme participant.',
  deja_inscrit: 'Votre compte participant existe déjà.',
  consentement_requis: 'Vous devez accepter la notice sur les données personnelles.',
  matricule_requis: 'Le matricule est obligatoire.',
  matricule_inconnu: 'Ce matricule est inconnu de la scolarité. Vérifiez-le ou contactez l’organisation.',
  nom_discordant: 'Le nom ne correspond pas à ce matricule.',
  matricule_deja_utilise:
    'Ce matricule est déjà associé à un compte. Utilisez « Mot de passe oublié » ou contactez l’organisation.',
  email_institutionnel_requis: 'Utilisez votre adresse email institutionnelle.',
  statut_requis: 'Indiquez votre statut.',
  nom_prenom_requis: 'Le nom et le prénom sont obligatoires.',
  type_participant_incoherent: 'Profil de participant incohérent.',

  // Activités et inscriptions
  participant_requis: 'Cette action est réservée aux participants.',
  activite_indisponible: 'Cette activité n’est pas disponible.',
  activite_inconnue: 'Activité introuvable.',
  creneau_commence: 'La session a déjà commencé : le choix ne peut plus être modifié.',
  creneau_deja_valide: 'Ce créneau a déjà été validé.',
  aucun_choix: 'Aucune activité choisie pour ce créneau.',
  activite_avec_inscrits:
    'Cette activité a des inscrits : annulez-la et créez-en une nouvelle plutôt que de changer son horaire.',
  affectation_role_invalide: 'Seul un distributeur peut être affecté à une activité.',

  // Scan
  acces_refuse: 'Vous n’avez pas les droits pour cette action.',
  parametres_invalides: 'Requête incomplète.',
  scan_id_conflit: 'Conflit d’identifiant de scan. Rechargez la page.',
  recherche_trop_courte: 'Saisissez au moins 2 caractères.',

  // Administration
  participant_inconnu: 'Participant introuvable.',
} as const;

export type CodeErreur = keyof typeof MESSAGES_ERREUR;

const MESSAGE_PAR_DEFAUT = 'Une erreur est survenue. Réessayez dans un instant.';

/** Traduit une erreur Supabase/PostgREST en message lisible */
export function messageErreur(erreur: unknown): string {
  const code = codeErreur(erreur);
  return code ? MESSAGES_ERREUR[code] : MESSAGE_PAR_DEFAUT;
}

export function codeErreur(erreur: unknown): CodeErreur | null {
  const message =
    typeof erreur === 'object' && erreur !== null && 'message' in erreur
      ? String((erreur as { message: unknown }).message)
      : typeof erreur === 'string'
        ? erreur
        : '';
  return message in MESSAGES_ERREUR ? (message as CodeErreur) : null;
}
