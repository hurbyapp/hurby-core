/*
=========================================
HURBY — MARKETPLACE LISTING SERVICE
LOCAL:
src/lib/services/marketplaceListingService.ts

OBJETIVO:
Servicos para anuncios do usuario comum marketplace.

REGRA:
- nao usa painel profissional
- nao usa create_property_operational_bundle
- usa RPC propria com limite de 1 anuncio gratuito
=========================================
*/

import { supabase } from '@/lib/supabaseClient'

export type MarketplaceListingPayload = {
  title: string

  property_type_slug?: string
  property_business_context_slug?: string
  listing_status_slug?: string

  description?: string
  price?: number | null
  condo_fee?: number | null
  iptu_value?: number | null

  property_standard?: string | null
  condominium_name?: string
  building_name?: string
  is_gated_community?: boolean | null
  has_condominium_pool?: boolean | null
  accepts_financing?: boolean | null

  zip_code?: string
  state?: string
  city?: string
  neighborhood?: string
  street?: string
  number?: string
  complement?: string
  hide_public_number?: boolean

  bedrooms?: number | null
  suites?: number | null
  bathrooms?: number | null
  garage_spaces?: number | null
  private_area?: number | null
  total_area?: number | null
  is_furnished?: boolean | null
  has_private_pool?: boolean | null
  sun_position?: string | null
  floor_number?: number | null
  total_floors?: number | null
  has_elevator?: boolean | null

  metadata?: Record<string, unknown>
}

export async function createMarketplaceUserListing(
  payload: MarketplaceListingPayload
) {
  return await supabase.rpc('create_marketplace_user_listing', {
    p_title: payload.title,

    p_property_type_slug: payload.property_type_slug || 'house',
    p_operational_model_slug: 'transactional',
    p_property_business_context_slug:
      payload.property_business_context_slug || 'sale',
    p_listing_status_slug: payload.listing_status_slug || 'draft',

    p_description: payload.description || null,
    p_price: payload.price ?? null,
    p_condo_fee: payload.condo_fee ?? null,
    p_iptu_value: payload.iptu_value ?? null,

    p_property_standard: payload.property_standard || null,
    p_condominium_name: payload.condominium_name || null,
    p_building_name: payload.building_name || null,
    p_is_gated_community: payload.is_gated_community ?? null,
    p_has_condominium_pool: payload.has_condominium_pool ?? null,
    p_accepts_financing: payload.accepts_financing ?? null,

    p_country: 'BR',
    p_zip_code: payload.zip_code || null,
    p_state: payload.state || null,
    p_city: payload.city || null,
    p_neighborhood: payload.neighborhood || null,
    p_street: payload.street || null,
    p_number: payload.number || null,
    p_complement: payload.complement || null,
    p_hide_public_number: payload.hide_public_number || false,

    p_bedrooms: payload.bedrooms ?? null,
    p_suites: payload.suites ?? null,
    p_bathrooms: payload.bathrooms ?? null,
    p_garage_spaces: payload.garage_spaces ?? null,
    p_private_area: payload.private_area ?? null,
    p_total_area: payload.total_area ?? null,
    p_is_furnished: payload.is_furnished ?? null,
    p_has_private_pool: payload.has_private_pool ?? null,
    p_sun_position: payload.sun_position || null,
    p_floor_number: payload.floor_number ?? null,
    p_total_floors: payload.total_floors ?? null,
    p_has_elevator: payload.has_elevator ?? null,

    p_metadata: payload.metadata || {},
  })
}

export async function updateMarketplaceUserListing(
  listingId: string,
  payload: MarketplaceListingPayload
) {
  return await supabase.rpc('update_marketplace_user_listing', {
    p_listing_id: listingId,
    p_title: payload.title,

    p_property_type_slug: payload.property_type_slug || 'house',
    p_property_business_context_slug:
      payload.property_business_context_slug || 'sale',
    p_listing_status_slug: payload.listing_status_slug || 'draft',

    p_description: payload.description || null,
    p_price: payload.price ?? null,
    p_condo_fee: payload.condo_fee ?? null,
    p_iptu_value: payload.iptu_value ?? null,

    p_property_standard: payload.property_standard || null,
    p_condominium_name: payload.condominium_name || null,
    p_building_name: payload.building_name || null,
    p_is_gated_community: payload.is_gated_community ?? null,
    p_has_condominium_pool: payload.has_condominium_pool ?? null,
    p_accepts_financing: payload.accepts_financing ?? null,

    p_zip_code: payload.zip_code || null,
    p_state: payload.state || null,
    p_city: payload.city || null,
    p_neighborhood: payload.neighborhood || null,
    p_street: payload.street || null,
    p_number: payload.number || null,
    p_complement: payload.complement || null,
    p_hide_public_number: payload.hide_public_number || false,

    p_bedrooms: payload.bedrooms ?? null,
    p_suites: payload.suites ?? null,
    p_bathrooms: payload.bathrooms ?? null,
    p_garage_spaces: payload.garage_spaces ?? null,
    p_private_area: payload.private_area ?? null,
    p_total_area: payload.total_area ?? null,
    p_is_furnished: payload.is_furnished ?? null,
    p_has_private_pool: payload.has_private_pool ?? null,
    p_sun_position: payload.sun_position || null,
    p_floor_number: payload.floor_number ?? null,
    p_total_floors: payload.total_floors ?? null,
    p_has_elevator: payload.has_elevator ?? null,

    p_metadata: payload.metadata || {},
  })
}

export async function getMyMarketplaceListings() {
  return await supabase
    .from('property_listings')
    .select(`
      *,
      property_assets (
        id,
        property_type_id,
        property_type (
          id,
          slug,
          label
        ),
        operational_model_id,
        property_standard,
        condominium_name,
        building_name,
        is_gated_community,
        has_condominium_pool,
        accepts_financing,
        property_asset_locations (
          *
        ),
        property_asset_features (
          *
        )
      ),
      property_business_context (
        id,
        slug,
        label
      ),
      listing_status (
        id,
        slug,
        label
      )
    `)
    .eq('visibility_scope', 'marketplace')
    .filter('metadata->>source', 'eq', 'marketplace_user_listing')
    .order('created_at', { ascending: false })
}

export async function getMyMarketplaceListingById(listingId: string) {
  return await supabase
    .from('property_listings')
    .select(`
      *,
      property_assets (
        id,
        property_type_id,
        property_type (
          id,
          slug,
          label
        ),
        operational_model_id,
        property_standard,
        condominium_name,
        building_name,
        is_gated_community,
        has_condominium_pool,
        accepts_financing,
        property_asset_locations (
          *
        ),
        property_asset_features (
          *
        )
      ),
      property_business_context (
        id,
        slug,
        label
      ),
      listing_status (
        id,
        slug,
        label
      )
    `)
    .eq('id', listingId)
    .eq('visibility_scope', 'marketplace')
    .filter('metadata->>source', 'eq', 'marketplace_user_listing')
    .single()
}
