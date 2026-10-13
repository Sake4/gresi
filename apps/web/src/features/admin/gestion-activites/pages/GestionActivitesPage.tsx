import { AFaire } from '@/components/ui/AFaire';

export default function GestionActivitesPage() {
  return (
    <AFaire
      titre="Activités et affectations"
      semaine="S3"
      details={[
        'Création / modification : schemaActivite (@gresi/shared), écriture directe (RLS admin supérieur).',
        'Publication et annulation (statut) ; changement d’horaire refusé si des inscrits existent.',
        'Affectation de 1 à 3 distributeurs par activité (table affectations).',
      ]}
    />
  );
}
