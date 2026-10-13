# ADR-005 — Vérification des étudiants par référentiel

- **Statut** : Acceptée
- **Date** : 2026-10-06
- **Décideurs** : équipe GRESI

## Contexte

Le matricule est l'identifiant unique d'un étudiant. L'existence d'une API de la scolarité INPHB n'est pas confirmée.

## Décision

Table `etudiants_reference`, alimentée par import CSV (`scripts/importer-etudiants.ts`) ou par l'API INPHB (cache rempli par l'Edge Function `verifier-etudiant`). La RPC `inscrire_participant` revérifie toujours à partir de cette table.

## Alternatives écartées

- Saisie libre du matricule : comptes multiples possibles.
- Appel direct à l'API dans la RPC : impossible depuis PostgreSQL sans extension réseau.

## Conséquences

- Fonctionne dès S2 avec un simple export, sans attendre l'API.
- Données d'un tiers : autorisation écrite de l'INPHB et purge après l'évènement.
