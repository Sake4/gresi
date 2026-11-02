import { useMemo } from "react";

// SIMULATION d'un QR Code (aucune bibliothèque nécessaire pour la maquette).
// Le dessin est toujours le même pour une même valeur, mais il n'est PAS scannable.
// Plus tard : remplacer par un vrai QR Code (bibliothèque qrcode.react).

const TAILLE = 25; // grille de 25 x 25 modules
const COULEUR_SOMBRE = "#1B2733";
const COULEUR_CLAIRE = "#FFFFFF";

function calculerGraine(texte: string): number {
  let graine = 2166136261;
  for (let i = 0; i < texte.length; i += 1) {
    graine ^= texte.charCodeAt(i);
    graine = Math.imul(graine, 16777619);
  }
  return graine >>> 0;
}

// Petit générateur pseudo-aléatoire (mulberry32) : même graine = mêmes nombres.
function creerGenerateur(graineInitiale: number): () => number {
  let etat = graineInitiale;
  return () => {
    etat = (etat + 0x6d2b79f5) | 0;
    let t = Math.imul(etat ^ (etat >>> 15), 1 | etat);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Les 3 coins sont réservés aux carrés de repérage.
function estDansUnCoin(x: number, y: number): boolean {
  const dans = (debutX: number, debutY: number) =>
    x >= debutX && x < debutX + 8 && y >= debutY && y < debutY + 8;
  return dans(0, 0) || dans(TAILLE - 8, 0) || dans(0, TAILLE - 8);
}

interface Module {
  x: number;
  y: number;
}

function calculerModules(valeur: string): Module[] {
  const hasard = creerGenerateur(calculerGraine(valeur));
  const modules: Module[] = [];
  for (let y = 0; y < TAILLE; y += 1) {
    for (let x = 0; x < TAILLE; x += 1) {
      if (!estDansUnCoin(x, y) && hasard() > 0.5) {
        modules.push({ x, y });
      }
    }
  }
  return modules;
}

function CarreRepere({ x, y }: Module) {
  return (
    <>
      <rect x={x} y={y} width={7} height={7} fill={COULEUR_SOMBRE} />
      <rect x={x + 1} y={y + 1} width={5} height={5} fill={COULEUR_CLAIRE} />
      <rect x={x + 2} y={y + 2} width={3} height={3} fill={COULEUR_SOMBRE} />
    </>
  );
}

interface FauxQrCodeProps {
  /** Texte « encodé » (sert uniquement à varier le dessin). */
  valeur: string;
  /** Description pour les lecteurs d'écran. */
  titre: string;
  className?: string;
}

export function FauxQrCode({ valeur, titre, className = "" }: FauxQrCodeProps) {
  const modules = useMemo(() => calculerModules(valeur), [valeur]);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-2 -2 29 29"
      role="img"
      aria-label={titre}
      shapeRendering="crispEdges"
      className={className}
    >
      <title>{titre}</title>
      {/* Fond blanc + marge blanche autour (nécessaire à la lecture d'un vrai QR Code) */}
      <rect x={-2} y={-2} width={29} height={29} fill={COULEUR_CLAIRE} />
      {modules.map((module) => (
        <rect
          key={`${module.x}-${module.y}`}
          x={module.x}
          y={module.y}
          width={1}
          height={1}
          fill={COULEUR_SOMBRE}
        />
      ))}
      <CarreRepere x={0} y={0} />
      <CarreRepere x={TAILLE - 7} y={0} />
      <CarreRepere x={0} y={TAILLE - 7} />
    </svg>
  );
}
