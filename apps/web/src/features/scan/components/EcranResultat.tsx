import { LIBELLES_RESULTAT_SCAN, type ReponseScan } from '@gresi/shared';
import { formaterHeure } from '@/lib/format';

/** Plein écran vert (repas autorisé) ou rouge (refus + motif) */
export function EcranResultat({ reponse }: { reponse: ReponseScan }) {
  const valide = reponse.resultat === 'valide';
  const p = reponse.participant;

  return (
    <div
      role="alert"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 p-6 text-center ${valide ? 'bg-gresi-vert' : 'bg-gresi-orange'}`}
    >
      <p className="text-6xl" aria-hidden>
        {valide ? '✓' : '✕'}
      </p>
      <p className="text-3xl font-bold">{LIBELLES_RESULTAT_SCAN[reponse.resultat]}</p>
      {p && (
        <div className="text-xl">
          <p className="font-semibold">
            {p.prenom} {p.nom}
          </p>
          <p className="opacity-90">{p.identifiant}</p>
        </div>
      )}
      {reponse.resultat === 'deja_utilise' && reponse.valide_le && (
        <p className="text-lg">
          Validé à {formaterHeure(reponse.valide_le)}
          {reponse.valide_par && <> par {reponse.valide_par}</>}
        </p>
      )}
    </div>
  );
}
