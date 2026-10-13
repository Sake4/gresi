# ADR-002 — Supabase comme backend

- **Statut** : Acceptée
- **Date** : 2026-10-06
- **Décideurs** : équipe GRESI

## Contexte

Équipe junior, 2 mois, besoins : authentification, base relationnelle, contrôle d'accès fin, temps réel.

## Décision

Supabase : PostgreSQL, Auth, Row Level Security, fonctions RPC `SECURITY DEFINER`, Realtime, Edge Functions. Deux projets : `gresi-dev` et `gresi-prod`.

## Alternatives écartées

- Backend sur mesure (Node/Express) : trop de code à écrire et à sécuriser dans le délai.

## Conséquences

- Les règles de gestion vivent dans la base (contraintes, triggers, RPC) et sont testées avec pgTAP.
- Dépendance à un hébergeur situé hors de Côte d'Ivoire : à documenter (données personnelles).
