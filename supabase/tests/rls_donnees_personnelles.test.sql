-- Cloisonnement des données personnelles (cahier des charges fonctionnel §4.3)
begin;
select plan(15);

select tests.creer_etudiant('TR1N0001', 'Coulibaly') as p1 \gset
select tests.creer_etudiant('TR1N0002', 'Diabate') as p2 \gset
select tests.creer_activite(current_date + 3, 'matin') as act_pub \gset
select tests.creer_activite(current_date + 3, 'matin') as act_autre \gset
select tests.creer_activite(current_date + 3, 'apres_midi', 'brouillon') as act_brouillon \gset
select tests.creer_personnel('d1@test.ci', 'distributeur') as d1 \gset
select tests.creer_personnel('adm@test.ci', 'admin') as adm \gset
select tests.creer_personnel('sup@test.ci', 'admin_superieur') as sup \gset
select tests.affecter(:'d1', :'act_pub');
select tests.inscrire(:'p1', :'act_pub');
select tests.inscrire(:'p2', :'act_autre');

-- Participant
select tests.se_connecter(:'p1');
select results_eq('select id from public.participants', format('values (%L::uuid)', :'p1'),
  'un participant ne voit que sa propre fiche');
select is((select count(*)::int from public.inscriptions), 1, 'un participant ne voit que ses inscriptions');
select is((select count(*)::int from public.scans), 0, 'un participant ne voit aucun scan');
select is((select count(*)::int from public.journal_audit), 0, 'un participant ne voit pas le journal');
select lives_ok($$update public.participants set telephone = '0700000000'$$, 'il peut modifier son téléphone');
select throws_ok($$update public.participants set nom = 'Autre'$$, '42501', null, 'mais pas son nom');
select throws_ok($$update public.participants set qr_token = gen_random_uuid()$$, '42501', null, 'ni son QR');

-- Distributeur
select tests.se_connecter(:'d1');
select is((select count(*)::int from public.participants), 0, 'un distributeur ne lit pas la table des participants');
select results_eq('select participant_id from public.inscriptions', format('values (%L::uuid)', :'p1'),
  'un distributeur ne voit que les inscriptions de ses activités');

-- Admin
select tests.se_connecter(:'adm');
select is((select count(*)::int from public.participants), 0, 'un admin ne lit pas directement la table des participants');
select is(
  (select identifiant from public.liste_participants_admin('coulibaly') where participant_id = :'p1'),
  'TR1N***01',
  'un admin passe par liste_participants_admin, matricule masqué'
);
select is((select count(*)::int from public.etudiants_reference), 0, 'un admin ne voit pas le référentiel INPHB');

-- Admin supérieur
select tests.se_connecter(:'sup');
select ok((select count(*) from public.participants) >= 2, 'l''admin supérieur voit les fiches complètes');

-- Visiteur anonyme
select tests.se_connecter_anonyme();
select is(
  (select count(*)::int from public.activites where id in (:'act_pub', :'act_brouillon')), 1,
  'un visiteur ne voit que les activités publiées'
);
select throws_ok('select count(*) from public.inscriptions', '42501', null,
  'un visiteur n''a aucun accès aux inscriptions');

select tests.se_deconnecter();
select * from finish();
rollback;
