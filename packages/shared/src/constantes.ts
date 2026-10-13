import type { Enums } from './types/database.types';

export type Creneau = Enums<'creneau'>;
export type RolePersonnel = Enums<'role_personnel'>;
export type TypeParticipant = Enums<'type_participant'>;
export type StatutExterne = Enums<'statut_externe'>;
export type StatutActivite = Enums<'statut_activite'>;
export type ResultatScan = Enums<'resultat_scan'>;
export type MethodeValidation = Enums<'methode_validation'>;

/** Rôle de l'utilisateur connecté, côté application */
export type Role = RolePersonnel | 'participant';

export const CRENEAUX = ['matin', 'apres_midi'] as const satisfies readonly Creneau[];

export const LIBELLES_CRENEAU: Record<Creneau, string> = {
  matin: 'Matin (8h–12h)',
  apres_midi: 'Après-midi (14h–18h)',
};

export const LIBELLES_ROLE: Record<Role, string> = {
  participant: 'Participant',
  distributeur: 'Distributeur',
  admin: 'Admin',
  admin_superieur: 'Admin supérieur',
};

export const LIBELLES_STATUT_EXTERNE: Record<StatutExterne, string> = {
  etudiant_hors_inphb: 'Étudiant (hors INPHB)',
  professionnel: 'Professionnel',
  visiteur: 'Visiteur',
  autre: 'Autre',
};

export const LIBELLES_STATUT_ACTIVITE: Record<StatutActivite, string> = {
  brouillon: 'Brouillon',
  publiee: 'Publiée',
  annulee: 'Annulée',
};

/** Texte affiché sur l'écran du distributeur pour chaque résultat de scan */
export const LIBELLES_RESULTAT_SCAN: Record<ResultatScan, string> = {
  valide: 'Repas autorisé',
  deja_utilise: 'Déjà servi',
  non_inscrit: 'Pas inscrit à cette activité',
  non_affecte: 'Vous n’êtes pas affecté à cette activité',
  hors_creneau: 'En dehors de l’horaire de distribution',
  qr_invalide: 'QR code invalide',
};

/** Préfixe des QR codes GRESI, version 1 du format : « GRESI:1:<uuid> » */
export const PREFIXE_QR = 'GRESI:1:';

/** Un même QR relu dans ce délai est ignoré par l'écran de scan */
export const DELAI_ANTI_REBOND_MS_DEFAUT = 3000;

/** Durée d'affichage du résultat vert/rouge avant reprise du scan */
export const DUREE_RESULTAT_MS_DEFAUT = 1500;
