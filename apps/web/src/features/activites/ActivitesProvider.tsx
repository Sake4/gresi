import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { cleCreneau } from "./constantes";
import { ActivitesContext } from "./contexte";
import type { ContexteActivites, MessageRetour } from "./contexte";
import { ACTIVITES_DEMO, CHOIX_DEMO_INITIAUX } from "./donneesDemo";
import type { Activite, Creneau, NumeroJour } from "./types";

interface ActivitesProviderProps {
  children: ReactNode;
}

/**
 * Garde en mémoire les choix du participant et les partage entre toutes les pages
 * (liste, détail…). Pour l'instant tout est local : plus tard, ces fonctions
 * appelleront Supabase (choisir_activite, retirer_choix).
 */
export function ActivitesProvider({ children }: ActivitesProviderProps) {
  // clé du créneau (ex. "1-matin") -> id de l'activité choisie
  const [choix, setChoix] = useState<Partial<Record<string, string>>>(CHOIX_DEMO_INITIAUX);
  const [message, setMessage] = useState<MessageRetour | null>(null);

  // Le message disparaît tout seul après 5 secondes.
  useEffect(() => {
    if (message === null) return;
    const minuteur = window.setTimeout(() => setMessage(null), 5000);
    return () => window.clearTimeout(minuteur);
  }, [message]);

  function trouverActivite(id: string): Activite | undefined {
    return ACTIVITES_DEMO.find((activite) => activite.id === id);
  }

  function activiteChoisieSurCreneau(jour: NumeroJour, creneau: Creneau): Activite | undefined {
    const id = choix[cleCreneau(jour, creneau)];
    return id === undefined ? undefined : trouverActivite(id);
  }

  function estInscrit(activiteId: string): boolean {
    return Object.values(choix).includes(activiteId);
  }

  function estBloquee(activite: Activite): boolean {
    const idChoisi = choix[cleCreneau(activite.jour, activite.creneau)];
    return idChoisi !== undefined && idChoisi !== activite.id;
  }

  function choisir(activiteId: string) {
    const activite = trouverActivite(activiteId);
    if (activite === undefined) return;

    if (estBloquee(activite)) {
      setMessage({
        type: "info",
        texte: "Vous êtes déjà inscrit à une activité sur ce créneau. Annulez-la d'abord pour en choisir une autre.",
      });
      return;
    }
    setChoix({ ...choix, [cleCreneau(activite.jour, activite.creneau)]: activite.id });
    setMessage({ type: "succes", texte: `Inscription confirmée : ${activite.intitule}.` });
  }

  function retirer(activiteId: string) {
    const activite = trouverActivite(activiteId);
    if (activite === undefined) return;

    const suivant = { ...choix };
    delete suivant[cleCreneau(activite.jour, activite.creneau)];
    setChoix(suivant);
    setMessage({ type: "info", texte: `Inscription annulée : ${activite.intitule}.` });
  }

  const valeur: ContexteActivites = {
    activites: ACTIVITES_DEMO,
    message,
    fermerMessage: () => setMessage(null),
    trouverActivite,
    estInscrit,
    estBloquee,
    activiteChoisieSurCreneau,
    choisir,
    retirer,
  };

  return <ActivitesContext.Provider value={valeur}>{children}</ActivitesContext.Provider>;
}
