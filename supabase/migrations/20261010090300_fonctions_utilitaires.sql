-- =============================================================================
-- GRESI — Migration 4/8 : fonctions utilitaires et triggers d'intégrité
--
-- Toutes les fonctions utilisent `set search_path = ''` et des noms
-- entièrement qualifiés (recommandation de sécurité Supabase).
-- Erreurs métier : `raise exception '<code_en_snake_case>'` (errcode P0001).
-- L'application traduit ces codes en messages (packages/shared/src/erreurs.ts).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Contexte d'appel
-- -----------------------------------------------------------------------------

-- Vrai pour une connexion directe à la base (migrations, seed, Studio) ou un
-- appel avec la clé service_role (Edge Functions). Faux pour anon/authenticated.
create or replace function public.est_contexte_serveur()
returns boolean
language sql stable
set search_path = ''
as $$
  select coalesce(
    nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role',
    'service_role'
  ) = 'service_role';
$$;

-- Rôle du membre du personnel connecté (null si participant ou anonyme)
create or replace function public.role_personnel_courant()
returns public.role_personnel
language sql stable security definer
set search_path = ''
as $$
  select p.role
  from public.personnel p
  where p.id = auth.uid() and p.est_actif;
$$;

-- Au moins admin (admin OU admin supérieur)
create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select coalesce(public.role_personnel_courant() in ('admin', 'admin_superieur'), false);
$$;

create or replace function public.is_admin_superieur()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select coalesce(public.role_personnel_courant() = 'admin_superieur', false);
$$;

create or replace function public.is_distributeur()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select coalesce(public.role_personnel_courant() = 'distributeur', false);
$$;

create or replace function public.est_participant_actif()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.participants p where p.id = auth.uid() and p.est_actif
  );
$$;

-- -----------------------------------------------------------------------------
-- Horaires des créneaux (lus dans parametres_evenement)
-- -----------------------------------------------------------------------------
create or replace function public.debut_creneau(p_jour date, p_creneau public.creneau)
returns timestamptz
language sql stable security definer
set search_path = ''
as $$
  select (p_jour + case p_creneau when 'matin' then pe.matin_debut else pe.apres_midi_debut end)
         at time zone pe.fuseau
  from public.parametres_evenement pe
  where pe.id = 1;
$$;

create or replace function public.fin_creneau(p_jour date, p_creneau public.creneau)
returns timestamptz
language sql stable security definer
set search_path = ''
as $$
  select (p_jour + case p_creneau when 'matin' then pe.matin_fin else pe.apres_midi_fin end)
         at time zone pe.fuseau
  from public.parametres_evenement pe
  where pe.id = 1;
$$;

-- -----------------------------------------------------------------------------
-- Données personnelles et comparaison de noms
-- -----------------------------------------------------------------------------

-- « 24IN0017 » → « 24IN***17 »
create or replace function public.masquer_matricule(p_matricule text)
returns text
language sql immutable
set search_path = ''
as $$
  select case
    when p_matricule is null then null
    when length(p_matricule) <= 6 then repeat('*', length(p_matricule))
    else left(p_matricule, 4) || '***' || right(p_matricule, 2)
  end;
$$;

-- Minuscules, sans accents ni ponctuation : « N'Guessan-Koné » → « nguessankone »
create or replace function public.normaliser_texte(p_texte text)
returns text
language sql immutable
set search_path = ''
as $$
  select lower(regexp_replace(
    translate(
      btrim(coalesce(p_texte, '')),
      'ÀÁÂÃÄÅàáâãäåÈÉÊËèéêëÌÍÎÏìíîïÒÓÔÕÖòóôõöÙÚÛÜùúûüÇçÑñŸÿ',
      'AAAAAAaaaaaaEEEEeeeeIIIIiiiiOOOOOoooooUUUUuuuuCcNnYy'
    ),
    '[^a-zA-Z0-9]+', '', 'g'
  ));
$$;

-- -----------------------------------------------------------------------------
-- Journal d'audit (usage interne : appelée par les RPC et les triggers)
-- -----------------------------------------------------------------------------
create or replace function public.journaliser(
  p_action       text,
  p_cible_table  text,
  p_cible_id     text,
  p_details      jsonb default '{}'::jsonb
)
returns void
language sql security definer
set search_path = ''
as $$
  insert into public.journal_audit (auteur_id, action, cible_table, cible_id, details)
  values (auth.uid(), p_action, p_cible_table, p_cible_id, coalesce(p_details, '{}'::jsonb));
$$;

-- Variante pour les Edge Functions (clé service_role : auth.uid() est null,
-- l'auteur réel est passé explicitement)
create or replace function public.journaliser_pour(
  p_auteur_id    uuid,
  p_action       text,
  p_cible_table  text,
  p_cible_id     text,
  p_details      jsonb default '{}'::jsonb
)
returns void
language sql security definer
set search_path = ''
as $$
  insert into public.journal_audit (auteur_id, action, cible_table, cible_id, details)
  values (p_auteur_id, p_action, p_cible_table, p_cible_id, coalesce(p_details, '{}'::jsonb));
$$;

-- =============================================================================
-- Triggers
-- =============================================================================

-- modifie_le automatique ------------------------------------------------------
create or replace function public.fn_modifie_le()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.modifie_le := now();
  return new;
end;
$$;

create trigger trg_parametres_evenement_modifie_le before update on public.parametres_evenement
  for each row execute function public.fn_modifie_le();
create trigger trg_personnel_modifie_le before update on public.personnel
  for each row execute function public.fn_modifie_le();
create trigger trg_participants_modifie_le before update on public.participants
  for each row execute function public.fn_modifie_le();
create trigger trg_activites_modifie_le before update on public.activites
  for each row execute function public.fn_modifie_le();
create trigger trg_inscriptions_modifie_le before update on public.inscriptions
  for each row execute function public.fn_modifie_le();
create trigger trg_annonces_modifie_le before update on public.annonces
  for each row execute function public.fn_modifie_le();

-- Cohérence du profil : une fiche étudiante pour un étudiant, etc. -------------
create or replace function public.fn_verifier_type_participant()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.participants p
    where p.id = new.participant_id
      and p.type_participant = tg_argv[0]::public.type_participant
  ) then
    raise exception 'type_participant_incoherent' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger trg_participants_etudiants_type before insert or update on public.participants_etudiants
  for each row execute function public.fn_verifier_type_participant('etudiant_inphb');
create trigger trg_participants_externes_type before insert or update on public.participants_externes
  for each row execute function public.fn_verifier_type_participant('externe');

-- Seul un distributeur peut être affecté à une activité -----------------------
create or replace function public.fn_affectations_verifier_role()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.personnel p
    where p.id = new.distributeur_id and p.role = 'distributeur'
  ) then
    raise exception 'affectation_role_invalide' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger trg_affectations_verifier_role before insert or update on public.affectations
  for each row execute function public.fn_affectations_verifier_role();

-- Une activité avec des inscrits ne change ni de jour ni de créneau -----------
-- (on l'annule et on en crée une nouvelle : les inscrits sont prévenus)
create or replace function public.fn_activites_verrou_creneau()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (new.jour, new.creneau) is distinct from (old.jour, old.creneau)
     and exists (select 1 from public.inscriptions i where i.activite_id = old.id) then
    raise exception 'activite_avec_inscrits' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger trg_activites_verrou_creneau before update of jour, creneau on public.activites
  for each row execute function public.fn_activites_verrou_creneau();

-- Inscriptions : copie du jour et du créneau depuis l'activité ----------------
-- (nom choisi pour s'exécuter AVANT trg_inscriptions_verrou : ordre alphabétique)
create or replace function public.fn_inscriptions_copier_creneau()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  select a.jour, a.creneau
    into new.jour, new.creneau
    from public.activites a
   where a.id = new.activite_id;
  return new;
end;
$$;

create trigger trg_inscriptions_copier_creneau
  before insert or update of activite_id on public.inscriptions
  for each row execute function public.fn_inscriptions_copier_creneau();

-- Inscriptions : verrou après le début de la session (RG4, RG5) --------------
-- Un participant ne peut plus choisir, changer ni retirer une activité une fois
-- la session commencée, ni modifier un créneau déjà validé.
-- La validation elle-même (mise à jour de valide_le) reste autorisée.
-- Exceptions : contexte serveur (seed, Edge Functions) et admins (accueil sur place).
create or replace function public.fn_inscriptions_verrou()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if public.est_contexte_serveur() or public.is_admin() then
    return coalesce(new, old);
  end if;

  -- Validation d'un créneau : même participant, même activité
  if tg_op = 'UPDATE'
     and new.participant_id = old.participant_id
     and new.activite_id = old.activite_id then
    return new;
  end if;

  if tg_op in ('UPDATE', 'DELETE') then
    if old.valide_le is not null then
      raise exception 'creneau_deja_valide' using errcode = 'P0001';
    end if;
    if now() >= public.debut_creneau(old.jour, old.creneau) then
      raise exception 'creneau_commence' using errcode = 'P0001';
    end if;
  end if;

  if tg_op in ('INSERT', 'UPDATE')
     and now() >= public.debut_creneau(new.jour, new.creneau) then
    raise exception 'creneau_commence' using errcode = 'P0001';
  end if;

  return coalesce(new, old);
end;
$$;

create trigger trg_inscriptions_verrou
  before insert or update or delete on public.inscriptions
  for each row execute function public.fn_inscriptions_verrou();

-- Annonces : date de publication automatique ----------------------------------
create or replace function public.fn_annonces_publication()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.est_publiee and new.publiee_le is null then
    new.publiee_le := now();
  end if;
  return new;
end;
$$;

create trigger trg_annonces_publication before insert or update on public.annonces
  for each row execute function public.fn_annonces_publication();

-- -----------------------------------------------------------------------------
-- Droits d'exécution : fonctions internes non appelables depuis l'API
-- -----------------------------------------------------------------------------
revoke execute on function public.journaliser(text, text, text, jsonb) from public, anon, authenticated;
revoke execute on function public.journaliser_pour(uuid, text, text, text, jsonb) from public, anon, authenticated;
grant execute on function public.journaliser_pour(uuid, text, text, text, jsonb) to service_role;
