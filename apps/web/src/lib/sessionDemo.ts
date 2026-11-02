// Utilisateur de démonstration.
// À REMPLACER plus tard par la vraie session Supabase
// (supabase.auth.getSession() + lecture de la fiche du participant).

export interface UtilisateurSession {
  prenom: string;
  nom: string;
  matricule: string;
  filiere: string;
  qrToken: string;
}

export const UTILISATEUR_DEMO: UtilisateurSession = {
  prenom: "Awa",
  nom: "Koné",
  matricule: "22INP00452",
  filiere: "Génie industriel",
  qrToken: "6f1c2a3e-5b7d-4e90-8a21-3c4d5e6f7a8b",
};

export function obtenirInitiales(utilisateur: UtilisateurSession): string {
  return `${utilisateur.prenom.charAt(0)}${utilisateur.nom.charAt(0)}`.toUpperCase();
}
