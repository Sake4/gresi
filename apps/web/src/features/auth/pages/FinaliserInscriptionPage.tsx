import { AFaire } from '@/components/ui/AFaire';

export default function FinaliserInscriptionPage() {
  return (
    <AFaire
      titre="Finalisation de l’inscription"
      semaine="S2"
      details={[
        'Page atteinte depuis le lien de confirmation de l’email.',
        'Appelle finaliserInscription() (features/auth/api.ts) → RPC inscrire_participant.',
        'Succès : invalider la requête [session, role] puis rediriger vers /mon-espace.',
        'Erreurs : afficher messageErreur(erreur) (ex. matricule_deja_utilise).',
      ]}
    />
  );
}
