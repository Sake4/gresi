import { Carte } from './Carte';

/**
 * Espace réservé pour un écran pas encore développé.
 * À supprimer de chaque page quand le ticket correspondant est livré.
 */
export function AFaire({ titre, semaine, details }: { titre: string; semaine: string; details: string[] }) {
  return (
    <Carte titre={titre}>
      <p className="mb-2 text-sm text-slate-600">
        Écran prévu en <strong>{semaine}</strong> (cahier des charges fonctionnel V2.0).
      </p>
      <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
        {details.map((d) => (
          <li key={d}>{d}</li>
        ))}
      </ul>
    </Carte>
  );
}
