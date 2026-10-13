import { LIBELLES_STATUT_ACTIVITE, messageErreur } from '@gresi/shared';
import { useQuery } from '@tanstack/react-query';
import { Alerte } from '@/components/ui/Alerte';
import { Carte } from '@/components/ui/Carte';
import { Chargement } from '@/components/ui/Chargement';
import { formaterCreneau, formaterJour } from '@/lib/format';
import { chargerStatistiques } from '../api';

/**
 * Version minimale (S4). TODO S5 : filtre par jour, totaux par repas,
 * compteurs en temps réel, export CSV pour les commandes de repas.
 */
export default function StatistiquesPage() {
  const stats = useQuery({
    queryKey: ['admin', 'statistiques'],
    queryFn: () => chargerStatistiques(),
    refetchInterval: 15_000,
  });

  if (stats.isPending) return <Chargement />;
  if (stats.isError) return <Alerte ton="erreur">{messageErreur(stats.error)}</Alerte>;

  return (
    <Carte titre="Statistiques par activité">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gresi-gris-bleu text-slate-500">
            <tr>
              <th className="py-2 pr-4">Jour</th>
              <th className="py-2 pr-4">Créneau</th>
              <th className="py-2 pr-4">Activité</th>
              <th className="py-2 pr-4">Statut</th>
              <th className="py-2 pr-4 text-right">Inscrits</th>
              <th className="py-2 pr-4 text-right">Validés</th>
              <th className="py-2 text-right">Présence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gresi-gris">
            {stats.data.map((s) => (
              <tr key={s.activite_id}>
                <td className="py-2 pr-4 capitalize">{formaterJour(s.jour)}</td>
                <td className="py-2 pr-4">{formaterCreneau(s.creneau)}</td>
                <td className="py-2 pr-4">
                  <p className="font-medium">{s.intitule}</p>
                  <p className="text-slate-500">{s.lieu}</p>
                </td>
                <td className="py-2 pr-4">{LIBELLES_STATUT_ACTIVITE[s.statut]}</td>
                <td className="py-2 pr-4 text-right tabular-nums">{s.inscrits}</td>
                <td className="py-2 pr-4 text-right tabular-nums">{s.valides}</td>
                <td className="py-2 text-right tabular-nums">
                  {s.taux_presence === null ? '—' : `${s.taux_presence} %`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Carte>
  );
}
