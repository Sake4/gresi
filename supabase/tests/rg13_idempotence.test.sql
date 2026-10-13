-- RG13 : un même scan renvoyé (perte réseau) n'est compté qu'une fois
begin;
select plan(5);

select tests.ouvrir_scans_toute_la_journee();
select tests.creer_etudiant('T13N0001', 'Yao') as etu \gset
select tests.creer_activite(current_date, 'apres_midi') as act \gset
select tests.creer_personnel('d1@test.ci', 'distributeur') as d1 \gset
select tests.creer_personnel('d2@test.ci', 'distributeur') as d2 \gset
select tests.affecter(:'d1', :'act');
select tests.affecter(:'d2', :'act');
select tests.inscrire(:'etu', :'act');
select tests.qr(:'etu') as qr \gset
select gen_random_uuid() as scan_id \gset

select tests.se_connecter(:'d1');
select is(public.valider_scan(:'qr', :'act', :'scan_id') ->> 'resultat', 'valide', 'premier envoi : valide');

select public.valider_scan(:'qr', :'act', :'scan_id') as rejeu \gset
select is(:'rejeu'::jsonb ->> 'resultat', 'valide', 'renvoi du même scan : même résultat « valide »');
select is(:'rejeu'::jsonb ->> 'rejeu', 'true', 'la réponse signale un rejeu');

select tests.se_connecter(:'d2');
select throws_ok(
  format('select public.valider_scan(%L, %L, %L)', :'qr', :'act', :'scan_id'),
  'P0001', 'scan_id_conflit',
  'un autre distributeur ne peut pas réutiliser l''identifiant de scan'
);

select tests.se_deconnecter();
select is((select count(*)::int from public.scans where activite_id = :'act'), 1, 'un seul scan journalisé');

select * from finish();
rollback;
