'use client'

/*
=========================================================
HURBY — CORE_PROPERTIES_FORM_V1
ARQUIVO:
src/app/operations/properties/list/page.tsx

RESPONSABILIDADE:
Listar anuncios/imoveis operacionais e exibir thumbnail
quando houver foto publica vinculada ao anuncio.

REGRA DE PRODUTO:
- Anuncio e peca publica/comercial.
- Ficha profissional e fluxo separado.
- Esta pagina nao deve exibir dados sensiveis da ficha.
- Thumbnail usa fotos publicas do anuncio.

CODEX:
Pode corrigir portugues, acentuacao e comunicacao diretamente no VS Code/editor,
mantendo UTF-8. Nao alterar arquitetura, regras LGPD, service contracts,
RPCs, nomes tecnicos ou regras de negocio sem missao especifica.

OBSERVACAO:
Textos visiveis foram deixados sem acento neste momento para evitar mojibake
causado pelo terminal PowerShell. Codex deve corrigir depois no editor.
=========================================================
*/

import Link from 'next/link'
import { useEffect, useState } from 'react'

import { supabase } from '@/lib/supabaseClient'
import {
  getPropertyListingById,
  getPropertyListings,
} from '@/lib/services/propertyService'

function isMarketplaceListing(listing: any) {
  return listing?.metadata?.source === 'marketplace_user_listing'
}

function getFirstMediaFromDetail(detail: any) {
  const media = detail?.property_listing_media || []

  if (!Array.isArray(media) || media.length === 0) {
    return null
  }

  return media[0]
}

function MarketplaceTag({ listing }: { listing: any }) {
  if (!isMarketplaceListing(listing)) {
    return null
  }

  return (
    <span
      style={{
        display: 'inline-block',
        border: '1px solid #999',
        borderRadius: 999,
        padding: '2px 8px',
        fontSize: 12,
        marginLeft: 8,
      }}
    >
      Cad. MP
    </span>
  )
}

export default function PropertyListPage() {
  const [loading, setLoading] = useState(true)
  const [listings, setListings] = useState<any[]>([])
  const [thumbnailUrls, setThumbnailUrls] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        window.location.href = '/login'
        return
      }

      const response = await getPropertyListings()

      if (response.error) {
        setError(response.error.message)
        setLoading(false)
        return
      }

      const filtered = (response.data || []).filter((listing: any) => {
        if (!isMarketplaceListing(listing)) {
          return true
        }

        return listing.created_by_profile_id === user.id
      })

      const signedThumbs: Record<string, string> = {}

      for (const listing of filtered) {
        const detailResponse = await getPropertyListingById(listing.id)

        if (detailResponse.error || !detailResponse.data) {
          continue
        }

        const firstMedia = getFirstMediaFromDetail(detailResponse.data)

        if (!firstMedia?.storage_path) {
          continue
        }

        const signed = await supabase.storage
          .from('property-media')
          .createSignedUrl(firstMedia.storage_path, 3600)

        if (signed.data?.signedUrl) {
          signedThumbs[listing.id] = signed.data.signedUrl
        }
      }

      setThumbnailUrls(signedThumbs)
      setListings(filtered)
      setLoading(false)
    }

    init()
  }, [])

  const handleLogout = async () => {
    setStatus('Saindo...')
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (loading) {
    return (
      <main style={{ padding: 24 }}>
        <p>Carregando imoveis...</p>
      </main>
    )
  }

  return (
    <main style={{ padding: 24 }}>
      <style jsx global>{`
        .hurby-nav {
          display: flex;
          gap: 12px;
          border-bottom: 1px solid #ddd;
          padding-bottom: 12px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .hurby-card {
          border: 1px solid #ccc;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 16px;
          display: flex;
          gap: 16px;
          align-items: flex-start;
          background: #fff;
        }

        .hurby-thumb-box {
          width: 150px;
          min-width: 150px;
          height: 110px;
          border: 1px solid #ddd;
          border-radius: 10px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f7f7f7;
        }

        .hurby-thumb {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .button-link,
        button {
          border: 1px solid #333;
          border-radius: 8px;
          padding: 8px 12px;
          background: #fff;
          color: #111;
          text-decoration: none;
          display: inline-block;
          cursor: pointer;
          margin-right: 8px;
          margin-bottom: 8px;
        }

        .muted {
          color: #666;
          font-size: 14px;
        }

        @media (max-width: 720px) {
          .hurby-card {
            flex-direction: column;
          }

          .hurby-thumb-box {
            width: 100%;
            height: 180px;
          }
        }
      `}</style>

      <nav className="hurby-nav">
        <Link href="/broker">Broker</Link>
        <Link href="/agency">Agency</Link>
        <Link href="/account">Minha conta</Link>
        <Link href="/account/profile">Editar cadastro</Link>
        <Link href="/operations/properties">Imoveis</Link>
        <Link href="/operations/properties/new">Cadastrar imovel</Link>
        <Link href="/operations/properties/list">Listar imoveis</Link>
        <Link href="/statement">Extrato AXE</Link>
      </nav>

      <h1>Lista de imoveis</h1>

      <p>
        Esta lista mostra os anuncios/imoveis operacionais vinculados ao Core Imobiliario.
      </p>

      <p className="muted">
        A foto exibida no card vem da galeria publica do anuncio. A ficha profissional fica separada.
      </p>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {listings.length === 0 && !error && (
        <p>Nenhum imovel encontrado.</p>
      )}

      {listings.map((listing) => {
        const thumbnailUrl = thumbnailUrls[listing.id]

        return (
          <div className="hurby-card" key={listing.id}>
            <div className="hurby-thumb-box">
              {thumbnailUrl ? (
                <img
                  src={thumbnailUrl}
                  alt="Foto do imovel"
                  className="hurby-thumb"
                />
              ) : (
                <span className="muted">Sem foto</span>
              )}
            </div>

            <div style={{ flex: 1 }}>
              <h3>
                {listing.title}
                <MarketplaceTag listing={listing} />
              </h3>

              <p>{listing.description || 'Sem descricao.'}</p>

              <p>
                <strong>Preco:</strong> {listing.price ?? '-'}
              </p>

              <p>
                <strong>Status:</strong> {listing.listing_status?.label || '-'}
              </p>

              <p>
                <strong>Contexto:</strong>{' '}
                {listing.property_business_context?.label || '-'}
              </p>

              <p>
                <strong>Visibilidade:</strong> {listing.visibility_scope || '-'}
              </p>

              <p>
                <strong>Origem:</strong>{' '}
                {isMarketplaceListing(listing)
                  ? 'Marketplace usuario comum'
                  : 'Operacional profissional'}
              </p>

              <p>
                <strong>Asset:</strong> {listing.property_asset_id}
              </p>

              <p>
                <Link
                  className="button-link"
                  href={`/operations/properties/${listing.id}`}
                >
                  Abrir checkup
                </Link>

                <Link
                  className="button-link"
                  href={`/operations/properties/${listing.id}/edit`}
                >
                  Editar anuncio
                </Link>

                <Link
                  className="button-link"
                  href={`/operations/properties/${listing.id}/assessment`}
                >
                  Ficha profissional
                </Link>
              </p>
            </div>
          </div>
        )
      })}

      {status && <p>{status}</p>}

      <p>
        <Link className="button-link" href="/operations/properties/new">
          Cadastrar novo imovel
        </Link>
      </p>

      <button onClick={handleLogout}>Logout</button>
    </main>
  )
}