import { useContext } from 'react';
import { ContexteSession, type EtatSession } from '../contexte';

export function useSession(): EtatSession {
  const etat = useContext(ContexteSession);
  if (!etat) throw new Error('useSession doit être utilisé à l’intérieur de <SessionProvider>');
  return etat;
}
