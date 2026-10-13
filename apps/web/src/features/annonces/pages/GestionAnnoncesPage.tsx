import { AFaire } from '@/components/ui/AFaire';

export default function GestionAnnoncesPage() {
  return (
    <AFaire
      titre="Annonces"
      semaine="S6"
      details={[
        'Liste des annonces (publiées et brouillons) ; création, modification, publication.',
        'Écriture directe dans la table annonces (RLS : admin et admin supérieur).',
        'publiee_le est renseigné automatiquement par la base à la publication.',
      ]}
    />
  );
}
