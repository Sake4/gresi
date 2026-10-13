import { z } from 'zod';

/** Formulaire de création / modification d'une activité (admin supérieur) */
export const schemaActivite = z.object({
  intitule: z.string().trim().min(3, 'Intitulé trop court.').max(150),
  description: z.string().trim().max(1000).optional(),
  lieu: z.string().trim().min(1, 'Lieu obligatoire.').max(100),
  jour: z.iso.date('Date invalide.'),
  creneau: z.enum(['matin', 'apres_midi']),
  statut: z.enum(['brouillon', 'publiee', 'annulee']).default('brouillon'),
});

export type DonneesActivite = z.infer<typeof schemaActivite>;
