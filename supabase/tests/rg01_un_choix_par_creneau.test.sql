-- RG1 : une seule activité par créneau — RG4 : changement avant le début
begin;
select plan(10);

select tests.creer_etudiant('T1IN0001', 'Kone') as etu \gset
select tests.creer_activite(current_date + 2, 'matin') as a_matin_1 \gset
select tests.creer_activite(current_date + 2, 'matin') as a_matin_2 \gset
select tests.creer_activite(current_date + 2, 'apres_midi') as a_aprem \gset
select tests.creer_activite(current_date - 1, 'matin') as a_passee \gset
select tests.creer_activite(current_date + 2, 'matin', 'brouillon') as a_brouillon \gset
select tests.qr(:'etu') as qr_avant \gset

select tests.se_connecter(:'etu');

select lives_ok(
  format('select public.choisir_activite(%L)', :'a_matin_1'),
  'le participant choisit une activité du matin'
);
select lives_ok(
  format('select public.choisir_activite(%L)', :'a_matin_2'),
  'il peut changer d''activité avant le début de la session (RG4)'
);
select results_eq(
  format($$select activite_id from public.inscriptions where participant_id = %L and creneau = 'matin'$$, :'etu'),
  format($$values (%L::uuid)$$, :'a_matin_2'),
  'un seul choix pour le créneau du matin, remplacé par le nouveau (RG1)'
);
select lives_ok(
  format('select public.choisir_activite(%L)', :'a_aprem'),
  'il choisit aussi une activité l''après-midi'
);
select is(
  (select count(*)::int from public.inscriptions where participant_id = :'etu'),
  2,
  'deux créneaux inscrits au total'
);
select throws_ok(
  format('select public.choisir_activite(%L)', :'a_passee'),
  'P0001', 'creneau_commence',
  'impossible de choisir une activité dont la session a commencé'
);
select throws_ok(
  format('select public.choisir_activite(%L)', :'a_brouillon'),
  'P0001', 'activite_indisponible',
  'impossible de choisir une activité non publiée'
);
select throws_ok(
  format($$insert into public.inscriptions (participant_id, activite_id, jour, creneau)
           values (%L, %L, current_date + 2, 'matin')$$, :'etu', :'a_matin_1'),
  '42501', null,
  'aucune insertion directe dans inscriptions'
);
select lives_ok(
  format($$select public.retirer_choix(current_date + 2, 'apres_midi')$$),
  'le participant peut retirer un choix avant le début'
);

select tests.se_deconnecter();
select is(tests.qr(:'etu'), :'qr_avant'::uuid, 'le QR ne change pas quand on change d''activité (RG4)');

select * from finish();
rollback;
