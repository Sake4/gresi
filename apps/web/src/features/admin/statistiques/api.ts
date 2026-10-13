import { supabase } from '@/lib/supabase';

/** Inscrits / validés / taux de présence par activité (RPC stats_activites) */
export async function chargerStatistiques(jour?: string) {
  const { data, error } = await supabase.rpc('stats_activites', jour ? { p_jour: jour } : {});
  if (error) throw error;
  return data;
}
