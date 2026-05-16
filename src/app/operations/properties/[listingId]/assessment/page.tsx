'use client'

/*
=========================================================
HURBY — CORE_PROPERTIES_FORM_V1
ARQUIVO:
src/app/operations/properties/[listingId]/assessment/page.tsx

RESPONSABILIDADE:
Criar e editar a Ficha Profissional de Captacao e Avaliacao
do Imovel vinculada a um anuncio existente.

REGRA DE PRODUTO:
- Anuncio e peca publica/comercial.
- Ficha profissional e documento tecnico interno/adicional.
- Esta pagina nao substitui o formulario do anuncio.
- Fotos tecnicas da ficha devem ter estrutura propria futura.
- Fotos publicas do anuncio ficam em property_listing_media.

PODE ALTERAR:
- portugues, acentuacao e comunicacao com usuario
- layout visual
- accordions
- organizacao das secoes
- responsividade
- componentes

MANTER UTF-8.
NAO ALTERAR SEM MISSAO ESPECIFICA:
- contratos da propertyService
- nomes tecnicos dos JSONB
- regras LGPD
- RPCs
- ledger/AXE
- marketplace/leads/contracts
=========================================================
*/

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

import { supabase } from '@/lib/supabaseClient'

import {
  createOrReusePropertyOwnerFlow,
  getProfessionalAssessmentByListingId,
  getPropertyListingById,
  saveProfessionalAssessmentForListing,
  type ProfessionalAssessmentPurpose,
  type ProfessionalAssessmentStatus,
} from '@/lib/services/propertyService'

function readJsonText(source: any, key: string) {
  return source?.[key] ? String(source[key]) : ''
}

export default function PropertyAssessmentPage() {
  const params = useParams()
  const listingId = params.listingId as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [listing, setListing] = useState<any>(null)
  const [assessment, setAssessment] = useState<any>(null)

  const [ownerName, setOwnerName] = useState('')
  const [ownerCpf, setOwnerCpf] = useState('')
  const [ownerCnpj, setOwnerCnpj] = useState('')
  const [ownerEmail, setOwnerEmail] = useState('')
  const [ownerPhone, setOwnerPhone] = useState('')
  const [ownerWhatsapp, setOwnerWhatsapp] = useState('')
  const [ownerNotes, setOwnerNotes] = useState('')

  const [assessmentStatus, setAssessmentStatus] =
    useState<ProfessionalAssessmentStatus>('draft')

  const [assessmentPurpose, setAssessmentPurpose] =
    useState<ProfessionalAssessmentPurpose>('general')

  const [isAvailableForPartnership, setIsAvailableForPartnership] =
    useState(false)

  const [isExclusive, setIsExclusive] =
    useState(true)

  const [hideExactAddressForPartners, setHideExactAddressForPartners] =
    useState(true)

  const [ownerCanViewSummary, setOwnerCanViewSummary] =
    useState(true)

  const [propertyProfileNotes, setPropertyProfileNotes] = useState('')
  const [conservationNotes, setConservationNotes] = useState('')
  const [structureNotes, setStructureNotes] = useState('')
  const [infrastructureNotes, setInfrastructureNotes] = useState('')

  const [ownerRestrictions, setOwnerRestrictions] = useState('')
  const [rentConditions, setRentConditions] = useState('')
  const [saleConditions, setSaleConditions] = useState('')
  const [ownerExpectations, setOwnerExpectations] = useState('')

  const [ownershipStatusNotes, setOwnershipStatusNotes] = useState('')
  const [registryNotes, setRegistryNotes] = useState('')
  const [taxNotes, setTaxNotes] = useState('')
  const [legalNotes, setLegalNotes] = useState('')

  const [debtNotes, setDebtNotes] = useState('')
  const [condoFeeNotes, setCondoFeeNotes] = useState('')
  const [iptuNotes, setIptuNotes] = useState('')
  const [financingNotes, setFinancingNotes] = useState('')

  const [commercialStrengths, setCommercialStrengths] = useState('')
  const [commercialRisks, setCommercialRisks] = useState('')
  const [pricePerception, setPricePerception] = useState('')
  const [negotiationStrategy, setNegotiationStrategy] = useState('')

  const [publicSummary, setPublicSummary] = useState('')
  const [ownerSummary, setOwnerSummary] = useState('')
  const [partnerSummary, setPartnerSummary] = useState('')
  const [privateNotes, setPrivateNotes] = useState('')

  const [documentType, setDocumentType] = useState('preliminary_survey')
  const [documentOrigin, setDocumentOrigin] = useState('from_existing_listing')
  const [informationOrigin, setInformationOrigin] = useState('not_verified')
  const [visitStatus, setVisitStatus] = useState('no')
  const [informationProvider, setInformationProvider] = useState('unknown')
  const [informationConfidence, setInformationConfidence] = useState('pending_verification')
  const [commercialPurpose, setCommercialPurpose] = useState('listing_review')
  const [occupancyStatus, setOccupancyStatus] = useState('not_verified')
  const [visitAvailability, setVisitAvailability] = useState('authorization_required')
  const [documentationStatus, setDocumentationStatus] = useState('not_verified')
  const [paidOffStatus, setPaidOffStatus] = useState('to_confirm')
  const [financingStatus, setFinancingStatus] = useState('to_confirm')
  const [financialStatus, setFinancialStatus] = useState('to_confirm')
  const [marketPricePerception, setMarketPricePerception] = useState('not_evaluated')
  const [estimatedLiquidity, setEstimatedLiquidity] = useState('not_evaluated')
  const [commercialAttractiveness, setCommercialAttractiveness] = useState('not_evaluated')
  const [recommendationStatus, setRecommendationStatus] = useState('request_documents')
  const [nextStepStatus, setNextStepStatus] = useState('request_documents')
  const [nextStepOwner, setNextStepOwner] = useState('current_broker')
  const [nextStepDueDate, setNextStepDueDate] = useState('')

  const [ownerRequestedPrice, setOwnerRequestedPrice] = useState('')
  const [ownerMinimumAcceptablePrice, setOwnerMinimumAcceptablePrice] = useState('')
  const [professionalRecommendedPrice, setProfessionalRecommendedPrice] = useState('')
  const [initialListingPrice, setInitialListingPrice] = useState('')
  const [currentListingPrice, setCurrentListingPrice] = useState('')
  const [negotiationMarginAuthorized, setNegotiationMarginAuthorized] = useState(false)
  const [priceConfidenceLevel, setPriceConfidenceLevel] = useState('pending_verification')

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

      setListing(listingResponse.data)

      const assessmentData = assessmentResponse.data || null
      setAssessment(assessmentData)

      if (assessmentData) {
        setAssessmentStatus(assessmentData.assessment_status || 'draft')
        setAssessmentPurpose(assessmentData.assessment_purpose || 'general')
        setIsAvailableForPartnership(Boolean(assessmentData.is_available_for_partnership))
        setIsExclusive(assessmentData.is_exclusive ?? true)
        setHideExactAddressForPartners(assessmentData.hide_exact_address_for_partners ?? true)
        setOwnerCanViewSummary(assessmentData.owner_can_view_summary ?? true)

        setPropertyProfileNotes(readJsonText(assessmentData.technical_assessment, 'property_profile_notes'))
        setConservationNotes(readJsonText(assessmentData.technical_assessment, 'conservation_notes'))
        setStructureNotes(readJsonText(assessmentData.technical_assessment, 'structure_notes'))
        setInfrastructureNotes(readJsonText(assessmentData.technical_assessment, 'infrastructure_notes'))

        setOwnerRestrictions(readJsonText(assessmentData.owner_interview, 'owner_restrictions'))
        setRentConditions(readJsonText(assessmentData.owner_interview, 'rent_conditions'))
        setSaleConditions(readJsonText(assessmentData.owner_interview, 'sale_conditions'))
        setOwnerExpectations(readJsonText(assessmentData.owner_interview, 'owner_expectations'))

        setOwnershipStatusNotes(readJsonText(assessmentData.documentation_assessment, 'ownership_status_notes'))
        setRegistryNotes(readJsonText(assessmentData.documentation_assessment, 'registry_notes'))
        setTaxNotes(readJsonText(assessmentData.documentation_assessment, 'tax_notes'))
        setLegalNotes(readJsonText(assessmentData.documentation_assessment, 'legal_notes'))

        setDebtNotes(readJsonText(assessmentData.financial_assessment, 'debt_notes'))
        setCondoFeeNotes(readJsonText(assessmentData.financial_assessment, 'condo_fee_notes'))
        setIptuNotes(readJsonText(assessmentData.financial_assessment, 'iptu_notes'))
        setFinancingNotes(readJsonText(assessmentData.financial_assessment, 'financing_notes'))

        setCommercialStrengths(readJsonText(assessmentData.commercial_assessment, 'commercial_strengths'))
        setCommercialRisks(readJsonText(assessmentData.commercial_assessment, 'commercial_risks'))
        setPricePerception(readJsonText(assessmentData.commercial_assessment, 'price_perception'))
        setNegotiationStrategy(readJsonText(assessmentData.commercial_assessment, 'negotiation_strategy'))

        setPublicSummary(readJsonText(assessmentData.public_summary, 'summary'))
        setOwnerSummary(readJsonText(assessmentData.owner_visibility_summary, 'summary'))
        setPartnerSummary(readJsonText(assessmentData.partner_visibility_summary, 'summary'))
        setPrivateNotes(readJsonText(assessmentData.private_notes, 'notes'))

        const baseCommon = assessmentData.metadata?.base_common_v1 || {}
        setDocumentType(baseCommon.document_type || 'preliminary_survey')
        setDocumentOrigin(baseCommon.document_origin || 'from_existing_listing')
        setInformationOrigin(baseCommon.information_origin || 'not_verified')
        setVisitStatus(baseCommon.visit_status || 'no')
        setInformationProvider(baseCommon.information_provider || 'unknown')
        setInformationConfidence(baseCommon.information_confidence || 'pending_verification')
        setCommercialPurpose(baseCommon.commercial_purpose || 'listing_review')
        setOccupancyStatus(baseCommon.occupancy_status || 'not_verified')
        setVisitAvailability(baseCommon.visit_availability || 'authorization_required')
        setDocumentationStatus(baseCommon.documentation_status || 'not_verified')
        setPaidOffStatus(baseCommon.paid_off_status || 'to_confirm')
        setFinancingStatus(baseCommon.financing_status || 'to_confirm')
        setFinancialStatus(baseCommon.financial_status || 'to_confirm')
        setMarketPricePerception(baseCommon.market_price_perception || 'not_evaluated')
        setEstimatedLiquidity(baseCommon.estimated_liquidity || 'not_evaluated')
        setCommercialAttractiveness(baseCommon.commercial_attractiveness || 'not_evaluated')
        setRecommendationStatus(baseCommon.recommendation_status || 'request_documents')
        setNextStepStatus(baseCommon.next_step_status || 'request_documents')
        setNextStepOwner(baseCommon.next_step_owner || 'current_broker')
        setNextStepDueDate(baseCommon.next_step_due_date || '')

        const priceStrategy = assessmentData.metadata?.price_strategy_v1 || {}
        setOwnerRequestedPrice(priceStrategy.owner_requested_price?.toString() || '')
        setOwnerMinimumAcceptablePrice(priceStrategy.owner_minimum_acceptable_price?.toString() || '')
        setProfessionalRecommendedPrice(priceStrategy.professional_recommended_price?.toString() || '')
        setInitialListingPrice(priceStrategy.initial_listing_price?.toString() || '')
        setCurrentListingPrice(priceStrategy.current_listing_price?.toString() || '')
        setNegotiationMarginAuthorized(Boolean(priceStrategy.negotiation_margin_authorized))
        setPriceConfidenceLevel(priceStrategy.price_confidence_level || 'pending_verification')
      }

      setLoading(false)
    }

    init()
  }, [listingId])

  const handleSave = async () => {
    if (!listing?.property_assets?.id) {
      setStatus('Asset do imovel nao encontrado.')
      return
    }


    try {
      setSaving(true)

      let clientEntityId = assessment?.client_entity_id || null
      let clientRelationshipId = assessment?.client_relationship_id || null

      if (!assessment && (ownerCpf.trim() || ownerCnpj.trim())) {
        setStatus('Vinculando proprietario...')


        const ownerResponse = await createOrReusePropertyOwnerFlow({
          display_name: ownerName,
          legal_name: ownerName,
          document_cpf: ownerCpf,
          document_cnpj: ownerCnpj,
          email: ownerEmail,
          phone: ownerPhone,
          whatsapp: ownerWhatsapp,
          notes: ownerNotes,
          property_asset_id: listing.property_assets.id,
          property_listing_id: listingId,
          portfolio_id: listing.portfolio_items?.[0]?.portfolio_id || null,
          operational_origin_id: listing.operational_origin_id || null,
        })

        if (ownerResponse.error) {
          setStatus(ownerResponse.error.message || 'Erro ao vincular proprietario.')
          setSaving(false)
          return
        }

        clientEntityId = ownerResponse.data?.client_entity?.id || null
        clientRelationshipId = ownerResponse.data?.client_relationship?.id || null
      }

      setStatus('Salvando ficha profissional...')

      const moneyOrNull = (value: string) => {
        const normalized = value.replace(',', '.').trim()
        if (!normalized) return null
        const parsed = Number(normalized)
        return Number.isFinite(parsed) ? parsed : null
      }

      const response = await saveProfessionalAssessmentForListing({
        property_asset_id: listing.property_assets.id,
        property_listing_id: listingId,
        portfolio_item_id: listing.portfolio_items?.[0]?.id || assessment?.portfolio_item_id || null,
        client_entity_id: clientEntityId,
        client_relationship_id: clientRelationshipId,

        assessment_status: assessmentStatus,
        assessment_purpose: assessmentPurpose,

        is_available_for_partnership: isAvailableForPartnership,
        is_exclusive: isExclusive,
        hide_exact_address_for_partners: hideExactAddressForPartners,
        owner_can_view_summary: ownerCanViewSummary,

        essential_snapshot: {
          listing_id: listingId,
          asset_id: listing.property_assets.id,
          title: listing.title,
          price: listing.price,
        },

        technical_assessment: {
          property_profile_notes: propertyProfileNotes,
          conservation_notes: conservationNotes,
          structure_notes: structureNotes,
          infrastructure_notes: infrastructureNotes,
        },

        owner_interview: {
          owner_restrictions: ownerRestrictions,
          rent_conditions: rentConditions,
          sale_conditions: saleConditions,
          owner_expectations: ownerExpectations,
        },

        documentation_assessment: {
          ownership_status_notes: ownershipStatusNotes,
          registry_notes: registryNotes,
          tax_notes: taxNotes,
          legal_notes: legalNotes,
        },

        financial_assessment: {
          debt_notes: debtNotes,
          condo_fee_notes: condoFeeNotes,
          iptu_notes: iptuNotes,
          financing_notes: financingNotes,
        },

        commercial_assessment: {
          commercial_strengths: commercialStrengths,
          commercial_risks: commercialRisks,
          price_perception: pricePerception,
          negotiation_strategy: negotiationStrategy,
        },

        public_summary: {
          summary: publicSummary,
        },

        owner_visibility_summary: {
          summary: ownerSummary,
        },

        partner_visibility_summary: {
          summary: partnerSummary,
          hide_exact_address: true,
          hide_owner_data: true,
        },

        private_notes: {
          notes: privateNotes,
        },

        ai_review_status: assessment?.ai_review_status || 'not_requested',
        moderation_status: assessment?.moderation_status || 'not_reviewed',
        entitlement_status: assessment?.entitlement_status || 'not_required',
        is_free_assessment: assessment?.is_free_assessment ?? true,

        monetization_metadata: assessment?.monetization_metadata || {
          commercial_product: 'Ficha Profissional de Captacao e Avaliacao do Imovel',
          future_charge_model: 'axe_or_package',
        },

        metadata: {
          ...(assessment?.metadata || {}),
          source: 'operations_properties_assessment',
          core: 'CORE_PROPERTIES_FORM_V1',
          base_common_v1: {
            document_type: documentType,
            document_origin: documentOrigin,
            information_origin: informationOrigin,
            visit_status: visitStatus,
            information_provider: informationProvider,
            information_confidence: informationConfidence,
            commercial_purpose: commercialPurpose,
            occupancy_status: occupancyStatus,
            visit_availability: visitAvailability,
            documentation_status: documentationStatus,
            paid_off_status: paidOffStatus,
            financing_status: financingStatus,
            financial_status: financialStatus,
            market_price_perception: marketPricePerception,
            estimated_liquidity: estimatedLiquidity,
            commercial_attractiveness: commercialAttractiveness,
            recommendation_status: recommendationStatus,
            next_step_status: nextStepStatus,
            next_step_owner: nextStepOwner,
            next_step_due_date: nextStepDueDate,
          },
          price_strategy_v1: {
            owner_requested_price: moneyOrNull(ownerRequestedPrice),
            owner_minimum_acceptable_price: moneyOrNull(ownerMinimumAcceptablePrice),
            professional_recommended_price: moneyOrNull(professionalRecommendedPrice),
            initial_listing_price: moneyOrNull(initialListingPrice),
            current_listing_price: moneyOrNull(currentListingPrice),
            negotiation_margin_authorized: negotiationMarginAuthorized,
            price_confidence_level: priceConfidenceLevel,
          },
        },
      })

      if (response.error) {
        setStatus(response.error.message || 'Erro ao salvar ficha.')
        setSaving(false)
        return
      }

      setAssessment(response.data)

      if (!assessment) {
        setStatus(clientEntityId ? 'Proprietario vinculado. Documento Profissional liberado para preenchimento.' : 'Documento Profissional preliminar criado sem proprietario vinculado. Voce pode vincular o cliente depois.')
        setSaving(false)
        return
      }

      setStatus('Documento Profissional salvo. Redirecionando para o checkup...')

      setTimeout(() => {
        window.location.href = `/operations/properties/${listingId}`
      }, 700)
    } catch (error) {
      console.error(error)
      setStatus('Erro interno ao salvar ficha.')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="assessment-page">
        <p>Carregando...</p>
      </main>
    )
  }

  return (
    <main className="assessment-page">
      <style jsx global>{`
        body {
          background: #f3f5f7;
        }

        .assessment-page {
          max-width: 1180px;
          margin: 0 auto;
          padding: 28px;
          color: #172033;
        }

        .assessment-toolbar {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
          justify-content: flex-start;
          margin-bottom: 18px;
        }

        .button-link,
        button {
          border: 1px solid #cfd6df;
          border-radius: 10px;
          padding: 9px 13px;
          background: #fff;
          color: #172033;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-weight: 600;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
        }

        button:hover,
        .button-link:hover {
          border-color: #94a3b8;
          background: #f8fafc;
        }

        button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .assessment-hero,
        .assessment-card,
        .assessment-linked-summary,
        .assessment-action-bar {
          background: #fff;
          border: 1px solid #dde3ea;
          border-radius: 18px;
          box-shadow: 0 10px 28px rgba(15, 23, 42, 0.06);
        }

        .assessment-hero {
          padding: 24px;
          margin-bottom: 18px;
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 16px;
          align-items: start;
        }

        .assessment-eyebrow {
          margin: 0 0 8px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #64748b;
        }

        .assessment-hero h1 {
          margin: 0;
          font-size: 30px;
          line-height: 1.15;
        }

        .assessment-hero p {
          margin: 10px 0 0;
          color: #526173;
          max-width: 760px;
        }

        .assessment-badges {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 220px;
        }

        .assessment-badge {
          display: inline-flex;
          justify-content: center;
          border: 1px solid #dbe3ec;
          background: #f8fafc;
          color: #334155;
          border-radius: 999px;
          padding: 7px 10px;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
        }

        .assessment-card {
          padding: 18px;
          margin: 18px 0;
        }

        .assessment-card h2,
        .assessment-page h2 {
          margin: 24px 0 10px;
          padding: 16px 18px;
          border: 1px solid #dde3ea;
          border-radius: 16px;
          background: linear-gradient(180deg, #ffffff, #f8fafc);
          color: #172033;
          font-size: 20px;
        }

        .assessment-page h2 + p {
          color: #64748b;
          margin-top: -2px;
        }

        .assessment-linked-summary {
          padding: 16px 18px;
          margin: 16px 0;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        .summary-item {
          border: 1px solid #e5eaf0;
          border-radius: 14px;
          padding: 12px;
          background: #fbfcfe;
        }

        .summary-label {
          display: block;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #64748b;
          margin-bottom: 4px;
        }

        .summary-value {
          font-weight: 700;
          color: #172033;
          word-break: break-word;
        }

        label {
          display: block;
          font-weight: 700;
          color: #243044;
          margin-top: 10px;
        }

        input,
        textarea,
        select {
          width: 100%;
          border: 1px solid #cfd6df;
          border-radius: 10px;
          padding: 9px 11px;
          min-height: 40px;
          box-sizing: border-box;
          background: #fff;
          color: #172033;
          margin-top: 6px;
        }

        input[type="checkbox"] {
          width: auto;
          min-height: auto;
          margin-right: 8px;
        }

        textarea {
          min-height: 96px;
          resize: vertical;
        }

        hr {
          border: 0;
          border-top: 1px solid #e4e9ef;
          margin: 24px 0;
        }

        .sensitive-note {
          border-left: 4px solid #b45309;
          background: #fffbeb;
          padding: 12px 14px;
          border-radius: 12px;
          color: #78350f;
          font-weight: 600;
        }

        .assessment-action-bar {
          margin-top: 24px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          justify-content: space-between;
          flex-wrap: wrap;
        }

        .assessment-status {
          color: #334155;
          font-weight: 700;
        }

        @media (max-width: 820px) {
          .assessment-page {
            padding: 18px;
          }

          .assessment-hero,
          .assessment-linked-summary {
            grid-template-columns: 1fr;
          }

          .assessment-badges {
            min-width: 0;
          }
        }
      `}</style>

      <div className="assessment-toolbar no-print">
        <a className="button-link" href={`/operations/properties/${listingId}`}>
          ← Voltar para checkup
        </a>
        <a className="button-link" href={`/operations/properties/${listingId}/edit`}>
          Editar anuncio
        </a>
        <a className="button-link" href="/operations/properties/list">
          Voltar para lista
        </a>
      </div>

      <section className="assessment-hero">
        <div>
          <p className="assessment-eyebrow">Documento Profissional do Imovel</p>
          <h1>Ficha Profissional de Captacao e Avaliacao</h1>
          <p>
            Registro tecnico e comercial interno para apoiar captacao, vistoria, precificacao,
            riscos, estrategia de negociacao e proximos passos do broker.
          </p>
        </div>

        <div className="assessment-badges">
          <span className="assessment-badge">{assessment ? 'Documento criado' : 'Preliminar nao criado'}</span>
          <span className="assessment-badge">{assessmentStatus || 'draft'}</span>
          <span className="assessment-badge">Uso interno</span>
        </div>
      </section>

      <style>{`
        @media print {
          body {
            background: #fff !important;
          }

          button,
          .no-print {
            display: none !important;
          }

          main {
            max-width: none !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          input,
          select,
          textarea {
            border: 1px solid #999 !important;
          }

          textarea {
            min-height: 80px !important;
          }
        }

        @page {
          margin: 14mm;
        }
      `}</style>

      <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button
          type="button"
          onClick={() => window.print()}
          title="Exportar pagina em PDF"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 12px',
            border: '1px solid #ccc',
            borderRadius: 8,
            background: '#fff',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          <span aria-hidden="true">📄</span>
          Exportar PDF
        </button>
      </div>

      <section className="assessment-card">
        <h2>O que e esta ficha?</h2>
        <p>
          Esta ficha e um documento tecnico interno do profissional ou da imobiliaria.
          Ela nao e o anuncio publico do imovel.
        </p>
        <p>
          Use esta tela para registrar avaliacao tecnica, entrevista com proprietario,
          documentacao, riscos, estrategia comercial e notas privadas.
        </p>
        <p>
          Proprietario e parceiros devem ver apenas resumos controlados quando permitido.
          Notas privadas e dados sensiveis nao devem ser expostos.
        </p>
      </section>

      <section className="assessment-linked-summary">
        <div className="summary-item">
          <span className="summary-label">Anuncio vinculado</span>
          <span className="summary-value">{listing?.title || 'Sem titulo'}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Listing ID</span>
          <span className="summary-value">{listingId}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Status do documento</span>
          <span className="summary-value">{assessment ? assessmentStatus : 'Preliminar pendente'}</span>
        </div>
      </section>

      {!assessment && (
        <>
          <hr />
          <h2>1. Proprietario da ficha</h2>
          <p>Opcional nesta etapa. Informe CPF ou CNPJ se quiser vincular o proprietario agora, ou crie o documento preliminar e vincule depois.</p>

          <label>Nome<br /><input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} style={{ width: '100%' }} /></label>
          <br /><br />
          <label>CPF<br /><input value={ownerCpf} onChange={(e) => setOwnerCpf(e.target.value)} /></label>
          <br /><br />
          <label>CNPJ<br /><input value={ownerCnpj} onChange={(e) => setOwnerCnpj(e.target.value)} /></label>
          <br /><br />
          <label>Email<br /><input value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} style={{ width: '100%' }} /></label>
          <br /><br />
          <label>Telefone<br /><input value={ownerPhone} onChange={(e) => setOwnerPhone(e.target.value)} /></label>
          <br /><br />
          <label>WhatsApp<br /><input value={ownerWhatsapp} onChange={(e) => setOwnerWhatsapp(e.target.value)} /></label>
          <br /><br />
          <label>Observacoes da captacao<br /><textarea value={ownerNotes} onChange={(e) => setOwnerNotes(e.target.value)} rows={3} style={{ width: '100%' }} /></label>
        </>
      )}

      {!assessment && (
        <>
          <hr />

          <section className="assessment-card">
            <h2>Antes de liberar o documento</h2>

            <p>
              O Documento Profissional pode nascer como levantamento preliminar sem proprietario vinculado.
              Pessoa, cliente ou proprietario nao pode ser duplicado fora do Core Clients.
            </p>

            <p>
              Se CPF ou CNPJ for informado, o sistema vai buscar ou criar o cliente no Core Clients.
              Se nao for informado, o documento sera criado como preliminar.
            </p>

            <p>
              O vinculo com cliente podera ser feito depois, antes das etapas formais de revisao/aprovacao.
            </p>
          </section>

          <button onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : 'Criar Documento Profissional'}
          </button>

          <br /><br />

          {status && <p>{status}</p>}
        </>
      )}

      {assessment && (
        <>

          <hr />

          <h2>2. Controle da ficha</h2>

      <label>
        Status da ficha
        <br />
        <select value={assessmentStatus} onChange={(e) => setAssessmentStatus(e.target.value as ProfessionalAssessmentStatus)}>
          <option value="draft">Rascunho</option>
          <option value="submitted_for_review">Enviada para revisao</option>
          <option value="needs_correction">Precisa de revisao</option>
          <option value="approved">Aprovada</option>
          <option value="rejected">Rejeitada</option>
          <option value="archived">Arquivada</option>
        </select>
      </label>

      <br /><br />

      <label>
        Finalidade da ficha
        <br />
        <select value={assessmentPurpose} onChange={(e) => setAssessmentPurpose(e.target.value as ProfessionalAssessmentPurpose)}>
          <option value="general">Geral</option>
          <option value="sale">Venda</option>
          <option value="rental">Locacao</option>
          <option value="rental_management">Locacao com gestao/admin</option>
        </select>
      </label>

      <br /><br />


      <hr />

      <h2>3. Base Comum V1</h2>
      <p>Campos estruturados iniciais. Nesta fase salvam em metadata JSONB, mas foram modelados para virar estrutura antes do fechamento do core.</p>

      <label>Tipo do documento<br />
        <select value={documentType} onChange={(e) => setDocumentType(e.target.value)}>
          <option value="preliminary_survey">Levantamento preliminar</option>
          <option value="professional_capture">Captacao profissional</option>
          <option value="commercial_inspection">Vistoria comercial</option>
          <option value="listing_review">Revisao de anuncio</option>
          <option value="pricing_support">Apoio a precificacao</option>
          <option value="proposal_preparation">Preparacao para proposta</option>
          <option value="contract_preparation">Preparacao para contrato</option>
        </select>
      </label>

      <br /><br />

      <label>Origem do documento<br />
        <select value={documentOrigin} onChange={(e) => setDocumentOrigin(e.target.value)}>
          <option value="from_existing_listing">Nasceu de anuncio existente</option>
          <option value="without_listing">Nasceu sem anuncio</option>
          <option value="from_existing_client">Nasceu de cliente existente</option>
          <option value="external_lead">Atendimento externo</option>
          <option value="referral">Indicacao</option>
          <option value="agency_demand">Demanda da agencia</option>
          <option value="marketplace_migration">Migracao do marketplace</option>
        </select>
      </label>

      <br /><br />

      <label>Origem principal da informacao<br />
        <select value={informationOrigin} onChange={(e) => setInformationOrigin(e.target.value)}>
          <option value="verified_in_person">Verificado presencialmente</option>
          <option value="informed_by_owner">Informado pelo proprietario</option>
          <option value="informed_by_representative">Informado por representante</option>
          <option value="informed_by_tenant">Informado por inquilino</option>
          <option value="informed_by_third_party">Informado por terceiro</option>
          <option value="extracted_from_document">Extraido de documento</option>
          <option value="extracted_from_previous_listing">Extraido de anuncio anterior</option>
          <option value="not_verified">Nao verificado</option>
        </select>
      </label>

      <br /><br />

      <label>Visita presencial<br />
        <select value={visitStatus} onChange={(e) => setVisitStatus(e.target.value)}>
          <option value="yes">Sim</option>
          <option value="no">Nao</option>
          <option value="partial">Parcial</option>
        </select>
      </label>

      <br /><br />

      <label>Quem forneceu as informacoes<br />
        <select value={informationProvider} onChange={(e) => setInformationProvider(e.target.value)}>
          <option value="owner">Proprietario</option>
          <option value="owner_representative">Representante do proprietario</option>
          <option value="tenant">Inquilino</option>
          <option value="building_staff">Portaria/zelador</option>
          <option value="another_broker">Outro broker/corretor</option>
          <option value="third_party">Terceiro</option>
          <option value="unknown">Nao informado</option>
        </select>
      </label>

      <br /><br />

      <label>Nivel de confianca da informacao<br />
        <select value={informationConfidence} onChange={(e) => setInformationConfidence(e.target.value)}>
          <option value="high">Alto</option>
          <option value="medium">Medio</option>
          <option value="low">Baixo</option>
          <option value="pending_verification">Pendente de comprovacao</option>
        </select>
      </label>

      <br /><br />

      <label>Finalidade tecnica/comercial<br />
        <select value={commercialPurpose} onChange={(e) => setCommercialPurpose(e.target.value)}>
          <option value="sale">Venda</option>
          <option value="rental">Locacao</option>
          <option value="seasonal_rental">Temporada</option>
          <option value="property_management">Administracao/gestao</option>
          <option value="price_review">Revisao de preco</option>
          <option value="portfolio_capture">Captacao para carteira</option>
          <option value="proposal_preparation">Preparacao para proposta</option>
          <option value="listing_review">Revisao de anuncio</option>
        </select>
      </label>

      <br /><br />

      <label>Ocupacao<br />
        <select value={occupancyStatus} onChange={(e) => setOccupancyStatus(e.target.value)}>
          <option value="vacant">Vazio</option>
          <option value="occupied_by_owner">Ocupado pelo proprietario</option>
          <option value="occupied_by_tenant">Ocupado por inquilino</option>
          <option value="occupied_by_third_party">Ocupado por terceiro</option>
          <option value="under_construction">Em obra</option>
          <option value="closed_no_access">Fechado sem acesso</option>
          <option value="not_verified">Nao verificado</option>
        </select>
      </label>

      <br /><br />

      <label>Disponibilidade para visita<br />
        <select value={visitAvailability} onChange={(e) => setVisitAvailability(e.target.value)}>
          <option value="free_access">Livre</option>
          <option value="by_appointment">Mediante agendamento</option>
          <option value="restricted">Restrita</option>
          <option value="authorization_required">Somente com autorizacao</option>
          <option value="unavailable">Indisponivel no momento</option>
        </select>
      </label>

      <br /><br />

      <label>Situacao documental aparente<br />
        <select value={documentationStatus} onChange={(e) => setDocumentationStatus(e.target.value)}>
          <option value="apparently_regular">Regular aparente</option>
          <option value="pending_review">Pendente de conferencia</option>
          <option value="discrepancy_found">Divergencia identificada</option>
          <option value="relevant_risk">Risco relevante</option>
          <option value="not_verified">Nao verificado</option>
        </select>
      </label>

      <br /><br />

      <label>Imovel quitado<br />
        <select value={paidOffStatus} onChange={(e) => setPaidOffStatus(e.target.value)}>
          <option value="yes">Sim</option>
          <option value="no">Nao</option>
          <option value="to_confirm">A confirmar</option>
        </select>
      </label>

      <br /><br />

      <label>Aceita financiamento<br />
        <select value={financingStatus} onChange={(e) => setFinancingStatus(e.target.value)}>
          <option value="yes">Sim</option>
          <option value="no">Nao</option>
          <option value="to_confirm">A confirmar</option>
        </select>
      </label>

      <br /><br />

      <label>Situacao financeira geral<br />
        <select value={financialStatus} onChange={(e) => setFinancialStatus(e.target.value)}>
          <option value="to_confirm">A confirmar</option>
          <option value="apparently_clear">Aparentemente sem pendencia</option>
          <option value="debt_informed">Divida informada</option>
          <option value="relevant_risk">Risco relevante</option>
          <option value="not_verified">Nao verificado</option>
        </select>
      </label>

      <hr />

      <h2>4. Estrategia de preco interna</h2>
      <p className="sensitive-note">Campos internos e sensiveis. Nao devem aparecer no anuncio publico nem em rotas abertas do marketplace.</p>

      <label>Preco pedido pelo proprietario<br /><input value={ownerRequestedPrice} onChange={(e) => setOwnerRequestedPrice(e.target.value)} /></label>
      <br /><br />
      <label>Preco minimo aceitavel<br /><input value={ownerMinimumAcceptablePrice} onChange={(e) => setOwnerMinimumAcceptablePrice(e.target.value)} /></label>
      <br /><br />
      <label>Preco recomendado pelo profissional<br /><input value={professionalRecommendedPrice} onChange={(e) => setProfessionalRecommendedPrice(e.target.value)} /></label>
      <br /><br />
      <label>Preco inicial anunciado<br /><input value={initialListingPrice} onChange={(e) => setInitialListingPrice(e.target.value)} /></label>
      <br /><br />
      <label>Preco atual anunciado<br /><input value={currentListingPrice} onChange={(e) => setCurrentListingPrice(e.target.value)} /></label>
      <br /><br />
      <label><input type="checkbox" checked={negotiationMarginAuthorized} onChange={(e) => setNegotiationMarginAuthorized(e.target.checked)} /> Existe margem/carta branca de negociacao</label>
      <br /><br />
      <label>Confianca da estrategia de preco<br />
        <select value={priceConfidenceLevel} onChange={(e) => setPriceConfidenceLevel(e.target.value)}>
          <option value="high">Alta</option>
          <option value="medium">Media</option>
          <option value="low">Baixa</option>
          <option value="pending_verification">Pendente de comprovacao</option>
        </select>
      </label>

      <hr />

      <h2>5. Leitura comercial e proximos passos</h2>

      <label>Percepcao do preco<br />
        <select value={marketPricePerception} onChange={(e) => setMarketPricePerception(e.target.value)}>
          <option value="below_market">Abaixo do mercado</option>
          <option value="coherent">Coerente</option>
          <option value="above_market">Acima do mercado</option>
          <option value="far_above_market">Muito acima do mercado</option>
          <option value="not_evaluated">Nao avaliado</option>
        </select>
      </label>

      <br /><br />

      <label>Liquidez estimada<br />
        <select value={estimatedLiquidity} onChange={(e) => setEstimatedLiquidity(e.target.value)}>
          <option value="high">Alta</option>
          <option value="medium">Media</option>
          <option value="low">Baixa</option>
          <option value="depends_on_price_adjustment">Depende de ajuste de preco</option>
          <option value="not_evaluated">Nao avaliado</option>
        </select>
      </label>

      <br /><br />

      <label>Atratividade comercial<br />
        <select value={commercialAttractiveness} onChange={(e) => setCommercialAttractiveness(e.target.value)}>
          <option value="high">Alta</option>
          <option value="medium">Media</option>
          <option value="low">Baixa</option>
          <option value="depends_on_improvement">Depende de melhoria</option>
          <option value="not_evaluated">Nao avaliado</option>
        </select>
      </label>

      <br /><br />

      <label>Recomendacao principal<br />
        <select value={recommendationStatus} onChange={(e) => setRecommendationStatus(e.target.value)}>
          <option value="publish_listing">Publicar anuncio</option>
          <option value="review_price_before_publish">Revisar preco antes de publicar</option>
          <option value="request_documents">Solicitar documentos</option>
          <option value="schedule_new_visit">Agendar nova visita</option>
          <option value="improve_public_photos">Melhorar fotos publicas</option>
          <option value="wait_authorization">Aguardar autorizacao</option>
          <option value="do_not_publish_yet">Nao recomendar publicacao ainda</option>
          <option value="archive_capture">Arquivar captacao</option>
        </select>
      </label>

      <br /><br />

      <label>Proximo passo<br />
        <select value={nextStepStatus} onChange={(e) => setNextStepStatus(e.target.value)}>
          <option value="create_listing">Criar anuncio</option>
          <option value="review_existing_listing">Revisar anuncio existente</option>
          <option value="link_client">Vincular cliente</option>
          <option value="send_to_internal_review">Enviar para revisao interna</option>
          <option value="request_documents">Solicitar documentos</option>
          <option value="adjust_price">Ajustar preco</option>
          <option value="schedule_new_visit">Agendar nova visita</option>
          <option value="monitor_performance">Acompanhar performance</option>
        </select>
      </label>

      <br /><br />

      <label>Responsavel pelo proximo passo<br />
        <select value={nextStepOwner} onChange={(e) => setNextStepOwner(e.target.value)}>
          <option value="current_broker">Broker atual</option>
          <option value="agency">Agencia</option>
          <option value="another_broker">Outro broker</option>
          <option value="administrative">Administrativo</option>
        </select>
      </label>

      <br /><br />

      <label>Prazo sugerido<br /><input type="date" value={nextStepDueDate} onChange={(e) => setNextStepDueDate(e.target.value)} /></label>

      <hr />
      <label><input type="checkbox" checked={isExclusive} onChange={(e) => setIsExclusive(e.target.checked)} /> Imovel exclusivo</label>
      <br />
      <label><input type="checkbox" checked={isAvailableForPartnership} onChange={(e) => setIsAvailableForPartnership(e.target.checked)} /> Disponivel para parceria futura</label>
      <br />
      <label><input type="checkbox" checked={hideExactAddressForPartners} onChange={(e) => setHideExactAddressForPartners(e.target.checked)} /> Ocultar endereco exato para parceiros</label>
      <br />
      <label><input type="checkbox" checked={ownerCanViewSummary} onChange={(e) => setOwnerCanViewSummary(e.target.checked)} /> Proprietario pode ver resumo controlado</label>

      <hr />

      <h2>3. Avaliacao tecnica</h2>
      <label>Perfil geral<br /><textarea value={propertyProfileNotes} onChange={(e) => setPropertyProfileNotes(e.target.value)} style={{ width: '100%' }} /></label>
      <br /><br />
      <label>Conservacao<br /><textarea value={conservationNotes} onChange={(e) => setConservationNotes(e.target.value)} style={{ width: '100%' }} /></label>
      <br /><br />
      <label>Estrutura<br /><textarea value={structureNotes} onChange={(e) => setStructureNotes(e.target.value)} style={{ width: '100%' }} /></label>
      <br /><br />
      <label>Infraestrutura<br /><textarea value={infrastructureNotes} onChange={(e) => setInfrastructureNotes(e.target.value)} style={{ width: '100%' }} /></label>

      <hr />

      <h2>4. Entrevista com proprietario</h2>
      <label>Restricoes<br /><textarea value={ownerRestrictions} onChange={(e) => setOwnerRestrictions(e.target.value)} style={{ width: '100%' }} /></label>
      <br /><br />
      <label>Condicoes para locacao<br /><textarea value={rentConditions} onChange={(e) => setRentConditions(e.target.value)} style={{ width: '100%' }} /></label>
      <br /><br />
      <label>Condicoes para venda<br /><textarea value={saleConditions} onChange={(e) => setSaleConditions(e.target.value)} style={{ width: '100%' }} /></label>
      <br /><br />
      <label>Expectativas<br /><textarea value={ownerExpectations} onChange={(e) => setOwnerExpectations(e.target.value)} style={{ width: '100%' }} /></label>

      <hr />

      <h2>5. Documentacao e financeiro</h2>
      <label>Situacao da propriedade<br /><textarea value={ownershipStatusNotes} onChange={(e) => setOwnershipStatusNotes(e.target.value)} style={{ width: '100%' }} /></label>
      <br /><br />
      <label>Matricula / registro / pendencias<br /><textarea value={registryNotes} onChange={(e) => setRegistryNotes(e.target.value)} style={{ width: '100%' }} /></label>
      <br /><br />
      <label>Tributos<br /><textarea value={taxNotes} onChange={(e) => setTaxNotes(e.target.value)} style={{ width: '100%' }} /></label>
      <br /><br />
      <label>Juridico<br /><textarea value={legalNotes} onChange={(e) => setLegalNotes(e.target.value)} style={{ width: '100%' }} /></label>
      <br /><br />
      <label>Dividas<br /><textarea value={debtNotes} onChange={(e) => setDebtNotes(e.target.value)} style={{ width: '100%' }} /></label>
      <br /><br />
      <label>Condominio<br /><textarea value={condoFeeNotes} onChange={(e) => setCondoFeeNotes(e.target.value)} style={{ width: '100%' }} /></label>
      <br /><br />
      <label>IPTU<br /><textarea value={iptuNotes} onChange={(e) => setIptuNotes(e.target.value)} style={{ width: '100%' }} /></label>
      <br /><br />
      <label>Financiamento<br /><textarea value={financingNotes} onChange={(e) => setFinancingNotes(e.target.value)} style={{ width: '100%' }} /></label>

      <hr />

      <h2>6. Estrategia comercial</h2>
      <label>Pontos fortes<br /><textarea value={commercialStrengths} onChange={(e) => setCommercialStrengths(e.target.value)} style={{ width: '100%' }} /></label>
      <br /><br />
      <label>Pontos de atencao<br /><textarea value={commercialRisks} onChange={(e) => setCommercialRisks(e.target.value)} style={{ width: '100%' }} /></label>
      <br /><br />
      <label>Percepcao sobre preco<br /><textarea value={pricePerception} onChange={(e) => setPricePerception(e.target.value)} style={{ width: '100%' }} /></label>
      <br /><br />
      <label>Estrategia de negociacao<br /><textarea value={negotiationStrategy} onChange={(e) => setNegotiationStrategy(e.target.value)} style={{ width: '100%' }} /></label>

      <hr />

      <h2>7. Resumos controlados</h2>
      <p>Use estes campos para criar versoes seguras da ficha. Nao inclua documentos, telefone, CPF/CNPJ, numero exato do imovel ou notas privadas.</p>

      <label>Resumo publico<br /><textarea value={publicSummary} onChange={(e) => setPublicSummary(e.target.value)} style={{ width: '100%' }} /></label>
      <br /><br />
      <label>Resumo para proprietario<br /><textarea value={ownerSummary} onChange={(e) => setOwnerSummary(e.target.value)} style={{ width: '100%' }} /></label>
      <br /><br />
      <label>Resumo para parceria<br /><textarea value={partnerSummary} onChange={(e) => setPartnerSummary(e.target.value)} style={{ width: '100%' }} /></label>

      <hr />

      <h2>8. Notas privadas</h2>
      <p>Campo interno. Nao deve aparecer para publico, proprietario ou parceiros.</p>
      <label>Notas internas<br /><textarea value={privateNotes} onChange={(e) => setPrivateNotes(e.target.value)} style={{ width: '100%' }} /></label>

      <hr />

      <div className="assessment-action-bar no-print">
        <button onClick={handleSave} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar ficha profissional'}
        </button>

        {status && <span className="assessment-status">{status}</span>}
      </div>
        </>
      )}
    </main>
  )
}