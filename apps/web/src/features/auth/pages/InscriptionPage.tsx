import { Link } from 'react-router';
import { AFaire } from '@/components/ui/AFaire';

export default function InscriptionPage() {
  return (
    <>
      <AFaire
        titre="Créer un compte"
        semaine="S2"
        details={[
          'Choix du profil : étudiant INPHB ou participant externe (formulaire conditionnel).',
          'Étudiant : matricule + nom → Edge Function verifier-etudiant → école, filière et classe affichées en lecture seule.',
          'Externe : statut (liste fermée), structure et motif facultatifs.',
          'Téléphone facultatif ; case de consentement obligatoire + lien vers la notice.',
          'Validation : schemaInscription (@gresi/shared) ; envoi : creerCompte() dans features/auth/api.ts.',
          'Après envoi : message « Consultez votre boîte mail pour confirmer votre adresse ».',
        ]}
      />
      <p className="text-center text-sm">
        Déjà inscrit ?{' '}
        <Link to="/connexion" className="font-medium text-gresi-bleu hover:underline">
          Se connecter
        </Link>
      </p>
    </>
  );
}
