-- Structure du schéma, RLS et droits d'exécution
begin;
select plan(20);

select has_table('public', t, format('la table %s existe', t))
  from unnest(array[
    'parametres_evenement','personnel','participants','participants_etudiants',
    'participants_externes','etudiants_reference','activites','affectations',
    'inscriptions','scans','journal_audit','annonces'
  ]) t;

select is(
  (select count(*)::int from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity),
  0,
  'RLS activée sur toutes les tables du schéma public'
);

select ok(
  not has_function_privilege('authenticated',
    'public._traiter_validation(uuid, uuid, uuid, public.methode_validation)', 'execute'),
  '_traiter_validation n''est pas appelable depuis l''API'
);
select ok(
  not has_function_privilege('authenticated',
    'public._creer_participant(uuid, public.type_participant, text, text, boolean, text, text, public.statut_externe, text, text)',
    'execute'),
  '_creer_participant n''est pas appelable depuis l''API'
);
select ok(
  not has_function_privilege('authenticated', 'public.journaliser(text, text, text, jsonb)', 'execute'),
  'journaliser n''est pas appelable depuis l''API'
);
select ok(
  not has_function_privilege('authenticated', 'public.journaliser_pour(uuid, text, text, text, jsonb)', 'execute'),
  'journaliser_pour est réservée au service_role'
);
select ok(
  not has_function_privilege('anon', 'public.valider_scan(uuid, uuid, uuid)', 'execute'),
  'un visiteur anonyme ne peut pas appeler valider_scan'
);
select ok(
  not has_function_privilege('authenticated', 'public.verifier_etudiant_reference(text, text)', 'execute')
  and has_function_privilege('service_role', 'public.verifier_etudiant_reference(text, text)', 'execute'),
  'verifier_etudiant_reference est réservée au service_role'
);
select ok(
  not has_table_privilege('authenticated', 'public.inscriptions', 'insert'),
  'aucune insertion directe dans inscriptions'
);

select * from finish();
rollback;
