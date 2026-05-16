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
      <main style={{ padding: 24 }}>
        <p>Carregando...</p>
      </main>
    )
  }

  return (
    <main style={{ padding: 24 }}>
      <style jsx global>{`
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

        textarea {
          min-height: 90px;
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
          margin-right: 8px;
        }
      `}</style>

      <p>
        <a className="button-link" href={`/operations/properties/${listingId}`}>
          Voltar para checkup
        </a>
        <a className="button-link" href={`/operations/properties/${listingId}/edit`}>
          Editar anuncio
        </a>
        <a className="button-link" href="/operations/properties/list">
          Voltar para lista
        </a>
      </p>

      <h1>Ficha Profissional de Captacao e Avaliacao</h1>

      <div style={{ border: '1px solid #ddd', padding: 16, marginBottom: 20 }}>
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
      </div>

      <p>
        <strong>Anuncio vinculado:</strong> {listing?.title}
      </p>

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

          <div style={{ border: '1px solid #ddd', padding: 16, marginBottom: 20 }}>
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
          </div>

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

      <button onClick={handleSave} disabled={saving}>
        {saving ? 'Salvando...' : 'Salvar ficha profissional'}
      </button>

      <br /><br />

          {status && <p>{status}</p>}
        </>
      )}
    </main>
  )
}