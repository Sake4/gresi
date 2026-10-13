import { construireContenuQr, messageErreur } from '@gresi/shared';
import { QRCodeSVG } from 'qrcode.react';
import { Alerte } from '@/components/ui/Alerte';
import { Chargement } from '@/components/ui/Chargement';
import { useMaFiche } from '../hooks/useMaFiche';

export default function QrPage() {
  const fiche = useMaFiche();

  if (fiche.isPending) return <Chargement />;
  if (fiche.isError) return <Alerte ton="erreur">{messageErreur(fiche.error)}</Alerte>;

  const { prenom, nom, qr_token } = fiche.data;

  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <h1 className="text-xl font-bold text-gresi-bleu">Mon QR code</h1>
      <div className="rounded-2xl bg-white p-5 shadow">
        <QRCodeSVG
          value={construireContenuQr(qr_token)}
          size={280}
          level="M"
          marginSize={2}
          title={`QR code de ${prenom} ${nom}`}
        />
      </div>
      <p className="text-lg font-semibold">
        {prenom} {nom}
      </p>
      <Alerte>
        Présentez ce code à la sortie de chaque activité. Montez la luminosité de l’écran au maximum. Ne le
        partagez pas : il ne fonctionne qu’une fois par créneau.
      </Alerte>
      {/* TODO S5 (Dev web) : bouton « Télécharger en image » pour impression (QRCodeCanvas + toDataURL) */}
    </div>
  );
}
