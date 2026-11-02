import { Link, useParams } from "react-router";
import { Badge } from "../../../components/ui/Badge";
import { Icone } from "../../../components/ui/Icone";
import { BoutonsInscription } from "../components/BoutonsInscription";
import { INFOS_CRENEAUX } from "../constantes";
import { useActivites } from "../contexte";

const CLASSE_LIEN_RETOUR =
  "mb-4 inline-flex items-center gap-1 text-sm font-semibold text-gresi-bleu hover:underline";

// Page de précision : s'affiche quand on clique sur une activité.
export default function ActiviteDetailPage() {
  const { activiteId } = useParams<{ activiteId: string }>();
  const { trouverActivite, estInscrit, estBloquee, activiteChoisieSurCreneau } = useActivites();

  const activite = activiteId === undefined ? undefined : trouverActivite(activiteId);

  if (activite === undefined) {
    return (
      <div>
        <Link to="/mon-espace/activites" className={CLASSE_LIEN_RETOUR}>
          <Icone nom="arrow_back" className="text-[18px]" />
          Retour aux activités
        </Link>
        <div className="rounded-lg border border-gresi-gris-bleu bg-white p-8 text-center">
          <h1 className="mb-2 text-2xl font-bold">Activité introuvable</h1>
          <p className="text-gresi-encre-douce">
            Cette activité n'existe pas ou n'est plus publiée. Retournez à la liste pour en choisir une autre.
          </p>
        </div>
      </div>
    );
  }

  const inscrit = estInscrit(activite.id);
  const bloquee = estBloquee(activite);
  const infosCreneau = INFOS_CRENEAUX[activite.creneau];
  const activiteEnConflit = bloquee
    ? activiteChoisieSurCreneau(activite.jour, activite.creneau)
    : undefined;

  return (
    <div>
      <Link to="/mon-espace/activites" className={CLASSE_LIEN_RETOUR}>
        <Icone nom="arrow_back" className="text-[18px]" />
        Retour aux activités
      </Link>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <article className="rounded-lg border border-gresi-gris-bleu bg-white p-6 sm:p-8">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Badge variante="info">
              J{activite.jour} · {infosCreneau.libelle}
            </Badge>
            {inscrit && (
              <Badge variante="succes">
                <Icone nom="check" className="text-[16px]" />
                Inscrit
              </Badge>
            )}
            {bloquee && <Badge variante="neutre">Créneau occupé</Badge>}
          </div>

          <h1 className="mb-4 text-3xl font-bold leading-tight">{activite.intitule}</h1>
          <p className="text-lg leading-relaxed">{activite.description}</p>

          <h2 className="mb-4 mt-8 text-xl font-semibold">Comment se passe votre repas ?</h2>
          <ol className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gresi-bleu text-sm font-bold text-white">
                1
              </span>
              <span>Inscrivez-vous à cette activité (une seule par créneau).</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gresi-bleu text-sm font-bold text-white">
                2
              </span>
              <span>Assistez à l'activité.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gresi-bleu text-sm font-bold text-white">
                3
              </span>
              <span>
                À la sortie, présentez votre{" "}
                <Link to="/mon-espace/qr" className="font-semibold text-gresi-bleu hover:underline">
                  QR Code
                </Link>{" "}
                au distributeur pour recevoir votre repas.
              </span>
            </li>
          </ol>
        </article>

        <aside className="h-fit rounded-lg border border-gresi-gris-bleu bg-white p-6">
          <h2 className="mb-4 text-xl font-semibold">Informations pratiques</h2>
          <dl className="space-y-3">
            <div className="flex items-start gap-3">
              <Icone nom="calendar_today" className="mt-0.5 text-[20px] text-gresi-bleu" />
              <div>
                <dt className="text-sm text-gresi-encre-douce">Jour</dt>
                <dd className="font-semibold">J{activite.jour}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Icone nom={infosCreneau.icone} className="mt-0.5 text-[20px] text-gresi-bleu" />
              <div>
                <dt className="text-sm text-gresi-encre-douce">Créneau</dt>
                <dd className="font-semibold">
                  {infosCreneau.libelle} · {infosCreneau.plage}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Icone nom="location_on" className="mt-0.5 text-[20px] text-gresi-bleu" />
              <div>
                <dt className="text-sm text-gresi-encre-douce">Lieu</dt>
                <dd className="font-semibold">{activite.lieu}</dd>
              </div>
            </div>
          </dl>

          <div className="mt-6 border-t border-gresi-gris-bleu pt-6">
            <BoutonsInscription activite={activite} />

            {activiteEnConflit && (
              <p className="mt-4 flex items-start gap-2 rounded bg-gresi-gris-bleu/30 p-3 text-sm">
                <Icone nom="lock" className="mt-0.5 text-[18px] text-gresi-encre-douce" />
                <span>
                  Vous êtes déjà inscrit à{" "}
                  <Link
                    to={`/mon-espace/activites/${activiteEnConflit.id}`}
                    className="font-semibold text-gresi-bleu hover:underline"
                  >
                    {activiteEnConflit.intitule}
                  </Link>{" "}
                  sur ce créneau. Annulez cette inscription pour choisir celle-ci.
                </span>
              </p>
            )}

            {inscrit && (
              <p className="mt-4 flex items-start gap-2 rounded bg-gresi-vert/15 p-3 text-sm">
                <Icone nom="verified" className="mt-0.5 text-[18px] text-gresi-vert-fonce" />
                <span>
                  Votre inscription est confirmée. Pensez à garder votre{" "}
                  <Link to="/mon-espace/qr" className="font-semibold text-gresi-bleu hover:underline">
                    QR Code
                  </Link>{" "}
                  prêt pour la sortie.
                </span>
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
