import type { Creneau, NumeroJour } from "./types";

// Jours de l'évènement : J1 à J4.
export const JOURS: NumeroJour[] = [1, 2, 3, 4];

// Deux créneaux par jour (cahier des charges fonctionnel, §1.1).
export const CRENEAUX: Creneau[] = ["matin", "apres_midi"];

export interface InfosCreneau {
  libelle: string;
  plage: string;
  icone: string;
}

export const INFOS_CRENEAUX: Record<Creneau, InfosCreneau> = {
  matin: { libelle: "Matin", plage: "8h – 12h", icone: "wb_sunny" },
  apres_midi: { libelle: "Après-midi", plage: "14h – 18h", icone: "wb_twilight" },
};

// Clé unique d'un créneau (jour + matin/après-midi).
// Elle sert à appliquer la règle RG1 : une seule activité par créneau.
export function cleCreneau(jour: NumeroJour, creneau: Creneau): string {
  return `${jour}-${creneau}`;
}
