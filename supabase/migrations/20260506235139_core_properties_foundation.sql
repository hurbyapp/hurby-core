-- =========================================
-- MÓDULO: CORE_PROPERTIES
-- CONTEXTO: FOUNDATION FASE 1
-- LOCAL: supabase/migrations
--
-- DESCRIÇÃO:
-- Fundação estrutural do módulo de imóveis.
--
-- O QUE ALTERA:
-- - property_status
-- - property_type
-- - properties
-- - property_features
-- - property_location
-- - property_media
--
-- O QUE NÃO ALTERAR:
-- - auth
-- - middleware
-- - wallet
-- - wallet_ledger
-- - users_profile
-- - LGPD
--
-- DEPENDÊNCIAS:
-- - users_profile
-- - auth.users
-- =========================================

CREATE TABLE IF NOT EXISTS public.property_status (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    name text NOT NULL UNIQUE,

    created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.property_status (name)
VALUES
    ('draft'),
    ('active'),
    ('paused'),
    ('negotiating'),
    ('sold')
ON CONFLICT (name) DO NOTHING;

-- =========================================
-- CORE_PROPERTIES
-- PASSO 5.5
-- TABELA: property_type
-- OBJETIVO:
-- catálogo oficial de tipos de imóvel
-- =========================================

CREATE TABLE IF NOT EXISTS public.property_type (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    name text NOT NULL UNIQUE,

    created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.property_type (name)
VALUES
    ('apartment'),
    ('house'),
    ('land'),
    ('commercial')
ON CONFLICT (name) DO NOTHING;

-- =========================================
-- CORE_PROPERTIES
-- PASSO 5.6
-- TABELA: properties
-- OBJETIVO:
-- núcleo estrutural dos imóveis
-- =========================================

CREATE TABLE IF NOT EXISTS public.properties (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    owner_id uuid NOT NULL,

    property_type_id uuid NOT NULL,

    property_status_id uuid NOT NULL,

    title text NOT NULL,

    description text,

    price numeric(14,2),

    is_public boolean NOT NULL DEFAULT false,

    created_at timestamptz NOT NULL DEFAULT now(),

    updated_at timestamptz NOT NULL DEFAULT now(),

    deleted_at timestamptz,

    CONSTRAINT fk_properties_owner
        FOREIGN KEY (owner_id)
        REFERENCES public.users_profile(id),

    CONSTRAINT fk_properties_type
        FOREIGN KEY (property_type_id)
        REFERENCES public.property_type(id),

    CONSTRAINT fk_properties_status
        FOREIGN KEY (property_status_id)
        REFERENCES public.property_status(id)
);

CREATE INDEX IF NOT EXISTS idx_properties_owner
ON public.properties(owner_id);

CREATE INDEX IF NOT EXISTS idx_properties_status
ON public.properties(property_status_id);

CREATE INDEX IF NOT EXISTS idx_properties_type
ON public.properties(property_type_id);

CREATE INDEX IF NOT EXISTS idx_properties_public
ON public.properties(is_public);

-- =========================================
-- CORE_PROPERTIES
-- PASSO 5.7
-- TABELA: property_features
-- OBJETIVO:
-- atributos estruturados dos imóveis
-- =========================================

CREATE TABLE IF NOT EXISTS public.property_features (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    property_id uuid NOT NULL UNIQUE,

    bedrooms integer,

    bathrooms integer,

    parking_spaces integer,

    total_area numeric(10,2),

    usable_area numeric(10,2),

    created_at timestamptz NOT NULL DEFAULT now(),

    updated_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT fk_property_features_property
        FOREIGN KEY (property_id)
        REFERENCES public.properties(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_property_features_property
ON public.property_features(property_id);

-- =========================================
-- CORE_PROPERTIES
-- PASSO 5.8
-- TABELA: property_location
-- OBJETIVO:
-- dados geográficos dos imóveis
-- =========================================

CREATE TABLE IF NOT EXISTS public.property_location (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    property_id uuid NOT NULL UNIQUE,

    city text NOT NULL,

    neighborhood text NOT NULL,

    state text NOT NULL,

    zipcode text,

    address text,

    latitude numeric(10,7),

    longitude numeric(10,7),

    created_at timestamptz NOT NULL DEFAULT now(),

    updated_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT fk_property_location_property
        FOREIGN KEY (property_id)
        REFERENCES public.properties(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_property_location_city
ON public.property_location(city);

CREATE INDEX IF NOT EXISTS idx_property_location_neighborhood
ON public.property_location(neighborhood);

CREATE INDEX IF NOT EXISTS idx_property_location_state
ON public.property_location(state);

CREATE INDEX IF NOT EXISTS idx_property_location_latitude
ON public.property_location(latitude);

CREATE INDEX IF NOT EXISTS idx_property_location_longitude
ON public.property_location(longitude);

-- =========================================
-- CORE_PROPERTIES
-- PASSO 5.9
-- TABELA: property_media
-- OBJETIVO:
-- mídias dos imóveis
-- =========================================

CREATE TABLE IF NOT EXISTS public.property_media (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    property_id uuid NOT NULL,

    media_type text NOT NULL,

    media_provider text NOT NULL,

    file_path text,

    external_url text,

    is_cover boolean NOT NULL DEFAULT false,

    sort_order integer NOT NULL DEFAULT 0,

    created_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT fk_property_media_property
        FOREIGN KEY (property_id)
        REFERENCES public.properties(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_property_media_property
ON public.property_media(property_id);

CREATE INDEX IF NOT EXISTS idx_property_media_cover
ON public.property_media(is_cover);

-- =========================================
-- CORE_PROPERTIES
-- PASSO 5.10
-- RLS
-- OBJETIVO:
-- proteção estrutural das tabelas
-- =========================================

ALTER TABLE public.properties
ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.property_features
ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.property_location
ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.property_media
ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.property_status
ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.property_type
ENABLE ROW LEVEL SECURITY;

-- =========================================
-- CORE_PROPERTIES
-- PASSO 5.11
-- RLS POLICIES
-- OBJETIVO:
-- políticas oficiais de acesso
-- =========================================

-- =====================================================
-- PROPERTIES
-- =====================================================

CREATE POLICY "properties_select_owner_or_public"
ON public.properties
FOR SELECT
USING (
    owner_id = auth.uid()
    OR (
        is_public = true
    )
);

CREATE POLICY "properties_insert_owner"
ON public.properties
FOR INSERT
WITH CHECK (
    owner_id = auth.uid()
);

CREATE POLICY "properties_update_owner"
ON public.properties
FOR UPDATE
USING (
    owner_id = auth.uid()
);

CREATE POLICY "properties_delete_owner"
ON public.properties
FOR DELETE
USING (
    owner_id = auth.uid()
);

-- =====================================================
-- PROPERTY_FEATURES
-- =====================================================

CREATE POLICY "property_features_select"
ON public.property_features
FOR SELECT
USING (
    EXISTS (
        SELECT 1
        FROM public.properties p
        WHERE p.id = property_features.property_id
        AND (
            p.owner_id = auth.uid()
            OR p.is_public = true
        )
    )
);

CREATE POLICY "property_features_insert"
ON public.property_features
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.properties p
        WHERE p.id = property_features.property_id
        AND p.owner_id = auth.uid()
    )
);

CREATE POLICY "property_features_update"
ON public.property_features
FOR UPDATE
USING (
    EXISTS (
        SELECT 1
        FROM public.properties p
        WHERE p.id = property_features.property_id
        AND p.owner_id = auth.uid()
    )
);

CREATE POLICY "property_features_delete"
ON public.property_features
FOR DELETE
USING (
    EXISTS (
        SELECT 1
        FROM public.properties p
        WHERE p.id = property_features.property_id
        AND p.owner_id = auth.uid()
    )
);

-- =====================================================
-- PROPERTY_LOCATION
-- =====================================================

CREATE POLICY "property_location_select"
ON public.property_location
FOR SELECT
USING (
    EXISTS (
        SELECT 1
        FROM public.properties p
        WHERE p.id = property_location.property_id
        AND (
            p.owner_id = auth.uid()
            OR p.is_public = true
        )
    )
);

CREATE POLICY "property_location_insert"
ON public.property_location
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.properties p
        WHERE p.id = property_location.property_id
        AND p.owner_id = auth.uid()
    )
);

CREATE POLICY "property_location_update"
ON public.property_location
FOR UPDATE
USING (
    EXISTS (
        SELECT 1
        FROM public.properties p
        WHERE p.id = property_location.property_id
        AND p.owner_id = auth.uid()
    )
);

CREATE POLICY "property_location_delete"
ON public.property_location
FOR DELETE
USING (
    EXISTS (
        SELECT 1
        FROM public.properties p
        WHERE p.id = property_location.property_id
        AND p.owner_id = auth.uid()
    )
);

-- =====================================================
-- PROPERTY_MEDIA
-- =====================================================

CREATE POLICY "property_media_select"
ON public.property_media
FOR SELECT
USING (
    EXISTS (
        SELECT 1
        FROM public.properties p
        WHERE p.id = property_media.property_id
        AND (
            p.owner_id = auth.uid()
            OR p.is_public = true
        )
    )
);

CREATE POLICY "property_media_insert"
ON public.property_media
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.properties p
        WHERE p.id = property_media.property_id
        AND p.owner_id = auth.uid()
    )
);

CREATE POLICY "property_media_update"
ON public.property_media
FOR UPDATE
USING (
    EXISTS (
        SELECT 1
        FROM public.properties p
        WHERE p.id = property_media.property_id
        AND p.owner_id = auth.uid()
    )
);

CREATE POLICY "property_media_delete"
ON public.property_media
FOR DELETE
USING (
    EXISTS (
        SELECT 1
        FROM public.properties p
        WHERE p.id = property_media.property_id
        AND p.owner_id = auth.uid()
    )
);

-- =====================================================
-- PROPERTY_STATUS
-- =====================================================

CREATE POLICY "property_status_public_read"
ON public.property_status
FOR SELECT
USING (true);

-- =====================================================
-- PROPERTY_TYPE
-- =====================================================

CREATE POLICY "property_type_public_read"
ON public.property_type
FOR SELECT
USING (true);

