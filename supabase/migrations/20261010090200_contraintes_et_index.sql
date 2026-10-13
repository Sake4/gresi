-- =============================================================================
-- GRESI — Migration 3/8 : contraintes d'unicité, checks et index
-- Conventions : uq_<table>_<colonnes>, ck_<table>_<objet>, idx_<table>_<colonnes>
-- =============================================================================

-- parametres_evenement --------------------------------------------------------
alter table public.parametres_evenement
  add constraint ck_parametres_evenement_ligne_unique check (id = 1),
  add constraint ck_parametres_evenement_dates
    check (date_debut is null or date_fin is null or date_fin >= date_debut),
  add constraint ck_parametres_evenement_horaires
    check (matin_debut < matin_fin and apres_midi_debut < apres_midi_fin and matin_fin <= apres_midi_debut),
  add constraint ck_parametres_evenement_fenetre_scan
    check (scan_ouverture_min between 0 and 2880 and scan_fermeture_min between 0 and 2880);

-- participants ----------------------------------------------------------------
create unique index uq_participants_email on public.participants (lower(email));
alter table public.participants
  add constraint uq_participants_qr_token unique (qr_token),
  add constraint ck_participants_nom_non_vide check (btrim(nom) <> '' and btrim(prenom) <> '');

-- participants_etudiants : un matricule = un seul compte (RG11) ---------------
alter table public.participants_etudiants
  add constraint uq_participants_etudiants_matricule unique (matricule),
  add constraint ck_participants_etudiants_matricule_majuscule check (matricule = upper(btrim(matricule)));

-- etudiants_reference ---------------------------------------------------------
alter table public.etudiants_reference
  add constraint ck_etudiants_reference_matricule_majuscule check (matricule = upper(btrim(matricule))),
  add constraint ck_etudiants_reference_source check (source in ('import_csv', 'api'));

-- activites -------------------------------------------------------------------
alter table public.activites
  add constraint ck_activites_intitule_non_vide check (btrim(intitule) <> ''),
  add constraint ck_activites_lieu_non_vide check (btrim(lieu) <> '');
create index idx_activites_jour_creneau on public.activites (jour, creneau);

-- affectations ----------------------------------------------------------------
create index idx_affectations_activite on public.affectations (activite_id);

-- inscriptions : une seule activité par créneau (RG1) -------------------------
alter table public.inscriptions
  add constraint uq_inscriptions_participant_creneau unique (participant_id, jour, creneau),
  add constraint ck_inscriptions_validation_coherente
    check ((valide_le is null) = (methode_validation is null));
create index idx_inscriptions_activite on public.inscriptions (activite_id) include (valide_le);

-- scans : idempotence (RG13) --------------------------------------------------
alter table public.scans
  add constraint uq_scans_scan_id_client unique (scan_id_client);
create index idx_scans_activite_scanne_le on public.scans (activite_id, scanne_le desc);
create index idx_scans_distributeur_scanne_le on public.scans (distributeur_id, scanne_le desc);

-- journal_audit ---------------------------------------------------------------
create index idx_journal_audit_cree_le on public.journal_audit (cree_le desc);

-- annonces --------------------------------------------------------------------
alter table public.annonces
  add constraint ck_annonces_publication check (not est_publiee or publiee_le is not null);
create index idx_annonces_publiee_le on public.annonces (publiee_le desc) where est_publiee;
