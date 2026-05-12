-- =========================================
-- MODULO: CORE_PROPERTIES_BASIC_FIELDS_EXTENSION
-- CONTEXTO: Marketplace user listing + futuro Core Properties Form V1
-- LOCAL: supabase/migrations/20260510173000_extend_core_properties_basic_fields.sql
--
-- DESCRICAO:
-- Amplia o Core Properties com campos estruturais basicos para anuncio publico,
-- busca, filtros, SEO e formularios de marketplace/profissional.
--
-- REGRA DE TESTE:
-- Nenhum campo novo deve ser NOT NULL neste momento.
-- Durante testes, o titulo do anuncio continua sendo o minimo operacional.
--
-- O QUE ALTERA:
-- - cria enums controlados
-- - adiciona colunas opcionais em property_assets
-- - adiciona colunas opcionais em property_asset_features
-- - adiciona colunas opcionais em property_asset_locations
-- - adiciona colunas opcionais em property_listings
--
-- O QUE NAO ALTERA:
-- - nao cria tabela paralela de anuncio
-- - nao muda FKs existentes
-- - nao muda RLS existente
-- - nao torna campos obrigatorios
-- - nao altera fluxo profissional validado
-- =========================================

do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'property_standard_enum'
  ) then
    create type public.property_standard_enum as enum (
      'popular',
      'standard',
      'medium',
      'elevated',
      'high',
      'luxury'
    );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'sun_position_enum'
  ) then
    create type public.sun_position_enum as enum (
      'morning',
      'afternoon'
    );
  end if;
end $$;

alter table public.property_assets
  add column if not exists property_standard public.property_standard_enum null,
  add column if not exists condominium_name text null,
  add column if not exists building_name text null,
  add column if not exists is_gated_community boolean null,
  add column if not exists has_condominium_pool boolean null,
  add column if not exists accepts_financing boolean null;

alter table public.property_asset_features
  add column if not exists suites integer null,
  add column if not exists is_furnished boolean null,
  add column if not exists has_private_pool boolean null,
  add column if not exists sun_position public.sun_position_enum null,
  add column if not exists floor_number integer null,
  add column if not exists total_floors integer null,
  add column if not exists has_elevator boolean null;

alter table public.property_asset_locations
  add column if not exists zip_code text null,
  add column if not exists complement text null,
  add column if not exists hide_public_number boolean null default false;

alter table public.property_listings
  add column if not exists condo_fee numeric null,
  add column if not exists iptu_value numeric null;

comment on column public.property_assets.property_standard is
'Padrao comercial do imovel: popular, standard, medium, elevated, high, luxury. Campo estrutural para filtro, SEO, campanhas e secoes como alto padrao/luxo.';

comment on column public.property_assets.condominium_name is
'Nome do condominio, edificio ou empreendimento. Campo estrutural para busca, Google, filtro e anuncio publico.';

comment on column public.property_assets.has_condominium_pool is
'Indica se o condominio possui piscina. Campo estrutural por relevancia de busca e apelo comercial.';

comment on column public.property_asset_features.has_private_pool is
'Indica se o imovel possui piscina privativa. Campo estrutural por relevancia de busca e apelo comercial.';

comment on column public.property_asset_locations.hide_public_number is
'Indica se o numero exato deve ser ocultado no anuncio publico.';
