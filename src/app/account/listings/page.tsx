'use client'

/*
=========================================
HURBY — MARKETPLACE ACCOUNT LISTINGS
LOCAL:
src/app/account/listings/page.tsx

OBJETIVO:
Listar anuncios criados pelo usuario comum marketplace.

REGRA:
- usuario comum ve apenas seus anuncios marketplace
- fluxo separado do painel profissional
- segundo anuncio gratuito bloqueado pela RPC
=========================================
*/

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { getMyMarketplaceListings } from '@/lib/services/marketplaceListingService'

function MarketplaceTag() {
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

export default function AccountListingsPage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [listings, setListings] = useState<any[]>([])
  const [status, setStatus] = useState('')

  useEffect(() => {
    loadListings()
  }, [])

  const loadListings = async () => {
    try {
      setLoading(true)
      setStatus('')

      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()

      if (!currentUser) {
        window.location.href = '/login'
        return
      }

      setUser(currentUser)

      const { data, error } = await getMyMarketplaceListings()

      if (error) {
        console.error('MARKETPLACE LISTINGS LOAD ERROR:', error)
        setStatus('Erro ao carregar anuncios.')
        return
      }

      const ownListings = (data || []).filter(
        (item: any) => item.created_by_profile_id === currentUser.id
      )

      setListings(ownListings)
    } catch (error) {
      console.error('MARKETPLACE LISTINGS FAILURE:', error)
      setStatus('Erro inesperado ao carregar anuncios.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    setStatus('Saindo...')
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (loading) {
    return <main style={{ padding: 40 }}>Carregando anuncios...</main>
  }

  return (
    <main style={{ padding: 40, maxWidth: 980, margin: '40px auto' }}>
      <nav
        style={{
          display: 'flex',
          gap: 12,
          borderBottom: '1px solid #ddd',
          paddingBottom: 12,
          marginBottom: 24,
          flexWrap: 'wrap',
        }}
      >
        <Link href="/account">Minha conta</Link>
        <Link href="/account/profile">Editar cadastro</Link>
        <Link href="/account/listings">Meus anuncios</Link>
        <Link href="/account/listings/new">Anunciar imovel</Link>
        <Link href="/login">Login</Link>
      </nav>

      <h1>Meus anuncios</h1>

      <p>
        <strong>Usuario:</strong> {user?.email}
      </p>

      <p>
        Regra atual: 1 anuncio gratuito por usuario marketplace. O segundo
        anuncio sera monetizado futuramente.
      </p>

      <p style={{ fontSize: 13, color: '#666' }}>
        Cad. MP = cadastro criado pelo usuario comum no marketplace.
      </p>

      {listings.length === 0 && (
        <section
          style={{
            border: '1px solid #ddd',
            padding: 20,
            borderRadius: 12,
          }}
        >
          <p>Voce ainda nao possui anuncio marketplace.</p>
          <Link href="/account/listings/new">
            Criar meu primeiro anuncio gratuito
          </Link>
        </section>
      )}

      {listings.length >= 1 && (
        <section
          style={{
            border: '1px solid #ddd',
            padding: 20,
            borderRadius: 12,
            marginBottom: 20,
          }}
        >
          <p>
            Voce ja usou seu anuncio gratuito. Novo anuncio exigira
            monetizacao futura.
          </p>
          <Link href="/account/listings/new">Tentar novo anuncio</Link>
        </section>
      )}

      {listings.map((listing) => {
        const asset = Array.isArray(listing.property_assets)
          ? listing.property_assets[0]
          : listing.property_assets

        const locations = asset?.property_asset_locations || []
        const features = asset?.property_asset_features || []
        const location = Array.isArray(locations) ? locations[0] : locations
        const feature = Array.isArray(features) ? features[0] : features

        return (
          <section
            key={listing.id}
            style={{
              border: '1px solid #ddd',
              padding: 20,
              borderRadius: 12,
              marginBottom: 16,
            }}
          >
            <h2>
              {listing.title}
              <MarketplaceTag />
            </h2>

            <p>{listing.description || 'Sem descricao.'}</p>

            <p>
              <strong>Valor:</strong> {listing.price ?? '-'}
            </p>
            <p>
              <strong>Condominio:</strong> {listing.condo_fee ?? '-'}
            </p>
            <p>
              <strong>IPTU:</strong> {listing.iptu_value ?? '-'}
            </p>
            <p>
              <strong>Finalidade:</strong>{' '}
              {listing.property_business_context?.label || '-'}
            </p>
            <p>
              <strong>Status:</strong> {listing.listing_status?.label || '-'}
            </p>
            <p>
              <strong>Cidade:</strong> {location?.city || '-'}
            </p>
            <p>
              <strong>Bairro:</strong> {location?.neighborhood || '-'}
            </p>
            <p>
              <strong>Quartos:</strong> {feature?.bedrooms ?? '-'}
            </p>
            <p>
              <strong>Suites:</strong> {feature?.suites ?? '-'}
            </p>
            <p>
              <strong>Banheiros:</strong> {feature?.bathrooms ?? '-'}
            </p>
            <p>
              <strong>Vagas:</strong> {feature?.garage_spaces ?? '-'}
            </p>
            <p>
              <strong>Padrao:</strong> {asset?.property_standard || '-'}
            </p>
            <p>
              <strong>Condominio/Edificio:</strong>{' '}
              {asset?.condominium_name || asset?.building_name || '-'}
            </p>

            <Link href={`/account/listings/${listing.id}/edit`}>
              Editar anuncio
            </Link>
          </section>
        )
      })}

      {!!status && <p>{status}</p>}

      <button onClick={handleLogout}>Logout</button>
    </main>
  )
}
