# ADR-006 — Langue du code

- **Statut** : Acceptée
- **Date** : 2026-10-06
- **Décideurs** : équipe GRESI

## Contexte

L'équipe et le métier sont francophones ; les outils et bibliothèques sont en anglais.

## Décision

Vocabulaire métier en français sans accents (tables, colonnes, fonctions, composants, variables). Motifs techniques en anglais (`use…`, `…Page`, `on…`/`handle…`, `components`, `hooks`, `lib`). Exception : `is_admin()`, `is_admin_superieur()`, `is_distributeur()`.

## Alternatives écartées

- Tout en anglais : écart avec le cahier des charges et le vocabulaire du comité.

## Conséquences

Les noms correspondent aux termes du cahier des charges, ce qui facilite les revues.
