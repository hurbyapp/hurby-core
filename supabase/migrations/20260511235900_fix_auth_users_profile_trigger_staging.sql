-- =========================================
-- MODULO: AUTH USERS PROFILE TRIGGER FIX
-- CONTEXTO: Correção do trigger auth.users para users_profile neutro
-- LOCAL:
-- supabase/migrations/20260511235900_fix_auth_users_profile_trigger_staging.sql
--
-- DESCRICAO:
-- Corrige o trigger de criação de perfil após signup.
--
-- PROBLEMA:
-- Staging possuía handle_new_user antigo gravando em public.profiles.
-- A primeira correção tentou gravar campos antigos em users_profile.
--
-- DECISAO ARQUITETURAL:
-- users_profile é conta neutra autenticada.
-- Não concentra papel profissional definitivo.
--
-- O QUE ALTERA:
-- - recria public.handle_new_user()
-- - recria trigger on_auth_user_created em auth.users
-- - grava somente campos neutros existentes em users_profile
-- - preserva primary_entry_flow como indicação de fluxo inicial
--
-- O QUE NÃO ALTERAR:
-- - não adiciona name
-- - não adiciona user_type
-- - não adiciona account_tier
-- - não adiciona status
-- - não cria broker_profile automaticamente
-- - não cria organization automaticamente
-- - não cria client_entity automaticamente
-- - não mexe em wallet
-- - não mexe em ledger
-- - não mexe em owner_add_axe
--
-- DEPENDÊNCIAS:
-- - public.users_profile
-- - auth.users
-- =========================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_display_name text;
  v_primary_entry_flow text;
begin
  v_display_name := coalesce(
    nullif(trim(new.raw_user_meta_data->>'display_name'), ''),
    nullif(trim(new.raw_user_meta_data->>'name'), ''),
    split_part(new.email, '@', 1),
    'Novo usuário'
  );

  v_primary_entry_flow := coalesce(
    nullif(trim(new.raw_user_meta_data->>'primary_entry_flow'), ''),
    case
      when nullif(trim(new.raw_user_meta_data->>'user_type'), '') = 'owner'
        then 'platform_owner'
      when nullif(trim(new.raw_user_meta_data->>'user_type'), '') = 'agency'
        then 'agency_owner'
      when nullif(trim(new.raw_user_meta_data->>'user_type'), '') = 'broker'
        then 'broker_professional'
      else 'marketplace_common'
    end
  );

  insert into public.users_profile (
    id,
    display_name,
    email,
    primary_entry_flow,
    account_status,
    registration_status,
    created_at,
    updated_at
  )
  values (
    new.id,
    v_display_name,
    new.email,
    v_primary_entry_flow,
    'active',
    'completed',
    now(),
    now()
  )
  on conflict (id)
  do update set
    display_name = coalesce(public.users_profile.display_name, excluded.display_name),
    email = coalesce(public.users_profile.email, excluded.email),
    primary_entry_flow = excluded.primary_entry_flow,
    account_status = 'active',
    registration_status = 'completed',
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