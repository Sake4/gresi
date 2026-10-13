# ADR-001 — Monorepo pnpm

- **Statut** : Acceptée
- **Date** : 2026-10-06
- **Décideurs** : équipe GRESI

## Contexte

Trois développeurs travaillent sur une application web, une base Supabase et du code partagé (types, constantes, format du QR).

## Décision

Un seul dépôt `gresi` géré avec pnpm workspaces : `apps/` (applications), `packages/` (code partagé), `supabase/` (base et Edge Functions), `scripts/`, `docs/`.

## Alternatives écartées

- Plusieurs dépôts : synchronisation des types et des versions pénible pour une petite équipe.

## Conséquences

- Une seule PR peut modifier la base, les types et l'interface de façon cohérente.
- Les types générés sont partagés via `@gresi/shared`.
- Aucun nouveau dossier de premier niveau sans nouvel ADR.
