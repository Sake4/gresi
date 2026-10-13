import type { Role } from '@gresi/shared';

/** Page d'arrivée après connexion, selon le rôle */
export function accueilPourRole(role: Role | null): string {
  switch (role) {
    case 'participant':
      return '/mon-espace';
    case 'distributeur':
      return '/scan';
    case 'admin':
    case 'admin_superieur':
      return '/admin';
    default:
      return '/inscription/finaliser';
  }
}
