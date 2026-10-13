-- =============================================================================
-- GRESI — Migration 8/8 : Realtime
-- - inscriptions  : compteur « validés / inscrits » partagé par les téléphones
--                   d'une même salle (filtre activite_id=eq.<id>)
-- - journal_audit : fil d'activité temps réel de l'admin supérieur
-- Les événements respectent la RLS : chacun ne reçoit que ce qu'il peut lire.
-- =============================================================================

do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'inscriptions'
  ) then
    alter publication supabase_realtime add table public.inscriptions;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'journal_audit'
  ) then
    alter publication supabase_realtime add table public.journal_audit;
  end if;
end;
$$;
