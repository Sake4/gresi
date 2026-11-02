import { Bouton } from "../../../components/ui/Bouton";
import { Icone } from "../../../components/ui/Icone";
import { useActivites } from "../contexte";
import type { Activite } from "../types";

interface BoutonsInscriptionProps {
  activite: Activite;
}

/**
 * Le bon bouton selon la situation :
 *  - inscrit       -> « Annuler l'inscription »
 *  - créneau pris  -> « Créneau déjà réservé » (désactivé)
 *  - sinon         -> « S'inscrire »
 */
export function BoutonsInscription({ activite }: BoutonsInscriptionProps) {
  const { estInscrit, estBloquee, choisir, retirer } = useActivites();

  if (estInscrit(activite.id)) {
    return (
      <Bouton variante="alerte" pleineLargeur onClick={() => retirer(activite.id)}>
        <Icone nom="cancel" className="text-[18px] text-gresi-orange" />
        Annuler l'inscription
      </Bouton>
    );
  }

  if (estBloquee(activite)) {
    return (
      <Bouton variante="desactive" pleineLargeur disabled>
        <Icone nom="block" className="text-[18px]" />
        Créneau déjà réservé
      </Bouton>
    );
  }

  return (
    <Bouton variante="succes" pleineLargeur onClick={() => choisir(activite.id)}>
      <Icone nom="check" className="text-[18px]" />
      S'inscrire
    </Bouton>
  );
}
