'use client'

/*
=========================================================
HURBY
CORE_REAL_ESTATE_OPERATIONAL_FOUNDATION
PROPERTY DETAIL PAGE
LOCAL:
src/app/operations/properties/[listingId]/page.tsx
=========================================================

FLOW:
PROPERTY DETAIL

Esta página visualiza o listing, seu asset,
sua mídia e seus vínculos operacionais.

MÍDIA:
bucket privado.
usar signed URLs.

NÃO usar getPublicUrl().

IMPORTANTE:
listing ≠ asset

=========================================================
*/

import { useEffect, useState } from 'react'

import { useParams } from 'next/navigation'

import { supabase } from '@/lib/supabaseClient'

import {
  getPropertyListingById,
  uploadPropertyMedia,
} from '@/lib/services/propertyService'

export default function PropertyDetailPage() {
  const params = useParams()

  const listingId =
    params.listingId as string

  const [loading, setLoading] =
    useState(true)

  const [uploading, setUploading] =
    useState(false)

  const [listing, setListing] =
    useState<any>(null)

  const [mediaUrls, setMediaUrls] =
    useState<any[]>([])

  const [status, setStatus] =
    useState('')

  // =========================================================
  // LOAD LISTING
  // =========================================================

  const loadListing = async () => {
    const response =
      await getPropertyListingById(
        listingId
      )

    if (response.error) {
      setStatus(response.error.message)
      setListing(null)
      setLoading(false)
      return
    }

    const listingData =
      response.data

    setListing(listingData)

    const urls = await Promise.all(
      (
        listingData
          ?.property_listing_media || []
      ).map(async (media: any) => {
        const signed =
          await supabase.storage
            .from('property-media')
            .createSignedUrl(
              media.storage_path,
              3600
            )

        return {
          id: media.id,
          url:
            signed.data
              ?.signedUrl,
        }
      })
    )

    setMediaUrls(urls)

    setLoading(false)
  }

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

      await loadListing()
    }

    init()
  }, [listingId])

  // =========================================================
  // MULTI UPLOAD
  // =========================================================

  const handleUpload = async (
    event: any
  ) => {
    try {
      const files =
        event.target.files

      if (!files?.length) return

      setUploading(true)

      setStatus(
        'Enviando mídias...'
      )

      for (const file of files) {
        const response =
          await uploadPropertyMedia(
            file,
            listingId
          )

        if (response.error) {
          setStatus(
            response.error.message
          )

          setUploading(false)

          return
        }
      }

      setStatus(
        'Mídias enviadas com sucesso.'
      )

      setUploading(false)

      await loadListing()
    } catch (error) {
      console.error(error)

      setStatus(
        'Erro interno no upload.'
      )

      setUploading(false)
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
  // NOT FOUND
  // =========================================================

  if (!listing) {
    return (
      <main style={{ padding: 24 }}>
        <p>
          <a href="/operations/properties/list">
            Voltar para lista
          </a>
        </p>

        <p>
          Imóvel não encontrado.
        </p>

        {status && <p>{status}</p>}
      </main>
    )
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <main style={{ padding: 24 }}>
      <p>
        <a href="/operations/properties/list">
          Voltar para lista
        </a>
        {' | '}
        <a
          href={`/operations/properties/${listing.id}/edit`}
        >
          Editar
        </a>
      </p>

      <h1>{listing.title}</h1>

      <br />

      <p>
        {listing.description}
      </p>

      <br />

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

      <br />

      <h3>Upload mídia</h3>

      <input
        type="file"
        multiple
        onChange={handleUpload}
        disabled={uploading}
      />

      <br />
      <br />

      {status && <p>{status}</p>}

      <br />

      <h3>Mídias</h3>

      <br />

      {mediaUrls.length === 0 && (
        <p>
          Nenhuma mídia enviada.
        </p>
      )}

      <div
        style={{
          display: 'flex',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        {mediaUrls.map(
          (media: any) => (
            <img
              key={media.id}
              src={media.url}
              alt="property"
              style={{
                width: 220,
                borderRadius: 8,
                border:
                  '1px solid #ccc',
              }}
            />
          )
        )}
      </div>

      <br />
      <br />

      <h3>Asset</h3>

      <p>
        <strong>ID:</strong>{' '}
        {
          listing.property_assets
            ?.id
        }
      </p>

      <p>
        <strong>País:</strong>{' '}
        {
          listing.property_assets
            ?.country
        }
      </p>

      <p>
        <strong>Ativo:</strong>{' '}
        {listing.property_assets
          ?.is_active
          ? 'Sim'
          : 'Não'}
      </p>

      <br />

      <h3>Portfolio</h3>

      {listing.portfolio_items?.length ? (
        listing.portfolio_items.map(
          (item: any) => (
            <div key={item.id}>
              <p>
                <strong>Portfolio:</strong>{' '}
                {item.portfolio_id}
              </p>
              <p>
                <strong>Status item:</strong>{' '}
                {item.item_status}
              </p>
              <p>
                <strong>Origem:</strong>{' '}
                {item.origin_type}
              </p>
            </div>
          )
        )
      ) : (
        <p>
          Nenhum vínculo de portfolio encontrado.
        </p>
      )}
    </main>
  )
}