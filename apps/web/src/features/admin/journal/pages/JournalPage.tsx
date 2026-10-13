import { AFaire } from '@/components/ui/AFaire';

export default function JournalPage() {
  return (
    <AFaire
      titre="Journal d’audit"
      semaine="S5"
      details={[
        'Liste paginée de journal_audit (auteur, action, cible, heure).',
        'Fil temps réel : abonnement Realtime aux INSERT sur journal_audit.',
      ]}
    />
  );
}
