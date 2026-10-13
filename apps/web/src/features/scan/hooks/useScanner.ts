import { extraireJetonQr, messageErreur, type ReponseScan } from '@gresi/shared';
import { useCallback, useEffect, useRef, useState } from 'react';
import { env } from '@/lib/env';
import { validerScan } from '../api';
import { useAntiRebond } from './useAntiRebond';

type Etat =
  | { type: 'pret' }
  | { type: 'envoi' }
  | { type: 'resultat'; reponse: ReponseScan }
  | { type: 'erreur'; message: string };

/**
 * Cycle d'un scan : lecture → anti-rebond → appel serveur → affichage 1,5 s → reprise.
 *
 * TODO S3 (Dev scan) :
 * - sons et vibrations distincts (public/sons/valide.mp3, refuse.mp3 ; navigator.vibrate)
 * - nouvel essai automatique avec le MÊME scanIdClient en cas d'erreur réseau (RG13)
 */
export function useScanner(activiteId: string | null) {
  const [etat, setEtat] = useState<Etat>({ type: 'pret' });
  const doitTraiter = useAntiRebond(env.delaiAntiRebondMs);
  const minuteur = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(minuteur.current), []);

  const reprendreApres = useCallback((ms: number) => {
    clearTimeout(minuteur.current);
    minuteur.current = setTimeout(() => setEtat({ type: 'pret' }), ms);
  }, []);

  const onLecture = useCallback(
    async (contenu: string) => {
      if (!activiteId || etat.type !== 'pret' || !doitTraiter(contenu)) return;

      const jeton = extraireJetonQr(contenu);
      if (!jeton) {
        setEtat({
          type: 'resultat',
          reponse: {
            resultat: 'qr_invalide',
            participant: null,
            valide_le: null,
            valide_par: null,
            methode: null,
            compteur: null,
            rejeu: false,
          },
        });
        reprendreApres(env.dureeResultatMs);
        return;
      }

      setEtat({ type: 'envoi' });
      try {
        const reponse = await validerScan(jeton, activiteId, crypto.randomUUID());
        setEtat({ type: 'resultat', reponse });
      } catch (erreur) {
        setEtat({ type: 'erreur', message: messageErreur(erreur) });
      }
      reprendreApres(env.dureeResultatMs);
    },
    [activiteId, etat.type, doitTraiter, reprendreApres],
  );

  return { etat, onLecture };
}
