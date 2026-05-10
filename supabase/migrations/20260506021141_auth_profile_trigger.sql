-- =========================================================
-- HURBY — AUTH PROFILE TRIGGER
-- Migration: 20260506021141_auth_profile_trigger.sql
-- Status: Criação automática de users_profile neutro
--
-- NOTA DE IDENTIFICAÇÃO:
-- Esta trigger NÃO cria corretor automaticamente.
-- Esta trigger NÃO define assinatura, plano ou account_tier.
-- Esta trigger apenas cria a conta neutra vinculada ao auth.users.
--
-- Papéis profissionais/clientes serão criados por fluxos próprios:
-- - entrada como corretor
-- - entrada como imobiliária
-- - entrada como usuário comum do marketplace
-- - convite institucional
-- =========================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users_profile (
    id,
    display_name,
    email,
    phone,
    avatar_url,
    account_status,
    registration_status,
    primary_entry_flow,
    created_at,
    updated_at
  )
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data->>'display_name', ''),
      nullif(new.raw_user_meta_data->>'name', ''),
      nullif(new.raw_user_meta_data->>'full_name', ''),
      new.email,
      'Usuário'
    ),
    new.email,
    nullif(new.raw_user_meta_data->>'phone', ''),
    nullif(new.raw_user_meta_data->>'avatar_url', ''),
    'active',
    'basic',
    coalesce(
      nullif(new.raw_user_meta_data->>'primary_entry_flow', ''),
      'unknown'
    ),
    now(),
    now()
  )
  on conflict (id) do update
  set
    email = coalesce(excluded.email, public.users_profile.email),
    display_name = coalesce(public.users_profile.display_name, excluded.display_name),
    phone = coalesce(public.users_profile.phone, excluded.phone),
    avatar_url = coalesce(public.users_profile.avatar_url, excluded.avatar_url),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

comment on function public.handle_new_user() is
'HURBY: cria users_profile neutro após criação em auth.users. Não cria broker, cliente, agência ou assinatura.';
