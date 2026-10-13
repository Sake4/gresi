import { messageErreur } from '@gresi/shared';
import { Link } from 'react-router';
import { Alerte } from '@/components/ui/Alerte';
import { Carte } from '@/components/ui/Carte';
import { Chargement } from '@/components/ui/Chargement';
import { AnnoncesBandeau } from '@/features/annonces';
import { formaterCreneau, formaterJour } from '@/lib/format';
import { useMaFiche, useMesCreneaux } from '../hooks/useMaFiche';

export default function MonEspacePage() {
  const fiche = useMaFiche();
  const creneaux = useMesCreneaux();

  if (fiche.isPending || creneaux.isPending) return <Chargement />;
  if (fiche.isError) return <Alerte ton="erreur">{messageErreur(fiche.error)}</Alerte>;

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold text-gresi-bleu">Bonjour {fiche.data.prenom}</h1>
      <AnnoncesBandeau />

      <Carte titre="Mes créneaux">
        {creneaux.isError && <Alerte ton="erreur">{messageErreur(creneaux.error)}</Alerte>}
        {creneaux.data?.length === 0 && (
          <p className="text-sm text-slate-600">
            Aucune activité choisie.{' '}
            <Link to="/mon-espace/activites" className="font-medium text-gresi-bleu hover:underline">
              Choisir mes activités
            </Link>
          </p>
        )}
        <ul className="divide-y divide-gresi-gris">
          {creneaux.data?.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-3 py-3">
              <div>
                <p className="text-sm text-slate-500 capitalize">
                  {formaterJour(c.jour)} — {formaterCreneau(c.creneau)}
                </p>
                <p className="font-medium">{c.activites?.intitule}</p>
                <p className="text-sm text-slate-500">{c.activites?.lieu}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${c.valide_le ? 'bg-gresi-vert/15 text-green-800' : 'bg-gresi-gris text-slate-600'}`}
              >
                {c.valide_le ? 'Repas servi' : 'Inscrit'}
              </span>
            </li>
          ))}
        </ul>
      </Carte>

      <Link
        to="/mon-espace/qr"
        className="rounded-xl bg-gresi-bleu px-4 py-4 text-center text-lg font-semibold text-white shadow"
      >
        Afficher mon QR code
      </Link>
    </div>
  );
}
