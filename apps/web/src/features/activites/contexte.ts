import { createContext, useContext } from "react";
import type { Activite, Creneau, NumeroJour } from "./types";

export interface MessageRetour {
  type: "succes" | "info";
  texte: string;
}

export interface ContexteActivites {
  /** Toutes les activités publiées. */
  activites: Activite[];
  /** Message affiché en haut de page après une action (inscription, annulation…). */
  message: MessageRetour | null;
  fermerMessage: () => void;
  trouverActivite: (id: string) => Activite | undefined;
  /** Le participant est-il inscrit à cette activité ? */
  estInscrit: (activiteId: string) => boolean;
  /** Une AUTRE activité du même créneau est déjà choisie : celle-ci est bloquée (RG1). */
  estBloquee: (activite: Activite) => boolean;
  /** Activité choisie sur ce créneau, s'il y en a une. */
  activiteChoisieSurCreneau: (jour: NumeroJour, creneau: Creneau) => Activite | undefined;
  choisir: (activiteId: string) => void;
  retirer: (activiteId: string) => void;
}

export const ActivitesContext = createContext<ContexteActivites | null>(null);

export function useActivites(): ContexteActivites {
  const contexte = useContext(ActivitesContext);
  if (contexte === null) {
    throw new Error("useActivites doit être utilisé à l'intérieur de <ActivitesProvider>.");
  }
  return contexte;
}
