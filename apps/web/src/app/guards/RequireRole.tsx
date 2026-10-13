import type { Role } from '@gresi/shared';
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { Chargement } from '@/components/ui/Chargement';
import { accueilPourRole, useSession } from '@/features/auth';

/**
 * Protège une partie de l'application.
 * ATTENTION : c'est un confort d'interface, pas une sécurité.
 * La sécurité réelle est assurée par la RLS et les contrôles des RPC.
 */
export function RequireRole({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { session, role, chargement } = useSession();
  const location = useLocation();

  if (chargement) return <Chargement />;
  if (!session) return <Navigate to="/connexion" replace state={{ depuis: location.pathname }} />;
  if (!role || !roles.includes(role)) return <Navigate to={accueilPourRole(role)} replace />;

  return children;
}
