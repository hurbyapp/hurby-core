-- =========================================
-- HURBY
-- CORE: ORGANIZATIONS + MEMBERSHIPS
-- STATUS: FOUNDATION
--
-- OBJETIVO:
-- Separar:
-- - identidade
-- - organização
-- - vínculo operacional
-- - papel contextual
--
-- IMPORTANTE:
-- Agency NÃO é identidade principal.
-- Agency é organização/contexto operacional.
--
-- =========================================

-- =========================================
-- ORGANIZATION TYPE
-- =========================================

create type public.organization_type_enum as enum (
  'agency'
);

-- =========================================
-- MEMBERSHIP ROLE
-- =========================================

create type public.membership_role_enum as enum (
  'owner',
  'manager',
  'broker',
  'assistant'
);

-- =========================================
-- MEMBERSHIP STATUS
-- =========================================

create type public.membership_status_enum as enum (
  'pending',
  'active',
  'suspended',
  'revoked'
);

-- =========================================
-- ORGANIZATIONS
-- =========================================

create table public.organizations (
  id uuid primary key default gen_random_uuid(),

  organization_type public.organization_type_enum not null,

  legal_name text not null,
  trade_name text,

  document_number text,

  created_by_profile_id uuid
    references public.users_profile(id),

  is_active boolean default true,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =========================================
-- ORGANIZATION MEMBERSHIPS
-- =========================================

create table public.organization_memberships (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null
    references public.organizations(id)
    on delete cascade,

  profile_id uuid not null
    references public.users_profile(id)
    on delete cascade,

  membership_role public.membership_role_enum not null,

  membership_status public.membership_status_enum
    not null default 'pending',

  invited_by_profile_id uuid
    references public.users_profile(id),

  started_at timestamptz default now(),
  ended_at timestamptz,

  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  unique (
    organization_id,
    profile_id
  )
);

-- =========================================
-- INDEXES
-- =========================================

create index organizations_created_by_idx
on public.organizations(created_by_profile_id);

create index organization_memberships_org_idx
on public.organization_memberships(organization_id);

create index organization_memberships_profile_idx
on public.organization_memberships(profile_id);

create index organization_memberships_status_idx
on public.organization_memberships(membership_status);

-- =========================================
-- RLS
-- =========================================

alter table public.organizations
enable row level security;

alter table public.organization_memberships
enable row level security;

-- =========================================
-- ORGANIZATIONS SELECT
-- =========================================

create policy organizations_select
on public.organizations
for select
to authenticated
using (
  exists (
    select 1
    from public.organization_memberships om
    where om.organization_id = organizations.id
    and om.profile_id = auth.uid()
    and om.membership_status = 'active'
  )
);

-- =========================================
-- MEMBERSHIPS SELECT
-- =========================================

create policy organization_memberships_select
on public.organization_memberships
for select
to authenticated
using (
  profile_id = auth.uid()
);

-- =========================================
-- OBSERVAÇÃO ARQUITETURAL
-- =========================================
--
-- users_profile:
-- identidade base
--
-- organizations:
-- entidade institucional
--
-- organization_memberships:
-- vínculo/contexto operacional
--
-- FUTURO:
-- - permissions
-- - scopes
-- - visibility
-- - sharing
-- - governance
-- - portfolio ownership
--
-- =========================================