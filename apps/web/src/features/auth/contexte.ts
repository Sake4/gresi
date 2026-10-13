import type { Role } from '@gresi/shared';
import type { Session } from '@supabase/supabase-js';
import { createContext } from 'react';

export interface EtatSession {
  session: Session | null;
  /** null si l'utilisateur n'a pas encore de fiche (inscription à finaliser) */
  role: Role | null;
  /** Vrai tant que la session ou le rôle sont en cours de chargement */
  chargement: boolean;
}

export const ContexteSession = createContext<EtatSession | null>(null);
