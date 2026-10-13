import { supabase } from '@/lib/supabase';

/** Fiche du participant connecté (la RLS ne renvoie que la sienne) */
export async function chargerMaFiche() {
  const { data, error } = await supabase
    .from('participants')
    .select(
      'id, nom, prenom, type_participant, qr_token, participants_etudiants (matricule, ecole, filiere, classe)',
    )
    .single();
  if (error) throw error;
  return data;
}

/** Créneaux choisis, avec l'activité correspondante */
export async function chargerMesCreneaux() {
  const { data, error } = await supabase
    .from('inscriptions')
    .select('id, jour, creneau, valide_le, activites (id, intitule, lieu, statut)')
    .order('jour')
    .order('creneau');
  if (error) throw error;
  return data;
}
