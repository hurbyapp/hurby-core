-- =========================================================
-- HURBY — USERS PROFILE FOUNDATION
-- Migration: 20260504000100_profiles.sql
-- Status: Perfil neutro da conta autenticada
--
-- NOTA DE IDENTIFICAÇÃO:
-- users_profile NÃO representa corretor, cliente, agência,
-- proprietário, imobiliária ou plano comercial.
--
-- users_profile representa apenas a conta autenticada dentro do ecossistema.
--
-- Papéis/contextos devem nascer em camadas próprias:
-- - broker_profiles
-- - client_entities
-- - client_relationships
-- - organizations
-- - organization_memberships
-- - portfolios
--
-- Contrato técnico obrigatório:
-- users_profile.id = auth.users.id
-- =========================================================

create table if not exists public.users_profile (
  id uuid primary key references auth.users(id) on delete cascade,

  display_name text,
  email text,
  phone text,
  avatar_url text,

  -- Status técnico da conta dentro do ecossistema.
  account_status text not null default 'active'
    check (account_status in (
      'active',
      'inactive',
      'suspended',
      'banned'
    )),

  -- Status do cadastro dentro da jornada.
  -- Não é tipo de usuário.
  registration_status text not null default 'basic'
    check (registration_status in (
      'basic',
      'professional_pending',
      'completed',
      'blocked'
    )),

  -- Caminho inicial de entrada.
  -- Não é user_type e não deve ser usado como autorização definitiva.
  primary_entry_flow text not null default 'unknown'
    check (primary_entry_flow in (
      'unknown',
      'marketplace_common',
      'broker_professional',
      'agency_owner',
      'property_provider',
      'seeker',
      'invited_member',
      'platform_admin'
    )),

  terms_version_accepted text,
  terms_accepted_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.users_profile is
'HURBY: perfil neutro da conta autenticada. Não representa corretor, cliente, agência ou plano comercial.';

comment on column public.users_profile.id is
'Mesmo UUID de auth.users.id. Âncora técnica para identidade autenticada.';

comment on column public.users_profile.primary_entry_flow is
'Caminho inicial de entrada da conta. Não é tipo fixo de usuário.';

comment on column public.users_profile.registration_status is
'Status da jornada cadastral. Não define permissão profissional isoladamente.';

create index if not exists idx_users_profile_email
  on public.users_profile(email);

create index if not exists idx_users_profile_account_status
  on public.users_profile(account_status);

create index if not exists idx_users_profile_registration_status
  on public.users_profile(registration_status);

create index if not exists idx_users_profile_primary_entry_flow
  on public.users_profile(primary_entry_flow);

drop trigger if exists trg_users_profile_updated_at on public.users_profile;

create trigger trg_users_profile_updated_at
before update on public.users_profile
for each row
execute function public.set_updated_at();

alter table public.users_profile enable row level security;

drop policy if exists "Users can view own profile" on public.users_profile;
drop policy if exists "Users can update own profile" on public.users_profile;
drop policy if exists "Users can insert own profile" on public.users_profile;

create policy "Users can view own profile"
on public.users_profile
for select
to authenticated
using (id = auth.uid());

create policy "Users can update own profile"
on public.users_profile
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- Mantida para cenários controlados de criação manual em DEV.
-- O fluxo normal de criação é via trigger auth.handle_new_user.
create policy "Users can insert own profile"
on public.users_profile
for insert
to authenticated
with check (id = auth.uid());
