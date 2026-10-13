import { AFaire } from '@/components/ui/AFaire';

export default function PersonnelPage() {
  return (
    <AFaire
      titre="Personnel"
      semaine="S3"
      details={[
        'Liste des comptes (table personnel) ; activer / désactiver (est_actif).',
        'Création : Edge Function creer-personnel (email, nom, prénom, rôle) → mot de passe temporaire affiché une fois.',
      ]}
    />
  );
}
