# ADR-004 — QR = jeton opaque régénérable

- **Statut** : Acceptée
- **Date** : 2026-10-06
- **Décideurs** : équipe GRESI

## Contexte

La V1 prévoyait un jeton signé permanent. La validation se fait de toute façon en base.

## Décision

Le QR contient `GRESI:1:<uuid>` : préfixe, version du format, puis `participants.qr_token` (UUID aléatoire). L'admin supérieur peut régénérer le jeton (RG15).

## Alternatives écartées

- JWT signé : non révocable sans liste noire, aucun gain puisque la base est consultée.

## Conséquences

- Aucune donnée personnelle dans le QR.
- Un QR perdu ou partagé est invalidé immédiatement.
