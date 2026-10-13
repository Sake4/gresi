import { Navigate } from 'react-router';
import { MiseEnPageAdmin } from '@/components/layout/MiseEnPageAdmin';
import { Chargement } from '@/components/ui/Chargement';
import { accueilPourRole, useSession } from '@/features/auth';
import { RequireRole } from './guards/RequireRole';

/** « / » : redirige vers l'accueil du rôle, ou vers la connexion */
export function Accueil() {
  const { session, role, chargement } = useSession();
  if (chargement) return <Chargement />;
  return <Navigate to={session ? accueilPourRole(role) : '/connexion'} replace />;
}

/** Espace /admin : menu adapté au rôle (admin ou admin supérieur) */
export function EspaceAdmin() {
  const { role } = useSession();
  return (
    <RequireRole roles={['admin', 'admin_superieur']}>
      <MiseEnPageAdmin role={role} />
    </RequireRole>
  );
}

export function PageIntrouvable() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="text-5xl font-bold text-gresi-bleu">404</p>
      <p>Cette page n’existe pas.</p>
      <a href="/" className="font-medium text-gresi-bleu underline">
        Retour à l’accueil
      </a>
    </div>
  );
}
