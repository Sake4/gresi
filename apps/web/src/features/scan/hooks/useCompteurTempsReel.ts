import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { chargerCompteur } from '../api';

/**
 * Compteur « validés / inscrits » partagé par tous les téléphones d'une salle.
 * Chaque validation (quel que soit le distributeur) déclenche un évènement
 * Realtime sur `inscriptions` filtré par activité → on recharge le compteur.
 */
export function useCompteurTempsReel(activiteId: string | null) {
  const queryClient = useQueryClient();
  const cle = ['scan', 'compteur', activiteId] as const;

  const compteur = useQuery({
    queryKey: cle,
    queryFn: () => chargerCompteur(activiteId!),
    enabled: Boolean(activiteId),
    refetchInterval: 30_000, // filet de sécurité si le temps réel est coupé
  });

  useEffect(() => {
    if (!activiteId) return;
    const canal = supabase
      .channel(`compteur-${activiteId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inscriptions', filter: `activite_id=eq.${activiteId}` },
        () => queryClient.invalidateQueries({ queryKey: ['scan', 'compteur', activiteId] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(canal);
    };
  }, [activiteId, queryClient]);

  return compteur;
}
