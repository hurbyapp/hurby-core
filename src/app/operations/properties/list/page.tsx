'use client'

/*
=========================================================
HURBY
CORE_REAL_ESTATE_OPERATIONAL_FOUNDATION
PROPERTY LIST PAGE
LOCAL:
src/app/operations/properties/list/page.tsx
=========================================================

FLOW:
PROPERTY LISTINGS

Esta página lista listings operacionais.

IMPORTANTE:
listing ≠ asset

O listing é a manifestação comercial do ativo.
O asset é o ativo imobiliário operacional persistente.

=========================================================
*/

import { useEffect, useState } from 'react'

import { supabase } from '@/lib/supabaseClient'

import {
  getPropertyListings,
} from '@/lib/services/propertyService'

export default function PropertyListPage() {
  const [loading, setLoading] =
    useState(true)

  const [listings, setListings] =
    useState<any[]>([])

  const [error, setError] =
    useState('')

  // -------------------------------------
  // INIT
  // -------------------------------------

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        window.location.href = '/login'
        return
      }

      const response =
        await getPropertyListings()

      if (response.error) {
        setError(response.error.message)
        setLoading(false)
        return
      }

      setListings(response.data || [])

      setLoading(false)
    }

    init()
  }, [])

  // -------------------------------------
  // LOADING
  // -------------------------------------

  if (loading) {
    return (
      <main style={{ padding: 24 }}>
        <p>Carregando...</p>
      </main>
    )
  }

  // -------------------------------------
  // PAGE
  // -------------------------------------

  return (
    <main style={{ padding: 24 }}>
      <p>
        <a href="/operations/properties">
          Voltar para Imóveis
        </a>
      </p>

      <h1>Lista de Imóveis</h1>

      <p>
        Lista de anúncios operacionais vinculados
        ao novo core imobiliário.
      </p>

      <br />

      {error && (
        <p style={{ color: 'red' }}>
          {error}
        </p>
      )}

      {listings.length === 0 && !error && (
        <p>
          Nenhum imóvel encontrado.
        </p>
      )}

      {listings.map((listing) => (
        <div
          key={listing.id}
          style={{
            border: '1px solid #ccc',
            padding: 16,
            marginBottom: 16,
          }}
        >
          <h3>{listing.title}</h3>

          <p>
            {listing.description}
          </p>

          <p>
            <strong>Preço:</strong>{' '}
            {listing.price ?? '-'}
          </p>

          <p>
            <strong>Status:</strong>{' '}
            {
              listing.listing_status
                ?.label
            }
          </p>

          <p>
            <strong>Contexto:</strong>{' '}
            {
              listing
                .property_business_context
                ?.label
            }
          </p>

          <p>
            <strong>Visibilidade:</strong>{' '}
            {listing.visibility_scope}
          </p>

          <p>
            <strong>Asset:</strong>{' '}
            {
              listing.property_asset_id
            }
          </p>

          <p>
            <a
              href={`/operations/properties/${listing.id}`}
            >
              Abrir detalhe
            </a>
            {' | '}
            <a
              href={`/operations/properties/${listing.id}/edit`}
            >
              Editar
            </a>
          </p>
        </div>
      ))}

      <br />

      <p>
        <a href="/operations/properties/new">
          Cadastrar novo imóvel
        </a>
      </p>
    </main>
  )
}