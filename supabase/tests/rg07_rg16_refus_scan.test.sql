-- Motifs de refus d'un scan : RG7 (non affecté), RG6 (non inscrit),
-- RG16 (hors créneau), QR invalide, compte désactivé, appelant non distributeur
begin;
select plan(8);

select tests.ouvrir_scans_toute_la_journee();
select tests.creer_etudiant('T7IN0001', 'Bamba') as etu \gset
select tests.creer_activite(current_date, 'matin') as act_a \gset
select tests.creer_activite(current_date, 'matin') as act_b \gset
select tests.creer_activite(current_date + 5, 'matin') as act_future \gset
select tests.creer_personnel('d1@test.ci', 'distributeur') as d1 \gset
select tests.creer_personnel('d3@test.ci', 'distributeur') as d3 \gset
select tests.affecter(:'d1', :'act_a');
select tests.affecter(:'d1', :'act_b');
select tests.affecter(:'d1', :'act_future');
select tests.inscrire(:'etu', :'act_b');
select tests.qr(:'etu') as qr \gset

select tests.se_connecter(:'d3');
select is(
  public.valider_scan(:'qr', :'act_b', gen_random_uuid()) ->> 'resultat', 'non_affecte',
  'un distributeur non affecté ne peut pas valider (RG7)'
);
select is(
  public.valider_scan(:'qr', :'act_b', gen_random_uuid()) -> 'participant', 'null'::jsonb,
  'aucune donnée personnelle n''est renvoyée au distributeur non affecté'
);

select tests.se_connecter(:'d1');
select is(
  public.valider_scan(:'qr', :'act_a', gen_random_uuid()) ->> 'resultat', 'non_inscrit',
  'inscrit à l''activité B, scanné à la sortie de A : non inscrit (RG6)'
);
select is(
  public.valider_scan(gen_random_uuid(), :'act_a', gen_random_uuid()) ->> 'resultat', 'qr_invalide',
  'jeton inconnu : QR invalide'
);
select is(
  public.valider_scan(:'qr', :'act_future', gen_random_uuid()) ->> 'resultat', 'hors_creneau',
  'activité d''un autre jour : hors créneau (RG16)'
);

select tests.se_deconnecter();
update public.participants set est_actif = false where id = :'etu';
select tests.se_connecter(:'d1');
select is(
  public.valider_scan(:'qr', :'act_b', gen_random_uuid()) ->> 'resultat', 'qr_invalide',
  'compte désactivé : QR invalide'
);

select tests.se_connecter(:'etu');
select throws_ok(
  format('select public.valider_scan(%L, %L, gen_random_uuid())', :'qr', :'act_b'),
  'P0001', 'acces_refuse',
  'un participant ne peut pas valider un scan'
);

select tests.se_deconnecter();
select is(
  (select count(*)::int from public.inscriptions where participant_id = :'etu' and valide_le is not null),
  0, 'aucun créneau n''a été validé par ces tentatives'
);

select * from finish();
rollback;
