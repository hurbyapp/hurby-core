-- =========================================
-- HURBY
-- CORE_PROPERTIES V2
-- RLS + STORAGE
-- =========================================

-- =========================================
-- STORAGE BUCKET
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
-- STORAGE RLS
-- =========================================

CREATE POLICY "property_media_select_authenticated"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'property-media'
);

CREATE POLICY "property_media_insert_authenticated"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'property-media'
);

CREATE POLICY "property_media_update_authenticated"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'property-media'
);

CREATE POLICY "property_media_delete_authenticated"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'property-media'
);

-- =========================================
-- PROPERTY ASSETS RLS
-- =========================================

CREATE POLICY "property_assets_select_owner"
ON public.property_assets
FOR SELECT
TO authenticated
USING (
    managed_by_profile_id = auth.uid()
);

CREATE POLICY "property_assets_insert_owner"
ON public.property_assets
FOR INSERT
TO authenticated
WITH CHECK (
    managed_by_profile_id = auth.uid()
);

CREATE POLICY "property_assets_update_owner"
ON public.property_assets
FOR UPDATE
TO authenticated
USING (
    managed_by_profile_id = auth.uid()
);

CREATE POLICY "property_assets_delete_owner"
ON public.property_assets
FOR DELETE
TO authenticated
USING (
    managed_by_profile_id = auth.uid()
);

-- =========================================
-- PROPERTY ASSET LOCATIONS RLS
-- =========================================

CREATE POLICY "property_asset_locations_select_owner"
ON public.property_asset_locations
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.property_assets pa
        WHERE pa.id = property_asset_id
        AND pa.managed_by_profile_id = auth.uid()
    )
);

CREATE POLICY "property_asset_locations_insert_owner"
ON public.property_asset_locations
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.property_assets pa
        WHERE pa.id = property_asset_id
        AND pa.managed_by_profile_id = auth.uid()
    )
);

CREATE POLICY "property_asset_locations_update_owner"
ON public.property_asset_locations
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.property_assets pa
        WHERE pa.id = property_asset_id
        AND pa.managed_by_profile_id = auth.uid()
    )
);

CREATE POLICY "property_asset_locations_delete_owner"
ON public.property_asset_locations
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.property_assets pa
        WHERE pa.id = property_asset_id
        AND pa.managed_by_profile_id = auth.uid()
    )
);

-- =========================================
-- PROPERTY ASSET FEATURES RLS
-- =========================================

CREATE POLICY "property_asset_features_select_owner"
ON public.property_asset_features
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.property_assets pa
        WHERE pa.id = property_asset_id
        AND pa.managed_by_profile_id = auth.uid()
    )
);

CREATE POLICY "property_asset_features_insert_owner"
ON public.property_asset_features
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.property_assets pa
        WHERE pa.id = property_asset_id
        AND pa.managed_by_profile_id = auth.uid()
    )
);

CREATE POLICY "property_asset_features_update_owner"
ON public.property_asset_features
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.property_assets pa
        WHERE pa.id = property_asset_id
        AND pa.managed_by_profile_id = auth.uid()
    )
);

CREATE POLICY "property_asset_features_delete_owner"
ON public.property_asset_features
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.property_assets pa
        WHERE pa.id = property_asset_id
        AND pa.managed_by_profile_id = auth.uid()
    )
);

-- =========================================
-- PROPERTY LISTINGS RLS
-- =========================================

CREATE POLICY "property_listings_select_owner_or_public"
ON public.property_listings
FOR SELECT
TO authenticated
USING (
    managed_by_profile_id = auth.uid()
    OR is_public = true
);

CREATE POLICY "property_listings_insert_owner"
ON public.property_listings
FOR INSERT
TO authenticated
WITH CHECK (
    managed_by_profile_id = auth.uid()
);

CREATE POLICY "property_listings_update_owner"
ON public.property_listings
FOR UPDATE
TO authenticated
USING (
    managed_by_profile_id = auth.uid()
);

CREATE POLICY "property_listings_delete_owner"
ON public.property_listings
FOR DELETE
TO authenticated
USING (
    managed_by_profile_id = auth.uid()
);

-- =========================================
-- PROPERTY LISTING MEDIA RLS
-- =========================================

CREATE POLICY "property_listing_media_select_owner_or_public"
ON public.property_listing_media
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.property_listings pl
        WHERE pl.id = property_listing_id
        AND (
            pl.managed_by_profile_id = auth.uid()
            OR pl.is_public = true
        )
    )
);

CREATE POLICY "property_listing_media_insert_owner"
ON public.property_listing_media
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.property_listings pl
        WHERE pl.id = property_listing_id
        AND pl.managed_by_profile_id = auth.uid()
    )
);

CREATE POLICY "property_listing_media_update_owner"
ON public.property_listing_media
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.property_listings pl
        WHERE pl.id = property_listing_id
        AND pl.managed_by_profile_id = auth.uid()
    )
);

CREATE POLICY "property_listing_media_delete_owner"
ON public.property_listing_media
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.property_listings pl
        WHERE pl.id = property_listing_id
        AND pl.managed_by_profile_id = auth.uid()
    )
);