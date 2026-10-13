import { messageErreur } from '@gresi/shared';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { BoutonDeconnexion } from '@/components/layout/BoutonDeconnexion';
import { Chargement } from '@/components/ui/Chargement';
import { aujourdhuiIso, formaterCreneau } from '@/lib/format';
import { chargerMesAffectations } from '../api';
import { CameraScanner } from '../components/CameraScanner';
import { EcranResultat } from '../components/EcranResultat';
import { useCompteurTempsReel } from '../hooks/useCompteurTempsReel';
import { useScanner } from '../hooks/useScanner';

export default function ScanPage() {
  const affectations = useQuery({ queryKey: ['scan', 'affectations'], queryFn: chargerMesAffectations });
  const [choix, setChoix] = useState<string | null>(null);

  // Une seule activité aujourd'hui : sélection automatique
  const duJour = (affectations.data ?? []).filter(
    (a) => a.jour === aujourdhuiIso() && a.statut === 'publiee',
  );
  const activiteId = choix ?? (duJour.length === 1 ? duJour[0]!.id : null);
  const activite = affectations.data?.find((a) => a.id === activiteId);

  const compteur = useCompteurTempsReel(activiteId);
  const { etat, onLecture } = useScanner(activiteId);

  if (affectations.isPending) return <Chargement />;
  if (affectations.isError) return <p className="p-6 text-center">{messageErreur(affectations.error)}</p>;

  if (!activite) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <h1 className="text-xl font-bold">Choisissez l’activité</h1>
        {duJour.length === 0 && (
          <p className="text-white/70">Aucune activité ne vous est affectée aujourd’hui.</p>
        )}
        {duJour.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => setChoix(a.id)}
            className="rounded-xl bg-white/10 p-4 text-left hover:bg-white/20"
          >
            <p className="font-semibold">{a.intitule}</p>
            <p className="text-sm text-white/70">
              {a.lieu} — {formaterCreneau(a.creneau)}
            </p>
          </button>
        ))}
        <BoutonDeconnexion className="mt-6 self-center text-white/70" />
      </div>
    );
  }

  return (
    <>
      <header className="flex items-center justify-between gap-3 bg-black/40 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate font-semibold">{activite.intitule}</p>
          <p className="text-sm text-white/70">{activite.lieu}</p>
        </div>
        <p className="text-right text-2xl font-bold tabular-nums" aria-label="Validés sur inscrits">
          {compteur.data ? `${compteur.data.valides} / ${compteur.data.inscrits}` : '— / —'}
        </p>
      </header>

      <CameraScanner onLecture={onLecture} enPause={etat.type !== 'pret'} />

      {etat.type === 'resultat' && <EcranResultat reponse={etat.reponse} />}
      {etat.type === 'erreur' && (
        <div role="alert" className="fixed inset-x-0 bottom-0 bg-gresi-orange p-4 text-center font-semibold">
          {etat.message}
        </div>
      )}
      {/* TODO S5 (Dev scan) : bouton « QR indisponible » → RechercheManuelle (rechercherInscrits + validerManuellement) */}
    </>
  );
}
