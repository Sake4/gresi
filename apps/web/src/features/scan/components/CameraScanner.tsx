import { useState } from 'react';
import { env } from '@/lib/env';

interface CameraScannerProps {
  /** Appelé avec le texte brut de chaque QR lu (l'anti-rebond est géré par l'appelant) */
  onLecture: (contenu: string) => void;
  /** Mettre en pause pendant l'affichage d'un résultat */
  enPause: boolean;
}

/**
 * TODO S1 (Dev scan) — test de faisabilité :
 * comparer BarcodeDetector (natif Chrome Android), @zxing/browser et html5-qrcode
 * sur les téléphones des distributeurs, puis implémenter ici la lecture continue
 * (caméra arrière, `facingMode: 'environment'`, sans bouton entre deux lectures).
 *
 * En attendant, un champ de saisie permet de tester tout le reste du flux
 * en développement : coller « GRESI:1:<qr_token> » (visible dans Supabase Studio).
 */
export function CameraScanner({ onLecture, enPause }: CameraScannerProps) {
  const [saisie, setSaisie] = useState('');

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
      <div className="flex aspect-square w-full max-w-sm items-center justify-center rounded-2xl border-2 border-dashed border-white/40 text-center text-white/60">
        Caméra — à implémenter en S1
      </div>
      {env.environnement !== 'prod' && (
        <form
          className="flex w-full max-w-sm gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!enPause && saisie.trim()) onLecture(saisie);
          }}
        >
          <input
            value={saisie}
            onChange={(e) => setSaisie(e.target.value)}
            placeholder="GRESI:1:…"
            aria-label="Contenu du QR (test)"
            className="flex-1 rounded-lg px-3 py-2 text-slate-900"
          />
          <button type="submit" className="rounded-lg bg-gresi-bleu px-4 py-2 font-medium">
            Tester
          </button>
        </form>
      )}
    </div>
  );
}
