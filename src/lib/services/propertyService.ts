/*
=========================================================
HURBY
CORE_REAL_ESTATE_OPERATIONAL_FOUNDATION
SERVICE LAYER
LOCAL:
src/lib/services/propertyService.ts
=========================================================

OBJETIVO:
Centralizar as operações oficiais do núcleo imobiliário
operacional do HURBY.

Esta service layer trabalha com:
- Core Portfolio
- Core Properties
- Operational Origins
- Visibility foundation
- Property Media

IMPORTANTE:
Não acessar Supabase diretamente nas páginas para operações
de imóveis quando houver fluxo operacional composto.

Toda criação operacional de imóvel deve passar por esta
service layer para evitar retorno ao modelo antigo:

user -> imóvel

O modelo correto é:

profile
-> portfolio
-> portfolio_item
-> property_asset
-> property_listing

---------------------------------------------------------

NÃO MISTURAR AQUI:
- leads
- financeiro
- IA
- assinatura
- marketplace
- contratos
- gestão de locação

---------------------------------------------------------

CONCEITOS:

PROPERTY ASSET
= ativo imobiliário operacional

PROPERTY LISTING
= manifestação comercial/publicitária do ativo

PORTFOLIO
= carteira operacional contextual

PORTFOLIO ITEM
= vínculo entre carteira, ativo, listing, origem,
responsabilidade e visibilidade

OPERATIONAL ORIGIN
= registro foundation da origem operacional

---------------------------------------------------------

MÍDIA:
Mídias pertencem ao PROPERTY LISTING.
Não pertencem diretamente ao PROPERTY ASSET.

Motivo:
- anúncio pode morrer
- mídia pode morrer
- asset permanece
- histórico permanece
- gestão futura permanece

---------------------------------------------------------

OBSERVAÇÃO TÉCNICA:
A criação completa usa RPC transacional no banco.

A edição básica desta etapa permite atualizar:
- campos do listing
- tipo do asset
- modelo operacional do asset

Futuro:
edições sensíveis de asset devem passar por regras
mais fortes de auditoria e histórico operacional.

=========================================================
*/

import { supabase } from '@/lib/supabaseClient'

type ServiceResponse<T = any> = {
  data: T | null
  error: any | null
}

export type CreatePropertyOperationalBundlePayload = {
  userId: string

  property_type_id: string
  operational_model_id: string
  property_business_context_id: string
  listing_status_id: string

  title: string
  description?: string
  price?: number | null

  country?: string
  visibility_scope?: 'private' | 'institutional' | 'shared' | 'public' | 'marketplace'
}

// =========================================================
// CREATE FULL OPERATIONAL PROPERTY BUNDLE
// =========================================================

export async function createPropertyOperationalBundle(
  payload: CreatePropertyOperationalBundlePayload
): Promise<ServiceResponse> {
  const response = await supabase.rpc(
    'create_property_operational_bundle',
    {
      p_property_type_id:
        payload.property_type_id,

      p_operational_model_id:
        payload.operational_model_id,

      p_property_business_context_id:
        payload.property_business_context_id,

      p_listing_status_id:
        payload.listing_status_id,

      p_title:
        payload.title,

      p_description:
        payload.description || null,

      p_price:
        typeof payload.price === 'number'
          ? payload.price
          : null,

      p_visibility_scope:
        payload.visibility_scope || 'private',

      p_country:
        payload.country || 'BR',
    }
  )

  if (response.error) {
    return {
      data: null,
      error: response.error,
    }
  }

  return {
    data: {
      portfolio:
        { id: response.data?.portfolio_id },

      origin:
        { id: response.data?.origin_id },

      asset:
        { id: response.data?.asset_id },

      location:
        { id: response.data?.location_id },

      features:
        { id: response.data?.features_id },

      listing:
        { id: response.data?.listing_id },

      portfolio_item:
        { id: response.data?.portfolio_item_id },
    },
    error: null,
  }
}

// =========================================================
// CATALOGS
// =========================================================

export async function getPropertyTypes() {
  return await supabase
    .from('property_type')
    .select('*')
    .order('label')
}

export async function getOperationalModels() {
  return await supabase
    .from('operational_model')
    .select('*')
    .order('label')
}

export async function getBusinessContexts() {
  return await supabase
    .from('property_business_context')
    .select('*')
    .order('label')
}

export async function getListingStatuses() {
  return await supabase
    .from('listing_status')
    .select('*')
    .order('label')
}

// =========================================================
// LISTINGS
// =========================================================

export async function getPropertyListings() {
  return await supabase
    .from('property_listings')
    .select(`
      *,
      property_assets (
        id,
        country,
        is_active,
        property_type_id,
        operational_model_id
      ),
      property_business_context (
        label
      ),
      listing_status (
        label
      ),
      portfolio_items (
        id,
        portfolio_id,
        visibility_scope,
        item_status
      )
    `)
    .order('created_at', {
      ascending: false,
    })
}

// =========================================================
// PROPERTY DETAIL
// =========================================================

export async function getPropertyListingById(
  listingId: string
) {
  return await supabase
    .from('property_listings')
    .select(`
      *,
      property_assets (
        *,
        property_asset_locations (
          *
        ),
        property_asset_features (
          *
        )
      ),
      property_business_context (
        *
      ),
      listing_status (
        *
      ),
      property_listing_media (
        *
      ),
      portfolio_items (
        *
      )
    `)
    .eq('id', listingId)
    .single()
}

// =========================================================
// PROPERTY MEDIA
// =========================================================

export async function uploadPropertyMedia(
  file: File,
  listingId: string
) {
  const fileExt =
    file.name.split('.').pop()

  const fileName =
    `${crypto.randomUUID()}.${fileExt}`

  const filePath =
    `${listingId}/${fileName}`

  const uploadResponse =
    await supabase.storage
      .from('property-media')
      .upload(filePath, file)

  if (uploadResponse.error) {
    return uploadResponse
  }

  const mediaType =
    await supabase
      .from('media_type')
      .select('id')
      .eq('slug', 'image')
      .single()

  const provider =
    await supabase
      .from('media_provider')
      .select('id')
      .eq(
        'slug',
        'supabase_storage'
      )
      .single()

  if (
    mediaType.error ||
    provider.error
  ) {
    return {
      data: null,
      error:
        mediaType.error ||
        provider.error,
    }
  }

  return await supabase
    .from('property_listing_media')
    .insert({
      property_listing_id:
        listingId,

      storage_path:
        filePath,

      media_type_id:
        mediaType.data.id,

      media_provider_id:
        provider.data.id,
    })
    .select()
    .single()
}

// =========================================================
// UPDATE PROPERTY ASSET
// =========================================================

export async function updatePropertyAsset(
  assetId: string,
  payload: {
    property_type_id: string
    operational_model_id: string
  }
) {
  return await supabase
    .from('property_assets')
    .update({
      property_type_id:
        payload.property_type_id,

      operational_model_id:
        payload.operational_model_id,

      updated_at:
        new Date().toISOString(),
    })
    .eq('id', assetId)
    .select()
    .single()
}

// =========================================================
// UPDATE PROPERTY LISTING
// =========================================================

export async function updatePropertyListing(
  listingId: string,
  payload: {
    title: string
    description?: string
    price?: number | null
    listing_status_id: string
    property_business_context_id: string
  }
) {
  return await supabase
    .from('property_listings')
    .update({
      title:
        payload.title,

      description:
        payload.description || null,

      price:
        typeof payload.price === 'number'
          ? payload.price
          : null,

      listing_status_id:
        payload.listing_status_id,

      property_business_context_id:
        payload.property_business_context_id,

      updated_at:
        new Date().toISOString(),
    })
    .eq('id', listingId)
    .select()
    .single()
}