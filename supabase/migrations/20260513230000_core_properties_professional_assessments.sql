-- =========================================
-- HURBY — CORE_PROPERTIES_FORM_V1
-- CONTEXTO:
-- Criação da tabela profissional de ficha de captação e avaliação de imóvel.
--
-- LOCAL:
-- supabase/migrations/20260513230000_core_properties_professional_assessments.sql
--
-- DESCRIÇÃO:
-- Esta migration cria a estrutura property_professional_assessments, responsável por armazenar
-- a Ficha Profissional de Captação e Avaliação do Imóvel.
--
-- O QUE ALTERA:
-- - cria enum property_professional_assessment_status_enum
-- - cria tabela public.property_professional_assessments
-- - cria índices de apoio
-- - habilita RLS
-- - cria policies conservadoras usando can_access_asset/can_manage_asset/can_access_listing/can_manage_listing
--
-- O QUE NÃO ALTERAR:
-- - não altera create_property_operational_bundle
-- - não altera property_assets
-- - não altera property_listings
-- - não altera Core Clients
-- - não altera ledger/AXE
-- - não altera Auth/Middleware
--
-- DEPENDÊNCIAS:
-- - property_assets
-- - property_listings
-- - portfolio_items
-- - client_entities
-- - client_relationships
-- - can_access_asset(uuid)
-- - can_manage_asset(uuid)
-- - can_access_listing(uuid)
-- - can_manage_listing(uuid)
--
-- VALIDAÇÃO:
-- - supabase db reset
-- - verificar existência da tabela
-- - verificar policies
-- - validar build após integração frontend/service
--
-- RISCO:
-- Baixo. A migration cria extensão nova e não altera contratos existentes.
--
-- ROLLBACK:
-- drop table public.property_professional_assessments;
-- drop type public.property_professional_assessment_status_enum;
-- =========================================

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'property_professional_assessment_status_enum'
  ) then
    create type public.property_professional_assessment_status_enum as enum (
      'draft',
      'submitted_for_review',
      'needs_correction',
      'approved',
      'rejected',
      'archived'
    );
  end if;
end $$;

create table if not exists public.property_professional_assessments (
  id uuid primary key default gen_random_uuid(),

  property_asset_id uuid not null references public.property_assets(id) on delete cascade,
  property_listing_id uuid references public.property_listings(id) on delete cascade,
  portfolio_item_id uuid references public.portfolio_items(id) on delete set null,

  client_entity_id uuid references public.client_entities(id) on delete set null,
  client_relationship_id uuid references public.client_relationships(id) on delete set null,

  created_by_profile_id uuid not null default auth.uid(),
  responsible_profile_id uuid not null default auth.uid(),
  responsible_organization_id uuid null,

  assessment_status public.property_professional_assessment_status_enum not null default 'draft',
  assessment_purpose text not null default 'general'
    check (assessment_purpose in ('general', 'sale', 'rental', 'rental_management')),

  version_number integer not null default 1,
  is_current boolean not null default true,

  is_available_for_partnership boolean not null default false,
  is_exclusive boolean not null default true,
  hide_exact_address_for_partners boolean not null default true,
  owner_can_view_summary boolean not null default true,

  essential_snapshot jsonb not null default '{}'::jsonb,
  technical_assessment jsonb not null default '{}'::jsonb,
  commercial_assessment jsonb not null default '{}'::jsonb,
  owner_interview jsonb not null default '{}'::jsonb,
  documentation_assessment jsonb not null default '{}'::jsonb,
  financial_assessment jsonb not null default '{}'::jsonb,

  public_summary jsonb not null default '{}'::jsonb,
  owner_visibility_summary jsonb not null default '{}'::jsonb,
  partner_visibility_summary jsonb not null default '{}'::jsonb,

  private_notes jsonb not null default '{}'::jsonb,

  ai_review_status text not null default 'not_requested',
  ai_review_notes jsonb not null default '{}'::jsonb,
  moderation_status text not null default 'not_reviewed',
  moderation_notes jsonb not null default '{}'::jsonb,

  entitlement_status text not null default 'not_required',
  is_free_assessment boolean not null default false,
  monetization_metadata jsonb not null default '{}'::jsonb,

  metadata jsonb not null default '{}'::jsonb,

  submitted_at timestamptz null,
  reviewed_at timestamptz null,
  approved_at timestamptz null,
  rejected_at timestamptz null,
  archived_at timestamptz null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint property_professional_assessments_profile_check
    check (created_by_profile_id is not null and responsible_profile_id is not null)
);

create index if not exists idx_property_professional_assessments_asset
  on public.property_professional_assessments(property_asset_id);

create index if not exists idx_property_professional_assessments_listing
  on public.property_professional_assessments(property_listing_id);

create index if not exists idx_property_professional_assessments_portfolio_item
  on public.property_professional_assessments(portfolio_item_id);

create index if not exists idx_property_professional_assessments_client_entity
  on public.property_professional_assessments(client_entity_id);

create index if not exists idx_property_professional_assessments_client_relationship
  on public.property_professional_assessments(client_relationship_id);

create index if not exists idx_property_professional_assessments_status
  on public.property_professional_assessments(assessment_status);

create index if not exists idx_property_professional_assessments_responsible_profile
  on public.property_professional_assessments(responsible_profile_id);

create unique index if not exists uq_property_professional_assessments_current_listing
  on public.property_professional_assessments(property_listing_id)
  where is_current = true
    and property_listing_id is not null
    and archived_at is null;

alter table public.property_professional_assessments enable row level security;

drop policy if exists property_professional_assessments_select_context
  on public.property_professional_assessments;

create policy property_professional_assessments_select_context
  on public.property_professional_assessments
  for select
  using (
    (
      property_listing_id is not null
      and public.can_access_listing(property_listing_id)
    )
    or public.can_access_asset(property_asset_id)
  );

drop policy if exists property_professional_assessments_insert_context
  on public.property_professional_assessments;

create policy property_professional_assessments_insert_context
  on public.property_professional_assessments
  for insert
  with check (
    created_by_profile_id = auth.uid()
    and responsible_profile_id = auth.uid()
    and public.can_manage_asset(property_asset_id)
    and (
      property_listing_id is null
      or public.can_manage_listing(property_listing_id)
    )
  );

drop policy if exists property_professional_assessments_update_context
  on public.property_professional_assessments;

create policy property_professional_assessments_update_context
  on public.property_professional_assessments
  for update
  using (
    public.can_manage_asset(property_asset_id)
    and (
      property_listing_id is null
      or public.can_manage_listing(property_listing_id)
    )
  )
  with check (
    public.can_manage_asset(property_asset_id)
    and (
      property_listing_id is null
      or public.can_manage_listing(property_listing_id)
    )
  );

comment on table public.property_professional_assessments is
'HURBY — Ficha Profissional de Captação e Avaliação do Imóvel. Extensão profissional do Core Properties Form V1. Não expor integralmente ao público, proprietário ou parceiros.';

comment on column public.property_professional_assessments.private_notes is
'Dados privados profissionais. Não expor ao proprietário, parceiros, marketplace ou público.';

comment on column public.property_professional_assessments.partner_visibility_summary is
'Resumo comercial controlado para futura parceria. Não deve conter número do imóvel, dados do proprietário, documentos ou notas privadas.';

comment on column public.property_professional_assessments.owner_visibility_summary is
'Resumo controlado para acompanhamento futuro do proprietário no painel Meu Imóvel/Meus Imóveis.';

comment on column public.property_professional_assessments.hide_exact_address_for_partners is
'Regra de proteção comercial: imóveis compartilhados não devem exibir número residencial/endereço exato para parceiros por padrão.';
