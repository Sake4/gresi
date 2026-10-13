import { PREFIXE_QR } from './constantes';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Contenu à encoder dans le QR d'un participant */
export function construireContenuQr(qrToken: string): string {
  return `${PREFIXE_QR}${qrToken}`;
}

/**
 * Extrait le jeton d'un QR lu par la caméra.
 * Renvoie null pour tout QR qui n'est pas un QR GRESI valide :
 * on évite ainsi un appel réseau inutile (affiche, autre application…).
 */
export function extraireJetonQr(contenu: string): string | null {
  const texte = contenu.trim();
  if (!texte.startsWith(PREFIXE_QR)) return null;
  const jeton = texte.slice(PREFIXE_QR.length);
  return UUID_RE.test(jeton) ? jeton.toLowerCase() : null;
}
