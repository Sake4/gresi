import { useRef } from "react";
import { Badge } from "../../../components/ui/Badge";
import { Bouton } from "../../../components/ui/Bouton";
import { Icone } from "../../../components/ui/Icone";
import { UTILISATEUR_DEMO } from "../../../lib/sessionDemo";
import { FauxQrCode } from "../components/FauxQrCode";

// Le QR Code contient un jeton opaque préfixé « GRESI:1: » (décision ADR-004).
const PREFIXE_QR = "GRESI:1:";

export default function QrPage() {
  const zoneQr = useRef<HTMLDivElement>(null);

  const nomAffiche = `${UTILISATEUR_DEMO.prenom} ${UTILISATEUR_DEMO.nom.toUpperCase()}`;
  const valeurQr = `${PREFIXE_QR}${UTILISATEUR_DEMO.qrToken}`;

  function afficherPleinEcran() {
    zoneQr.current?.requestFullscreen().catch(() => undefined);
  }

  function telechargerImage() {
    const svg = zoneQr.current?.querySelector("svg");
    if (!svg) return;
    const contenu = new XMLSerializer().serializeToString(svg);
    const fichier = new Blob([contenu], { type: "image/svg+xml" });
    const adresse = URL.createObjectURL(fichier);
    const lien = document.createElement("a");
    lien.href = adresse;
    lien.download = "mon-qr-code-gresi.svg";
    lien.click();
    URL.revokeObjectURL(adresse);
  }

  return (
    <div className="mx-auto w-full max-w-lg">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Mon QR Code</h1>
        <p className="mt-1 text-gresi-encre-douce">
          Présentez ce code au distributeur, à la sortie de votre activité, pour recevoir votre repas.
        </p>
      </header>

      <section className="rounded-lg border border-gresi-gris-bleu bg-white p-6 text-center shadow-sm sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-3 border-b border-gresi-gris-bleu pb-4 text-left">
          <div className="flex items-center gap-2">
            <Icone nom="school" className="text-[24px] text-gresi-bleu" />
            <div>
              <p className="font-bold leading-tight text-gresi-bleu">INP-HB · ESI</p>
              <p className="text-sm leading-tight text-gresi-encre-douce">Semaine de l'Industrie</p>
            </div>
          </div>
          <Badge variante="doux">
            <Icone nom="check_circle" rempli className="text-[16px]" />
            Compte actif
          </Badge>
        </div>

        <div
          ref={zoneQr}
          className="mx-auto mb-5 flex w-fit items-center justify-center rounded-lg border border-gresi-gris-bleu bg-white p-4"
        >
          <FauxQrCode
            valeur={valeurQr}
            titre={`QR Code personnel de ${UTILISATEUR_DEMO.prenom} ${UTILISATEUR_DEMO.nom}`}
            className="h-auto w-[min(70vw,18rem)]"
          />
        </div>

        <h2 className="text-3xl font-bold tracking-tight">{nomAffiche}</h2>
        <p className="mt-1 text-gresi-encre-douce">
          Matricule : <span className="font-semibold text-gresi-encre">{UTILISATEUR_DEMO.matricule}</span>
        </p>
        <p className="text-sm text-gresi-encre-douce">{UTILISATEUR_DEMO.filiere}</p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Bouton variante="principal" pleineLargeur onClick={afficherPleinEcran}>
            <Icone nom="fullscreen" className="text-[20px]" />
            Plein écran
          </Bouton>
          <Bouton variante="contour" pleineLargeur onClick={telechargerImage}>
            <Icone nom="download" className="text-[20px]" />
            Télécharger
          </Bouton>
        </div>
      </section>

      <section className="mt-6 space-y-3 rounded-lg border border-gresi-gris-bleu bg-white p-5 text-left">
        <p className="flex items-start gap-3">
          <Icone nom="info" className="mt-0.5 text-[22px] text-gresi-bleu" />
          <span>
            Ce QR Code est unique et valable pour toute la durée de l'évènement (2 scans maximum par jour)
          </span>
        </p>
        <p className="flex items-start gap-3 text-sm text-gresi-encre-douce">
          <Icone nom="lock" className="mt-0.5 text-[20px]" />
          <span>Ne le partagez pas : il donne accès à vos repas.</span>
        </p>
        <p className="flex items-start gap-3 text-sm text-gresi-encre-douce">
          <Icone nom="brightness_high" className="mt-0.5 text-[20px]" />
          <span>Augmentez la luminosité de votre écran avant de le présenter.</span>
        </p>
      </section>
    </div>
  );
}
