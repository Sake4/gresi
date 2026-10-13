-- =============================================================================
-- GRESI — Données de développement (LOCAL UNIQUEMENT)
-- Exécuté automatiquement par `pnpm db:reset`. Jamais appliqué en production.
--
-- Tous les comptes ont le mot de passe : gresi-dev-2026
--   Admins supérieurs : admin.sup1@gresi.test, admin.sup2@…, admin.sup3@…
--   Admin             : admin@gresi.test
--   Distributeurs     : distributeur1@gresi.test … distributeur4@gresi.test
--   Étudiants         : etudiant01@gresi.test … etudiant20@gresi.test
--   Externes          : externe01@gresi.test  … externe10@gresi.test
--
-- Les activités sont placées AUJOURD'HUI et DEMAIN, avec une fenêtre de scan
-- très large : on peut tester le scan à toute heure de la journée.
-- Matricules libres pour tester l'inscription : 24IN0021 à 24IN0025
-- (nom attendu : voir la table etudiants_reference).
-- =============================================================================

do $seed$
declare
  c_mdp constant text := 'gresi-dev-2026';
  v_noms    text[] := array['Kouassi','Koné','Traoré','Yao','Konan','Bamba','Coulibaly','Ouattara',
                            'Diabaté','N''Guessan','Kouamé','Touré','Aka','Doumbia','Kra','Brou',
                            'Gnagne','Sanogo','Assi','Kacou','Diomandé','Fofana','Ehui','Tanoh','Dosso'];
  v_prenoms text[] := array['Aya','Kofi','Awa','Ibrahim','Marie','Jean-Marc','Fatou','Serge','Adjoua',
                            'Moussa','Mariam','Hervé','Esther','Yacouba','Christelle','Didier','Rokia',
                            'Arnaud','Aminata','Patrick','Salimata','Olivier','Grâce','Lassina','Nadège'];
  v_filieres text[] := array['Génie mécanique','Génie électrique','Génie chimique','Génie industriel','Informatique'];
  v_id   uuid;
  v_a    uuid[];  -- activités
  v_d    uuid[];  -- distributeurs
  v_etu  uuid[];
  v_ext  uuid[];
  i      int;
begin
  -- ---------------------------------------------------------------------------
  -- Utilitaire : création d'un compte Auth (email confirmé, mot de passe connu)
  -- ---------------------------------------------------------------------------
  create temporary table _comptes (email text primary key, id uuid not null) on commit drop;

  -- ---------------------------------------------------------------------------
  -- Paramètres de dev : édition sur 4 jours à partir d'aujourd'hui
  -- ---------------------------------------------------------------------------
  update public.parametres_evenement
     set edition = 'Semaine de l''Industrie 2026 (dev)',
         date_debut = current_date,
         date_fin = current_date + 3,
         scan_ouverture_min = 720,
         scan_fermeture_min = 720
   where id = 1;

  -- ---------------------------------------------------------------------------
  -- Comptes Auth
  -- ---------------------------------------------------------------------------
  insert into _comptes (email, id)
  select e, gen_random_uuid() from unnest(
    array['admin.sup1@gresi.test','admin.sup2@gresi.test','admin.sup3@gresi.test','admin@gresi.test',
          'distributeur1@gresi.test','distributeur2@gresi.test','distributeur3@gresi.test','distributeur4@gresi.test']
    || array(select format('etudiant%s@gresi.test', lpad(n::text, 2, '0')) from generate_series(1, 20) n)
    || array(select format('externe%s@gresi.test',  lpad(n::text, 2, '0')) from generate_series(1, 10) n)
  ) e;

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
  )
  select '00000000-0000-0000-0000-000000000000', c.id, 'authenticated', 'authenticated', c.email,
         extensions.crypt(c_mdp, extensions.gen_salt('bf')), now(),
         '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now(),
         '', '', '', ''
    from _comptes c;

  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  select gen_random_uuid(), c.id, c.id::text,
         jsonb_build_object('sub', c.id::text, 'email', c.email, 'email_verified', true),
         'email', now(), now(), now()
    from _comptes c;

  -- ---------------------------------------------------------------------------
  -- Personnel
  -- ---------------------------------------------------------------------------
  insert into public.personnel (id, role, nom, prenom)
  select c.id, r.role::public.role_personnel, r.nom, r.prenom
    from (values
      ('admin.sup1@gresi.test',    'admin_superieur', 'Admin', 'Supérieur 1'),
      ('admin.sup2@gresi.test',    'admin_superieur', 'Admin', 'Supérieur 2'),
      ('admin.sup3@gresi.test',    'admin_superieur', 'Admin', 'Supérieur 3'),
      ('admin@gresi.test',         'admin',           'Comité', 'Admin'),
      ('distributeur1@gresi.test', 'distributeur',    'Distributeur', 'Un'),
      ('distributeur2@gresi.test', 'distributeur',    'Distributeur', 'Deux'),
      ('distributeur3@gresi.test', 'distributeur',    'Distributeur', 'Trois'),
      ('distributeur4@gresi.test', 'distributeur',    'Distributeur', 'Quatre')
    ) r(email, role, nom, prenom)
    join _comptes c on c.email = r.email;

  select array_agg(c.id order by c.email) into v_d
    from _comptes c where c.email like 'distributeur%';

  -- ---------------------------------------------------------------------------
  -- Référentiel INPHB fictif : 25 étudiants (20 inscrits + 5 libres)
  -- ---------------------------------------------------------------------------
  insert into public.etudiants_reference (matricule, nom, prenom, ecole, filiere, classe)
  select '24IN' || lpad(n::text, 4, '0'),
         upper(v_noms[n]),
         v_prenoms[n],
         'ESI',
         v_filieres[1 + (n % 5)],
         case when n % 3 = 0 then 'ING1' when n % 3 = 1 then 'ING2' else 'ING3' end
    from generate_series(1, 25) n;

  -- ---------------------------------------------------------------------------
  -- Participants (création par la même fonction que l'application)
  -- ---------------------------------------------------------------------------
  for i in 1..20 loop
    select c.id into v_id from _comptes c where c.email = format('etudiant%s@gresi.test', lpad(i::text, 2, '0'));
    perform public._creer_participant(
      v_id, 'etudiant_inphb', v_noms[i], v_prenoms[i], true,
      p_matricule => '24IN' || lpad(i::text, 4, '0')
    );
    v_etu := v_etu || v_id;
  end loop;

  for i in 1..10 loop
    select c.id into v_id from _comptes c where c.email = format('externe%s@gresi.test', lpad(i::text, 2, '0'));
    perform public._creer_participant(
      v_id, 'externe', v_noms[(i + 19) % 25 + 1], v_prenoms[(i * 7) % 25 + 1], true,
      p_statut    => (array['professionnel','visiteur','etudiant_hors_inphb','autre'])[1 + (i % 4)]::public.statut_externe,
      p_structure => case when i % 2 = 0 then 'Entreprise partenaire ' || i end
    );
    v_ext := v_ext || v_id;
  end loop;

  -- ---------------------------------------------------------------------------
  -- Activités : aujourd'hui (matin + après-midi) et demain
  -- ---------------------------------------------------------------------------
  with nouvelles as (
    insert into public.activites (intitule, description, lieu, jour, creneau, statut)
    values
      ('Conférence inaugurale',               'Ouverture officielle de la SI',          'Amphi A',  current_date,     'matin',      'publiee'),
      ('Atelier maintenance industrielle',    'Maintenance prédictive et capteurs',     'Salle 101', current_date,    'matin',      'publiee'),
      ('Table ronde : transition énergétique','Industriels et chercheurs',               'Amphi A',  current_date,     'apres_midi', 'publiee'),
      ('Visite virtuelle d''usine',           'Chaîne de production en réalité mixte',  'Salle 102', current_date,    'apres_midi', 'publiee'),
      ('Atelier automatisme',                 'Programmation d''automates',             'Salle 101', current_date + 1, 'matin',     'publiee'),
      ('Conférence qualité et normes',        'ISO 9001 en pratique',                    'Amphi B',  current_date + 1, 'matin',      'publiee'),
      ('Hackathon industrie 4.0',             'Brouillon : programme à confirmer',       'Salle 103', current_date + 1, 'apres_midi', 'brouillon')
    returning id, intitule
  )
  select array_agg(id order by array_position(array[
    'Conférence inaugurale','Atelier maintenance industrielle','Table ronde : transition énergétique',
    'Visite virtuelle d''usine','Atelier automatisme','Conférence qualité et normes','Hackathon industrie 4.0'
  ], intitule)) into v_a from nouvelles;

  -- Affectations : 2 distributeurs sur les grandes salles (Amphis)
  insert into public.affectations (distributeur_id, activite_id) values
    (v_d[1], v_a[1]), (v_d[2], v_a[1]),
    (v_d[3], v_a[2]),
    (v_d[1], v_a[3]), (v_d[2], v_a[3]),
    (v_d[4], v_a[4]),
    (v_d[3], v_a[5]),
    (v_d[1], v_a[6]), (v_d[4], v_a[6]);

  -- ---------------------------------------------------------------------------
  -- Inscriptions du jour (demain reste libre pour tester le choix d'activité)
  -- ---------------------------------------------------------------------------
  insert into public.inscriptions (participant_id, activite_id, jour, creneau)
  select p, case when n <= 12 then v_a[1] else v_a[2] end, current_date, 'matin'
    from unnest(v_etu) with ordinality t(p, n);
  insert into public.inscriptions (participant_id, activite_id, jour, creneau)
  select p, case when n <= 10 then v_a[3] else v_a[4] end, current_date, 'apres_midi'
    from unnest(v_etu) with ordinality t(p, n);
  insert into public.inscriptions (participant_id, activite_id, jour, creneau)
  select p, case when n <= 5 then v_a[1] else v_a[2] end, current_date, 'matin'
    from unnest(v_ext) with ordinality t(p, n);

  -- ---------------------------------------------------------------------------
  -- Annonces
  -- ---------------------------------------------------------------------------
  insert into public.annonces (titre, contenu, est_publiee) values
    ('Bienvenue à la SI 2026', 'Présentez votre QR code à la sortie de chaque activité pour recevoir votre repas.', true),
    ('Changement de salle (brouillon)', 'L''atelier automatisme aura lieu en salle 104.', false);
end;
$seed$;
