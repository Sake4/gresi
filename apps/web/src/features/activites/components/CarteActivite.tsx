import { Link } from "react-router";
import { Badge } from "../../../components/ui/Badge";
import { Icone } from "../../../components/ui/Icone";
import { INFOS_CRENEAUX } from "../constantes";
import { useActivites } from "../contexte";
import type { Activite } from "../types";
import { BoutonsInscription } from "./BoutonsInscription";

interface CarteActiviteProps {
  activite: Activite;
}

export function CarteActivite({ activite }: CarteActiviteProps) {
  const { estInscrit, estBloquee } = useActivites();
  const inscrit = estInscrit(activite.id);
  const bloquee = estBloquee(activite);
  const infosCreneau = INFOS_CRENEAUX[activite.creneau];

  const styleCarte = inscrit
    ? "border-gresi-vert bg-white ring-1 ring-gresi-vert"
    : bloquee
      ? "border-gresi-gris-bleu bg-gresi-gris-bleu/20"
      : "border-gresi-gris-bleu bg-white hover:border-gresi-bleu";

  return (
    <article
      className={`flex flex-col justify-between rounded-lg border p-6 transition-colors ${styleCarte}`}
    >
      <div>
        <div className="mb-3 flex min-h-[28px] items-start justify-end">
          {inscrit && (
            <Badge variante="succes">
              <Icone nom="check" className="text-[16px]" />
              Inscrit
            </Badge>
          )}
          {bloquee && <Badge variante="neutre">Créneau occupé</Badge>}
        </div>

        <h3 className="mb-3 text-xl font-semibold leading-snug">
          <Link
            to={`/mon-espace/activites/${activite.id}`}
            className="hover:text-gresi-bleu hover:underline focus-visible:ring-2 focus-visible:ring-gresi-bleu"
          >
            {activite.intitule}
          </Link>
        </h3>

        <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-gresi-encre-douce">
          {activite.description}
        </p>

        <ul className="space-y-2 border-t border-gresi-gris-bleu pt-3 text-sm">
          <li className="flex items-center gap-2.5">
            <Icone nom="location_on" className="text-[18px] text-gresi-bleu" />
            <span className="font-medium">{activite.lieu}</span>
          </li>
          <li className="flex items-center gap-2.5">
            <Icone nom="schedule" className="text-[18px] text-gresi-bleu" />
            <span>
              {infosCreneau.libelle} · {infosCreneau.plage}
            </span>
          </li>
        </ul>
      </div>

      <div className="mt-4 space-y-3 border-t border-gresi-gris-bleu pt-4">
        <BoutonsInscription activite={activite} />
        <Link
          to={`/mon-espace/activites/${activite.id}`}
          className="flex items-center justify-center gap-1 text-sm font-semibold text-gresi-bleu hover:underline"
        >
          Voir le détail
          <Icone nom="chevron_right" className="text-[18px]" />
        </Link>
      </div>
    </article>
  );
}
