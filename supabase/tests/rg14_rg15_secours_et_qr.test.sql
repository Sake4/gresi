-- RG14 : validation manuelle tracée — RG15 : régénération du QR
begin;
select plan(10);

select tests.ouvrir_scans_toute_la_journee();
select tests.creer_etudiant('T14N0001', 'Ouattara') as etu \gset
select tests.creer_externe('ext@test.ci') as ext \gset
select tests.creer_activite(current_date, 'matin') as act \gset
select tests.creer_personnel('d1@test.ci', 'distributeur') as d1 \gset
select tests.creer_personnel('sup@test.ci', 'admin_superieur') as sup \gset
select tests.creer_personnel('adm@test.ci', 'admin') as adm \gset
select tests.affecter(:'d1', :'act');
select tests.inscrire(:'etu', :'act');
select tests.qr(:'etu') as ancien_qr \gset

-- Recherche puis validation manuelle
select tests.se_connecter(:'d1');
select results_eq(
  format($$select participant_id from public.rechercher_inscrits(%L, 'ouatt')$$, :'act'),
  format($$values (%L::uuid)$$, :'etu'),
  'le distributeur retrouve l''inscrit par son nom'
);
select is(
  (select count(*)::int from public.rechercher_inscrits(:'act', 'T14N0001')), 1,
  'ou par son matricule complet'
);
select is(
  public.valider_manuellement(:'ext', :'act', gen_random_uuid()) ->> 'resultat', 'non_inscrit',
  'validation manuelle refusée pour un non-inscrit (RG14)'
);
select is(
  public.valider_manuellement(:'etu', :'act', gen_random_uuid()) ->> 'methode', 'manuelle',
  'validation manuelle enregistrée comme telle'
);

select tests.se_deconnecter();
select ok(
  exists (select 1 from public.journal_audit where action = 'inscription.validee_manuellement'),
  'la validation manuelle apparaît dans le journal d''audit'
);

-- Régénération du QR
select tests.se_connecter(:'adm');
select throws_ok(
  format('select public.regenerer_qr(%L)', :'etu'),
  'P0001', 'acces_refuse', 'un admin simple ne peut pas régénérer un QR'
);

select tests.se_connecter(:'sup');
select public.regenerer_qr(:'etu') as nouveau_qr \gset
select isnt(:'nouveau_qr'::uuid, :'ancien_qr'::uuid, 'l''admin supérieur obtient un nouveau jeton');

select tests.se_deconnecter();
select tests.creer_activite(current_date, 'apres_midi') as act2 \gset
select tests.affecter(:'d1', :'act2');
select tests.inscrire(:'etu', :'act2');
select tests.se_connecter(:'d1');
select is(
  public.valider_scan(:'ancien_qr', :'act2', gen_random_uuid()) ->> 'resultat', 'qr_invalide',
  'l''ancien QR est immédiatement invalide (RG15)'
);
select is(
  public.valider_scan(:'nouveau_qr', :'act2', gen_random_uuid()) ->> 'resultat', 'valide',
  'le nouveau QR fonctionne'
);

select tests.se_deconnecter();
select ok(
  exists (select 1 from public.journal_audit where action = 'qr.regenere' and auteur_id = :'sup'),
  'la régénération est tracée avec son auteur'
);

select * from finish();
rollback;
