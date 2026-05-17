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
- Acoplar Pipeline Pro e fluxo separado.
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

      {/* PROPERTY_LIST_PIPELINE_ATTACH_NOTE_V1 */}
      {/*
        ORIENTACAO PARA CODEX / EXECUTORES FUTUROS:
        - Esta lista nao deve virar lista detalhada do Pipeline Pro.
        - A lista mostra imóveis/anúncios existentes na carteira.
        - O Pipeline Pro pode ser acoplado futuramente a um anúncio já existente.
        - Isso permite melhorar anúncio básico, revisar estratégia, abrir dossiê e profissionalizar gestão.
        - Não conectar banco, migrations, RPC, RLS ou services aqui sem auditoria.
        - Codex pode corrigir acentuação e refinar layout mantendo UTF-8.

        PROPERTY_LIST_BUTTON_SEMANTICS_V1

        PROPERTY_LIST_ATTACH_PIPELINE_ACTION_V1
        Ajuste de produto:
        - O antigo botão "Ficha profissional" deve ser tratado como legado.
        - O novo conceito é "Acoplar Pipeline Pro".
        - Ao acoplar, o anúncio existente não recomeça do zero.
        - O Pipeline Pro deve iniciar em estágio mais avançado, aproveitando dados preliminares já cadastrados no anúncio.
        - Futuro ideal: rota com listingId/contexto, exemplo:
          /operations/pipeline/atendimento?listingId=<id>&mode=attach
        - Não implementar persistência sem revisar schema/service/RLS.

        Semantica futura dos botoes:
        1. Abrir Checkup:
           Deve evoluir para Dossie/Checkup de qualidade do anuncio.
           Avalia montagem do anuncio, dados estruturais, cliente vinculado,
           portfolio, anuncio chaveado, fotos, dimensoes, extensoes, peso,
           qualidade das imagens, vinculos e, quando for Anuncio Pro, tambem
           resumo executivo, estrategia, indicadores de levantamento, documentacao
           e conteudo consolidado do Pipeline Pro.

        2. Editar anuncio:
           Deve permanecer como edicao do anuncio publico/profissional.
           Corrige descricao, fotos, preco, dados publicaveis, distribuicao,
           parcerias, balcao de negocios, turbinamento com Axe, indexacao e redes.
           Nao deve virar Pipeline Pro.

        3. Acoplar Pipeline Pro:
           Nome atual legado.
           Deve virar "Acoplar Pipeline Pro" ou equivalente.
           Deve iniciar o Pipeline Pro em fase mais avancada quando o anuncio
           ja possui dados preliminares. A ficha longa isolada deve deixar de ser
           a experiencia principal.

        4. Diagnostico automatico Hurby:
           Futuramente o Diagnostico/Risco ou Inteligencia Estrategica deve usar
           levantamentos automaticos: media interna do ecossistema, media externa
           quando houver integracao com portais, media do portfolio da agencia/
           corretor, tempo medio de vida de anuncio por perfil/faixa de preco,
           indicadores de liquidez e ferramentas internas de pesquisa de mercado.
      */}
      <section
        style={{
          border: '1px solid #dbe3ea',
          borderRadius: 18,
          padding: 20,
          background: '#f8fafc',
          marginBottom: 20,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 13,
            color: '#667085',
            textTransform: 'uppercase',
            letterSpacing: 0.8,
          }}
        >
          Evolução profissional da carteira
        </p>

        <h2 style={{ marginBottom: 10 }}>
          Anúncios existentes também podem evoluir
        </h2>

        <p
          style={{
            maxWidth: 860,
            color: '#5f6b7a',
            lineHeight: 1.6,
            marginBottom: 16,
          }}
        >
          Esta lista mostra imóveis e anúncios já existentes na carteira. Alguns nasceram
          pelo formulário básico, outros podem nascer pelo Pipeline Pro. O objetivo
          aqui não é repetir a esteira, mas permitir que qualquer anúncio existente
          possa evoluir: melhorar qualidade, revisar dados, acoplar Pipeline Pro,
          abrir Dossiê, ajustar publicação e profissionalizar a gestão.
        </p>

        <div
          style={{
            display: 'flex',
            gap: 10,
            flexWrap: 'wrap',
          }}
        >
          <a
            href="/operations/pipeline"
            style={{
              display: 'inline-flex',
              padding: '10px 14px',
              borderRadius: 10,
              background: '#2563eb',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 800,
            }}
          >
            Abrir Pipeline Pro
          </a>

          <a
            href="/operations/pipeline/atendimento"
            style={{
              display: 'inline-flex',
              padding: '10px 14px',
              borderRadius: 10,
              border: '1px solid #d7dee8',
              background: '#fff',
              color: '#344054',
              textDecoration: 'none',
              fontWeight: 700,
            }}
          >
            Iniciar Anúncio Placeholder
          </a>
        </div>
      </section>

      {/* PROPERTY_LIST_VISIBLE_BUTTON_GUIDE_V1 */}
      <section
        style={{
          border: '1px solid #d7dee8',
          borderRadius: 16,
          padding: 16,
          background: '#fff',
          marginBottom: 20,
        }}
      >
        <h3 style={{ marginTop: 0 }}>Como trabalhar anúncios existentes</h3>

        <p style={{ color: '#667085', lineHeight: 1.5, marginBottom: 14 }}>
          Esta lista não substitui o Pipeline Pro. Ela mantém os imóveis e anúncios
          no radar da carteira. A partir daqui, o profissional pode avaliar a
          qualidade do anúncio, editar a publicação ou acoplar o Pipeline Pro para
          transformar um anúncio básico em operação profissional.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: 10,
          }}
        >
          <div style={{ border: '1px solid #d7dee8', borderRadius: 12, padding: 12, background: '#f8fafc' }}>
            <strong>Abrir Checkup / Dossiê</strong>
            <p style={{ marginBottom: 0, color: '#667085', fontSize: 13, lineHeight: 1.4 }}>
              Avalia a qualidade geral do anúncio/imóvel, dados estruturais,
              cliente vinculado, fotos, histórico, estratégia e informações
              consolidadas.
            </p>
          </div>

          <div style={{ border: '1px solid #d7dee8', borderRadius: 12, padding: 12, background: '#f8fafc' }}>
            <strong>Editar anúncio</strong>
            <p style={{ marginBottom: 0, color: '#667085', fontSize: 13, lineHeight: 1.4 }}>
              Corrige a publicação: descrição, fotos, preço, dados publicáveis,
              distribuição, parcerias, indexação, redes e recursos profissionais.
            </p>
          </div>

          <div style={{ border: '1px solid #2563eb', borderRadius: 12, padding: 12, background: '#eff6ff' }}>
            <strong>Acoplar Pipeline Pro</strong>
            <p style={{ marginBottom: 0, color: '#475467', fontSize: 13, lineHeight: 1.4 }}>
              Substitui a antiga Pipeline Pro. Inicia o Pipeline Pro em fase
              mais avançada quando o anúncio já possui dados preliminares.
            </p>
          </div>
        </div>
      </section>



      <h1>Lista de imoveis</h1>

      <p>
        Esta lista mostra os anuncios/imoveis operacionais vinculados ao Core Imobiliario.
      </p>

      <p className="muted">
        A foto exibida no card vem da galeria publica do anuncio. A Pipeline Pro fica separada.
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
                  href={`/operations/pipeline/atendimento?listingId=${listing.id}&mode=attach`}
                >
                  Acoplar Pipeline Pro
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