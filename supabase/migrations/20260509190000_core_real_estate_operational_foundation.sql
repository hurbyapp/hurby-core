-- =========================================
-- MÓDULO: CORE_REAL_ESTATE_OPERATIONAL_FOUNDATION
-- CONTEXTO: CORE PORTFOLIO + CORE PROPERTIES + ORIGINS + VISIBILITY
-- LOCAL: supabase/migrations/20260509190000_core_real_estate_operational_foundation.sql
--
-- DESCRIÇÃO:
-- Cria a nova fundação operacional imobiliária do HURBY após o realinhamento conceitual.
--
-- Esta migration substitui a foundation antiga de properties/leads arquivada no realinhamento.
--
-- O QUE ALTERA:
-- - cria enums operacionais de portfolio, origem e visibilidade
-- - cria catálogos base de imóveis
-- - cria portfolios
-- - cria operational_origins
-- - cria property_assets
-- - cria property_asset_locations
-- - cria property_asset_features
-- - cria property_listings
-- - cria portfolio_items
-- - cria property_listing_media
-- - cria bucket property-media
-- - cria funções auxiliares de permissão
-- - cria RLS foundation
--
-- O QUE NÃO ALTERAR:
-- - não altera auth.users
-- - não altera users_profile
-- - não altera organizations
-- - não altera organization_memberships
-- - não altera ledger
-- - não altera wallet
-- - não altera LGPD foundation
-- - não cria leads
-- - não cria marketplace
-- - não cria contratos
-- - não cria gestão de locação
--
-- DEPENDÊNCIAS:
-- - public.users_profile
-- - public.organizations
-- - public.organization_memberships
-- - storage.buckets
-- =========================================

-- =========================================
-- 1. ENUMS | PORTFOLIO
-- =========================================

DO $$
BEGIN
  CREATE TYPE public.portfolio_type_enum AS ENUM (
    'individual',
    'institutional',
    'shared',
    'marketplace',
    'system'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE public.portfolio_status_enum AS ENUM (
    'active',
    'suspended',
    'archived'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE public.portfolio_item_status_enum AS ENUM (
    'active',
    'paused',
    'removed',
    'archived'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =========================================
-- 2. ENUMS | VISIBILITY + ORIGIN
-- =========================================

DO $$
BEGIN
  CREATE TYPE public.visibility_scope_enum AS ENUM (
    'private',
    'institutional',
    'shared',
    'public',
    'marketplace'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE public.origin_type_enum AS ENUM (
    'broker_direct',
    'agency_direct',
    'partnership',
    'marketplace',
    'imported',
    'system_absorbed'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =========================================
-- 3. CATÁLOGOS | PROPERTY
-- =========================================

CREATE TABLE IF NOT EXISTS public.property_type (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  label text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.property_type (slug, label)
VALUES
  ('house', 'Casa'),
  ('condominium_house', 'Casa em Condomínio'),
  ('apartment', 'Apartamento'),
  ('kitnet', 'Kitnet'),
  ('land', 'Terreno'),
  ('farm', 'Fazenda'),
  ('warehouse', 'Galpão'),
  ('office', 'Escritório'),
  ('storefront', 'Loja'),
  ('industrial', 'Industrial')
ON CONFLICT (slug) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.property_business_context (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  label text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.property_business_context (slug, label)
VALUES
  ('sale', 'Venda'),
  ('rental', 'Locação'),
  ('seasonal', 'Temporada'),
  ('launch', 'Lançamento')
ON CONFLICT (slug) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.operational_model (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  label text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.operational_model (slug, label)
VALUES
  ('transactional', 'Transacional'),
  ('managed', 'Gerenciado'),
  ('hybrid', 'Híbrido')
ON CONFLICT (slug) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.listing_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  label text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.listing_status (slug, label)
VALUES
  ('draft', 'Rascunho'),
  ('published', 'Publicado'),
  ('paused', 'Pausado'),
  ('expired', 'Expirado'),
  ('closed', 'Encerrado'),
  ('deleted', 'Deletado')
ON CONFLICT (slug) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.media_type (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  label text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.media_type (slug, label)
VALUES
  ('image', 'Imagem'),
  ('video', 'Vídeo'),
  ('document', 'Documento')
ON CONFLICT (slug) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.media_provider (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  label text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.media_provider (slug, label)
VALUES
  ('supabase_storage', 'Supabase Storage'),
  ('youtube', 'YouTube'),
  ('vimeo', 'Vimeo'),
  ('external_url', 'URL Externa')
ON CONFLICT (slug) DO NOTHING;

-- =========================================
-- 4. UPDATED_AT HELPER
-- =========================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =========================================
-- 5. PORTFOLIOS
-- =========================================

CREATE TABLE IF NOT EXISTS public.portfolios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  portfolio_type public.portfolio_type_enum NOT NULL,
  portfolio_status public.portfolio_status_enum NOT NULL DEFAULT 'active',

  profile_id uuid REFERENCES public.users_profile(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  membership_id uuid REFERENCES public.organization_memberships(id) ON DELETE SET NULL,

  name text NOT NULL,
  description text,

  created_by_profile_id uuid NOT NULL REFERENCES public.users_profile(id),

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,

  CONSTRAINT portfolios_owner_context_check
  CHECK (
    (
      portfolio_type = 'individual'
      AND profile_id IS NOT NULL
      AND organization_id IS NULL
    )
    OR
    (
      portfolio_type = 'institutional'
      AND organization_id IS NOT NULL
    )
    OR
    (
      portfolio_type IN ('shared', 'marketplace', 'system')
    )
  )
);

CREATE INDEX IF NOT EXISTS idx_portfolios_profile
ON public.portfolios(profile_id);

CREATE INDEX IF NOT EXISTS idx_portfolios_organization
ON public.portfolios(organization_id);

CREATE INDEX IF NOT EXISTS idx_portfolios_membership
ON public.portfolios(membership_id);

CREATE INDEX IF NOT EXISTS idx_portfolios_type_status
ON public.portfolios(portfolio_type, portfolio_status);

DROP TRIGGER IF EXISTS set_portfolios_updated_at ON public.portfolios;

CREATE TRIGGER set_portfolios_updated_at
BEFORE UPDATE ON public.portfolios
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- =========================================
-- 6. OPERATIONAL ORIGINS
-- =========================================

CREATE TABLE IF NOT EXISTS public.operational_origins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  origin_type public.origin_type_enum NOT NULL,

  source_profile_id uuid REFERENCES public.users_profile(id) ON DELETE SET NULL,
  source_organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  source_membership_id uuid REFERENCES public.organization_memberships(id) ON DELETE SET NULL,

  description text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,

  created_by_profile_id uuid REFERENCES public.users_profile(id) ON DELETE SET NULL,

  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_operational_origins_type
ON public.operational_origins(origin_type);

CREATE INDEX IF NOT EXISTS idx_operational_origins_profile
ON public.operational_origins(source_profile_id);

CREATE INDEX IF NOT EXISTS idx_operational_origins_organization
ON public.operational_origins(source_organization_id);

-- =========================================
-- 7. PROPERTY ASSETS
-- =========================================

CREATE TABLE IF NOT EXISTS public.property_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,

  created_by_profile_id uuid NOT NULL REFERENCES public.users_profile(id),
  current_responsible_profile_id uuid NOT NULL REFERENCES public.users_profile(id),

  operational_origin_id uuid REFERENCES public.operational_origins(id) ON DELETE SET NULL,

  property_type_id uuid NOT NULL REFERENCES public.property_type(id),
  operational_model_id uuid NOT NULL REFERENCES public.operational_model(id),

  country text NOT NULL DEFAULT 'BR',

  is_active boolean NOT NULL DEFAULT true,

  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_property_assets_created_by
ON public.property_assets(created_by_profile_id);

CREATE INDEX IF NOT EXISTS idx_property_assets_responsible
ON public.property_assets(current_responsible_profile_id);

CREATE INDEX IF NOT EXISTS idx_property_assets_origin
ON public.property_assets(operational_origin_id);

CREATE INDEX IF NOT EXISTS idx_property_assets_type
ON public.property_assets(property_type_id);

DROP TRIGGER IF EXISTS set_property_assets_updated_at ON public.property_assets;

CREATE TRIGGER set_property_assets_updated_at
BEFORE UPDATE ON public.property_assets
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- =========================================
-- 8. PROPERTY ASSET LOCATIONS
-- =========================================

CREATE TABLE IF NOT EXISTS public.property_asset_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  property_asset_id uuid NOT NULL UNIQUE
    REFERENCES public.property_assets(id)
    ON DELETE CASCADE,

  zipcode text,
  state text,
  city text,
  neighborhood text,
  street text,
  number text,
  complement text,

  latitude numeric,
  longitude numeric,

  country text NOT NULL DEFAULT 'BR',

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_property_asset_locations_asset
ON public.property_asset_locations(property_asset_id);

CREATE INDEX IF NOT EXISTS idx_property_asset_locations_city_state
ON public.property_asset_locations(city, state);

DROP TRIGGER IF EXISTS set_property_asset_locations_updated_at ON public.property_asset_locations;

CREATE TRIGGER set_property_asset_locations_updated_at
BEFORE UPDATE ON public.property_asset_locations
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- =========================================
-- 9. PROPERTY ASSET FEATURES
-- =========================================

CREATE TABLE IF NOT EXISTS public.property_asset_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  property_asset_id uuid NOT NULL UNIQUE
    REFERENCES public.property_assets(id)
    ON DELETE CASCADE,

  bedrooms integer,
  bathrooms integer,
  garage_spaces integer,

  private_area numeric,
  total_area numeric,

  built_year integer,
  floors integer,

  furnished boolean NOT NULL DEFAULT false,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_property_asset_features_asset
ON public.property_asset_features(property_asset_id);

DROP TRIGGER IF EXISTS set_property_asset_features_updated_at ON public.property_asset_features;

CREATE TRIGGER set_property_asset_features_updated_at
BEFORE UPDATE ON public.property_asset_features
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- =========================================
-- 10. PROPERTY LISTINGS
-- =========================================

CREATE TABLE IF NOT EXISTS public.property_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  deleted_at timestamptz,
  expires_at timestamptz,
  closed_at timestamptz,

  property_asset_id uuid NOT NULL
    REFERENCES public.property_assets(id)
    ON DELETE CASCADE,

  created_by_profile_id uuid NOT NULL REFERENCES public.users_profile(id),
  responsible_profile_id uuid NOT NULL REFERENCES public.users_profile(id),

  property_business_context_id uuid NOT NULL REFERENCES public.property_business_context(id),
  listing_status_id uuid NOT NULL REFERENCES public.listing_status(id),

  visibility_scope public.visibility_scope_enum NOT NULL DEFAULT 'private',

  title text NOT NULL,
  description text,

  price numeric,

  published_at timestamptz,

  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_property_listings_asset
ON public.property_listings(property_asset_id);

CREATE INDEX IF NOT EXISTS idx_property_listings_created_by
ON public.property_listings(created_by_profile_id);

CREATE INDEX IF NOT EXISTS idx_property_listings_responsible
ON public.property_listings(responsible_profile_id);

CREATE INDEX IF NOT EXISTS idx_property_listings_visibility
ON public.property_listings(visibility_scope);

CREATE INDEX IF NOT EXISTS idx_property_listings_status
ON public.property_listings(listing_status_id);

DROP TRIGGER IF EXISTS set_property_listings_updated_at ON public.property_listings;

CREATE TRIGGER set_property_listings_updated_at
BEFORE UPDATE ON public.property_listings
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- =========================================
-- 11. PORTFOLIO ITEMS
-- =========================================

CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  portfolio_id uuid NOT NULL
    REFERENCES public.portfolios(id)
    ON DELETE CASCADE,

  property_asset_id uuid NOT NULL
    REFERENCES public.property_assets(id)
    ON DELETE CASCADE,

  property_listing_id uuid
    REFERENCES public.property_listings(id)
    ON DELETE CASCADE,

  operational_origin_id uuid
    REFERENCES public.operational_origins(id)
    ON DELETE SET NULL,

  responsible_profile_id uuid NOT NULL
    REFERENCES public.users_profile(id),

  origin_type public.origin_type_enum NOT NULL DEFAULT 'broker_direct',
  visibility_scope public.visibility_scope_enum NOT NULL DEFAULT 'private',
  item_status public.portfolio_item_status_enum NOT NULL DEFAULT 'active',

  is_primary boolean NOT NULL DEFAULT false,

  created_by_profile_id uuid NOT NULL
    REFERENCES public.users_profile(id),

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  removed_at timestamptz,

  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_portfolio_items_portfolio
ON public.portfolio_items(portfolio_id);

CREATE INDEX IF NOT EXISTS idx_portfolio_items_asset
ON public.portfolio_items(property_asset_id);

CREATE INDEX IF NOT EXISTS idx_portfolio_items_listing
ON public.portfolio_items(property_listing_id);

CREATE INDEX IF NOT EXISTS idx_portfolio_items_responsible
ON public.portfolio_items(responsible_profile_id);

CREATE INDEX IF NOT EXISTS idx_portfolio_items_visibility
ON public.portfolio_items(visibility_scope);

CREATE UNIQUE INDEX IF NOT EXISTS ux_portfolio_items_asset_without_listing
ON public.portfolio_items(portfolio_id, property_asset_id)
WHERE property_listing_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ux_portfolio_items_asset_listing
ON public.portfolio_items(portfolio_id, property_asset_id, property_listing_id)
WHERE property_listing_id IS NOT NULL;

DROP TRIGGER IF EXISTS set_portfolio_items_updated_at ON public.portfolio_items;

CREATE TRIGGER set_portfolio_items_updated_at
BEFORE UPDATE ON public.portfolio_items
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- =========================================
-- 12. PROPERTY LISTING MEDIA
-- =========================================

CREATE TABLE IF NOT EXISTS public.property_listing_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,

  property_listing_id uuid NOT NULL
    REFERENCES public.property_listings(id)
    ON DELETE CASCADE,

  storage_path text NOT NULL,

  media_type_id uuid NOT NULL REFERENCES public.media_type(id),
  media_provider_id uuid NOT NULL REFERENCES public.media_provider(id),

  is_cover boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,

  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_property_listing_media_listing
ON public.property_listing_media(property_listing_id);

CREATE INDEX IF NOT EXISTS idx_property_listing_media_cover
ON public.property_listing_media(property_listing_id, is_cover);

DROP TRIGGER IF EXISTS set_property_listing_media_updated_at ON public.property_listing_media;

CREATE TRIGGER set_property_listing_media_updated_at
BEFORE UPDATE ON public.property_listing_media
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- =========================================
-- 13. PERMISSION HELPERS
-- =========================================

CREATE OR REPLACE FUNCTION public.is_uuid(p_value text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  PERFORM p_value::uuid;
  RETURN true;
EXCEPTION WHEN others THEN
  RETURN false;
END;
$$;

CREATE OR REPLACE FUNCTION public.can_access_portfolio(p_portfolio_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.portfolios p
    WHERE p.id = p_portfolio_id
      AND p.portfolio_status = 'active'
      AND (
        p.profile_id = auth.uid()
        OR p.created_by_profile_id = auth.uid()
        OR EXISTS (
          SELECT 1
          FROM public.organization_memberships om
          WHERE om.organization_id = p.organization_id
            AND om.profile_id = auth.uid()
            AND om.membership_status = 'active'
        )
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.can_manage_portfolio(p_portfolio_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.portfolios p
    WHERE p.id = p_portfolio_id
      AND p.portfolio_status = 'active'
      AND (
        p.profile_id = auth.uid()
        OR p.created_by_profile_id = auth.uid()
        OR EXISTS (
          SELECT 1
          FROM public.organization_memberships om
          WHERE om.organization_id = p.organization_id
            AND om.profile_id = auth.uid()
            AND om.membership_status = 'active'
            AND om.membership_role IN ('owner', 'manager')
        )
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.can_access_asset(p_property_asset_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.property_assets pa
    WHERE pa.id = p_property_asset_id
      AND (
        pa.created_by_profile_id = auth.uid()
        OR pa.current_responsible_profile_id = auth.uid()
        OR EXISTS (
          SELECT 1
          FROM public.portfolio_items pi
          WHERE pi.property_asset_id = pa.id
            AND pi.item_status = 'active'
            AND (
              pi.visibility_scope IN ('public', 'marketplace')
              OR public.can_access_portfolio(pi.portfolio_id)
            )
        )
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.can_manage_asset(p_property_asset_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.property_assets pa
    WHERE pa.id = p_property_asset_id
      AND (
        pa.created_by_profile_id = auth.uid()
        OR pa.current_responsible_profile_id = auth.uid()
        OR EXISTS (
          SELECT 1
          FROM public.portfolio_items pi
          WHERE pi.property_asset_id = pa.id
            AND pi.item_status = 'active'
            AND public.can_manage_portfolio(pi.portfolio_id)
        )
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.can_access_listing(p_property_listing_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.property_listings pl
    WHERE pl.id = p_property_listing_id
      AND (
        pl.created_by_profile_id = auth.uid()
        OR pl.responsible_profile_id = auth.uid()
        OR pl.visibility_scope IN ('public', 'marketplace')
        OR EXISTS (
          SELECT 1
          FROM public.portfolio_items pi
          WHERE pi.property_listing_id = pl.id
            AND pi.item_status = 'active'
            AND (
              pi.visibility_scope IN ('public', 'marketplace')
              OR public.can_access_portfolio(pi.portfolio_id)
            )
        )
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.can_manage_listing(p_property_listing_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.property_listings pl
    WHERE pl.id = p_property_listing_id
      AND (
        pl.created_by_profile_id = auth.uid()
        OR pl.responsible_profile_id = auth.uid()
        OR EXISTS (
          SELECT 1
          FROM public.portfolio_items pi
          WHERE pi.property_listing_id = pl.id
            AND pi.item_status = 'active'
            AND public.can_manage_portfolio(pi.portfolio_id)
        )
      )
  );
$$;

-- =========================================
-- 14. STORAGE BUCKET
-- =========================================

INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES (
  'property-media',
  'property-media',
  false,
  3145728,
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- 15. ENABLE RLS
-- =========================================

ALTER TABLE public.property_type ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_business_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operational_model ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_type ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_provider ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operational_origins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_asset_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_asset_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_listing_media ENABLE ROW LEVEL SECURITY;

-- =========================================
-- 16. RLS | LOOKUPS
-- =========================================

DROP POLICY IF EXISTS lookup_property_type_select ON public.property_type;
CREATE POLICY lookup_property_type_select
ON public.property_type
FOR SELECT
TO authenticated
USING (is_active = true);

DROP POLICY IF EXISTS lookup_property_business_context_select ON public.property_business_context;
CREATE POLICY lookup_property_business_context_select
ON public.property_business_context
FOR SELECT
TO authenticated
USING (is_active = true);

DROP POLICY IF EXISTS lookup_operational_model_select ON public.operational_model;
CREATE POLICY lookup_operational_model_select
ON public.operational_model
FOR SELECT
TO authenticated
USING (is_active = true);

DROP POLICY IF EXISTS lookup_listing_status_select ON public.listing_status;
CREATE POLICY lookup_listing_status_select
ON public.listing_status
FOR SELECT
TO authenticated
USING (is_active = true);

DROP POLICY IF EXISTS lookup_media_type_select ON public.media_type;
CREATE POLICY lookup_media_type_select
ON public.media_type
FOR SELECT
TO authenticated
USING (is_active = true);

DROP POLICY IF EXISTS lookup_media_provider_select ON public.media_provider;
CREATE POLICY lookup_media_provider_select
ON public.media_provider
FOR SELECT
TO authenticated
USING (is_active = true);

-- =========================================
-- 17. RLS | PORTFOLIOS
-- =========================================

DROP POLICY IF EXISTS portfolios_select_context ON public.portfolios;
CREATE POLICY portfolios_select_context
ON public.portfolios
FOR SELECT
TO authenticated
USING (
  public.can_access_portfolio(id)
);

DROP POLICY IF EXISTS portfolios_insert_context ON public.portfolios;
CREATE POLICY portfolios_insert_context
ON public.portfolios
FOR INSERT
TO authenticated
WITH CHECK (
  created_by_profile_id = auth.uid()
  AND (
    (
      portfolio_type = 'individual'
      AND profile_id = auth.uid()
      AND organization_id IS NULL
    )
    OR
    (
      portfolio_type = 'institutional'
      AND organization_id IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM public.organization_memberships om
        WHERE om.organization_id = organization_id
          AND om.profile_id = auth.uid()
          AND om.membership_status = 'active'
          AND om.membership_role IN ('owner', 'manager')
      )
    )
  )
);

DROP POLICY IF EXISTS portfolios_update_context ON public.portfolios;
CREATE POLICY portfolios_update_context
ON public.portfolios
FOR UPDATE
TO authenticated
USING (
  public.can_manage_portfolio(id)
)
WITH CHECK (
  public.can_manage_portfolio(id)
);

DROP POLICY IF EXISTS portfolios_delete_context ON public.portfolios;
CREATE POLICY portfolios_delete_context
ON public.portfolios
FOR DELETE
TO authenticated
USING (
  public.can_manage_portfolio(id)
);

-- =========================================
-- 18. RLS | OPERATIONAL ORIGINS
-- =========================================

DROP POLICY IF EXISTS operational_origins_select_context ON public.operational_origins;
CREATE POLICY operational_origins_select_context
ON public.operational_origins
FOR SELECT
TO authenticated
USING (
  source_profile_id = auth.uid()
  OR created_by_profile_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM public.organization_memberships om
    WHERE om.organization_id = source_organization_id
      AND om.profile_id = auth.uid()
      AND om.membership_status = 'active'
  )
);

DROP POLICY IF EXISTS operational_origins_insert_context ON public.operational_origins;
CREATE POLICY operational_origins_insert_context
ON public.operational_origins
FOR INSERT
TO authenticated
WITH CHECK (
  created_by_profile_id = auth.uid()
  OR source_profile_id = auth.uid()
);

-- =========================================
-- 19. RLS | PROPERTY ASSETS
-- =========================================

DROP POLICY IF EXISTS property_assets_select_context ON public.property_assets;
CREATE POLICY property_assets_select_context
ON public.property_assets
FOR SELECT
TO authenticated
USING (
  public.can_access_asset(id)
);

DROP POLICY IF EXISTS property_assets_insert_context ON public.property_assets;
CREATE POLICY property_assets_insert_context
ON public.property_assets
FOR INSERT
TO authenticated
WITH CHECK (
  created_by_profile_id = auth.uid()
  AND current_responsible_profile_id = auth.uid()
);

DROP POLICY IF EXISTS property_assets_update_context ON public.property_assets;
CREATE POLICY property_assets_update_context
ON public.property_assets
FOR UPDATE
TO authenticated
USING (
  public.can_manage_asset(id)
)
WITH CHECK (
  public.can_manage_asset(id)
);

DROP POLICY IF EXISTS property_assets_delete_context ON public.property_assets;
CREATE POLICY property_assets_delete_context
ON public.property_assets
FOR DELETE
TO authenticated
USING (
  public.can_manage_asset(id)
);

-- =========================================
-- 20. RLS | PROPERTY ASSET LOCATIONS
-- =========================================

DROP POLICY IF EXISTS property_asset_locations_select_context ON public.property_asset_locations;
CREATE POLICY property_asset_locations_select_context
ON public.property_asset_locations
FOR SELECT
TO authenticated
USING (
  public.can_access_asset(property_asset_id)
);

DROP POLICY IF EXISTS property_asset_locations_insert_context ON public.property_asset_locations;
CREATE POLICY property_asset_locations_insert_context
ON public.property_asset_locations
FOR INSERT
TO authenticated
WITH CHECK (
  public.can_manage_asset(property_asset_id)
);

DROP POLICY IF EXISTS property_asset_locations_update_context ON public.property_asset_locations;
CREATE POLICY property_asset_locations_update_context
ON public.property_asset_locations
FOR UPDATE
TO authenticated
USING (
  public.can_manage_asset(property_asset_id)
)
WITH CHECK (
  public.can_manage_asset(property_asset_id)
);

DROP POLICY IF EXISTS property_asset_locations_delete_context ON public.property_asset_locations;
CREATE POLICY property_asset_locations_delete_context
ON public.property_asset_locations
FOR DELETE
TO authenticated
USING (
  public.can_manage_asset(property_asset_id)
);

-- =========================================
-- 21. RLS | PROPERTY ASSET FEATURES
-- =========================================

DROP POLICY IF EXISTS property_asset_features_select_context ON public.property_asset_features;
CREATE POLICY property_asset_features_select_context
ON public.property_asset_features
FOR SELECT
TO authenticated
USING (
  public.can_access_asset(property_asset_id)
);

DROP POLICY IF EXISTS property_asset_features_insert_context ON public.property_asset_features;
CREATE POLICY property_asset_features_insert_context
ON public.property_asset_features
FOR INSERT
TO authenticated
WITH CHECK (
  public.can_manage_asset(property_asset_id)
);

DROP POLICY IF EXISTS property_asset_features_update_context ON public.property_asset_features;
CREATE POLICY property_asset_features_update_context
ON public.property_asset_features
FOR UPDATE
TO authenticated
USING (
  public.can_manage_asset(property_asset_id)
)
WITH CHECK (
  public.can_manage_asset(property_asset_id)
);

DROP POLICY IF EXISTS property_asset_features_delete_context ON public.property_asset_features;
CREATE POLICY property_asset_features_delete_context
ON public.property_asset_features
FOR DELETE
TO authenticated
USING (
  public.can_manage_asset(property_asset_id)
);

-- =========================================
-- 22. RLS | PROPERTY LISTINGS
-- =========================================

DROP POLICY IF EXISTS property_listings_select_context ON public.property_listings;
CREATE POLICY property_listings_select_context
ON public.property_listings
FOR SELECT
TO authenticated
USING (
  public.can_access_listing(id)
);

DROP POLICY IF EXISTS property_listings_insert_context ON public.property_listings;
CREATE POLICY property_listings_insert_context
ON public.property_listings
FOR INSERT
TO authenticated
WITH CHECK (
  created_by_profile_id = auth.uid()
  AND responsible_profile_id = auth.uid()
  AND public.can_manage_asset(property_asset_id)
);

DROP POLICY IF EXISTS property_listings_update_context ON public.property_listings;
CREATE POLICY property_listings_update_context
ON public.property_listings
FOR UPDATE
TO authenticated
USING (
  public.can_manage_listing(id)
)
WITH CHECK (
  public.can_manage_listing(id)
);

DROP POLICY IF EXISTS property_listings_delete_context ON public.property_listings;
CREATE POLICY property_listings_delete_context
ON public.property_listings
FOR DELETE
TO authenticated
USING (
  public.can_manage_listing(id)
);

-- =========================================
-- 23. RLS | PORTFOLIO ITEMS
-- =========================================

DROP POLICY IF EXISTS portfolio_items_select_context ON public.portfolio_items;
CREATE POLICY portfolio_items_select_context
ON public.portfolio_items
FOR SELECT
TO authenticated
USING (
  public.can_access_portfolio(portfolio_id)
  OR visibility_scope IN ('public', 'marketplace')
);

DROP POLICY IF EXISTS portfolio_items_insert_context ON public.portfolio_items;
CREATE POLICY portfolio_items_insert_context
ON public.portfolio_items
FOR INSERT
TO authenticated
WITH CHECK (
  created_by_profile_id = auth.uid()
  AND public.can_manage_portfolio(portfolio_id)
  AND public.can_manage_asset(property_asset_id)
  AND (
    property_listing_id IS NULL
    OR public.can_manage_listing(property_listing_id)
  )
);

DROP POLICY IF EXISTS portfolio_items_update_context ON public.portfolio_items;
CREATE POLICY portfolio_items_update_context
ON public.portfolio_items
FOR UPDATE
TO authenticated
USING (
  public.can_manage_portfolio(portfolio_id)
)
WITH CHECK (
  public.can_manage_portfolio(portfolio_id)
);

DROP POLICY IF EXISTS portfolio_items_delete_context ON public.portfolio_items;
CREATE POLICY portfolio_items_delete_context
ON public.portfolio_items
FOR DELETE
TO authenticated
USING (
  public.can_manage_portfolio(portfolio_id)
);

-- =========================================
-- 24. RLS | PROPERTY LISTING MEDIA
-- =========================================

DROP POLICY IF EXISTS property_listing_media_select_context ON public.property_listing_media;
CREATE POLICY property_listing_media_select_context
ON public.property_listing_media
FOR SELECT
TO authenticated
USING (
  public.can_access_listing(property_listing_id)
);

DROP POLICY IF EXISTS property_listing_media_insert_context ON public.property_listing_media;
CREATE POLICY property_listing_media_insert_context
ON public.property_listing_media
FOR INSERT
TO authenticated
WITH CHECK (
  public.can_manage_listing(property_listing_id)
);

DROP POLICY IF EXISTS property_listing_media_update_context ON public.property_listing_media;
CREATE POLICY property_listing_media_update_context
ON public.property_listing_media
FOR UPDATE
TO authenticated
USING (
  public.can_manage_listing(property_listing_id)
)
WITH CHECK (
  public.can_manage_listing(property_listing_id)
);

DROP POLICY IF EXISTS property_listing_media_delete_context ON public.property_listing_media;
CREATE POLICY property_listing_media_delete_context
ON public.property_listing_media
FOR DELETE
TO authenticated
USING (
  public.can_manage_listing(property_listing_id)
);

-- =========================================
-- 25. STORAGE RLS | PROPERTY MEDIA
-- =========================================

DROP POLICY IF EXISTS property_media_select_context ON storage.objects;
CREATE POLICY property_media_select_context
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'property-media'
  AND public.is_uuid((storage.foldername(name))[1])
  AND public.can_access_listing(((storage.foldername(name))[1])::uuid)
);

DROP POLICY IF EXISTS property_media_insert_context ON storage.objects;
CREATE POLICY property_media_insert_context
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'property-media'
  AND public.is_uuid((storage.foldername(name))[1])
  AND public.can_manage_listing(((storage.foldername(name))[1])::uuid)
);

DROP POLICY IF EXISTS property_media_update_context ON storage.objects;
CREATE POLICY property_media_update_context
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'property-media'
  AND public.is_uuid((storage.foldername(name))[1])
  AND public.can_manage_listing(((storage.foldername(name))[1])::uuid)
);

DROP POLICY IF EXISTS property_media_delete_context ON storage.objects;
CREATE POLICY property_media_delete_context
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'property-media'
  AND public.is_uuid((storage.foldername(name))[1])
  AND public.can_manage_listing(((storage.foldername(name))[1])::uuid)
);

-- =========================================
-- 26. COMENTÁRIOS ARQUITETURAIS
-- =========================================

COMMENT ON TABLE public.portfolios IS
'Carteira operacional contextual do HURBY. Não representa pasta simples nem ownership jurídico absoluto.';

COMMENT ON TABLE public.portfolio_items IS
'Vínculo entre uma carteira operacional e um ativo/listing imobiliário. Representa contexto, origem, responsabilidade e visibilidade.';

COMMENT ON TABLE public.property_assets IS
'Ativo imobiliário operacional. Não representa ownership jurídico absoluto do imóvel físico.';

COMMENT ON TABLE public.property_listings IS
'Manifestação comercial/publicitária de um ativo imobiliário dentro de um contexto operacional.';

COMMENT ON TABLE public.operational_origins IS
'Registro foundation de origem operacional para ativos, carteiras e futuras relações de lead, marketplace e parcerias.';

COMMENT ON COLUMN public.portfolio_items.visibility_scope IS
'Define o escopo inicial de visibilidade do item dentro da carteira operacional. Sharing real será tratado em core futuro.';

COMMENT ON COLUMN public.portfolio_items.origin_type IS
'Define origem operacional inicial do item. Não substitui auditoria completa nem comissão futura.';

-- =========================================
-- FIM DA MIGRATION
-- =========================================
