import { AFaire } from '@/components/ui/AFaire';

export default function ActivitesPage() {
  return (
    <AFaire
      titre="Choisir mes activités"
      semaine="S2"
      details={[
        'Onglets par jour (dates lues dans parametres_evenement), puis matin / après-midi.',
        'Liste : chargerActivitesDuJour() dans features/activites/api.ts.',
        'Bouton « Choisir » → choisirActivite() (RPC choisir_activite) ; l’autre activité du créneau devient « Non choisie ».',
        "Après la mutation : invalider ['espace-participant', 'creneaux'].",
        'Erreurs : messageErreur() — ex. creneau_commence après le début de la session.',
      ]}
    />
  );
}
