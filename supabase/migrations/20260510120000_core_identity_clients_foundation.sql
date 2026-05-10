-- =========================================================
-- HURBY — CORE IDENTITY / CLIENTS FOUNDATION
-- Migration: 20260510120000_core_identity_clients_foundation.sql
-- Status: Foundation canônica
--
-- NOTA DE IDENTIFICAÇÃO:
-- Esta migration cria as camadas iniciais de:
-- - broker_profiles
-- - broker_verifications
-- - client_entities
-- - client_contact_methods
-- - client_relationships
-- - client_relationship_roles
--
-- PRINCÍPIO:
-- users_profile é conta neutra autenticada.
-- broker_profile é camada profissional.
-- client_entity é entidade relacional de cliente/pessoa.
-- client_relationship é vínculo contextual.
--
-- NÃO IMPLEMENTA AGORA:
-- - score
-- - denúncias
-- - avaliações
-- - banimento
-- - marketplace completo
-- - contratos
-- - funil
-- - gestão de locação
--
-- PREPARA PARA O FUTURO:
-- - Trust/Safety
-- - Score contextual
-- - Reviews
-- - denúncias
-- - visibilidade por selos
-- - governança
-- =========================================================

-- =========================================================
-- ENUMS — BROKER
-- =========================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'broker_professional_status_enum') then
    create type public.broker_professional_status_enum as enum (
      'active',
      'inactive',
      'restricted',
      'suspended'
    );
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'broker_verification_status_enum') then
    create type public.broker_verification_status_enum as enum (
      'not_submitted',
      'pending',
      'verified',
      'rejected',
      'manual_review'
    );
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'broker_public_visibility_status_enum') then
    create type public.broker_public_visibility_status_enum as enum (
      'private',
      'limited',
      'public',
      'restricted'
    );
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'broker_verification_type_enum') then
    create type public.broker_verification_type_enum as enum (
      'creci',
      'identity',
      'document',
      'manual_review'
    );
  end if;
end $$;

-- =========================================================
-- ENUMS — CLIENTS
-- =========================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'client_entity_type_enum') then
    create type public.client_entity_type_enum as enum (
      'individual',
      'company',
      'unknown'
    );
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'client_entity_status_enum') then
    create type public.client_entity_status_enum as enum (
      'active',
      'inactive',
      'restricted',
      'archived'
    );
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'client_verification_level_enum') then
    create type public.client_verification_level_enum as enum (
      'unverified',
      'contact_verified',
      'identity_verified',
      'trusted'
    );
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'client_contact_type_enum') then
    create type public.client_contact_type_enum as enum (
      'email',
      'phone',
      'whatsapp'
    );
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'client_contact_verification_status_enum') then
    create type public.client_contact_verification_status_enum as enum (
      'unverified',
      'pending',
      'verified',
      'invalid'
    );
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'client_consent_status_enum') then
    create type public.client_consent_status_enum as enum (
      'unknown',
      'granted',
      'revoked',
      'not_required'
    );
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'client_relationship_context_enum') then
    create type public.client_relationship_context_enum as enum (
      'marketplace',
      'broker_portfolio',
      'agency_portfolio',
      'property_provider',
      'property_interest',
      'future_lead',
      'contract_party',
      'imported_contact'
    );
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'client_relationship_status_enum') then
    create type public.client_relationship_status_enum as enum (
      'active',
      'inactive',
      'restricted',
      'archived',
      'orphaned'
    );
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'client_role_type_enum') then
    create type public.client_role_type_enum as enum (
      'marketplace_user',
      'seeker',
      'property_provider',
      'buyer',
      'tenant',
      'landlord',
      'contact'
    );
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'client_role_status_enum') then
    create type public.client_role_status_enum as enum (
      'active',
      'inactive',
      'archived'
    );
  end if;
end $$;

-- =========================================================
-- BROKER PROFILES
-- =========================================================

create table if not exists public.broker_profiles (
  id uuid primary key default gen_random_uuid(),

  profile_id uuid not null unique
    references public.users_profile(id) on delete cascade,

  professional_name text,
  document_cpf text,

  creci_number text,
  creci_uf char(2),

  main_city text,
  main_state char(2),
  service_region text,

  bio text,

  professional_status public.broker_professional_status_enum not null default 'active',
  verification_status public.broker_verification_status_enum not null default 'not_submitted',
  public_visibility_status public.broker_public_visibility_status_enum not null default 'private',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint broker_profiles_creci_uf_len
    check (creci_uf is null or length(creci_uf) = 2),

  constraint broker_profiles_main_state_len
    check (main_state is null or length(main_state) = 2)
);

comment on table public.broker_profiles is
'HURBY: camada profissional do corretor. Não substitui users_profile.';

comment on column public.broker_profiles.profile_id is
'Conta neutra autenticada vinculada ao perfil profissional.';

comment on column public.broker_profiles.verification_status is
'Status de verificação profissional, incluindo CRECI e análise manual futura.';

comment on column public.broker_profiles.public_visibility_status is
'Controla se o perfil profissional pode aparecer publicamente ou com restrições.';

create index if not exists idx_broker_profiles_profile_id
  on public.broker_profiles(profile_id);

create index if not exists idx_broker_profiles_creci
  on public.broker_profiles(creci_number, creci_uf);

create index if not exists idx_broker_profiles_verification_status
  on public.broker_profiles(verification_status);

create index if not exists idx_broker_profiles_professional_status
  on public.broker_profiles(professional_status);

drop trigger if exists trg_broker_profiles_updated_at on public.broker_profiles;

create trigger trg_broker_profiles_updated_at
before update on public.broker_profiles
for each row
execute function public.set_updated_at();

alter table public.broker_profiles enable row level security;

drop policy if exists "Broker can view own broker profile" on public.broker_profiles;
drop policy if exists "Broker can insert own broker profile" on public.broker_profiles;
drop policy if exists "Broker can update own broker profile" on public.broker_profiles;

create policy "Broker can view own broker profile"
on public.broker_profiles
for select
to authenticated
using (profile_id = auth.uid());

create policy "Broker can insert own broker profile"
on public.broker_profiles
for insert
to authenticated
with check (profile_id = auth.uid());

create policy "Broker can update own broker profile"
on public.broker_profiles
for update
to authenticated
using (profile_id = auth.uid())
with check (profile_id = auth.uid());

-- =========================================================
-- BROKER VERIFICATIONS
-- =========================================================

create table if not exists public.broker_verifications (
  id uuid primary key default gen_random_uuid(),

  broker_profile_id uuid not null
    references public.broker_profiles(id) on delete cascade,

  verification_type public.broker_verification_type_enum not null default 'creci',
  verification_status public.broker_verification_status_enum not null default 'pending',

  creci_number text,
  creci_uf char(2),

  submitted_data jsonb not null default '{}'::jsonb,
  verification_result jsonb,

  verified_at timestamptz,
  reviewed_by_profile_id uuid
    references public.users_profile(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint broker_verifications_creci_uf_len
    check (creci_uf is null or length(creci_uf) = 2)
);

comment on table public.broker_verifications is
'HURBY: histórico de validações profissionais do corretor, incluindo CRECI, documentos e revisão manual.';

comment on column public.broker_verifications.submitted_data is
'Dados apresentados para validação. Deve respeitar LGPD e minimização de dados.';

comment on column public.broker_verifications.verification_result is
'Resultado técnico/manual da validação. Pode receber retorno futuro de API ou revisão humana.';

create index if not exists idx_broker_verifications_broker_profile_id
  on public.broker_verifications(broker_profile_id);

create index if not exists idx_broker_verifications_status
  on public.broker_verifications(verification_status);

create index if not exists idx_broker_verifications_type
  on public.broker_verifications(verification_type);

drop trigger if exists trg_broker_verifications_updated_at on public.broker_verifications;

create trigger trg_broker_verifications_updated_at
before update on public.broker_verifications
for each row
execute function public.set_updated_at();

alter table public.broker_verifications enable row level security;

drop policy if exists "Broker can view own verifications" on public.broker_verifications;
drop policy if exists "Broker can insert own verifications" on public.broker_verifications;

create policy "Broker can view own verifications"
on public.broker_verifications
for select
to authenticated
using (
  exists (
    select 1
    from public.broker_profiles bp
    where bp.id = broker_verifications.broker_profile_id
      and bp.profile_id = auth.uid()
  )
);

create policy "Broker can insert own verifications"
on public.broker_verifications
for insert
to authenticated
with check (
  exists (
    select 1
    from public.broker_profiles bp
    where bp.id = broker_verifications.broker_profile_id
      and bp.profile_id = auth.uid()
  )
);

-- =========================================================
-- CLIENT ENTITIES
-- =========================================================

create table if not exists public.client_entities (
  id uuid primary key default gen_random_uuid(),

  linked_profile_id uuid
    references public.users_profile(id) on delete set null,

  display_name text,
  legal_name text,

  document_cpf text,
  document_cnpj text,

  entity_type public.client_entity_type_enum not null default 'unknown',
  verification_level public.client_verification_level_enum not null default 'unverified',
  entity_status public.client_entity_status_enum not null default 'active',

  created_by_profile_id uuid
    references public.users_profile(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint client_entities_document_presence
    check (
      document_cpf is null
      or document_cnpj is null
    )
);

comment on table public.client_entities is
'HURBY: entidade relacional de cliente/pessoa. Pode existir sem login e pode ser vinculada futuramente a users_profile.';

comment on column public.client_entities.linked_profile_id is
'Conta autenticada vinculada ao cliente, quando existir. Opcional.';

comment on column public.client_entities.created_by_profile_id is
'Perfil que cadastrou a entidade, quando aplicável. Pode ser corretor, gestor, sistema ou fluxo futuro.';

create index if not exists idx_client_entities_linked_profile_id
  on public.client_entities(linked_profile_id);

create index if not exists idx_client_entities_created_by_profile_id
  on public.client_entities(created_by_profile_id);

create index if not exists idx_client_entities_status
  on public.client_entities(entity_status);

create index if not exists idx_client_entities_verification_level
  on public.client_entities(verification_level);

drop trigger if exists trg_client_entities_updated_at on public.client_entities;

create trigger trg_client_entities_updated_at
before update on public.client_entities
for each row
execute function public.set_updated_at();

alter table public.client_entities enable row level security;

drop policy if exists "Users can view linked client entity" on public.client_entities;
drop policy if exists "Users can insert client entities they create" on public.client_entities;
drop policy if exists "Users can update client entities they created or linked" on public.client_entities;

create policy "Users can view linked client entity"
on public.client_entities
for select
to authenticated
using (
  linked_profile_id = auth.uid()
  or created_by_profile_id = auth.uid()
);

create policy "Users can insert client entities they create"
on public.client_entities
for insert
to authenticated
with check (
  created_by_profile_id = auth.uid()
  or linked_profile_id = auth.uid()
);

create policy "Users can update client entities they created or linked"
on public.client_entities
for update
to authenticated
using (
  linked_profile_id = auth.uid()
  or created_by_profile_id = auth.uid()
)
with check (
  linked_profile_id = auth.uid()
  or created_by_profile_id = auth.uid()
);

-- =========================================================
-- CLIENT CONTACT METHODS
-- =========================================================

create table if not exists public.client_contact_methods (
  id uuid primary key default gen_random_uuid(),

  client_entity_id uuid not null
    references public.client_entities(id) on delete cascade,

  contact_type public.client_contact_type_enum not null,
  contact_value text not null,

  is_primary boolean not null default false,

  verification_status public.client_contact_verification_status_enum not null default 'unverified',
  consent_status public.client_consent_status_enum not null default 'unknown',

  created_by_profile_id uuid
    references public.users_profile(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint client_contact_methods_value_not_empty
    check (length(trim(contact_value)) > 0)
);

comment on table public.client_contact_methods is
'HURBY: canais de contato do cliente. Prepara validação, consentimento, LGPD e acesso controlado a dados sensíveis.';

comment on column public.client_contact_methods.contact_value is
'Valor sensível. Acesso futuro deve respeitar LGPD, selos, consentimento e visibilidade.';

create index if not exists idx_client_contact_methods_client_entity_id
  on public.client_contact_methods(client_entity_id);

create index if not exists idx_client_contact_methods_contact_type
  on public.client_contact_methods(contact_type);

create index if not exists idx_client_contact_methods_verification_status
  on public.client_contact_methods(verification_status);

drop trigger if exists trg_client_contact_methods_updated_at on public.client_contact_methods;

create trigger trg_client_contact_methods_updated_at
before update on public.client_contact_methods
for each row
execute function public.set_updated_at();

alter table public.client_contact_methods enable row level security;

drop policy if exists "Users can view contact methods for accessible clients" on public.client_contact_methods;
drop policy if exists "Users can insert contact methods for accessible clients" on public.client_contact_methods;
drop policy if exists "Users can update contact methods for accessible clients" on public.client_contact_methods;

create policy "Users can view contact methods for accessible clients"
on public.client_contact_methods
for select
to authenticated
using (
  exists (
    select 1
    from public.client_entities ce
    where ce.id = client_contact_methods.client_entity_id
      and (
        ce.linked_profile_id = auth.uid()
        or ce.created_by_profile_id = auth.uid()
      )
  )
);

create policy "Users can insert contact methods for accessible clients"
on public.client_contact_methods
for insert
to authenticated
with check (
  exists (
    select 1
    from public.client_entities ce
    where ce.id = client_contact_methods.client_entity_id
      and (
        ce.linked_profile_id = auth.uid()
        or ce.created_by_profile_id = auth.uid()
      )
  )
);

create policy "Users can update contact methods for accessible clients"
on public.client_contact_methods
for update
to authenticated
using (
  exists (
    select 1
    from public.client_entities ce
    where ce.id = client_contact_methods.client_entity_id
      and (
        ce.linked_profile_id = auth.uid()
        or ce.created_by_profile_id = auth.uid()
      )
  )
)
with check (
  exists (
    select 1
    from public.client_entities ce
    where ce.id = client_contact_methods.client_entity_id
      and (
        ce.linked_profile_id = auth.uid()
        or ce.created_by_profile_id = auth.uid()
      )
  )
);

-- =========================================================
-- CLIENT RELATIONSHIPS
-- =========================================================

create table if not exists public.client_relationships (
  id uuid primary key default gen_random_uuid(),

  client_entity_id uuid not null
    references public.client_entities(id) on delete cascade,

  relationship_context public.client_relationship_context_enum not null,
  relationship_status public.client_relationship_status_enum not null default 'active',

  owner_profile_id uuid
    references public.users_profile(id) on delete set null,

  owner_organization_id uuid
    references public.organizations(id) on delete set null,

  source_profile_id uuid
    references public.users_profile(id) on delete set null,

  source_organization_id uuid
    references public.organizations(id) on delete set null,

  portfolio_id uuid
    references public.portfolios(id) on delete set null,

  property_asset_id uuid
    references public.property_assets(id) on delete set null,

  property_listing_id uuid
    references public.property_listings(id) on delete set null,

  operational_origin_id uuid
    references public.operational_origins(id) on delete set null,

  created_by_profile_id uuid
    references public.users_profile(id) on delete set null,

  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint client_relationships_has_context_owner
    check (
      owner_profile_id is not null
      or owner_organization_id is not null
      or relationship_context in ('marketplace', 'imported_contact')
    )
);

comment on table public.client_relationships is
'HURBY: vínculo contextual entre cliente e operação. É o coração relacional do Core Clients.';

comment on column public.client_relationships.relationship_context is
'Contexto do vínculo: marketplace, carteira de corretor, agência, interesse em imóvel, futuro lead, contrato etc.';

comment on column public.client_relationships.owner_profile_id is
'Perfil responsável pelo relacionamento, quando individual.';

comment on column public.client_relationships.owner_organization_id is
'Organização responsável pelo relacionamento, quando institucional.';

create index if not exists idx_client_relationships_client_entity_id
  on public.client_relationships(client_entity_id);

create index if not exists idx_client_relationships_context
  on public.client_relationships(relationship_context);

create index if not exists idx_client_relationships_status
  on public.client_relationships(relationship_status);

create index if not exists idx_client_relationships_owner_profile_id
  on public.client_relationships(owner_profile_id);

create index if not exists idx_client_relationships_owner_organization_id
  on public.client_relationships(owner_organization_id);

create index if not exists idx_client_relationships_property_asset_id
  on public.client_relationships(property_asset_id);

create index if not exists idx_client_relationships_property_listing_id
  on public.client_relationships(property_listing_id);

drop trigger if exists trg_client_relationships_updated_at on public.client_relationships;

create trigger trg_client_relationships_updated_at
before update on public.client_relationships
for each row
execute function public.set_updated_at();

alter table public.client_relationships enable row level security;

drop policy if exists "Users can view owned client relationships" on public.client_relationships;
drop policy if exists "Users can insert owned client relationships" on public.client_relationships;
drop policy if exists "Users can update owned client relationships" on public.client_relationships;

create policy "Users can view owned client relationships"
on public.client_relationships
for select
to authenticated
using (
  owner_profile_id = auth.uid()
  or source_profile_id = auth.uid()
  or created_by_profile_id = auth.uid()
  or exists (
    select 1
    from public.organization_memberships om
    where om.organization_id = client_relationships.owner_organization_id
      and om.profile_id = auth.uid()
      and om.membership_status = 'active'
  )
);

create policy "Users can insert owned client relationships"
on public.client_relationships
for insert
to authenticated
with check (
  owner_profile_id = auth.uid()
  or source_profile_id = auth.uid()
  or created_by_profile_id = auth.uid()
  or exists (
    select 1
    from public.organization_memberships om
    where om.organization_id = client_relationships.owner_organization_id
      and om.profile_id = auth.uid()
      and om.membership_status = 'active'
  )
);

create policy "Users can update owned client relationships"
on public.client_relationships
for update
to authenticated
using (
  owner_profile_id = auth.uid()
  or source_profile_id = auth.uid()
  or created_by_profile_id = auth.uid()
  or exists (
    select 1
    from public.organization_memberships om
    where om.organization_id = client_relationships.owner_organization_id
      and om.profile_id = auth.uid()
      and om.membership_status = 'active'
  )
)
with check (
  owner_profile_id = auth.uid()
  or source_profile_id = auth.uid()
  or created_by_profile_id = auth.uid()
  or exists (
    select 1
    from public.organization_memberships om
    where om.organization_id = client_relationships.owner_organization_id
      and om.profile_id = auth.uid()
      and om.membership_status = 'active'
  )
);

-- =========================================================
-- CLIENT RELATIONSHIP ROLES
-- =========================================================

create table if not exists public.client_relationship_roles (
  id uuid primary key default gen_random_uuid(),

  client_relationship_id uuid not null
    references public.client_relationships(id) on delete cascade,

  role_type public.client_role_type_enum not null,
  role_status public.client_role_status_enum not null default 'active',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint client_relationship_roles_unique_role
    unique (client_relationship_id, role_type)
);

comment on table public.client_relationship_roles is
'HURBY: papéis exercidos pelo cliente dentro de uma relação contextual.';

comment on column public.client_relationship_roles.role_type is
'Papel contextual: buscador, fornecedor de imóvel, comprador, locatário, proprietário, contato etc.';

create index if not exists idx_client_relationship_roles_relationship_id
  on public.client_relationship_roles(client_relationship_id);

create index if not exists idx_client_relationship_roles_role_type
  on public.client_relationship_roles(role_type);

drop trigger if exists trg_client_relationship_roles_updated_at on public.client_relationship_roles;

create trigger trg_client_relationship_roles_updated_at
before update on public.client_relationship_roles
for each row
execute function public.set_updated_at();

alter table public.client_relationship_roles enable row level security;

drop policy if exists "Users can view roles for accessible relationships" on public.client_relationship_roles;
drop policy if exists "Users can insert roles for accessible relationships" on public.client_relationship_roles;
drop policy if exists "Users can update roles for accessible relationships" on public.client_relationship_roles;

create policy "Users can view roles for accessible relationships"
on public.client_relationship_roles
for select
to authenticated
using (
  exists (
    select 1
    from public.client_relationships cr
    where cr.id = client_relationship_roles.client_relationship_id
      and (
        cr.owner_profile_id = auth.uid()
        or cr.source_profile_id = auth.uid()
        or cr.created_by_profile_id = auth.uid()
        or exists (
          select 1
          from public.organization_memberships om
          where om.organization_id = cr.owner_organization_id
            and om.profile_id = auth.uid()
            and om.membership_status = 'active'
        )
      )
  )
);

create policy "Users can insert roles for accessible relationships"
on public.client_relationship_roles
for insert
to authenticated
with check (
  exists (
    select 1
    from public.client_relationships cr
    where cr.id = client_relationship_roles.client_relationship_id
      and (
        cr.owner_profile_id = auth.uid()
        or cr.source_profile_id = auth.uid()
        or cr.created_by_profile_id = auth.uid()
        or exists (
          select 1
          from public.organization_memberships om
          where om.organization_id = cr.owner_organization_id
            and om.profile_id = auth.uid()
            and om.membership_status = 'active'
        )
      )
  )
);

create policy "Users can update roles for accessible relationships"
on public.client_relationship_roles
for update
to authenticated
using (
  exists (
    select 1
    from public.client_relationships cr
    where cr.id = client_relationship_roles.client_relationship_id
      and (
        cr.owner_profile_id = auth.uid()
        or cr.source_profile_id = auth.uid()
        or cr.created_by_profile_id = auth.uid()
        or exists (
          select 1
          from public.organization_memberships om
          where om.organization_id = cr.owner_organization_id
            and om.profile_id = auth.uid()
            and om.membership_status = 'active'
        )
      )
  )
)
with check (
  exists (
    select 1
    from public.client_relationships cr
    where cr.id = client_relationship_roles.client_relationship_id
      and (
        cr.owner_profile_id = auth.uid()
        or cr.source_profile_id = auth.uid()
        or cr.created_by_profile_id = auth.uid()
        or exists (
          select 1
          from public.organization_memberships om
          where om.organization_id = cr.owner_organization_id
            and om.profile_id = auth.uid()
            and om.membership_status = 'active'
        )
      )
  )
);

-- =========================================================
-- COMENTÁRIOS DE GOVERNANÇA FUTURA
-- =========================================================

comment on schema public is
'HURBY public schema: contém foundations operacionais. Identity/Clients preparada para Score, Trust/Safety, Reviews e LGPD contextual.';
