# ADR-008 — Emails limités, annonces dans l'application

- **Statut** : Acceptée
- **Date** : 2026-10-06
- **Décideurs** : équipe GRESI

## Contexte

Les offres SMTP gratuites ont des plafonds bas ; 1 400 participants.

## Décision

Emails réservés à l'authentification (confirmation, mot de passe) et aux annulations ciblées. Les rappels passent par la table `annonces` affichée dans l'application.

## Alternatives écartées

- Rappels par email à tous les inscrits : dépassement des quotas.

## Conséquences

Le comité relaie les annonces importantes sur ses canaux habituels.
