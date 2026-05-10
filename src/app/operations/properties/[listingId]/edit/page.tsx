'use client'

/*
=========================================================
HURBY
CORE_REAL_ESTATE_OPERATIONAL_FOUNDATION
PROPERTY EDIT PAGE
LOCAL:
src/app/operations/properties/[listingId]/edit/page.tsx
=========================================================

FLOW:
PROPERTY EDITION

Esta página edita o básico operacional do imóvel:

PROPERTY LISTING:
- título
- descrição
- preço
- contexto de negócio
- status

PROPERTY ASSET:
- tipo do imóvel
- modelo operacional

IMPORTANTE:
asset ≠ listing

ASSET:
é persistente estrutural.

LISTING:
é operacional/publicitário.

FUTURO:
edições sensíveis do asset devem gerar histórico,
auditoria e lifecycle.

=========================================================
*/

import { useEffect, useState } from 'react'

import {
  useParams,
} from 'next/navigation'

import { supabase } from '@/lib/supabaseClient'

import {
  getBusinessContexts,
  getListingStatuses,
  getOperationalModels,
  getPropertyListingById,
  getPropertyTypes,
  updatePropertyAsset,
  updatePropertyListing,
} from '@/lib/services/propertyService'

function normalizeBrazilianPrice(value: string) {
  if (!value.trim()) return null

  const normalized = Number(
    value
      .replace(/\./g, '')
      .replace(',', '.')
  )

  if (Number.isNaN(normalized)) {
    return null
  }

  return normalized
}

export default function EditPropertyPage() {
  const params = useParams()

  const listingId =
    params.listingId as string

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [listing, setListing] =
    useState<any>(null)

  const [statuses, setStatuses] =
    useState<any[]>([])

  const [propertyTypes, setPropertyTypes] =
    useState<any[]>([])

  const [
    operationalModels,
    setOperationalModels,
  ] = useState<any[]>([])

  const [
    businessContexts,
    setBusinessContexts,
  ] = useState<any[]>([])

  const [title, setTitle] =
    useState('')

  const [
    description,
    setDescription,
  ] = useState('')

  const [price, setPrice] =
    useState('')

  const [
    listingStatusId,
    setListingStatusId,
  ] = useState('')

  const [
    propertyTypeId,
    setPropertyTypeId,
  ] = useState('')

  const [
    operationalModelId,
    setOperationalModelId,
  ] = useState('')

  const [
    businessContextId,
    setBusinessContextId,
  ] = useState('')

  const [status, setStatus] =
    useState('')

  // =========================================================
  // INIT
  // =========================================================

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        window.location.href = '/login'
        return
      }

      const [
        listingResponse,
        statusesResponse,
        propertyTypesResponse,
        operationalModelsResponse,
        businessContextsResponse,
      ] = await Promise.all([
        getPropertyListingById(
          listingId
        ),

        getListingStatuses(),

        getPropertyTypes(),

        getOperationalModels(),

        getBusinessContexts(),
      ])

      if (listingResponse.error) {
        setStatus(
          listingResponse.error.message
        )
        setLoading(false)
        return
      }

      const listingData =
        listingResponse.data

      setListing(listingData)

      setStatuses(
        statusesResponse.data || []
      )

      setPropertyTypes(
        propertyTypesResponse.data || []
      )

      setOperationalModels(
        operationalModelsResponse.data || []
      )

      setBusinessContexts(
        businessContextsResponse.data || []
      )

      setTitle(
        listingData?.title || ''
      )

      setDescription(
        listingData?.description || ''
      )

      setPrice(
        String(
          listingData?.price || ''
        )
      )

      setListingStatusId(
        listingData
          ?.listing_status_id || ''
      )

      setBusinessContextId(
        listingData
          ?.property_business_context_id || ''
      )

      setPropertyTypeId(
        listingData
          ?.property_assets
          ?.property_type_id || ''
      )

      setOperationalModelId(
        listingData
          ?.property_assets
          ?.operational_model_id || ''
      )

      setLoading(false)
    }

    init()
  }, [listingId])

  // =========================================================
  // SAVE
  // =========================================================

  const handleSave = async () => {
    if (!title.trim()) {
      setStatus('Informe o título.')
      return
    }

    if (!propertyTypeId) {
      setStatus('Selecione o tipo do imóvel.')
      return
    }

    if (!operationalModelId) {
      setStatus('Selecione o modelo operacional.')
      return
    }

    if (!businessContextId) {
      setStatus('Selecione o contexto de negócio.')
      return
    }

    if (!listingStatusId) {
      setStatus('Selecione o status.')
      return
    }

    if (!listing?.property_assets?.id) {
      setStatus('Asset do imóvel não encontrado.')
      return
    }

    try {
      setSaving(true)

      setStatus(
        'Salvando imóvel...'
      )

      const normalizedPrice =
        normalizeBrazilianPrice(price)

      const assetResponse =
        await updatePropertyAsset(
          listing.property_assets.id,
          {
            property_type_id:
              propertyTypeId,

            operational_model_id:
              operationalModelId,
          }
        )

      if (assetResponse.error) {
        setStatus(
          assetResponse.error.message
        )

        setSaving(false)

        return
      }

      const listingResponse =
        await updatePropertyListing(
          listingId,
          {
            title,
            description,
            price:
              normalizedPrice,
            listing_status_id:
              listingStatusId,
            property_business_context_id:
              businessContextId,
          }
        )

      if (listingResponse.error) {
        setStatus(
          listingResponse.error.message
        )

        setSaving(false)

        return
      }

      setListing(
        listingResponse.data
      )

      setStatus(
        'Imóvel atualizado.'
      )

      setSaving(false)
    } catch (error) {
      console.error(error)

      setStatus(
        'Erro interno na edição.'
      )

      setSaving(false)
    }
  }

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main style={{ padding: 24 }}>
        <p>Carregando...</p>
      </main>
    )
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <main style={{ padding: 24 }}>
      <p>
        <a href={`/operations/properties/${listingId}`}>
          Voltar para detalhe
        </a>
        {' | '}
        <a href="/operations/properties/list">
          Voltar para lista
        </a>
      </p>

      <h1>Editar imóvel</h1>

      <p>
        Edição básica do anúncio e do ativo
        imobiliário operacional.
      </p>

      <br />

      <input
        placeholder="Título"
        value={title}
        onChange={(e) =>
          setTitle(e.target.value)
        }
      />

      <br />
      <br />

      <textarea
        placeholder="Descrição"
        value={description}
        onChange={(e) =>
          setDescription(
            e.target.value
          )
        }
      />

      <br />
      <br />

      <input
        placeholder="Preço"
        value={price}
        onChange={(e) =>
          setPrice(e.target.value)
        }
      />

      <br />
      <br />

      <select
        value={propertyTypeId}
        onChange={(e) =>
          setPropertyTypeId(
            e.target.value
          )
        }
      >
        <option value="">
          Tipo imóvel
        </option>

        {propertyTypes.map((item) => (
          <option
            key={item.id}
            value={item.id}
          >
            {item.label}
          </option>
        ))}
      </select>

      <br />
      <br />

      <select
        value={operationalModelId}
        onChange={(e) =>
          setOperationalModelId(
            e.target.value
          )
        }
      >
        <option value="">
          Modelo operacional
        </option>

        {operationalModels.map((item) => (
          <option
            key={item.id}
            value={item.id}
          >
            {item.label}
          </option>
        ))}
      </select>

      <br />
      <br />

      <select
        value={businessContextId}
        onChange={(e) =>
          setBusinessContextId(
            e.target.value
          )
        }
      >
        <option value="">
          Contexto negócio
        </option>

        {businessContexts.map((item) => (
          <option
            key={item.id}
            value={item.id}
          >
            {item.label}
          </option>
        ))}
      </select>

      <br />
      <br />

      <select
        value={listingStatusId}
        onChange={(e) =>
          setListingStatusId(
            e.target.value
          )
        }
      >
        <option value="">
          Status listing
        </option>

        {statuses.map((item) => (
          <option
            key={item.id}
            value={item.id}
          >
            {item.label}
          </option>
        ))}
      </select>

      <br />
      <br />

      <button
        onClick={handleSave}
        disabled={saving}
      >
        {saving
          ? 'Salvando...'
          : 'Salvar imóvel'}
      </button>

      <br />
      <br />

      {status && <p>{status}</p>}

      <br />

      <p>
        <strong>Listing ID:</strong>{' '}
        {listing?.id}
      </p>

      <p>
        <strong>Asset ID:</strong>{' '}
        {listing?.property_assets?.id}
      </p>
    </main>
  )
}