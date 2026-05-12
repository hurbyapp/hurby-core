-- =========================================
-- AUTO CREATE PROFILE ON AUTH USER
-- LOCAL:
-- supabase/migrations/20260506021141_auth_profile_trigger.sql
--
-- DESCRICAO:
-- Cria users_profile neutro quando auth.users recebe novo usuario.
--
-- O QUE ALTERA:
-- - remove legado user_type/account_tier/status
-- - usa users_profile atual
-- - cria profile neutro
--
-- O QUE NAO ALTERAR:
-- - nao cria broker_profile
-- - nao cria agency
-- - nao cria client_entity
-- - nao cria owner
--
-- DEPENDENCIAS:
-- - auth.users
-- - public.users_profile
-- =========================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users_profile (
    id,
    email,
    display_name,
    phone,
    avatar_url,
    primary_entry_flow,
    account_status
  )
  values (
    new.id,
    new.email,
    coalesce(
      nullif(new.raw_user_meta_data->>'display_name', ''),
      nullif(new.raw_user_meta_data->>'name', ''),
      new.email,
      'Usuario'
    ),
    nullif(new.raw_user_meta_data->>'phone', ''),
    nullif(new.raw_user_meta_data->>'avatar_url', ''),
    coalesce(
      nullif(new.raw_user_meta_data->>'primary_entry_flow', ''),
      'seeker'
    ),
    'active'
  )
  on conflict (id) do update
  set
    email = coalesce(excluded.email, public.users_profile.email),
    display_name = coalesce(public.users_profile.display_name, excluded.display_name),
    phone = coalesce(public.users_profile.phone, excluded.phone),
    avatar_url = coalesce(public.users_profile.avatar_url, excluded.avatar_url),
    primary_entry_flow = coalesce(public.users_profile.primary_entry_flow, excluded.primary_entry_flow),
    account_status = coalesce(public.users_profile.account_status, excluded.account_status),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

comment on function public.handle_new_user() is
'HURBY: cria users_profile neutro apos criacao em auth.users. Nao cria broker, cliente, agencia, owner ou assinatura.';
