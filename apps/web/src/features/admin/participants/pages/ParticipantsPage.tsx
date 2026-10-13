import { AFaire } from '@/components/ui/AFaire';

export default function ParticipantsPage() {
  return (
    <AFaire
      titre="Participants"
      semaine="S5"
      details={[
        'Recherche et pagination : RPC liste_participants_admin (matricule masqué).',
        'Admin supérieur : fiche complète, régénérer le QR (regenerer_qr), désactiver (modifier_statut_participant).',
        'Admin : création de compte sur place → Edge Function creer-participant-sur-place.',
      ]}
    />
  );
}
