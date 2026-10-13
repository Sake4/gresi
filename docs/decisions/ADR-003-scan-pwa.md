# ADR-003 — Scan en PWA, Expo en plan B

- **Statut** : À confirmer fin S1
- **Date** : 2026-10-06
- **Décideurs** : équipe GRESI

## Contexte

Les distributeurs utilisent des téléphones Android. Une application native demande une base de code et une distribution d'APK supplémentaires.

## Décision

Le scan est une page `/scan` de l'application web, installable en PWA. Décision finale après le test de faisabilité de S1 sur les téléphones réels.

## Alternatives écartées

- Application Expo dès le départ : double base de code, distribution d'APK.

## Conséquences

- Si le test échoue : `apps/scan-mobile/` (Expo) réutilisant `@gresi/shared`.
- La caméra exige HTTPS : tests réels sur l'URL Preview de Vercel.
