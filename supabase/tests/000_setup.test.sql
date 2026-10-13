-- =============================================================================
-- Outils de test partagés (schéma `tests`), installés avant les autres fichiers.
-- Ce fichier n'est PAS annulé : les fonctions restent disponibles pour les
-- fichiers suivants (exécutés par ordre alphabétique).
-- Chaque fichier de test, lui, s'exécute dans une transaction annulée.
-- =============================================================================

create extension if not exists pgtap with schema extensions;

create schema if not exists tests;
grant usage on schema tests to anon, authenticated;

-- Crée un compte Auth (email confirmé par défaut) -----------------------------
create or replace function tests.creer_utilisateur(p_email text, p_confirme boolean default true)
returns uuid
language plpgsql
as $$
declare
  v_id uuid := gen_random_uuid();
begin
  insert into auth.users (id, email, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  values (v_id, p_email, case when p_confirme then now() end, '{}'::jsonb, '{}'::jsonb, now(), now());
  return v_id;
end;
$$;

-- Simule une requête de l'application avec le JWT de cet utilisateur ----------
create or replace function tests.se_connecter(p_user_id uuid)
returns void
language plpgsql
as $$
begin
  perform set_config('request.jwt.claims',
    jsonb_build_object('sub', p_user_id, 'role', 'authenticated')::text, true);
  perform set_config('role', 'authenticated', true);
end;
$$;

-- Simule un visiteur non connecté ---------------------------------------------
create or replace function tests.se_connecter_anonyme()
returns void
language plpgsql
as $$
begin
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  perform set_config('role', 'anon', true);
end;
$$;

-- Revient en contexte serveur (postgres, sans JWT) -----------------------------
create or replace function tests.se_deconnecter()
returns void
language plpgsql
as $$
begin
  perform set_config('role', 'postgres', true);
  perform set_config('request.jwt.claims', '', true);
end;
$$;

grant execute on all functions in schema tests to anon, authenticated;

-- Fabriques de données ---------------------------------------------------------
create or replace function tests.creer_personnel(p_email text, p_role public.role_personnel)
returns uuid
language plpgsql
as $$
declare
  v_id uuid := tests.creer_utilisateur(p_email);
begin
  insert into public.personnel (id, role, nom, prenom) values (v_id, p_role, 'Test', p_email);
  return v_id;
end;
$$;

create or replace function tests.creer_etudiant(p_matricule text, p_nom text default 'Testeur')
returns uuid
language plpgsql
as $$
declare
  v_id uuid := tests.creer_utilisateur(lower(p_matricule) || '@etu.test');
begin
  insert into public.etudiants_reference (matricule, nom, prenom, ecole, filiere, classe)
  values (upper(p_matricule), upper(p_nom), 'Prénom', 'ESI', 'Informatique', 'ING2')
  on conflict (matricule) do nothing;
  perform public._creer_participant(v_id, 'etudiant_inphb', p_nom, 'Prénom', true, p_matricule => p_matricule);
  return v_id;
end;
$$;

create or replace function tests.creer_externe(p_email text)
returns uuid
language plpgsql
as $$
declare
  v_id uuid := tests.creer_utilisateur(p_email);
begin
  perform public._creer_participant(v_id, 'externe', 'Externe', 'Test', true, p_statut => 'visiteur');
  return v_id;
end;
$$;

create or replace function tests.creer_activite(
  p_jour date, p_creneau public.creneau, p_statut public.statut_activite default 'publiee')
returns uuid
language sql
as $$
  insert into public.activites (intitule, lieu, jour, creneau, statut)
  values ('Activité de test', 'Salle test', p_jour, p_creneau, p_statut)
  returning id;
$$;

create or replace function tests.affecter(p_distributeur uuid, p_activite uuid)
returns void
language sql
as $$
  insert into public.affectations (distributeur_id, activite_id) values (p_distributeur, p_activite);
$$;

-- Inscription directe (contexte serveur : ignore le verrou horaire)
create or replace function tests.inscrire(p_participant uuid, p_activite uuid)
returns uuid
language sql
as $$
  insert into public.inscriptions (participant_id, activite_id, jour, creneau)
  select p_participant, a.id, a.jour, a.creneau from public.activites a where a.id = p_activite
  returning id;
$$;

-- Fenêtre de scan couvrant toute la journée (tests indépendants de l'heure)
create or replace function tests.ouvrir_scans_toute_la_journee()
returns void
language sql
as $$
  update public.parametres_evenement set scan_ouverture_min = 2000, scan_fermeture_min = 2000 where id = 1;
$$;

create or replace function tests.qr(p_participant uuid)
returns uuid
language sql
as $$
  select qr_token from public.participants where id = p_participant;
$$;

select plan(1);
select pass('Outils de test installés');
select * from finish();
