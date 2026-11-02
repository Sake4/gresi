// Types du domaine « activités ».
// Ils suivent la table `activites` de la base (intitule, description, lieu, jour, creneau).
// Plus tard, ils seront remplacés par les types générés par Supabase.

export type Creneau = "matin" | "apres_midi";

/** Numéro du jour de l'évènement : J1 à J4. */
export type NumeroJour = 1 | 2 | 3 | 4;

export interface Activite {
  id: string;
  intitule: string;
  description: string;
  lieu: string;
  jour: NumeroJour;
  creneau: Creneau;
}
