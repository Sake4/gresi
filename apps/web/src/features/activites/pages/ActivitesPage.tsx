import { useState } from "react";
import type { ReactNode } from "react";
import { Icone } from "../../../components/ui/Icone";
import { CarteActivite } from "../components/CarteActivite";
import { CRENEAUX, INFOS_CRENEAUX, JOURS } from "../constantes";
import { useActivites } from "../contexte";
import type { Creneau, NumeroJour } from "../types";

interface BoutonFiltreProps {
  actif: boolean;
  onClick: () => void;
  icone?: string;
  children: ReactNode;
}

function BoutonFiltre({ actif, onClick, icone, children }: BoutonFiltreProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={actif}
      className={`flex min-h-[44px] items-center gap-1.5 rounded border px-4 py-2 font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-gresi-bleu focus-visible:ring-offset-2 ${
        actif
          ? "border-gresi-bleu bg-gresi-bleu text-white"
          : "border-gresi-gris-bleu bg-gresi-gris text-gresi-encre-douce hover:bg-gresi-gris-bleu/30 hover:text-gresi-encre"
      }`}
    >
      {icone && <Icone nom={icone} className="text-[18px]" />}
      {children}
    </button>
  );
}

// Page d'accueil du participant : liste des activités, filtrée par jour et par créneau.
export default function ActivitesPage() {
  const { activites, activiteChoisieSurCreneau } = useActivites();
  const [jour, setJour] = useState<NumeroJour>(1);
  const [creneau, setCreneau] = useState<Creneau>("matin");

  const activitesAffichees = activites.filter(
    (activite) => activite.jour === jour && activite.creneau === creneau,
  );
  const activiteChoisie = activiteChoisieSurCreneau(jour, creneau);
  const infosCreneau = INFOS_CRENEAUX[creneau];

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Programme des activités</h1>
        <p className="mt-1 text-gresi-encre-douce">
          Choisissez l'activité à laquelle vous voulez assister sur chaque créneau.
        </p>
      </header>

      <section className="mb-6 flex items-start gap-4 rounded-lg border border-l-4 border-gresi-gris-bleu border-l-gresi-bleu bg-white p-4 sm:p-5">
        <Icone nom="info" className="mt-0.5 text-[24px] text-gresi-bleu" />
        <div>
          <h2 className="font-bold text-gresi-bleu">Une seule activité par créneau</h2>
          <p className="mt-1 leading-relaxed">
            Vous ne pouvez vous inscrire qu'à <strong>une seule activité par créneau</strong> (par
            exemple J1 Matin). Pour en choisir une autre sur le même créneau, annulez d'abord votre
            inscription en cours.
          </p>
        </div>
      </section>

      <section
        aria-label="Filtres"
        className="mb-6 rounded-lg border border-gresi-gris-bleu bg-white p-5"
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <div role="group" aria-label="Jour">
            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gresi-encre-douce">
              <Icone nom="calendar_today" className="text-[16px]" />
              Jour
            </p>
            <div className="flex flex-wrap gap-2">
              {JOURS.map((numero) => (
                <BoutonFiltre key={numero} actif={jour === numero} onClick={() => setJour(numero)}>
                  J{numero}
                </BoutonFiltre>
              ))}
            </div>
          </div>

          <div role="group" aria-label="Créneau" className="lg:border-l lg:border-gresi-gris-bleu lg:pl-6">
            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gresi-encre-douce">
              <Icone nom="schedule" className="text-[16px]" />
              Créneau
            </p>
            <div className="flex flex-wrap gap-2">
              {CRENEAUX.map((valeur) => (
                <BoutonFiltre
                  key={valeur}
                  actif={creneau === valeur}
                  onClick={() => setCreneau(valeur)}
                  icone={INFOS_CRENEAUX[valeur].icone}
                >
                  {INFOS_CRENEAUX[valeur].libelle} {INFOS_CRENEAUX[valeur].plage}
                </BoutonFiltre>
              ))}
            </div>
          </div>
        </div>

        <p
          aria-live="polite"
          className="mt-4 flex items-start gap-2 border-t border-gresi-gris-bleu pt-4 text-sm font-semibold"
        >
          <Icone nom="verified" className="text-[18px] text-gresi-bleu" />
          <span>
            {activitesAffichees.length} {activitesAffichees.length > 1 ? "activités" : "activité"} pour
            J{jour} — {infosCreneau.libelle}
            {activiteChoisie
              ? ` · Vous êtes inscrit à : ${activiteChoisie.intitule}`
              : " · Aucune inscription sur ce créneau"}
          </span>
        </p>
      </section>

      {activitesAffichees.length === 0 ? (
        <p className="rounded-lg border border-gresi-gris-bleu bg-white p-8 text-center text-gresi-encre-douce">
          Aucune activité n'est programmée sur ce créneau pour le moment.
        </p>
      ) : (
        <section
          aria-label={`Activités de J${jour}, ${infosCreneau.libelle}`}
          className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,320px),1fr))] gap-6"
        >
          {activitesAffichees.map((activite) => (
            <CarteActivite key={activite.id} activite={activite} />
          ))}
        </section>
      )}
    </div>
  );
}
