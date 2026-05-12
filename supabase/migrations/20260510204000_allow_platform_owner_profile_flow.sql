-- =========================================
-- MODULO: OWNER_VALIDATION_PROFILE_FLOW
-- CONTEXTO: Owner temporario de validacao
--
-- DESCRICAO:
-- Permite primary_entry_flow = platform_owner no users_profile.
--
-- IMPORTANTE:
-- Owner temporario nao representa Core Owner/Admin definitivo.
-- =========================================

do $$
declare
  r record;
begin
  if to_regclass('public.users_profile') is null then
    raise notice 'public.users_profile ainda nao existe neste ponto da migration.';
    return;
  end if;

  for r in
    select conname
    from pg_constraint
    where conrelid = 'public.users_profile'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%primary_entry_flow%'
  loop
    execute format(
      'alter table public.users_profile drop constraint if exists %I',
      r.conname
    );
  end loop;

  alter table public.users_profile
    add constraint users_profile_primary_entry_flow_check
    check (
      primary_entry_flow is null
      or primary_entry_flow in (
        'seeker',
        'property_provider',
        'marketplace_common',
        'broker_professional',
        'agency_owner',
        'platform_owner'
      )
    );
end $$;
