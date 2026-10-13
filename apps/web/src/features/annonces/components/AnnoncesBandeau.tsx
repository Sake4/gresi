import { useQuery } from '@tanstack/react-query';
import { chargerAnnoncesPubliees } from '../api';

/** Dernières annonces publiées, affichées en haut de l'espace participant */
export function AnnoncesBandeau() {
  const annonces = useQuery({ queryKey: ['annonces', 'publiees'], queryFn: chargerAnnoncesPubliees });

  if (!annonces.data?.length) return null;

  return (
    <div className="flex flex-col gap-2">
      {annonces.data.map((a) => (
        <article
          key={a.id}
          className="rounded-lg border-l-4 border-gresi-orange bg-white px-4 py-3 shadow-sm"
        >
          <h2 className="font-semibold">{a.titre}</h2>
          <p className="text-sm text-slate-700">{a.contenu}</p>
        </article>
      ))}
    </div>
  );
}
