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
- Ficha profissional é documento técnico interno/adicional.
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

  return String(value)
}

function getJsonValue(source: any, key: string) {
  if (!source || typeof source !== 'object') {
    return '-'
  }

  return formatValue(source[key])
}

function InfoLine({
  label,
  value,
}: {
  label: string
  value: any
}) {
  return (
    <p style={{ margin: '6px 0' }}>
      <strong>{label}:</strong> {formatValue(value)}
    </p>
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
    <p style={{ margin: '6px 0' }}>
      <strong>{label}:</strong> {getJsonValue(source, field)}
    </p>
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

  return (
    <main style={{ padding: 24, maxWidth: 1180, margin: '0 auto' }}>
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }

          body {
            background: #fff;
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

        .hurby-section {
          border: 1px solid #ddd;
          border-radius: 12px;
          padding: 16px;
          margin: 16px 0;
          background: #fff;
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
          {assessment ? 'Editar ficha profissional' : 'Criar ficha profissional'}
        </a>

        <button onClick={() => window.print()}>
          Imprimir checkup
        </button>
      </div>

      <h1>Checkup interno do imóvel</h1>

      <div className="hurby-section">
        <h2>Orientação</h2>

        <p>
          Esta tela consolida as informações internas do imóvel. Ela serve para
          conferência, revisão, acompanhamento e futura impressão do dossiê.
        </p>

        <p>
          O anúncio é a peça comercial. A ficha profissional é um documento
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
        <h2>7. Ficha profissional</h2>

        {!assessment && (
          <>
            <p>
              Este anúncio ainda não possui Ficha Profissional de Captação e
              Avaliação vinculada.
            </p>

            <p className="no-print">
              <a
                className="button-link"
                href={`/operations/properties/${listing.id}/assessment`}
              >
                Criar ficha profissional
              </a>
            </p>
          </>
        )}

        {assessment && (
          <>
            <InfoLine label="Ficha ID" value={assessment.id} />
            <InfoLine label="Status da ficha" value={assessment.assessment_status} />
            <InfoLine label="Finalidade" value={assessment.assessment_purpose} />
            <InfoLine label="Disponível para parceria" value={assessment.is_available_for_partnership} />
            <InfoLine label="Exclusivo" value={assessment.is_exclusive} />
            <InfoLine label="Ocultar endereço para parceiros" value={assessment.hide_exact_address_for_partners} />
            <InfoLine label="Proprietário pode ver resumo" value={assessment.owner_can_view_summary} />

            <h3>7.1 Avaliação técnica</h3>
            <JsonLine label="Perfil geral" source={assessment.technical_assessment} field="property_profile_notes" />
            <JsonLine label="Conservação" source={assessment.technical_assessment} field="conservation_notes" />
            <JsonLine label="Estrutura" source={assessment.technical_assessment} field="structure_notes" />
            <JsonLine label="Infraestrutura" source={assessment.technical_assessment} field="infrastructure_notes" />

            <h3>7.2 Entrevista com proprietário</h3>
            <JsonLine label="Restrições" source={assessment.owner_interview} field="owner_restrictions" />
            <JsonLine label="Condições para locação" source={assessment.owner_interview} field="rent_conditions" />
            <JsonLine label="Condições para venda" source={assessment.owner_interview} field="sale_conditions" />
            <JsonLine label="Expectativas" source={assessment.owner_interview} field="owner_expectations" />

            <h3>7.3 Documentação</h3>
            <JsonLine label="Situação da propriedade" source={assessment.documentation_assessment} field="ownership_status_notes" />
            <JsonLine label="Matrícula / registro" source={assessment.documentation_assessment} field="registry_notes" />
            <JsonLine label="Tributos" source={assessment.documentation_assessment} field="tax_notes" />
            <JsonLine label="Jurídico" source={assessment.documentation_assessment} field="legal_notes" />

            <h3>7.4 Financeiro</h3>
            <JsonLine label="Dívidas" source={assessment.financial_assessment} field="debt_notes" />
            <JsonLine label="Condomínio" source={assessment.financial_assessment} field="condo_fee_notes" />
            <JsonLine label="IPTU" source={assessment.financial_assessment} field="iptu_notes" />
            <JsonLine label="Financiamento" source={assessment.financial_assessment} field="financing_notes" />

            <h3>7.5 Estratégia comercial</h3>
            <JsonLine label="Pontos fortes" source={assessment.commercial_assessment} field="commercial_strengths" />
            <JsonLine label="Pontos de atenção" source={assessment.commercial_assessment} field="commercial_risks" />
            <JsonLine label="Percepção sobre preço" source={assessment.commercial_assessment} field="price_perception" />
            <JsonLine label="Estratégia de negociação" source={assessment.commercial_assessment} field="negotiation_strategy" />

            <h3>7.6 Resumos controlados</h3>
            <JsonLine label="Resumo público" source={assessment.public_summary} field="summary" />
            <JsonLine label="Resumo para proprietário" source={assessment.owner_visibility_summary} field="summary" />
            <JsonLine label="Resumo para parceria" source={assessment.partner_visibility_summary} field="summary" />

            <h3>7.7 Notas privadas</h3>
            <JsonLine label="Notas internas" source={assessment.private_notes} field="notes" />

            <p className="no-print">
              <a
                className="button-link"
                href={`/operations/properties/${listing.id}/assessment`}
              >
                Editar ficha profissional
              </a>
            </p>
          </>
        )}
      </section>
    </main>
  )
}