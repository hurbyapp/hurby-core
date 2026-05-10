-- =========================================
-- HURBY
-- CORE_PROPERTIES V2 FOUNDATION
-- =========================================

-- =========================================
-- PROPERTY TYPE
-- =========================================

CREATE TABLE public.property_type (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug text UNIQUE NOT NULL,
    label text NOT NULL
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
('industrial', 'Industrial');

-- =========================================
-- PROPERTY BUSINESS CONTEXT
-- =========================================

CREATE TABLE public.property_business_context (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug text UNIQUE NOT NULL,
    label text NOT NULL
);

INSERT INTO public.property_business_context (slug, label)
VALUES
('sale', 'Venda'),
('rental', 'Locação'),
('seasonal', 'Temporada'),
('launch', 'Lançamento');

-- =========================================
-- OPERATIONAL MODEL
-- =========================================

CREATE TABLE public.operational_model (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug text UNIQUE NOT NULL,
    label text NOT NULL
);

INSERT INTO public.operational_model (slug, label)
VALUES
('transactional', 'Transacional'),
('managed', 'Gerenciado'),
('hybrid', 'Híbrido');

-- =========================================
-- LISTING STATUS
-- =========================================

CREATE TABLE public.listing_status (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug text UNIQUE NOT NULL,
    label text NOT NULL
);

INSERT INTO public.listing_status (slug, label)
VALUES
('draft', 'Rascunho'),
('published', 'Publicado'),
('paused', 'Pausado'),
('expired', 'Expirado'),
('closed', 'Encerrado'),
('deleted', 'Deletado');

-- =========================================
-- MEDIA TYPE
-- =========================================

CREATE TABLE public.media_type (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug text UNIQUE NOT NULL,
    label text NOT NULL
);

INSERT INTO public.media_type (slug, label)
VALUES
('image', 'Imagem'),
('video', 'Vídeo'),
('document', 'Documento');

-- =========================================
-- MEDIA PROVIDER
-- =========================================

CREATE TABLE public.media_provider (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug text UNIQUE NOT NULL,
    label text NOT NULL
);

INSERT INTO public.media_provider (slug, label)
VALUES
('supabase_storage', 'Supabase Storage'),
('youtube', 'YouTube'),
('vimeo', 'Vimeo'),
('external_url', 'URL Externa');

-- =========================================
-- PROPERTY ASSETS
-- =========================================

CREATE TABLE public.property_assets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    archived_at timestamptz,

    managed_by_profile_id uuid NOT NULL,

    landlord_name text,
    landlord_email text,
    landlord_phone text,

    property_type_id uuid NOT NULL,
    operational_model_id uuid NOT NULL,

    country text NOT NULL DEFAULT 'BR',

    is_active boolean NOT NULL DEFAULT true,

    CONSTRAINT fk_property_assets_profile
        FOREIGN KEY (managed_by_profile_id)
        REFERENCES public.users_profile(id),

    CONSTRAINT fk_property_assets_type
        FOREIGN KEY (property_type_id)
        REFERENCES public.property_type(id),

    CONSTRAINT fk_property_assets_operational_model
        FOREIGN KEY (operational_model_id)
        REFERENCES public.operational_model(id)
);

CREATE INDEX idx_property_assets_profile
ON public.property_assets(managed_by_profile_id);

-- =========================================
-- PROPERTY ASSET LOCATIONS
-- =========================================

CREATE TABLE public.property_asset_locations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    property_asset_id uuid NOT NULL UNIQUE,

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

    CONSTRAINT fk_property_asset_locations_asset
        FOREIGN KEY (property_asset_id)
        REFERENCES public.property_assets(id)
        ON DELETE CASCADE
);

-- =========================================
-- PROPERTY ASSET FEATURES
-- =========================================

CREATE TABLE public.property_asset_features (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    property_asset_id uuid NOT NULL UNIQUE,

    bedrooms integer,
    bathrooms integer,
    garage_spaces integer,

    private_area numeric,
    total_area numeric,

    built_year integer,
    floors integer,

    furnished boolean DEFAULT false,

    CONSTRAINT fk_property_asset_features_asset
        FOREIGN KEY (property_asset_id)
        REFERENCES public.property_assets(id)
        ON DELETE CASCADE
);

-- =========================================
-- PROPERTY LISTINGS
-- =========================================

CREATE TABLE public.property_listings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    deleted_at timestamptz,
    expires_at timestamptz,
    closed_at timestamptz,

    property_asset_id uuid NOT NULL,

    managed_by_profile_id uuid NOT NULL,

    property_business_context_id uuid NOT NULL,

    listing_status_id uuid NOT NULL,

    title text NOT NULL,
    description text,

    price numeric,

    is_public boolean NOT NULL DEFAULT false,

    published_at timestamptz,

    CONSTRAINT fk_property_listings_asset
        FOREIGN KEY (property_asset_id)
        REFERENCES public.property_assets(id),

    CONSTRAINT fk_property_listings_profile
        FOREIGN KEY (managed_by_profile_id)
        REFERENCES public.users_profile(id),

    CONSTRAINT fk_property_listings_business_context
        FOREIGN KEY (property_business_context_id)
        REFERENCES public.property_business_context(id),

    CONSTRAINT fk_property_listings_status
        FOREIGN KEY (listing_status_id)
        REFERENCES public.listing_status(id)
);

CREATE INDEX idx_property_listings_asset
ON public.property_listings(property_asset_id);

CREATE INDEX idx_property_listings_profile
ON public.property_listings(managed_by_profile_id);

CREATE INDEX idx_property_listings_public
ON public.property_listings(is_public);

-- =========================================
-- PROPERTY LISTING MEDIA
-- =========================================

CREATE TABLE public.property_listing_media (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    created_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz,

    property_listing_id uuid NOT NULL,

    storage_path text NOT NULL,

    media_type_id uuid NOT NULL,
    media_provider_id uuid NOT NULL,

    is_cover boolean NOT NULL DEFAULT false,

    sort_order integer DEFAULT 0,

    CONSTRAINT fk_property_listing_media_listing
        FOREIGN KEY (property_listing_id)
        REFERENCES public.property_listings(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_property_listing_media_type
        FOREIGN KEY (media_type_id)
        REFERENCES public.media_type(id),

    CONSTRAINT fk_property_listing_media_provider
        FOREIGN KEY (media_provider_id)
        REFERENCES public.media_provider(id)
);

CREATE INDEX idx_property_listing_media_listing
ON public.property_listing_media(property_listing_id);

-- =========================================
-- RLS
-- =========================================

ALTER TABLE public.property_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_asset_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_asset_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_listing_media ENABLE ROW LEVEL SECURITY;