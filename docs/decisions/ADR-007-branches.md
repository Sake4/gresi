# ADR-007 — Branches et déploiements

- **Statut** : Acceptée
- **Date** : 2026-10-06
- **Décideurs** : équipe GRESI

## Contexte

Il faut un environnement de test stable et une production protégée pendant l'évènement.

## Décision

`main` = préproduction (Vercel Preview + `gresi-dev`). `production` = évènement (Vercel Production + `gresi-prod`). Les migrations de production passent par le workflow manuel `deploy-db-prod.yml`, avec approbation.

## Alternatives écartées

- Déploiement continu en production : risqué pendant l'évènement.

## Conséquences

- Aucun déploiement pendant les créneaux de repas.
- Mise en production = PR `main` → `production` + tag.
