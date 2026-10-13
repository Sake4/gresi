import { AFaire } from '@/components/ui/AFaire';

export default function MotDePasseOubliePage() {
  return (
    <AFaire
      titre="Mot de passe oublié"
      semaine="S5"
      details={[
        'Étape 1 : saisie de l’email → demanderReinitialisation() (features/auth/api.ts).',
        'Étape 2 (retour depuis l’email, évènement PASSWORD_RECOVERY) : saisie du nouveau mot de passe → supabase.auth.updateUser().',
        'Toujours afficher le même message, que l’email existe ou non.',
      ]}
    />
  );
}
