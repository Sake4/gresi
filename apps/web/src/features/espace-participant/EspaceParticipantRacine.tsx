import { Outlet } from "react-router";
import { ActivitesProvider } from "../activites/ActivitesProvider";
import { BandeauRetour } from "../activites/components/BandeauRetour";

/**
 * Enveloppe invisible de toutes les pages de l'espace participant.
 * Elle garde en mémoire les inscriptions pendant qu'on passe d'une page à l'autre
 * et affiche le bandeau de confirmation.
 */
export function EspaceParticipantRacine() {
  return (
    <ActivitesProvider>
      <BandeauRetour />
      <Outlet />
    </ActivitesProvider>
  );
}
