-- =========================================
-- MODULO: AUTH USERS PROFILE TRIGGER FIX
-- CONTEXTO: Correção Staging Owner / Broker / Agency / User
-- LOCAL:
-- supabase/migrations/20260511235900_fix_auth_users_profile_trigger_staging.sql
--
-- DESCRICAO:
-- Corrige trigger de criação de perfil após signup.
--
-- PROBLEMA:
-- Staging estava com handle_new_user antigo gravando em public.profiles.
-- O fluxo atual oficial do Hurby utiliza public.users_profile.
--
-- O QUE ALTERA:
-- - recria public.handle_new_user()
-- - recria trigger on_auth_user_created em auth.users
-- - popula users_profile com campos oficiais
-- - respeita enums user_type_enum e account_tier_enum
--
-- O QUE NÃO ALTERAR:
-- - não mexe em wallet
-- - não mexe em ledger
-- - não mexe em owner_add_axe
-- - não remove public.profiles legado
--
-- DEPENDÊNCIAS:
-- - public.users_profile
-- - public.user_type_enum
-- - public.account_tier_enum
-- - auth.users
-- =========================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_name text;
  v_user_type text;
  v_primary_entry_flow text;
begin
  v_name := coalesce(
    nullif(trim(new.raw_user_meta_data->>'name'), ''),
    nullif(trim(new.raw_user_meta_data->>'display_name'), ''),
    split_part(new.email, '@', 1),
    'Novo usuário'
  );

  v_primary_entry_flow := coalesce(
    nullif(trim(new.raw_user_meta_data->>'primary_entry_flow'), ''),
    case
      when nullif(trim(new.raw_user_meta_data->>'user_type'), '') = 'owner'
        then 'platform_owner'
      when nullif(trim(new.raw_user_meta_data->>'user_type'), '') = 'agency'
        then 'agency'
      when nullif(trim(new.raw_user_meta_data->>'user_type'), '') = 'broker'
        then 'broker'
      else 'user'
    end
  );

  v_user_type := coalesce(
    nullif(trim(new.raw_user_meta_data->>'user_type'), ''),
    case
      when v_primary_entry_flow = 'platform_owner'
        then 'owner'
      when v_primary_entry_flow = 'agency'
        then 'agency'
      when v_primary_entry_flow = 'broker'
        then 'broker'
      else 'user'
    end
  );

  if v_user_type not in ('owner', 'broker', 'agency', 'user') then
    v_user_type := 'user';
  end if;

  insert into public.users_profile (
    id,
    name,
    display_name,
    email,
    user_type,
    account_tier,
    primary_entry_flow,
    account_status,
    registration_status,
    status,
    created_at,
    updated_at
  )
  values (
    new.id,
    v_name,
    v_name,
    new.email,
    v_user_type::public.user_type_enum,
    'PAY_PER_USE'::public.account_tier_enum,
    v_primary_entry_flow,
    'active',
    'completed',
    'active',
    now(),
    now()
  )
  on conflict (id)
  do update set
    name = coalesce(public.users_profile.name, excluded.name),
    display_name = coalesce(public.users_profile.display_name, excluded.display_name),
    email = coalesce(public.users_profile.email, excluded.email),
    user_type = excluded.user_type,
    account_tier = coalesce(public.users_profile.account_tier, excluded.account_tier),
    primary_entry_flow = excluded.primary_entry_flow,
    account_status = 'active',
    registration_status = 'completed',
    status = 'active',
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

notify pgrst, 'reload schema';