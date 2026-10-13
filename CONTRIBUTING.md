# Règles d'équipe

Reprise du cahier des charges technique V2.0, §9. Toute modification de ces règles se décide en
équipe et se consigne dans `docs/comptes-rendus/`.

## 1. Flux Git

1. Partir d'un ticket du tableau GitHub Projects. Créer la branche depuis `main` à jour :
   `type/numero-ticket-description` (ex. `feat/42-scan-anti-rebond`).
2. Faire des commits petits et fréquents, au format [Conventional Commits](https://www.conventionalcommits.org/fr/),
   en français et à l'impératif : `feat(scan): ajoute l'anti-rebond de 3 s`.
   Types : `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `db`.
3. Ouvrir la PR **en brouillon** dès le début, pour rendre le travail visible.
4. Quand la PR est prête : description, « Ferme #42 », captures si l'interface change.
   Viser moins de 400 lignes modifiées.
5. Revue par un autre développeur, et par le référent désigné dans `CODEOWNERS`, sous **24 h**.
   La CI doit être verte.
6. Fusion en _squash_. La branche est ensuite supprimée.
7. Mise en production : PR `main` → `production`, tag `vX.Y.Z`, puis workflow « Migrations production ».

`main` et `production` sont protégées : PR obligatoire, une approbation, CI verte, ni push forcé
ni suppression.

## 2. Base de données

- Toute modification du schéma passe par une migration (`pnpm supabase migration new <nom>`),
  revue par Stéphane. Aucune modification manuelle dans le tableau de bord de `gresi-dev` ou de
  `gresi-prod`.
- Une migration appliquée sur `gresi-dev` n'est **plus jamais modifiée** : on en écrit une nouvelle.
- Toute nouvelle table : RLS activée et politiques **dans la même migration**.
- Toute nouvelle RPC ou règle de gestion : un test pgTAP dans `supabase/tests`.
- Toute nouvelle erreur métier (`raise exception 'code'`) : son message dans
  `packages/shared/src/erreurs.ts`.
- Après un changement de schéma : `pnpm db:types`, et commit du fichier généré dans la même PR.
- Jamais de `select *` qui exposerait des colonnes sensibles au client : passer par une RPC.

## 3. Definition of Done

- Le ticket répond à ses critères d'acceptation.
- Le code est relu et fusionné ; la CI est verte.
- C'est testé en Preview, et sur un vrai téléphone Android si l'écran concerne le participant ou
  le scan.
- Le code ne contient aucune donnée réelle ni aucun secret.
- La documentation est à jour si une convention, une route ou une variable a changé.

## 4. Rituels

| Rituel          | Quand                     | Format                                              |
| --------------- | ------------------------- | --------------------------------------------------- |
| Point quotidien | Chaque jour avant 9 h     | Message écrit : _Hier / Aujourd'hui / Bloquant_     |
| Synchronisation | Mardi et vendredi, 30 min | Appel : avancement, blocages, arbitrages            |
| Démo            | Vendredi                  | Chacun montre ce qui a été fusionné, en Preview     |
| Rétrospective   | Fin de semaine, 15 min    | Ce qui marche, ce qu'on change, une action concrète |

## 5. Communication et décisions

- Une question technique qui engage l'équipe va dans un ticket ou le fil _dev_, pas en message
  privé.
- Une décision prise est consignée dans un ADR (`docs/decisions/`) ou un compte rendu. Ce qui
  n'est pas écrit n'est pas décidé.
- Si tu es bloqué plus de 2 heures, signale-le dans le fil _dev_.

## 6. Secrets

- Aucun secret dans le dépôt, dans un message ou dans un ticket. Les secrets vivent dans le
  gestionnaire de mots de passe de l'équipe et dans les réglages de Vercel, Supabase et GitHub.
- `.env.local` n'est jamais commité ; seul `.env.example` l'est, avec des valeurs factices.
- Une clé exposée par erreur est révoquée et remplacée immédiatement, puis l'équipe est prévenue.
