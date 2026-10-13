-- RG5 : un créneau validé est définitivement utilisé
-- RG12 : plusieurs distributeurs sur une activité, une seule validation réussit
begin;
select plan(9);

select tests.ouvrir_scans_toute_la_journee();
select tests.creer_etudiant('T5IN0001', 'Traore') as etu \gset
select tests.creer_activite(current_date, 'matin') as act \gset
select tests.creer_personnel('d1@test.ci', 'distributeur') as d1 \gset
select tests.creer_personnel('d2@test.ci', 'distributeur') as d2 \gset
select tests.affecter(:'d1', :'act');
select tests.affecter(:'d2', :'act');
select tests.inscrire(:'etu', :'act');
select tests.qr(:'etu') as qr \gset

-- Distributeur 1 scanne
select tests.se_connecter(:'d1');
select public.valider_scan(:'qr', :'act', gen_random_uuid()) as r1 \gset
select is(:'r1'::jsonb ->> 'resultat', 'valide', 'premier scan : valide');
select is(:'r1'::jsonb -> 'participant' ->> 'nom', 'TRAORE', 'le nom du participant est renvoyé');
select is(:'r1'::jsonb -> 'participant' ->> 'identifiant', 'T5IN***01', 'le matricule est masqué');
select is(:'r1'::jsonb -> 'compteur', '{"valides": 1, "inscrits": 1}'::jsonb, 'le compteur de la salle est renvoyé');

-- Distributeur 2 scanne le même QR juste après
select tests.se_connecter(:'d2');
select public.valider_scan(:'qr', :'act', gen_random_uuid()) as r2 \gset
select is(:'r2'::jsonb ->> 'resultat', 'deja_utilise', 'second scan par un autre distributeur : déjà utilisé');
select is(:'r2'::jsonb ->> 'valide_par', 'd1@test.ci Test', 'la réponse indique qui a validé');
select ok((:'r2'::jsonb ->> 'valide_le') is not null, 'la réponse indique l''heure de validation');

select tests.se_deconnecter();
select is(
  (select count(*)::int from public.inscriptions where participant_id = :'etu' and valide_le is not null),
  1, 'une seule validation enregistrée'
);
select is(
  (select array_agg(resultat::text order by id) from public.scans where activite_id = :'act'),
  array['valide', 'deja_utilise'], 'les deux tentatives sont journalisées'
);

select * from finish();
rollback;
