-- =============================================================================
-- GRESI — Migration 5/8 : Row Level Security et privilèges
-- Cahier des charges technique V2.0 — §6.4 (matrice des droits)
--
-- Principe : RLS activée sur TOUTES les tables. Les écritures sensibles
-- (participants, inscriptions, scans) ne passent que par des RPC
-- SECURITY DEFINER ; les privilèges d'écriture directe sont donc retirés.
-- Les appels `(select public.is_admin())` sont entre parenthèses pour que
-- PostgreSQL ne les évalue qu'une fois par requête.
-- =============================================================================

alter table public.parametres_evenement   enable row level security;
alter table public.personnel              enable row level security;
alter table public.participants           enable row level security;
alter table public.participants_etudiants enable row level security;
alter table public.participants_externes  enable row level security;
alter table public.etudiants_reference    enable row level security;
alter table public.activites              enable row level security;
alter table public.affectations           enable row level security;
alter table public.inscriptions           enable row level security;
alter table public.scans                  enable row level security;
alter table public.journal_audit          enable row level security;
alter table public.annonces               enable row level security;

-- -----------------------------------------------------------------------------
-- Privilèges (défense en profondeur, en plus des politiques)
-- -----------------------------------------------------------------------------
-- Aucune écriture directe sur les tables gérées par RPC
revoke insert, update, delete, truncate on
  public.participants, public.participants_etudiants, public.participants_externes,
  public.etudiants_reference, public.inscriptions, public.scans, public.journal_audit
from anon, authenticated;

-- Les visiteurs non connectés ne voient que les paramètres, les activités
-- publiées et les annonces publiées
revoke all on
  public.personnel, public.participants, public.participants_etudiants,
  public.participants_externes, public.etudiants_reference, public.affectations,
  public.inscriptions, public.scans, public.journal_audit
from anon;
revoke insert, update, delete, truncate on
  public.parametres_evenement, public.activites, public.annonces
from anon;

-- Un participant ne peut modifier que son téléphone
grant update (telephone) on public.participants to authenticated;

-- -----------------------------------------------------------------------------
-- parametres_evenement
-- -----------------------------------------------------------------------------
create policy "tout le monde lit les parametres"
  on public.parametres_evenement for select
  to anon, authenticated
  using (true);

create policy "admin superieur modifie les parametres"
  on public.parametres_evenement for update
  to authenticated
  using ((select public.is_admin_superieur()))
  with check ((select public.is_admin_superieur()));

-- -----------------------------------------------------------------------------
-- personnel
-- -----------------------------------------------------------------------------
create policy "personnel lit sa fiche et admin lit tout"
  on public.personnel for select
  to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));

create policy "admin superieur gere le personnel"
  on public.personnel for all
  to authenticated
  using ((select public.is_admin_superieur()))
  with check ((select public.is_admin_superieur()));

-- -----------------------------------------------------------------------------
-- participants et fiches enfants
-- (l'admin passe par liste_participants_admin(), qui masque le matricule)
-- -----------------------------------------------------------------------------
create policy "participant lit sa fiche et admin superieur lit tout"
  on public.participants for select
  to authenticated
  using (id = (select auth.uid()) or (select public.is_admin_superieur()));

create policy "participant modifie sa fiche"
  on public.participants for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "participant lit sa fiche etudiant et admin superieur lit tout"
  on public.participants_etudiants for select
  to authenticated
  using (participant_id = (select auth.uid()) or (select public.is_admin_superieur()));

create policy "participant lit sa fiche externe et admin superieur lit tout"
  on public.participants_externes for select
  to authenticated
  using (participant_id = (select auth.uid()) or (select public.is_admin_superieur()));

-- -----------------------------------------------------------------------------
-- etudiants_reference : admin supérieur seulement (contrôle de l'import)
-- -----------------------------------------------------------------------------
create policy "admin superieur lit le referentiel"
  on public.etudiants_reference for select
  to authenticated
  using ((select public.is_admin_superieur()));

-- -----------------------------------------------------------------------------
-- activites
-- -----------------------------------------------------------------------------
create policy "visiteur lit les activites publiees"
  on public.activites for select
  to anon
  using (statut = 'publiee');

create policy "lecture des activites"
  on public.activites for select
  to authenticated
  using (
    statut = 'publiee'
    or (select public.is_admin())
    or (select public.is_distributeur())
    -- un participant voit aussi une activité annulée à laquelle il était inscrit
    or exists (
      select 1 from public.inscriptions i
      where i.activite_id = activites.id and i.participant_id = (select auth.uid())
    )
  );

create policy "admin superieur gere les activites"
  on public.activites for all
  to authenticated
  using ((select public.is_admin_superieur()))
  with check ((select public.is_admin_superieur()));

-- -----------------------------------------------------------------------------
-- affectations
-- -----------------------------------------------------------------------------
create policy "distributeur lit ses affectations et admin lit tout"
  on public.affectations for select
  to authenticated
  using (distributeur_id = (select auth.uid()) or (select public.is_admin()));

create policy "admin superieur gere les affectations"
  on public.affectations for all
  to authenticated
  using ((select public.is_admin_superieur()))
  with check ((select public.is_admin_superieur()));

-- -----------------------------------------------------------------------------
-- inscriptions (lecture seule ; aussi utilisée par Realtime pour le compteur)
-- -----------------------------------------------------------------------------
create policy "lecture des inscriptions"
  on public.inscriptions for select
  to authenticated
  using (
    participant_id = (select auth.uid())
    or (select public.is_admin_superieur())
    or (
      (select public.is_distributeur())
      and exists (
        select 1 from public.affectations af
        where af.activite_id = inscriptions.activite_id
          and af.distributeur_id = (select auth.uid())
      )
    )
  );

-- -----------------------------------------------------------------------------
-- scans
-- -----------------------------------------------------------------------------
create policy "distributeur lit ses scans et admin superieur lit tout"
  on public.scans for select
  to authenticated
  using (distributeur_id = (select auth.uid()) or (select public.is_admin_superieur()));

-- -----------------------------------------------------------------------------
-- journal_audit
-- -----------------------------------------------------------------------------
create policy "admin superieur lit le journal"
  on public.journal_audit for select
  to authenticated
  using ((select public.is_admin_superieur()));

-- -----------------------------------------------------------------------------
-- annonces
-- -----------------------------------------------------------------------------
create policy "lecture des annonces publiees"
  on public.annonces for select
  to anon, authenticated
  using (est_publiee or (select public.is_admin()));

create policy "admin gere les annonces"
  on public.annonces for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
