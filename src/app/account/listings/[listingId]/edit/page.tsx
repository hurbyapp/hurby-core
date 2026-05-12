'use client'

/*
=========================================
HURBY — MARKETPLACE LISTING EDIT
LOCAL:
src/app/account/listings/[listingId]/edit/page.tsx

OBJETIVO:
Editar anuncio simples do usuario comum marketplace.

REGRA:
- usuario so edita anuncio marketplace criado por ele
- titulo e o unico campo minimo nesta fase de testes
- fluxo separado do painel profissional
=========================================
*/

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import {
  getMyMarketplaceListingById,
  updateMarketplaceUserListing,
} from '@/lib/services/marketplaceListingService'

const propertyTypes = [
  { value: 'house', label: 'Casa' },
  { value: 'condominium_house', label: 'Casa em Condominio' },
  { value: 'apartment', label: 'Apartamento' },
  { value: 'storefront', label: 'Loja/Comercial' },
  { value: 'warehouse', label: 'Barracao/Galpao' },
  { value: 'land', label: 'Terreno/Lote' },
  { value: 'farm', label: 'Chacara/Sitio/Fazenda' },
]

const businessContexts = [
  { value: 'sale', label: 'Venda' },
  { value: 'rental', label: 'Locacao' },
  { value: 'lease', label: 'Arrendamento' },
]

const propertyStandards = [
  { value: '', label: 'Nao informado' },
  { value: 'popular', label: 'Popular' },
  { value: 'standard', label: 'Padrao' },
  { value: 'medium', label: 'Medio' },
  { value: 'elevated', label: 'Elevado' },
  { value: 'high', label: 'Alto' },
  { value: 'luxury', label: 'Luxo' },
]

export default function EditMarketplaceListingPage() {
  const params = useParams()
  const listingId = String(params.listingId)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')

  const [form, setForm] = useState<any>({
    title: '',
    property_type_slug: 'house',
    property_business_context_slug: 'sale',
    listing_status_slug: 'draft',
    description: '',
    price: '',
    condo_fee: '',
    iptu_value: '',
    property_standard: '',
    condominium_name: '',
    building_name: '',
    is_gated_community: '',
    has_condominium_pool: '',
    accepts_financing: '',
    zip_code: '',
    state: '',
    city: '',
    neighborhood: '',
    street: '',
    number: '',
    complement: '',
    hide_public_number: false,
    bedrooms: '',
    suites: '',
    bathrooms: '',
    garage_spaces: '',
    private_area: '',
    total_area: '',
    is_furnished: '',
    has_private_pool: '',
    sun_position: '',
    floor_number: '',
    total_floors: '',
    has_elevator: '',
  })

  useEffect(() => {
    loadListing()
  }, [])

  const update = (key: string, value: any) => {
    setForm((current: any) => ({ ...current, [key]: value }))
  }

  const toNumber = (value: any) => {
    if (value === '' || value === null || value === undefined) return null
    const parsed = Number(value)
    return Number.isNaN(parsed) ? null : parsed
  }

  const toBoolean = (value: any) => {
    if (value === '') return null
    return value === 'true'
  }

  const toSelectBoolean = (value: any) => {
    if (value === null || value === undefined) return ''
    return value ? 'true' : 'false'
  }

  const loadListing = async () => {
    try {
      setLoading(true)
      setStatus('')

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        window.location.href = '/login'
        return
      }

      const { data, error } = await getMyMarketplaceListingById(listingId)

      if (error || !data) {
        console.error('LOAD MARKETPLACE LISTING ERROR:', error)
        setStatus('Anuncio nao encontrado ou sem permissao.')
        setLoading(false)
        return
      }

      if (data.created_by_profile_id !== user.id) {
        setStatus('Voce nao tem permissao para editar este anuncio.')
        setLoading(false)
        return
      }

      const asset = Array.isArray(data.property_assets)
        ? data.property_assets[0]
        : data.property_assets

      const locations = asset?.property_asset_locations || []
      const features = asset?.property_asset_features || []
      const location = Array.isArray(locations) ? locations[0] : locations
      const feature = Array.isArray(features) ? features[0] : features

      setForm({
        title: data.title || '',
        property_type_slug: 'house',
        property_business_context_slug: data.property_business_context?.slug || 'sale',
        listing_status_slug: data.listing_status?.slug || 'draft',
        description: data.description || '',
        price: data.price ?? '',
        condo_fee: data.condo_fee ?? '',
        iptu_value: data.iptu_value ?? '',
        property_standard: asset?.property_standard || '',
        condominium_name: asset?.condominium_name || '',
        building_name: asset?.building_name || '',
        is_gated_community: toSelectBoolean(asset?.is_gated_community),
        has_condominium_pool: toSelectBoolean(asset?.has_condominium_pool),
        accepts_financing: toSelectBoolean(asset?.accepts_financing),
        zip_code: location?.zip_code || '',
        state: location?.state || '',
        city: location?.city || '',
        neighborhood: location?.neighborhood || '',
        street: location?.street || '',
        number: location?.number || '',
        complement: location?.complement || '',
        hide_public_number: !!location?.hide_public_number,
        bedrooms: feature?.bedrooms ?? '',
        suites: feature?.suites ?? '',
        bathrooms: feature?.bathrooms ?? '',
        garage_spaces: feature?.garage_spaces ?? '',
        private_area: feature?.private_area ?? '',
        total_area: feature?.total_area ?? '',
        is_furnished: toSelectBoolean(feature?.is_furnished),
        has_private_pool: toSelectBoolean(feature?.has_private_pool),
        sun_position: feature?.sun_position || '',
        floor_number: feature?.floor_number ?? '',
        total_floors: feature?.total_floors ?? '',
        has_elevator: toSelectBoolean(feature?.has_elevator),
      })
    } catch (error) {
      console.error('LOAD MARKETPLACE LISTING FAILURE:', error)
      setStatus('Erro inesperado ao carregar anuncio.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (saving) return

    try {
      setSaving(true)
      setStatus('')

      if (!form.title || form.title.trim().length === 0) {
        setStatus('Informe pelo menos o titulo do anuncio.')
        return
      }

      const { error } = await updateMarketplaceUserListing(listingId, {
        title: form.title,
        property_type_slug: form.property_type_slug,
        property_business_context_slug: form.property_business_context_slug,
        listing_status_slug: form.listing_status_slug,
        description: form.description,
        price: toNumber(form.price),
        condo_fee: toNumber(form.condo_fee),
        iptu_value: toNumber(form.iptu_value),
        property_standard: form.property_standard || null,
        condominium_name: form.condominium_name,
        building_name: form.building_name,
        is_gated_community: toBoolean(form.is_gated_community),
        has_condominium_pool: toBoolean(form.has_condominium_pool),
        accepts_financing: toBoolean(form.accepts_financing),
        zip_code: form.zip_code,
        state: form.state,
        city: form.city,
        neighborhood: form.neighborhood,
        street: form.street,
        number: form.number,
        complement: form.complement,
        hide_public_number: !!form.hide_public_number,
        bedrooms: toNumber(form.bedrooms),
        suites: toNumber(form.suites),
        bathrooms: toNumber(form.bathrooms),
        garage_spaces: toNumber(form.garage_spaces),
        private_area: toNumber(form.private_area),
        total_area: toNumber(form.total_area),
        is_furnished: toBoolean(form.is_furnished),
        has_private_pool: toBoolean(form.has_private_pool),
        sun_position: form.sun_position || null,
        floor_number: toNumber(form.floor_number),
        total_floors: toNumber(form.total_floors),
        has_elevator: toBoolean(form.has_elevator),
        metadata: {
          form_version: 'marketplace_basic_v1',
          updated_from: 'account_listing_edit',
        },
      })

      if (error) {
        console.error('UPDATE MARKETPLACE LISTING ERROR:', error)
        setStatus(error.message || 'Erro ao atualizar anuncio.')
        return
      }

      setStatus('Anuncio atualizado.')
    } catch (error) {
      console.error('UPDATE MARKETPLACE LISTING FAILURE:', error)
      setStatus('Erro inesperado ao atualizar anuncio.')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    setStatus('Saindo...')
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (loading) {
    return <main style={{ padding: 40 }}>Carregando anuncio...</main>
  }

  return (
    <main style={{ padding: 40, maxWidth: 980, margin: '40px auto' }}>
      <nav style={{ display: 'flex', gap: 12, borderBottom: '1px solid #ddd', paddingBottom: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <Link href="/account">Minha conta</Link>
        <Link href="/account/profile">Editar cadastro</Link>
        <Link href="/account/listings">Meus anuncios</Link>
        <Link href="/account/listings/new">Anunciar imovel</Link>
        <Link href="/login">Login</Link>
      </nav>

      <h1>Editar anuncio</h1>

      <p>Nesta fase de testes, somente o titulo e obrigatorio.</p>

      <section style={{ border: '1px solid #ddd', padding: 20, borderRadius: 12, marginBottom: 20 }}>
        <h2>Apresentacao</h2>

        <input placeholder="Titulo do anuncio" value={form.title} onChange={(e) => update('title', e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 12 }} />

        <textarea placeholder="Descricao comercial" value={form.description} onChange={(e) => update('description', e.target.value)} style={{ width: '100%', padding: 12, minHeight: 100, marginBottom: 12 }} />

        <select value={form.property_business_context_slug} onChange={(e) => update('property_business_context_slug', e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 12 }}>
          {businessContexts.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>

        <select value={form.property_type_slug} onChange={(e) => update('property_type_slug', e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 12 }}>
          {propertyTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>

        <select value={form.property_standard} onChange={(e) => update('property_standard', e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 12 }}>
          {propertyStandards.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
      </section>

      <section style={{ border: '1px solid #ddd', padding: 20, borderRadius: 12, marginBottom: 20 }}>
        <h2>Valores</h2>

        <input placeholder="Valor principal" type="number" value={form.price} onChange={(e) => update('price', e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 12 }} />
        <input placeholder="Valor do condominio" type="number" value={form.condo_fee} onChange={(e) => update('condo_fee', e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 12 }} />
        <input placeholder="Valor do IPTU" type="number" value={form.iptu_value} onChange={(e) => update('iptu_value', e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 12 }} />
      </section>

      <section style={{ border: '1px solid #ddd', padding: 20, borderRadius: 12, marginBottom: 20 }}>
        <h2>Endereco</h2>

        <input placeholder="CEP" value={form.zip_code} onChange={(e) => update('zip_code', e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 12 }} />
        <input placeholder="Rua / Logradouro" value={form.street} onChange={(e) => update('street', e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 12 }} />
        <input placeholder="Numero" value={form.number} onChange={(e) => update('number', e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 12 }} />
        <input placeholder="Complemento" value={form.complement} onChange={(e) => update('complement', e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 12 }} />
        <input placeholder="Bairro" value={form.neighborhood} onChange={(e) => update('neighborhood', e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 12 }} />
        <input placeholder="Cidade" value={form.city} onChange={(e) => update('city', e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 12 }} />
        <input placeholder="UF" maxLength={2} value={form.state} onChange={(e) => update('state', e.target.value.toUpperCase())} style={{ width: '100%', padding: 12, marginBottom: 12 }} />

        <label style={{ display: 'flex', gap: 8 }}>
          <input type="checkbox" checked={form.hide_public_number} onChange={(e) => update('hide_public_number', e.target.checked)} />
          Ocultar numero exato no anuncio publico
        </label>
      </section>

      <section style={{ border: '1px solid #ddd', padding: 20, borderRadius: 12, marginBottom: 20 }}>
        <h2>Caracteristicas</h2>

        <input placeholder="Nome do condominio" value={form.condominium_name} onChange={(e) => update('condominium_name', e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 12 }} />
        <input placeholder="Nome do edificio" value={form.building_name} onChange={(e) => update('building_name', e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 12 }} />

        <input placeholder="Quartos" type="number" value={form.bedrooms} onChange={(e) => update('bedrooms', e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 12 }} />
        <input placeholder="Suites" type="number" value={form.suites} onChange={(e) => update('suites', e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 12 }} />
        <input placeholder="Banheiros" type="number" value={form.bathrooms} onChange={(e) => update('bathrooms', e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 12 }} />
        <input placeholder="Vagas" type="number" value={form.garage_spaces} onChange={(e) => update('garage_spaces', e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 12 }} />

        <input placeholder="Area privativa/construida" type="number" value={form.private_area} onChange={(e) => update('private_area', e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 12 }} />
        <input placeholder="Area total/terreno" type="number" value={form.total_area} onChange={(e) => update('total_area', e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 12 }} />

        <select value={form.sun_position} onChange={(e) => update('sun_position', e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 12 }}>
          <option value="">Posicao solar nao informada</option>
          <option value="morning">Sol da manha</option>
          <option value="afternoon">Sol da tarde</option>
        </select>

        <select value={form.is_furnished} onChange={(e) => update('is_furnished', e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 12 }}>
          <option value="">Mobiliado?</option>
          <option value="true">Sim</option>
          <option value="false">Nao</option>
        </select>

        <select value={form.has_private_pool} onChange={(e) => update('has_private_pool', e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 12 }}>
          <option value="">Piscina privativa?</option>
          <option value="true">Sim</option>
          <option value="false">Nao</option>
        </select>

        <select value={form.has_condominium_pool} onChange={(e) => update('has_condominium_pool', e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 12 }}>
          <option value="">Piscina no condominio?</option>
          <option value="true">Sim</option>
          <option value="false">Nao</option>
        </select>

        <select value={form.has_elevator} onChange={(e) => update('has_elevator', e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 12 }}>
          <option value="">Possui elevador?</option>
          <option value="true">Sim</option>
          <option value="false">Nao</option>
        </select>

        <input placeholder="Andar do apartamento" type="number" value={form.floor_number} onChange={(e) => update('floor_number', e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 12 }} />
        <input placeholder="Total de andares" type="number" value={form.total_floors} onChange={(e) => update('total_floors', e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 12 }} />
      </section>

      <button onClick={handleSubmit} disabled={saving} style={{ width: '100%', padding: 12 }}>
        {saving ? 'Salvando...' : 'Salvar alteracoes'}
      </button>

      {!!status && <p style={{ marginTop: 16, color: 'red' }}>{status}</p>}

      <br /><br />

      <button onClick={handleLogout}>Logout</button>
    </main>
  )
}
