import type { MethodeValidation, ResultatScan, TypeParticipant } from '../constantes';
import type { Tables } from './database.types';

export type Activite = Tables<'activites'>;
export type Inscription = Tables<'inscriptions'>;
export type Participant = Tables<'participants'>;
export type Personnel = Tables<'personnel'>;
export type Annonce = Tables<'annonces'>;
export type ParametresEvenement = Tables<'parametres_evenement'>;

/** Identité minimale renvoyée au distributeur (matricule masqué) */
export interface ParticipantResume {
  nom: string;
  prenom: string;
  type: TypeParticipant;
  /** Matricule masqué (« 24IN***17 ») ou statut pour un externe */
  identifiant: string;
}

/** Réponse JSON de valider_scan() et valider_manuellement() */
export interface ReponseScan {
  resultat: ResultatScan;
  participant: ParticipantResume | null;
  valide_le: string | null;
  /** « Prénom Nom » du distributeur qui a validé */
  valide_par: string | null;
  methode: MethodeValidation | null;
  compteur: { valides: number; inscrits: number } | null;
  /** Vrai si le serveur a reconnu un scan déjà traité (renvoi après coupure réseau) */
  rejeu: boolean;
}
