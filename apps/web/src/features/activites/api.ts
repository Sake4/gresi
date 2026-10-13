import { supabase } from '@/lib/supabase';

/** Activités publiées d'un jour (la RLS filtre selon le rôle) */
export async function chargerActivitesDuJour(jour: string) {
  const { data, error } = await supabase
    .from('activites')
    .select('id, intitule, description, lieu, jour, creneau, statut')
    .eq('jour', jour)
    .eq('statut', 'publiee')
    .order('creneau')
    .order('intitule');
  if (error) throw error;
  return data;
}

/** RG1/RG4 : choisit (ou remplace) l'activité du créneau */
export async function choisirActivite(activiteId: string) {
  const { data, error } = await supabase.rpc('choisir_activite', { p_activite_id: activiteId });
  if (error) throw error;
  return data;
}
