insert into public.property_business_context (slug, label)
values ('lease', 'Arrendamento')
on conflict (slug) do nothing;

-- =========================================
-- MODULO: CORE_MARKETPLACE_USER_LISTINGS
-- CONTEXTO: CORE_CLIENTS + CORE_PROPERTIES + MARKETPLACE ACCOUNT
-- LOCAL: supabase/migrations/20260510174000_marketplace_user_listing_rpc.sql
--
-- DESCRICAO:
-- Cria RPCs para anuncio de imovel do usuario comum marketplace.
--
-- REGRAS:
-- - usuario comum pode criar 1 anuncio gratuito
-- - segundo anuncio deve ser bloqueado para futura monetizacao
-- - titulo e o unico campo minimo operacional neste momento
-- - demais campos ficam opcionais para testes
--
-- O QUE ALTERA:
-- - cria public.create_marketplace_user_listing
-- - cria public.update_marketplace_user_listing
--
-- O QUE NAO ALTERAR:
-- - nao cria tabela paralela de anuncios
-- - nao altera Core Properties profissional
-- - nao altera create_property_operational_bundle
-- - nao altera Ledger/Axe
-- =========================================

create or replace function public.create_marketplace_user_listing(
  p_title text,

  p_property_type_slug text default 'house',
  p_operational_model_slug text default 'transactional',
  p_property_business_context_slug text default 'sale',
  p_listing_status_slug text default 'draft',

  p_description text default null,
  p_price numeric default null,
  p_condo_fee numeric default null,
  p_iptu_value numeric default null,

  p_property_standard text default null,
  p_condominium_name text default null,
  p_building_name text default null,
  p_is_gated_community boolean default null,
  p_has_condominium_pool boolean default null,
  p_accepts_financing boolean default null,

  p_country text default 'BR',
  p_zip_code text default null,
  p_state text default null,
  p_city text default null,
  p_neighborhood text default null,
  p_street text default null,
  p_number text default null,
  p_complement text default null,
  p_hide_public_number boolean default false,

  p_bedrooms integer default null,
  p_suites integer default null,
  p_bathrooms integer default null,
  p_garage_spaces integer default null,
  p_private_area numeric default null,
  p_total_area numeric default null,
  p_is_furnished boolean default null,
  p_has_private_pool boolean default null,
  p_sun_position text default null,
  p_floor_number integer default null,
  p_total_floors integer default null,
  p_has_elevator boolean default null,

  p_metadata jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_portfolio_id uuid;
  v_origin_id uuid;
  v_asset_id uuid;
  v_location_id uuid;
  v_features_id uuid;
  v_listing_id uuid;
  v_portfolio_item_id uuid;

  v_property_type_id uuid;
  v_operational_model_id uuid;
  v_business_context_id uuid;
  v_listing_status_id uuid;

  v_free_count integer;
  v_property_standard public.property_standard_enum;
  v_sun_position public.sun_position_enum;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if not exists (
    select 1
    from public.users_profile up
    where up.id = v_user_id
      and up.account_status = 'active'
  ) then
    raise exception 'ACTIVE_PROFILE_REQUIRED';
  end if;

  if p_title is null or length(trim(p_title)) = 0 then
    raise exception 'TITLE_REQUIRED';
  end if;

  select count(*)
  into v_free_count
  from public.property_listings pl
  where pl.created_by_profile_id = v_user_id
    and pl.visibility_scope = 'marketplace'
    and pl.deleted_at is null
    and coalesce(pl.metadata->>'source', '') = 'marketplace_user_listing';

  if v_free_count >= 1 then
    raise exception 'MARKETPLACE_FREE_LISTING_LIMIT_REACHED';
  end if;

  select id into v_property_type_id
  from public.property_type
  where slug = coalesce(nullif(trim(p_property_type_slug), ''), 'house')
    and is_active = true
  limit 1;

  if v_property_type_id is null then
    raise exception 'PROPERTY_TYPE_NOT_FOUND';
  end if;

  select id into v_operational_model_id
  from public.operational_model
  where slug = coalesce(nullif(trim(p_operational_model_slug), ''), 'transactional')
    and is_active = true
  limit 1;

  if v_operational_model_id is null then
    raise exception 'OPERATIONAL_MODEL_NOT_FOUND';
  end if;

  select id into v_business_context_id
  from public.property_business_context
  where slug = coalesce(nullif(trim(p_property_business_context_slug), ''), 'sale')
    and is_active = true
  limit 1;

  if v_business_context_id is null then
    raise exception 'BUSINESS_CONTEXT_NOT_FOUND';
  end if;

  select id into v_listing_status_id
  from public.listing_status
  where slug = coalesce(nullif(trim(p_listing_status_slug), ''), 'draft')
    and is_active = true
  limit 1;

  if v_listing_status_id is null then
    raise exception 'LISTING_STATUS_NOT_FOUND';
  end if;

  if p_property_standard is not null and length(trim(p_property_standard)) > 0 then
    v_property_standard := trim(p_property_standard)::public.property_standard_enum;
  end if;

  if p_sun_position is not null and length(trim(p_sun_position)) > 0 then
    v_sun_position := trim(p_sun_position)::public.sun_position_enum;
  end if;

  select p.id
  into v_portfolio_id
  from public.portfolios p
  where p.profile_id = v_user_id
    and p.portfolio_type = 'individual'
    and p.portfolio_status = 'active'
    and p.name = 'Marketplace user listings'
  limit 1;

  if v_portfolio_id is null then
    insert into public.portfolios (
      portfolio_type,
      portfolio_status,
      profile_id,
      organization_id,
      membership_id,
      name,
      description,
      created_by_profile_id
    )
    values (
      'individual',
      'active',
      v_user_id,
      null,
      null,
      'Marketplace user listings',
      'Carteira de anuncios simples do usuario marketplace.',
      v_user_id
    )
    returning id into v_portfolio_id;
  end if;

  insert into public.operational_origins (
    origin_type,
    source_profile_id,
    description,
    metadata,
    created_by_profile_id
  )
  values (
    'marketplace',
    v_user_id,
    'Anuncio criado pelo usuario comum no marketplace.',
    jsonb_build_object(
      'source',
      'create_marketplace_user_listing',
      'flow',
      'marketplace_user_listing',
      'free_tier',
      true
    ),
    v_user_id
  )
  returning id into v_origin_id;

  insert into public.property_assets (
    created_by_profile_id,
    current_responsible_profile_id,
    operational_origin_id,
    property_type_id,
    operational_model_id,
    country,
    is_active,
    property_standard,
    condominium_name,
    building_name,
    is_gated_community,
    has_condominium_pool,
    accepts_financing,
    metadata
  )
  values (
    v_user_id,
    v_user_id,
    v_origin_id,
    v_property_type_id,
    v_operational_model_id,
    coalesce(p_country, 'BR'),
    true,
    v_property_standard,
    nullif(trim(coalesce(p_condominium_name, '')), ''),
    nullif(trim(coalesce(p_building_name, '')), ''),
    p_is_gated_community,
    p_has_condominium_pool,
    p_accepts_financing,
    jsonb_build_object(
      'source',
      'marketplace_user_listing',
      'flow',
      'common_user',
      'free_tier',
      true
    ) || coalesce(p_metadata, '{}'::jsonb)
  )
  returning id into v_asset_id;

  insert into public.property_asset_locations (
    property_asset_id,
    country,
    zip_code,
    state,
    city,
    neighborhood,
    street,
    number,
    complement,
    hide_public_number
  )
  values (
    v_asset_id,
    coalesce(p_country, 'BR'),
    nullif(trim(coalesce(p_zip_code, '')), ''),
    nullif(trim(coalesce(p_state, '')), ''),
    nullif(trim(coalesce(p_city, '')), ''),
    nullif(trim(coalesce(p_neighborhood, '')), ''),
    nullif(trim(coalesce(p_street, '')), ''),
    nullif(trim(coalesce(p_number, '')), ''),
    nullif(trim(coalesce(p_complement, '')), ''),
    coalesce(p_hide_public_number, false)
  )
  returning id into v_location_id;

  insert into public.property_asset_features (
    property_asset_id,
    bedrooms,
    suites,
    bathrooms,
    garage_spaces,
    private_area,
    total_area,
    is_furnished,
    has_private_pool,
    sun_position,
    floor_number,
    total_floors,
    has_elevator
  )
  values (
    v_asset_id,
    p_bedrooms,
    p_suites,
    p_bathrooms,
    p_garage_spaces,
    p_private_area,
    p_total_area,
    p_is_furnished,
    p_has_private_pool,
    v_sun_position,
    p_floor_number,
    p_total_floors,
    p_has_elevator
  )
  returning id into v_features_id;

  insert into public.property_listings (
    property_asset_id,
    created_by_profile_id,
    responsible_profile_id,
    property_business_context_id,
    listing_status_id,
    visibility_scope,
    title,
    description,
    price,
    condo_fee,
    iptu_value,
    published_at,
    metadata
  )
  values (
    v_asset_id,
    v_user_id,
    v_user_id,
    v_business_context_id,
    v_listing_status_id,
    'marketplace',
    trim(p_title),
    nullif(trim(coalesce(p_description, '')), ''),
    p_price,
    p_condo_fee,
    p_iptu_value,
    now(),
    jsonb_build_object(
      'source',
      'marketplace_user_listing',
      'flow',
      'common_user',
      'free_tier',
      true,
      'monetization_status',
      'free'
    ) || coalesce(p_metadata, '{}'::jsonb)
  )
  returning id into v_listing_id;

  insert into public.portfolio_items (
    portfolio_id,
    property_asset_id,
    property_listing_id,
    operational_origin_id,
    responsible_profile_id,
    origin_type,
    visibility_scope,
    item_status,
    is_primary,
    created_by_profile_id,
    metadata
  )
  values (
    v_portfolio_id,
    v_asset_id,
    v_listing_id,
    v_origin_id,
    v_user_id,
    'marketplace',
    'marketplace',
    'active',
    true,
    v_user_id,
    jsonb_build_object(
      'source',
      'marketplace_user_listing',
      'flow',
      'common_user'
    )
  )
  returning id into v_portfolio_item_id;

  return jsonb_build_object(
    'portfolio_id', v_portfolio_id,
    'origin_id', v_origin_id,
    'asset_id', v_asset_id,
    'location_id', v_location_id,
    'features_id', v_features_id,
    'listing_id', v_listing_id,
    'portfolio_item_id', v_portfolio_item_id,
    'free_listing_used', true
  );
end;
$$;

create or replace function public.update_marketplace_user_listing(
  p_listing_id uuid,
  p_title text,

  p_property_type_slug text default 'house',
  p_property_business_context_slug text default 'sale',
  p_listing_status_slug text default 'draft',

  p_description text default null,
  p_price numeric default null,
  p_condo_fee numeric default null,
  p_iptu_value numeric default null,

  p_property_standard text default null,
  p_condominium_name text default null,
  p_building_name text default null,
  p_is_gated_community boolean default null,
  p_has_condominium_pool boolean default null,
  p_accepts_financing boolean default null,

  p_zip_code text default null,
  p_state text default null,
  p_city text default null,
  p_neighborhood text default null,
  p_street text default null,
  p_number text default null,
  p_complement text default null,
  p_hide_public_number boolean default false,

  p_bedrooms integer default null,
  p_suites integer default null,
  p_bathrooms integer default null,
  p_garage_spaces integer default null,
  p_private_area numeric default null,
  p_total_area numeric default null,
  p_is_furnished boolean default null,
  p_has_private_pool boolean default null,
  p_sun_position text default null,
  p_floor_number integer default null,
  p_total_floors integer default null,
  p_has_elevator boolean default null,

  p_metadata jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_asset_id uuid;
  v_property_type_id uuid;
  v_business_context_id uuid;
  v_listing_status_id uuid;
  v_property_standard public.property_standard_enum;
  v_sun_position public.sun_position_enum;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if p_title is null or length(trim(p_title)) = 0 then
    raise exception 'TITLE_REQUIRED';
  end if;

  select pl.property_asset_id
  into v_asset_id
  from public.property_listings pl
  where pl.id = p_listing_id
    and pl.created_by_profile_id = v_user_id
    and pl.visibility_scope = 'marketplace'
    and coalesce(pl.metadata->>'source', '') = 'marketplace_user_listing'
    and pl.deleted_at is null;

  if v_asset_id is null then
    raise exception 'MARKETPLACE_LISTING_NOT_FOUND';
  end if;

  select id into v_property_type_id
  from public.property_type
  where slug = coalesce(nullif(trim(p_property_type_slug), ''), 'house')
    and is_active = true
  limit 1;

  if v_property_type_id is null then
    raise exception 'PROPERTY_TYPE_NOT_FOUND';
  end if;

  select id into v_business_context_id
  from public.property_business_context
  where slug = coalesce(nullif(trim(p_property_business_context_slug), ''), 'sale')
    and is_active = true
  limit 1;

  if v_business_context_id is null then
    raise exception 'BUSINESS_CONTEXT_NOT_FOUND';
  end if;

  select id into v_listing_status_id
  from public.listing_status
  where slug = coalesce(nullif(trim(p_listing_status_slug), ''), 'draft')
    and is_active = true
  limit 1;

  if v_listing_status_id is null then
    raise exception 'LISTING_STATUS_NOT_FOUND';
  end if;

  if p_property_standard is not null and length(trim(p_property_standard)) > 0 then
    v_property_standard := trim(p_property_standard)::public.property_standard_enum;
  end if;

  if p_sun_position is not null and length(trim(p_sun_position)) > 0 then
    v_sun_position := trim(p_sun_position)::public.sun_position_enum;
  end if;

  update public.property_assets
  set
    property_type_id = v_property_type_id,
    property_standard = v_property_standard,
    condominium_name = nullif(trim(coalesce(p_condominium_name, '')), ''),
    building_name = nullif(trim(coalesce(p_building_name, '')), ''),
    is_gated_community = p_is_gated_community,
    has_condominium_pool = p_has_condominium_pool,
    accepts_financing = p_accepts_financing,
    updated_at = now()
  where id = v_asset_id
    and created_by_profile_id = v_user_id;

  update public.property_asset_locations
  set
    zip_code = nullif(trim(coalesce(p_zip_code, '')), ''),
    state = nullif(trim(coalesce(p_state, '')), ''),
    city = nullif(trim(coalesce(p_city, '')), ''),
    neighborhood = nullif(trim(coalesce(p_neighborhood, '')), ''),
    street = nullif(trim(coalesce(p_street, '')), ''),
    number = nullif(trim(coalesce(p_number, '')), ''),
    complement = nullif(trim(coalesce(p_complement, '')), ''),
    hide_public_number = coalesce(p_hide_public_number, false),
    updated_at = now()
  where property_asset_id = v_asset_id;

  update public.property_asset_features
  set
    bedrooms = p_bedrooms,
    suites = p_suites,
    bathrooms = p_bathrooms,
    garage_spaces = p_garage_spaces,
    private_area = p_private_area,
    total_area = p_total_area,
    is_furnished = p_is_furnished,
    has_private_pool = p_has_private_pool,
    sun_position = v_sun_position,
    floor_number = p_floor_number,
    total_floors = p_total_floors,
    has_elevator = p_has_elevator,
    updated_at = now()
  where property_asset_id = v_asset_id;

  update public.property_listings
  set
    property_business_context_id = v_business_context_id,
    listing_status_id = v_listing_status_id,
    title = trim(p_title),
    description = nullif(trim(coalesce(p_description, '')), ''),
    price = p_price,
    condo_fee = p_condo_fee,
    iptu_value = p_iptu_value,
    metadata = coalesce(metadata, '{}'::jsonb) || coalesce(p_metadata, '{}'::jsonb),
    updated_at = now()
  where id = p_listing_id
    and created_by_profile_id = v_user_id;

  return jsonb_build_object(
    'listing_id', p_listing_id,
    'asset_id', v_asset_id,
    'updated', true
  );
end;
$$;
