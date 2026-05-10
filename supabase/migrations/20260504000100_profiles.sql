-- =========================================
-- MÓDULO: CORE_IDENTITY
-- CONTEXTO: USERS PROFILE FOUNDATION
-- LOCAL: supabase/migrations/20260504000100_profiles.sql
--
-- DESCRIÇÃO:
-- Cria a identidade base do usuário autenticado.
--
-- O QUE ALTERA:
-- - cria public.users_profile
-- - vincula auth.users
-- - mantém apenas dados de identidade base
--
-- O QUE NÃO ALTERAR:
-- - não inserir vínculo com agency
-- - não inserir carteira
-- - não inserir permissões contextuais
-- - não inserir membership
--
-- DEPENDÊNCIAS:
-- - auth.users
-- - public.user_type_enum
-- - public.account_tier_enum
-- =========================================

create table public.users_profile (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  user_type public.user_type_enum not null,
  account_tier public.account_tier_enum not null,
  terms_version_accepted text,
  terms_accepted_at timestamptz,
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.users_profile enable row level security;

create policy users_profile_select_own
on public.users_profile
for select
to authenticated
using (auth.uid() = id);

create policy users_profile_update_own
on public.users_profile
for update
to authenticated
using (auth.uid() = id);