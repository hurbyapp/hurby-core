'use client'

/*
=========================================================
HURBY
CORE_REAL_ESTATE_OPERATIONAL_FOUNDATION
PROPERTY CREATE PAGE
LOCAL:
src/app/operations/properties/new/page.tsx
=========================================================

FLOW:
CREATE OPERATIONAL PROPERTY BUNDLE

Cria, em sequência operacional:

1. portfolio individual do usuário, se não existir
2. operational_origin
3. property_asset
4. property_asset_location mínima
5. property_asset_features mínima
6. property_listing
7. portfolio_item

IMPORTANTE:
asset ≠ listing

NÃO colapsar entidades.

---------------------------------------------------------

MONETÁRIO:

Foundation suporta:
- vírgula BR
- milhar BR
- decimal básico

EXEMPLOS:
5000
5.000
5000,60
5.000,60

NORMALIZAÇÃO:
- remove separador milhar
- converte decimal BR

FUTURO:
currency engine oficial.

---------------------------------------------------------

FUTURO:
- property_management
- landlord_core
- lifecycle
- recurring operations
- criação via RPC transacional

=========================================================
*/

import { useEffect, useState } from 'react'

import { supabase } from '@/lib/supabaseClient'

import {
  createPropertyOperationalBundle,
  getBusinessContexts,
  getListingStatuses,
  getOperationalModels,
  getPropertyTypes,
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

export default function NewPropertyPage() {
  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [user, setUser] =
    useState<any>(null)

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

  const [
    listingStatuses,
    setListingStatuses,
  ] = useState<any[]>([])

  const [title, setTitle] =
    useState('')

  const [description, setDescription] =
    useState('')

  const [price, setPrice] =
    useState('')

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

  const [
    listingStatusId,
    setListingStatusId,
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

      setUser(user)

      const [
        types,
        models,
        contexts,
        statuses,
      ] = await Promise.all([
        getPropertyTypes(),
        getOperationalModels(),
        getBusinessContexts(),
        getListingStatuses(),
      ])

      setPropertyTypes(types.data || [])

      setOperationalModels(
        models.data || []
      )

      setBusinessContexts(
        contexts.data || []
      )

      setListingStatuses(
        statuses.data || []
      )

      setLoading(false)
    }

    init()
  }, [])

  // =========================================================
  // CREATE
  // =========================================================

  const handleCreate = async () => {
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
      setStatus('Selecione o status do anúncio.')
      return
    }

    try {
      setSaving(true)

      setStatus(
        'Criando imóvel dentro da carteira operacional...'
      )

      const normalizedPrice =
        normalizeBrazilianPrice(price)

      const response =
        await createPropertyOperationalBundle({
          userId: user.id,
          property_type_id:
            propertyTypeId,
          operational_model_id:
            operationalModelId,
          property_business_context_id:
            businessContextId,
          listing_status_id:
            listingStatusId,
          title,
          description,
          price:
            normalizedPrice,
          visibility_scope:
            'private',
        })

      if (response.error) {
        setStatus(
          response.error.message ||
            'Erro ao criar imóvel.'
        )

        setSaving(false)

        return
      }

      setStatus(
        `Imóvel criado com sucesso. Listing: ${response.data?.listing?.id}`
      )

      setSaving(false)
    } catch (error) {
      console.error(error)

      setStatus(
        'Erro interno ao criar imóvel.'
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
        <a href="/operations/properties">
          Voltar para Imóveis
        </a>
      </p>

      <h1>Novo Imóvel</h1>

      <p>
        Este cadastro já cria o imóvel dentro da
        carteira operacional do usuário.
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
          setDescription(e.target.value)
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

        {operationalModels.map(
          (item) => (
            <option
              key={item.id}
              value={item.id}
            >
              {item.label}
            </option>
          )
        )}
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

        {businessContexts.map(
          (item) => (
            <option
              key={item.id}
              value={item.id}
            >
              {item.label}
            </option>
          )
        )}
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

        {listingStatuses.map(
          (item) => (
            <option
              key={item.id}
              value={item.id}
            >
              {item.label}
            </option>
          )
        )}
      </select>

      <br />
      <br />

      <button
        onClick={handleCreate}
        disabled={saving}
      >
        {saving
          ? 'Salvando...'
          : 'Criar imóvel'}
      </button>

      <br />
      <br />

      {status && <p>{status}</p>}

      <br />

      <p>
        <a href="/operations/properties/list">
          Ver lista de imóveis
        </a>
      </p>
    </main>
  )
}