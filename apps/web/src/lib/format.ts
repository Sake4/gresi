import { LIBELLES_CRENEAU, type Creneau } from '@gresi/shared';

const FUSEAU = 'Africa/Abidjan';

/** « mardi 8 décembre » */
export function formaterJour(jourIso: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(new Date(`${jourIso}T00:00:00Z`));
}

/** « 12:04 » */
export function formaterHeure(horodatage: string): string {
  return new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: FUSEAU }).format(
    new Date(horodatage),
  );
}

export function formaterCreneau(creneau: Creneau): string {
  return LIBELLES_CRENEAU[creneau];
}

/** Masquage côté client (affichage) — le serveur masque déjà dans ses réponses */
export function masquerMatricule(matricule: string): string {
  if (matricule.length <= 6) return '*'.repeat(matricule.length);
  return `${matricule.slice(0, 4)}***${matricule.slice(-2)}`;
}

/** Date du jour (fuseau de l'évènement) au format AAAA-MM-JJ */
export function aujourdhuiIso(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: FUSEAU }).format(new Date());
}
