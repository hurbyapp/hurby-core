'use client'

/*
=========================================================
HURBY — CORE_PROPERTIES_FORM_V1
ARQUIVO:
src/app/operations/properties/[listingId]/page.tsx

RESPONSABILIDADE:
Exibir o checkup interno do imóvel profissional.

REGRA DE PRODUTO:
- Anúncio é peça pública/comercial.
- Documento Profissional é documento técnico interno/adicional.
- Checkup é tela interna de conferência.
- Upload de fotos não pertence ao checkup.
- Fotos públicas do anúncio ficam em property_listing_media.
- Fotos técnicas da ficha terão estrutura própria futura.

PODE ALTERAR:
- português, acentuação e comunicação com usuário
- layout visual
- cards
- organização das seções
- impressão
- responsividade

MANTER UTF-8.
NÃO ALTERAR SEM MISSÃO ESPECÍFICA:
- contratos da propertyService
- nomes técnicos
- regras LGPD
- RPCs
- ledger/AXE
- marketplace/leads/contracts

CODEX:
Pode corrigir texto, acentuação e comunicação diretamente no VS Code/editor,
mantendo UTF-8. Não alterar arquitetura, regras de negócio, service contracts
ou nomes técnicos sem missão específica.
=========================================================
*/

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

import { supabase } from '@/lib/supabaseClient'

import {
  getProfessionalAssessmentByListingId,
  getPropertyListingById,
} from '@/lib/services/propertyService'

function formatValue(value: any) {
  if (value === null || value === undefined || value === '') {
    return '-'
  }

  if (typeof value === 'boolean') {
    return value ? 'Sim' : 'Não'
  }

  if (Array.isArray(value)) {
    return value.length ? value.map((item) => formatValue(item)).join(', ') : '-'
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value)

    if (entries.length === 0) {
      return '-'
    }

    return entries
      .map(([key, itemValue]) => `${formatJsonKey(key)}: ${formatValue(itemValue)}`)
      .join('\n')
  }

  return String(value)
}

function getJsonValue(source: any, key: string) {
  if (!source || typeof source !== 'object') {
    return '-'
  }

  return formatValue(source[key])
}

function formatJsonKey(key: string) {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function InfoLine({
  label,
  value,
}: {
  label: string
  value: any
}) {
  return (
    <div className="checkup-line">
      <div className="checkup-label">{label}</div>
      <div className="checkup-value">{formatValue(value)}</div>
    </div>
  )
}

function JsonLine({
  label,
  source,
  field,
}: {
  label: string
  source: any
  field: string
}) {
  return (
    <div className="checkup-line">
      <div className="checkup-label">{label}</div>
      <div className="checkup-value">{getJsonValue(source, field)}</div>
    </div>
  )
}

function JsonObjectLines({
  source,
}: {
  source: any
}) {
  if (!source || typeof source !== 'object') {
    return (
      <div className="checkup-line">
        <div className="checkup-label">Status</div>
        <div className="checkup-value">Sem dados salvos neste módulo.</div>
      </div>
    )
  }

  return (
    <>
      {Object.entries(source).map(([key, value]) => (
        <div className="checkup-line" key={key}>
          <div className="checkup-label">{formatJsonKey(key)}</div>
          <div className="checkup-value">{formatValue(value)}</div>
        </div>
      ))}
    </>
  )
}

function ModuleBlock({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: React.ReactNode
}) {
  return (
    <>
      <div className="checkup-module-heading" id={id}>
        <h3>{title}</h3>
        <a className="checkup-page-up" href="#documento-profissional-v1">
          Page up
        </a>
      </div>

      <div className="checkup-module-box">
        {children}
      </div>
    </>
  )
}

export default function PropertyDetailPage() {
  const params = useParams()
  const listingId = params.listingId as string

  const [loading, setLoading] = useState(true)
  const [listing, setListing] = useState<any>(null)
  const [assessment, setAssessment] = useState<any>(null)
  const [mediaUrls, setMediaUrls] = useState<any[]>([])
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

      const [listingResponse, assessmentResponse] = await Promise.all([
        getPropertyListingById(listingId),
        getProfessionalAssessmentByListingId(listingId),
      ])

      if (listingResponse.error) {
        setStatus(listingResponse.error.message)
        setLoading(false)
        return
      }

      const listingData = listingResponse.data
      setListing(listingData)
      setAssessment(assessmentResponse.data || null)

      const mediaRecords = listingData?.property_listing_media || []

      const signedUrls = await Promise.all(
        mediaRecords.map(async (media: any) => {
          if (!media?.storage_path) {
            return null
          }

          const signed = await supabase.storage
            .from('property-media')
            .createSignedUrl(media.storage_path, 3600)

          return {
            id: media.id,
            storage_path: media.storage_path,
            url: signed.data?.signedUrl || null,
          }
        })
      )

      setMediaUrls(signedUrls.filter(Boolean))
      setLoading(false)
    }

    init()
  }, [listingId])

  if (loading) {
    return (
      <main style={{ padding: 24 }}>
        <p>Carregando checkup do imóvel...</p>
      </main>
    )
  }

  if (!listing) {
    return (
      <main style={{ padding: 24 }}>
        <p>
          <a href="/operations/properties/list">
            Voltar para lista
          </a>
        </p>

        <h1>Imóvel não encontrado</h1>

        {status && <p>{status}</p>}
      </main>
    )
  }

  const asset = listing.property_assets || {}
  const location = asset.property_asset_locations?.[0] || {}
  const features = asset.property_asset_features?.[0] || {}
  const portfolioItem = listing.portfolio_items?.[0] || null
  const assessmentMetadata = assessment?.metadata || {}

  return (
    <main className="checkup-page">
      <style jsx global>{`
        body {
          background: #f3f5f7;
        }

        @media print {
          .no-print {
            display: none !important;
          }

          body {
            background: #fff;
          }

          .checkup-page {
            max-width: none !important;
            padding: 0 !important;
          }

          .checkup-v1-shell,
          .hurby-section,
          .checkup-module-box {
            box-shadow: none !important;
            break-inside: avoid;
          }
        }

        input,
        textarea,
        select {
          border: 1px solid #999;
          border-radius: 8px;
          padding: 8px 10px;
          min-height: 36px;
          box-sizing: border-box;
          background: #fff;
        }

        button,
        .button-link {
          border: 1px solid #333;
          border-radius: 8px;
          padding: 8px 12px;
          background: #fff;
          color: #111;
          text-decoration: none;
          display: inline-block;
          cursor: pointer;
          margin: 0 8px 8px 0;
          font-size: 14px;
        }

        .checkup-page {
          padding: 24px;
          max-width: 1180px;
          margin: 0 auto;
          color: #172033;
        }

        .hurby-section {
          border: 1px solid #d8e0ea;
          border-radius: 18px;
          padding: 18px;
          margin: 18px 0;
          background: #fff;
          box-shadow: 0 10px 26px rgba(15, 23, 42, 0.05);
        }

        .hurby-photo-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 12px;
          margin-top: 12px;
        }

        .hurby-photo-card {
          border: 1px solid #ddd;
          border-radius: 12px;
          overflow: hidden;
          background: #f7f7f7;
        }

        .hurby-photo {
          width: 100%;
          height: 150px;
          object-fit: cover;
          display: block;
        }

        .muted {
          color: #666;
          font-size: 14px;
        }

        .checkup-v1-shell {
          border: 1px solid #d8e0ea;
          border-radius: 18px;
          background: #f8fafc;
          padding: 18px;
          margin-top: 18px;
        }

        .checkup-v1-nav {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding: 12px;
          border: 1px solid #dbe3ec;
          border-radius: 16px;
          background: #fff;
          margin: 12px 0 18px;
        }

        .checkup-v1-nav a {
          text-decoration: none;
          border: 1px solid #dbe3ec;
          border-radius: 999px;
          padding: 7px 10px;
          color: #334155;
          background: #f8fafc;
          font-size: 12px;
          font-weight: 700;
        }

        .checkup-v1-nav a:hover {
          border-color: #94a3b8;
          background: #eef4fb;
        }

        .checkup-module-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin: 24px 0 8px;
        }

        .checkup-module-heading h3 {
          margin: 0;
          color: #172033;
          font-size: 18px;
        }

        .checkup-page-up {
          color: #2563eb;
          text-decoration: none;
          font-size: 12px;
          font-weight: 800;
          white-space: nowrap;
        }

        .checkup-page-up:hover {
          text-decoration: underline;
        }

        .checkup-module-box {
          background: #fff;
          border: 1px solid #dbe3ec;
          border-radius: 16px;
          padding: 14px 16px;
          box-shadow: 0 8px 22px rgba(15, 23, 42, 0.05);
        }

        .checkup-line {
          display: grid;
          grid-template-columns: minmax(180px, 34%) minmax(0, 1fr);
          gap: 14px;
          align-items: start;
          padding: 8px 0;
          border-bottom: 1px solid #edf1f5;
        }

        .checkup-line:last-child {
          border-bottom: 0;
        }

        .checkup-label {
          text-align: right;
          color: #64748b;
          font-weight: 800;
          font-size: 13px;
        }

        .checkup-value {
          text-align: left;
          color: #172033;
          font-size: 13px;
          line-height: 1.45;
          word-break: break-word;
          white-space: pre-wrap;
        }

        @media (max-width: 760px) {
          .checkup-page {
            padding: 16px;
          }

          .checkup-line {
            grid-template-columns: 1fr;
            gap: 4px;
          }

          .checkup-label {
            text-align: left;
          }

          .checkup-module-heading {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>

      <div className="no-print">
        <a className="button-link" href="/operations/properties/list">
          Voltar para lista
        </a>

        <a
          className="button-link"
          href={`/operations/properties/${listing.id}/edit`}
        >
          Editar anúncio
        </a>

        <a
          className="button-link"
          href={`/operations/properties/${listing.id}/assessment`}
        >
          {assessment ? 'Editar Documento Profissional' : 'Criar Documento Profissional'}
        </a>

        <button onClick={() => window.print()}>
          Imprimir checkup
        </button>
      </div>

      <h1 id="topo-checkup">Checkup interno do imóvel</h1>

      <div className="hurby-section">
        <h2>Orientação</h2>

        <p>
          Esta tela consolida as informações internas do imóvel. Ela serve para
          conferência, revisão, acompanhamento e futura impressão do dossiê.
        </p>

        <p>
          O anúncio é a peça comercial. O Documento Profissional é um documento
          técnico separado. Dados sensíveis, notas privadas e informações do
          proprietário não devem ser expostos publicamente sem regra específica.
        </p>

        <p className="muted">
          Upload de fotos deve ser feito no cadastro ou na edição do anúncio.
          Este checkup apenas exibe as informações já vinculadas.
        </p>
      </div>

      {status && (
        <div className="hurby-section">
          <strong>Status:</strong> {status}
        </div>
      )}

      <section className="hurby-section">
        <h2>1. Anúncio</h2>

        <InfoLine label="Título" value={listing.title} />
        <InfoLine label="Descrição" value={listing.description} />
        <InfoLine label="Preço" value={listing.price} />
        <InfoLine label="Status" value={listing.listing_status?.label} />
        <InfoLine label="Contexto" value={listing.property_business_context?.label} />
        <InfoLine label="Visibilidade" value={listing.visibility_scope} />
        <InfoLine label="Publicado em" value={listing.published_at} />
        <InfoLine label="Expira em" value={listing.expires_at} />
      </section>

      <section className="hurby-section">
        <h2>2. Fotos públicas do anúncio</h2>

        <p className="muted">
          Estas imagens pertencem ao anúncio comercial. Fotos técnicas da ficha
          profissional devem ter estrutura privada própria em etapa futura.
        </p>

        {mediaUrls.length === 0 && (
          <p>Nenhuma foto vinculada a este anúncio.</p>
        )}

        {mediaUrls.length > 0 && (
          <div className="hurby-photo-grid">
            {mediaUrls.map((media) => (
              <div className="hurby-photo-card" key={media.id}>
                {media.url ? (
                  <img
                    src={media.url}
                    alt="Foto pública do imóvel"
                    className="hurby-photo"
                  />
                ) : (
                  <p style={{ padding: 12 }}>
                    Não foi possível carregar esta imagem.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="hurby-section">
        <h2>3. Imóvel / Asset</h2>

        <InfoLine label="Asset ID" value={asset.id} />
        <InfoLine label="País" value={asset.country} />
        <InfoLine label="Ativo" value={asset.is_active} />
        <InfoLine label="Padrão" value={asset.property_standard} />
        <InfoLine label="Condomínio" value={asset.condominium_name} />
        <InfoLine label="Edifício" value={asset.building_name} />
        <InfoLine label="Condomínio fechado" value={asset.is_gated_community} />
        <InfoLine label="Piscina no condomínio" value={asset.has_condominium_pool} />
        <InfoLine label="Aceita financiamento" value={asset.accepts_financing} />
      </section>

      <section className="hurby-section">
        <h2>4. Localização</h2>

        <InfoLine label="CEP" value={location.zip_code || location.zipcode} />
        <InfoLine label="UF" value={location.state} />
        <InfoLine label="Cidade" value={location.city} />
        <InfoLine label="Bairro" value={location.neighborhood} />
        <InfoLine label="Rua" value={location.street} />
        <InfoLine label="Número" value={location.number} />
        <InfoLine label="Complemento" value={location.complement} />
        <InfoLine label="Ocultar número publicamente" value={location.hide_public_number} />
        <InfoLine label="Latitude" value={location.latitude} />
        <InfoLine label="Longitude" value={location.longitude} />
      </section>

      <section className="hurby-section">
        <h2>5. Características</h2>

        <InfoLine label="Quartos" value={features.bedrooms} />
        <InfoLine label="Suítes" value={features.suites} />
        <InfoLine label="Banheiros" value={features.bathrooms} />
        <InfoLine label="Vagas" value={features.garage_spaces} />
        <InfoLine label="Área privativa" value={features.private_area} />
        <InfoLine label="Área total" value={features.total_area} />
        <InfoLine label="Ano de construção" value={features.built_year} />
        <InfoLine label="Andar" value={features.floor_number} />
        <InfoLine label="Total de andares" value={features.total_floors} />
        <InfoLine label="Elevador" value={features.has_elevator} />
        <InfoLine label="Mobiliado" value={features.is_furnished ?? features.furnished} />
        <InfoLine label="Piscina privativa" value={features.has_private_pool} />
        <InfoLine label="Posição solar" value={features.sun_position} />
      </section>

      <section className="hurby-section">
        <h2>6. Portfolio</h2>

        {portfolioItem ? (
          <>
            <InfoLine label="Portfolio" value={portfolioItem.portfolio_id} />
            <InfoLine label="Status do item" value={portfolioItem.item_status} />
            <InfoLine label="Origem" value={portfolioItem.origin_type} />
            <InfoLine label="Visibilidade" value={portfolioItem.visibility_scope} />
          </>
        ) : (
          <p>Nenhum vínculo de portfolio encontrado.</p>
        )}
      </section>

      <section className="hurby-section">
        <h2 id="documento-profissional-v1">7. Documento Profissional V1</h2>

        {!assessment && (
          <>
            <p>Este anúncio ainda não possui Documento Profissional vinculado.</p>

            <p className="no-print">
              <a
                className="button-link"
                href={`/operations/properties/${listing.id}/assessment`}
              >
                Criar Documento Profissional
              </a>
            </p>
          </>
        )}

        {assessment && (
          <>
            <nav className="checkup-v1-nav" aria-label="Módulos do Documento Profissional V1">
              <a href="#v1-identificacao">Identificação</a>
              <a href="#v1-maturidade">Maturidade</a>
              <a href="#v1-base-comum">Base comum</a>
              <a href="#v1-preco">Preço</a>
              <a href="#v1-tecnica">Técnica</a>
              <a href="#v1-documentacao">Doc./Financeiro</a>
              <a href="#v1-entrevista">Entrevista</a>
              <a href="#v1-proposta">Proposta</a>
              <a href="#v1-casa">Casa</a>
              <a href="#v1-apartamento">Apartamento</a>
              <a href="#v1-terreno">Terreno</a>
              <a href="#v1-comercial">Comercial</a>
              <a href="#v1-rural">Rural</a>
              <a href="#v1-resumos">Resumos</a>
              <a href="#v1-privadas">Notas privadas</a>
              <a href="#topo-checkup">Page up</a>
            </nav>

            <div className="checkup-v1-shell">
              <ModuleBlock id="v1-identificacao" title="7.0 Identificação da ficha">
                <InfoLine label="Ficha ID" value={assessment.id} />
                <InfoLine label="Status da ficha" value={assessment.assessment_status} />
                <InfoLine label="Finalidade" value={assessment.assessment_purpose} />
                <InfoLine label="Disponível para parceria" value={assessment.is_available_for_partnership} />
                <InfoLine label="Exclusivo" value={assessment.is_exclusive} />
                <InfoLine label="Ocultar endereço para parceiros" value={assessment.hide_exact_address_for_partners} />
                <InfoLine label="Proprietário pode ver resumo" value={assessment.owner_can_view_summary} />
              </ModuleBlock>

              <ModuleBlock id="v1-maturidade" title="7.1 Maturidade do Documento V1">
                <JsonLine label="Base comum" source={assessmentMetadata} field="base_common_v1" />
                <JsonLine label="Estratégia de preço" source={assessmentMetadata} field="price_strategy_v1" />
                <JsonLine label="Avaliação técnica" source={assessmentMetadata} field="technical_assessment_v1" />
                <JsonLine label="Documentação e financeiro" source={assessmentMetadata} field="documentation_financial_v1" />
                <JsonLine label="Entrevista com proprietário" source={assessmentMetadata} field="owner_interview_v1" />
                <JsonLine label="Proposta comercial" source={assessmentMetadata} field="commercial_proposal_v1" />
                <JsonLine label="Casa" source={assessmentMetadata} field="house_module_v1" />
                <JsonLine label="Apartamento" source={assessmentMetadata} field="apartment_module_v1" />
                <JsonLine label="Terreno" source={assessmentMetadata} field="land_module_v1" />
                <JsonLine label="Comercial" source={assessmentMetadata} field="commercial_module_v1" />
                <JsonLine label="Rural" source={assessmentMetadata} field="rural_module_v1" />
                <JsonLine label="Resumos controlados" source={assessmentMetadata} field="controlled_summaries_v1" />
                <JsonLine label="Notas privadas" source={assessmentMetadata} field="private_notes_v1" />
              </ModuleBlock>

              <ModuleBlock id="v1-base-comum" title="7.2 Base Comum V1">
                <JsonObjectLines source={assessmentMetadata.base_common_v1} />
              </ModuleBlock>

              <ModuleBlock id="v1-preco" title="7.3 Estratégia de Preço V1">
                <JsonObjectLines source={assessmentMetadata.price_strategy_v1} />
              </ModuleBlock>

              <ModuleBlock id="v1-tecnica" title="7.4 Avaliação Técnica V1">
                <JsonObjectLines source={assessmentMetadata.technical_assessment_v1} />
              </ModuleBlock>

              <ModuleBlock id="v1-documentacao" title="7.5 Documentação e Financeiro V1">
                <JsonObjectLines source={assessmentMetadata.documentation_financial_v1} />
              </ModuleBlock>

              <ModuleBlock id="v1-entrevista" title="7.6 Entrevista com Proprietário V1">
                <JsonObjectLines source={assessmentMetadata.owner_interview_v1} />
              </ModuleBlock>

              <ModuleBlock id="v1-proposta" title="7.7 Estratégia Comercial e Proposta V1">
                <JsonObjectLines source={assessmentMetadata.commercial_proposal_v1} />
              </ModuleBlock>

              <ModuleBlock id="v1-casa" title="7.8.1 Casa">
                <JsonObjectLines source={assessmentMetadata.house_module_v1} />
              </ModuleBlock>

              <ModuleBlock id="v1-apartamento" title="7.8.2 Apartamento / Unidade">
                <JsonObjectLines source={assessmentMetadata.apartment_module_v1} />
              </ModuleBlock>

              <ModuleBlock id="v1-terreno" title="7.8.3 Terreno / Lote">
                <JsonObjectLines source={assessmentMetadata.land_module_v1} />
              </ModuleBlock>

              <ModuleBlock id="v1-comercial" title="7.8.4 Comercial">
                <JsonObjectLines source={assessmentMetadata.commercial_module_v1} />
              </ModuleBlock>

              <ModuleBlock id="v1-rural" title="7.8.5 Rural">
                <JsonObjectLines source={assessmentMetadata.rural_module_v1} />
              </ModuleBlock>

              <ModuleBlock id="v1-resumos" title="7.9 Resumos Controlados V1">
                <JsonObjectLines source={assessmentMetadata.controlled_summaries_v1} />
              </ModuleBlock>

              <ModuleBlock id="v1-privadas" title="7.10 Notas Privadas V1">
                <JsonObjectLines source={assessmentMetadata.private_notes_v1} />
              </ModuleBlock>
            </div>

            <p className="no-print" style={{ marginTop: 16 }}>
              <a
                className="button-link"
                href={`/operations/properties/${listing.id}/assessment`}
              >
                Editar Documento Profissional
              </a>
            </p>
          </>
        )}
      </section>
    </main>
  )
}