import { z } from 'zod';

const motDePasse = z.string().min(10, 'Au moins 10 caractères.').max(72, 'Au plus 72 caractères.');

const telephone = z
  .string()
  .trim()
  .regex(/^\+?[0-9 ]{8,15}$/, 'Numéro invalide.')
  .optional()
  .or(z.literal(''));

const consentement = z.literal(true, {
  error: 'Vous devez accepter la notice sur les données personnelles.',
});

/** Formulaire d'inscription d'un étudiant INPHB */
export const schemaInscriptionEtudiant = z.object({
  type: z.literal('etudiant_inphb'),
  matricule: z
    .string()
    .trim()
    .min(4, 'Matricule trop court.')
    .transform((v) => v.toUpperCase()),
  nom: z.string().trim().min(1, 'Nom obligatoire.'),
  prenom: z.string().trim().min(1, 'Prénom obligatoire.'),
  email: z.email('Adresse email invalide.'),
  motDePasse,
  telephone,
  consentement,
});

/** Formulaire d'inscription d'un participant externe */
export const schemaInscriptionExterne = z.object({
  type: z.literal('externe'),
  nom: z.string().trim().min(1, 'Nom obligatoire.'),
  prenom: z.string().trim().min(1, 'Prénom obligatoire.'),
  email: z.email('Adresse email invalide.'),
  motDePasse,
  telephone,
  statut: z.enum(['etudiant_hors_inphb', 'professionnel', 'visiteur', 'autre'], {
    error: 'Choisissez un statut.',
  }),
  structure: z.string().trim().max(120).optional(),
  motifPresence: z.string().trim().max(300).optional(),
  consentement,
});

export const schemaInscription = z.discriminatedUnion('type', [
  schemaInscriptionEtudiant,
  schemaInscriptionExterne,
]);

export type DonneesInscription = z.infer<typeof schemaInscription>;

export const schemaConnexion = z.object({
  email: z.email('Adresse email invalide.'),
  motDePasse: z.string().min(1, 'Mot de passe obligatoire.'),
});

export type DonneesConnexion = z.infer<typeof schemaConnexion>;
