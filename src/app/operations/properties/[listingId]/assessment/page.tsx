'use client'

/*
=========================================================
HURBY — CORE_PROPERTIES_FORM_V1 / ANÁLISE PATRIMONIAL V1

NOTA DE ORIENTAÇÃO PARA PRÓXIMO EXECUTOR / CODEX

CONTEXTO DO PRODUTO:
- Esta tela faz parte da base V1 da Análise Patrimonial.
- Análise Patrimonial não é anúncio público.
- Análise Patrimonial não é o Dossiê completo do imóvel.
- "Dossiê do Imóvel" deve ficar reservado para o lifecycle/histórico amplo:
  captação, anúncio, propostas, comunicação, contratos, administração,
  locação, cobrança, ocorrências, revisões, aprovações e eventos futuros.
- A Análise Patrimonial é a ferramenta de avaliação criteriosa do patrimônio:
  captação, entrevista, vistoria, documentação, risco, preço, potencial,
  classificação e direcionamento estratégico.

OBJETIVO DESTA V1:
- Corrigir base funcional.
- Organizar fluxo e leitura.
- Separar anúncio, patrimônio, proprietário, avaliação, documentação,
  entrevista, estratégia, resumos e notas privadas.
- Preparar a base para evoluções futuras sem implementar todos os cores agora.

NÃO IMPLEMENTAR AQUI SEM MISSÃO ESPECÍFICA:
- Core Comunicador / Chat.
- IA estratégica.
- Core Score global.
- Core Parcerias.
- Proposta formal completa ao proprietário.
- Calendário/agendamento.
- Push/app.
- Marketplace/leads avançado.
- Contratos.
- Lifecycle completo do Dossiê do Imóvel.

ACOPLAGENS FUTURAS PREVISTAS:
- IA futura deve usar dados estruturados da Análise Patrimonial para sugerir
  preço, posicionamento, risco, proposta e narrativa comercial.
- Comunicador futuro deve ser core próprio, plugável ao patrimônio/anúncio.
- Código público do anúncio/patrimônio deve ser único global, curto e pesquisável,
  diferente do UUID interno.
- Nota Patrimonial deve ser distinta do Score global:
  pode ter nota por dimensão, subcategoria, categoria, finalidade,
  equalização e atratividade operacional.

REGRA DE ARQUITETURA:
- Não duplicar dados de cliente/proprietário fora do Core Clients.
- Não transformar metadata provisória em contrato definitivo sem auditoria.
- Não alterar RPCs, RLS, migrations, services ou contratos de dados sem
  diagnóstico explícito e autorização.
- Não misturar dados públicos do anúncio com dados privados da análise.
- Fotos públicas do anúncio e fotos técnicas da análise devem ser tratadas
  separadamente em evolução futura.

ORIENTAÇÃO PARA COMPONENTIZAÇÃO FUTURA:
- Esta página ainda está monolítica por segurança da missão atual.
- Próxima etapa recomendada:
  1. extrair Header/Toolbar;
  2. extrair Summary/Context;
  3. extrair ModuleNav;
  4. extrair OwnerLinkBlock;
  5. extrair módulos por domínio:
     BaseCommon, PriceStrategy, TypeSpecificModule,
     CommercialReading, TechnicalAssessment,
     OwnerInterview, DocumentationFinancial,
     CommercialProposal, ControlledSummaries, PrivateNotes;
  6. criar componentes reutilizáveis:
     FieldCard, SelectField, TextAreaField, FieldGuide, SaveModuleButton;
  7. manter contratos atuais antes de qualquer refatoração.

CUIDADO:
- A missão atual é estabilizar a V1, não reconstruir todos os cores.
- Se surgir dependência real de Chat, IA, Parcerias, Score global ou Cliente completo,
  pausar e gerar handoff para missão/core específico.
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

  const [ruralSubtype, setRuralSubtype] = useState('small_farm')
  const [ruralTotalArea, setRuralTotalArea] = useState('')
  const [ruralAreaUnit, setRuralAreaUnit] = useState('hectare')
  const [ruralAreaMatchesDocument, setRuralAreaMatchesDocument] = useState('not_verified')
  const [ruralAccessQuality, setRuralAccessQuality] = useState('not_evaluated')
  const [rainySeasonAccessRisk, setRainySeasonAccessRisk] = useState('not_evaluated')
  const [electricityAvailable, setElectricityAvailable] = useState('not_verified')
  const [waterAvailability, setWaterAvailability] = useState('not_verified')
  const [improvementsCondition, setImprovementsCondition] = useState('not_verified')
  const [currentRuralUse, setCurrentRuralUse] = useState('not_verified')
  const [productivePotential, setProductivePotential] = useState('not_evaluated')
  const [environmentalRisk, setEnvironmentalRisk] = useState('not_evaluated')
  const [ruralDocumentationStatus, setRuralDocumentationStatus] = useState('not_verified')
  const [georeferencingStatus, setGeoreferencingStatus] = useState('not_verified')
  const [ruralMarketAppeal, setRuralMarketAppeal] = useState('not_evaluated')
  const [ruralRecommendation, setRuralRecommendation] = useState('review_price')
  const [ruralNotes, setRuralNotes] = useState('')

  const [ownerInterviewSource, setOwnerInterviewSource] = useState('not_verified')
  const [ownerMotivation, setOwnerMotivation] = useState('not_evaluated')
  const [negotiationUrgency, setNegotiationUrgency] = useState('not_evaluated')
  const [ownerAvailability, setOwnerAvailability] = useState('to_schedule')
  const [exclusiveAuthorization, setExclusiveAuthorization] = useState('not_verified')
  const [commissionAgreementStatus, setCommissionAgreementStatus] = useState('not_verified')
  const [documentationProvidedStatus, setDocumentationProvidedStatus] = useState('not_provided')
  const [priceFlexibility, setPriceFlexibility] = useState('not_evaluated')
  const [exchangeInterest, setExchangeInterest] = useState('not_verified')
  const [ownerCommunicationPreference, setOwnerCommunicationPreference] = useState('not_informed')
  const [ownerMainObjectionsV1, setOwnerMainObjectionsV1] = useState('')
  const [ownerInterviewNotesV1, setOwnerInterviewNotesV1] = useState('')

  const [proposalCommercialDiagnosis, setProposalCommercialDiagnosis] = useState('not_evaluated')
  const [proposalRecommendedPositioning, setProposalRecommendedPositioning] = useState('standard_market')
  const [proposalListingStrategy, setProposalListingStrategy] = useState('publish_after_review')
  const [proposalNegotiationStrategy, setProposalNegotiationStrategy] = useState('neutral_margin')
  const [proposalOwnerArgument, setProposalOwnerArgument] = useState('')
  const [proposalPublicHighlights, setProposalPublicHighlights] = useState('')
  const [proposalAttentionPoints, setProposalAttentionPoints] = useState('')
  const [proposalNextAction, setProposalNextAction] = useState('review_price')
  const [proposalFollowUpDate, setProposalFollowUpDate] = useState('')
  const [proposalInternalNotes, setProposalInternalNotes] = useState('')

  const [technicalVisitQuality, setTechnicalVisitQuality] = useState('not_evaluated')
  const [technicalConservationStatus, setTechnicalConservationStatus] = useState('not_verified')
  const [technicalStructuralRisk, setTechnicalStructuralRisk] = useState('not_evaluated')
  const [technicalMoistureRisk, setTechnicalMoistureRisk] = useState('not_evaluated')
  const [technicalElectricalCondition, setTechnicalElectricalCondition] = useState('not_verified')
  const [technicalHydraulicCondition, setTechnicalHydraulicCondition] = useState('not_verified')
  const [technicalFinishingStandard, setTechnicalFinishingStandard] = useState('not_evaluated')
  const [technicalRenovationNeed, setTechnicalRenovationNeed] = useState('not_evaluated')
  const [technicalPhotoQuality, setTechnicalPhotoQuality] = useState('not_evaluated')
  const [technicalSpecialistNeeded, setTechnicalSpecialistNeeded] = useState('not_evaluated')
  const [technicalMainRisks, setTechnicalMainRisks] = useState('')
  const [technicalImprovementSuggestions, setTechnicalImprovementSuggestions] = useState('')
  const [technicalAssessmentNotesV1, setTechnicalAssessmentNotesV1] = useState('')

  const [propertyRegistryStatus, setPropertyRegistryStatus] = useState('not_verified')
  const [ownerDocumentStatus, setOwnerDocumentStatus] = useState('not_verified')
  const [propertyTaxStatus, setPropertyTaxStatus] = useState('not_verified')
  const [condominiumDebtStatus, setCondominiumDebtStatus] = useState('not_applicable')
  const [financingDebtStatus, setFinancingDebtStatus] = useState('not_verified')
  const [legalRestrictionStatus, setLegalRestrictionStatus] = useState('not_verified')
  const [financingEligibilityStatus, setFinancingEligibilityStatus] = useState('not_evaluated')
  const [fiscalRiskStatus, setFiscalRiskStatus] = useState('not_evaluated')
  const [documentationRiskLevel, setDocumentationRiskLevel] = useState('not_evaluated')
  const [documentationRecommendationV1, setDocumentationRecommendationV1] = useState('request_documents')
  const [financialRecommendationV1, setFinancialRecommendationV1] = useState('to_confirm')
  const [documentationNotesV1, setDocumentationNotesV1] = useState('')
  const [financialNotesV1, setFinancialNotesV1] = useState('')

  const [summaryReadinessStatus, setSummaryReadinessStatus] = useState('draft')
  const [publicExposureLevel, setPublicExposureLevel] = useState('limited')
  const [ownerSummaryVisibility, setOwnerSummaryVisibility] = useState('internal_only')
  const [partnerSummaryVisibility, setPartnerSummaryVisibility] = useState('restricted')
  const [summaryLegalSensitivity, setSummaryLegalSensitivity] = useState('medium')
  const [publicListingSummaryV1, setPublicListingSummaryV1] = useState('')
  const [ownerFacingSummaryV1, setOwnerFacingSummaryV1] = useState('')
  const [partnerFacingSummaryV1, setPartnerFacingSummaryV1] = useState('')
  const [internalExecutiveSummaryV1, setInternalExecutiveSummaryV1] = useState('')
  const [controlledRiskDisclaimerV1, setControlledRiskDisclaimerV1] = useState('')

  const [privateNoteSensitivity, setPrivateNoteSensitivity] = useState('internal')
  const [privateNotePriority, setPrivateNotePriority] = useState('medium')
  const [privateNoteCategory, setPrivateNoteCategory] = useState('general')
  const [privateOperationalAlert, setPrivateOperationalAlert] = useState('none')
  const [privateNegotiationMemo, setPrivateNegotiationMemo] = useState('')
  const [privateOwnerBehaviorNotes, setPrivateOwnerBehaviorNotes] = useState('')
  const [privateRiskNotesV1, setPrivateRiskNotesV1] = useState('')
  const [privateAgencyNotes, setPrivateAgencyNotes] = useState('')
  const [privateFollowUpNotes, setPrivateFollowUpNotes] = useState('')
  const [privateDoNotShareNotes, setPrivateDoNotShareNotes] = useState('')
  const [commercialSubtype, setCommercialSubtype] = useState('commercial_store')
  const [commercialCurrentUse, setCommercialCurrentUse] = useState('not_verified')
  const [commercialBestUse, setCommercialBestUse] = useState('not_evaluated')
  const [ceilingHeightCategory, setCeilingHeightCategory] = useState('not_verified')
  const [streetFrontage, setStreetFrontage] = useState('not_verified')
  const [visibilityFromStreet, setVisibilityFromStreet] = useState('not_evaluated')
  const [commercialParkingAvailable, setCommercialParkingAvailable] = useState('not_verified')
  const [threePhasePowerAvailable, setThreePhasePowerAvailable] = useState('not_verified')
  const [avcbStatusInformed, setAvcbStatusInformed] = useState('not_verified')
  const [accessibilityApparent, setAccessibilityApparent] = useState('not_verified')
  const [businessRegionProfile, setBusinessRegionProfile] = useState('not_evaluated')
  const [commercialMarketAppeal, setCommercialMarketAppeal] = useState('not_evaluated')
  const [commercialRecommendation, setCommercialRecommendation] = useState('review_price')
  const [commercialNotes, setCommercialNotes] = useState('')
  const [landSubtype, setLandSubtype] = useState('public_street_lot')
  const [landTotalArea, setLandTotalArea] = useState('')
  const [frontMeasure, setFrontMeasure] = useState('')
  const [landTopography, setLandTopography] = useState('not_verified')
  const [zoningInformed, setZoningInformed] = useState('not_verified')
  const [streetType, setStreetType] = useState('not_verified')
  const [waterNetwork, setWaterNetwork] = useState('not_verified')
  const [electricityNetwork, setElectricityNetwork] = useState('not_verified')
  const [sewageNetwork, setSewageNetwork] = useState('not_verified')
  const [areaMatchesDocument, setAreaMatchesDocument] = useState('not_verified')
  const [constructionPotential, setConstructionPotential] = useState('not_evaluated')
  const [landLiquidityProfile, setLandLiquidityProfile] = useState('not_evaluated')
  const [landRecommendation, setLandRecommendation] = useState('review_price')
  const [landNotes, setLandNotes] = useState('')
  const [apartmentSubtype, setApartmentSubtype] = useState('standard_apartment')
  const [apartmentFloor, setApartmentFloor] = useState('')
  const [privateArea, setPrivateArea] = useState('')
  const [apartmentParkingType, setApartmentParkingType] = useState('not_verified')
  const [unitConservationStatus, setUnitConservationStatus] = useState('not_verified')
  const [sunPosition, setSunPosition] = useState('not_verified')
  const [viewType, setViewType] = useState('not_verified')
  const [ventilationQuality, setVentilationQuality] = useState('not_evaluated')
  const [naturalLightQuality, setNaturalLightQuality] = useState('not_evaluated')
  const [condoFeeStatus, setCondoFeeStatus] = useState('to_confirm')
  const [condominiumRisk, setCondominiumRisk] = useState('not_evaluated')
  const [shortTermRentalAllowed, setShortTermRentalAllowed] = useState('not_verified')
  const [unitRegistrationStatus, setUnitRegistrationStatus] = useState('not_verified')
  const [apartmentMarketAppeal, setApartmentMarketAppeal] = useState('not_evaluated')
  const [apartmentRecommendation, setApartmentRecommendation] = useState('review_price')
  const [apartmentNotes, setApartmentNotes] = useState('')
  const [houseSubtype, setHouseSubtype] = useState('street_house')
  const [hasCondominiumContext, setHasCondominiumContext] = useState('no')
  const [houseTopography, setHouseTopography] = useState('not_verified')
  const [constructionType, setConstructionType] = useState('not_verified')
  const [houseFloors, setHouseFloors] = useState('not_verified')
  const [generalConservationStatus, setGeneralConservationStatus] = useState('not_verified')
  const [roofCondition, setRoofCondition] = useState('not_verified')
  const [structuralRiskPerception, setStructuralRiskPerception] = useState('not_evaluated')
  const [builtAreaMatchesDocuments, setBuiltAreaMatchesDocuments] = useState('not_verified')
  const [constructionRegistered, setConstructionRegistered] = useState('not_verified')
  const [yardStatus, setYardStatus] = useState('not_verified')
  const [poolStatus, setPoolStatus] = useState('not_verified')
  const [gourmetAreaStatus, setGourmetAreaStatus] = useState('not_verified')
  const [houseParkingType, setHouseParkingType] = useState('not_verified')
  const [houseMarketAppeal, setHouseMarketAppeal] = useState('not_evaluated')
  const [houseRecommendation, setHouseRecommendation] = useState('review_price')
  const [houseNotes, setHouseNotes] = useState('')

  const [status, setStatus] = useState('')
  const [propertyType, setPropertyType] = useState<any>(null)

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

      const propertyTypeId = listingData?.property_assets?.property_type_id

      if (propertyTypeId) {
        const propertyTypeResponse = await supabase
          .from('property_type')
          .select('id, slug, label')
          .eq('id', propertyTypeId)
          .maybeSingle()

        setPropertyType(propertyTypeResponse.data || null)
      }

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

        const ruralModule = assessmentData.metadata?.rural_module_v1 || {}
        setRuralSubtype(ruralModule.rural_subtype || 'small_farm')
        setRuralTotalArea(ruralModule.total_area?.toString() || '')
        setRuralAreaUnit(ruralModule.area_unit || 'hectare')
        setRuralAreaMatchesDocument(ruralModule.area_matches_document || 'not_verified')
        setRuralAccessQuality(ruralModule.access_quality || 'not_evaluated')
        setRainySeasonAccessRisk(ruralModule.rainy_season_access_risk || 'not_evaluated')
        setElectricityAvailable(ruralModule.electricity_available || 'not_verified')
        setWaterAvailability(ruralModule.water_availability || 'not_verified')
        setImprovementsCondition(ruralModule.improvements_condition || 'not_verified')
        setCurrentRuralUse(ruralModule.current_rural_use || 'not_verified')
        setProductivePotential(ruralModule.productive_potential || 'not_evaluated')
        setEnvironmentalRisk(ruralModule.environmental_risk || 'not_evaluated')
        setRuralDocumentationStatus(ruralModule.rural_documentation_status || 'not_verified')
        setGeoreferencingStatus(ruralModule.georeferencing_status || 'not_verified')
        setRuralMarketAppeal(ruralModule.rural_market_appeal || 'not_evaluated')
        setRuralRecommendation(ruralModule.rural_recommendation || 'review_price')
        setRuralNotes(ruralModule.rural_notes || '')

        const ownerInterviewModule = assessmentData.metadata?.owner_interview_v1 || {}
        setOwnerInterviewSource(ownerInterviewModule.owner_interview_source || 'not_verified')
        setOwnerMotivation(ownerInterviewModule.owner_motivation || 'not_evaluated')
        setNegotiationUrgency(ownerInterviewModule.negotiation_urgency || 'not_evaluated')
        setOwnerAvailability(ownerInterviewModule.owner_availability || 'to_schedule')
        setExclusiveAuthorization(ownerInterviewModule.exclusive_authorization || 'not_verified')
        setCommissionAgreementStatus(ownerInterviewModule.commission_agreement_status || 'not_verified')
        setDocumentationProvidedStatus(ownerInterviewModule.documentation_provided_status || 'not_provided')
        setPriceFlexibility(ownerInterviewModule.price_flexibility || 'not_evaluated')
        setExchangeInterest(ownerInterviewModule.exchange_interest || 'not_verified')
        setOwnerCommunicationPreference(ownerInterviewModule.owner_communication_preference || 'not_informed')
        setOwnerMainObjectionsV1(ownerInterviewModule.owner_main_objections || '')
        setOwnerInterviewNotesV1(ownerInterviewModule.owner_interview_notes || '')

        const commercialProposal = assessmentData.metadata?.commercial_proposal_v1 || {}
        setProposalCommercialDiagnosis(commercialProposal.commercial_diagnosis || 'not_evaluated')
        setProposalRecommendedPositioning(commercialProposal.recommended_positioning || 'standard_market')
        setProposalListingStrategy(commercialProposal.listing_strategy || 'publish_after_review')
        setProposalNegotiationStrategy(commercialProposal.negotiation_strategy || 'neutral_margin')
        setProposalOwnerArgument(commercialProposal.owner_argument || '')
        setProposalPublicHighlights(commercialProposal.public_highlights || '')
        setProposalAttentionPoints(commercialProposal.attention_points || '')
        setProposalNextAction(commercialProposal.next_action || 'review_price')
        setProposalFollowUpDate(commercialProposal.follow_up_date || '')
        setProposalInternalNotes(commercialProposal.internal_notes || '')

        const technicalAssessmentV1 = assessmentData.metadata?.technical_assessment_v1 || {}
        setTechnicalVisitQuality(technicalAssessmentV1.visit_quality || 'not_evaluated')
        setTechnicalConservationStatus(technicalAssessmentV1.conservation_status || 'not_verified')
        setTechnicalStructuralRisk(technicalAssessmentV1.structural_risk || 'not_evaluated')
        setTechnicalMoistureRisk(technicalAssessmentV1.moisture_risk || 'not_evaluated')
        setTechnicalElectricalCondition(technicalAssessmentV1.electrical_condition || 'not_verified')
        setTechnicalHydraulicCondition(technicalAssessmentV1.hydraulic_condition || 'not_verified')
        setTechnicalFinishingStandard(technicalAssessmentV1.finishing_standard || 'not_evaluated')
        setTechnicalRenovationNeed(technicalAssessmentV1.renovation_need || 'not_evaluated')
        setTechnicalPhotoQuality(technicalAssessmentV1.photo_quality || 'not_evaluated')
        setTechnicalSpecialistNeeded(technicalAssessmentV1.specialist_needed || 'not_evaluated')
        setTechnicalMainRisks(technicalAssessmentV1.main_risks || '')
        setTechnicalImprovementSuggestions(technicalAssessmentV1.improvement_suggestions || '')
        setTechnicalAssessmentNotesV1(technicalAssessmentV1.technical_notes || '')

        const documentationFinancialV1 = assessmentData.metadata?.documentation_financial_v1 || {}
        setPropertyRegistryStatus(documentationFinancialV1.property_registry_status || 'not_verified')
        setOwnerDocumentStatus(documentationFinancialV1.owner_document_status || 'not_verified')
        setPropertyTaxStatus(documentationFinancialV1.property_tax_status || 'not_verified')
        setCondominiumDebtStatus(documentationFinancialV1.condominium_debt_status || 'not_applicable')
        setFinancingDebtStatus(documentationFinancialV1.financing_debt_status || 'not_verified')
        setLegalRestrictionStatus(documentationFinancialV1.legal_restriction_status || 'not_verified')
        setFinancingEligibilityStatus(documentationFinancialV1.financing_eligibility_status || 'not_evaluated')
        setFiscalRiskStatus(documentationFinancialV1.fiscal_risk_status || 'not_evaluated')
        setDocumentationRiskLevel(documentationFinancialV1.documentation_risk_level || 'not_evaluated')
        setDocumentationRecommendationV1(documentationFinancialV1.documentation_recommendation || 'request_documents')
        setFinancialRecommendationV1(documentationFinancialV1.financial_recommendation || 'to_confirm')
        setDocumentationNotesV1(documentationFinancialV1.documentation_notes || '')
        setFinancialNotesV1(documentationFinancialV1.financial_notes || '')

        const controlledSummariesV1 = assessmentData.metadata?.controlled_summaries_v1 || {}
        setSummaryReadinessStatus(controlledSummariesV1.summary_readiness_status || 'draft')
        setPublicExposureLevel(controlledSummariesV1.public_exposure_level || 'limited')
        setOwnerSummaryVisibility(controlledSummariesV1.owner_summary_visibility || 'internal_only')
        setPartnerSummaryVisibility(controlledSummariesV1.partner_summary_visibility || 'restricted')
        setSummaryLegalSensitivity(controlledSummariesV1.summary_legal_sensitivity || 'medium')
        setPublicListingSummaryV1(controlledSummariesV1.public_listing_summary || '')
        setOwnerFacingSummaryV1(controlledSummariesV1.owner_facing_summary || '')
        setPartnerFacingSummaryV1(controlledSummariesV1.partner_facing_summary || '')
        setInternalExecutiveSummaryV1(controlledSummariesV1.internal_executive_summary || '')
        setControlledRiskDisclaimerV1(controlledSummariesV1.controlled_risk_disclaimer || '')

        const privateNotesV1 = assessmentData.metadata?.private_notes_v1 || {}
        setPrivateNoteSensitivity(privateNotesV1.note_sensitivity || 'internal')
        setPrivateNotePriority(privateNotesV1.note_priority || 'medium')
        setPrivateNoteCategory(privateNotesV1.note_category || 'general')
        setPrivateOperationalAlert(privateNotesV1.operational_alert || 'none')
        setPrivateNegotiationMemo(privateNotesV1.negotiation_memo || '')
        setPrivateOwnerBehaviorNotes(privateNotesV1.owner_behavior_notes || '')
        setPrivateRiskNotesV1(privateNotesV1.risk_notes || '')
        setPrivateAgencyNotes(privateNotesV1.agency_notes || '')
        setPrivateFollowUpNotes(privateNotesV1.follow_up_notes || '')
        setPrivateDoNotShareNotes(privateNotesV1.do_not_share_notes || '')
        const commercialModule = assessmentData.metadata?.commercial_module_v1 || {}
        setCommercialSubtype(commercialModule.commercial_subtype || 'commercial_store')
        setCommercialCurrentUse(commercialModule.current_use || 'not_verified')
        setCommercialBestUse(commercialModule.intended_best_use || 'not_evaluated')
        setCeilingHeightCategory(commercialModule.ceiling_height_category || 'not_verified')
        setStreetFrontage(commercialModule.street_frontage || 'not_verified')
        setVisibilityFromStreet(commercialModule.visibility_from_street || 'not_evaluated')
        setCommercialParkingAvailable(commercialModule.parking_available || 'not_verified')
        setThreePhasePowerAvailable(commercialModule.three_phase_power_available || 'not_verified')
        setAvcbStatusInformed(commercialModule.avcb_status_informed || 'not_verified')
        setAccessibilityApparent(commercialModule.accessibility_apparent || 'not_verified')
        setBusinessRegionProfile(commercialModule.business_region_profile || 'not_evaluated')
        setCommercialMarketAppeal(commercialModule.commercial_market_appeal || 'not_evaluated')
        setCommercialRecommendation(commercialModule.commercial_recommendation || 'review_price')
        setCommercialNotes(commercialModule.commercial_notes || '')
        const landModule = assessmentData.metadata?.land_module_v1 || {}
        setLandSubtype(landModule.land_subtype || 'public_street_lot')
        setLandTotalArea(landModule.total_area?.toString() || '')
        setFrontMeasure(landModule.front_measure?.toString() || '')
        setLandTopography(landModule.topography || 'not_verified')
        setZoningInformed(landModule.zoning_informed || 'not_verified')
        setStreetType(landModule.street_type || 'not_verified')
        setWaterNetwork(landModule.water_network || 'not_verified')
        setElectricityNetwork(landModule.electricity_network || 'not_verified')
        setSewageNetwork(landModule.sewage_network || 'not_verified')
        setAreaMatchesDocument(landModule.area_matches_document || 'not_verified')
        setConstructionPotential(landModule.construction_potential || 'not_evaluated')
        setLandLiquidityProfile(landModule.liquidity_profile || 'not_evaluated')
        setLandRecommendation(landModule.land_recommendation || 'review_price')
        setLandNotes(landModule.land_notes || '')
        const apartmentModule = assessmentData.metadata?.apartment_module_v1 || {}
        setApartmentSubtype(apartmentModule.apartment_subtype || 'standard_apartment')
        setApartmentFloor(apartmentModule.unit_floor?.toString() || '')
        setPrivateArea(apartmentModule.private_area?.toString() || '')
        setApartmentParkingType(apartmentModule.parking_type || 'not_verified')
        setUnitConservationStatus(apartmentModule.general_unit_conservation || 'not_verified')
        setSunPosition(apartmentModule.sun_position || 'not_verified')
        setViewType(apartmentModule.view_type || 'not_verified')
        setVentilationQuality(apartmentModule.ventilation_quality || 'not_evaluated')
        setNaturalLightQuality(apartmentModule.natural_light_quality || 'not_evaluated')
        setCondoFeeStatus(apartmentModule.condo_fee_status || 'to_confirm')
        setCondominiumRisk(apartmentModule.condominium_risk || 'not_evaluated')
        setShortTermRentalAllowed(apartmentModule.short_term_rental_allowed || 'not_verified')
        setUnitRegistrationStatus(apartmentModule.unit_registration_status || 'not_verified')
        setApartmentMarketAppeal(apartmentModule.apartment_market_appeal || 'not_evaluated')
        setApartmentRecommendation(apartmentModule.apartment_recommendation || 'review_price')
        setApartmentNotes(apartmentModule.apartment_notes || '')
        const houseModule = assessmentData.metadata?.house_module_v1 || {}
        setHouseSubtype(houseModule.house_subtype || 'street_house')
        setHasCondominiumContext(houseModule.has_condominium_context || 'no')
        setHouseTopography(houseModule.topography || 'not_verified')
        setConstructionType(houseModule.construction_type || 'not_verified')
        setHouseFloors(houseModule.floors || 'not_verified')
        setGeneralConservationStatus(houseModule.general_conservation_status || 'not_verified')
        setRoofCondition(houseModule.roof_condition || 'not_verified')
        setStructuralRiskPerception(houseModule.structural_risk_perception || 'not_evaluated')
        setBuiltAreaMatchesDocuments(houseModule.built_area_matches_documents || 'not_verified')
        setConstructionRegistered(houseModule.construction_registered || 'not_verified')
        setYardStatus(houseModule.yard_status || 'not_verified')
        setPoolStatus(houseModule.pool_status || 'not_verified')
        setGourmetAreaStatus(houseModule.gourmet_area_status || 'not_verified')
        setHouseParkingType(houseModule.parking_type || 'not_verified')
        setHouseMarketAppeal(houseModule.house_market_appeal || 'not_evaluated')
        setHouseRecommendation(houseModule.house_recommendation || 'review_price')
        setHouseNotes(houseModule.house_notes || '')
      }

      setLoading(false)
    }

    init()
  }, [listingId])

  const propertyTypeSlug = String(propertyType?.slug || '').toLowerCase()
  const propertyTypeLabel = String(propertyType?.label || '').toLowerCase()
  const propertyTypeText = `${propertyTypeSlug} ${propertyTypeLabel}`

  const shouldShowTypeModule = (moduleKey: string) => {
    if (!propertyTypeText.trim()) {
      return false
    }

    const isApartment =
      propertyTypeText.includes('apart') ||
      propertyTypeText.includes('studio') ||
      propertyTypeText.includes('loft') ||
      propertyTypeText.includes('kitnet') ||
      propertyTypeText.includes('flat')

    const isHouse =
      propertyTypeText.includes('casa') ||
      propertyTypeText.includes('house') ||
      propertyTypeText.includes('sobrado')

    const isLand =
      propertyTypeText.includes('terreno') ||
      propertyTypeText.includes('lote') ||
      propertyTypeText.includes('land')

    const isCommercial =
      propertyTypeText.includes('comercial') ||
      propertyTypeText.includes('loja') ||
      propertyTypeText.includes('sala') ||
      propertyTypeText.includes('galp') ||
      propertyTypeText.includes('barrac') ||
      propertyTypeText.includes('commercial') ||
      propertyTypeText.includes('warehouse')

    const isRural =
      propertyTypeText.includes('rural') ||
      propertyTypeText.includes('chacara') ||
      propertyTypeText.includes('chácara') ||
      propertyTypeText.includes('sitio') ||
      propertyTypeText.includes('sítio') ||
      propertyTypeText.includes('fazenda') ||
      propertyTypeText.includes('farm')

    if (moduleKey === 'apartment') return isApartment
    if (moduleKey === 'house') return isHouse
    if (moduleKey === 'land') return isLand
    if (moduleKey === 'commercial') return isCommercial
    if (moduleKey === 'rural') return isRural

    return true
  }

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

      setStatus('Salvando análise patrimonial...')

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
          commercial_product: 'Análise Patrimonial do Imóvel',
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
          rural_module_v1: {
            rural_subtype: ruralSubtype,
            total_area: moneyOrNull(ruralTotalArea),
            area_unit: ruralAreaUnit,
            area_matches_document: ruralAreaMatchesDocument,
            access_quality: ruralAccessQuality,
            rainy_season_access_risk: rainySeasonAccessRisk,
            electricity_available: electricityAvailable,
            water_availability: waterAvailability,
            improvements_condition: improvementsCondition,
            current_rural_use: currentRuralUse,
            productive_potential: productivePotential,
            environmental_risk: environmentalRisk,
            rural_documentation_status: ruralDocumentationStatus,
            georeferencing_status: georeferencingStatus,
            rural_market_appeal: ruralMarketAppeal,
            rural_recommendation: ruralRecommendation,
            rural_notes: ruralNotes,
          },                    owner_interview_v1: {
            owner_interview_source: ownerInterviewSource,
            owner_motivation: ownerMotivation,
            negotiation_urgency: negotiationUrgency,
            owner_availability: ownerAvailability,
            exclusive_authorization: exclusiveAuthorization,
            commission_agreement_status: commissionAgreementStatus,
            documentation_provided_status: documentationProvidedStatus,
            price_flexibility: priceFlexibility,
            exchange_interest: exchangeInterest,
            owner_communication_preference: ownerCommunicationPreference,
            owner_main_objections: ownerMainObjectionsV1,
            owner_interview_notes: ownerInterviewNotesV1,
          },          commercial_proposal_v1: {
            commercial_diagnosis: proposalCommercialDiagnosis,
            recommended_positioning: proposalRecommendedPositioning,
            listing_strategy: proposalListingStrategy,
            negotiation_strategy: proposalNegotiationStrategy,
            owner_argument: proposalOwnerArgument,
            public_highlights: proposalPublicHighlights,
            attention_points: proposalAttentionPoints,
            next_action: proposalNextAction,
            follow_up_date: proposalFollowUpDate,
            internal_notes: proposalInternalNotes,
          },          technical_assessment_v1: {
            visit_quality: technicalVisitQuality,
            conservation_status: technicalConservationStatus,
            structural_risk: technicalStructuralRisk,
            moisture_risk: technicalMoistureRisk,
            electrical_condition: technicalElectricalCondition,
            hydraulic_condition: technicalHydraulicCondition,
            finishing_standard: technicalFinishingStandard,
            renovation_need: technicalRenovationNeed,
            photo_quality: technicalPhotoQuality,
            specialist_needed: technicalSpecialistNeeded,
            main_risks: technicalMainRisks,
            improvement_suggestions: technicalImprovementSuggestions,
            technical_notes: technicalAssessmentNotesV1,
          },          documentation_financial_v1: {
            property_registry_status: propertyRegistryStatus,
            owner_document_status: ownerDocumentStatus,
            property_tax_status: propertyTaxStatus,
            condominium_debt_status: condominiumDebtStatus,
            financing_debt_status: financingDebtStatus,
            legal_restriction_status: legalRestrictionStatus,
            financing_eligibility_status: financingEligibilityStatus,
            fiscal_risk_status: fiscalRiskStatus,
            documentation_risk_level: documentationRiskLevel,
            documentation_recommendation: documentationRecommendationV1,
            financial_recommendation: financialRecommendationV1,
            documentation_notes: documentationNotesV1,
            financial_notes: financialNotesV1,
          },          controlled_summaries_v1: {
            summary_readiness_status: summaryReadinessStatus,
            public_exposure_level: publicExposureLevel,
            owner_summary_visibility: ownerSummaryVisibility,
            partner_summary_visibility: partnerSummaryVisibility,
            summary_legal_sensitivity: summaryLegalSensitivity,
            public_listing_summary: publicListingSummaryV1,
            owner_facing_summary: ownerFacingSummaryV1,
            partner_facing_summary: partnerFacingSummaryV1,
            internal_executive_summary: internalExecutiveSummaryV1,
            controlled_risk_disclaimer: controlledRiskDisclaimerV1,
          },          private_notes_v1: {
            note_sensitivity: privateNoteSensitivity,
            note_priority: privateNotePriority,
            note_category: privateNoteCategory,
            operational_alert: privateOperationalAlert,
            negotiation_memo: privateNegotiationMemo,
            owner_behavior_notes: privateOwnerBehaviorNotes,
            risk_notes: privateRiskNotesV1,
            agency_notes: privateAgencyNotes,
            follow_up_notes: privateFollowUpNotes,
            do_not_share_notes: privateDoNotShareNotes,
          },commercial_module_v1: {
            commercial_subtype: commercialSubtype,
            current_use: commercialCurrentUse,
            intended_best_use: commercialBestUse,
            ceiling_height_category: ceilingHeightCategory,
            street_frontage: streetFrontage,
            visibility_from_street: visibilityFromStreet,
            parking_available: commercialParkingAvailable,
            three_phase_power_available: threePhasePowerAvailable,
            avcb_status_informed: avcbStatusInformed,
            accessibility_apparent: accessibilityApparent,
            business_region_profile: businessRegionProfile,
            commercial_market_appeal: commercialMarketAppeal,
            commercial_recommendation: commercialRecommendation,
            commercial_notes: commercialNotes,
          },          land_module_v1: {
            land_subtype: landSubtype,
            total_area: moneyOrNull(landTotalArea),
            front_measure: moneyOrNull(frontMeasure),
            topography: landTopography,
            zoning_informed: zoningInformed,
            street_type: streetType,
            water_network: waterNetwork,
            electricity_network: electricityNetwork,
            sewage_network: sewageNetwork,
            area_matches_document: areaMatchesDocument,
            construction_potential: constructionPotential,
            liquidity_profile: landLiquidityProfile,
            land_recommendation: landRecommendation,
            land_notes: landNotes,
          },          apartment_module_v1: {
            apartment_subtype: apartmentSubtype,
            unit_floor: moneyOrNull(apartmentFloor),
            private_area: moneyOrNull(privateArea),
            parking_type: apartmentParkingType,
            general_unit_conservation: unitConservationStatus,
            sun_position: sunPosition,
            view_type: viewType,
            ventilation_quality: ventilationQuality,
            natural_light_quality: naturalLightQuality,
            condo_fee_status: condoFeeStatus,
            condominium_risk: condominiumRisk,
            short_term_rental_allowed: shortTermRentalAllowed,
            unit_registration_status: unitRegistrationStatus,
            apartment_market_appeal: apartmentMarketAppeal,
            apartment_recommendation: apartmentRecommendation,
            apartment_notes: apartmentNotes,
          },          house_module_v1: {
            house_subtype: houseSubtype,
            has_condominium_context: hasCondominiumContext,
            topography: houseTopography,
            construction_type: constructionType,
            floors: houseFloors,
            general_conservation_status: generalConservationStatus,
            roof_condition: roofCondition,
            structural_risk_perception: structuralRiskPerception,
            built_area_matches_documents: builtAreaMatchesDocuments,
            construction_registered: constructionRegistered,
            yard_status: yardStatus,
            pool_status: poolStatus,
            gourmet_area_status: gourmetAreaStatus,
            parking_type: houseParkingType,
            house_market_appeal: houseMarketAppeal,
            house_recommendation: houseRecommendation,
            house_notes: houseNotes,
          },
        },
      })

      if (response.error) {
        setStatus(response.error.message || 'Erro ao salvar análise.')
        setSaving(false)
        return
      }

      setAssessment(response.data)

      if (!assessment) {
        setStatus(clientEntityId ? 'Proprietário vinculado. Análise Patrimonial liberada para preenchimento.' : 'Análise Patrimonial preliminar criada sem proprietário vinculado. Você pode vincular o cliente depois.')
        setSaving(false)
        return
      }

      setStatus('Análise Patrimonial salva. Redirecionando para o checkup...')

      setTimeout(() => {
        window.location.href = `/operations/properties/${listingId}`
      }, 700)
    } catch (error) {
      console.error(error)
      setStatus('Erro interno ao salvar análise.')
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

        .module-nav {
          background: #fff;
          border: 1px solid #dde3ea;
          border-radius: 16px;
          padding: 12px;
          margin: 0 0 18px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
        }

        .module-nav a {
          display: inline-flex;
          align-items: center;
          border: 1px solid #dbe3ec;
          border-radius: 999px;
          padding: 7px 10px;
          background: #f8fafc;
          color: #334155;
          text-decoration: none;
          font-size: 12px;
          font-weight: 700;
        }

        .module-nav a:hover {
          background: #eef4fb;
          border-color: #b8c7d9;
        }

        .field-help,
        label small,
        .field-guide {
          display: block;
          margin-top: 7px;
          color: #64748b;
          font-size: 12px;
          line-height: 1.45;
          font-weight: 500;
        }

        .field-guide strong {
          color: #334155;
          font-weight: 800;
        }

        .back-to-top {
          display: inline-flex;
          margin: -4px 0 12px;
          color: #2563eb;
          font-size: 12px;
          font-weight: 800;
          text-decoration: none;
        }

        .back-to-top:hover {
          text-decoration: underline;
        }

        html {
          scroll-behavior: smooth;
        }

        .analysis-note {
          border-left: 4px solid #2563eb;
          background: #eff6ff;
          color: #1e3a8a;
          padding: 12px 14px;
          border-radius: 12px;
          margin: 10px 0 16px;
          font-size: 13px;
          line-height: 1.5;
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


        /* FORCE_LAYOUT_ANALISE_PATRIMONIAL_V1 */
        .assessment-page {
          font-family: 'Google Sans', 'Product Sans', Inter, Arial, sans-serif;
        }

        .assessment-flow-panel {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin: 16px 0 20px;
        }

        .assessment-flow-panel > div {
          background: #ffffff;
          border: 1px solid #dbeafe;
          border-radius: 18px;
          padding: 14px;
          box-shadow: 0 8px 22px rgba(15, 23, 42, 0.045);
        }

        .assessment-flow-panel strong {
          display: block;
          color: #1e3a8a;
          font-size: 13px;
          margin-bottom: 5px;
        }

        .assessment-flow-panel span {
          display: block;
          color: #475569;
          font-size: 12px;
          line-height: 1.45;
        }

        .assessment-page > hr {
          display: none !important;
        }

        .assessment-page > h2 {
          margin: 30px 0 14px !important;
          padding: 18px 20px !important;
          border: 1px solid #cbd5e1 !important;
          border-left: 6px solid #2563eb !important;
          border-radius: 20px !important;
          background: linear-gradient(180deg, #ffffff, #f8fafc) !important;
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.07) !important;
          font-size: 21px !important;
        }

        .assessment-page > h2 + .back-to-top {
          margin: -4px 0 12px !important;
        }

        .assessment-page > h2 + .back-to-top + p,
        .assessment-page > h2 + .back-to-top + p + p,
        .assessment-page > h2 + p,
        .assessment-page > h2 + p + p {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 12px 14px;
          color: #475569;
          line-height: 1.5;
        }

        .assessment-page label {
          display: inline-block !important;
          vertical-align: top !important;
          width: calc(50% - 10px) !important;
          min-height: 116px !important;
          box-sizing: border-box !important;
          background: #ffffff !important;
          border: 1px solid #dbe3ec !important;
          border-radius: 18px !important;
          padding: 14px !important;
          margin: 8px 8px 8px 0 !important;
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.045) !important;
        }

        .assessment-page label:has(textarea) {
          width: calc(100% - 8px) !important;
        }

        .assessment-page label:hover {
          border-color: #bfdbfe !important;
          box-shadow: 0 10px 26px rgba(37, 99, 235, 0.09) !important;
        }

        .assessment-page label > br {
          display: none !important;
        }

        .assessment-page > br,
        .assessment-page label + br {
          display: none !important;
        }

        .assessment-page input,
        .assessment-page textarea,
        .assessment-page select {
          margin-top: 8px !important;
        }

        .assessment-page textarea {
          min-height: 126px !important;
        }

        .assessment-page .field-guide {
          border-top: 1px solid #eef2f7;
          padding-top: 9px;
          margin-top: 10px;
        }

        .assessment-page .analysis-note,
        .assessment-page .sensitive-note {
          display: block;
          width: calc(100% - 8px);
          box-sizing: border-box;
          margin: 12px 0 16px;
        }

        .module-nav {
          position: sticky;
          top: 10px;
          z-index: 10;
          border-color: #bfdbfe !important;
        }

        .assessment-action-bar {
          position: sticky;
          bottom: 12px;
          z-index: 10;
          border-color: #bfdbfe !important;
        }


        /* OWNER_LINK_PLACEHOLDER_V1 */
        .owner-link-placeholder-v1 {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          background: #fff7ed;
          border: 1px solid #fed7aa;
          border-radius: 20px;
          padding: 16px;
          margin: 14px 0 18px;
          box-shadow: 0 8px 22px rgba(15, 23, 42, 0.045);
        }

        .owner-link-placeholder-v1 strong {
          display: block;
          color: #9a3412;
          font-size: 16px;
          margin: 2px 0 4px;
        }

        .owner-link-placeholder-v1 p {
          margin: 0;
          color: #7c2d12;
          font-size: 13px;
          line-height: 1.45;
        }

        .owner-kicker {
          display: inline-block;
          color: #c2410c;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .owner-link-button {
          border: 1px solid #fdba74;
          background: #ffedd5;
          color: #9a3412;
          border-radius: 999px;
          padding: 9px 14px;
          font-size: 12px;
          font-weight: 900;
          white-space: nowrap;
        }

        .owner-link-button:disabled {
          opacity: 0.75;
          cursor: not-allowed;
        }


        /* TOP_INDICATORS_ANALISE_PATRIMONIAL_V1 */
        .top-indicators-v1 {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 10px;
          margin: 14px 0 18px;
        }

        .top-indicator-card {
          background: #ffffff;
          border: 1px solid #dbe3ec;
          border-radius: 16px;
          padding: 12px;
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.045);
        }

        .top-indicator-card span {
          display: block;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: #64748b;
          margin-bottom: 4px;
        }

        .top-indicator-card strong {
          display: block;
          color: #172033;
          font-size: 13px;
          line-height: 1.25;
        }

        .top-indicator-warning {
          border-color: #fed7aa;
          background: #fff7ed;
        }

        .top-indicator-warning strong {
          color: #9a3412;
        }

        .top-indicator-ok {
          border-color: #bbf7d0;
          background: #f0fdf4;
        }

        .top-indicator-ok strong {
          color: #166534;
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

      <section id="topo-documento" className="assessment-hero">
        <div>
          <p className="assessment-eyebrow">Análise Patrimonial</p>
          <h1>Análise Patrimonial do Imóvel</h1>
          <p>
            Registro técnico e comercial interno para apoiar captacao, vistoria, precificacao,
            riscos, estrategia de negociacao e proximos passos do broker.
          </p>
        </div>

        <div className="assessment-badges">
          <span className="assessment-badge">{assessment ? 'Documento criado' : 'Preliminar nao criado'}</span>
          <span className="assessment-badge">{assessmentStatus || 'draft'}</span>
          <span className="assessment-badge">Uso interno</span>
        </div>
      </section>

      <section className="owner-link-placeholder-v1">
        <div>
          <span className="owner-kicker">Proprietario</span>
          <strong>Nao vinculado</strong>
          <p>
            Este patrimonio ainda nao possui proprietario vinculado no Core Clients.
            Futuramente este bloco deve buscar por CPF/CNPJ, localizar cliente existente
            ou abrir cadastro minimo antes de liberar fluxo completo.
          </p>
        </div>
        <button type="button" className="owner-link-button" disabled>
          Vincular proprietario
        </button>
      </section>


      <style>{`
        @media print {
          /* PRINT_HIDE_FIELD_GUIDES_FORCE_V1 */
          .field-guide {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            min-height: 0 !important;
            max-height: 0 !important;
            overflow: hidden !important;
            padding: 0 !important;
            margin: 0 !important;
            border: 0 !important;
          }

          label {
            min-height: auto !important;
          }

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

      <nav className="module-nav no-print" aria-label="Navegacao da Análise Patrimonial">
        <a href="#owner-link">Proprietario</a>
        <a href="#document-control">Controle</a>
        <a href="#base-common">Base Comum</a>
        <a href="#price-strategy">Preco</a>
        {shouldShowTypeModule('house') && <a href="#house-module">Casa</a>}
        {shouldShowTypeModule('apartment') && <a href="#apartment-module">Apartamento</a>}
        {shouldShowTypeModule('land') && <a href="#land-module">Terreno</a>}
        {shouldShowTypeModule('commercial') && <a href="#commercial-module">Comercial</a>}
        {shouldShowTypeModule('rural') && <a href="#rural-module">Rural</a>}
        <a href="#commercial-reading">Leitura comercial</a>
        <a href="#commercial-proposal-v1">Proposta comercial</a>
        <a href="#controlled-summaries-v1">Resumos</a>
        <a href="#private-notes-v1">Notas privadas</a>
        <a href="#technical-assessment-v1">Avaliacao tecnica</a>
        <a href="#documentation-financial-v1">Doc. e financeiro</a>
        <a href="#owner-interview-v1">Entrevista</a>
      </nav>
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
        <h2>O que e esta análise?</h2>
        <p>
          A Análise Patrimonial é uma ferramenta técnica interna do profissional ou da imobiliária.
          Ela nao e o anuncio publico do imovel.
        </p>
        <p>
          Use esta tela para registrar avaliacao tecnica, entrevista com proprietario,
          documentacao, riscos, estrategia comercial e notas privadas.
        </p>
        <p>
          Proprietario e parceiros devem ver apenas resumos controlados quando permitido.
          Notas privadas, preço mínimo, riscos sensíveis e dados pessoais não devem ser expostos.
        </p>
      </section>

      <section className="assessment-linked-summary">
        <div className="summary-item">
          <span className="summary-label">Anúncio vinculado</span>
          <span className="summary-value">{listing?.title || 'Sem título'}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Listing ID</span>
          <span className="summary-value">{listingId}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Status da análise</span>
          <span className="summary-value">{assessment ? assessmentStatus : 'Preliminar pendente'}</span>
        </div>
      </section>

      {!assessment && (
        <>
          <hr />
          <h2 id="owner-link">1. Proprietario da análise</h2>
      <a className="back-to-top no-print" href="#topo-documento">↑ Voltar ao topo</a>
          <p>Opcional nesta etapa. Informe CPF ou CNPJ se quiser vincular o proprietario agora, ou crie a análise preliminar e vincule depois.</p>

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
          <label>Observacoes da captacao<br /><textarea value={ownerNotes} onChange={(e) => setOwnerNotes(e.target.value)} rows={3} style={{ width: '100%' }} />
        <div className="field-guide"><strong>O que e:</strong> criterio de avaliacao da Análise Patrimonial.<br /><strong>Como avaliar:</strong> escolha com base em evidencia. Quando nao houver comprovacao, use a confirmar, pendente ou nao verificado.</div>
      </label>
        </>
      )}

      {!assessment && (
        <>
          <hr />

          <section className="assessment-card">
            <h2>Antes de liberar o documento</h2>

            <p>
              A Análise Patrimonial pode nascer como levantamento preliminar sem proprietário vinculado.
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
            {saving ? 'Salvando...' : 'Criar Análise Patrimonial'}
          </button>

          <br /><br />

          {status && <p>{status}</p>}
        </>
      )}

      {assessment && (
        <>

          <hr />

          <h2 id="document-control">2. Controle da análise</h2>
      <a className="back-to-top no-print" href="#topo-documento">↑ Voltar ao topo</a>

      <label>
        Status da análise
        <br />
        <select value={assessmentStatus} onChange={(e) => setAssessmentStatus(e.target.value as ProfessionalAssessmentStatus)}>
          <option value="draft">Rascunho</option>
          <option value="submitted_for_review">Enviada para revisao</option>
          <option value="needs_correction">Precisa de revisao</option>
          <option value="approved">Aprovada</option>
          <option value="rejected">Rejeitada</option>
          <option value="archived">Arquivada</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> criterio de avaliacao da Análise Patrimonial.<br /><strong>Como avaliar:</strong> escolha com base em evidencia. Quando nao houver comprovacao, use a confirmar, pendente ou nao verificado.</div>
      </label>

      <br /><br />

      <label>
        Finalidade da análise
        <br />
        <select value={assessmentPurpose} onChange={(e) => setAssessmentPurpose(e.target.value as ProfessionalAssessmentPurpose)}>
          <option value="general">Geral</option>
          <option value="sale">Venda</option>
          <option value="rental">Locacao</option>
          <option value="rental_management">Locacao com gestao/admin</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> criterio de avaliacao da Análise Patrimonial.<br /><strong>Como avaliar:</strong> escolha com base em evidencia. Quando nao houver comprovacao, use a confirmar, pendente ou nao verificado.</div>
      </label>

      <br /><br />


      <section className="assessment-section assessment-section-base-common">

      <hr />

      <h2 id="base-common">3. Base Comum V1</h2>
      <a className="back-to-top no-print" href="#topo-documento">↑ Voltar ao topo</a>
      <p>Campos estruturados iniciais. Nesta fase salvam em metadata JSONB, mas foram modelados para virar estrutura antes do fechamento do core.</p>
      <p className="analysis-note">Como analisar: marque a opcao mais fiel ao que foi comprovado. Se a informacao veio apenas de fala do proprietario, use opcoes como "nao verificado", "a confirmar" ou "pendente de comprovacao".</p>

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
        <div className="field-guide"><strong>O que e:</strong> classificar a finalidade operacional da análise.<br /><strong>Como avaliar:</strong> use levantamento preliminar quando ainda faltam dados; use vistoria/revisao quando ja existe analise mais firme.</div>
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
        <div className="field-guide"><strong>O que e:</strong> registrar de onde nasceu a demanda.<br /><strong>Como avaliar:</strong> escolha se veio de anuncio, cliente, atendimento externo, indicacao, agencia ou marketplace.</div>
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
        <div className="field-guide"><strong>O que e:</strong> indicar a fonte principal dos dados.<br /><strong>Como avaliar:</strong> se voce viu pessoalmente, marque verificado; se veio de fala, documento ou anuncio anterior, marque a origem correta.</div>
      </label>

      <br /><br />

      <label>Visita presencial<br />
        <select value={visitStatus} onChange={(e) => setVisitStatus(e.target.value)}>
          <option value="yes">Sim</option>
          <option value="no">Nao</option>
          <option value="partial">Parcial</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> mostrar se houve verificacao no local.<br /><strong>Como avaliar:</strong> marque parcial quando viu apenas parte do imovel ou nao conseguiu conferir todos os pontos.</div>
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
        <div className="field-guide"><strong>O que e:</strong> identificar a pessoa que alimentou os dados.<br /><strong>Como avaliar:</strong> prefira a fonte real da informacao; isso ajuda a medir confiabilidade e risco.</div>
      </label>

      <br /><br />

      <label>Nivel de confianca da informacao<br />
        <select value={informationConfidence} onChange={(e) => setInformationConfidence(e.target.value)}>
          <option value="high">Alto</option>
          <option value="medium">Medio</option>
          <option value="low">Baixo</option>
          <option value="pending_verification">Pendente de comprovacao</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> medir o quanto a informacao pode ser considerada segura.<br /><strong>Como avaliar:</strong> alto exige verificacao/documento; se for apenas verbal ou incerto, use baixo ou pendente.</div>
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
        <div className="field-guide"><strong>O que e:</strong> definir o objetivo profissional da analise.<br /><strong>Como avaliar:</strong> se o foco for ajustar preco, marque revisao de preco; se for preparar venda/locacao, marque a finalidade correspondente.</div>
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
        <div className="field-guide"><strong>O que e:</strong> informar quem ocupa ou se o imovel esta livre.<br /><strong>Como avaliar:</strong> use nao verificado se nao houve acesso ou confirmacao confiavel.</div>
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
        <div className="field-guide"><strong>O que e:</strong> registrar a facilidade de acesso ao imovel.<br /><strong>Como avaliar:</strong> se depende de proprietario, inquilino ou autorizacao, marque a opcao restritiva.</div>
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
        <div className="field-guide"><strong>O que e:</strong> classificar a percepcao documental inicial.<br /><strong>Como avaliar:</strong> nao declare regularidade definitiva; use pendente, divergencia ou risco quando faltar conferencia.</div>
      </label>

      <br /><br />

      <label>Imovel quitado<br />
        <select value={paidOffStatus} onChange={(e) => setPaidOffStatus(e.target.value)}>
          <option value="yes">Sim</option>
          <option value="no">Nao</option>
          <option value="to_confirm">A confirmar</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> registrar se existe indicio de quitacao.<br /><strong>Como avaliar:</strong> marque sim apenas com informacao confiavel; se for fala sem comprovacao, use a confirmar.</div>
      </label>

      <br /><br />

      <label>Aceita financiamento<br />
        <select value={financingStatus} onChange={(e) => setFinancingStatus(e.target.value)}>
          <option value="yes">Sim</option>
          <option value="no">Nao</option>
          <option value="to_confirm">A confirmar</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> indicar viabilidade comercial de financiamento.<br /><strong>Como avaliar:</strong> se depender de documentacao, area, registro ou banco, use a confirmar.</div>
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
        <div className="field-guide"><strong>O que e:</strong> avaliar pendencias financeiras conhecidas.<br /><strong>Como avaliar:</strong> use risco relevante quando houver divida, financiamento, IPTU, condominio ou informacao conflitante.</div>
      </label>
      <hr />

      <h2 id="price-strategy">4. Estrategia de preco interna</h2>
      <a className="back-to-top no-print" href="#topo-documento">↑ Voltar ao topo</a>
      <p className="sensitive-note">Campos internos e sensiveis. Nao devem aparecer no anuncio publico nem em rotas abertas do marketplace.</p>
      <p className="analysis-note">Como avaliar: diferencie preco pedido, preco minimo aceitavel e preco recomendado. O minimo aceitavel e negociacao interna; o preco anunciado e estrategia publica.</p>

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
        <div className="field-guide"><strong>O que e:</strong> valor que o proprietario deseja receber ou anunciar.<br /><strong>Como avaliar:</strong> registre o valor declarado, sem misturar com preco recomendado pelo profissional.</div>
      </label>

      {shouldShowTypeModule('house') && (
        <>
      <hr />

      <h2 id="house-module">5. Modulo Casa V1</h2>
      <a className="back-to-top no-print" href="#topo-documento">↑ Voltar ao topo</a>
      <p>Campos especificos para casa de rua, casa em condominio, sobrado, casa terrea ou casa com area externa. Nesta fase salvam em metadata JSONB.</p>
      <p className="analysis-note">Como avaliar: observe condicao aparente, risco estrutural visivel, area externa, telhado, conservacao e compatibilidade com documentos. Nao trate percepcao visual como laudo tecnico.</p>

      <label>Subtipo da casa<br />
        <select value={houseSubtype} onChange={(e) => setHouseSubtype(e.target.value)}>
          <option value="street_house">Casa de rua</option>
          <option value="condominium_house">Casa em condominio</option>
          <option value="townhouse">Sobrado</option>
          <option value="single_story_house">Casa terrea</option>
          <option value="semi_detached_house">Casa geminada</option>
          <option value="isolated_house">Casa isolada no lote</option>
          <option value="house_with_annex">Casa com edicula/anexo</option>
          <option value="other">Outro</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> classificar o tipo de casa analisada.<br /><strong>Como avaliar:</strong> escolha pela realidade fisica e comercial: rua, condominio, sobrado, terrea, geminada ou anexo.</div>
      </label>

      <br /><br />

      <label>Contexto de condominio<br />
        <select value={hasCondominiumContext} onChange={(e) => setHasCondominiumContext(e.target.value)}>
          <option value="yes">Sim</option>
          <option value="no">Nao</option>
          <option value="not_verified">Nao verificado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> indicar se a casa faz parte de condominio.<br /><strong>Como avaliar:</strong> marque sim quando houver regras, taxa, portaria ou estrutura condominial.</div>
      </label>

      <br /><br />

      <label>Topografia aparente<br />
        <select value={houseTopography} onChange={(e) => setHouseTopography(e.target.value)}>
          <option value="flat">Plana</option>
          <option value="uphill">Aclive</option>
          <option value="downhill">Declive</option>
          <option value="irregular">Irregular</option>
          <option value="not_verified">Nao verificado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> registrar a inclinacao percebida do terreno.<br /><strong>Como avaliar:</strong> observe visualmente; se nao tiver certeza, use nao verificado. Nao substitui topografia tecnica.</div>
      </label>

      <br /><br />

      <label>Tipo de construcao aparente<br />
        <select value={constructionType} onChange={(e) => setConstructionType(e.target.value)}>
          <option value="masonry">Alvenaria</option>
          <option value="wood">Madeira</option>
          <option value="mixed">Mista</option>
          <option value="steel_frame">Steel frame</option>
          <option value="other">Outro</option>
          <option value="not_verified">Nao verificado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> identificar o sistema construtivo aparente.<br /><strong>Como avaliar:</strong> use o que for visivel ou informado com seguranca; caso contrario, marque nao verificado.</div>
      </label>

      <br /><br />

      <label>Pavimentos<br />
        <select value={houseFloors} onChange={(e) => setHouseFloors(e.target.value)}>
          <option value="one_floor">Um pavimento</option>
          <option value="two_floors">Dois pavimentos</option>
          <option value="three_or_more">Tres ou mais</option>
          <option value="not_verified">Nao verificado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> quantidade de andares da casa.<br /><strong>Como avaliar:</strong> conte pela estrutura real, nao apenas pela descricao do proprietario.</div>
      </label>

      <br /><br />

      <label>Conservacao geral<br />
        <select value={generalConservationStatus} onChange={(e) => setGeneralConservationStatus(e.target.value)}>
          <option value="excellent">Excelente</option>
          <option value="good">Boa</option>
          <option value="regular">Regular</option>
          <option value="poor">Ruim</option>
          <option value="critical">Critica</option>
          <option value="not_verified">Nao verificado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> estado geral percebido do imovel.<br /><strong>Como avaliar:</strong> avalie pintura, piso, portas, janelas, umidade, manutencao e necessidade de reparos.</div>
      </label>

      <br /><br />

      <label>Condicao aparente do telhado/cobertura<br />
        <select value={roofCondition} onChange={(e) => setRoofCondition(e.target.value)}>
          <option value="good">Boa</option>
          <option value="regular">Regular</option>
          <option value="needs_repair">Precisa de reparo</option>
          <option value="critical">Critica</option>
          <option value="not_verified">Nao verificado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> condicao aparente da cobertura.<br /><strong>Como avaliar:</strong> observe sinais de vazamento, telha quebrada, forro manchado ou necessidade de reparo.</div>
      </label>

      <br /><br />

      <label>Percepcao de risco estrutural aparente<br />
        <select value={structuralRiskPerception} onChange={(e) => setStructuralRiskPerception(e.target.value)}>
          <option value="low">Baixa</option>
          <option value="medium">Media</option>
          <option value="high">Alta</option>
          <option value="requires_specialist">Exige especialista</option>
          <option value="not_evaluated">Nao avaliado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> percepcao de problemas fisicos relevantes.<br /><strong>Como avaliar:</strong> se houver rachadura forte, desnível, infiltração severa ou duvida grave, marque alto ou exige especialista.</div>
      </label>

      <br /><br />

      <label>Area construida confere com documentos?<br />
        <select value={builtAreaMatchesDocuments} onChange={(e) => setBuiltAreaMatchesDocuments(e.target.value)}>
          <option value="yes">Sim</option>
          <option value="no">Nao</option>
          <option value="to_confirm">A confirmar</option>
          <option value="not_verified">Nao verificado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> comparar area declarada com documento.<br /><strong>Como avaliar:</strong> marque sim apenas quando confrontou com IPTU, matricula, projeto ou documento confiavel.</div>
      </label>

      <br /><br />

      <label>Construcao averbada/registrada?<br />
        <select value={constructionRegistered} onChange={(e) => setConstructionRegistered(e.target.value)}>
          <option value="yes">Sim</option>
          <option value="no">Nao</option>
          <option value="to_confirm">A confirmar</option>
          <option value="not_verified">Nao verificado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> indicar se a construcao aparece formalmente no documento.<br /><strong>Como avaliar:</strong> se nao conferiu matricula/IPTU, use a confirmar ou nao verificado.</div>
      </label>

      <br /><br />

      <label>Quintal/area externa<br />
        <select value={yardStatus} onChange={(e) => setYardStatus(e.target.value)}>
          <option value="none">Nao possui</option>
          <option value="small">Pequeno</option>
          <option value="medium">Medio</option>
          <option value="large">Grande</option>
          <option value="not_verified">Nao verificado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> avaliar existencia e tamanho da area externa.<br /><strong>Como avaliar:</strong> considere uso real, potencial de lazer, ampliacao, pets e valorizacao comercial.</div>
      </label>

      <br /><br />

      <label>Piscina<br />
        <select value={poolStatus} onChange={(e) => setPoolStatus(e.target.value)}>
          <option value="yes">Sim</option>
          <option value="no">Nao</option>
          <option value="not_verified">Nao verificado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> indicar se o imovel possui piscina.<br /><strong>Como avaliar:</strong> se existir, depois avalie condicao, manutencao e se deve aparecer no anuncio.</div>
      </label>

      <br /><br />

      <label>Area gourmet<br />
        <select value={gourmetAreaStatus} onChange={(e) => setGourmetAreaStatus(e.target.value)}>
          <option value="yes">Sim</option>
          <option value="no">Nao</option>
          <option value="partial">Parcial</option>
          <option value="not_verified">Nao verificado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> identificar estrutura de lazer/comercializacao.<br /><strong>Como avaliar:</strong> marque parcial quando houver apenas churrasqueira, bancada ou estrutura incompleta.</div>
      </label>

      <br /><br />

      <label>Garagem<br />
        <select value={houseParkingType} onChange={(e) => setHouseParkingType(e.target.value)}>
          <option value="covered">Coberta</option>
          <option value="uncovered">Descoberta</option>
          <option value="mixed">Mista</option>
          <option value="none">Nao possui</option>
          <option value="not_verified">Nao verificado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> classificar a vaga da casa.<br /><strong>Como avaliar:</strong> avalie se protege o veiculo, quantidade real de vagas e facilidade de acesso.</div>
      </label>

      <br /><br />

      <label>Atratividade comercial da casa<br />
        <select value={houseMarketAppeal} onChange={(e) => setHouseMarketAppeal(e.target.value)}>
          <option value="high">Alta</option>
          <option value="medium">Media</option>
          <option value="low">Baixa</option>
          <option value="depends_on_price">Depende do preco</option>
          <option value="not_evaluated">Nao avaliado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> potencial da casa gerar interesse real.<br /><strong>Como avaliar:</strong> considere preco, conservacao, localizacao, area externa, vaga, lazer e publico comprador.</div>
      </label>

      <br /><br />

      <label>Recomendacao especifica para casa<br />
        <select value={houseRecommendation} onChange={(e) => setHouseRecommendation(e.target.value)}>
          <option value="publish_as_is">Publicar como esta</option>
          <option value="review_price">Revisar preco</option>
          <option value="request_documents">Solicitar documentos</option>
          <option value="improve_photos">Melhorar fotos</option>
          <option value="request_repairs_before_publish">Sugerir reparos antes de publicar</option>
          <option value="require_specialist_assessment">Exigir avaliacao de especialista</option>
          <option value="not_recommend_publish_yet">Nao recomendar publicacao ainda</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> decisao profissional sobre a casa.<br /><strong>Como avaliar:</strong> oriente o proximo passo: publicar, revisar preco, pedir documento, melhorar foto, reparar ou pedir especialista.</div>
      </label>

      <br /><br />

      <label>Observacoes especificas da casa<br />
        <textarea value={houseNotes} onChange={(e) => setHouseNotes(e.target.value)} />
        <div className="field-guide"><strong>O que e:</strong> criterio de avaliacao da Análise Patrimonial.<br /><strong>Como avaliar:</strong> escolha com base em evidencia. Quando nao houver comprovacao, use a confirmar, pendente ou nao verificado.</div>
      </label>

        </>
      )}

      {shouldShowTypeModule('apartment') && (
        <>
      <hr />

      <h2 id="apartment-module">6. Modulo Apartamento / Studio / Loft / Kitnet V1</h2>
      <a className="back-to-top no-print" href="#topo-documento">↑ Voltar ao topo</a>
      <p>Campos especificos para unidade residencial em edificio ou condominio. Nesta fase salvam em metadata JSONB.</p>
      <p className="analysis-note">Como avaliar: considere unidade e condominio juntos. Andar, vaga, taxa condominial, vista, sol, ventilacao e regras de uso podem mudar liquidez e preco.</p>

      <label>Subtipo da unidade<br />
        <select value={apartmentSubtype} onChange={(e) => setApartmentSubtype(e.target.value)}>
          <option value="standard_apartment">Apartamento padrao</option>
          <option value="studio">Studio</option>
          <option value="loft">Loft</option>
          <option value="kitnet">Kitnet</option>
          <option value="penthouse">Cobertura</option>
          <option value="garden">Garden</option>
          <option value="duplex">Duplex</option>
          <option value="flat">Flat</option>
          <option value="serviced_apartment">Apartamento com servicos</option>
          <option value="other">Outro</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> classificar o tipo de apartamento/unidade.<br /><strong>Como avaliar:</strong> diferencie apartamento padrao, studio, loft, kitnet, cobertura, garden, duplex ou flat.</div>
      </label>

      <br /><br />

      <label>Andar da unidade<br />
        <input value={apartmentFloor} onChange={(e) => setApartmentFloor(e.target.value)} />
      </label>

      <br /><br />

      <label>Area privativa<br />
        <input value={privateArea} onChange={(e) => setPrivateArea(e.target.value)} />
      </label>

      <br /><br />

      <label>Tipo de vaga<br />
        <select value={apartmentParkingType} onChange={(e) => setApartmentParkingType(e.target.value)}>
          <option value="covered">Coberta</option>
          <option value="uncovered">Descoberta</option>
          <option value="rotating">Rotativa</option>
          <option value="deeded">Vinculada/documentada</option>
          <option value="assigned">Atribuida pelo condominio</option>
          <option value="not_available">Nao possui</option>
          <option value="not_verified">Nao verificado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> andar onde fica o imovel.<br /><strong>Como avaliar:</strong> confirme com o edificio/anuncio; andar influencia vista, ruido, sol, liquidez e preco.</div>
      </label>

      <br /><br />

      <label>Conservacao geral da unidade<br />
        <select value={unitConservationStatus} onChange={(e) => setUnitConservationStatus(e.target.value)}>
          <option value="excellent">Excelente</option>
          <option value="good">Boa</option>
          <option value="regular">Regular</option>
          <option value="poor">Ruim</option>
          <option value="critical">Critica</option>
          <option value="not_verified">Nao verificado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> estado geral percebido do imovel.<br /><strong>Como avaliar:</strong> avalie pintura, piso, portas, janelas, umidade, manutencao e necessidade de reparos.</div>
      </label>

      <br /><br />

      <label>Posicao solar<br />
        <select value={sunPosition} onChange={(e) => setSunPosition(e.target.value)}>
          <option value="morning_sun">Sol da manha</option>
          <option value="afternoon_sun">Sol da tarde</option>
          <option value="no_direct_sun">Sem sol direto</option>
          <option value="not_verified">Nao verificado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> incidencia predominante de sol.<br /><strong>Como avaliar:</strong> sol da manha costuma ser mais valorizado; se nao conferiu horario/orientacao, use nao verificado.</div>
      </label>

      <br /><br />

      <label>Tipo de vista<br />
        <select value={viewType} onChange={(e) => setViewType(e.target.value)}>
          <option value="open_view">Vista livre</option>
          <option value="internal_view">Vista interna</option>
          <option value="street_view">Vista para rua</option>
          <option value="blocked_view">Vista bloqueada</option>
          <option value="premium_view">Vista premium</option>
          <option value="not_verified">Nao verificado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> qualidade da vista da unidade.<br /><strong>Como avaliar:</strong> vista livre/premium agrega valor; vista bloqueada pode reduzir atratividade.</div>
      </label>

      <br /><br />

      <label>Ventilacao<br />
        <select value={ventilationQuality} onChange={(e) => setVentilationQuality(e.target.value)}>
          <option value="excellent">Excelente</option>
          <option value="good">Boa</option>
          <option value="regular">Regular</option>
          <option value="poor">Ruim</option>
          <option value="not_evaluated">Nao avaliado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> qualidade de circulacao de ar.<br /><strong>Como avaliar:</strong> avalie janelas, ventilacao cruzada, abafamento e conforto percebido.</div>
      </label>

      <br /><br />

      <label>Luz natural<br />
        <select value={naturalLightQuality} onChange={(e) => setNaturalLightQuality(e.target.value)}>
          <option value="excellent">Excelente</option>
          <option value="good">Boa</option>
          <option value="regular">Regular</option>
          <option value="poor">Ruim</option>
          <option value="not_evaluated">Nao avaliado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> entrada de luz durante o dia.<br /><strong>Como avaliar:</strong> avalie se a unidade e clara, escura, bloqueada por predios ou dependente de luz artificial.</div>
      </label>

      <br /><br />

      <label>Status da taxa condominial<br />
        <select value={condoFeeStatus} onChange={(e) => setCondoFeeStatus(e.target.value)}>
          <option value="informed">Informada</option>
          <option value="not_informed">Nao informada</option>
          <option value="to_confirm">A confirmar</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> situacao da informacao sobre condominio.<br /><strong>Como avaliar:</strong> se o valor nao foi confirmado em boleto, ata ou administradora, use a confirmar.</div>
      </label>

      <br /><br />

      <label>Risco condominial<br />
        <select value={condominiumRisk} onChange={(e) => setCondominiumRisk(e.target.value)}>
          <option value="low">Baixo</option>
          <option value="medium">Medio</option>
          <option value="high">Alto</option>
          <option value="not_evaluated">Nao avaliado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> possivel impacto negativo do condominio.<br /><strong>Como avaliar:</strong> considere taxa alta, restricoes, dividas, manutencao ruim, obras ou regras que afetem liquidez.</div>
      </label>

      <br /><br />

      <label>Locacao curta/Airbnb permitida?<br />
        <select value={shortTermRentalAllowed} onChange={(e) => setShortTermRentalAllowed(e.target.value)}>
          <option value="yes">Sim</option>
          <option value="no">Nao</option>
          <option value="to_confirm">A confirmar</option>
          <option value="not_verified">Nao verificado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> possibilidade de uso para temporada.<br /><strong>Como avaliar:</strong> marque sim somente se permitido pelas regras do condominio e legislação aplicável; se nao sabe, use a confirmar.</div>
      </label>

      <br /><br />

      <label>Status documental da unidade<br />
        <select value={unitRegistrationStatus} onChange={(e) => setUnitRegistrationStatus(e.target.value)}>
          <option value="apparently_regular">Regular aparente</option>
          <option value="pending_review">Pendente de conferencia</option>
          <option value="discrepancy_found">Divergencia identificada</option>
          <option value="relevant_risk">Risco relevante</option>
          <option value="not_verified">Nao verificado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> percepcao inicial da documentacao.<br /><strong>Como avaliar:</strong> registre risco ou pendencia quando faltar matricula, vaga documentada, IPTU ou regras condominiais.</div>
      </label>

      <br /><br />

      <label>Atratividade comercial da unidade<br />
        <select value={apartmentMarketAppeal} onChange={(e) => setApartmentMarketAppeal(e.target.value)}>
          <option value="high">Alta</option>
          <option value="medium">Media</option>
          <option value="low">Baixa</option>
          <option value="depends_on_price">Depende do preco</option>
          <option value="not_evaluated">Nao avaliado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> potencial de interesse do apartamento.<br /><strong>Como avaliar:</strong> considere localizacao, condominio, vista, sol, vaga, taxa, conservacao e preco.</div>
      </label>

      <br /><br />

      <label>Recomendacao especifica para unidade<br />
        <select value={apartmentRecommendation} onChange={(e) => setApartmentRecommendation(e.target.value)}>
          <option value="publish_as_is">Publicar como esta</option>
          <option value="review_price">Revisar preco</option>
          <option value="request_documents">Solicitar documentos</option>
          <option value="improve_photos">Melhorar fotos</option>
          <option value="validate_condominium_fee">Validar taxa condominial</option>
          <option value="validate_parking_documentation">Validar documentacao da vaga</option>
          <option value="validate_financing">Validar financiamento</option>
          <option value="review_airbnb_viability">Revisar viabilidade Airbnb</option>
          <option value="not_recommend_publish_yet">Nao recomendar publicacao ainda</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> decisao profissional sobre apartamento/studio.<br /><strong>Como avaliar:</strong> direcione se deve publicar, revisar preco, validar condominio, vaga, financiamento ou Airbnb.</div>
      </label>

      <br /><br />

      <label>Observacoes especificas da unidade<br />
        <textarea value={apartmentNotes} onChange={(e) => setApartmentNotes(e.target.value)} />
        <div className="field-guide"><strong>O que e:</strong> criterio de avaliacao da Análise Patrimonial.<br /><strong>Como avaliar:</strong> escolha com base em evidencia. Quando nao houver comprovacao, use a confirmar, pendente ou nao verificado.</div>
      </label>

        </>
      )}

      {shouldShowTypeModule('land') && (
        <>
      <hr />

      <h2 id="land-module">7. Modulo Terreno / Lote V1</h2>
      <a className="back-to-top no-print" href="#topo-documento">↑ Voltar ao topo</a>
      <p>Campos especificos para lote, terreno urbano, terreno em condominio, area comercial ou area com potencial construtivo. Nesta fase salvam em metadata JSONB.</p>
      <p className="analysis-note">Como avaliar: terreno depende de medida, frente, infraestrutura, acesso, topografia, zoneamento e documento. Se nao houver fonte oficial, marque como "a confirmar" ou "nao verificado".</p>

      <label>Subtipo do terreno<br />
        <select value={landSubtype} onChange={(e) => setLandSubtype(e.target.value)}>
          <option value="public_street_lot">Terreno em rua publica</option>
          <option value="gated_lot">Lote em condominio fechado</option>
          <option value="open_subdivision_lot">Loteamento aberto</option>
          <option value="urban_land">Terreno urbano</option>
          <option value="commercial_land">Terreno comercial</option>
          <option value="mixed_use_land">Terreno misto</option>
          <option value="industrial_land">Terreno industrial</option>
          <option value="incorporation_potential_area">Area com potencial de incorporacao</option>
          <option value="other">Outro</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> classificacao comercial do lote.<br /><strong>Como avaliar:</strong> escolha o tipo mais proximo do uso real: rua publica, condominio, comercial, misto, industrial ou incorporacao.</div>
      </label>

      <br /><br />

      <label>Area total<br />
        <input value={landTotalArea} onChange={(e) => setLandTotalArea(e.target.value)} />
        <small>Informe a area principal do terreno. Se nao tiver documento, trate como informacao a confirmar.</small>
      </label>

      <br /><br />

      <label>Medida de frente<br />
        <input value={frontMeasure} onChange={(e) => setFrontMeasure(e.target.value)} />
        <small>A frente costuma impactar liquidez, uso comercial e potencial construtivo.</small>
      </label>

      <br /><br />

      <label>Topografia aparente<br />
        <select value={landTopography} onChange={(e) => setLandTopography(e.target.value)}>
          <option value="flat">Plana</option>
          <option value="uphill">Aclive</option>
          <option value="downhill">Declive</option>
          <option value="irregular">Irregular</option>
          <option value="mixed">Mista</option>
          <option value="not_verified">Nao verificado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> registrar a inclinacao percebida do terreno.<br /><strong>Como avaliar:</strong> observe visualmente; se nao tiver certeza, use nao verificado. Nao substitui topografia tecnica.</div>
      </label>

      <br /><br />

      <label>Zoneamento informado<br />
        <select value={zoningInformed} onChange={(e) => setZoningInformed(e.target.value)}>
          <option value="residential">Residencial</option>
          <option value="commercial">Comercial</option>
          <option value="mixed">Misto</option>
          <option value="industrial">Industrial</option>
          <option value="rural_transition">Transicao rural</option>
          <option value="special_zone">Zona especial</option>
          <option value="not_informed">Nao informado</option>
          <option value="not_verified">Nao verificado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> uso permitido ou informado para a area.<br /><strong>Como avaliar:</strong> sem fonte oficial, marque nao verificado; zoneamento impacta preço, uso e risco.</div>
      </label>

      <br /><br />

      <label>Tipo de rua<br />
        <select value={streetType} onChange={(e) => setStreetType(e.target.value)}>
          <option value="asphalt">Asfalto</option>
          <option value="paving_stone">Paver/paralelepipedo</option>
          <option value="dirt_road">Terra</option>
          <option value="mixed">Mista</option>
          <option value="not_verified">Nao verificado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> infraestrutura da via de acesso.<br /><strong>Como avaliar:</strong> observe pavimentacao, acesso em chuva, largura, movimento e facilidade de chegada.</div>
      </label>

      <br /><br />

      <label>Rede de agua<br />
        <select value={waterNetwork} onChange={(e) => setWaterNetwork(e.target.value)}>
          <option value="yes">Sim</option>
          <option value="no">Nao</option>
          <option value="to_confirm">A confirmar</option>
          <option value="not_verified">Nao verificado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> existencia de abastecimento de agua.<br /><strong>Como avaliar:</strong> se nao houver comprovacao ou ligacao visivel, use a confirmar ou nao verificado.</div>
      </label>

      <br /><br />

      <label>Rede de energia<br />
        <select value={electricityNetwork} onChange={(e) => setElectricityNetwork(e.target.value)}>
          <option value="yes">Sim</option>
          <option value="no">Nao</option>
          <option value="to_confirm">A confirmar</option>
          <option value="not_verified">Nao verificado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> existencia de energia disponivel.<br /><strong>Como avaliar:</strong> confirme padrao, poste, ligacao ou informacao confiavel; impacta viabilidade imediata.</div>
      </label>

      <br /><br />

      <label>Rede de esgoto<br />
        <select value={sewageNetwork} onChange={(e) => setSewageNetwork(e.target.value)}>
          <option value="yes">Sim</option>
          <option value="no">Nao</option>
          <option value="to_confirm">A confirmar</option>
          <option value="not_verified">Nao verificado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> existencia de esgoto publico ou solucao equivalente.<br /><strong>Como avaliar:</strong> se houver fossa/sistema proprio, registre em observacao.</div>
      </label>

      <br /><br />

      <label>Area confere com documento?<br />
        <select value={areaMatchesDocument} onChange={(e) => setAreaMatchesDocument(e.target.value)}>
          <option value="yes">Sim</option>
          <option value="no">Nao</option>
          <option value="to_confirm">A confirmar</option>
          <option value="not_verified">Nao verificado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> comparacao da area real/declarada com documento.<br /><strong>Como avaliar:</strong> marque sim apenas quando conferiu documento; divergencia deve gerar alerta.</div>
      </label>

      <br /><br />

      <label>Potencial construtivo<br />
        <select value={constructionPotential} onChange={(e) => setConstructionPotential(e.target.value)}>
          <option value="high">Alto</option>
          <option value="medium">Medio</option>
          <option value="low">Baixo</option>
          <option value="restricted">Restrito</option>
          <option value="not_evaluated">Nao avaliado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> capacidade comercial de construir ou desenvolver.<br /><strong>Como avaliar:</strong> considere frente, area, topografia, zoneamento, acesso e infraestrutura.</div>
      </label>

      <br /><br />

      <label>Liquidez do terreno<br />
        <select value={landLiquidityProfile} onChange={(e) => setLandLiquidityProfile(e.target.value)}>
          <option value="high">Alta</option>
          <option value="medium">Media</option>
          <option value="low">Baixa</option>
          <option value="depends_on_price">Depende do preco</option>
          <option value="not_evaluated">Nao avaliado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> facilidade estimada de vender ou negociar.<br /><strong>Como avaliar:</strong> alta liquidez exige procura provável, preço coerente, boa localização e baixo risco.</div>
      </label>

      <br /><br />

      <label>Recomendacao especifica para terreno<br />
        <select value={landRecommendation} onChange={(e) => setLandRecommendation(e.target.value)}>
          <option value="publish_as_is">Publicar como esta</option>
          <option value="review_price">Revisar preco</option>
          <option value="request_documents">Solicitar documentos</option>
          <option value="validate_area">Validar area</option>
          <option value="validate_zoning">Validar zoneamento</option>
          <option value="validate_infrastructure">Validar infraestrutura</option>
          <option value="request_cleaning_before_photos">Solicitar limpeza antes das fotos</option>
          <option value="require_specialist_assessment">Exigir avaliacao de especialista</option>
          <option value="not_recommend_publish_yet">Nao recomendar publicacao ainda</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> decisao profissional sobre o lote.<br /><strong>Como avaliar:</strong> oriente se deve publicar, validar area, conferir zoneamento, limpar, revisar preco ou pedir especialista.</div>
      </label>

      <br /><br />

      <label>Observacoes especificas do terreno<br />
        <textarea value={landNotes} onChange={(e) => setLandNotes(e.target.value)} />
        <div className="field-guide"><strong>O que e:</strong> criterio de avaliacao da Análise Patrimonial.<br /><strong>Como avaliar:</strong> escolha com base em evidencia. Quando nao houver comprovacao, use a confirmar, pendente ou nao verificado.</div>
      </label>

        </>
      )}

      {shouldShowTypeModule('commercial') && (
        <>
      <hr />

            <h2 id="commercial-module">8. Modulo Comercial V1</h2>
      <a className="back-to-top no-print" href="#topo-documento">↑ Voltar ao topo</a>
      <p>Campos especificos para sala, loja, galpao, ponto comercial, predio comercial ou espaco logistico. Nesta fase salvam em metadata JSONB.</p>
      <p className="analysis-note">Como avaliar: comercial depende de uso permitido, visibilidade, fluxo, estacionamento, energia, acessibilidade, AVCB, documentacao e adequacao da atividade.</p>

      <label>Subtipo comercial<br />
        <select value={commercialSubtype} onChange={(e) => setCommercialSubtype(e.target.value)}>
          <option value="office_room">Sala comercial</option>
          <option value="commercial_store">Loja</option>
          <option value="warehouse">Galpao</option>
          <option value="industrial_shed">Barracao industrial</option>
          <option value="commercial_point">Ponto comercial</option>
          <option value="commercial_set">Conjunto comercial</option>
          <option value="commercial_building">Predio comercial</option>
          <option value="mixed_use_property">Imovel misto</option>
          <option value="logistics_space">Espaco logistico</option>
          <option value="other">Outro</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> classificacao operacional do imovel comercial.<br /><strong>Como avaliar:</strong> escolha pelo uso real ou pelo uso comercial mais forte do imovel.</div>
      </label>

      <br /><br />

      <label>Uso atual<br />
        <select value={commercialCurrentUse} onChange={(e) => setCommercialCurrentUse(e.target.value)}>
          <option value="vacant">Vazio</option>
          <option value="office">Escritorio</option>
          <option value="retail">Varejo</option>
          <option value="food_service">Alimentacao</option>
          <option value="storage">Armazenagem</option>
          <option value="industry">Industria</option>
          <option value="logistics">Logistica</option>
          <option value="mixed_use">Uso misto</option>
          <option value="residential_adapted">Residencial adaptado</option>
          <option value="not_verified">Nao verificado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> atividade que o imovel exerce hoje.<br /><strong>Como avaliar:</strong> observe uso real no local; se for apenas informacao verbal, marque nao verificado.</div>
      </label>

      <br /><br />

      <label>Melhor uso pretendido<br />
        <select value={commercialBestUse} onChange={(e) => setCommercialBestUse(e.target.value)}>
          <option value="office">Escritorio</option>
          <option value="retail">Varejo</option>
          <option value="restaurant_or_food">Restaurante/alimentacao</option>
          <option value="clinic_or_health">Clinica/saude</option>
          <option value="school_or_course">Escola/curso</option>
          <option value="logistics">Logistica</option>
          <option value="storage">Armazenagem</option>
          <option value="light_industry">Industria leve</option>
          <option value="showroom">Showroom</option>
          <option value="mixed_use">Uso misto</option>
          <option value="investment_hold">Investimento</option>
          <option value="not_evaluated">Nao avaliado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> uso comercial mais indicado pela leitura profissional.<br /><strong>Como avaliar:</strong> considere localizacao, fluxo, estrutura, restricoes, estacionamento e infraestrutura.</div>
      </label>

      <br /><br />

      <label>Pe-direito<br />
        <select value={ceilingHeightCategory} onChange={(e) => setCeilingHeightCategory(e.target.value)}>
          <option value="low">Baixo</option>
          <option value="regular">Regular</option>
          <option value="high">Alto</option>
          <option value="industrial">Industrial</option>
          <option value="not_verified">Nao verificado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> altura util interna percebida.<br /><strong>Como avaliar:</strong> pe-direito maior favorece galpao, showroom, estoque e atividades operacionais.</div>
      </label>

      <br /><br />

      <label>Fachada para rua<br />
        <select value={streetFrontage} onChange={(e) => setStreetFrontage(e.target.value)}>
          <option value="yes">Sim</option>
          <option value="no">Nao</option>
          <option value="internal">Interna</option>
          <option value="not_verified">Nao verificado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> se o imovel tem exposicao direta para a rua.<br /><strong>Como avaliar:</strong> fachada visivel aumenta potencial para varejo, servicos e captacao espontanea.</div>
      </label>

      <br /><br />

      <label>Visibilidade da rua<br />
        <select value={visibilityFromStreet} onChange={(e) => setVisibilityFromStreet(e.target.value)}>
          <option value="high">Alta</option>
          <option value="medium">Media</option>
          <option value="low">Baixa</option>
          <option value="not_evaluated">Nao avaliado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> facilidade de o publico enxergar o imovel.<br /><strong>Como avaliar:</strong> observe fluxo, placa, vitrine, recuo, esquina, obstaculos e concorrencia visual.</div>
      </label>

      <br /><br />

      <label>Estacionamento disponivel<br />
        <select value={commercialParkingAvailable} onChange={(e) => setCommercialParkingAvailable(e.target.value)}>
          <option value="yes">Sim</option>
          <option value="no">Nao</option>
          <option value="nearby">Proximo</option>
          <option value="limited">Limitado</option>
          <option value="not_verified">Nao verificado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> disponibilidade de vagas para clientes, equipe ou operacao.<br /><strong>Como avaliar:</strong> estacionamento limitado pode reduzir viabilidade para clinica, loja, restaurante e servicos.</div>
      </label>

      <br /><br />

      <label>Energia trifasica disponivel<br />
        <select value={threePhasePowerAvailable} onChange={(e) => setThreePhasePowerAvailable(e.target.value)}>
          <option value="yes">Sim</option>
          <option value="no">Nao</option>
          <option value="to_confirm">A confirmar</option>
          <option value="not_verified">Nao verificado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> infraestrutura eletrica para maior carga.<br /><strong>Como avaliar:</strong> importante para industria leve, equipamentos, cozinha, galpao e operacao mais pesada.</div>
      </label>

      <br /><br />

      <label>AVCB informado<br />
        <select value={avcbStatusInformed} onChange={(e) => setAvcbStatusInformed(e.target.value)}>
          <option value="valid">Valido</option>
          <option value="expired">Vencido</option>
          <option value="not_available">Nao disponivel</option>
          <option value="to_confirm">A confirmar</option>
          <option value="not_verified">Nao verificado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> informacao sobre seguranca contra incendio.<br /><strong>Como avaliar:</strong> nao declare regularidade; registre apenas o que foi apresentado ou informado.</div>
      </label>

      <br /><br />

      <label>Acessibilidade aparente<br />
        <select value={accessibilityApparent} onChange={(e) => setAccessibilityApparent(e.target.value)}>
          <option value="good">Boa</option>
          <option value="partial">Parcial</option>
          <option value="poor">Ruim</option>
          <option value="not_verified">Nao verificado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> facilidade de acesso para clientes e usuarios com mobilidade reduzida.<br /><strong>Como avaliar:</strong> observe degraus, rampas, largura de portas, banheiro adaptado e acesso da rua.</div>
      </label>

      <br /><br />

      <label>Perfil da regiao comercial<br />
        <select value={businessRegionProfile} onChange={(e) => setBusinessRegionProfile(e.target.value)}>
          <option value="central">Central</option>
          <option value="neighborhood_commercial">Comercial de bairro</option>
          <option value="high_flow_avenue">Avenida de alto fluxo</option>
          <option value="industrial_area">Area industrial</option>
          <option value="logistics_area">Area logistica</option>
          <option value="mixed_region">Regiao mista</option>
          <option value="residential_region">Regiao residencial</option>
          <option value="not_evaluated">Nao avaliado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> contexto comercial do entorno.<br /><strong>Como avaliar:</strong> identifique se a regiao favorece fluxo, servico, logistica, industria ou atendimento local.</div>
      </label>

      <br /><br />

      <label>Atratividade comercial do imovel<br />
        <select value={commercialMarketAppeal} onChange={(e) => setCommercialMarketAppeal(e.target.value)}>
          <option value="high">Alta</option>
          <option value="medium">Media</option>
          <option value="low">Baixa</option>
          <option value="depends_on_price">Depende do preco</option>
          <option value="not_evaluated">Nao avaliado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> potencial do imovel gerar interesse para uso comercial.<br /><strong>Como avaliar:</strong> pese visibilidade, fluxo, infraestrutura, estacionamento, risco e preco.</div>
      </label>

      <br /><br />

      <label>Recomendacao especifica para comercial<br />
        <select value={commercialRecommendation} onChange={(e) => setCommercialRecommendation(e.target.value)}>
          <option value="publish_as_is">Publicar como esta</option>
          <option value="review_price">Revisar preco</option>
          <option value="request_documents">Solicitar documentos</option>
          <option value="validate_zoning">Validar zoneamento</option>
          <option value="validate_avcb">Validar AVCB</option>
          <option value="validate_activity_restriction">Validar restricao de atividade</option>
          <option value="improve_photos">Melhorar fotos</option>
          <option value="review_target_audience">Revisar publico-alvo</option>
          <option value="not_recommend_publish_yet">Nao recomendar publicacao ainda</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> proxima decisao profissional para o imovel comercial.<br /><strong>Como avaliar:</strong> escolha a acao que reduz risco ou aumenta chance de locacao/venda.</div>
      </label>

      <br /><br />

      <label>Observacoes especificas do comercial<br />
        <textarea value={commercialNotes} onChange={(e) => setCommercialNotes(e.target.value)} />
        <div className="field-guide"><strong>O que e:</strong> observacoes livres sobre uso, risco, adaptacao ou oportunidade comercial.<br /><strong>Como avaliar:</strong> registre pontos que nao cabem nos campos estruturados.</div>
      </label>

        </>
      )}

      {shouldShowTypeModule('rural') && (
        <>
      <hr />

            <h2 id="rural-module">9. Modulo Rural V1</h2>
      <a className="back-to-top no-print" href="#topo-documento">↑ Voltar ao topo</a>
      <p>Campos especificos para chacara, sitio, fazenda, area rural, imovel produtivo, lazer rural ou investimento rural. Nesta fase salvam em metadata JSONB.</p>
      <p className="analysis-note">Como avaliar: rural depende de area, acesso, agua, energia, benfeitorias, documentacao rural, risco ambiental, divisas e potencial produtivo/comercial.</p>

      <label>Subtipo rural<br />
        <select value={ruralSubtype} onChange={(e) => setRuralSubtype(e.target.value)}>
          <option value="small_farm">Chacara</option>
          <option value="country_house">Sitio</option>
          <option value="farm">Fazenda</option>
          <option value="rural_land">Area rural</option>
          <option value="leisure_area">Area de lazer rural</option>
          <option value="productive_farm">Imovel rural produtivo</option>
          <option value="rural_residence">Moradia rural</option>
          <option value="rural_investment_area">Area rural para investimento</option>
          <option value="rural_area_with_improvements">Area rural com benfeitorias</option>
          <option value="rural_area_without_improvements">Area rural sem benfeitorias</option>
          <option value="other">Outro</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> classificacao principal do imovel rural.<br /><strong>Como avaliar:</strong> escolha pelo uso dominante: lazer, moradia, producao, investimento ou area sem estrutura.</div>
      </label>

      <br /><br />

      <label>Area total rural<br />
        <input value={ruralTotalArea} onChange={(e) => setRuralTotalArea(e.target.value)} />
        <div className="field-guide"><strong>O que e:</strong> medida principal da area rural.<br /><strong>Como avaliar:</strong> use documento, georreferenciamento ou informacao confiavel. Se for verbal, trate como a confirmar.</div>
      </label>

      <br /><br />

      <label>Unidade de medida<br />
        <select value={ruralAreaUnit} onChange={(e) => setRuralAreaUnit(e.target.value)}>
          <option value="square_meter">m²</option>
          <option value="hectare">Hectare</option>
          <option value="alqueire">Alqueire</option>
          <option value="acre">Acre</option>
          <option value="not_verified">Nao verificado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> unidade usada para medir a area rural.<br /><strong>Como avaliar:</strong> confira se a unidade bate com o documento e com a pratica local.</div>
      </label>

      <br /><br />

      <label>Area confere com documento?<br />
        <select value={ruralAreaMatchesDocument} onChange={(e) => setRuralAreaMatchesDocument(e.target.value)}>
          <option value="yes">Sim</option>
          <option value="no">Nao</option>
          <option value="to_confirm">A confirmar</option>
          <option value="not_verified">Nao verificado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> comparacao entre area informada e documento rural.<br /><strong>Como avaliar:</strong> marque sim apenas se conferiu documento, matricula, CAR, CCIR, ITR ou georreferenciamento.</div>
      </label>

      <br /><br />

      <label>Qualidade do acesso<br />
        <select value={ruralAccessQuality} onChange={(e) => setRuralAccessQuality(e.target.value)}>
          <option value="excellent">Excelente</option>
          <option value="good">Boa</option>
          <option value="regular">Regular</option>
          <option value="difficult">Dificil</option>
          <option value="seasonal_difficulty">Dificil em epoca de chuva</option>
          <option value="not_evaluated">Nao avaliado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> facilidade de chegar ao imovel.<br /><strong>Como avaliar:</strong> considere estrada, distancia, chuva, veiculo necessario e acesso para comprador, visitante ou operacao rural.</div>
      </label>

      <br /><br />

      <label>Risco de acesso em periodo de chuva<br />
        <select value={rainySeasonAccessRisk} onChange={(e) => setRainySeasonAccessRisk(e.target.value)}>
          <option value="low">Baixo</option>
          <option value="medium">Medio</option>
          <option value="high">Alto</option>
          <option value="not_evaluated">Nao avaliado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> chance de o acesso piorar ou impedir chegada na chuva.<br /><strong>Como avaliar:</strong> observe estrada de terra, pontes, atoleiros, aclives, relatos locais e distancia de via principal.</div>
      </label>

      <br /><br />

      <label>Energia disponivel<br />
        <select value={electricityAvailable} onChange={(e) => setElectricityAvailable(e.target.value)}>
          <option value="yes">Sim</option>
          <option value="no">Nao</option>
          <option value="partial">Parcial</option>
          <option value="not_verified">Nao verificado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> existencia de energia no imovel rural.<br /><strong>Como avaliar:</strong> confirme rede publica, solar, gerador ou infraestrutura parcial. Se nao comprovou, use nao verificado.</div>
      </label>

      <br /><br />

      <label>Disponibilidade de agua<br />
        <select value={waterAvailability} onChange={(e) => setWaterAvailability(e.target.value)}>
          <option value="abundant">Abundante</option>
          <option value="sufficient">Suficiente</option>
          <option value="limited">Limitada</option>
          <option value="seasonal">Sazonal</option>
          <option value="not_verified">Nao verificado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> condicao geral de agua para uso rural.<br /><strong>Como avaliar:</strong> considere poco, rio, corrego, nascente, lago, abastecimento e se seca em alguma epoca.</div>
      </label>

      <br /><br />

      <label>Condicao das benfeitorias<br />
        <select value={improvementsCondition} onChange={(e) => setImprovementsCondition(e.target.value)}>
          <option value="excellent">Excelente</option>
          <option value="good">Boa</option>
          <option value="regular">Regular</option>
          <option value="poor">Ruim</option>
          <option value="critical">Critica</option>
          <option value="not_verified">Nao verificado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> estado de casa sede, cercas, currais, galpoes, poco, piscina, pomar ou estruturas rurais.<br /><strong>Como avaliar:</strong> observe utilidade real, manutencao, risco, custo de reparo e impacto no valor.</div>
      </label>

      <br /><br />

      <label>Uso rural atual<br />
        <select value={currentRuralUse} onChange={(e) => setCurrentRuralUse(e.target.value)}>
          <option value="leisure">Lazer</option>
          <option value="residence">Moradia</option>
          <option value="cattle">Pecuaria</option>
          <option value="agriculture">Agricultura</option>
          <option value="mixed_production">Producao mista</option>
          <option value="unused">Sem uso</option>
          <option value="rental_income">Renda/arrendamento</option>
          <option value="tourism">Turismo rural</option>
          <option value="not_verified">Nao verificado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> como a propriedade e usada hoje.<br /><strong>Como avaliar:</strong> diferencie uso real de potencial futuro. Se nao houver atividade confirmada, marque nao verificado ou sem uso.</div>
      </label>

      <br /><br />

      <label>Potencial produtivo<br />
        <select value={productivePotential} onChange={(e) => setProductivePotential(e.target.value)}>
          <option value="high">Alto</option>
          <option value="medium">Medio</option>
          <option value="low">Baixo</option>
          <option value="not_evaluated">Nao avaliado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> capacidade percebida de gerar producao ou renda rural.<br /><strong>Como avaliar:</strong> considere solo aparente, agua, acesso, estrutura, pasto, plantio, benfeitorias e vocacao da regiao.</div>
      </label>

      <br /><br />

      <label>Risco ambiental<br />
        <select value={environmentalRisk} onChange={(e) => setEnvironmentalRisk(e.target.value)}>
          <option value="low">Baixo</option>
          <option value="medium">Medio</option>
          <option value="high">Alto</option>
          <option value="not_evaluated">Nao avaliado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> risco relacionado a APP, reserva, vegetacao, agua, restricao ou passivo ambiental.<br /><strong>Como avaliar:</strong> nao declare regularidade; marque risco quando houver duvida, vegetacao sensivel, curso d'agua ou falta de CAR/documento.</div>
      </label>

      <br /><br />

      <label>Status documental rural<br />
        <select value={ruralDocumentationStatus} onChange={(e) => setRuralDocumentationStatus(e.target.value)}>
          <option value="apparently_regular">Regular aparente</option>
          <option value="pending_review">Pendente de conferencia</option>
          <option value="discrepancy_found">Divergencia identificada</option>
          <option value="relevant_risk">Risco relevante</option>
          <option value="not_verified">Nao verificado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> leitura inicial da documentacao rural.<br /><strong>Como avaliar:</strong> confira matricula, CCIR, ITR, CAR, georreferenciamento e contratos. Sem documento, use pendente ou nao verificado.</div>
      </label>

      <br /><br />

      <label>Georreferenciamento<br />
        <select value={georeferencingStatus} onChange={(e) => setGeoreferencingStatus(e.target.value)}>
          <option value="done">Feito</option>
          <option value="not_done">Nao feito</option>
          <option value="to_confirm">A confirmar</option>
          <option value="not_required_informed">Informado como nao obrigatorio</option>
          <option value="not_verified">Nao verificado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> situacao do georreferenciamento da area.<br /><strong>Como avaliar:</strong> marque feito apenas com informacao/documento confiavel. Na duvida, use a confirmar ou nao verificado.</div>
      </label>

      <br /><br />

      <label>Atratividade comercial rural<br />
        <select value={ruralMarketAppeal} onChange={(e) => setRuralMarketAppeal(e.target.value)}>
          <option value="high">Alta</option>
          <option value="medium">Media</option>
          <option value="low">Baixa</option>
          <option value="depends_on_price">Depende do preco</option>
          <option value="not_evaluated">Nao avaliado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> potencial de interesse do mercado pelo imovel rural.<br /><strong>Como avaliar:</strong> pese acesso, agua, distancia, benfeitorias, documentacao, uso produtivo, lazer e preco.</div>
      </label>

      <br /><br />

      <label>Recomendacao especifica para rural<br />
        <select value={ruralRecommendation} onChange={(e) => setRuralRecommendation(e.target.value)}>
          <option value="publish_as_is">Publicar como esta</option>
          <option value="review_price">Revisar preco</option>
          <option value="request_documents">Solicitar documentos</option>
          <option value="validate_area">Validar area</option>
          <option value="validate_access">Validar acesso</option>
          <option value="validate_water_sources">Validar agua</option>
          <option value="validate_environmental_status">Validar situacao ambiental</option>
          <option value="improve_photos">Melhorar fotos</option>
          <option value="require_specialist_assessment">Exigir avaliacao de especialista</option>
          <option value="not_recommend_publish_yet">Nao recomendar publicacao ainda</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> proxima decisao profissional para o imovel rural.<br /><strong>Como avaliar:</strong> priorize documentos, area, acesso, agua e risco ambiental antes de publicar com seguranca.</div>
      </label>

      <br /><br />

      <label>Observacoes especificas do rural<br />
        <textarea value={ruralNotes} onChange={(e) => setRuralNotes(e.target.value)} />
        <div className="field-guide"><strong>O que e:</strong> observacoes livres sobre acesso, agua, benfeitorias, producao, risco ou oportunidade rural.<br /><strong>Como avaliar:</strong> registre informacoes importantes que nao cabem nos campos estruturados.</div>
      </label>

        </>
      )}
      <hr />

      <h2 id="commercial-reading">10. Leitura comercial e proximos passos</h2>
      <a className="back-to-top no-print" href="#topo-documento">↑ Voltar ao topo</a>
      <p className="analysis-note">Como avaliar: esta leitura deve transformar a vistoria em decisao pratica. Se o preco, risco ou documento ainda nao estiver claro, priorize revisao, pedido de documentos ou nova visita.</p>

      <label>Percepcao do preco<br />
        <select value={marketPricePerception} onChange={(e) => setMarketPricePerception(e.target.value)}>
          <option value="below_market">Abaixo do mercado</option>
          <option value="coherent">Coerente</option>
          <option value="above_market">Acima do mercado</option>
          <option value="far_above_market">Muito acima do mercado</option>
          <option value="not_evaluated">Nao avaliado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> leitura do preço frente ao mercado.<br /><strong>Como avaliar:</strong> considere localização, padrão, risco, liquidez, conservação e comparáveis conhecidos.</div>
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
        <div className="field-guide"><strong>O que e:</strong> chance de gerar interesse e negociação.<br /><strong>Como avaliar:</strong> se o imóvel depende de baixar preço para vender, marque depende de ajuste.</div>
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
        <div className="field-guide"><strong>O que e:</strong> força do imóvel como produto de mercado.<br /><strong>Como avaliar:</strong> avalie se ele é desejável, bem posicionado e fácil de comunicar no anúncio.</div>
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
        <div className="field-guide"><strong>O que e:</strong> ação profissional mais importante agora.<br /><strong>Como avaliar:</strong> escolha o próximo movimento que reduz risco ou aumenta chance de venda/locação.</div>
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
        <div className="field-guide"><strong>O que e:</strong> continuidade operacional da demanda.<br /><strong>Como avaliar:</strong> defina o que deve acontecer depois: documento, preço, visita, cliente, anúncio ou performance.</div>
      </label>

      <br /><br />

      <label>Responsavel pelo proximo passo<br />
        <select value={nextStepOwner} onChange={(e) => setNextStepOwner(e.target.value)}>
          <option value="current_broker">Broker atual</option>
          <option value="agency">Agencia</option>
          <option value="another_broker">Outro broker</option>
          <option value="administrative">Administrativo</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> continuidade operacional da demanda.<br /><strong>Como avaliar:</strong> defina o que deve acontecer depois: documento, preço, visita, cliente, anúncio ou performance.</div>
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

      <h2 id="technical-assessment-v1">Avaliacao Tecnica V1</h2>
      <a className="back-to-top no-print" href="#topo-documento">Voltar ao topo</a>
      <p className="analysis-note">Como avaliar: registre uma leitura profissional, mas sem transformar percepcao visual em laudo tecnico. Quando houver duvida estrutural, eletrica, hidraulica, umidade, documentacao ou seguranca, marque risco e recomende especialista.</p>

      <label>Qualidade da vistoria realizada<br />
        <select value={technicalVisitQuality} onChange={(e) => setTechnicalVisitQuality(e.target.value)}>
          <option value="complete_in_person">Completa presencial</option>
          <option value="partial_in_person">Parcial presencial</option>
          <option value="external_only">Somente externa</option>
          <option value="remote_by_photos">Remota por fotos/videos</option>
          <option value="owner_informed">Informada pelo proprietario</option>
          <option value="not_evaluated">Nao avaliada</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> nivel de profundidade da verificacao feita.<br /><strong>Como avaliar:</strong> quanto menor o contato real com o imovel, menor a confiabilidade da avaliacao.</div>
      </label>

      <br /><br />

      <label>Conservacao tecnica geral<br />
        <select value={technicalConservationStatus} onChange={(e) => setTechnicalConservationStatus(e.target.value)}>
          <option value="excellent">Excelente</option>
          <option value="good">Boa</option>
          <option value="regular">Regular</option>
          <option value="poor">Ruim</option>
          <option value="critical">Critica</option>
          <option value="not_verified">Nao verificado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> estado geral percebido do imovel.<br /><strong>Como avaliar:</strong> observe acabamento, manutencao, desgaste, pintura, piso, portas, janelas, infiltracoes e necessidade de reparos.</div>
      </label>

      <br /><br />

      <label>Risco estrutural aparente<br />
        <select value={technicalStructuralRisk} onChange={(e) => setTechnicalStructuralRisk(e.target.value)}>
          <option value="low">Baixo</option>
          <option value="medium">Medio</option>
          <option value="high">Alto</option>
          <option value="specialist_required">Exige especialista</option>
          <option value="not_evaluated">Nao avaliado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> percepcao de risco em estrutura, trincas, rachaduras, laje, pilares, paredes ou desniveis.<br /><strong>Como avaliar:</strong> se houver qualquer sinal relevante ou duvida, nao conclua sozinho; marque especialista.</div>
      </label>

      <br /><br />

      <label>Risco de umidade / infiltracao<br />
        <select value={technicalMoistureRisk} onChange={(e) => setTechnicalMoistureRisk(e.target.value)}>
          <option value="low">Baixo</option>
          <option value="medium">Medio</option>
          <option value="high">Alto</option>
          <option value="visible_damage">Dano visivel</option>
          <option value="not_evaluated">Nao avaliado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> sinais de umidade, vazamento, mofo, manchas ou infiltracao.<br /><strong>Como avaliar:</strong> observe paredes, teto, banheiro, cozinha, rodape, laje, telhado e cheiro de mofo.</div>
      </label>

      <br /><br />

      <label>Condicao eletrica aparente<br />
        <select value={technicalElectricalCondition} onChange={(e) => setTechnicalElectricalCondition(e.target.value)}>
          <option value="good">Boa aparente</option>
          <option value="regular">Regular</option>
          <option value="needs_review">Precisa revisao</option>
          <option value="risk_visible">Risco visivel</option>
          <option value="not_verified">Nao verificado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> percepcao inicial da instalacao eletrica.<br /><strong>Como avaliar:</strong> observe quadro, fiacao aparente, tomadas, disjuntores, improvisos e relatos de queda de energia.</div>
      </label>

      <br /><br />

      <label>Condicao hidraulica aparente<br />
        <select value={technicalHydraulicCondition} onChange={(e) => setTechnicalHydraulicCondition(e.target.value)}>
          <option value="good">Boa aparente</option>
          <option value="regular">Regular</option>
          <option value="needs_review">Precisa revisao</option>
          <option value="risk_visible">Risco visivel</option>
          <option value="not_verified">Nao verificado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> percepcao inicial de agua, esgoto, registros, vazamentos e pressao.<br /><strong>Como avaliar:</strong> veja manchas, odor, retorno, banheiro, cozinha, area de servico e informacoes do proprietario.</div>
      </label>

      <br /><br />

      <label>Padrao de acabamento percebido<br />
        <select value={technicalFinishingStandard} onChange={(e) => setTechnicalFinishingStandard(e.target.value)}>
          <option value="basic">Basico</option>
          <option value="standard">Padrao</option>
          <option value="medium_high">Medio alto</option>
          <option value="high_standard">Alto padrao</option>
          <option value="luxury">Luxo</option>
          <option value="not_evaluated">Nao avaliado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> nivel de acabamento percebido no imovel.<br /><strong>Como avaliar:</strong> considere materiais, marcenaria, metais, piso, bancadas, iluminacao, esquadrias e coerencia com o bairro/preco.</div>
      </label>

      <br /><br />

      <label>Necessidade de reforma<br />
        <select value={technicalRenovationNeed} onChange={(e) => setTechnicalRenovationNeed(e.target.value)}>
          <option value="none">Nenhuma relevante</option>
          <option value="cosmetic">Estetica leve</option>
          <option value="moderate">Moderada</option>
          <option value="heavy">Pesada</option>
          <option value="structural_or_specialist">Estrutural / especialista</option>
          <option value="not_evaluated">Nao avaliado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> intensidade de reparos antes de vender ou locar melhor.<br /><strong>Como avaliar:</strong> diferencie pintura/foto de problemas que afetam valor, financiamento, seguranca ou habitabilidade.</div>
      </label>

      <br /><br />

      <label>Qualidade das fotos tecnicas/comerciais<br />
        <select value={technicalPhotoQuality} onChange={(e) => setTechnicalPhotoQuality(e.target.value)}>
          <option value="excellent">Excelente</option>
          <option value="good">Boa</option>
          <option value="regular">Regular</option>
          <option value="poor">Ruim</option>
          <option value="missing">Faltando</option>
          <option value="not_evaluated">Nao avaliado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> se as fotos ajudam ou prejudicam a venda.<br /><strong>Como avaliar:</strong> veja luz, enquadramento, quantidade, ambientes importantes, fachada, detalhes e pontos de risco.</div>
      </label>

      <br /><br />

      <label>Especialista necessario?<br />
        <select value={technicalSpecialistNeeded} onChange={(e) => setTechnicalSpecialistNeeded(e.target.value)}>
          <option value="no">Nao</option>
          <option value="engineer">Engenheiro</option>
          <option value="architect">Arquiteto</option>
          <option value="electrician">Eletricista</option>
          <option value="plumber">Encanador</option>
          <option value="legal_or_registry">Juridico / cartorio</option>
          <option value="multiple">Mais de um especialista</option>
          <option value="not_evaluated">Nao avaliado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> necessidade de avaliacao por profissional especifico.<br /><strong>Como avaliar:</strong> sempre que o risco passar da percepcao comercial, direcione para especialista.</div>
      </label>

      <br /><br />

      <label>Principais riscos tecnicos percebidos<br />
        <textarea value={technicalMainRisks} onChange={(e) => setTechnicalMainRisks(e.target.value)} />
        <div className="field-guide"><strong>O que e:</strong> lista dos riscos tecnicos ou fisicos mais relevantes.<br /><strong>Como avaliar:</strong> escreva de forma objetiva o que precisa ser conferido, corrigido ou explicado ao cliente/proprietario.</div>
      </label>

      <br /><br />

      <label>Sugestoes de melhoria antes de publicar<br />
        <textarea value={technicalImprovementSuggestions} onChange={(e) => setTechnicalImprovementSuggestions(e.target.value)} />
        <div className="field-guide"><strong>O que e:</strong> melhorias que podem aumentar liquidez e valor percebido.<br /><strong>Como avaliar:</strong> priorize itens de baixo custo e alto impacto: limpeza, pintura, organizacao, fotos, pequenos reparos e documentacao.</div>
      </label>

      <br /><br />

      <label>Notas tecnicas V1<br />
        <textarea value={technicalAssessmentNotesV1} onChange={(e) => setTechnicalAssessmentNotesV1(e.target.value)} />
        <div className="field-guide"><strong>O que e:</strong> resumo livre da avaliacao tecnica.<br /><strong>Como avaliar:</strong> registre raciocinio profissional, ressalvas e pontos que nao entraram nos campos estruturados.</div>
      </label>
      <hr />
<h2 id="owner-interview-v1">Entrevista com proprietario V1</h2>
      <a className="back-to-top no-print" href="#topo-documento">Voltar ao topo</a>
      <p className="analysis-note">Como avaliar: registre a conversa comercial real com o proprietario. Separe fala verbal, comprovacao documental, autorizacao, flexibilidade e pontos que podem travar a negociacao.</p>

      <label>Fonte da entrevista<br />
        <select value={ownerInterviewSource} onChange={(e) => setOwnerInterviewSource(e.target.value)}>
          <option value="owner_direct">Proprietario direto</option>
          <option value="owner_representative">Representante do proprietario</option>
          <option value="family_member">Familiar</option>
          <option value="tenant">Inquilino</option>
          <option value="third_party">Terceiro</option>
          <option value="not_verified">Nao verificado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> quem forneceu as informacoes da entrevista.<br /><strong>Como avaliar:</strong> quanto mais distante do proprietario real, menor a confianca da informacao.</div>
      </label>

      <br /><br />

      <label>Motivacao do proprietario<br />
        <select value={ownerMotivation} onChange={(e) => setOwnerMotivation(e.target.value)}>
          <option value="sell_fast">Quer vender rapido</option>
          <option value="test_market">Quer testar mercado</option>
          <option value="upgrade_property">Quer trocar por outro imovel</option>
          <option value="financial_need">Necessidade financeira</option>
          <option value="relocation">Mudanca de cidade/bairro</option>
          <option value="investment_reallocation">Realocar investimento</option>
          <option value="rent_income">Busca renda de locacao</option>
          <option value="not_evaluated">Nao avaliado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> motivo principal para vender, alugar ou anunciar.<br /><strong>Como avaliar:</strong> motivacao forte geralmente aumenta abertura para preco realista e negociacao.</div>
      </label>

      <br /><br />

      <label>Urgencia de negociacao<br />
        <select value={negotiationUrgency} onChange={(e) => setNegotiationUrgency(e.target.value)}>
          <option value="high">Alta</option>
          <option value="medium">Media</option>
          <option value="low">Baixa</option>
          <option value="no_urgency">Sem urgencia</option>
          <option value="not_evaluated">Nao avaliado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> pressao de tempo para concluir o negocio.<br /><strong>Como avaliar:</strong> urgencia alta pode justificar ajuste de preco, campanha ou abordagem mais ativa.</div>
      </label>

      <br /><br />

      <label>Disponibilidade do proprietario<br />
        <select value={ownerAvailability} onChange={(e) => setOwnerAvailability(e.target.value)}>
          <option value="available">Disponivel</option>
          <option value="limited">Limitada</option>
          <option value="hard_to_contact">Dificil contato</option>
          <option value="requires_scheduling">Exige agendamento</option>
          <option value="to_schedule">A agendar</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> facilidade de contato e agenda com o proprietario.<br /><strong>Como avaliar:</strong> baixa disponibilidade pode atrasar visita, documento, proposta e fechamento.</div>
      </label>

      <br /><br />

      <label>Autorizacao / exclusividade<br />
        <select value={exclusiveAuthorization} onChange={(e) => setExclusiveAuthorization(e.target.value)}>
          <option value="exclusive_authorized">Exclusividade autorizada</option>
          <option value="non_exclusive_authorized">Autorizacao sem exclusividade</option>
          <option value="verbal_only">Apenas verbal</option>
          <option value="not_authorized">Nao autorizado</option>
          <option value="not_verified">Nao verificado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> nivel de autorizacao para trabalhar o imovel.<br /><strong>Como avaliar:</strong> autorizacao verbal ajuda no inicio, mas deve evoluir para registro formal.</div>
      </label>

      <br /><br />

      <label>Comissao / acordo comercial<br />
        <select value={commissionAgreementStatus} onChange={(e) => setCommissionAgreementStatus(e.target.value)}>
          <option value="agreed">Acordada</option>
          <option value="verbal_agreement">Acordo verbal</option>
          <option value="pending_definition">Pendente de definicao</option>
          <option value="conflict_or_doubt">Conflito ou duvida</option>
          <option value="not_verified">Nao verificado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> situacao do acordo de remuneracao profissional.<br /><strong>Como avaliar:</strong> se nao houver clareza sobre comissao, registre pendencia antes de avancar.</div>
      </label>

      <br /><br />

      <label>Documentos fornecidos<br />
        <select value={documentationProvidedStatus} onChange={(e) => setDocumentationProvidedStatus(e.target.value)}>
          <option value="complete">Completos</option>
          <option value="partial">Parciais</option>
          <option value="promised">Prometidos</option>
          <option value="not_provided">Nao fornecidos</option>
          <option value="refused">Recusados</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> quanto da documentacao foi entregue pelo proprietario.<br /><strong>Como avaliar:</strong> sem documento, evite afirmar regularidade, financiamento ou seguranca juridica.</div>
      </label>

      <br /><br />

      <label>Flexibilidade de preco<br />
        <select value={priceFlexibility} onChange={(e) => setPriceFlexibility(e.target.value)}>
          <option value="high">Alta</option>
          <option value="medium">Media</option>
          <option value="low">Baixa</option>
          <option value="none">Nenhuma</option>
          <option value="not_evaluated">Nao avaliado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> abertura do proprietario para ajustar preco ou negociar.<br /><strong>Como avaliar:</strong> use junto com preco minimo aceitavel, urgencia e resposta do mercado.</div>
      </label>

      <br /><br />

      <label>Interesse em permuta<br />
        <select value={exchangeInterest} onChange={(e) => setExchangeInterest(e.target.value)}>
          <option value="yes_property">Aceita imovel</option>
          <option value="yes_vehicle">Aceita veiculo</option>
          <option value="yes_both">Aceita imovel ou veiculo</option>
          <option value="no">Nao aceita</option>
          <option value="to_confirm">A confirmar</option>
          <option value="not_verified">Nao verificado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> abertura para receber outro bem como parte do negocio.<br /><strong>Como avaliar:</strong> diferencie interesse real de possibilidade vaga; confirme limites e tipos aceitos.</div>
      </label>

      <br /><br />

      <label>Preferencia de comunicacao<br />
        <select value={ownerCommunicationPreference} onChange={(e) => setOwnerCommunicationPreference(e.target.value)}>
          <option value="whatsapp">WhatsApp</option>
          <option value="phone">Telefone</option>
          <option value="email">E-mail</option>
          <option value="in_person">Presencial</option>
          <option value="representative">Via representante</option>
          <option value="not_informed">Nao informado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> canal mais adequado para tratar os proximos passos.<br /><strong>Como avaliar:</strong> escolha o canal que realmente acelera retorno, documento, visita e proposta.</div>
      </label>

      <br /><br />

      <label>Principais objecoes ou travas do proprietario<br />
        <textarea value={ownerMainObjectionsV1} onChange={(e) => setOwnerMainObjectionsV1(e.target.value)} />
        <div className="field-guide"><strong>O que e:</strong> barreiras comerciais percebidas na conversa.<br /><strong>Como avaliar:</strong> registre resistencia a preco, comissao, exclusividade, documento, visita, foto ou prazo.</div>
      </label>

      <br /><br />

      <label>Notas da entrevista V1<br />
        <textarea value={ownerInterviewNotesV1} onChange={(e) => setOwnerInterviewNotesV1(e.target.value)} />
        <div className="field-guide"><strong>O que e:</strong> resumo profissional da conversa com o proprietario.<br /><strong>Como avaliar:</strong> escreva informacoes uteis para retomar a negociacao sem depender de memoria.</div>
      </label>
      <hr />


      <h2 id="documentation-financial-v1">Documentacao e Financeiro V1</h2>
      <a className="back-to-top no-print" href="#topo-documento">Voltar ao topo</a>
      <p className="analysis-note">Como avaliar: registre a situacao documental e financeira sem afirmar regularidade definitiva. Use este modulo para separar o que foi comprovado, o que foi informado verbalmente e o que ainda precisa ser conferido.</p>

      <label>Matricula / registro do imovel<br />
        <select value={propertyRegistryStatus} onChange={(e) => setPropertyRegistryStatus(e.target.value)}>
          <option value="presented_valid">Apresentada aparentemente valida</option>
          <option value="presented_needs_review">Apresentada, precisa conferencia</option>
          <option value="not_presented">Nao apresentada</option>
          <option value="discrepancy_found">Divergencia identificada</option>
          <option value="relevant_risk">Risco relevante</option>
          <option value="not_verified">Nao verificado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> situacao inicial do documento principal do imovel.<br /><strong>Como avaliar:</strong> marque valida apenas se foi apresentada e confere de forma aparente. Se nao analisou, use nao verificado.</div>
      </label>

      <br /><br />

      <label>Documentos do proprietario<br />
        <select value={ownerDocumentStatus} onChange={(e) => setOwnerDocumentStatus(e.target.value)}>
          <option value="complete">Completos</option>
          <option value="partial">Parciais</option>
          <option value="pending">Pendentes</option>
          <option value="inconsistent">Inconsistentes</option>
          <option value="not_presented">Nao apresentados</option>
          <option value="not_verified">Nao verificado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> situacao dos documentos pessoais ou empresariais do proprietario.<br /><strong>Como avaliar:</strong> se faltar CPF/CNPJ, comprovacao de representante ou titularidade, registre pendencia.</div>
      </label>

      <br /><br />

      <label>IPTU / tributos do imovel<br />
        <select value={propertyTaxStatus} onChange={(e) => setPropertyTaxStatus(e.target.value)}>
          <option value="apparently_regular">Regular aparente</option>
          <option value="pending_review">Pendente de conferencia</option>
          <option value="debt_informed">Debito informado</option>
          <option value="discrepancy_found">Divergencia identificada</option>
          <option value="not_presented">Nao apresentado</option>
          <option value="not_verified">Nao verificado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> leitura inicial de IPTU, taxas ou tributos relacionados ao imovel.<br /><strong>Como avaliar:</strong> sem guia, certidao ou comprovacao, nao trate como regular.</div>
      </label>

      <br /><br />

      <label>Debito de condominio<br />
        <select value={condominiumDebtStatus} onChange={(e) => setCondominiumDebtStatus(e.target.value)}>
          <option value="not_applicable">Nao se aplica</option>
          <option value="apparently_clear">Aparentemente sem debito</option>
          <option value="debt_informed">Debito informado</option>
          <option value="pending_review">Pendente de conferencia</option>
          <option value="relevant_risk">Risco relevante</option>
          <option value="not_verified">Nao verificado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> situacao financeira junto ao condominio, quando existir.<br /><strong>Como avaliar:</strong> debito condominial pode impactar negociacao, escritura, posse e proposta.</div>
      </label>

      <br /><br />

      <label>Financiamento / alienacao / saldo devedor<br />
        <select value={financingDebtStatus} onChange={(e) => setFinancingDebtStatus(e.target.value)}>
          <option value="paid_off">Quitado informado/comprovado</option>
          <option value="financed">Financiado</option>
          <option value="alienated">Alienado</option>
          <option value="debt_informed">Saldo devedor informado</option>
          <option value="to_confirm">A confirmar</option>
          <option value="not_verified">Nao verificado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> existencia de financiamento, alienacao ou saldo devedor.<br /><strong>Como avaliar:</strong> diferencie imovel quitado de imovel com saldo. Se for verbal, use a confirmar.</div>
      </label>

      <br /><br />

      <label>Restricao juridica conhecida<br />
        <select value={legalRestrictionStatus} onChange={(e) => setLegalRestrictionStatus(e.target.value)}>
          <option value="none_informed">Nenhuma informada</option>
          <option value="to_confirm">A confirmar</option>
          <option value="inventory_or_divorce">Inventario/divorcio</option>
          <option value="lawsuit_or_lien">Acao judicial/penhora</option>
          <option value="ownership_conflict">Conflito de titularidade</option>
          <option value="relevant_risk">Risco relevante</option>
          <option value="not_verified">Nao verificado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> risco juridico que pode travar venda, locacao ou transferencia.<br /><strong>Como avaliar:</strong> nao afirme inexistencia de restricao sem documento/certidao. Use a confirmar quando nao houver prova.</div>
      </label>

      <br /><br />

      <label>Elegibilidade para financiamento<br />
        <select value={financingEligibilityStatus} onChange={(e) => setFinancingEligibilityStatus(e.target.value)}>
          <option value="likely_eligible">Provavelmente elegivel</option>
          <option value="depends_on_documents">Depende de documentos</option>
          <option value="depends_on_regularization">Depende de regularizacao</option>
          <option value="unlikely">Pouco provavel</option>
          <option value="not_eligible_apparent">Aparentemente nao elegivel</option>
          <option value="not_evaluated">Nao avaliado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> leitura preliminar sobre possibilidade de financiamento.<br /><strong>Como avaliar:</strong> considere matricula, averbação, area, habite-se, quitacao, restricoes e padrao bancario.</div>
      </label>

      <br /><br />

      <label>Risco fiscal / tributario<br />
        <select value={fiscalRiskStatus} onChange={(e) => setFiscalRiskStatus(e.target.value)}>
          <option value="low">Baixo</option>
          <option value="medium">Medio</option>
          <option value="high">Alto</option>
          <option value="pending_review">Pendente de conferencia</option>
          <option value="not_evaluated">Nao avaliado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> risco ligado a impostos, taxas, dividas ou custos fiscais da operacao.<br /><strong>Como avaliar:</strong> se houver duvida sobre IPTU, ITBI, ganho de capital, condominio ou taxas, registre pendencia.</div>
      </label>

      <br /><br />

      <label>Nivel de risco documental<br />
        <select value={documentationRiskLevel} onChange={(e) => setDocumentationRiskLevel(e.target.value)}>
          <option value="low">Baixo</option>
          <option value="medium">Medio</option>
          <option value="high">Alto</option>
          <option value="critical">Critico</option>
          <option value="not_evaluated">Nao avaliado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> classificacao geral do risco documental da análise.<br /><strong>Como avaliar:</strong> alto ou critico quando faltar documento essencial, houver divergencia, restricao ou duvida de titularidade.</div>
      </label>

      <br /><br />

      <label>Recomendacao documental<br />
        <select value={documentationRecommendationV1} onChange={(e) => setDocumentationRecommendationV1(e.target.value)}>
          <option value="request_documents">Solicitar documentos</option>
          <option value="send_to_legal_review">Enviar para revisao juridica</option>
          <option value="validate_registry">Validar matricula/registro</option>
          <option value="validate_owner_identity">Validar proprietario/representante</option>
          <option value="validate_debts">Validar debitos</option>
          <option value="regularize_before_publish">Regularizar antes de publicar</option>
          <option value="ok_to_continue">Pode continuar</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> proxima acao documental recomendada.<br /><strong>Como avaliar:</strong> escolha a acao que reduz o maior risco antes de proposta, contrato ou publicacao forte.</div>
      </label>

      <br /><br />

      <label>Recomendacao financeira<br />
        <select value={financialRecommendationV1} onChange={(e) => setFinancialRecommendationV1(e.target.value)}>
          <option value="to_confirm">A confirmar</option>
          <option value="review_price">Revisar preco</option>
          <option value="review_debts">Revisar debitos</option>
          <option value="evaluate_financing">Avaliar financiamento</option>
          <option value="evaluate_discount_margin">Avaliar margem de desconto</option>
          <option value="ok_to_continue">Pode continuar</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> acao financeira recomendada para destravar o negocio.<br /><strong>Como avaliar:</strong> considere preco, saldo devedor, debitos, financiamento, margem e capacidade de negociacao.</div>
      </label>

      <br /><br />

      <label>Notas documentais V1<br />
        <textarea value={documentationNotesV1} onChange={(e) => setDocumentationNotesV1(e.target.value)} />
        <div className="field-guide"><strong>O que e:</strong> observacoes livres sobre documentos, titularidade, restricoes e pendencias.<br /><strong>Como avaliar:</strong> registre fatos, fontes e documentos pendentes sem concluir juridicamente no lugar de especialista.</div>
      </label>

      <br /><br />

      <label>Notas financeiras V1<br />
        <textarea value={financialNotesV1} onChange={(e) => setFinancialNotesV1(e.target.value)} />
        <div className="field-guide"><strong>O que e:</strong> observacoes livres sobre preco, debitos, financiamento e custos.<br /><strong>Como avaliar:</strong> registre valores informados, duvidas, necessidade de comprovacao e impacto na negociacao.</div>
      </label>
      <hr />
<h2 id="commercial-proposal-v1">Estrategia Comercial e Proposta Comercial V1</h2>
      <a className="back-to-top no-print" href="#topo-documento">Voltar ao topo</a>
      <p className="analysis-note">Como avaliar: transforme a análise tecnica em decisao comercial. A proposta deve orientar preco, publicacao, negociacao, argumento para o proprietario e proxima acao pratica.</p>

      <label>Diagnostico comercial do imovel<br />
        <select value={proposalCommercialDiagnosis} onChange={(e) => setProposalCommercialDiagnosis(e.target.value)}>
          <option value="high_potential">Alto potencial comercial</option>
          <option value="good_potential">Bom potencial comercial</option>
          <option value="average_potential">Potencial medio</option>
          <option value="depends_on_price">Depende de ajuste de preco</option>
          <option value="requires_corrections">Precisa de ajustes antes de publicar</option>
          <option value="high_risk">Alto risco comercial/documental</option>
          <option value="not_evaluated">Nao avaliado</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> leitura executiva do potencial do imovel como produto de mercado.<br /><strong>Como avaliar:</strong> cruze preco, liquidez, risco, estado, documentacao, modulo do tipo de imovel e motivacao do proprietario.</div>
      </label>

      <br /><br />

      <label>Posicionamento recomendado<br />
        <select value={proposalRecommendedPositioning} onChange={(e) => setProposalRecommendedPositioning(e.target.value)}>
          <option value="premium_positioning">Posicionamento premium</option>
          <option value="standard_market">Mercado padrao</option>
          <option value="opportunity">Oportunidade</option>
          <option value="investment">Investimento</option>
          <option value="family_home">Moradia familiar</option>
          <option value="income_property">Renda/locacao</option>
          <option value="needs_repositioning">Precisa reposicionamento</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> narrativa comercial que deve guiar anuncio, atendimento e argumentacao.<br /><strong>Como avaliar:</strong> escolha o enquadramento que melhor vende o imovel sem prometer algo que a análise nao sustenta.</div>
      </label>

      <br /><br />

      <label>Estrategia de publicacao<br />
        <select value={proposalListingStrategy} onChange={(e) => setProposalListingStrategy(e.target.value)}>
          <option value="publish_now">Publicar agora</option>
          <option value="publish_after_review">Publicar apos revisao</option>
          <option value="publish_after_documents">Publicar apos documentos</option>
          <option value="publish_after_photos">Publicar apos fotos melhores</option>
          <option value="hold_until_price_adjustment">Aguardar ajuste de preco</option>
          <option value="do_not_publish_yet">Nao publicar ainda</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> decisao sobre levar ou nao o imovel para vitrine publica.<br /><strong>Como avaliar:</strong> se documento, preco, foto ou risco estiverem fracos, segure ou publique com revisao planejada.</div>
      </label>

      <br /><br />

      <label>Estrategia de negociacao<br />
        <select value={proposalNegotiationStrategy} onChange={(e) => setProposalNegotiationStrategy(e.target.value)}>
          <option value="firm_price">Preco firme</option>
          <option value="neutral_margin">Margem moderada</option>
          <option value="aggressive_discount">Desconto agressivo</option>
          <option value="start_high_reduce_later">Comecar alto e reduzir depois</option>
          <option value="campaign_discount">Campanha/desconto por prazo</option>
          <option value="owner_alignment_needed">Precisa alinhar com proprietario</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> plano de condução da negociacao.<br /><strong>Como avaliar:</strong> use preco minimo, urgencia, flexibilidade do proprietario e resposta esperada do mercado.</div>
      </label>

      <br /><br />

      <label>Argumentacao para o proprietario<br />
        <textarea value={proposalOwnerArgument} onChange={(e) => setProposalOwnerArgument(e.target.value)} />
        <div className="field-guide"><strong>O que e:</strong> texto de apoio para explicar ao proprietario a recomendacao profissional.<br /><strong>Como avaliar:</strong> escreva com base em fatos: preco, risco, comparaveis, liquidez, documentos, fotos e perfil do comprador.</div>
      </label>

      <br /><br />

      <label>Pontos fortes para o anuncio<br />
        <textarea value={proposalPublicHighlights} onChange={(e) => setProposalPublicHighlights(e.target.value)} />
        <div className="field-guide"><strong>O que e:</strong> argumentos que podem virar destaque publico do anuncio.<br /><strong>Como avaliar:</strong> use apenas pontos que podem ser sustentados por fotos, dados ou verificacao profissional.</div>
      </label>

      <br /><br />

      <label>Pontos de atencao antes de publicar<br />
        <textarea value={proposalAttentionPoints} onChange={(e) => setProposalAttentionPoints(e.target.value)} />
        <div className="field-guide"><strong>O que e:</strong> riscos, pendencias ou ajustes que podem prejudicar a venda ou a locacao.<br /><strong>Como avaliar:</strong> registre o que precisa ser resolvido, confirmado ou explicado antes de expor o imovel com forca.</div>
      </label>

      <br /><br />

      <label>Proxima acao recomendada<br />
        <select value={proposalNextAction} onChange={(e) => setProposalNextAction(e.target.value)}>
          <option value="review_price">Revisar preco</option>
          <option value="align_with_owner">Alinhar com proprietario</option>
          <option value="request_documents">Solicitar documentos</option>
          <option value="schedule_new_visit">Agendar nova visita</option>
          <option value="improve_photos">Melhorar fotos</option>
          <option value="create_listing">Criar anuncio</option>
          <option value="publish_listing">Publicar anuncio</option>
          <option value="monitor_performance">Acompanhar performance</option>
          <option value="archive_capture">Arquivar captacao</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> movimento pratico depois da proposta comercial.<br /><strong>Como avaliar:</strong> escolha a acao que mais destrava o funil agora.</div>
      </label>

      <br /><br />

      <label>Data sugerida para retorno<br />
        <input type="date" value={proposalFollowUpDate} onChange={(e) => setProposalFollowUpDate(e.target.value)} />
        <div className="field-guide"><strong>O que e:</strong> prazo para cobrar documento, ajustar preco, revisar anuncio ou falar com o proprietario.<br /><strong>Como avaliar:</strong> use uma data realista para evitar que a captacao fique parada.</div>
      </label>

      <br /><br />

      <label>Notas internas da proposta comercial<br />
        <textarea value={proposalInternalNotes} onChange={(e) => setProposalInternalNotes(e.target.value)} />
        <div className="field-guide"><strong>O que e:</strong> observacoes internas da estrategia comercial.<br /><strong>Como avaliar:</strong> registre raciocinio, combinado verbal, margem, duvidas e alertas para retomada futura.</div>
      </label>
      <hr />
<h2 id="controlled-summaries-v1">Resumos Controlados V1</h2>
      <a className="back-to-top no-print" href="#topo-documento">Voltar ao topo</a>
      <p className="analysis-note">Como avaliar: este modulo separa o que pode ser comunicado publicamente, o que pode ser mostrado ao proprietario, o que pode ser compartilhado com parceiros e o que deve permanecer interno. Nao exponha dado sensivel, risco juridico, preco minimo ou estrategia interna em resumo publico.</p>

      <label>Status do resumo<br />
        <select value={summaryReadinessStatus} onChange={(e) => setSummaryReadinessStatus(e.target.value)}>
          <option value="draft">Rascunho</option>
          <option value="needs_review">Precisa de revisao</option>
          <option value="ready_internal">Pronto para uso interno</option>
          <option value="ready_owner">Pronto para proprietario</option>
          <option value="ready_public">Pronto para anuncio publico</option>
          <option value="blocked_by_risk">Bloqueado por risco</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> maturidade dos resumos gerados a partir da análise.<br /><strong>Como avaliar:</strong> se ainda existem pendencias documentais, tecnicas ou financeiras, mantenha como rascunho ou precisa de revisao.</div>
      </label>

      <br /><br />

      <label>Nivel de exposicao publica<br />
        <select value={publicExposureLevel} onChange={(e) => setPublicExposureLevel(e.target.value)}>
          <option value="full">Completa</option>
          <option value="limited">Limitada</option>
          <option value="neighborhood_only">Somente bairro/regiao</option>
          <option value="no_sensitive_details">Sem detalhes sensiveis</option>
          <option value="do_not_publish">Nao publicar</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> quanto da informacao pode ir para ambiente publico.<br /><strong>Como avaliar:</strong> reduza exposicao quando houver risco, falta de documento, endereco sensivel, estrategia de preco ou pendencia relevante.</div>
      </label>

      <br /><br />

      <label>Visibilidade do resumo para proprietario<br />
        <select value={ownerSummaryVisibility} onChange={(e) => setOwnerSummaryVisibility(e.target.value)}>
          <option value="can_share">Pode compartilhar</option>
          <option value="share_after_review">Compartilhar apos revisao</option>
          <option value="partial_only">Somente parcial</option>
          <option value="internal_only">Somente interno</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> controle sobre o que pode ser apresentado ao proprietario.<br /><strong>Como avaliar:</strong> argumentos comerciais podem ser compartilhados; notas internas, risco sensivel e estrategia de negociacao devem ser protegidos.</div>
      </label>

      <br /><br />

      <label>Visibilidade para parceiros<br />
        <select value={partnerSummaryVisibility} onChange={(e) => setPartnerSummaryVisibility(e.target.value)}>
          <option value="open_to_partners">Aberto a parceiros</option>
          <option value="restricted">Restrito</option>
          <option value="only_after_authorization">Somente apos autorizacao</option>
          <option value="do_not_share">Nao compartilhar</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> regra para compartilhar informacao com parceiros, outros brokers ou imobiliarias.<br /><strong>Como avaliar:</strong> se nao houver autorizacao clara ou se houver dado sensivel, mantenha restrito.</div>
      </label>

      <br /><br />

      <label>Sensibilidade juridica/comercial do resumo<br />
        <select value={summaryLegalSensitivity} onChange={(e) => setSummaryLegalSensitivity(e.target.value)}>
          <option value="low">Baixa</option>
          <option value="medium">Media</option>
          <option value="high">Alta</option>
          <option value="critical">Critica</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> risco de o resumo conter informacao sensivel, juridica, financeira ou estrategica.<br /><strong>Como avaliar:</strong> quanto mais houver divida, restricao, preco minimo, documento pendente ou dado pessoal, maior a sensibilidade.</div>
      </label>

      <br /><br />

      <label>Resumo publico para anuncio<br />
        <textarea value={publicListingSummaryV1} onChange={(e) => setPublicListingSummaryV1(e.target.value)} />
        <div className="field-guide"><strong>O que e:</strong> versao segura e comercial que pode apoiar o texto do anuncio.<br /><strong>Como avaliar:</strong> destaque qualidades verificaveis. Nao inclua preco minimo, risco, documentos pendentes, dividas ou informacoes privadas.</div>
      </label>

      <br /><br />

      <label>Resumo para proprietario<br />
        <textarea value={ownerFacingSummaryV1} onChange={(e) => setOwnerFacingSummaryV1(e.target.value)} />
        <div className="field-guide"><strong>O que e:</strong> devolutiva profissional para o dono do imovel.<br /><strong>Como avaliar:</strong> escreva de forma objetiva, respeitosa e comercial, explicando recomendacoes de preco, fotos, documentos e proximos passos.</div>
      </label>

      <br /><br />

      <label>Resumo para parceiros<br />
        <textarea value={partnerFacingSummaryV1} onChange={(e) => setPartnerFacingSummaryV1(e.target.value)} />
        <div className="field-guide"><strong>O que e:</strong> resumo controlado para quem pode ajudar na venda, locacao ou parceria.<br /><strong>Como avaliar:</strong> compartilhe apenas o necessario para operacao, evitando estrategia interna, dados sensiveis e informacoes sem autorizacao.</div>
      </label>

      <br /><br />

      <label>Resumo executivo interno<br />
        <textarea value={internalExecutiveSummaryV1} onChange={(e) => setInternalExecutiveSummaryV1(e.target.value)} />
        <div className="field-guide"><strong>O que e:</strong> leitura interna para broker/agencia entender rapidamente a situacao do imovel.<br /><strong>Como avaliar:</strong> inclua potencial, risco, preco, pendencias, estrategia, urgencia e proxima acao em linguagem direta.</div>
      </label>

      <br /><br />

      <label>Disclaimer / ressalva controlada<br />
        <textarea value={controlledRiskDisclaimerV1} onChange={(e) => setControlledRiskDisclaimerV1(e.target.value)} />
        <div className="field-guide"><strong>O que e:</strong> ressalva para evitar conclusoes indevidas sobre documentos, estrutura ou regularidade.<br /><strong>Como avaliar:</strong> use quando a análise tiver base visual, verbal ou preliminar e ainda depender de confirmacao documental ou especialista.</div>
      </label>
      <hr />
<h2 id="private-notes-v1">Notas Privadas V1</h2>
      <a className="back-to-top no-print" href="#topo-documento">Voltar ao topo</a>
      <p className="analysis-note">Como avaliar: este modulo e estritamente interno. Use para registrar percepcoes, alertas, memoria operacional, comportamento do proprietario, estrategia sensivel, riscos e combinados que nao devem aparecer no anuncio, no resumo publico ou em compartilhamento com terceiros.</p>

      <label>Sensibilidade da nota<br />
        <select value={privateNoteSensitivity} onChange={(e) => setPrivateNoteSensitivity(e.target.value)}>
          <option value="internal">Interna</option>
          <option value="restricted">Restrita</option>
          <option value="sensitive">Sensivel</option>
          <option value="legal_sensitive">Sensivel juridicamente</option>
          <option value="do_not_share">Nao compartilhar</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> nivel de cuidado com as anotacoes privadas.<br /><strong>Como avaliar:</strong> quanto mais envolver preco minimo, risco juridico, comportamento, conflito, dado pessoal ou estrategia, maior a sensibilidade.</div>
      </label>

      <br /><br />

      <label>Prioridade da nota<br />
        <select value={privateNotePriority} onChange={(e) => setPrivateNotePriority(e.target.value)}>
          <option value="low">Baixa</option>
          <option value="medium">Media</option>
          <option value="high">Alta</option>
          <option value="urgent">Urgente</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> urgencia operacional da anotacao.<br /><strong>Como avaliar:</strong> use alta ou urgente quando a nota pode afetar publicacao, proposta, documento, preco, atendimento ou fechamento.</div>
      </label>

      <br /><br />

      <label>Categoria principal<br />
        <select value={privateNoteCategory} onChange={(e) => setPrivateNoteCategory(e.target.value)}>
          <option value="general">Geral</option>
          <option value="negotiation">Negociacao</option>
          <option value="owner_behavior">Comportamento do proprietario</option>
          <option value="documentation_risk">Risco documental</option>
          <option value="price_strategy">Estrategia de preco</option>
          <option value="legal_attention">Atencao juridica</option>
          <option value="operational_follow_up">Acompanhamento operacional</option>
          <option value="agency_management">Gestao da agencia</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> tema central da nota privada.<br /><strong>Como avaliar:</strong> classifique para facilitar filtro futuro, auditoria interna e retomada da demanda.</div>
      </label>

      <br /><br />

      <label>Alerta operacional<br />
        <select value={privateOperationalAlert} onChange={(e) => setPrivateOperationalAlert(e.target.value)}>
          <option value="none">Nenhum</option>
          <option value="needs_owner_alignment">Precisa alinhar com proprietario</option>
          <option value="do_not_publish_yet">Nao publicar ainda</option>
          <option value="price_conflict">Conflito de preco</option>
          <option value="document_risk">Risco documental</option>
          <option value="communication_risk">Risco de comunicacao</option>
          <option value="requires_manager_review">Exige revisao de gestor</option>
          <option value="requires_legal_review">Exige revisao juridica</option>
        </select>
        <div className="field-guide"><strong>O que e:</strong> sinalizador interno para impedir erro operacional.<br /><strong>Como avaliar:</strong> marque alerta quando alguem da equipe precisa saber antes de publicar, negociar, compartilhar ou avançar.</div>
      </label>

      <br /><br />

      <label>Memoria privada de negociacao<br />
        <textarea value={privateNegotiationMemo} onChange={(e) => setPrivateNegotiationMemo(e.target.value)} />
        <div className="field-guide"><strong>O que e:</strong> registro sensivel sobre margem, combinados, abertura de desconto e estrategia de abordagem.<br /><strong>Como avaliar:</strong> escreva para a equipe lembrar o raciocinio comercial sem expor isso ao proprietario, comprador ou publico.</div>
      </label>

      <br /><br />

      <label>Notas sobre comportamento do proprietario<br />
        <textarea value={privateOwnerBehaviorNotes} onChange={(e) => setPrivateOwnerBehaviorNotes(e.target.value)} />
        <div className="field-guide"><strong>O que e:</strong> percepcao operacional sobre disponibilidade, resistencia, ansiedade, confiabilidade ou travas do proprietario.<br /><strong>Como avaliar:</strong> seja objetivo e profissional. Evite julgamentos pessoais; registre apenas impacto na operacao.</div>
      </label>

      <br /><br />

      <label>Notas privadas de risco<br />
        <textarea value={privateRiskNotesV1} onChange={(e) => setPrivateRiskNotesV1(e.target.value)} />
        <div className="field-guide"><strong>O que e:</strong> riscos percebidos que nao devem ir para resumo publico.<br /><strong>Como avaliar:</strong> inclua riscos documentais, financeiros, tecnicos, juridicos, comerciais ou de reputacao que exigem cuidado.</div>
      </label>

      <br /><br />

      <label>Notas internas da agencia / equipe<br />
        <textarea value={privateAgencyNotes} onChange={(e) => setPrivateAgencyNotes(e.target.value)} />
        <div className="field-guide"><strong>O que e:</strong> orientacoes internas para gestor, agencia, broker responsavel ou time operacional.<br /><strong>Como avaliar:</strong> registre alinhamentos de equipe, pendencias, prioridade, responsavel e contexto que nao deve sair da operacao.</div>
      </label>

      <br /><br />

      <label>Notas de acompanhamento futuro<br />
        <textarea value={privateFollowUpNotes} onChange={(e) => setPrivateFollowUpNotes(e.target.value)} />
        <div className="field-guide"><strong>O que e:</strong> memoria do que deve ser cobrado, revisado ou acompanhado depois.<br /><strong>Como avaliar:</strong> escreva proximos passos, prazos, retorno esperado e pontos que nao podem ser esquecidos.</div>
      </label>

      <br /><br />

      <label>Notas que nao devem ser compartilhadas<br />
        <textarea value={privateDoNotShareNotes} onChange={(e) => setPrivateDoNotShareNotes(e.target.value)} />
        <div className="field-guide"><strong>O que e:</strong> bloco de maxima restricao interna.<br /><strong>Como avaliar:</strong> use para preco minimo, risco juridico sensivel, estrategia de pressao, conflito e informacao que nao deve aparecer em relatorio externo.</div>
      </label>

      <hr />
<div className="assessment-action-bar no-print">
        <button onClick={handleSave} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar análise patrimonial'}
        </button>

        {status && <span className="assessment-status">{status}</span>}
      </div>
      </section>

        </>
      )}
    </main>
  )
}