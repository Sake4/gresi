## Ce que fait cette PR

<!-- 2-3 lignes -->

Ferme #<numéro du ticket>

## Comment tester

1.
2.

## Checklist

- [ ] Testé en local (et sur un téléphone Android si l'écran est concerné)
- [ ] Aucune clé, mot de passe ou donnée réelle dans le code
- [ ] Nouvelle table → RLS activée + politiques dans la même migration
- [ ] Nouvelle RPC / règle → test pgTAP ajouté
- [ ] Nouvelle erreur SQL → message ajouté dans `packages/shared/src/erreurs.ts`
- [ ] Types régénérés (`pnpm db:types`) si le schéma a changé
- [ ] Captures d'écran jointes si l'interface change
