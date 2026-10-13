import { supabase } from '@/lib/supabase';

export async function chargerAnnoncesPubliees() {
  const { data, error } = await supabase
    .from('annonces')
    .select('id, titre, contenu, publiee_le')
    .eq('est_publiee', true)
    .order('publiee_le', { ascending: false })
    .limit(3);
  if (error) throw error;
  return data;
}
