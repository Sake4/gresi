import type { DonneesConnexion, DonneesInscription, Role } from '@gresi/shared';
import { supabase } from '@/lib/supabase';

export async function seConnecter({ email, motDePasse }: DonneesConnexion) {
  const { error } = await supabase.auth.signInWithPassword({ email, password: motDePasse });
  if (error) throw error;
}

export async function demanderReinitialisation(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/mot-de-passe-oublie`,
  });
  if (error) throw error;
}

/**
 * Rôle de l'utilisateur connecté :
 * - une fiche dans `personnel` → son rôle (distributeur, admin, admin_superieur)
 * - une fiche dans `participants` → 'participant'
 * - aucune fiche → null (inscription à finaliser après confirmation de l'email)
 * La RLS ne renvoie que la fiche de l'utilisateur lui-même.
 */
export async function chargerRole(userId: string): Promise<Role | null> {
  const [personnel, participant] = await Promise.all([
    supabase.from('personnel').select('role, est_actif').eq('id', userId).maybeSingle(),
    supabase.from('participants').select('id').eq('id', userId).maybeSingle(),
  ]);
  if (personnel.error) throw personnel.error;
  if (participant.error) throw participant.error;

  if (personnel.data?.est_actif) return personnel.data.role;
  if (participant.data) return 'participant';
  return null;
}

/**
 * Création du compte Auth (étape 1 de l'UC1).
 * Les informations du formulaire sont conservées dans les métadonnées du compte
 * pour créer la fiche participant APRÈS la confirmation de l'email (étape 2).
 *
 * TODO S2 (Dev web) : appeler d'abord l'Edge Function `verifier-etudiant` pour un étudiant.
 */
export async function creerCompte(donnees: DonneesInscription) {
  const { motDePasse, email, consentement: _consentement, ...profil } = donnees;
  const { error } = await supabase.auth.signUp({
    email,
    password: motDePasse,
    options: {
      emailRedirectTo: `${window.location.origin}/inscription/finaliser`,
      data: { inscription_gresi: profil },
    },
  });
  if (error) throw error;
}

/**
 * Étape 2 de l'UC1 : crée la fiche participant et le QR code
 * à partir des métadonnées enregistrées à l'étape 1.
 *
 * TODO S2 (Dev web) : relire les métadonnées (`supabase.auth.getUser()`),
 * puis appeler `supabase.rpc('inscrire_participant', {...})` avec p_consentement = true.
 */
export async function finaliserInscription(): Promise<void> {
  throw new Error('À implémenter en S2');
}
