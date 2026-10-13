-- =============================================================================
-- GRESI — Migration 1/8 : extensions et types énumérés
-- Cahier des charges technique V2.0 — §6.1
-- =============================================================================

-- pgcrypto : utilisé par seed.sql (crypt) — déjà présent sur Supabase.
create extension if not exists pgcrypto with schema extensions;

-- Profil du participant
create type public.type_participant as enum ('etudiant_inphb', 'externe');

-- Statut d'un participant externe (liste fermée — minimisation des données)
create type public.statut_externe as enum (
  'etudiant_hors_inphb',
  'professionnel',
  'visiteur',
  'autre'
);

-- Rôle d'un membre du personnel (les participants ne sont pas du personnel)
create type public.role_personnel as enum ('distributeur', 'admin', 'admin_superieur');

-- Demi-journée d'activités
create type public.creneau as enum ('matin', 'apres_midi');

-- Cycle de vie d'une activité
create type public.statut_activite as enum ('brouillon', 'publiee', 'annulee');

-- Résultat d'une tentative de validation (codes renvoyés à l'application)
create type public.resultat_scan as enum (
  'valide',
  'deja_utilise',
  'non_inscrit',
  'non_affecte',
  'hors_creneau',
  'qr_invalide'
);

-- Manière dont un créneau a été validé
create type public.methode_validation as enum ('qr', 'manuelle');

-- Origine de la vérification d'un étudiant INPHB
create type public.source_verification as enum ('api', 'referentiel', 'manuelle');
