/*
=========================================================
HURBY
CORE_REAL_ESTATE_OPERATIONAL_FOUNDATION
SERVICE LAYER
LOCAL:
src/lib/services/propertyService.ts
=========================================================

OBJETIVO:
Centralizar as operaÃƒÂ§ÃƒÂµes oficiais do nÃƒÂºcleo imobiliÃƒÂ¡rio
operacional do HURBY.

Esta service layer trabalha com:
- Core Portfolio
- Core Properties
- Operational Origins
- Visibility foundation
- Property Media

IMPORTANTE:
NÃƒÂ£o acessar Supabase diretamente nas pÃƒÂ¡ginas para operaÃƒÂ§ÃƒÂµes
de imÃƒÂ³veis quando houver fluxo operacional composto.

Toda criaÃƒÂ§ÃƒÂ£o operacional de imÃƒÂ³vel deve passar por esta
service layer para evitar retorno ao modelo antigo:

user -> imÃƒÂ³vel

O modelo correto ÃƒÂ©:

profile
-> portfolio
-> portfolio_item
-> property_asset
-> property_listing

---------------------------------------------------------

NÃƒÆ’O MISTURAR AQUI:
- leads
- financeiro
- IA
- assinatura
- marketplace
- contratos
- gestÃƒÂ£o de locaÃƒÂ§ÃƒÂ£o

---------------------------------------------------------

CONCEITOS:

PROPERTY ASSET
= ativo imobiliÃƒÂ¡rio operacional

PROPERTY LISTING
= manifestaÃƒÂ§ÃƒÂ£o comercial/publicitÃƒÂ¡ria do ativo

PORTFOLIO
= carteira operacional contextual

PORTFOLIO ITEM
= vÃƒÂ­nculo entre carteira, ativo, listing, origem,
responsabilidade e visibilidade

OPERATIONAL ORIGIN
= registro foundation da origem operacional

---------------------------------------------------------

MÃƒÂDIA:
MÃƒÂ­dias pertencem ao PROPERTY LISTING.
NÃƒÂ£o pertencem diretamente ao PROPERTY ASSET.

Motivo:
- anÃƒÂºncio pode morrer
- mÃƒÂ­dia pode morrer
- asset permanece
- histÃƒÂ³rico permanece
- gestÃƒÂ£o futura permanece

---------------------------------------------------------

OBSERVAÃƒâ€¡ÃƒÆ’O TÃƒâ€°CNICA:
A criaÃƒÂ§ÃƒÂ£o completa usa RPC transacional no banco.

A ediÃƒÂ§ÃƒÂ£o bÃƒÂ¡sica desta etapa permite atualizar:
- campos do listing
- tipo do asset
- modelo operacional do asset

Futuro:
ediÃƒÂ§ÃƒÂµes sensÃƒÂ­veis de asset devem passar por regras
mais fortes de auditoria e histÃƒÂ³rico operacional.

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
// =========================================================
// PROFESSIONAL ASSESSMENTS + PROPERTY OWNER FLOW
// Added after CORE_PROPERTIES_FORM_V1 separation.
// Listing = public/commercial ad.
// Assessment = internal/professional technical file.
// Do not mix assessment fields into the listing form.
// Codex may improve Portuguese/user communication in UI files,
// but must not change service contracts without a specific mission.
// =========================================================

type JsonRecord = Record<string, any>

export type ProfessionalAssessmentStatus =
  | 'draft'
  | 'submitted_for_review'
  | 'needs_correction'
  | 'approved'
  | 'rejected'
  | 'archived'

export type ProfessionalAssessmentPurpose =
  | 'general'
  | 'sale'
  | 'rental'
  | 'rental_management'

export type PropertyOwnerClientPayload = {
  display_name?: string
  legal_name?: string
  document_cpf?: string
  document_cnpj?: string
  email?: string
  phone?: string
  whatsapp?: string
  notes?: string
}

export type ProfessionalAssessmentPayload = {
  property_asset_id: string
  property_listing_id?: string | null
  portfolio_item_id?: string | null

  client_entity_id?: string | null
  client_relationship_id?: string | null

  assessment_status?: ProfessionalAssessmentStatus
  assessment_purpose?: ProfessionalAssessmentPurpose

  is_available_for_partnership?: boolean
  is_exclusive?: boolean
  hide_exact_address_for_partners?: boolean
  owner_can_view_summary?: boolean

  essential_snapshot?: JsonRecord
  technical_assessment?: JsonRecord
  commercial_assessment?: JsonRecord
  owner_interview?: JsonRecord
  documentation_assessment?: JsonRecord
  financial_assessment?: JsonRecord

  public_summary?: JsonRecord
  owner_visibility_summary?: JsonRecord
  partner_visibility_summary?: JsonRecord

  private_notes?: JsonRecord

  ai_review_status?: string
  ai_review_notes?: JsonRecord
  moderation_status?: string
  moderation_notes?: JsonRecord

  entitlement_status?: string
  is_free_assessment?: boolean
  monetization_metadata?: JsonRecord

  metadata?: JsonRecord
}

function cleanAssessmentDocument(value?: string | null) {
  if (!value) return null

  const cleaned = value.replace(/\D/g, '')

  return cleaned.length > 0 ? cleaned : null
}

function normalizeAssessmentText(value?: string | null) {
  if (!value) return null

  const trimmed = value.trim()

  return trimmed.length > 0 ? trimmed : null
}

async function getCurrentServiceUserId() {
  const response = await supabase.auth.getUser()

  return response.data.user?.id || null
}

export async function findClientEntityByDocument(
  payload: {
    document_cpf?: string | null
    document_cnpj?: string | null
  }
) {
  const documentCpf = cleanAssessmentDocument(payload.document_cpf)
  const documentCnpj = cleanAssessmentDocument(payload.document_cnpj)

  if (!documentCpf && !documentCnpj) {
    return {
      data: null,
      error: null,
    }
  }

  let query = supabase
    .from('client_entities')
    .select('*')
    .limit(1)

  if (documentCpf) {
    query = query.eq('document_cpf', documentCpf)
  }

  if (documentCnpj) {
    query = query.eq('document_cnpj', documentCnpj)
  }

  return await query.maybeSingle()
}

export async function createOrReusePropertyOwnerClient(
  payload: PropertyOwnerClientPayload
): Promise<ServiceResponse> {
  const currentUserId = await getCurrentServiceUserId()

  const documentCpf = cleanAssessmentDocument(payload.document_cpf)
  const documentCnpj = cleanAssessmentDocument(payload.document_cnpj)

  const existing = await findClientEntityByDocument({
    document_cpf: documentCpf,
    document_cnpj: documentCnpj,
  })

  if (existing.error) {
    return existing
  }

  if (existing.data) {
    return {
      data: existing.data,
      error: null,
    }
  }

  const legalName =
    normalizeAssessmentText(payload.legal_name) ||
    normalizeAssessmentText(payload.display_name)

  const displayName =
    normalizeAssessmentText(payload.display_name) ||
    legalName

  if (!displayName && !legalName) {
    return {
      data: null,
      error: {
        message: 'Informe o nome do proprietario.',
      },
    }
  }

  return await supabase
    .from('client_entities')
    .insert({
      display_name: displayName,
      legal_name: legalName,
      document_cpf: documentCpf,
      document_cnpj: documentCnpj,
      entity_type: documentCnpj ? 'company' : 'individual',
      created_by_profile_id: currentUserId,
    })
    .select()
    .single()
}

export async function createClientContactMethod(
  payload: {
    client_entity_id: string
    contact_type: 'email' | 'phone' | 'whatsapp'
    contact_value?: string | null
    is_primary?: boolean
  }
) {
  const currentUserId = await getCurrentServiceUserId()

  const contactValue = normalizeAssessmentText(payload.contact_value)

  if (!contactValue) {
    return {
      data: null,
      error: null,
    }
  }

  const existing = await supabase
    .from('client_contact_methods')
    .select('*')
    .eq('client_entity_id', payload.client_entity_id)
    .eq('contact_type', payload.contact_type)
    .eq('contact_value', contactValue)
    .maybeSingle()

  if (existing.error) {
    return existing
  }

  if (existing.data) {
    return {
      data: existing.data,
      error: null,
    }
  }

  return await supabase
    .from('client_contact_methods')
    .insert({
      client_entity_id: payload.client_entity_id,
      contact_type: payload.contact_type,
      contact_value: contactValue,
      is_primary: payload.is_primary || false,
      created_by_profile_id: currentUserId,
    })
    .select()
    .single()
}

export async function createPropertyProviderRelationship(
  payload: {
    client_entity_id: string
    property_asset_id: string
    property_listing_id?: string | null
    portfolio_id?: string | null
    operational_origin_id?: string | null
    notes?: string | null
  }
): Promise<ServiceResponse> {
  const currentUserId = await getCurrentServiceUserId()

  if (!currentUserId) {
    return {
      data: null,
      error: {
        message: 'Usuario nao autenticado.',
      },
    }
  }

  const existing = await supabase
    .from('client_relationships')
    .select('*')
    .eq('client_entity_id', payload.client_entity_id)
    .eq('property_asset_id', payload.property_asset_id)
    .eq('relationship_context', 'property_provider')
    .maybeSingle()

  if (existing.error) {
    return existing
  }

  if (existing.data) {
    return {
      data: existing.data,
      error: null,
    }
  }

  const relationship = await supabase
    .from('client_relationships')
    .insert({
      client_entity_id: payload.client_entity_id,
      relationship_context: 'property_provider',
      relationship_status: 'active',
      owner_profile_id: currentUserId,
      source_profile_id: currentUserId,
      portfolio_id: payload.portfolio_id || null,
      property_asset_id: payload.property_asset_id,
      property_listing_id: payload.property_listing_id || null,
      operational_origin_id: payload.operational_origin_id || null,
      created_by_profile_id: currentUserId,
      notes: payload.notes || null,
    })
    .select()
    .single()

  if (relationship.error || !relationship.data) {
    return relationship
  }

  await supabase
    .from('client_relationship_roles')
    .insert({
      client_relationship_id: relationship.data.id,
      role_type: 'property_provider',
      role_status: 'active',
    })

  return relationship
}

export async function createOrReusePropertyOwnerFlow(
  payload: PropertyOwnerClientPayload & {
    property_asset_id: string
    property_listing_id?: string | null
    portfolio_id?: string | null
    operational_origin_id?: string | null
  }
): Promise<ServiceResponse<{
  client_entity: any
  client_relationship: any
}>> {
  const client = await createOrReusePropertyOwnerClient(payload)

  if (client.error || !client.data) {
    return {
      data: null,
      error: client.error,
    }
  }

  await createClientContactMethod({
    client_entity_id: client.data.id,
    contact_type: 'email',
    contact_value: payload.email,
    is_primary: true,
  })

  await createClientContactMethod({
    client_entity_id: client.data.id,
    contact_type: 'phone',
    contact_value: payload.phone,
    is_primary: !payload.email,
  })

  await createClientContactMethod({
    client_entity_id: client.data.id,
    contact_type: 'whatsapp',
    contact_value: payload.whatsapp,
    is_primary: !payload.email && !payload.phone,
  })

  const relationship = await createPropertyProviderRelationship({
    client_entity_id: client.data.id,
    property_asset_id: payload.property_asset_id,
    property_listing_id: payload.property_listing_id || null,
    portfolio_id: payload.portfolio_id || null,
    operational_origin_id: payload.operational_origin_id || null,
    notes: payload.notes || null,
  })

  if (relationship.error || !relationship.data) {
    return {
      data: null,
      error: relationship.error,
    }
  }

  return {
    data: {
      client_entity: client.data,
      client_relationship: relationship.data,
    },
    error: null,
  }
}

export async function getProfessionalAssessmentByListingId(
  listingId: string
) {
  return await supabase
    .from('property_professional_assessments')
    .select('*')
    .eq('property_listing_id', listingId)
    .eq('is_current', true)
    .is('archived_at', null)
    .maybeSingle()
}

export async function getProfessionalAssessmentByAssetId(
  assetId: string
) {
  return await supabase
    .from('property_professional_assessments')
    .select('*')
    .eq('property_asset_id', assetId)
    .eq('is_current', true)
    .is('archived_at', null)
    .maybeSingle()
}

export async function createProfessionalAssessment(
  payload: ProfessionalAssessmentPayload
) {
  const currentUserId = await getCurrentServiceUserId()

  if (!currentUserId) {
    return {
      data: null,
      error: {
        message: 'Usuario nao autenticado.',
      },
    }
  }

  const requestedAssessmentStatus = payload.assessment_status || 'draft'
  const requiresClientLink = requestedAssessmentStatus !== 'draft'

  if (requiresClientLink && !payload.client_entity_id) {
    return {
      data: null,
      error: {
        message: 'Documento Profissional formal exige proprietario vinculado ao Core Clients.',
      },
    }
  }

  if (requiresClientLink && !payload.client_relationship_id) {
    return {
      data: null,
      error: {
        message: 'Documento Profissional formal exige relacionamento cliente-imovel vinculado.',
      },
    }
  }

  return await supabase
    .from('property_professional_assessments')
    .insert({
      property_asset_id: payload.property_asset_id,
      property_listing_id: payload.property_listing_id || null,
      portfolio_item_id: payload.portfolio_item_id || null,
      client_entity_id: payload.client_entity_id || null,
      client_relationship_id: payload.client_relationship_id || null,

      created_by_profile_id: currentUserId,
      responsible_profile_id: currentUserId,

      assessment_status: payload.assessment_status || 'draft',
      assessment_purpose: payload.assessment_purpose || 'general',

      is_available_for_partnership:
        payload.is_available_for_partnership || false,

      is_exclusive:
        payload.is_exclusive ?? true,

      hide_exact_address_for_partners:
        payload.hide_exact_address_for_partners ?? true,

      owner_can_view_summary:
        payload.owner_can_view_summary ?? true,

      essential_snapshot: payload.essential_snapshot || {},
      technical_assessment: payload.technical_assessment || {},
      commercial_assessment: payload.commercial_assessment || {},
      owner_interview: payload.owner_interview || {},
      documentation_assessment: payload.documentation_assessment || {},
      financial_assessment: payload.financial_assessment || {},

      public_summary: payload.public_summary || {},
      owner_visibility_summary: payload.owner_visibility_summary || {},
      partner_visibility_summary: payload.partner_visibility_summary || {},

      private_notes: payload.private_notes || {},

      ai_review_status: payload.ai_review_status || 'not_requested',
      ai_review_notes: payload.ai_review_notes || {},

      moderation_status: payload.moderation_status || 'not_reviewed',
      moderation_notes: payload.moderation_notes || {},

      entitlement_status: payload.entitlement_status || 'not_required',
      is_free_assessment: payload.is_free_assessment || false,
      monetization_metadata: payload.monetization_metadata || {},

      metadata: payload.metadata || {},
    })
    .select()
    .single()
}

export async function updateProfessionalAssessment(
  assessmentId: string,
  payload: Partial<ProfessionalAssessmentPayload>
) {
  return await supabase
    .from('property_professional_assessments')
    .update({
      client_entity_id: payload.client_entity_id,
      client_relationship_id: payload.client_relationship_id,

      assessment_status: payload.assessment_status,
      assessment_purpose: payload.assessment_purpose,

      is_available_for_partnership: payload.is_available_for_partnership,
      is_exclusive: payload.is_exclusive,
      hide_exact_address_for_partners: payload.hide_exact_address_for_partners,
      owner_can_view_summary: payload.owner_can_view_summary,

      essential_snapshot: payload.essential_snapshot,
      technical_assessment: payload.technical_assessment,
      commercial_assessment: payload.commercial_assessment,
      owner_interview: payload.owner_interview,
      documentation_assessment: payload.documentation_assessment,
      financial_assessment: payload.financial_assessment,

      public_summary: payload.public_summary,
      owner_visibility_summary: payload.owner_visibility_summary,
      partner_visibility_summary: payload.partner_visibility_summary,

      private_notes: payload.private_notes,

      ai_review_status: payload.ai_review_status,
      ai_review_notes: payload.ai_review_notes,

      moderation_status: payload.moderation_status,
      moderation_notes: payload.moderation_notes,

      entitlement_status: payload.entitlement_status,
      is_free_assessment: payload.is_free_assessment,
      monetization_metadata: payload.monetization_metadata,

      metadata: payload.metadata,

      updated_at: new Date().toISOString(),
    })
    .eq('id', assessmentId)
    .select()
    .single()
}

export async function saveProfessionalAssessmentForListing(
  payload: ProfessionalAssessmentPayload
) {
  if (!payload.property_listing_id) {
    return await createProfessionalAssessment(payload)
  }

  const existing = await getProfessionalAssessmentByListingId(
    payload.property_listing_id
  )

  if (existing.error) {
    return existing
  }

  if (existing.data) {
    return await updateProfessionalAssessment(
      existing.data.id,
      payload
    )
  }

  return await createProfessionalAssessment(payload)
}

// =========================================================
// PROPERTY BASIC FORM HELPERS
// Added for CORE_PROPERTIES_FORM_V1 public/basic listing form.
// These helpers support optional fields after the RPC creates
// property_asset, property_asset_location and property_asset_features.
// Do not use these helpers to bypass the creation RPC.
// =========================================================

export type PropertyAssetLocationPayload = {
  zip_code?: string | null
  zipcode?: string | null
  state?: string | null
  city?: string | null
  neighborhood?: string | null
  street?: string | null
  number?: string | null
  complement?: string | null
  hide_public_number?: boolean | null
}

export type PropertyAssetFeaturesPayload = {
  bedrooms?: number | null
  suites?: number | null
  bathrooms?: number | null
  garage_spaces?: number | null
  private_area?: number | null
  total_area?: number | null
  built_year?: number | null
  floor_number?: number | null
  total_floors?: number | null
  has_elevator?: boolean | null
  is_furnished?: boolean | null
  furnished?: boolean | null
  has_private_pool?: boolean | null
  sun_position?: string | null
}

export type PropertyAssetCommercialDetailsPayload = {
  property_standard?: string | null
  condominium_name?: string | null
  building_name?: string | null
  is_gated_community?: boolean | null
  has_condominium_pool?: boolean | null
  accepts_financing?: boolean | null
  metadata?: Record<string, any>
}

function normalizeOptionalText(value?: string | null) {
  if (value === undefined) return undefined
  if (value === null) return null

  const trimmed = value.trim()

  return trimmed.length > 0 ? trimmed : null
}

function normalizeOptionalNumber(value?: number | null) {
  if (value === undefined) return undefined
  if (value === null) return null

  return Number.isNaN(value) ? null : value
}

function addDefinedValue(
  target: Record<string, any>,
  key: string,
  value: any
) {
  if (value !== undefined) {
    target[key] = value
  }
}

export async function updatePropertyAssetCommercialDetails(
  assetId: string,
  payload: PropertyAssetCommercialDetailsPayload
) {
  const current = await supabase
    .from('property_assets')
    .select('metadata')
    .eq('id', assetId)
    .maybeSingle()

  if (current.error) {
    return current
  }

  const updatePayload: Record<string, any> = {}

  addDefinedValue(
    updatePayload,
    'property_standard',
    normalizeOptionalText(payload.property_standard)
  )

  addDefinedValue(
    updatePayload,
    'condominium_name',
    normalizeOptionalText(payload.condominium_name)
  )

  addDefinedValue(
    updatePayload,
    'building_name',
    normalizeOptionalText(payload.building_name)
  )

  addDefinedValue(
    updatePayload,
    'is_gated_community',
    payload.is_gated_community
  )

  addDefinedValue(
    updatePayload,
    'has_condominium_pool',
    payload.has_condominium_pool
  )

  addDefinedValue(
    updatePayload,
    'accepts_financing',
    payload.accepts_financing
  )

  if (payload.metadata !== undefined) {
    updatePayload.metadata = {
      ...(current.data?.metadata || {}),
      ...(payload.metadata || {}),
    }
  }

  if (Object.keys(updatePayload).length === 0) {
    return {
      data: current.data,
      error: null,
    }
  }

  return await supabase
    .from('property_assets')
    .update(updatePayload)
    .eq('id', assetId)
    .select()
    .single()
}

export async function upsertPropertyAssetLocationByAssetId(
  assetId: string,
  payload: PropertyAssetLocationPayload
) {
  const existing = await supabase
    .from('property_asset_locations')
    .select('id')
    .eq('property_asset_id', assetId)
    .maybeSingle()

  if (existing.error) {
    return existing
  }

  const updatePayload: Record<string, any> = {
    property_asset_id: assetId,
  }

  const normalizedZip =
    normalizeOptionalText(payload.zip_code) ??
    normalizeOptionalText(payload.zipcode)

  addDefinedValue(updatePayload, 'zip_code', normalizedZip)
  addDefinedValue(updatePayload, 'zipcode', normalizedZip)
  addDefinedValue(updatePayload, 'state', normalizeOptionalText(payload.state))
  addDefinedValue(updatePayload, 'city', normalizeOptionalText(payload.city))
  addDefinedValue(updatePayload, 'neighborhood', normalizeOptionalText(payload.neighborhood))
  addDefinedValue(updatePayload, 'street', normalizeOptionalText(payload.street))
  addDefinedValue(updatePayload, 'number', normalizeOptionalText(payload.number))
  addDefinedValue(updatePayload, 'complement', normalizeOptionalText(payload.complement))
  addDefinedValue(updatePayload, 'hide_public_number', payload.hide_public_number)

  if (existing.data?.id) {
    return await supabase
      .from('property_asset_locations')
      .update(updatePayload)
      .eq('id', existing.data.id)
      .select()
      .single()
  }

  return await supabase
    .from('property_asset_locations')
    .insert(updatePayload)
    .select()
    .single()
}

export async function upsertPropertyAssetFeaturesByAssetId(
  assetId: string,
  payload: PropertyAssetFeaturesPayload
) {
  const existing = await supabase
    .from('property_asset_features')
    .select('id')
    .eq('property_asset_id', assetId)
    .maybeSingle()

  if (existing.error) {
    return existing
  }

  const updatePayload: Record<string, any> = {
    property_asset_id: assetId,
  }

  addDefinedValue(updatePayload, 'bedrooms', normalizeOptionalNumber(payload.bedrooms))
  addDefinedValue(updatePayload, 'suites', normalizeOptionalNumber(payload.suites))
  addDefinedValue(updatePayload, 'bathrooms', normalizeOptionalNumber(payload.bathrooms))
  addDefinedValue(updatePayload, 'garage_spaces', normalizeOptionalNumber(payload.garage_spaces))
  addDefinedValue(updatePayload, 'private_area', normalizeOptionalNumber(payload.private_area))
  addDefinedValue(updatePayload, 'total_area', normalizeOptionalNumber(payload.total_area))
  addDefinedValue(updatePayload, 'built_year', normalizeOptionalNumber(payload.built_year))
  addDefinedValue(updatePayload, 'floor_number', normalizeOptionalNumber(payload.floor_number))
  addDefinedValue(updatePayload, 'total_floors', normalizeOptionalNumber(payload.total_floors))
  addDefinedValue(updatePayload, 'has_elevator', payload.has_elevator)
  addDefinedValue(updatePayload, 'is_furnished', payload.is_furnished)
  addDefinedValue(updatePayload, 'furnished', payload.furnished)
  addDefinedValue(updatePayload, 'has_private_pool', payload.has_private_pool)
  addDefinedValue(updatePayload, 'sun_position', normalizeOptionalText(payload.sun_position))

  if (existing.data?.id) {
    return await supabase
      .from('property_asset_features')
      .update(updatePayload)
      .eq('id', existing.data.id)
      .select()
      .single()
  }

  return await supabase
    .from('property_asset_features')
    .insert(updatePayload)
    .select()
    .single()
}


// =========================================================
// CLIENT CONTEXT READ HELPERS
// Added for Pipeline Pro attach mode.
// Read-only helpers. Do not use to duplicate owner/client data.
// =========================================================

export async function getClientEntityById(clientEntityId: string) {
  if (!clientEntityId) {
    return {
      data: null,
      error: null,
    }
  }

  return await supabase
    .from('client_entities')
    .select('*')
    .eq('id', clientEntityId)
    .maybeSingle()
}

export async function getClientRelationshipById(clientRelationshipId: string) {
  if (!clientRelationshipId) {
    return {
      data: null,
      error: null,
    }
  }

  return await supabase
    .from('client_relationships')
    .select('*')
    .eq('id', clientRelationshipId)
    .maybeSingle()
}


// =========================================================
// LISTING ACCESS CONTEXT
// Added for Pipeline Pro attach mode.
// Read-only helper based on audited RPCs.
// Does not change listing, asset, portfolio, client or assessment.
// =========================================================

export async function getListingAccessContext(listingId: string) {
  if (!listingId) {
    return {
      data: {
        can_access: false,
        can_manage: false,
      },
      error: null,
    }
  }

  const [accessResponse, manageResponse] = await Promise.all([
    supabase.rpc('can_access_listing', {
      p_property_listing_id: listingId,
    }),
    supabase.rpc('can_manage_listing', {
      p_property_listing_id: listingId,
    }),
  ])

  if (accessResponse.error) {
    return {
      data: null,
      error: accessResponse.error,
    }
  }

  if (manageResponse.error) {
    return {
      data: null,
      error: manageResponse.error,
    }
  }

  return {
    data: {
      can_access: Boolean(accessResponse.data),
      can_manage: Boolean(manageResponse.data),
    },
    error: null,
  }
}
