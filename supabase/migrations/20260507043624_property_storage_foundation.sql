-- =========================================
-- HURBY
-- CORE_PROPERTIES
-- STORAGE FOUNDATION
--
-- OBJETIVO:
-- bucket oficial de mídia dos imóveis
--
-- ESTRATÉGIA:
-- - bucket privado
-- - signed URLs futuras
-- - ownership por broker
-- - path estruturado:
--   owner_id/property_id/file.ext
--
-- IMPORTANTE:
-- compressão automática:
-- FUTURO
--
-- registrar em:
-- - GLOBAL.md
-- - HANDOFF
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
);

-- =========================================
-- STORAGE RLS
-- =========================================

CREATE POLICY "property_media_authenticated_select"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'property-media'
);

CREATE POLICY "property_media_authenticated_insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'property-media'
);

CREATE POLICY "property_media_authenticated_update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'property-media'
);

CREATE POLICY "property_media_authenticated_delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'property-media'
);