-- =========================================
-- MÓDULO: CORE_REAL_ESTATE_OPERATIONAL_FOUNDATION
-- MIGRATION: 20260509204500_create_property_operational_bundle_rpc.sql
--
-- OBJETIVO:
-- Criar RPC transacional para cadastro operacional
-- de imóvel dentro do novo core imobiliário.
--
-- MOTIVO:
-- O fluxo de criação não deve depender do frontend
-- fazendo múltiplos inserts em tabelas protegidas por RLS.
--
-- A função usa auth.uid() e cria:
-- - portfolio individual, se não existir
-- - operational_origin
-- - property_asset
-- - property_asset_location
-- - property_asset_features
-- - property_listing
-- - portfolio_item
--
-- NÃO ALTERA:
-- - auth
-- - ledger
-- - wallet
-- - LGPD
-- - organizations
-- - memberships
-- =========================================

CREATE OR REPLACE FUNCTION public.create_property_operational_bundle(
  p_property_type_id uuid,
  p_operational_model_id uuid,
  p_property_business_context_id uuid,
  p_listing_status_id uuid,
  p_title text,
  p_description text DEFAULT NULL,
  p_price numeric DEFAULT NULL,
  p_visibility_scope text DEFAULT 'private',
  p_country text DEFAULT 'BR'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_portfolio_id uuid;
  v_origin_id uuid;
  v_asset_id uuid;
  v_location_id uuid;
  v_features_id uuid;
  v_listing_id uuid;
  v_portfolio_item_id uuid;
  v_visibility public.visibility_scope_enum;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.users_profile up
    WHERE up.id = v_user_id
      AND up.status = 'active'
  ) THEN
    RAISE EXCEPTION 'ACTIVE_PROFILE_REQUIRED';
  END IF;

  IF p_title IS NULL OR length(trim(p_title)) = 0 THEN
    RAISE EXCEPTION 'TITLE_REQUIRED';
  END IF;

  v_visibility := p_visibility_scope::public.visibility_scope_enum;

  SELECT p.id
  INTO v_portfolio_id
  FROM public.portfolios p
  WHERE p.portfolio_type = 'individual'
    AND p.portfolio_status = 'active'
    AND p.profile_id = v_user_id
  ORDER BY p.created_at ASC
  LIMIT 1;

  IF v_portfolio_id IS NULL THEN
    INSERT INTO public.portfolios (
      portfolio_type,
      portfolio_status,
      profile_id,
      organization_id,
      membership_id,
      name,
      description,
      created_by_profile_id
    )
    VALUES (
      'individual',
      'active',
      v_user_id,
      NULL,
      NULL,
      'Carteira individual',
      'Carteira operacional individual criada automaticamente para o usuário.',
      v_user_id
    )
    RETURNING id INTO v_portfolio_id;
  END IF;

  INSERT INTO public.operational_origins (
    origin_type,
    source_profile_id,
    source_organization_id,
    source_membership_id,
    description,
    metadata,
    created_by_profile_id
  )
  VALUES (
    'broker_direct',
    v_user_id,
    NULL,
    NULL,
    'Cadastro direto realizado pelo usuário dentro do núcleo operacional imobiliário.',
    jsonb_build_object('source', 'create_property_operational_bundle_rpc'),
    v_user_id
  )
  RETURNING id INTO v_origin_id;

  INSERT INTO public.property_assets (
    created_by_profile_id,
    current_responsible_profile_id,
    operational_origin_id,
    property_type_id,
    operational_model_id,
    country,
    is_active,
    metadata
  )
  VALUES (
    v_user_id,
    v_user_id,
    v_origin_id,
    p_property_type_id,
    p_operational_model_id,
    COALESCE(p_country, 'BR'),
    true,
    '{}'::jsonb
  )
  RETURNING id INTO v_asset_id;

  INSERT INTO public.property_asset_locations (
    property_asset_id,
    country
  )
  VALUES (
    v_asset_id,
    COALESCE(p_country, 'BR')
  )
  RETURNING id INTO v_location_id;

  INSERT INTO public.property_asset_features (
    property_asset_id
  )
  VALUES (
    v_asset_id
  )
  RETURNING id INTO v_features_id;

  INSERT INTO public.property_listings (
    property_asset_id,
    created_by_profile_id,
    responsible_profile_id,
    property_business_context_id,
    listing_status_id,
    visibility_scope,
    title,
    description,
    price,
    metadata
  )
  VALUES (
    v_asset_id,
    v_user_id,
    v_user_id,
    p_property_business_context_id,
    p_listing_status_id,
    v_visibility,
    trim(p_title),
    NULLIF(trim(COALESCE(p_description, '')), ''),
    p_price,
    '{}'::jsonb
  )
  RETURNING id INTO v_listing_id;

  INSERT INTO public.portfolio_items (
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
  VALUES (
    v_portfolio_id,
    v_asset_id,
    v_listing_id,
    v_origin_id,
    v_user_id,
    'broker_direct',
    v_visibility,
    'active',
    true,
    v_user_id,
    '{}'::jsonb
  )
  RETURNING id INTO v_portfolio_item_id;

  RETURN jsonb_build_object(
    'portfolio_id', v_portfolio_id,
    'origin_id', v_origin_id,
    'asset_id', v_asset_id,
    'location_id', v_location_id,
    'features_id', v_features_id,
    'listing_id', v_listing_id,
    'portfolio_item_id', v_portfolio_item_id
  );
END;
$$;

REVOKE ALL ON FUNCTION public.create_property_operational_bundle(
  uuid,
  uuid,
  uuid,
  uuid,
  text,
  text,
  numeric,
  text,
  text
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.create_property_operational_bundle(
  uuid,
  uuid,
  uuid,
  uuid,
  text,
  text,
  numeric,
  text,
  text
) TO authenticated;

COMMENT ON FUNCTION public.create_property_operational_bundle(
  uuid,
  uuid,
  uuid,
  uuid,
  text,
  text,
  numeric,
  text,
  text
) IS
'Cria imóvel operacional completo dentro do Core Real Estate Foundation usando auth.uid() e transação do banco.';