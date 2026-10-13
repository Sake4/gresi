-- =============================================================================
-- GRESI — Migration 7/8 : journal d'audit automatique
-- Cahier des charges fonctionnel V2.0 — §3.8 (M7)
--
-- Actions nommées « entite.verbe_au_participe » :
--   activite.cree / activite.publiee / activite.annulee / activite.modifie / activite.supprime
--   affectation.cree / affectation.supprime
--   personnel.cree / personnel.active / personnel.desactive / personnel.modifie
--   annonce.cree / annonce.publiee / annonce.modifie / annonce.supprime
--   parametres.modifie
-- Écrites directement par les RPC : qr.regenere, participant.active,
--   participant.desactive, inscription.validee_manuellement
-- auteur_id est null pour les actions système (seed, Edge Functions).
-- =============================================================================

create or replace function public.fn_audit()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
declare
  v_entite   text  := tg_argv[0];
  v_ancien   jsonb := case when tg_op <> 'INSERT' then to_jsonb(old) end;
  v_nouveau  jsonb := case when tg_op <> 'DELETE' then to_jsonb(new) end;
  v_ligne    jsonb := coalesce(v_nouveau, v_ancien);
  v_details  jsonb;
  v_action   text;
begin
  if tg_op = 'INSERT' then
    v_action  := v_entite || '.cree';
    v_details := v_nouveau;
  elsif tg_op = 'DELETE' then
    v_action  := v_entite || '.supprime';
    v_details := v_ancien;
  else
    -- Seulement les colonnes modifiées : { colonne: { avant, apres } }
    select coalesce(
             jsonb_object_agg(n.key, jsonb_build_object('avant', v_ancien -> n.key, 'apres', n.value)),
             '{}'::jsonb)
      into v_details
      from jsonb_each(v_nouveau) n
     where n.key <> 'modifie_le'
       and n.value is distinct from v_ancien -> n.key;

    if v_details = '{}'::jsonb then
      return null;
    end if;

    v_action := v_entite || case
      when v_details ? 'statut'       then '.' || (v_nouveau ->> 'statut')
      when v_details ? 'est_actif'    then case when (v_nouveau ->> 'est_actif')::boolean
                                                then '.active' else '.desactive' end
      when v_details ? 'est_publiee'
           and (v_nouveau ->> 'est_publiee')::boolean then '.publiee'
      else '.modifie'
    end;
  end if;

  insert into public.journal_audit (auteur_id, action, cible_table, cible_id, details)
  values (
    auth.uid(),
    v_action,
    tg_table_name,
    coalesce(v_ligne ->> 'id', concat_ws(':', v_ligne ->> 'distributeur_id', v_ligne ->> 'activite_id')),
    v_details
  );
  return null;
end;
$$;

create trigger trg_activites_audit
  after insert or update or delete on public.activites
  for each row execute function public.fn_audit('activite');

create trigger trg_affectations_audit
  after insert or update or delete on public.affectations
  for each row execute function public.fn_audit('affectation');

create trigger trg_personnel_audit
  after insert or update or delete on public.personnel
  for each row execute function public.fn_audit('personnel');

create trigger trg_annonces_audit
  after insert or update or delete on public.annonces
  for each row execute function public.fn_audit('annonce');

create trigger trg_parametres_evenement_audit
  after update on public.parametres_evenement
  for each row execute function public.fn_audit('parametres');
