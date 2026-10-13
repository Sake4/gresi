-- =============================================================================
-- GRESI — Migration 2/8 : tables
-- Cahier des charges technique V2.0 — §6.2
-- Les contraintes d'unicité nommées, les checks et les index sont dans la
-- migration 3 ; les triggers dans la migration 4 ; la RLS dans la migration 5.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Paramètres de l'édition (une seule ligne, id = 1)
-- -----------------------------------------------------------------------------
create table public.parametres_evenement (
  id                      smallint primary key default 1,
  edition                 text        not null,
  date_debut              date,
  date_fin                date,
  fuseau                  text        not null default 'Africa/Abidjan',
  matin_debut             time        not null default '08:00',
  matin_fin               time        not null default '12:00',
  apres_midi_debut        time        not null default '14:00',
  apres_midi_fin          time        not null default '18:00',
  -- Fenêtre de scan autour de la FIN du créneau (RG16)
  scan_ouverture_min      integer     not null default 30,   -- minutes avant la fin
  scan_fermeture_min      integer     not null default 60,   -- minutes après la fin
  -- Si renseigné, les étudiants doivent s'inscrire avec une adresse de ce domaine
  domaine_email_etudiant  text,
  cree_le                 timestamptz not null default now(),
  modifie_le              timestamptz not null default now()
);
comment on table public.parametres_evenement is
  'Paramètres de l''édition en cours (ligne unique id = 1). Modifiable par l''admin supérieur.';

insert into public.parametres_evenement (id, edition) values (1, 'Semaine de l''Industrie 2026');

-- -----------------------------------------------------------------------------
-- Personnel : distributeurs, admins, admins supérieurs
-- -----------------------------------------------------------------------------
create table public.personnel (
  id          uuid primary key references auth.users (id) on delete cascade,
  role        public.role_personnel not null,
  nom         text        not null,
  prenom      text        not null,
  est_actif   boolean     not null default true,
  cree_le     timestamptz not null default now(),
  modifie_le  timestamptz not null default now()
);
comment on table public.personnel is
  'Comptes du personnel. Créés uniquement par un admin supérieur (Edge Function creer-personnel).';

-- -----------------------------------------------------------------------------
-- Participants (table de base) + deux tables enfants selon le profil
-- -----------------------------------------------------------------------------
create table public.participants (
  id                uuid primary key references auth.users (id) on delete cascade,
  type_participant  public.type_participant not null,
  nom               text        not null,
  prenom            text        not null,
  email             text        not null,
  telephone         text,
  -- Jeton opaque contenu dans le QR (« GRESI:1:<qr_token> ») — RG2, RG15
  qr_token          uuid        not null default gen_random_uuid(),
  qr_regenere_le    timestamptz,
  est_actif         boolean     not null default true,
  consentement_le   timestamptz not null,
  cree_le           timestamptz not null default now(),
  modifie_le        timestamptz not null default now()
);
comment on table public.participants is
  'Participants (étudiants INPHB et externes). Création uniquement via inscrire_participant().';
comment on column public.participants.qr_token is
  'Jeton opaque et régénérable. Aucune donnée personnelle dans le QR.';

create table public.participants_etudiants (
  participant_id       uuid primary key references public.participants (id) on delete cascade,
  matricule            text        not null,
  ecole                text        not null,
  filiere              text        not null,
  classe               text        not null,
  source_verification  public.source_verification not null,
  verifie_le           timestamptz not null default now()
);

create table public.participants_externes (
  participant_id  uuid primary key references public.participants (id) on delete cascade,
  statut          public.statut_externe not null,
  structure       text,
  motif_presence  text
);

-- -----------------------------------------------------------------------------
-- Référentiel des étudiants fourni par l'INPHB (import CSV ou cache de l'API)
-- Jamais lisible par les participants, distributeurs ou admins.
-- -----------------------------------------------------------------------------
create table public.etudiants_reference (
  matricule   text primary key,
  nom         text        not null,
  prenom      text        not null,
  ecole       text        not null,
  filiere     text        not null,
  classe      text        not null,
  source      text        not null default 'import_csv',
  importe_le  timestamptz not null default now()
);
comment on table public.etudiants_reference is
  'Données de la scolarité INPHB servant à vérifier les matricules (RG11). À purger après l''évènement.';

-- -----------------------------------------------------------------------------
-- Activités et affectations des distributeurs
-- -----------------------------------------------------------------------------
create table public.activites (
  id           uuid primary key default gen_random_uuid(),
  intitule     text        not null,
  description  text,
  lieu         text        not null,
  jour         date        not null,
  creneau      public.creneau not null,
  statut       public.statut_activite not null default 'brouillon',
  cree_par     uuid references public.personnel (id) on delete set null,
  cree_le      timestamptz not null default now(),
  modifie_le   timestamptz not null default now()
);

create table public.affectations (
  distributeur_id  uuid not null references public.personnel (id) on delete cascade,
  activite_id      uuid not null references public.activites (id) on delete cascade,
  cree_par         uuid references public.personnel (id) on delete set null,
  cree_le          timestamptz not null default now(),
  primary key (distributeur_id, activite_id)
);
comment on table public.affectations is
  'Distributeurs autorisés à valider une activité (RG7, RG12). Plusieurs distributeurs par activité.';

-- -----------------------------------------------------------------------------
-- Inscriptions : une ligne = un créneau choisi par un participant
-- -----------------------------------------------------------------------------
create table public.inscriptions (
  id                  uuid primary key default gen_random_uuid(),
  participant_id      uuid not null references public.participants (id) on delete cascade,
  activite_id         uuid not null references public.activites (id) on delete restrict,
  -- Copiés depuis l'activité par trigger : support de la contrainte RG1
  jour                date not null,
  creneau             public.creneau not null,
  valide_le           timestamptz,
  valide_par          uuid references public.personnel (id) on delete set null,
  methode_validation  public.methode_validation,
  cree_le             timestamptz not null default now(),
  modifie_le          timestamptz not null default now()
);
comment on table public.inscriptions is
  'Choix d''activité par créneau (RG1). Écriture uniquement via les RPC choisir_activite, retirer_choix, valider_*.';

-- -----------------------------------------------------------------------------
-- Journal des scans : chaque tentative, réussie ou non
-- -----------------------------------------------------------------------------
create table public.scans (
  id               bigint generated always as identity primary key,
  scan_id_client   uuid not null,
  distributeur_id  uuid not null references public.personnel (id) on delete cascade,
  activite_id      uuid not null references public.activites (id) on delete cascade,
  participant_id   uuid references public.participants (id) on delete set null,
  inscription_id   uuid references public.inscriptions (id) on delete set null,
  resultat         public.resultat_scan not null,
  methode          public.methode_validation not null,
  scanne_le        timestamptz not null default now()
);
comment on column public.scans.scan_id_client is
  'UUID généré par le téléphone : un même scan renvoyé n''est compté qu''une fois (RG13).';

-- -----------------------------------------------------------------------------
-- Journal d'audit (lecture seule, alimenté par triggers et RPC)
-- -----------------------------------------------------------------------------
create table public.journal_audit (
  id           bigint generated always as identity primary key,
  auteur_id    uuid,
  action       text  not null,
  cible_table  text  not null,
  cible_id     text,
  details      jsonb not null default '{}'::jsonb,
  cree_le      timestamptz not null default now()
);
comment on table public.journal_audit is
  'Traçabilité des actions sensibles. Actions nommées entite.verbe_au_participe (ex. qr.regenere).';

-- -----------------------------------------------------------------------------
-- Annonces affichées dans l'application
-- -----------------------------------------------------------------------------
create table public.annonces (
  id           uuid primary key default gen_random_uuid(),
  titre        text        not null,
  contenu      text        not null,
  est_publiee  boolean     not null default false,
  publiee_le   timestamptz,
  auteur_id    uuid references public.personnel (id) on delete set null,
  cree_le      timestamptz not null default now(),
  modifie_le   timestamptz not null default now()
);
