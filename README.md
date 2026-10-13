# GRESI

Inscriptions aux activités, validation par QR code et distribution des repas de la
**Semaine de l'Industrie** (ESI, INPHB).

- Cahier des charges fonctionnel et technique V2.0 : [`docs/cahier-des-charges/`](docs/cahier-des-charges/)
- Règles d'équipe : [`CONTRIBUTING.md`](CONTRIBUTING.md)
- Décisions d'architecture : [`docs/decisions/`](docs/decisions/)

---

## Démarrage en 10 minutes

### Prérequis

| Outil          | Version                | Vérification                     |
| -------------- | ---------------------- | -------------------------------- |
| Node.js        | 22 LTS (voir `.nvmrc`) | `node -v`                        |
| pnpm           | via Corepack           | `corepack enable` puis `pnpm -v` |
| Docker Desktop | démarré                | `docker run hello-world`         |
| Git            | récent                 | `git --version`                  |

### Installation

```bash
git clone git@github.com:gresi-si/gresi.git
cd gresi
corepack enable
pnpm install

# 1. Base de données locale (Docker) : migrations + données de test
pnpm db:start            # la 1re fois : téléchargement des images (quelques minutes)

# 2. Variables d'environnement de l'application
cp apps/web/.env.example apps/web/.env.local
#    → coller dans VITE_SUPABASE_PUBLISHABLE_KEY la clé « Publishable key »
#      (ou « anon key ») affichée par `pnpm db:start`

# 3. Application
pnpm dev                 # http://localhost:5173
```

### Comptes de test (base locale)

Mot de passe de tous les comptes : **`gresi-dev-2026`**

| Rôle            | Email                                                   | Arrivée après connexion |
| --------------- | ------------------------------------------------------- | ----------------------- |
| Admin supérieur | `admin.sup1@gresi.test`                                 | `/admin`                |
| Admin           | `admin@gresi.test`                                      | `/admin`                |
| Distributeur    | `distributeur1@gresi.test` … `distributeur4@gresi.test` | `/scan`                 |
| Étudiant        | `etudiant01@gresi.test` … `etudiant20@gresi.test`       | `/mon-espace`           |
| Externe         | `externe01@gresi.test` … `externe10@gresi.test`         | `/mon-espace`           |

Les activités du seed sont placées **aujourd'hui et demain**, avec une fenêtre de scan très large :
le scan se teste à toute heure. Pour simuler un scan sans caméra, connectez-vous en distributeur,
puis collez `GRESI:1:<qr_token>` (copié depuis Supabase Studio, table `participants`) dans le
champ de test de l'écran `/scan`.

- Supabase Studio local : <http://127.0.0.1:54323>
- Boîte mail locale (emails de confirmation) : <http://127.0.0.1:54324>

---

## Commandes

| Commande                                          | Effet                                                  |
| ------------------------------------------------- | ------------------------------------------------------ |
| `pnpm dev`                                        | Lance l'application web                                |
| `pnpm db:start` / `pnpm db:stop`                  | Démarre / arrête la base locale                        |
| `pnpm db:reset`                                   | Rejoue toutes les migrations + `seed.sql`              |
| `pnpm db:test`                                    | Tests pgTAP (`supabase/tests`)                         |
| `pnpm db:types`                                   | Régénère `packages/shared/src/types/database.types.ts` |
| `pnpm supabase migration new <nom>`               | Nouvelle migration horodatée                           |
| `pnpm supabase functions serve`                   | Edge Functions en local                                |
| `pnpm lint` · `pnpm typecheck` · `pnpm build`     | Ce que fait la CI                                      |
| `pnpm format`                                     | Formate tout le code (Prettier)                        |
| `pnpm import:etudiants <fichier.csv> [--dry-run]` | Importe le référentiel de la scolarité                 |

---

## Organisation du dépôt

```
apps/web/            Application unique : participant, admin, scan (PWA)
  src/app/           Routeur, providers, gardes de rôle
  src/features/      Un dossier par domaine métier (auth, activites, scan, admin…)
  src/components/    Composants sans logique métier (ui/, layout/)
  src/lib/           Client Supabase, variables d'environnement, formatage
packages/shared/     Types générés, constantes, messages d'erreur, schémas zod, format du QR
supabase/
  migrations/        Schéma, contraintes, RLS, RPC — seule source de vérité de la base
  tests/             Tests pgTAP, un fichier par règle de gestion
  functions/         Edge Functions (Deno)
  templates/         Emails d'authentification en français
  seed.sql           Données fictives (local uniquement)
scripts/             Import du référentiel, test de charge (k6)
docs/                Cahiers des charges, ADR, comptes rendus, guides, maquettes
```

Règle : un domaine de `features/` n'importe jamais les `components/` ou `hooks/` internes d'un
autre domaine. Il passe par son `index.ts` (ESLint le vérifie).

---

## État au démarrage (semaine 0)

| Brique          | État                                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------ |
| Base de données | **Prête** : 8 migrations, RLS, RPC, audit, Realtime, seed, 90 tests pgTAP                                    |
| Règles RG1–RG16 | Garanties en base et testées (y compris deux scans simultanés du même QR)                                    |
| Application web | Squelette : routes, gardes de rôle, connexion, mon espace, QR, statistiques minimales                        |
| Écran de scan   | Flux complet sans caméra : choix de l'activité, appel serveur, écran vert/rouge, compteur temps réel         |
| Edge Functions  | `verifier-etudiant`, `creer-personnel`, `creer-participant-sur-place` écrites ; `envoyer-email` à faire (S6) |
| Écrans restants | Pages « À faire » qui rappellent le ticket et la semaine prévue                                              |

### À faire en semaine 0 (après avoir poussé ce dépôt)

1. Lancer `pnpm db:start`, puis `pnpm db:types` et commiter le fichier régénéré (le fichier initial
   a été produit sans la CLI Supabase). Ensuite, retirer `continue-on-error` de l'étape
   « Types à jour » dans `.github/workflows/ci.yml`.
2. Remplacer les pseudos GitHub dans `.github/CODEOWNERS`.
3. Lier `gresi-dev` (`pnpm supabase link --project-ref …`), puis `pnpm supabase db push`.
4. Réglages Auth de `gresi-dev` : confirmation d'email activée, SMTP personnalisé, mot de passe
   d'au moins 10 caractères, _Site URL_ et _Redirect URLs_ (localhost + URL Preview Vercel),
   modèles d'emails (copier `supabase/templates/*.html`).
5. Ne pas exécuter `seed.sql` sur `gresi-dev` ni sur `gresi-prod` : créer les comptes réels avec
   l'Edge Function `creer-personnel`.

---

## Vérifier les Edge Functions

```bash
cd supabase/functions      # toujours depuis ce dossier (sinon Deno lit le package.json de la racine)
deno check */index.ts
deno lint
```

## Sécurité — à retenir

- La clé `service_role` ne va **jamais** dans `apps/web` ni dans le dépôt.
- Les gardes de rôle de l'interface sont un confort : la sécurité réelle est assurée par la RLS
  et les contrôles des fonctions RPC.
- Aucune donnée réelle (export de la scolarité, captures de la production) dans le dépôt.
