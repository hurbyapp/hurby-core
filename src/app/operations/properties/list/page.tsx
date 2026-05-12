'use client'

/*
=========================================================
HURBY
CORE_REAL_ESTATE_OPERATIONAL_FOUNDATION
PROPERTY LIST PAGE
LOCAL:
src/app/operations/properties/list/page.tsx

OBJETIVO:
Listar anuncios operacionais.

REGRA:
- anuncios profissionais seguem lista operacional normal
- anuncios MP podem aparecer no operacional somente para o proprio criador
- anuncios MP de terceiros nao aparecem
- tag visual: Cad. MP
=========================================================
*/

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { getPropertyListings } from '@/lib/services/propertyService'

function isMarketplaceListing(listing: any) {
  return listing?.metadata?.source === 'marketplace_user_listing'
}

function MarketplaceTag({ listing }: { listing: any }) {
  if (!isMarketplaceListing(listing)) return null

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
        <p>Carregando...</p>
      </main>
    )
  }

  return (
    <main style={{ padding: 24 }}>
      <nav
        style={{
          display: 'flex',
          gap: 12,
          borderBottom: '1px solid #ddd',
          paddingBottom: 12,
          marginBottom: 20,
          flexWrap: 'wrap',
        }}
      >
        <Link href="/broker">Broker</Link>
        <Link href="/agency">Agency</Link>
        <Link href="/account">Minha conta</Link>
        <Link href="/account/profile">Editar cadastro</Link>
        <Link href="/operations/properties">Imoveis</Link>
        <Link href="/operations/properties/new">Cadastrar imovel</Link>
        <Link href="/operations/properties/list">Listar imoveis</Link>
        <Link href="/statement">Extrato AXE</Link>
      </nav>

      <h1>Lista de Imoveis</h1>

      <p>Lista de anuncios operacionais vinculados ao Core Imobiliario.</p>

      <p style={{ fontSize: 13, color: '#666' }}>
        Cad. MP = cadastro criado pelo usuario comum no marketplace.
      </p>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {listings.length === 0 && !error && (
        <p>Nenhum imovel encontrado.</p>
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
            <Link href={`/operations/properties/${listing.id}`}>
              Abrir detalhe
            </Link>
            {' | '}
            <Link href={`/operations/properties/${listing.id}/edit`}>
              Editar
            </Link>
          </p>
        </div>
      ))}

      {status && <p>{status}</p>}

      <br />

      <p>
        <Link href="/operations/properties/new">Cadastrar novo imovel</Link>
      </p>

      <button onClick={handleLogout}>Logout</button>
    </main>
  )
}
