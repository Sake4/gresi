-- RG11 : un matricule vérifié = un seul compte
begin;
select plan(12);

insert into public.etudiants_reference (matricule, nom, prenom, ecole, filiere, classe)
values ('T11N0001', 'KONÉ', 'Awa', 'ESI', 'Génie industriel', 'ING2');

-- Fonction utilisée par l'Edge Function verifier-etudiant (avant création du compte)
select is(
  public.verifier_etudiant_reference('t11n0001', 'Koné'),
  '{"valide": true, "ecole": "ESI", "filiere": "Génie industriel", "classe": "ING2"}'::jsonb,
  'verifier_etudiant_reference renvoie école, filière et classe'
);
select is(
  public.verifier_etudiant_reference('T11N0001', 'Yao') ->> 'motif', 'nom_discordant',
  'verifier_etudiant_reference signale un nom discordant'
);

select tests.creer_utilisateur('awa@etu.test') as u1 \gset
select tests.creer_utilisateur('copie@etu.test') as u2 \gset
select tests.creer_utilisateur('non-confirme@etu.test', false) as u3 \gset
select tests.creer_utilisateur('externe@test.ci') as u4 \gset

select tests.se_connecter(:'u1');
select throws_ok(
  $$select public.inscrire_participant('etudiant_inphb', 'Kone', 'Awa', true, p_matricule => 'T11N9999')$$,
  'P0001', 'matricule_inconnu', 'matricule absent du référentiel : refusé'
);
select throws_ok(
  $$select public.inscrire_participant('etudiant_inphb', 'Traoré', 'Awa', true, p_matricule => 'T11N0001')$$,
  'P0001', 'nom_discordant', 'nom différent de celui du référentiel : refusé'
);
select throws_ok(
  $$select public.inscrire_participant('etudiant_inphb', 'Kone', 'Awa', false, p_matricule => 'T11N0001')$$,
  'P0001', 'consentement_requis', 'sans consentement : refusé'
);
select lives_ok(
  $$select public.inscrire_participant('etudiant_inphb', 'kone', 'awa', true, p_matricule => ' t11n0001 ')$$,
  'nom sans accent ni majuscule et matricule en minuscules : accepté'
);
select results_eq(
  format($$select p.nom, p.prenom, e.matricule, e.classe from public.participants p
           join public.participants_etudiants e on e.participant_id = p.id where p.id = %L$$, :'u1'),
  $$values ('KONÉ'::text, 'Awa'::text, 'T11N0001'::text, 'ING2'::text)$$,
  'identité et classe reprises du référentiel officiel'
);
select throws_ok(
  $$select public.inscrire_participant('etudiant_inphb', 'Kone', 'Awa', true, p_matricule => 'T11N0001')$$,
  'P0001', 'deja_inscrit', 'un même compte ne s''inscrit pas deux fois'
);

select tests.se_connecter(:'u2');
select throws_ok(
  $$select public.inscrire_participant('etudiant_inphb', 'Kone', 'Awa', true, p_matricule => 'T11N0001')$$,
  'P0001', 'matricule_deja_utilise', 'un second compte avec le même matricule est refusé'
);

select tests.se_connecter(:'u3');
select throws_ok(
  $$select public.inscrire_participant('externe', 'Yao', 'Kofi', true, p_statut => 'visiteur')$$,
  'P0001', 'email_non_confirme', 'email non confirmé : refusé'
);

select tests.se_connecter(:'u4');
select lives_ok(
  $$select public.inscrire_participant('externe', ' Yao ', 'Kofi', true, p_statut => 'professionnel', p_structure => 'SIR')$$,
  'un participant externe s''inscrit avec son statut'
);

select tests.se_deconnecter();
select ok(
  (select qr_token is not null from public.participants where id = :'u4'),
  'le QR code est généré à la création du compte'
);

select * from finish();
rollback;
