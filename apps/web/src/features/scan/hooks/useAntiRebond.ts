import { useCallback, useRef } from 'react';

/**
 * La caméra lit le même QR plusieurs fois par seconde tant qu'il reste devant
 * l'objectif. Ce hook laisse passer une lecture puis ignore le même contenu
 * pendant `delaiMs`.
 *
 * Usage : const doitTraiter = useAntiRebond(3000); if (doitTraiter(jeton)) { … }
 */
export function useAntiRebond(delaiMs: number) {
  const derniereLecture = useRef<{ contenu: string; instant: number } | null>(null);

  return useCallback(
    (contenu: string): boolean => {
      const maintenant = Date.now();
      const precedente = derniereLecture.current;
      if (precedente && precedente.contenu === contenu && maintenant - precedente.instant < delaiMs) {
        return false;
      }
      derniereLecture.current = { contenu, instant: maintenant };
      return true;
    },
    [delaiMs],
  );
}
