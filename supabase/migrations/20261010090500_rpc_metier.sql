-- =============================================================================
-- GRESI — Migration 6/8 : fonctions métier (RPC)
-- Cahier des charges technique V2.0 — §6.3 et §7
--
-- Fonctions publiques (appelables par l'application) :
--   inscrire_participant, choisir_activite, retirer_choix,
--   valider_scan, valider_manuellement, rechercher_inscrits,
--   stats_activites, liste_participants_admin,
--   regenerer_qr, modifier_statut_participant
-- Fonctions internes (préfixe _ ou réservées au service_role) :
--   _creer_participant, verifier_etudiant_reference,
--   _traiter_validation, _reponse_scan
-- =============================================================================

-- =============================================================================
-- 1. Comptes participants
-- =============================================================================

-- Vérifie un matricule dans le référentiel (sans rien créer).
-- Appelée par l'Edge Function verifier-etudiant (clé service_role).
create or replace function public.verifier_etudiant_reference(p_matricule text, p_nom text)
returns jsonb
language plpgsql stable security definer
set search_path = ''
as $$
declare
  v_matricule text := upper(btrim(coalesce(p_matricule, '')));
  v_ref public.etudiants_reference;
begin
  select * into v_ref from public.etudiants_reference r where r.matricule = v_matricule;

  if not found then
    return jsonb_build_object('valide', false, 'motif', 'matricule_inconnu');
  end if;
  if public.normaliser_texte(v_ref.nom) <> public.normaliser_texte(p_nom) then
    return jsonb_build_object('valide', false, 'motif', 'nom_discordant');
  end if;
  if exists (select 1 from public.participants_etudiants e where e.matricule = v_matricule) then
    return jsonb_build_object('valide', false, 'motif', 'matricule_deja_utilise');
  end if;

  return jsonb_build_object(
    'valide',  true,
    'ecole',   v_ref.ecole,
    'filiere', v_ref.filiere,
    'classe',  v_ref.classe
  );
end;
$$;

-- Crée le participant, sa fiche enfant et son QR dans une seule transaction.
-- Interne : appelée par inscrire_participant() et par l'Edge Function
-- creer-participant-sur-place.
create or replace function public._creer_participant(
  p_user_id       uuid,
  p_type          public.type_participant,
  p_nom           text,
  p_prenom        text,
  p_consentement  boolean,
  p_telephone     text default null,
  p_matricule     text default null,
  p_statut        public.statut_externe default null,
  p_structure     text default null,
  p_motif         text default null
)
returns jsonb
language plpgsql security definer
set search_path = ''
as $$
declare
  v_email        text;
  v_matricule    text := upper(btrim(coalesce(p_matricule, '')));
  v_ref          public.etudiants_reference;
  v_domaine      text;
  v_participant  public.participants;
begin
  select u.email into v_email from auth.users u where u.id = p_user_id;
  if v_email is null then
    raise exception 'utilisateur_inconnu' using errcode = 'P0001';
  end if;
  if exists (select 1 from public.personnel pe where pe.id = p_user_id) then
    raise exception 'compte_personnel' using errcode = 'P0001';
  end if;
  if exists (select 1 from public.participants pa where pa.id = p_user_id) then
    raise exception 'deja_inscrit' using errcode = 'P0001';
  end if;
  if not coalesce(p_consentement, false) then
    raise exception 'consentement_requis' using errcode = 'P0001';
  end if;

  if p_type = 'etudiant_inphb' then
    -- RG11 : matricule vérifié et unique
    if v_matricule = '' then
      raise exception 'matricule_requis' using errcode = 'P0001';
    end if;
    select * into v_ref from public.etudiants_reference r where r.matricule = v_matricule;
    if not found then
      raise exception 'matricule_inconnu' using errcode = 'P0001';
    end if;
    if public.normaliser_texte(v_ref.nom) <> public.normaliser_texte(p_nom) then
      raise exception 'nom_discordant' using errcode = 'P0001';
    end if;
    if exists (select 1 from public.participants_etudiants e where e.matricule = v_matricule) then
      raise exception 'matricule_deja_utilise' using errcode = 'P0001';
    end if;

    select pe.domaine_email_etudiant into v_domaine from public.parametres_evenement pe where pe.id = 1;
    if v_domaine is not null and lower(v_email) not like '%@' || lower(btrim(v_domaine)) then
      raise exception 'email_institutionnel_requis' using errcode = 'P0001';
    end if;

    -- Nom et prénom officiels du référentiel
    insert into public.participants (id, type_participant, nom, prenom, email, telephone, consentement_le)
    values (p_user_id, p_type, v_ref.nom, v_ref.prenom, lower(v_email),
            nullif(btrim(p_telephone), ''), now())
    returning * into v_participant;

    insert into public.participants_etudiants
      (participant_id, matricule, ecole, filiere, classe, source_verification)
    values
      (p_user_id, v_matricule, v_ref.ecole, v_ref.filiere, v_ref.classe,
       case when v_ref.source = 'api' then 'api' else 'referentiel' end::public.source_verification);

  else
    if p_statut is null then
      raise exception 'statut_requis' using errcode = 'P0001';
    end if;
    if btrim(coalesce(p_nom, '')) = '' or btrim(coalesce(p_prenom, '')) = '' then
      raise exception 'nom_prenom_requis' using errcode = 'P0001';
    end if;

    insert into public.participants (id, type_participant, nom, prenom, email, telephone, consentement_le)
    values (p_user_id, p_type, btrim(p_nom), btrim(p_prenom), lower(v_email),
            nullif(btrim(p_telephone), ''), now())
    returning * into v_participant;

    insert into public.participants_externes (participant_id, statut, structure, motif_presence)
    values (p_user_id, p_statut, nullif(btrim(p_structure), ''), nullif(btrim(p_motif), ''));
  end if;

  return jsonb_build_object(
    'participant_id', v_participant.id,
    'qr_token',       v_participant.qr_token
  );
end;
$$;

-- Appelée par l'application après la confirmation de l'email (UC1)
create or replace function public.inscrire_participant(
  p_type          public.type_participant,
  p_nom           text,
  p_prenom        text,
  p_consentement  boolean,
  p_telephone     text default null,
  p_matricule     text default null,
  p_statut        public.statut_externe default null,
  p_structure     text default null,
  p_motif         text default null
)
returns jsonb
language plpgsql security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'non_authentifie' using errcode = 'P0001';
  end if;
  if not exists (
    select 1 from auth.users u where u.id = v_uid and u.email_confirmed_at is not null
  ) then
    raise exception 'email_non_confirme' using errcode = 'P0001';
  end if;

  return public._creer_participant(
    v_uid, p_type, p_nom, p_prenom, p_consentement,
    p_telephone, p_matricule, p_statut, p_structure, p_motif
  );
end;
$$;

-- =============================================================================
-- 2. Choix des activités (RG1, RG4)
-- =============================================================================
create or replace function public.choisir_activite(p_activite_id uuid)
returns public.inscriptions
language plpgsql security definer
set search_path = ''
as $$
declare
  v_uid   uuid := auth.uid();
  v_act   public.activites;
  v_insc  public.inscriptions;
begin
  if not public.est_participant_actif() then
    raise exception 'participant_requis' using errcode = 'P0001';
  end if;

  select * into v_act from public.activites a where a.id = p_activite_id;
  if not found or v_act.statut <> 'publiee' then
    raise exception 'activite_indisponible' using errcode = 'P0001';
  end if;
  if now() >= public.debut_creneau(v_act.jour, v_act.creneau) then
    raise exception 'creneau_commence' using errcode = 'P0001';
  end if;

  -- Un seul choix par créneau : on remplace l'éventuel choix précédent
  insert into public.inscriptions (participant_id, activite_id, jour, creneau)
  values (v_uid, v_act.id, v_act.jour, v_act.creneau)
  on conflict on constraint uq_inscriptions_participant_creneau
  do update set activite_id = excluded.activite_id
     where public.inscriptions.valide_le is null
  returning * into v_insc;

  if v_insc.id is null then
    raise exception 'creneau_deja_valide' using errcode = 'P0001';
  end if;

  return v_insc;
end;
$$;

create or replace function public.retirer_choix(p_jour date, p_creneau public.creneau)
returns void
language plpgsql security definer
set search_path = ''
as $$
begin
  if not public.est_participant_actif() then
    raise exception 'participant_requis' using errcode = 'P0001';
  end if;

  delete from public.inscriptions i
   where i.participant_id = auth.uid()
     and i.jour = p_jour
     and i.creneau = p_creneau;

  if not found then
    raise exception 'aucun_choix' using errcode = 'P0001';
  end if;
end;
$$;

-- =============================================================================
-- 3. Validation des créneaux (RG3, RG5, RG6, RG7, RG12–RG14, RG16)
-- =============================================================================

-- Construit la réponse renvoyée au téléphone du distributeur
create or replace function public._reponse_scan(
  p_resultat        public.resultat_scan,
  p_participant_id  uuid,
  p_activite_id     uuid,
  p_rejeu           boolean
)
returns jsonb
language plpgsql stable security definer
set search_path = ''
as $$
declare
  v_participant  jsonb;
  v_insc         public.inscriptions;
  v_valide_par   text;
  v_compteur     jsonb;
begin
  -- Identité du participant : seulement si le distributeur est concerné
  if p_resultat in ('valide', 'deja_utilise', 'non_inscrit') and p_participant_id is not null then
    select jsonb_build_object(
             'nom',         p.nom,
             'prenom',      p.prenom,
             'type',        p.type_participant,
             'identifiant', coalesce(public.masquer_matricule(e.matricule), x.statut::text)
           )
      into v_participant
      from public.participants p
      left join public.participants_etudiants e on e.participant_id = p.id
      left join public.participants_externes  x on x.participant_id = p.id
     where p.id = p_participant_id;

    select * into v_insc
      from public.inscriptions i
     where i.participant_id = p_participant_id and i.activite_id = p_activite_id;

    if v_insc.valide_par is not null then
      select pe.prenom || ' ' || pe.nom into v_valide_par
        from public.personnel pe where pe.id = v_insc.valide_par;
    end if;
  end if;

  if p_resultat <> 'non_affecte' then
    select jsonb_build_object(
             'valides',  count(i.valide_le),
             'inscrits', count(i.id)
           )
      into v_compteur
      from public.inscriptions i
     where i.activite_id = p_activite_id;
  end if;

  return jsonb_build_object(
    'resultat',    p_resultat,
    'participant', v_participant,
    'valide_le',   v_insc.valide_le,
    'valide_par',  v_valide_par,
    'methode',     v_insc.methode_validation,
    'compteur',    v_compteur,
    'rejeu',       p_rejeu
  );
end;
$$;

-- Cœur commun à valider_scan et valider_manuellement
create or replace function public._traiter_validation(
  p_participant_id  uuid,
  p_activite_id     uuid,
  p_scan_id_client  uuid,
  p_methode         public.methode_validation
)
returns jsonb
language plpgsql security definer
set search_path = ''
as $$
declare
  v_uid           uuid := auth.uid();
  v_scan          public.scans;
  v_act           public.activites;
  v_insc_id       uuid;
  v_maj_id        uuid;
  v_fin           timestamptz;
  v_ouverture     integer;
  v_fermeture     integer;
  v_resultat      public.resultat_scan;
begin
  -- 1. Idempotence (RG13) : un scan déjà traité renvoie le même résultat
  select * into v_scan from public.scans s where s.scan_id_client = p_scan_id_client;
  if found then
    if v_scan.distributeur_id <> v_uid then
      raise exception 'scan_id_conflit' using errcode = 'P0001';
    end if;
    return public._reponse_scan(v_scan.resultat, v_scan.participant_id, v_scan.activite_id, true);
  end if;

  select * into v_act from public.activites a where a.id = p_activite_id;

  -- 2. QR reconnu et compte actif
  if p_participant_id is null
     or not exists (select 1 from public.participants p where p.id = p_participant_id and p.est_actif) then
    v_resultat := 'qr_invalide';

  -- 3. Distributeur affecté à l'activité (RG7) — l'admin supérieur peut valider
  --    manuellement sans affectation
  elsif not (
    exists (select 1 from public.affectations af
             where af.distributeur_id = v_uid and af.activite_id = p_activite_id)
    or (p_methode = 'manuelle' and public.is_admin_superieur())
  ) then
    v_resultat := 'non_affecte';

  else
    -- 4. Activité publiée et dans la fenêtre de scan (RG16)
    select pe.scan_ouverture_min, pe.scan_fermeture_min
      into v_ouverture, v_fermeture
      from public.parametres_evenement pe where pe.id = 1;
    v_fin := public.fin_creneau(v_act.jour, v_act.creneau);

    if v_act.statut <> 'publiee'
       or now() < v_fin - make_interval(mins => v_ouverture)
       or now() > v_fin + make_interval(mins => v_fermeture) then
      v_resultat := 'hors_creneau';
    else
      -- 5. Inscrit à CETTE activité pour ce créneau (RG6)
      select i.id into v_insc_id
        from public.inscriptions i
       where i.participant_id = p_participant_id and i.activite_id = p_activite_id;

      if v_insc_id is null then
        v_resultat := 'non_inscrit';
      else
        -- 6. Validation atomique (RG5, RG12) : seule la première requête
        --    trouve encore valide_le à null, même avec des scans simultanés.
        update public.inscriptions i
           set valide_le = now(),
               valide_par = v_uid,
               methode_validation = p_methode
         where i.id = v_insc_id
           and i.valide_le is null
        returning i.id into v_maj_id;

        v_resultat := case when v_maj_id is null then 'deja_utilise' else 'valide' end;
      end if;
    end if;
  end if;

  -- 7. Journal de la tentative
  insert into public.scans
    (scan_id_client, distributeur_id, activite_id, participant_id, inscription_id, resultat, methode)
  values
    (p_scan_id_client, v_uid, p_activite_id,
     case when v_resultat = 'qr_invalide' then null else p_participant_id end,
     v_insc_id, v_resultat, p_methode)
  on conflict on constraint uq_scans_scan_id_client do nothing;

  if not found then
    -- Même scan_id_client reçu deux fois au même instant : on renvoie le premier
    select * into v_scan from public.scans s where s.scan_id_client = p_scan_id_client;
    return public._reponse_scan(v_scan.resultat, v_scan.participant_id, v_scan.activite_id, true);
  end if;

  if v_resultat = 'valide' and p_methode = 'manuelle' then
    perform public.journaliser(
      'inscription.validee_manuellement', 'inscriptions', v_insc_id::text,
      jsonb_build_object('participant_id', p_participant_id, 'activite_id', p_activite_id)
    );
  end if;

  return public._reponse_scan(v_resultat, p_participant_id, p_activite_id, false);
end;
$$;

-- Scan d'un QR « GRESI:1:<qr_token> » par un distributeur
create or replace function public.valider_scan(
  p_qr_token        uuid,
  p_activite_id     uuid,
  p_scan_id_client  uuid
)
returns jsonb
language plpgsql security definer
set search_path = ''
as $$
declare
  v_participant_id uuid;
begin
  if not public.is_distributeur() then
    raise exception 'acces_refuse' using errcode = 'P0001';
  end if;
  if p_activite_id is null or p_scan_id_client is null then
    raise exception 'parametres_invalides' using errcode = 'P0001';
  end if;
  if not exists (select 1 from public.activites a where a.id = p_activite_id) then
    raise exception 'activite_inconnue' using errcode = 'P0001';
  end if;

  select p.id into v_participant_id from public.participants p where p.qr_token = p_qr_token;

  return public._traiter_validation(v_participant_id, p_activite_id, p_scan_id_client, 'qr');
end;
$$;

-- Validation de secours, QR indisponible (RG14)
create or replace function public.valider_manuellement(
  p_participant_id  uuid,
  p_activite_id     uuid,
  p_scan_id_client  uuid
)
returns jsonb
language plpgsql security definer
set search_path = ''
as $$
begin
  if not (public.is_distributeur() or public.is_admin_superieur()) then
    raise exception 'acces_refuse' using errcode = 'P0001';
  end if;
  if p_participant_id is null or p_activite_id is null or p_scan_id_client is null then
    raise exception 'parametres_invalides' using errcode = 'P0001';
  end if;
  if not exists (select 1 from public.activites a where a.id = p_activite_id) then
    raise exception 'activite_inconnue' using errcode = 'P0001';
  end if;

  return public._traiter_validation(p_participant_id, p_activite_id, p_scan_id_client, 'manuelle');
end;
$$;

-- Recherche d'un inscrit par nom, prénom ou matricule (écran de secours)
create or replace function public.rechercher_inscrits(p_activite_id uuid, p_recherche text)
returns table (
  participant_id  uuid,
  nom             text,
  prenom          text,
  identifiant     text,
  valide_le       timestamptz
)
language plpgsql stable security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  v_terme text := public.normaliser_texte(p_recherche);
begin
  if not (
    public.is_admin_superieur()
    or (public.is_distributeur() and exists (
          select 1 from public.affectations af
          where af.activite_id = p_activite_id and af.distributeur_id = auth.uid()))
  ) then
    raise exception 'acces_refuse' using errcode = 'P0001';
  end if;
  if length(v_terme) < 2 then
    raise exception 'recherche_trop_courte' using errcode = 'P0001';
  end if;

  return query
  select p.id,
         p.nom,
         p.prenom,
         coalesce(public.masquer_matricule(e.matricule), x.statut::text),
         i.valide_le
    from public.inscriptions i
    join public.participants p on p.id = i.participant_id
    left join public.participants_etudiants e on e.participant_id = p.id
    left join public.participants_externes  x on x.participant_id = p.id
   where i.activite_id = p_activite_id
     and (
       public.normaliser_texte(p.nom || p.prenom) like '%' || v_terme || '%'
       or public.normaliser_texte(p.prenom || p.nom) like '%' || v_terme || '%'
       or e.matricule = upper(btrim(p_recherche))
     )
   order by p.nom, p.prenom
   limit 20;
end;
$$;

-- =============================================================================
-- 4. Tableau de bord
-- =============================================================================

-- Inscrits / validés / taux de présence par activité.
-- Admin : toutes les activités. Distributeur : ses activités.
create or replace function public.stats_activites(p_jour date default null)
returns table (
  activite_id    uuid,
  intitule       text,
  lieu           text,
  jour           date,
  creneau        public.creneau,
  statut         public.statut_activite,
  inscrits       bigint,
  valides        bigint,
  taux_presence  numeric
)
language plpgsql stable security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  v_admin boolean := public.is_admin();
begin
  if not (v_admin or public.is_distributeur()) then
    raise exception 'acces_refuse' using errcode = 'P0001';
  end if;

  return query
  select a.id,
         a.intitule,
         a.lieu,
         a.jour,
         a.creneau,
         a.statut,
         count(i.id),
         count(i.valide_le),
         case when count(i.id) = 0 then null
              else round(100.0 * count(i.valide_le) / count(i.id), 1) end
    from public.activites a
    left join public.inscriptions i on i.activite_id = a.id
   where (p_jour is null or a.jour = p_jour)
     and (v_admin or exists (
           select 1 from public.affectations af
           where af.activite_id = a.id and af.distributeur_id = auth.uid()))
   group by a.id
   order by a.jour, a.creneau, a.intitule;
end;
$$;

-- Liste des participants pour l'admin, matricule masqué
create or replace function public.liste_participants_admin(
  p_recherche  text    default null,
  p_page       integer default 1,
  p_taille     integer default 50
)
returns table (
  participant_id     uuid,
  type_participant   public.type_participant,
  nom                text,
  prenom             text,
  identifiant        text,
  ecole              text,
  filiere            text,
  est_actif          boolean,
  creneaux_inscrits  bigint,
  creneaux_valides   bigint,
  total              bigint
)
language plpgsql stable security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  v_terme   text    := public.normaliser_texte(p_recherche);
  v_taille  integer := least(greatest(coalesce(p_taille, 50), 1), 200);
  v_page    integer := greatest(coalesce(p_page, 1), 1);
begin
  if not public.is_admin() then
    raise exception 'acces_refuse' using errcode = 'P0001';
  end if;

  return query
  select p.id,
         p.type_participant,
         p.nom,
         p.prenom,
         coalesce(public.masquer_matricule(e.matricule), x.statut::text),
         e.ecole,
         e.filiere,
         p.est_actif,
         (select count(*) from public.inscriptions i where i.participant_id = p.id),
         (select count(i.valide_le) from public.inscriptions i where i.participant_id = p.id),
         count(*) over ()
    from public.participants p
    left join public.participants_etudiants e on e.participant_id = p.id
    left join public.participants_externes  x on x.participant_id = p.id
   where v_terme = ''
      or public.normaliser_texte(p.nom || p.prenom) like '%' || v_terme || '%'
      or public.normaliser_texte(p.prenom || p.nom) like '%' || v_terme || '%'
   order by p.nom, p.prenom
   limit v_taille offset (v_page - 1) * v_taille;
end;
$$;

-- =============================================================================
-- 5. Administration des participants (admin supérieur)
-- =============================================================================

-- Nouveau jeton, l'ancien QR devient invalide immédiatement (RG15)
create or replace function public.regenerer_qr(p_participant_id uuid)
returns uuid
language plpgsql security definer
set search_path = ''
as $$
declare
  v_token uuid;
begin
  if not public.is_admin_superieur() then
    raise exception 'acces_refuse' using errcode = 'P0001';
  end if;

  update public.participants p
     set qr_token = gen_random_uuid(),
         qr_regenere_le = now()
   where p.id = p_participant_id
  returning p.qr_token into v_token;

  if v_token is null then
    raise exception 'participant_inconnu' using errcode = 'P0001';
  end if;

  perform public.journaliser('qr.regenere', 'participants', p_participant_id::text);
  return v_token;
end;
$$;

create or replace function public.modifier_statut_participant(p_participant_id uuid, p_est_actif boolean)
returns void
language plpgsql security definer
set search_path = ''
as $$
begin
  if not public.is_admin_superieur() then
    raise exception 'acces_refuse' using errcode = 'P0001';
  end if;

  update public.participants p set est_actif = p_est_actif where p.id = p_participant_id;
  if not found then
    raise exception 'participant_inconnu' using errcode = 'P0001';
  end if;

  perform public.journaliser(
    case when p_est_actif then 'participant.active' else 'participant.desactive' end,
    'participants', p_participant_id::text
  );
end;
$$;

-- =============================================================================
-- Droits d'exécution
-- =============================================================================
-- Fonctions internes : jamais appelables depuis l'API publique
revoke execute on function public._creer_participant(
  uuid, public.type_participant, text, text, boolean, text, text, public.statut_externe, text, text
) from public, anon, authenticated;
revoke execute on function public._traiter_validation(uuid, uuid, uuid, public.methode_validation)
  from public, anon, authenticated;
revoke execute on function public._reponse_scan(public.resultat_scan, uuid, uuid, boolean)
  from public, anon, authenticated;
revoke execute on function public.verifier_etudiant_reference(text, text)
  from public, anon, authenticated;

grant execute on function public._creer_participant(
  uuid, public.type_participant, text, text, boolean, text, text, public.statut_externe, text, text
) to service_role;
grant execute on function public.verifier_etudiant_reference(text, text) to service_role;

-- Fonctions publiques : réservées aux utilisateurs connectés
-- (chaque fonction vérifie en plus le rôle de l'appelant)
revoke execute on function
  public.inscrire_participant(public.type_participant, text, text, boolean, text, text, public.statut_externe, text, text),
  public.choisir_activite(uuid),
  public.retirer_choix(date, public.creneau),
  public.valider_scan(uuid, uuid, uuid),
  public.valider_manuellement(uuid, uuid, uuid),
  public.rechercher_inscrits(uuid, text),
  public.stats_activites(date),
  public.liste_participants_admin(text, integer, integer),
  public.regenerer_qr(uuid),
  public.modifier_statut_participant(uuid, boolean)
from public, anon;

grant execute on function
  public.inscrire_participant(public.type_participant, text, text, boolean, text, text, public.statut_externe, text, text),
  public.choisir_activite(uuid),
  public.retirer_choix(date, public.creneau),
  public.valider_scan(uuid, uuid, uuid),
  public.valider_manuellement(uuid, uuid, uuid),
  public.rechercher_inscrits(uuid, text),
  public.stats_activites(date),
  public.liste_participants_admin(text, integer, integer),
  public.regenerer_qr(uuid),
  public.modifier_statut_participant(uuid, boolean)
to authenticated;
