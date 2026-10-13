import type { ReponseScan } from '@gresi/shared';
import { supabase } from '@/lib/supabase';

/** Activités auxquelles le distributeur connecté est affecté */
export async function chargerMesAffectations() {
  const { data, error } = await supabase
    .from('affectations')
    .select('activites (id, intitule, lieu, jour, creneau, statut)')
    .order('activite_id');
  if (error) throw error;
  return data.flatMap((a) => (a.activites ? [a.activites] : []));
}

/**
 * Valide un QR. `scanIdClient` est généré UNE fois par lecture :
 * en cas de nouvel essai après une coupure réseau, renvoyer le MÊME identifiant
 * pour que le serveur ne compte pas deux fois (RG13).
 */
export async function validerScan(qrToken: string, activiteId: string, scanIdClient: string) {
  const { data, error } = await supabase.rpc('valider_scan', {
    p_qr_token: qrToken,
    p_activite_id: activiteId,
    p_scan_id_client: scanIdClient,
  });
  if (error) throw error;
  return data as unknown as ReponseScan;
}

/** Validation de secours, QR indisponible (RG14) */
export async function validerManuellement(participantId: string, activiteId: string, scanIdClient: string) {
  const { data, error } = await supabase.rpc('valider_manuellement', {
    p_participant_id: participantId,
    p_activite_id: activiteId,
    p_scan_id_client: scanIdClient,
  });
  if (error) throw error;
  return data as unknown as ReponseScan;
}

export async function rechercherInscrits(activiteId: string, recherche: string) {
  const { data, error } = await supabase.rpc('rechercher_inscrits', {
    p_activite_id: activiteId,
    p_recherche: recherche,
  });
  if (error) throw error;
  return data;
}

export async function chargerCompteur(activiteId: string) {
  const { data, error } = await supabase.rpc('stats_activites');
  if (error) throw error;
  const ligne = data.find((s) => s.activite_id === activiteId);
  return { valides: ligne?.valides ?? 0, inscrits: ligne?.inscrits ?? 0 };
}
