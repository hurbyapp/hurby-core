
/*
=========================================
HURBY — ORIENTACAO PARA CODEX / EXECUTORES FUTUROS

ESTA AREA ESTA EM FASE DE MODELAGEM DE PRODUTO.

REGRAS CONCEITUAIS:
- Pipeline Pro nao e ficha.
- Pipeline Pro e fluxo operacional executavel.
- Dossie consolida informacoes, historico, decisoes e lifecycle.
- Analise Patrimonial avalia e gera inteligencia tecnica/comercial.
- Anuncio Placeholder e item operacional provisório antes do anuncio publico final.
- Publicacao/Anuncio Distribuivel e camada independente, nao apenas uma etapa comum.
- Pipeline de Inteligencia e o cerebro que interpreta dados dos pipelines operacionais.

NAO FAZER SEM AUTORIZACAO/AUDITORIA:
- criar migration;
- alterar schema;
- alterar RLS;
- alterar RPC;
- alterar services;
- conectar salvamento real no banco;
- mudar contrato de dados;
- transformar os cards em formulario final definitivo.

DIRECAO DE PRODUTO:
- primeiro organizar jornada, etapas, progresso, pendencias e acoes;
- depois conectar cada pipeline aos dados reais;
- manter clareza entre coleta operacional, inteligencia, proposta e publicacao;
- preservar UTF-8 e evitar correcao ampla de acentuacao por script PowerShell.
=========================================
*/

﻿'use client'

/*
=========================================
HURBY — PIPELINE PRO STEP
LOCAL:
src/app/operations/pipeline/[step]/page.tsx

STATUS:
PIPELINE_PRO_STEP_FOUNDATION_V1

OBJETIVO:
Criar tela base para cada etapa do Pipeline Pro.

REGRA:
- Ainda nao grava no banco.
- Ainda nao cria captacao real.
- Serve para transformar cards do pipeline em execucao guiada.
- Cada etapa futura podera abrir perguntas, providencias, documentos, aprovacoes ou acoes.
=========================================
*/

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getPropertyListingById, getProfessionalAssessmentByListingId, getClientEntityById, getClientRelationshipById , getListingAccessContext, getListingCompositionContext } from '@/lib/services/propertyService'
import {
  buildPipelineStepHref,
  getNextPipelineStep,
  getPipelinePermissionMode,
  getPipelineStepDefinition,
  getPreviousPipelineStep,
  pipelineStepOrder,
} from '@/lib/services/pipelineProService'

const steps: Record<string, any> = {
  atendimento: {
    title: 'Atendimento e captacao',
    description: 'Entrada rapida da oportunidade: proprietario, contato, origem, nome interno e agendamento.',
    items: [
      'Registrar nome do proprietario',
      'Registrar telefone',
      'Criar nome interno do Anuncio Placeholder',
      'Informar origem do contato',
      'Registrar observacao inicial',
      'Agendar vistoria futura ou iniciar agora',
    ],
  },
  levantamento: {
    title: 'Levantamento do patrimonio',
    description: 'Coleta por tipo/subtipo: composicao, acabamento, condominio, entorno e evidencias.',
    items: [
      'Selecionar tipo e subtipo do imovel',
      'Preencher composicao do imovel',
      'Classificar acabamento e padrao construtivo',
      'Registrar condominio/infraestrutura',
      'Adicionar fotos e evidencias',
      'Fechar percepcao subjetiva do corretor',
    ],
  },
  diagnostico: {
    title: 'Diagnostico e risco',
    description: 'Dados financeiros, documentais, geograficos, perfil do proprietario e mercado.',
    items: [
      'Avaliar perfil do proprietario',
      'Registrar financeiro e IPTU',
      'Informar valor venal declarado no IPTU',
      'Levantar documentacao e riscos',
      'Registrar pesquisa de mercado',
      'Classificar oportunidades e ameacas',
    ],
  },
  estrategia: {
    title: 'Estrategia comercial',
    description: 'Transforma levantamento em decisao: preco, posicionamento, distribuicao, narrativa e adendos.',
    items: [
      'Definir estrategia de preco',
      'Definir estrategia de anuncio',
      'Definir canais de distribuicao',
      'Definir posicionamento de mercado',
      'Registrar adendos estrategicos',
      'Preparar recomendacao profissional',
    ],
  },
  proposta: {
    title: 'Proposta e aprovacao',
    description: 'Consolida a estrategia para aprovacao interna e validacao do proprietario.',
    items: [
      'Preparar proposta ao proprietario',
      'Enviar para aprovacao interna quando aplicavel',
      'Registrar retorno do proprietario',
      'Ajustar estrategia se necessario',
      'Preparar aceite',
      'Preparar acoplagem futura com contratos',
    ],
  },
  publicacao: {
    title: 'Publicacao parametrizada',
    description: 'Transforma estrategia aprovada em anuncio publico/profissional configurado.',
    items: [
      'Gerar titulo publico',
      'Gerar descricao profissional',
      'Selecionar fotos publicas',
      'Aplicar tags e splashes',
      'Aplicar preco aprovado',
      'Publicar ou deixar pronto para publicacao',
    ],
  },
  acompanhamento: {
    title: 'Acompanhamento e lifecycle',
    description: 'Etapa futura para leads, visitas, propostas, ajustes e encerramento.',
    items: [
      'Acompanhar leads futuros',
      'Registrar visitas futuras',
      'Registrar propostas futuras',
      'Ajustar preco/fotos/descricao',
      'Retirar do ar quando vendido/alugado',
      'Preservar historico no Dossie',
    ],
  },
}

// PIPELINE_STEP_SERVICE_INTEGRATION_V1
export default function PipelineStepPage() {
  const params = useParams()
  const [attachContext, setAttachContext] = useState({
    listingId: '',
    mode: '',
  })

  // ATTACH_LISTING_REAL_CONTEXT_STATE_V1
  const [attachedListing, setAttachedListing] = useState<any | null>(null)
  const [attachedListingStatus, setAttachedListingStatus] = useState('')
  const [attachedListingError, setAttachedListingError] = useState('')

  // ATTACH_ASSESSMENT_REAL_CONTEXT_STATE_V1
  const [attachedAssessment, setAttachedAssessment] = useState<any | null>(null)
  const [attachedAssessmentStatus, setAttachedAssessmentStatus] = useState('')
  const [attachedAssessmentError, setAttachedAssessmentError] = useState('')

  // ATTACH_CLIENT_REAL_CONTEXT_STATE_V1
  const [attachedClient, setAttachedClient] = useState<any | null>(null)
  const [attachedClientRelationship, setAttachedClientRelationship] = useState<any | null>(null)
  const [attachedClientStatus, setAttachedClientStatus] = useState('')
  const [attachedClientError, setAttachedClientError] = useState('')

  // ATTACH_LISTING_PERMISSION_CONTEXT_STATE_V1
  // PIPELINE_INHERITED_COMPOSITION_STATE_V1
  const [listingCompositionContext, setListingCompositionContext] = useState<any>(null)
  const [listingCompositionLoading, setListingCompositionLoading] = useState(false)
  const [listingCompositionError, setListingCompositionError] = useState<string | null>(null)

  const formatInheritedCompositionValue = (value: any) => {
    if (value === null || value === undefined || value === '') return 'Não informado'
    if (typeof value === 'object') {
      if ('value' in value) return String(value.value)
      try {
        return JSON.stringify(value)
      } catch {
        return String(value)
      }
    }
    return String(value)
  }

  const [listingPermission, setListingPermission] = useState({
    can_access: false,
    can_manage: false,
  })
  const [listingPermissionStatus, setListingPermissionStatus] = useState('')
  const [listingPermissionError, setListingPermissionError] = useState('')

  const stepKey = String(params.step || '')
  const step = steps[stepKey] || steps.atendimento

  // ATTACH_EXISTING_LISTING_MODE_V1
  // Quando mode=attach e listingId existir, o Pipeline Pro esta sendo acoplado
  // a um anuncio/imovel ja existente. Nao deve tratar como captacao do zero.
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)

    setAttachContext({
      listingId: searchParams.get('listingId') || '',
      mode: searchParams.get('mode') || '',
    })
  }, [])

  const listingId = attachContext.listingId
  const mode = attachContext.mode
  const isAttachMode = mode === 'attach' && !!listingId

  // ATTACH_LISTING_REAL_CONTEXT_FETCH_V1
  useEffect(() => {
    if (!listingId || mode !== 'attach') {
      setAttachedListing(null)
      setAttachedListingStatus('')
      setAttachedListingError('')
      setAttachedAssessment(null)
      setAttachedAssessmentStatus('')
      setAttachedAssessmentError('')
      setAttachedClient(null)
      setAttachedClientRelationship(null)
      setAttachedClientStatus('')
      setAttachedClientError('')
      setListingPermission({
        can_access: false,
        can_manage: false,
      })
      setListingPermissionStatus('')
      setListingPermissionError('')
      return
    }

    let active = true

    async function loadAttachedListing() {
      setAttachedListingStatus('Carregando anúncio existente...')
      setAttachedListingError('')

      const [listingResponse, assessmentResponse, permissionResponse] = await Promise.all([
        getPropertyListingById(listingId),
        getProfessionalAssessmentByListingId(listingId),
        getListingAccessContext(listingId),
      ])

      if (!active) return

      if (listingResponse.error || !listingResponse.data) {
        console.error('ATTACH LISTING LOAD ERROR:', listingResponse.error)
        setAttachedListing(null)
        setAttachedListingStatus('')
        setAttachedListingError('Não foi possível carregar os dados do anúncio existente.')
        return
      }

      setAttachedListing(listingResponse.data)
      setAttachedListingStatus('Anúncio existente carregado.')

      // ATTACH_LISTING_PERMISSION_CONTEXT_FETCH_V1
      if (permissionResponse.error || !permissionResponse.data) {
        console.error('ATTACH LISTING PERMISSION ERROR:', permissionResponse.error)
        setListingPermission({
          can_access: false,
          can_manage: false,
        })
        setListingPermissionStatus('')
        setListingPermissionError('Não foi possível verificar sua permissão neste anúncio.')
      } else {
        setListingPermission(permissionResponse.data)
        setListingPermissionStatus(
          permissionResponse.data.can_manage
            ? 'Você pode gerenciar este anúncio.'
            : permissionResponse.data.can_access
              ? 'Você pode consultar este anúncio, mas a edição deve ser restrita.'
              : 'Você não possui permissão para acessar este anúncio.'
        )
        setListingPermissionError('')
      }

      // ATTACH_ASSESSMENT_REAL_CONTEXT_FETCH_V1
      if (assessmentResponse.error) {
        console.error('ATTACH ASSESSMENT LOAD ERROR:', assessmentResponse.error)
        setAttachedAssessment(null)
        setAttachedAssessmentStatus('')
        setAttachedAssessmentError('Não foi possível carregar a análise profissional existente.')
        return
      }

      if (assessmentResponse.data) {
        setAttachedAssessment(assessmentResponse.data)
        setAttachedAssessmentStatus('Análise/Dossiê profissional encontrado.')

        // ATTACH_CLIENT_REAL_CONTEXT_FETCH_V1
        const clientEntityId = assessmentResponse.data.client_entity_id
        const clientRelationshipId = assessmentResponse.data.client_relationship_id

        if (clientEntityId) {
          const [clientResponse, relationshipResponse] = await Promise.all([
            getClientEntityById(clientEntityId),
            clientRelationshipId
              ? getClientRelationshipById(clientRelationshipId)
              : Promise.resolve({ data: null, error: null }),
          ])

          if (!active) return

          if (clientResponse.error) {
            console.error('ATTACH CLIENT LOAD ERROR:', clientResponse.error)
            setAttachedClient(null)
            setAttachedClientStatus('')
            setAttachedClientError('Não foi possível carregar o cliente/proprietário vinculado.')
          } else {
            setAttachedClient(clientResponse.data)
            setAttachedClientStatus(
              clientResponse.data
                ? 'Cliente/proprietário vinculado encontrado.'
                : 'Cliente/proprietário não encontrado pelo ID vinculado.'
            )
          }

          if (relationshipResponse.error) {
            console.error('ATTACH CLIENT RELATIONSHIP LOAD ERROR:', relationshipResponse.error)
            setAttachedClientRelationship(null)
          } else {
            setAttachedClientRelationship(relationshipResponse.data)
          }
        } else {
          setAttachedClient(null)
          setAttachedClientRelationship(null)
          setAttachedClientStatus('Análise encontrada, mas sem cliente/proprietário vinculado.')
          setAttachedClientError('')
        }
      } else {
        setAttachedAssessment(null)
        setAttachedAssessmentStatus('Ainda não existe análise profissional para este anúncio.')
        setAttachedClient(null)
        setAttachedClientRelationship(null)
        setAttachedClientStatus('Sem análise formal, ainda não há cliente vinculado neste fluxo.')
        setAttachedClientError('')
      }
    }

    loadAttachedListing()

    return () => {
      active = false
    }
  }, [listingId, mode])


  // PIPELINE_ATENDIMENTO_ORIGIN_CONTEXT_V1
  const atendimentoOriginContext = isAttachMode
    ? attachedListing?.metadata?.source === 'marketplace_user_listing'
      ? 'marketplace_attach'
      : 'existing_listing_attach'
    : 'new_intake'

  const atendimentoOriginLabel =
    atendimentoOriginContext === 'marketplace_attach'
      ? 'Marketplace / chaveamento'
      : atendimentoOriginContext === 'existing_listing_attach'
        ? 'Anúncio existente'
        : 'Novo atendimento'

  const atendimentoOriginDescription =
    atendimentoOriginContext === 'marketplace_attach'
      ? 'Pipeline iniciado a partir de anúncio do marketplace. Precisa respeitar autorização, vínculo e importação controlada.'
      : atendimentoOriginContext === 'existing_listing_attach'
        ? 'Pipeline acoplado a um anúncio já existente no ambiente profissional. Pode reaproveitar dados do anúncio e do imóvel vinculado.'
        : 'Pipeline iniciado por atendimento direto, secretaria, ligação, WhatsApp, indicação ou captação nova. Precisa priorizar dados da visita.'

  const atendimentoPrimaryInfoTitle =
    atendimentoOriginContext === 'new_intake'
      ? 'Dados da visita e do solicitante'
      : 'Dados do anúncio e da operação vinculada'


  // PIPELINE_STARTED_FLOW_HYDRATION_SAFE_V2
  const [isPipelineStarted, setIsPipelineStarted] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setIsPipelineStarted(params.get('started') === '1')
  }, [])

  // PIPELINE_STARTED_FLOW_HELPERS_V1

  const buildStartedStepHref = (targetStep: string) => {
    const href = buildStepHref(targetStep)
    return href.includes('?') ? `${href}&started=1` : `${href}?started=1`
  }

  
  // PIPELINE_INHERITED_COMPOSITION_FETCH_V1
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const currentListingId = params.get('listingId')
    const currentMode = params.get('mode')

    if (currentMode !== 'attach' || !currentListingId) {
      setListingCompositionContext(null)
      setListingCompositionError(null)
      setListingCompositionLoading(false)
      return
    }

    let active = true

    setListingCompositionLoading(true)
    setListingCompositionError(null)

    getListingCompositionContext(currentListingId)
      .then((response) => {
        if (!active) return

        if (response.error) {
          setListingCompositionContext(null)
          setListingCompositionError(response.error.message || 'Erro ao buscar composição herdada.')
          return
        }

        setListingCompositionContext(response.data)
      })
      .catch((error) => {
        if (!active) return

        setListingCompositionContext(null)
        setListingCompositionError(error?.message || 'Erro inesperado ao buscar composição herdada.')
      })
      .finally(() => {
        if (!active) return
        setListingCompositionLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

// PIPELINE_PREV_NEXT_CONTEXT_V1
  const stepDefinition = getPipelineStepDefinition(stepKey)
  const previousStep = getPreviousPipelineStep(stepKey)
  const nextStep = getNextPipelineStep(stepKey)

  const buildStepHref = (targetStep: string) =>
    buildPipelineStepHref({
      stepKey: targetStep,
      listingId,
      mode,
    })

  // ATTACH_LISTING_REAL_CONTEXT_DERIVED_V1
  const attachedAsset = attachedListing?.property_assets || {}
  const attachedStatus = attachedListing?.listing_status || {}
  const attachedBusinessContext = attachedListing?.property_business_context || {}
  const attachedPortfolioItem = Array.isArray(attachedListing?.portfolio_items)
    ? attachedListing?.portfolio_items?.[0]
    : attachedListing?.portfolio_items

  // ATTACH_ASSESSMENT_REAL_CONTEXT_DERIVED_V1
  const attachedAssessmentMetadata = attachedAssessment?.metadata || {}
  const attachedAssessmentHasClient = Boolean(
    attachedAssessment?.client_entity_id ||
    attachedAssessment?.client_relationship_id
  )
  const attachedAssessmentStatusLabel =
    attachedAssessment?.assessment_status || 'Sem análise formal'

  // ATTACH_CLIENT_REAL_CONTEXT_DERIVED_V1
  const attachedClientName =
    attachedClient?.display_name ||
    attachedClient?.legal_name ||
    'Não informado'

  const attachedClientDocument =
    attachedClient?.document_cpf ||
    attachedClient?.document_cnpj ||
    'Não informado'

  const attachedClientRelationshipStatus =
    attachedClientRelationship?.relationship_status ||
    'Não informado'

  // ATTACH_LISTING_PERMISSION_CONTEXT_DERIVED_V1
  // PIPELINE_PERMISSION_MODE_FROM_SERVICE_V1
  const permissionMode = getPipelinePermissionMode({
    canAccess: listingPermission.can_access,
    canManage: listingPermission.can_manage,
  })

  const permissionModeLabel = permissionMode.label
  const permissionModeColor = permissionMode.color

  const formatMoney = (value: unknown) => {
    if (typeof value !== 'number') return 'Não informado'

    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  return (
    <main
      style={{
        padding: 24,
        maxWidth: 980,
        margin: '0 auto',
        fontFamily: "'Google Sans', 'Product Sans', Inter, Arial, sans-serif",
      }}
    >
      <nav
        style={{
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          borderBottom: '1px solid #dde3ea',
          paddingBottom: 12,
          marginBottom: 24,
        }}
      >
        <Link href="/broker">Broker</Link>
        <Link href="/operations/pipeline">Pipeline Pro</Link>
        <Link href="/operations/properties/list">Listar imoveis</Link>
      </nav>

      {/* PIPELINE_STEP_DEFINITION_FROM_SERVICE_NOTE_V1 */}
      {/*
        ORIENTACAO PARA CODEX / EXECUTORES FUTUROS:
        - A ordem, labels, camadas, prazos e hints do Pipeline Pro devem ser centralizados em pipelineProService.ts.
        - Evitar duplicar listas de etapas diretamente nesta page.
        - Esta page deve consumir service e depois consumir backend real.
      */}

      {/* PIPELINE_STEP_NAVIGATION_RAIL_V1 */}
      {/*
        ORIENTACAO PARA CODEX / EXECUTORES FUTUROS:
        - Esta trilha permite navegar entre as etapas do Pipeline Pro.
        - Nao e lista definitiva de banco.
        - Nao cria persistencia, workflow engine, status real ou bloqueio de etapa.
        - Futuramente deve refletir progresso real, pendencias, bloqueios e permissao de avanço.
        - Codex pode refinar acentuacao, layout, responsividade e microcopy mantendo UTF-8.
      */}
      <section
        style={{
          border: '1px solid #dbe3ea',
          borderRadius: 18,
          padding: 16,
          background: '#fff',
          marginBottom: 20,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <div>
            <strong>Trilha do Pipeline Pro</strong>
            <p style={{ margin: '4px 0 0', color: '#667085', fontSize: 13 }}>
              Navegue entre as camadas do fluxo sem perder o contexto da operação.
            </p>
          </div>

          <Link
            href="/operations/pipeline"
            style={{
              display: 'inline-flex',
              padding: '8px 12px',
              borderRadius: 10,
              border: '1px solid #d7dee8',
              background: '#f8fafc',
              color: '#344054',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            Ver visão geral
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 8,
          }}
        >
          {pipelineStepOrder.map((stepItem) => {
            const definition = getPipelineStepDefinition(stepItem)
            const item = {
              key: definition.key,
              label: definition.shortLabel,
              layer: definition.layerLabel,
            }
            const active = item.key === stepKey

            return (
              <Link
                key={item.key}
                href={listingId && mode === 'attach'
                  ? `/operations/pipeline/${item.key}?listingId=${listingId}&mode=attach`
                  : `/operations/pipeline/${item.key}`
                }
                style={{
                  border: active ? '1px solid #2563eb' : '1px solid #d7dee8',
                  borderRadius: 12,
                  padding: 10,
                  background: active ? '#eff6ff' : '#f8fafc',
                  color: active ? '#1d4ed8' : '#344054',
                  textDecoration: 'none',
                }}
              >
                <strong style={{ display: 'block', fontSize: 13 }}>
                  {item.label}
                </strong>
                <span style={{ fontSize: 12, color: active ? '#1d4ed8' : '#667085' }}>
                  {item.layer}
                </span>
              </Link>
            )
          })}
        </div>
      </section>


      <section
        style={{
          border: '1px solid #dbe3ea',
          borderRadius: 20,
          padding: 24,
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
          Etapa do Pipeline Pro
        </p>

        <h1>{step.title}</h1>

        <p style={{ color: '#5f6b7a', lineHeight: 1.6 }}>
          {step.description}
        </p>
      </section>

      



      {isAttachMode && (
        <section
          style={{
            border: '1px solid #dbe3ea',
            borderRadius: 18,
            padding: 18,
            background: '#fff',
            marginBottom: 20,
          }}
        >
          {/* ATTACH_LISTING_REAL_CONTEXT_PANEL_V1 */}
          {/*
            ORIENTACAO PARA CODEX / EXECUTORES FUTUROS:
            - Este painel apenas lê dados reais do anúncio/listingId.
            - Não salva Pipeline Pro.
            - Não cria Anúncio Placeholder.
            - Não altera listing, asset, cliente, assessment ou portfolio.
            - Futuramente deve carregar proprietário vinculado, mídia, checkup,
              dossiê, progresso real e permissões.
            - Não alterar service/schema/RLS/RPC sem auditoria.
          */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
              alignItems: 'flex-start',
              marginBottom: 14,
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  color: '#667085',
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                  fontWeight: 800,
                }}
              >
                Contexto real do anúncio acoplado
              </p>

              <h2 style={{ marginBottom: 6 }}>
                {attachedListing?.title || 'Anúncio existente'}
              </h2>

              <p style={{ margin: 0, color: '#667085', lineHeight: 1.5 }}>
                {attachedListingStatus || attachedListingError || 'Aguardando leitura do anúncio existente.'}
              </p>
            </div>

            <Link
              href={listingId ? `/operations/properties/${listingId}` : '/operations/properties/list'}
              style={{
                display: 'inline-flex',
                padding: '10px 14px',
                borderRadius: 10,
                border: '1px solid #d7dee8',
                background: '#f8fafc',
                color: '#344054',
                textDecoration: 'none',
                fontWeight: 700,
              }}
            >
              Abrir Checkup / Dossiê
            </Link>
          </div>

          {attachedListingError && (
            <div
              style={{
                border: '1px solid #fecaca',
                borderRadius: 12,
                padding: 12,
                background: '#fef2f2',
                color: '#991b1b',
                marginBottom: 12,
              }}
            >
              {attachedListingError}
            </div>
          )}

          {/* ATTACH_ASSESSMENT_REAL_CONTEXT_PANEL_V1 */}
          {/*
            ORIENTACAO PARA CODEX / EXECUTORES FUTUROS:
            - Este bloco lê a análise/dossiê profissional existente.
            - Não substitui Pipeline Pro.
            - Não grava progresso.
            - Ajuda o modo attach a saber se o anúncio já possui base profissional.
            - Futuramente deve calcular maturidade, módulos preenchidos e pendências reais.
          */}
          <div
            style={{
              border: '1px solid #d7dee8',
              borderRadius: 14,
              padding: 14,
              background: attachedAssessment ? '#f0fdf4' : '#fffbeb',
              marginBottom: 12,
            }}
          >
            <strong>Dossiê / Análise profissional existente</strong>

            <p style={{ margin: '6px 0 12px', color: '#667085', lineHeight: 1.5 }}>
              {attachedAssessmentError ||
                attachedAssessmentStatus ||
                'Verificando se existe análise profissional vinculada ao anúncio.'}
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 10,
              }}
            >
              {[
                {
                  label: 'Status da análise',
                  value: attachedAssessmentStatusLabel,
                },
                {
                  label: 'Cliente vinculado',
                  value: attachedAssessmentHasClient ? 'Sim' : 'Não / pendente',
                },
                {
                  label: 'Assessment ID',
                  value: attachedAssessment?.id || 'Não criado',
                },
                {
                  label: 'Origem',
                  value: attachedAssessmentMetadata?.source || 'Não informado',
                },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    border: '1px solid #d7dee8',
                    borderRadius: 12,
                    padding: 10,
                    background: '#fff',
                  }}
                >
                  <strong style={{ display: 'block', fontSize: 12 }}>
                    {item.label}
                  </strong>
                  <span style={{ color: '#667085', fontSize: 13, wordBreak: 'break-word' }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ATTACH_CLIENT_REAL_CONTEXT_PANEL_V1 */}
          {/*
            ORIENTACAO PARA CODEX / EXECUTORES FUTUROS:
            - Este bloco lê cliente/proprietário vinculado via Core Clients.
            - Não duplica dados pessoais.
            - Não salva relacionamento.
            - Não altera client_entities ou client_relationships.
            - Futuramente deve respeitar permissões, auditoria, LGPD e visibilidade por papel.
          */}
          <div
            style={{
              border: '1px solid #d7dee8',
              borderRadius: 14,
              padding: 14,
              background: attachedClient ? '#eff6ff' : '#f8fafc',
              marginBottom: 12,
            }}
          >
            <strong>Cliente / proprietário vinculado</strong>

            <p style={{ margin: '6px 0 12px', color: '#667085', lineHeight: 1.5 }}>
              {attachedClientError ||
                attachedClientStatus ||
                'Verificando vínculo com Core Clients.'}
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 10,
              }}
            >
              {[
                {
                  label: 'Nome',
                  value: attachedClientName,
                },
                {
                  label: 'Documento',
                  value: attachedClientDocument,
                },
                {
                  label: 'Client ID',
                  value: attachedClient?.id || attachedAssessment?.client_entity_id || 'Não vinculado',
                },
                {
                  label: 'Relacionamento',
                  value: attachedClientRelationshipStatus,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    border: '1px solid #d7dee8',
                    borderRadius: 12,
                    padding: 10,
                    background: '#fff',
                  }}
                >
                  <strong style={{ display: 'block', fontSize: 12 }}>
                    {item.label}
                  </strong>
                  <span style={{ color: '#667085', fontSize: 13, wordBreak: 'break-word' }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
              gap: 10,
            }}
          >
            {[
              {
                label: 'Listing ID',
                value: listingId || 'Não informado',
              },
              {
                label: 'Preço',
                value: formatMoney(attachedListing?.price),
              },
              {
                label: 'Status do anúncio',
                value: attachedStatus?.label || attachedListing?.listing_status_id || 'Não informado',
              },
              {
                label: 'Contexto comercial',
                value: attachedBusinessContext?.label || attachedListing?.property_business_context_id || 'Não informado',
              },
              {
                label: 'Asset ID',
                value: attachedAsset?.id || 'Não informado',
              },
              {
                label: 'Portfolio item',
                value: attachedPortfolioItem?.id || 'Não informado',
              },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  border: '1px solid #d7dee8',
                  borderRadius: 12,
                  padding: 12,
                  background: '#f8fafc',
                }}
              >
                <strong style={{ display: 'block', fontSize: 12 }}>
                  {item.label}
                </strong>
                <span style={{ color: '#667085', fontSize: 13, wordBreak: 'break-word' }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}



      {isAttachMode && (
        <section
          style={{
            border: '1px solid #dbe3ea',
            borderRadius: 18,
            padding: 16,
            background: '#fff',
            marginBottom: 20,
          }}
        >


          {/* PIPELINE_ATTACH_OPERATIONAL_PRECHECK_V1 */}
          {isAttachMode && stepKey === 'atendimento' && attachedListing && (
            <section
              style={{
                border: '1px solid #dbe3ea',
                borderRadius: 18,
                padding: 18,
                background: '#fff',
                marginBottom: 18,
              }}
            >
              {/*
                ORIENTACAO PARA CODEX / EXECUTORES FUTUROS:
                - Este bloco é read-only/foundation.
                - Ele avalia dados mínimos do anúncio real acoplado ao Pipeline Pro.
                - Não cria workflow real.
                - Não salva progresso.
                - Não substitui validação backend/RLS.
                - Futuramente este precheck deverá vir de uma RPC/service próprio do Pipeline Pro.
                - Regras críticas:
                  1) anúncio não é imóvel;
                  2) imóvel é property_asset;
                  3) anúncio é property_listing/ad;
                  4) acoplar Pipeline Pro não transfere ownership;
                  5) usuário só pode agir se tiver permissão real no contexto.
              */}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  flexWrap: 'wrap',
                  alignItems: 'flex-start',
                  marginBottom: 14,
                }}
              >
                <div>
                  <p
                    style={{
                      margin: '0 0 6px',
                      fontSize: 13,
                      color: '#2563eb',
                      textTransform: 'uppercase',
                      letterSpacing: 0.8,
                      fontWeight: 900,
                    }}
                  >
                    Pré-check de acoplagem
                  </p>

                  <h2 style={{ margin: '0 0 6px' }}>
                    Antes de transformar este anúncio em Pipeline Pro
                  </h2>

                  <p
                    style={{
                      margin: 0,
                      color: '#667085',
                      lineHeight: 1.5,
                      maxWidth: 920,
                    }}
                  >
                    Esta leitura confirma se o anúncio possui dados mínimos para iniciar
                    a jornada profissional. A validação definitiva deverá acontecer no
                    backend quando existir workflow real, permissões por módulo e regras
                    de portfolio/agência.
                  </p>
                </div>

                <span
                  style={{
                    display: 'inline-flex',
                    borderRadius: 999,
                    padding: '6px 10px',
                    background: listingPermission.can_manage
                      ? '#16a34a'
                      : listingPermission.can_access
                        ? '#f59e0b'
                        : '#dc2626',
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 900,
                  }}
                >
                  {listingPermission.can_manage
                    ? 'pode gerenciar'
                    : listingPermission.can_access
                      ? 'somente consulta'
                      : 'sem permissão'}
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 10,
                  marginBottom: 14,
                }}
              >
                {[
                  {
                    label: 'Título público',
                    value: attachedListing.title || 'Ausente',
                    ok: Boolean(attachedListing.title),
                    detail: 'property_listings.title',
                  },
                  {
                    label: 'Preço',
                    value:
                      typeof attachedListing.price === 'number'
                        ? attachedListing.price.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })
                        : attachedListing.price
                          ? String(attachedListing.price)
                          : 'Ausente',
                    ok: attachedListing.price !== null && attachedListing.price !== undefined,
                    detail: 'Base mínima para estratégia comercial',
                  },
                  {
                    label: 'Imóvel vinculado',
                    value: attachedListing.property_asset_id ? 'Asset vinculado' : 'Sem asset',
                    ok: Boolean(attachedListing.property_asset_id),
                    detail: 'property_listings.property_asset_id',
                  },
                  {
                    label: 'Visibilidade',
                    value: attachedListing.visibility_scope || 'Não informado',
                    ok: Boolean(attachedListing.visibility_scope),
                    detail: 'private, marketplace ou escopo futuro',
                  },
                  {
                    label: 'Origem',
                    value:
                      attachedListing.metadata?.source ||
                      attachedListing.metadata?.flow ||
                      'Não informado',
                    ok: Boolean(attachedListing.metadata?.source || attachedListing.metadata?.flow),
                    detail: 'metadata.source / metadata.flow',
                  },
                  {
                    label: 'Responsável',
                    value: attachedListing.responsible_profile_id
                      ? 'Responsável definido'
                      : 'Sem responsável',
                    ok: Boolean(attachedListing.responsible_profile_id),
                    detail: 'responsible_profile_id',
                  },
                  {
                    label: 'Criador',
                    value: attachedListing.created_by_profile_id
                      ? 'Criador definido'
                      : 'Sem criador',
                    ok: Boolean(attachedListing.created_by_profile_id),
                    detail: 'created_by_profile_id',
                  },
                  {
                    label: 'Publicação',
                    value: attachedListing.published_at ? 'Publicado' : 'Não publicado',
                    ok: true,
                    detail: 'published_at pode ser nulo em rascunho',
                  },
                ].map((item) => (
                  <article
                    key={item.label}
                    style={{
                      border: '1px solid #d7dee8',
                      borderRadius: 14,
                      padding: 12,
                      background: '#f8fafc',
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-flex',
                        borderRadius: 999,
                        padding: '4px 7px',
                        background: item.ok ? '#16a34a' : '#f59e0b',
                        color: '#fff',
                        fontSize: 11,
                        fontWeight: 900,
                        marginBottom: 8,
                      }}
                    >
                      {item.ok ? 'ok' : 'atenção'}
                    </span>

                    <strong style={{ display: 'block', fontSize: 13 }}>
                      {item.label}
                    </strong>

                    <span
                      style={{
                        display: 'block',
                        color: '#111827',
                        fontSize: 13,
                        marginTop: 4,
                        wordBreak: 'break-word',
                      }}
                    >
                      {item.value}
                    </span>

                    <p
                      style={{
                        margin: '6px 0 0',
                        color: '#667085',
                        fontSize: 12,
                        lineHeight: 1.4,
                      }}
                    >
                      {item.detail}
                    </p>
                  </article>
                ))}
              </div>

              <div
                style={{
                  border: '1px solid #d7dee8',
                  borderRadius: 14,
                  padding: 14,
                  background: '#f8fafc',
                  display: 'grid',
                  gap: 10,
                }}
              >
                <strong>Leitura operacional</strong>

                <p style={{ margin: 0, color: '#667085', lineHeight: 1.5 }}>
                  Este anúncio pode ser tratado como candidato a Pipeline Pro se
                  estiver dentro do contexto permitido do profissional/agência e
                  possuir vínculo com imóvel. Dados ausentes não bloqueiam a foundation,
                  mas devem virar pendências no workflow real.
                </p>

                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                    flexWrap: 'wrap',
                  }}
                >
                  <a
                    href={buildStepHref('levantamento')}
                    style={{
                      display: 'inline-flex',
                      padding: '9px 12px',
                      borderRadius: 10,
                      border: '1px solid #2563eb',
                      background: '#2563eb',
                      color: '#fff',
                      textDecoration: 'none',
                      fontWeight: 800,
                      fontSize: 13,
                    }}
                  >
                    Avançar para levantamento
                  </a>

                  <a
                    href={buildStepHref('diagnostico')}
                    style={{
                      display: 'inline-flex',
                      padding: '9px 12px',
                      borderRadius: 10,
                      border: '1px solid #d7dee8',
                      background: '#fff',
                      color: '#344054',
                      textDecoration: 'none',
                      fontWeight: 800,
                      fontSize: 13,
                    }}
                  >
                    Ir para diagnóstico
                  </a>
                </div>
              </div>
            </section>
          )}

          {/* PIPELINE_ATTACH_IDENTITY_FOUNDATION_V1 */}
          {isAttachMode && stepKey === 'atendimento' && (
            <section
              style={{
                border: '1px solid #dbe3ea',
                borderRadius: 18,
                padding: 18,
                background: '#fff',
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  flexWrap: 'wrap',
                  alignItems: 'flex-start',
                  marginBottom: 14,
                }}
              >
                <div>
                  <p
                    style={{
                      margin: '0 0 6px',
                      fontSize: 13,
                      color: '#2563eb',
                      textTransform: 'uppercase',
                      letterSpacing: 0.8,
                      fontWeight: 900,
                    }}
                  >
                    Identidade operacional
                  </p>

                  <h2 style={{ margin: '0 0 6px' }}>
                    Imóvel e anúncio precisam ser tratados separadamente
                  </h2>

                  <p
                    style={{
                      margin: 0,
                      color: '#667085',
                      lineHeight: 1.5,
                      maxWidth: 920,
                    }}
                  >
                    Este anúncio já existe e está sendo acoplado ao Pipeline Pro.
                    O próximo backend deverá separar o nome interno do imóvel, o
                    nome interno da peça de anúncio, o código do imóvel e o código
                    do anúncio.
                  </p>
                </div>

                <span
                  style={{
                    display: 'inline-flex',
                    borderRadius: 999,
                    padding: '6px 10px',
                    background: '#2563eb',
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 900,
                  }}
                >
                  foundation
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: 12,
                }}
              >
                <article
                  style={{
                    border: '1px solid #d7dee8',
                    borderRadius: 14,
                    padding: 14,
                    background: '#f8fafc',
                  }}
                >
                  <strong style={{ display: 'block', marginBottom: 8 }}>
                    Imóvel / patrimônio
                  </strong>

                  <div style={{ display: 'grid', gap: 8 }}>
                    <div
                      style={{
                        border: '1px solid #d7dee8',
                        borderRadius: 12,
                        padding: 10,
                        background: '#fff',
                      }}
                    >
                      <span style={{ display: 'block', color: '#667085', fontSize: 11 }}>
                        Campo futuro
                      </span>
                      <strong style={{ display: 'block', fontSize: 13, marginTop: 3 }}>
                        property_assets.internal_name
                      </strong>
                      <p style={{ margin: '6px 0 0', color: '#667085', fontSize: 12, lineHeight: 1.4 }}>
                        Exemplo: Florais - Hélio. Nome interno para equipe,
                        carteira, atendimento e Pipeline Pro.
                      </p>
                    </div>

                    <div
                      style={{
                        border: '1px solid #d7dee8',
                        borderRadius: 12,
                        padding: 10,
                        background: '#fff',
                      }}
                    >
                      <span style={{ display: 'block', color: '#667085', fontSize: 11 }}>
                        Código futuro
                      </span>
                      <strong style={{ display: 'block', fontSize: 13, marginTop: 3 }}>
                        property_assets.property_reference_code
                      </strong>
                      <p style={{ margin: '6px 0 0', color: '#667085', fontSize: 12, lineHeight: 1.4 }}>
                        Código do imóvel/patrimônio. Serve para histórico,
                        dossiê, transferência e continuidade operacional.
                      </p>
                    </div>
                  </div>
                </article>

                <article
                  style={{
                    border: '1px solid #d7dee8',
                    borderRadius: 14,
                    padding: 14,
                    background: '#f8fafc',
                  }}
                >
                  <strong style={{ display: 'block', marginBottom: 8 }}>
                    Anúncio / publicação
                  </strong>

                  <div style={{ display: 'grid', gap: 8 }}>
                    <div
                      style={{
                        border: '1px solid #d7dee8',
                        borderRadius: 12,
                        padding: 10,
                        background: '#fff',
                      }}
                    >
                      <span style={{ display: 'block', color: '#667085', fontSize: 11 }}>
                        Título público atual
                      </span>
                      <strong style={{ display: 'block', fontSize: 13, marginTop: 3 }}>
                        {attachedListing?.title || 'Anúncio sem título'}
                      </strong>
                      <p style={{ margin: '6px 0 0', color: '#667085', fontSize: 12, lineHeight: 1.4 }}>
                        Este é o title atual de property_listings, usado como
                        título comercial/publicável.
                      </p>
                    </div>

                    <div
                      style={{
                        border: '1px solid #d7dee8',
                        borderRadius: 12,
                        padding: 10,
                        background: '#fff',
                      }}
                    >
                      <span style={{ display: 'block', color: '#667085', fontSize: 11 }}>
                        Campo futuro
                      </span>
                      <strong style={{ display: 'block', fontSize: 13, marginTop: 3 }}>
                        property_listings.ad_internal_name
                      </strong>
                      <p style={{ margin: '6px 0 0', color: '#667085', fontSize: 12, lineHeight: 1.4 }}>
                        Nome interno da peça de anúncio, campanha, versão,
                        importação ou republicação.
                      </p>
                    </div>

                    <div
                      style={{
                        border: '1px solid #d7dee8',
                        borderRadius: 12,
                        padding: 10,
                        background: '#fff',
                      }}
                    >
                      <span style={{ display: 'block', color: '#667085', fontSize: 11 }}>
                        Código futuro
                      </span>
                      <strong style={{ display: 'block', fontSize: 13, marginTop: 3 }}>
                        property_listings.ad_reference_code
                      </strong>
                      <p style={{ margin: '6px 0 0', color: '#667085', fontSize: 12, lineHeight: 1.4 }}>
                        Código público/operacional do anúncio. Serve para busca,
                        atendimento, importação e compartilhamento autorizado.
                      </p>
                    </div>
                  </div>
                </article>
              </div>
            </section>
          )}

          {/* ATTACH_LISTING_PERMISSION_CONTEXT_PANEL_V1 */}
          {/*
            ORIENTACAO PARA CODEX / EXECUTORES FUTUROS:
            - Este painel mostra permissao real baseada em can_access_listing/can_manage_listing.
            - Nao substitui RLS.
            - Nao salva nada.
            - Nao altera permissao no banco.
            - Futuramente deve controlar edicao por modulo, participante convidado,
              responsavel principal, responsavel por modulo e supervisao da agencia.
            - Se can_manage=false e can_access=true, a tela deve tender a modo consulta.
            - Se can_access=false, futuramente deve bloquear detalhes confidenciais.
          */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <div>
              <strong>Permissão real neste anúncio</strong>
              <p style={{ margin: '4px 0 0', color: '#667085', fontSize: 13, lineHeight: 1.5 }}>
                {listingPermissionError ||
                  listingPermissionStatus ||
                  'Verificando permissão com base nas regras do banco.'}
              </p>
            </div>

            <span
              style={{
                display: 'inline-flex',
                borderRadius: 999,
                padding: '6px 10px',
                background: permissionModeColor,
                color: '#fff',
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              {permissionModeLabel}
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 10,
            }}
          >
            {[
              {
                label: 'Pode acessar',
                value: listingPermission.can_access ? 'Sim' : 'Não',
              },
              {
                label: 'Pode gerenciar',
                value: listingPermission.can_manage ? 'Sim' : 'Não',
              },
              {
                label: 'Modo recomendado',
                value: listingPermission.can_manage
                  ? 'Edição/gestão'
                  : listingPermission.can_access
                    ? 'Consulta supervisionada'
                    : 'Bloqueio futuro',
              },
              {
                label: 'Base da regra',
                value: 'can_access_listing / can_manage_listing',
              },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  border: '1px solid #d7dee8',
                  borderRadius: 12,
                  padding: 10,
                  background: '#f8fafc',
                }}
              >
                <strong style={{ display: 'block', fontSize: 12 }}>
                  {item.label}
                </strong>
                <span style={{ color: '#667085', fontSize: 13, wordBreak: 'break-word' }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {isAttachMode && (
        <section
          style={{
            border: '1px solid #dbe3ea',
            borderRadius: 18,
            padding: 16,
            background: '#fff',
            marginBottom: 20,
          }}
        >
          {/* ATTACH_QUICK_ACTIONS_PANEL_V1 */}
          {/*
            ORIENTACAO PARA CODEX / EXECUTORES FUTUROS:
            - Este painel reúne ações rápidas quando o Pipeline Pro está acoplado
              a um anúncio existente.
            - Não salva nada.
            - Não altera listing, asset, cliente, assessment ou portfolio.
            - Futuramente os botões devem respeitar permissões reais por papel.
            - O botão de Análise Patrimonial ainda aponta para a página legada,
              que deverá ser absorvida/evoluída pelo Pipeline Pro ou Dossiê.
          */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <div>
              <strong>Ações rápidas do anúncio acoplado</strong>
              <p style={{ margin: '4px 0 0', color: '#667085', fontSize: 13, lineHeight: 1.5 }}>
                Use estes atalhos para revisar o anúncio, consultar o dossiê ou
                continuar a evolução profissional sem perder o contexto do Pipeline.
              </p>
            </div>

            <span
              style={{
                display: 'inline-flex',
                borderRadius: 999,
                padding: '5px 10px',
                background: '#2563eb',
                color: '#fff',
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              modo attach
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 10,
              flexWrap: 'wrap',
            }}
          >
            <Link
              href={listingId ? `/operations/properties/${listingId}` : '/operations/properties/list'}
              style={{
                display: 'inline-flex',
                padding: '10px 14px',
                borderRadius: 10,
                border: '1px solid #2563eb',
                background: '#2563eb',
                color: '#fff',
                textDecoration: 'none',
                fontWeight: 800,
              }}
            >
              Abrir Checkup / Dossiê
            </Link>

            <Link
              href={listingId ? `/operations/properties/${listingId}/edit` : '/operations/properties/list'}
              style={{
                display: 'inline-flex',
                padding: '10px 14px',
                borderRadius: 10,
                border: '1px solid #d7dee8',
                background: '#f8fafc',
                color: '#344054',
                textDecoration: 'none',
                fontWeight: 700,
              }}
            >
              Editar anúncio
            </Link>

            <Link
              href={listingId ? `/operations/properties/${listingId}/assessment` : '/operations/properties/list'}
              style={{
                display: 'inline-flex',
                padding: '10px 14px',
                borderRadius: 10,
                border: '1px solid #d7dee8',
                background: '#f8fafc',
                color: '#344054',
                textDecoration: 'none',
                fontWeight: 700,
              }}
            >
              Abrir Análise Patrimonial
            </Link>

            <Link
              href="/operations/properties/list"
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
              Voltar para lista
            </Link>
          </div>
        </section>
      )}

      {/* PIPELINE_STEP_SLA_PROGRESS_PANEL_V1 */}
      {/*
        ORIENTACAO PARA CODEX / EXECUTORES FUTUROS:
        - Este painel e visual/conceitual nesta V1.
        - Futuramente deve usar datas reais: abertura do processo, aceite,
          reagendamento, data/hora da vistoria e SLA por modulo.
        - Prazo do levantamento pode contar a partir da data/hora da vistoria.
        - Modulos podem ser preenchidos fora de ordem.
        - Campos marcados como "nao se aplica" nao devem reduzir progresso.
        - Modulos podem ser encerrados com justificativa quando houver impossibilidade.
        - Inteligencia deve liberar com maturidade minima ou encerramento formal dos essenciais.
      */}
      <section
        style={{
          border: '1px solid #dbe3ea',
          borderRadius: 18,
          padding: 16,
          background: '#fff',
          marginBottom: 20,
        }}
      >
        <h2 style={{ marginTop: 0 }}>Prazo, progresso e conclusão</h2>

        <p style={{ color: '#667085', lineHeight: 1.5 }}>
          Cada módulo deve ter senso de urgência, progresso próprio e possibilidade
          de conclusão mesmo quando algum dado não puder ser levantado, desde que
          exista justificativa.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 12,
          }}
        >
          {[
            {
              title: 'Prazo operacional',
              value:
                stepKey === 'levantamento'
                  ? '12h após vistoria'
                  : stepKey === 'atendimento'
                    ? '24h para movimentar'
                    : stepKey === 'estrategia'
                      ? 'Após maturidade mínima'
                      : 'Prazo por contexto',
              badge: 'SLA',
              color: '#2563eb',
            },
            {
              title: 'Progresso do módulo',
              value:
                stepKey === 'estrategia'
                  ? 'Libera com base mínima'
                  : 'Sobe conforme dados são preenchidos',
              badge: 'Progresso',
              color: '#16a34a',
            },
            {
              title: 'Não se aplica',
              value: 'Itens irrelevantes não devem prejudicar a barra de evolução.',
              badge: 'N/A',
              color: '#7c3aed',
            },
            {
              title: 'Conclusão parcial',
              value: 'Pode encerrar módulo com justificativa quando faltar acesso ou documento.',
              badge: 'Justificar',
              color: '#f59e0b',
            },
          ].map((item) => (
            <article
              key={item.title}
              style={{
                border: '1px solid #d7dee8',
                borderRadius: 14,
                padding: 14,
                background: '#f8fafc',
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  borderRadius: 999,
                  padding: '4px 8px',
                  background: item.color,
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 800,
                  marginBottom: 10,
                }}
              >
                {item.badge}
              </span>

              <strong style={{ display: 'block' }}>{item.title}</strong>

              <p style={{ marginBottom: 0, color: '#667085', fontSize: 13, lineHeight: 1.5 }}>
                {item.value}
              </p>
            </article>
          ))}
        </div>

        <div
          style={{
            border: '1px solid #d7dee8',
            borderRadius: 14,
            padding: 14,
            background: '#f8fafc',
            marginTop: 12,
          }}
        >
          <strong>Critério futuro de liberação da inteligência</strong>

          <p style={{ color: '#667085', lineHeight: 1.5, marginBottom: 0 }}>
            A inteligência estratégica não deve ser acionada por qualquer dado
            superficial. Ela deve depender de maturidade mínima dos módulos
            essenciais, por exemplo 60%, ou encerramento formal com justificativa
            do que não foi possível levantar.
          </p>
        </div>
      </section>

      {/* PIPELINE_MODULE_PERMISSION_PANEL_V1 */}
      {/*
        ORIENTACAO PARA CODEX / EXECUTORES FUTUROS:
        - Este painel representa permissao operacional por modulo.
        - Nesta V1 e apenas visual/conceitual.
        - Futuramente deve vir do backend: usuario logado, papel, agencia,
          responsavel principal, responsavel do modulo, participantes convidados,
          permissao de visualizacao e permissao de edicao.
        - Regra de produto: participantes autorizados podem consultar o processo,
          mas so editam os modulos sob sua responsabilidade.
        - Corretores externos ao processo nao acessam pipeline confidencial.
        - Proprietario nao acessa esta tela interna.
      */}
      <section
        style={{
          border: '1px solid #dbe3ea',
          borderRadius: 18,
          padding: 16,
          background: '#fff',
          marginBottom: 20,
        }}
      >
        <h2 style={{ marginTop: 0 }}>Permissões e responsabilidade do módulo</h2>

        <p style={{ color: '#667085', lineHeight: 1.5 }}>
          Esta etapa pode ter responsável diferente do corretor principal. A regra
          futura deve permitir consulta ampla aos participantes autorizados, mas
          edição apenas para quem recebeu responsabilidade sobre o módulo.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 12,
          }}
        >
          {[
            {
              title: 'Responsável principal',
              value: isAttachMode ? 'Corretor do anúncio existente' : 'Corretor designado',
              badge: 'Conduz',
              color: '#2563eb',
            },
            {
              title: 'Responsável deste módulo',
              value:
                stepKey === 'diagnostico'
                  ? 'Suporte documental / administrativo'
                  : stepKey === 'levantamento'
                    ? 'Corretor / vistoriador'
                    : stepKey === 'estrategia'
                      ? 'Inteligência / coordenação'
                      : stepKey === 'proposta'
                        ? 'Corretor / gestor'
                        : stepKey === 'publicacao'
                          ? 'Responsável do anúncio'
                          : 'Corretor responsável',
              badge: 'Edita',
              color: '#16a34a',
            },
            {
              title: 'Supervisão',
              value: 'Dono, sócio, coordenador ou secretaria autorizada',
              badge: 'Consulta',
              color: '#7c3aed',
            },
            {
              title: 'Edição futura',
              value: 'Somente responsável do módulo ou gestor autorizado',
              badge: 'Restrita',
              color: '#f59e0b',
            },
          ].map((item) => (
            <article
              key={item.title}
              style={{
                border: '1px solid #d7dee8',
                borderRadius: 14,
                padding: 14,
                background: '#f8fafc',
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  borderRadius: 999,
                  padding: '4px 8px',
                  background: item.color,
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 800,
                  marginBottom: 10,
                }}
              >
                {item.badge}
              </span>

              <strong style={{ display: 'block' }}>{item.title}</strong>

              <p style={{ marginBottom: 0, color: '#667085', fontSize: 13, lineHeight: 1.5 }}>
                {item.value}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* PIPELINE_OPERATION_CONTEXT_PANEL_V1 */}
      {/*
        ORIENTACAO PARA CODEX / EXECUTORES FUTUROS:
        - Este painel mostra o contexto operacional da etapa.
        - Por enquanto e apenas visual.
        - Futuramente deve carregar dados reais do anuncio/listingId, cliente, responsavel, status, progresso e pendencias.
        - Nao conectar backend sem revisar services, schema, RLS e contrato de dados.
        - Codex pode corrigir acentuacao e refinar microcopy mantendo UTF-8.
      */}
      <section
        style={{
          border: '1px solid #dbe3ea',
          borderRadius: 18,
          padding: 16,
          background: '#fff',
          marginBottom: 20,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 12,
          }}
        >
          <div
            style={{
              border: '1px solid #d7dee8',
              borderRadius: 14,
              padding: 14,
              background: '#f8fafc',
            }}
          >
            <strong>Contexto da jornada</strong>
            <p style={{ marginBottom: 0, color: '#667085', fontSize: 13, lineHeight: 1.5 }}>
              {isAttachMode
                ? 'Pipeline Pro acoplado a um anúncio existente.'
                : 'Nova jornada para iniciar um Anúncio Placeholder.'}
            </p>
          </div>

          <div
            style={{
              border: '1px solid #d7dee8',
              borderRadius: 14,
              padding: 14,
              background: '#f8fafc',
            }}
          >
            <strong>Origem</strong>
            <p style={{ marginBottom: 0, color: '#667085', fontSize: 13, lineHeight: 1.5 }}>
              {isAttachMode
                ? `Anúncio existente: ${listingId}`
                : 'Captação nova ainda sem anúncio público final.'}
            </p>
          </div>

          <div
            style={{
              border: '1px solid #d7dee8',
              borderRadius: 14,
              padding: 14,
              background: '#f8fafc',
            }}
          >
            <strong>Função desta tela</strong>
            <p style={{ marginBottom: 0, color: '#667085', fontSize: 13, lineHeight: 1.5 }}>
              Organizar a etapa atual sem gravar dados reais nesta V1 visual.
            </p>
          </div>

          <div
            style={{
              border: '1px solid #d7dee8',
              borderRadius: 14,
              padding: 14,
              background: '#f8fafc',
            }}
          >
            <strong>Próximo estágio futuro</strong>
            <p style={{ marginBottom: 0, color: '#667085', fontSize: 13, lineHeight: 1.5 }}>
              Conectar esta jornada ao backend, progresso real, Dossiê e publicação.
            </p>
          </div>
        </div>
      </section>


      {isAttachMode && (
        <section
          style={{
            border: '1px solid #2563eb',
            borderRadius: 18,
            padding: 18,
            background: '#eff6ff',
            marginBottom: 20,
          }}
        >
          {/* ATTACH_EXISTING_LISTING_BANNER_V1 */}
          {/*
            ORIENTACAO PARA CODEX / EXECUTORES FUTUROS:
            - Este modo representa acoplagem do Pipeline Pro a um anuncio existente.
            - Nao deve criar uma captacao do zero.
            - Deve reaproveitar os dados preliminares do anuncio/listingId.
            - Futuramente carregar listing, asset, cliente vinculado, fotos, preco e dados publicaveis.
            - Nao implementar persistencia sem revisar service/schema/RLS/RPC.
            - Codex pode corrigir acentuacao mantendo UTF-8.
          */}
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: '#1d4ed8',
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              fontWeight: 800,
            }}
          >
            Acoplando Pipeline Pro a anúncio existente
          </p>

          <h2 style={{ marginBottom: 8 }}>
            Este fluxo não começa do zero
          </h2>

          <p style={{ color: '#475467', lineHeight: 1.5, marginBottom: 10 }}>
            O anúncio já possui dados preliminares. A função desta jornada é
            profissionalizar a operação: revisar qualidade, complementar
            levantamento, gerar diagnóstico, inteligência, proposta e publicação
            parametrizada.
          </p>

          <div
            style={{
              display: 'inline-flex',
              border: '1px solid #bfdbfe',
              borderRadius: 999,
              padding: '6px 10px',
              background: '#fff',
              color: '#1d4ed8',
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            listingId: {listingId}
          </div>
        </section>
      )}

      {stepKey === 'atendimento' && (
        <section
          style={{
            border: '1px solid #d7dee8',
            borderRadius: 18,
            padding: 20,
            background: '#fff',
            marginBottom: 20,
          }}
        >
          {/* ATENDIMENTO_CAPTURE_FORM_PREVIEW_V1 */}
          <h2 style={{ marginTop: 0 }}>Registro rápido da captação</h2>

          <p style={{ color: '#667085', lineHeight: 1.5 }}>
            Esta área representa a entrada rápida do Anúncio Placeholder. Na versão
            conectada, estes dados devem criar ou atualizar a captação profissional.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 12,
              marginTop: 16,
            }}
          >
            {[
              { label: 'Nome interno', placeholder: 'Ex.: Florais - Helio' },
              { label: 'Nome do proprietario', placeholder: 'Ex.: Helio' },
              { label: 'Telefone', placeholder: 'Ex.: (65) 99999-9999' },
              { label: 'Origem do contato', placeholder: 'Ligacao, WhatsApp, indicacao...' },
              { label: 'Condominio / bairro', placeholder: 'Ex.: Florais da Mata' },
              { label: 'Tipo preliminar', placeholder: 'Casa em condominio' },
              { label: 'Data da visita', placeholder: 'Ex.: 18/05' },
              { label: 'Horario', placeholder: 'Ex.: 15:00' },
            ].map((field) => (
              <label
                key={field.label}
                style={{
                  display: 'grid',
                  gap: 6,
                  fontSize: 13,
                  color: '#344054',
                }}
              >
                <strong>{field.label}</strong>
                <input
                  disabled
                  placeholder={field.placeholder}
                  style={{
                    border: '1px solid #d7dee8',
                    borderRadius: 10,
                    padding: '10px 12px',
                    background: '#f8fafc',
                    color: '#667085',
                  }}
                />
              </label>
            ))}
          </div>

          <label
            style={{
              display: 'grid',
              gap: 6,
              fontSize: 13,
              color: '#344054',
              marginTop: 12,
            }}
          >
            <strong>Observação inicial</strong>
            <textarea
              disabled
              placeholder="Ex.: Proprietario quer vender casa em condominio para levantar recurso para familia. Visita combinada para amanha."
              rows={4}
              style={{
                border: '1px solid #d7dee8',
                borderRadius: 10,
                padding: '10px 12px',
                background: '#f8fafc',
                color: '#667085',
                resize: 'vertical',
              }}
            />
          </label>

          <div
            style={{
              display: 'flex',
              gap: 10,
              flexWrap: 'wrap',
              marginTop: 16,
            }}
          >
            <button
              disabled
              style={{
                border: '1px solid #2563eb',
                borderRadius: 10,
                padding: '10px 14px',
                background: '#2563eb',
                color: '#fff',
                opacity: 0.65,
                cursor: 'not-allowed',
              }}
            >
              Futuro: criar Anuncio Placeholder
            </button>

            <button
              disabled
              style={{
                border: '1px solid #d7dee8',
                borderRadius: 10,
                padding: '10px 14px',
                background: '#fff',
                color: '#667085',
                cursor: 'not-allowed',
              }}
            >
              Futuro: agendar atendimento
            </button>
          </div>
        </section>
      )}

      {stepKey === 'levantamento' && (
        <section
          style={{
            border: '1px solid #d7dee8',
            borderRadius: 18,
            padding: 20,
            background: '#fff',
            marginBottom: 20,
          }}
        >
          {/* LEVANTAMENTO_PROPERTY_SURVEY_PREVIEW_V1 */}
          <h2 style={{ marginTop: 0 }}>Levantamento do patrimonio</h2>

          <p style={{ color: '#667085', lineHeight: 1.5 }}>
            Esta etapa organiza a vistoria do imovel por tipo e subtipo. O objetivo
            nao e preencher ficha solta, mas transformar a visita em leitura
            profissional, evidencias e base para a inteligencia estrategica.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 12,
              marginTop: 16,
            }}
          >
            {[
              {
                title: 'Tipo e subtipo',
                progress: 20,
                items: [
                  'Casa de rua',
                  'Casa em condominio',
                  'Apartamento',
                  'Terreno',
                  'Comercial',
                  'Rural',
                ],
              },
              {
                title: 'Composicao do imovel',
                progress: 10,
                items: [
                  'Quartos e suites',
                  'Banheiros',
                  'Vagas',
                  'Cozinha e areas',
                  'Piscina',
                  'Pavimentos',
                ],
              },
              {
                title: 'Acabamento e padrao',
                progress: 0,
                items: [
                  'Laje / forro',
                  'Porcelanato / ceramica',
                  'Esquadrias',
                  'Bancadas',
                  'Marcenaria',
                  'Padrao: popular a luxo',
                ],
              },
              {
                title: 'Condominio e estrutura',
                progress: 0,
                items: [
                  'Portaria',
                  'Seguranca',
                  'Lazer',
                  'Ruas',
                  'Taxa',
                  'Padrao do condominio',
                ],
              },
              {
                title: 'Fotos e evidencias',
                progress: 0,
                items: [
                  'Fachada',
                  'Ambientes',
                  'Area externa',
                  'Condominio',
                  'Avarias',
                  'Documentos futuros',
                ],
              },
              {
                title: 'Percepcao profissional',
                progress: 0,
                items: [
                  'Pontos fortes',
                  'Pontos fracos',
                  'Riscos aparentes',
                  'Oportunidade',
                  'Classificacao geral',
                  'Nota subjetiva',
                ],
              },
            ].map((block) => (
              <article
                key={block.title}
                style={{
                  border: '1px solid #d7dee8',
                  borderRadius: 14,
                  padding: 14,
                  background: '#f8fafc',
                }}
              >
                <strong>{block.title}</strong>

                <div
                  style={{
                    height: 9,
                    borderRadius: 999,
                    background: '#e5eaf0',
                    overflow: 'hidden',
                    marginTop: 10,
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      width: `${block.progress}%`,
                      height: '100%',
                      background: '#2563eb',
                    }}
                  />
                </div>

                <ul
                  style={{
                    margin: 0,
                    paddingLeft: 18,
                    color: '#667085',
                    fontSize: 13,
                    lineHeight: 1.5,
                  }}
                >
                  {block.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <div
            style={{
              border: '1px solid #d7dee8',
              borderRadius: 14,
              padding: 14,
              background: '#fff',
              marginTop: 16,
            }}
          >
            <strong>Resultado esperado desta etapa</strong>

            <p style={{ color: '#667085', lineHeight: 1.5, marginBottom: 0 }}>
              Ao concluir o levantamento, o sistema deve ter base suficiente para
              alimentar diagnostico, riscos, pesquisa de mercado, pontuacao do
              patrimonio e pipeline de inteligencia.
            </p>
          </div>
        </section>
      )}

      {stepKey === 'diagnostico' && (
        <section
          style={{
            border: '1px solid #d7dee8',
            borderRadius: 18,
            padding: 20,
            background: '#fff',
            marginBottom: 20,
          }}
        >
          {/* DIAGNOSTICO_RISK_PREVIEW_V1 */}
          <h2 style={{ marginTop: 0 }}>Diagnostico, risco e contexto comercial</h2>

          <p style={{ color: '#667085', lineHeight: 1.5 }}>
            Esta etapa organiza os dados que explicam o risco, a viabilidade e a
            oportunidade do negocio. Ela prepara a base para o pipeline de
            inteligencia, sem ainda decidir a estrategia final.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 12,
              marginTop: 16,
            }}
          >
            {[
              {
                title: 'Perfil do proprietario',
                progress: 0,
                items: [
                  'Motivo da venda',
                  'Urgencia',
                  'Flexibilidade',
                  'Apego emocional',
                  'Resistencia a preco',
                  'Quem decide',
                ],
              },
              {
                title: 'Financeiro e IPTU',
                progress: 0,
                items: [
                  'Valor pedido',
                  'Valor minimo',
                  'IPTU',
                  'Valor venal declarado no IPTU',
                  'Condominio',
                  'Saldo devedor',
                ],
              },
              {
                title: 'Documentacao',
                progress: 0,
                items: [
                  'Matricula',
                  'Averbacao',
                  'Habite-se',
                  'IPTU quitado',
                  'Condominio em dia',
                  'Pendencias',
                ],
              },
              {
                title: 'Risco operacional',
                progress: 0,
                items: [
                  'Preco fora da realidade',
                  'Documento pendente',
                  'Proprietario inflexivel',
                  'Imovel com avarias',
                  'Baixa liquidez',
                  'Risco juridico',
                ],
              },
              {
                title: 'Pesquisa de mercado',
                progress: 0,
                items: [
                  'Comparaveis',
                  'Preco por metro',
                  'Estoque concorrente',
                  'Tempo anunciado',
                  'Liquidez da regiao',
                  'Faixa recomendada',
                ],
              },
              {
                title: 'Oportunidades',
                progress: 0,
                items: [
                  'Familia',
                  'Investimento',
                  'Locacao',
                  'Temporada',
                  'Alto padrao',
                  'Preco competitivo',
                ],
              },
            ].map((block) => (
              <article
                key={block.title}
                style={{
                  border: '1px solid #d7dee8',
                  borderRadius: 14,
                  padding: 14,
                  background: '#f8fafc',
                }}
              >
                <strong>{block.title}</strong>

                <div
                  style={{
                    height: 9,
                    borderRadius: 999,
                    background: '#e5eaf0',
                    overflow: 'hidden',
                    marginTop: 10,
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      width: `${block.progress}%`,
                      height: '100%',
                      background: '#2563eb',
                    }}
                  />
                </div>

                <ul
                  style={{
                    margin: 0,
                    paddingLeft: 18,
                    color: '#667085',
                    fontSize: 13,
                    lineHeight: 1.5,
                  }}
                >
                  {block.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <div
            style={{
              border: '1px solid #d7dee8',
              borderRadius: 14,
              padding: 14,
              background: '#fff',
              marginTop: 16,
            }}
          >
            <strong>Resultado esperado desta etapa</strong>

            <p style={{ color: '#667085', lineHeight: 1.5, marginBottom: 0 }}>
              Ao concluir o diagnostico, o sistema deve ter insumos para calcular
              risco, maturidade comercial, oportunidade, perfil de negociacao e
              alimentar o pipeline de inteligencia.
            </p>
          </div>
        </section>
      )}

      {stepKey === 'estrategia' && (
        <section
          style={{
            border: '1px solid #2563eb',
            borderRadius: 18,
            padding: 20,
            background: '#eff6ff',
            marginBottom: 20,
          }}
        >
          {/* INTELLIGENCE_STRATEGY_PREVIEW_V1 */}
          <h2 style={{ marginTop: 0 }}>Inteligencia estrategica</h2>

          <p style={{ color: '#475467', lineHeight: 1.5 }}>
            Esta camada nao coleta dados brutos. Ela interpreta o que os pipelines
            operacionais entregaram e transforma isso em decisao profissional:
            preco, posicionamento, distribuicao, proposta e publicacao.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 12,
              marginTop: 16,
            }}
          >
            {[
              {
                title: 'Leitura consolidada',
                progress: 0,
                items: [
                  'Qualidade fisica',
                  'Padrao construtivo',
                  'Localizacao',
                  'Risco documental',
                  'Perfil do proprietario',
                  'Liquidez',
                ],
              },
              {
                title: 'Pontuacao do patrimonio',
                progress: 0,
                items: [
                  'Maturidade da analise',
                  'Nota por subtipo',
                  'Nota equalizada',
                  'Nota estrategica',
                  'Risco comercial',
                  'Atratividade operacional',
                ],
              },
              {
                title: 'Decisao de preco',
                progress: 0,
                items: [
                  'Preco pedido',
                  'Preco recomendado',
                  'Preco inicial publico',
                  'Minimo aceitavel',
                  'Desconto programado',
                  'Alerta de preco irreal',
                ],
              },
              {
                title: 'Posicionamento',
                progress: 0,
                items: [
                  'Familia',
                  'Alto padrao',
                  'Investimento',
                  'Temporada',
                  'Oportunidade',
                  'Pronto para morar',
                ],
              },
              {
                title: 'Distribuicao',
                progress: 0,
                items: [
                  'Marketplace',
                  'Pagina profissional',
                  'Redes sociais',
                  'Rede de parceiros',
                  'Campanha paga',
                  'Publicacao discreta',
                ],
              },
              {
                title: 'Recomendacao profissional',
                progress: 0,
                items: [
                  'Argumento ao proprietario',
                  'Estrategia de negociacao',
                  'Narrativa do anuncio',
                  'Pontos fortes',
                  'Pontos de atencao',
                  'Proxima decisao',
                ],
              },
            ].map((block) => (
              <article
                key={block.title}
                style={{
                  border: '1px solid #bfdbfe',
                  borderRadius: 14,
                  padding: 14,
                  background: '#fff',
                }}
              >
                <strong>{block.title}</strong>

                <div
                  style={{
                    height: 9,
                    borderRadius: 999,
                    background: '#dbeafe',
                    overflow: 'hidden',
                    marginTop: 10,
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      width: `${block.progress}%`,
                      height: '100%',
                      background: '#2563eb',
                    }}
                  />
                </div>

                <ul
                  style={{
                    margin: 0,
                    paddingLeft: 18,
                    color: '#475467',
                    fontSize: 13,
                    lineHeight: 1.5,
                  }}
                >
                  {block.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <div
            style={{
              border: '1px solid #bfdbfe',
              borderRadius: 14,
              padding: 14,
              background: '#fff',
              marginTop: 16,
            }}
          >
            <strong>Resultado esperado desta camada</strong>

            <p style={{ color: '#475467', lineHeight: 1.5, marginBottom: 0 }}>
              Ao concluir a inteligencia estrategica, o sistema deve produzir
              uma recomendacao profissional clara para proposta ao proprietario
              e para a futura publicacao parametrizada do anuncio.
            </p>
          </div>
        </section>
      )}

      {stepKey === 'publicacao' && (
        <section
          style={{
            border: '1px solid #16a34a',
            borderRadius: 18,
            padding: 20,
            background: '#f0fdf4',
            marginBottom: 20,
          }}
        >
          {/* PUBLICATION_DISTRIBUTABLE_AD_PREVIEW_V1 */}
          <h2 style={{ marginTop: 0 }}>Publicacao / Anuncio distribuivel</h2>

          <p style={{ color: '#475467', lineHeight: 1.5 }}>
            Esta camada materializa a estrategia aprovada em anuncio profissional.
            Aqui o foco nao e analisar o imovel, mas montar, parametrizar e preparar
            a distribuicao do anuncio nos canais definidos.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 12,
              marginTop: 16,
            }}
          >
            {[
              {
                title: 'Identidade publica do anuncio',
                progress: 0,
                items: [
                  'Titulo publico',
                  'Descricao profissional',
                  'Resumo curto',
                  'Destaques principais',
                  'Tags publicas',
                  'Splashes permitidos',
                ],
              },
              {
                title: 'Midia e apresentacao',
                progress: 0,
                items: [
                  'Foto de capa',
                  'Galeria publica',
                  'Fotos tecnicas ocultas',
                  'Ordem das fotos',
                  'Legenda futura',
                  'Video futuro',
                ],
              },
              {
                title: 'Preco e condicoes publicas',
                progress: 0,
                items: [
                  'Preco aprovado',
                  'Condominio',
                  'IPTU',
                  'Aceita financiamento',
                  'Aceita proposta',
                  'Condicoes publicaveis',
                ],
              },
              {
                title: 'Canais de distribuicao',
                progress: 0,
                items: [
                  'Marketplace',
                  'Pagina do corretor',
                  'Pagina da agencia',
                  'Redes sociais',
                  'Rede de parceiros',
                  'Portais externos futuros',
                ],
              },
              {
                title: 'Parametros profissionais ocultos',
                progress: 0,
                items: [
                  'Preco minimo interno',
                  'Margem de negociacao',
                  'Responsavel',
                  'Origem da captacao',
                  'Estrategia ativa',
                  'Restricoes de visibilidade',
                ],
              },
              {
                title: 'Status de publicacao',
                progress: 0,
                items: [
                  'Placeholder',
                  'Rascunho',
                  'Pronto para publicar',
                  'Publicado',
                  'Pausado',
                  'Encerrado',
                ],
              },
            ].map((block) => (
              <article
                key={block.title}
                style={{
                  border: '1px solid #bbf7d0',
                  borderRadius: 14,
                  padding: 14,
                  background: '#fff',
                }}
              >
                <strong>{block.title}</strong>

                <div
                  style={{
                    height: 9,
                    borderRadius: 999,
                    background: '#dcfce7',
                    overflow: 'hidden',
                    marginTop: 10,
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      width: `${block.progress}%`,
                      height: '100%',
                      background: '#16a34a',
                    }}
                  />
                </div>

                <ul
                  style={{
                    margin: 0,
                    paddingLeft: 18,
                    color: '#475467',
                    fontSize: 13,
                    lineHeight: 1.5,
                  }}
                >
                  {block.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <div
            style={{
              border: '1px solid #bbf7d0',
              borderRadius: 14,
              padding: 14,
              background: '#fff',
              marginTop: 16,
            }}
          >
            <strong>Resultado esperado desta camada</strong>

            <p style={{ color: '#475467', lineHeight: 1.5, marginBottom: 0 }}>
              Ao concluir a publicacao, o anuncio deixa de ser apenas um
              placeholder ou rascunho e passa a estar pronto para distribuicao,
              respeitando a estrategia aprovada e ocultando informacoes sensiveis.
            </p>
          </div>
        </section>
      )}

      {stepKey === 'proposta' && (
        <section
          style={{
            border: '1px solid #f59e0b',
            borderRadius: 18,
            padding: 20,
            background: '#fffbeb',
            marginBottom: 20,
          }}
        >
          {/* PROPOSAL_APPROVAL_PREVIEW_V1 */}
          <h2 style={{ marginTop: 0 }}>Proposta e aprovacao</h2>

          <p style={{ color: '#475467', lineHeight: 1.5 }}>
            Esta etapa transforma a recomendacao profissional em proposta
            apresentavel ao proprietario. Aqui entram aprovacao interna, ajustes,
            aceite, recusa e preparacao futura para contrato.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 12,
              marginTop: 16,
            }}
          >
            {[
              {
                title: 'Resumo executivo',
                progress: 0,
                items: [
                  'Diagnostico resumido',
                  'Pontos fortes',
                  'Pontos de atencao',
                  'Oportunidade identificada',
                  'Risco principal',
                  'Recomendacao final',
                ],
              },
              {
                title: 'Preco e condicao recomendada',
                progress: 0,
                items: [
                  'Preco recomendado',
                  'Preco inicial publico',
                  'Minimo aceitavel',
                  'Margem de negociacao',
                  'Desconto programado',
                  'Condicoes negociaveis',
                ],
              },
              {
                title: 'Plano de comercializacao',
                progress: 0,
                items: [
                  'Posicionamento',
                  'Publico-alvo',
                  'Canais sugeridos',
                  'Campanha',
                  'Rede de parceiros',
                  'Formato do anuncio',
                ],
              },
              {
                title: 'Aprovacao interna',
                progress: 0,
                items: [
                  'Corretor responsavel',
                  'Agencia/coordenacao',
                  'Especialista convidado',
                  'Aprovado',
                  'Devolvido para ajuste',
                  'Comentario de revisao',
                ],
              },
              {
                title: 'Retorno do proprietario',
                progress: 0,
                items: [
                  'Proposta enviada',
                  'Proprietario aprovou',
                  'Proprietario recusou',
                  'Pediu ajuste',
                  'Aceitou com ressalvas',
                  'Aguardando resposta',
                ],
              },
              {
                title: 'Acoplagem futura com contrato',
                progress: 0,
                items: [
                  'Autorizacao de venda',
                  'Exclusividade',
                  'Nao exclusividade',
                  'Intermediacao',
                  'Administracao futura',
                  'Contrato como core separado',
                ],
              },
            ].map((block) => (
              <article
                key={block.title}
                style={{
                  border: '1px solid #fde68a',
                  borderRadius: 14,
                  padding: 14,
                  background: '#fff',
                }}
              >
                <strong>{block.title}</strong>

                <div
                  style={{
                    height: 9,
                    borderRadius: 999,
                    background: '#fef3c7',
                    overflow: 'hidden',
                    marginTop: 10,
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      width: `${block.progress}%`,
                      height: '100%',
                      background: '#f59e0b',
                    }}
                  />
                </div>

                <ul
                  style={{
                    margin: 0,
                    paddingLeft: 18,
                    color: '#475467',
                    fontSize: 13,
                    lineHeight: 1.5,
                  }}
                >
                  {block.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <div
            style={{
              border: '1px solid #fde68a',
              borderRadius: 14,
              padding: 14,
              background: '#fff',
              marginTop: 16,
            }}
          >
            <strong>Resultado esperado desta etapa</strong>

            <p style={{ color: '#475467', lineHeight: 1.5, marginBottom: 0 }}>
              Ao concluir esta etapa, a estrategia profissional fica validada
              para seguir para publicacao parametrizada ou volta para ajuste caso
              proprietario/agencia nao aprove.
            </p>
          </div>
        </section>
      )}

      {stepKey === 'acompanhamento' && (
        <section
          style={{
            border: '1px solid #7c3aed',
            borderRadius: 18,
            padding: 20,
            background: '#f5f3ff',
            marginBottom: 20,
          }}
        >
          {/* FOLLOWUP_LIFECYCLE_PREVIEW_V1 */}
          {/* 
            ORIENTACAO PARA CODEX / PROXIMOS EXECUTORES:
            - Esta etapa nao deve virar Core Leads agora.
            - Esta etapa nao deve virar Comunicador agora.
            - Esta etapa nao deve virar Contratos agora.
            - Aqui ficam apenas pontos de acoplagem futura.
            - O objetivo e mostrar que o anuncio publicado tera continuidade operacional.
            - Futuramente integrar com leads, visitas, propostas, mensagens, contratos, encerramento e dossie.
            - Codex pode corrigir acentuacao e portugues diretamente no arquivo, mantendo UTF-8.
            - Nao alterar schema, services, RPC, RLS ou migrations nesta tela sem auditoria.
          */}
          <h2 style={{ marginTop: 0 }}>Acompanhamento e lifecycle</h2>

          <p style={{ color: '#475467', lineHeight: 1.5 }}>
            Esta camada representa o que acontece depois da publicacao. O anuncio
            deixa de ser apenas uma peca publicada e passa a ser acompanhado como
            uma operacao viva: leads, visitas, propostas, ajustes, decisao final e
            historico no Dossie.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 12,
              marginTop: 16,
            }}
          >
            {[
              {
                title: 'Leads futuros',
                progress: 0,
                items: [
                  'Contatos recebidos',
                  'Origem do lead',
                  'Interesse declarado',
                  'Qualificacao futura',
                  'Desbloqueio futuro',
                  'Core Leads separado',
                ],
              },
              {
                title: 'Visitas e atendimentos',
                progress: 0,
                items: [
                  'Visita agendada',
                  'Visita realizada',
                  'Feedback do interessado',
                  'Objeções',
                  'Retorno pendente',
                  'Proxima acao',
                ],
              },
              {
                title: 'Propostas recebidas',
                progress: 0,
                items: [
                  'Valor ofertado',
                  'Condição de pagamento',
                  'Permuta',
                  'Financiamento',
                  'Contraproposta',
                  'Status da negociação',
                ],
              },
              {
                title: 'Ajustes do anúncio',
                progress: 0,
                items: [
                  'Ajuste de preço',
                  'Troca de foto',
                  'Nova descrição',
                  'Mudança de destaque',
                  'Reforço de campanha',
                  'Revisão de estratégia',
                ],
              },
              {
                title: 'Contratos e formalização futura',
                progress: 0,
                items: [
                  'Autorização',
                  'Intermediação',
                  'Exclusividade',
                  'Compra e venda',
                  'Locação',
                  'Core Contratos separado',
                ],
              },
              {
                title: 'Encerramento',
                progress: 0,
                items: [
                  'Vendido',
                  'Alugado',
                  'Pausado',
                  'Arquivado',
                  'Perdido',
                  'Retirado do ar',
                ],
              },
              {
                title: 'Dossie e memoria operacional',
                progress: 0,
                items: [
                  'Historico de decisões',
                  'Mudanças de preço',
                  'Propostas',
                  'Eventos importantes',
                  'Notas privadas',
                  'Lifecycle preservado',
                ],
              },
              {
                title: 'Governança futura',
                progress: 0,
                items: [
                  'Denúncias',
                  'Auditoria',
                  'Rastreabilidade',
                  'Retenção',
                  'LGPD',
                  'Proteção jurídica',
                ],
              },
            ].map((block) => (
              <article
                key={block.title}
                style={{
                  border: '1px solid #ddd6fe',
                  borderRadius: 14,
                  padding: 14,
                  background: '#fff',
                }}
              >
                <strong>{block.title}</strong>

                <div
                  style={{
                    height: 9,
                    borderRadius: 999,
                    background: '#ede9fe',
                    overflow: 'hidden',
                    marginTop: 10,
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      width: `${block.progress}%`,
                      height: '100%',
                      background: '#7c3aed',
                    }}
                  />
                </div>

                <ul
                  style={{
                    margin: 0,
                    paddingLeft: 18,
                    color: '#475467',
                    fontSize: 13,
                    lineHeight: 1.5,
                  }}
                >
                  {block.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <div
            style={{
              border: '1px solid #ddd6fe',
              borderRadius: 14,
              padding: 14,
              background: '#fff',
              marginTop: 16,
            }}
          >
            <strong>Resultado esperado desta camada</strong>

            <p style={{ color: '#475467', lineHeight: 1.5, marginBottom: 0 }}>
              Ao concluir o lifecycle, o sistema deve preservar a memoria
              operacional do imovel, permitindo entender o que foi publicado,
              ajustado, negociado, recusado, vendido, alugado, arquivado ou
              encerrado.
            </p>
          </div>
        </section>
      )}

      <section
        style={{
          border: '1px solid #d7dee8',
          borderRadius: 18,
          padding: 20,
          background: '#fff',
        }}
      >
        <h2 style={{ marginTop: 0 }}>Checklist operacional da etapa</h2>

        <p style={{ color: '#667085', lineHeight: 1.5 }}>
          Nesta V1, este checklist e orientativo. Na proxima evolucao, cada item
          podera abrir perguntas, providencias, documentos, aprovacoes ou acoes.
        </p>

        <div style={{ display: 'grid', gap: 10 }}>
          {step.items.map((item: string, index: number) => (
            <div
              key={item}
              style={{
                border: '1px solid #d7dee8',
                borderRadius: 12,
                padding: 12,
                background: '#f8fafc',
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                gap: 10,
                alignItems: 'start',
              }}
            >
              <span
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 999,
                  display: 'inline-grid',
                  placeItems: 'center',
                  background: '#2563eb',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                {index + 1}
              </span>

              <div>
                <strong>{item}</strong>
                <p style={{ marginBottom: 0, color: '#667085', fontSize: 13 }}>
                  {stepKey === 'levantamento' ? 'Item executável detalhado abaixo.' : 'Futuro item executavel do pipeline.'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* PIPELINE_ATENDIMENTO_ORIGIN_PANEL_V1 */}
      {stepKey === 'atendimento' && (
        <section
          style={{
            border: '1px solid #dbe3ea',
            borderRadius: 18,
            padding: 18,
            background: '#fff',
            marginBottom: 18,
          }}
        >
          {/*
            ORIENTACAO:
            A tela de Atendimento deve se moldar conforme origem:
            - new_intake: novo atendimento/secretaria/ligação/WhatsApp.
            - existing_listing_attach: anúncio profissional já existente.
            - marketplace_attach: anúncio do marketplace/chaveamento/importação.
            Essa origem define o que aparece primeiro e quais dados são críticos.
          */}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
              alignItems: 'flex-start',
            }}
          >
            <div>
              <p
                style={{
                  margin: '0 0 6px',
                  fontSize: 13,
                  color: '#2563eb',
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                  fontWeight: 900,
                }}
              >
                Origem do Pipeline
              </p>

              <h2 style={{ margin: '0 0 6px' }}>
                {atendimentoOriginLabel}
              </h2>

              <p
                style={{
                  margin: 0,
                  color: '#667085',
                  lineHeight: 1.5,
                  maxWidth: 940,
                }}
              >
                {atendimentoOriginDescription}
              </p>
            </div>

            <span
              style={{
                display: 'inline-flex',
                borderRadius: 999,
                padding: '6px 10px',
                background:
                  atendimentoOriginContext === 'marketplace_attach'
                    ? '#7c3aed'
                    : atendimentoOriginContext === 'existing_listing_attach'
                      ? '#2563eb'
                      : '#16a34a',
                color: '#fff',
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              {atendimentoOriginContext}
            </span>
          </div>
        </section>
      )}

      {/* PIPELINE_ATENDIMENTO_ASSIGNMENT_DECISION_V2 */}
      {stepKey === 'atendimento' && (
        <section
          style={{
            border: '1px solid #dbe3ea',
            borderRadius: 18,
            padding: 18,
            background: '#fff',
            marginBottom: 18,
          }}
        >
          {/*
            ORIENTACAO PARA CODEX / EXECUTORES FUTUROS:
            - Este painel representa a tarefa recebida pelo corretor/responsável.
            - Antes de aceitar/recusar, o profissional precisa ver:
              cliente/proprietário, contato, local, data, dia da semana e horário.
            - Sem isso, não há decisão operacional possível.
            - "Marcar como iniciado" só deve ser usado quando o profissional chegou
              ao local ou iniciou formalmente a vistoria/levantamento.
            - No backend futuro:
              accepted_at / declined_at / rescheduled_at / started_at
              devem virar eventos auditáveis do workflow.
            - Se o Pipeline nasceu de anúncio existente, o pré-check do anúncio
              fica como bloco secundário, não como centro da decisão.
          */}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
              alignItems: 'flex-start',
              marginBottom: 14,
            }}
          >
            <div>
              <p
                style={{
                  margin: '0 0 6px',
                  fontSize: 13,
                  color: '#2563eb',
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                  fontWeight: 900,
                }}
              >
                Tarefa recebida
              </p>

              <h2 style={{ margin: '0 0 6px' }}>
                Avaliar atendimento antes de assumir a captação
              </h2>

              <p
                style={{
                  margin: 0,
                  color: '#667085',
                  lineHeight: 1.5,
                  maxWidth: 940,
                }}
              >
                O corretor precisa enxergar os dados mínimos da visita para decidir
                se aceita, recusa ou propõe novo horário. Depois que chegar ao local,
                marca como iniciado para liberar o levantamento/análise patrimonial.
              </p>
            </div>

            <span
              style={{
                display: 'inline-flex',
                borderRadius: 999,
                padding: '6px 10px',
                background: '#f59e0b',
                color: '#fff',
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              aguardando decisão
            </span>
          </div>


          {/* PIPELINE_ATENDIMENTO_CONTEXTUAL_REQUIREMENTS_NOTE_V1 */}
          {atendimentoOriginContext === 'new_intake' && (
            <div
              style={{
                border: '1px solid #f59e0b',
                borderRadius: 14,
                padding: 14,
                background: '#fffbeb',
                marginBottom: 14,
              }}
            >
              <strong style={{ display: 'block', marginBottom: 6 }}>
                Dados obrigatórios para decisão do corretor
              </strong>
              <p style={{ margin: 0, color: '#667085', fontSize: 13, lineHeight: 1.5 }}>
                Em novo atendimento, o responsável só consegue decidir se aceita,
                recusa ou propõe novo horário se enxergar cliente/proprietário,
                contato, endereço/local do imóvel, data, dia da semana e horário.
              </p>
            </div>
          )}

          {atendimentoOriginContext !== 'new_intake' && (
            <div
              style={{
                border: '1px solid #d7dee8',
                borderRadius: 14,
                padding: 14,
                background: '#f8fafc',
                marginBottom: 14,
              }}
            >
              <strong style={{ display: 'block', marginBottom: 6 }}>
                Dados aproveitados do anúncio existente
              </strong>
              <p style={{ margin: 0, color: '#667085', fontSize: 13, lineHeight: 1.5 }}>
                Como este Pipeline nasceu de anúncio existente, a tela pode reaproveitar
                título, asset, preço, origem, visibilidade e dados já cadastrados.
                Mesmo assim, cliente/proprietário, autorização e local da visita ainda
                precisam ser validados quando a operação avançar.
              </p>
            </div>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
              gap: 10,
              marginBottom: 14,
            }}
          >
            {[
              {
                label: atendimentoOriginContext === 'new_intake' ? 'Identificação interna' : 'Anúncio vinculado',
                value: atendimentoOriginContext === 'new_intake' ? 'Florais - Hélio' : attachedListing?.title || 'Anúncio vinculado sem título',
                detail: atendimentoOriginContext === 'new_intake' ? 'Nome operacional da captação/imóvel. Não é título público do anúncio.' : 'Título atual do anúncio já existente. O nome interno do imóvel deve ficar separado.',
              },
              {
                label: 'Cliente / proprietário',
                value: attachedClient?.full_name || attachedClient?.name || 'Hélio',
                detail: 'Pessoa que solicitou avaliação, captação ou atendimento.',
              },
              {
                label: 'Contato',
                value: attachedClient?.phone || attachedClient?.mobile_phone || '(00) 00000-0000',
                detail: 'Telefone/WhatsApp para confirmação ou reagendamento.',
              },
              {
                label: 'Local do imóvel',
                value: 'Endereço do imóvel a ser analisado',
                detail: 'Rua, condomínio, bairro, cidade e referência de chegada.',
              },
              {
                label: 'Data da visita',
                value: 'A definir / data agendada',
                detail: 'No backend futuro: scheduled_visit_at.',
              },
              {
                label: 'Dia e horário',
                value: 'Dia da semana - horário combinado',
                detail: 'Informação crítica para aceitar, recusar ou propor novo horário.',
              },
              {
                label: 'Origem',
                value: isAttachMode ? 'Anúncio existente / modo attach' : 'Atendimento / secretaria / ligação',
                detail: 'Origem operacional da demanda.',
              },
              {
                label: 'Prazo operacional',
                value: 'Contador inicia ao marcar como iniciado',
                detail: 'O SLA de levantamento deve contar a partir da vistoria/início formal.',
              },
            ].map((item) => (
              <article
                key={item.label}
                style={{
                  border: '1px solid #d7dee8',
                  borderRadius: 14,
                  padding: 12,
                  background: '#f8fafc',
                }}
              >
                <span style={{ display: 'block', color: '#667085', fontSize: 11 }}>
                  {item.label}
                </span>

                <strong
                  style={{
                    display: 'block',
                    fontSize: 13,
                    marginTop: 4,
                    wordBreak: 'break-word',
                  }}
                >
                  {item.value}
                </strong>

                <p
                  style={{
                    margin: '6px 0 0',
                    color: '#667085',
                    fontSize: 12,
                    lineHeight: 1.4,
                  }}
                >
                  {item.detail}
                </p>
              </article>
            ))}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 10,
              marginBottom: 14,
            }}
          >
            {[
              {
                label: 'Aceitar atendimento',
                detail: 'Assume a captação e mantém o horário combinado.',
                color: '#16a34a',
              },
              {
                label: 'Recusar',
                detail: 'Não assume a tarefa. Futuramente redistribui para outro responsável.',
                color: '#dc2626',
              },
              {
                label: 'Propor novo horário',
                detail: 'Solicita reagendamento e recalcula o prazo operacional.',
                color: '#7c3aed',
              },
              {
                label: 'Marcar como iniciado',
                detail: 'Usar somente ao chegar no local ou iniciar formalmente a vistoria. Libera o levantamento patrimonial.',
                color: '#2563eb',
              },
            ].map((action) => (
              <article
                key={action.label}
                style={{
                  border: '1px solid #d7dee8',
                  borderRadius: 14,
                  padding: 14,
                  background: '#f8fafc',
                }}
              >
                <button
                  type="button"
                  style={{
                    width: '100%',
                    border: '1px solid ' + action.color,
                    borderRadius: 10,
                    padding: '10px 12px',
                    background: action.color,
                    color: '#fff',
                    fontWeight: 900,
                    cursor: 'default',
                    textAlign: 'center',
                  }}
                >
                  {action.label}
                </button>

                <p
                  style={{
                    margin: '10px 0 0',
                    color: '#667085',
                    fontSize: 13,
                    lineHeight: 1.5,
                  }}
                >
                  {action.detail}
                </p>
              </article>
            ))}
          </div>

          {isAttachMode && attachedListing && (
            <details
              style={{
                border: '1px solid #d7dee8',
                borderRadius: 14,
                padding: 14,
                background: '#f8fafc',
              }}
            >
              {/* PIPELINE_ATTACH_PRECHECK_SECONDARY_V2 | PIPELINE_ATENDIMENTO_CONTEXTUAL_ORIGIN_RULES_V1 */}
              <summary
                style={{
                  cursor: 'pointer',
                  fontWeight: 900,
                  color: '#111827',
                }}
              >
                Ver pré-check do anúncio já vinculado
              </summary>

              <p style={{ color: '#667085', fontSize: 13, lineHeight: 1.5 }}>
                Este bloco só faz sentido quando o Pipeline nasce de anúncio existente,
                importado, chaveado ou profissionalizado. Ele não substitui os dados
                da tarefa/agendamento.
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: 8,
                }}
              >
                {[
                  {
                    label: 'Título do anúncio',
                    value: attachedListing.title || 'Ausente',
                    ok: Boolean(attachedListing.title),
                  },
                  {
                    label: 'Preço',
                    value:
                      attachedListing.price !== null && attachedListing.price !== undefined
                        ? String(attachedListing.price)
                        : 'Ausente',
                    ok: attachedListing.price !== null && attachedListing.price !== undefined,
                  },
                  {
                    label: 'Asset',
                    value: attachedListing.property_asset_id ? 'Vinculado' : 'Ausente',
                    ok: Boolean(attachedListing.property_asset_id),
                  },
                  {
                    label: 'Responsável',
                    value: attachedListing.responsible_profile_id ? 'Definido' : 'Ausente',
                    ok: Boolean(attachedListing.responsible_profile_id),
                  },
                  {
                    label: 'Origem',
                    value:
                      attachedListing.metadata?.source ||
                      attachedListing.metadata?.flow ||
                      'Não informado',
                    ok: Boolean(attachedListing.metadata?.source || attachedListing.metadata?.flow),
                  },
                  {
                    label: 'Publicação',
                    value: attachedListing.published_at ? 'Publicado' : 'Não publicado',
                    ok: true,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      border: '1px solid #d7dee8',
                      borderRadius: 12,
                      padding: 10,
                      background: '#fff',
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-flex',
                        borderRadius: 999,
                        padding: '3px 7px',
                        background: item.ok ? '#16a34a' : '#f59e0b',
                        color: '#fff',
                        fontSize: 11,
                        fontWeight: 900,
                        marginBottom: 7,
                      }}
                    >
                      {item.ok ? 'ok' : 'atenção'}
                    </span>

                    <strong style={{ display: 'block', fontSize: 12 }}>
                      {item.label}
                    </strong>

                    <span
                      style={{
                        display: 'block',
                        color: '#667085',
                        fontSize: 12,
                        marginTop: 4,
                        wordBreak: 'break-word',
                      }}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </details>
          )}
        </section>
      )}


          {/* PIPELINE_ATENDIMENTO_START_TO_LEVANTAMENTO_CTA_V1 */}
          {stepKey === 'atendimento' && (
            <section
              style={{
                border: '1px solid #2563eb',
                borderRadius: 18,
                padding: 18,
                background: '#eff6ff',
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  flexWrap: 'wrap',
                  alignItems: 'center',
                }}
              >
                <div>
                  <strong style={{ display: 'block', fontSize: 16 }}>
                    Chegou no local ou iniciou formalmente o atendimento?
                  </strong>

                  <p style={{ margin: '6px 0 0', color: '#667085', lineHeight: 1.5 }}>
                    Ao marcar como iniciado, o sistema libera a etapa de levantamento
                    patrimonial. No backend futuro, este clique deverá gravar started_at,
                    abrir o SLA do levantamento e gerar evento auditável.
                  </p>
                </div>

                <a
                  href={buildStartedStepHref('levantamento')}
                  style={{
                    display: 'inline-flex',
                    padding: '11px 14px',
                    borderRadius: 10,
                    border: '1px solid #2563eb',
                    background: '#2563eb',
                    color: '#fff',
                    textDecoration: 'none',
                    fontWeight: 900,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Marcar como iniciado
                </a>
              </div>
            </section>
          )}

      {/* PIPELINE_ATENDIMENTO_OPERATIONAL_INTAKE_V1 */}
      {stepKey === 'atendimento' && (
        <section
          style={{
            border: '1px solid #dbe3ea',
            borderRadius: 18,
            padding: 18,
            background: '#fff',
            marginBottom: 18,
          }}
        >
          {/*
            ORIENTACAO PARA CODEX / EXECUTORES FUTUROS:
            - Este bloco estrutura a abertura operacional do Pipeline Pro.
            - Ainda não salva no banco.
            - No backend futuro, estes dados devem virar workflow real:
              property_pipeline_workflows + modules + participants + tasks + events.
            - O atendimento é a entrada formal da captação.
            - Aqui nasce: nome interno, responsável, origem, agendamento, prazo e contexto.
            - Não confundir com anúncio público.
            - Título público do anúncio nasce depois, na camada de estratégia/publicação.
          */}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
              alignItems: 'flex-start',
              marginBottom: 16,
            }}
          >
            <div>
              <p
                style={{
                  margin: '0 0 6px',
                  fontSize: 13,
                  color: '#2563eb',
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                  fontWeight: 900,
                }}
              >
                Atendimento operacional
              </p>

              <h2 style={{ margin: '0 0 6px' }}>
                Abertura formal do Pipeline Pro
              </h2>

              <p
                style={{
                  margin: 0,
                  color: '#667085',
                  lineHeight: 1.5,
                  maxWidth: 940,
                }}
              >
                Esta etapa registra a entrada da oportunidade. É aqui que o sistema
                identifica o imóvel/captação, define responsável, origem, prazo inicial,
                agendamento e próximos passos. Ainda não é o anúncio final.
              </p>
            </div>

            <span
              style={{
                display: 'inline-flex',
                borderRadius: 999,
                padding: '6px 10px',
                background: '#2563eb',
                color: '#fff',
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              etapa inicial
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 12,
              marginBottom: 14,
            }}
          >
            {[
              {
                title: '1. Identificação interna',
                badge: 'imóvel',
                color: '#2563eb',
                description:
                  'Nome operacional da captação/imóvel. Exemplo: Florais - Hélio. Não é título público do anúncio.',
                futureFields:
                  'property_assets.internal_name / property_assets.property_reference_code',
              },
              {
                title: '2. Origem da oportunidade',
                badge: 'origem',
                color: '#7c3aed',
                description:
                  'Define se veio de ligação, WhatsApp, indicação, marketplace, captação direta, agência ou campanha.',
                futureFields:
                  'workflow_origin / operational_origin_id / metadata controlado',
              },
              {
                title: '3. Responsável principal',
                badge: 'owner',
                color: '#16a34a',
                description:
                  'Corretor definido pelo atendimento, rodízio interno, captação direta ou responsável atribuído pela agência.',
                futureFields:
                  'main_responsible_profile_id / responsible_organization_id',
              },
              {
                title: '4. Agendamento e prazo',
                badge: 'sla',
                color: '#f59e0b',
                description:
                  'A vistoria/agendamento dispara prazos. A partir dela o fluxo ganha urgência e contador operacional.',
                futureFields:
                  'scheduled_visit_at / started_at / due_at',
              },
              {
                title: '5. Aceite ou recusa',
                badge: 'decisão',
                color: '#dc2626',
                description:
                  'Responsável pode aceitar, recusar ou propor novo horário. Isso precisa gerar evento e histórico.',
                futureFields:
                  'accepted_at / declined_at / rescheduled_at / events',
              },
              {
                title: '6. Próxima etapa',
                badge: 'fluxo',
                color: '#475467',
                description:
                  'Depois do atendimento, o processo segue para levantamento patrimonial, fotos, entorno e evidências.',
                futureFields:
                  'property_pipeline_modules / module_status / tasks',
              },
            ].map((item) => (
              <article
                key={item.title}
                style={{
                  border: '1px solid #d7dee8',
                  borderRadius: 14,
                  padding: 14,
                  background: '#f8fafc',
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    borderRadius: 999,
                    padding: '4px 8px',
                    background: item.color,
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 900,
                    marginBottom: 10,
                  }}
                >
                  {item.badge}
                </span>

                <strong style={{ display: 'block', fontSize: 14 }}>
                  {item.title}
                </strong>

                <p
                  style={{
                    margin: '7px 0 10px',
                    color: '#667085',
                    fontSize: 13,
                    lineHeight: 1.5,
                  }}
                >
                  {item.description}
                </p>

                <div
                  style={{
                    border: '1px solid #d7dee8',
                    borderRadius: 10,
                    padding: 9,
                    background: '#fff',
                  }}
                >
                  <span style={{ display: 'block', color: '#667085', fontSize: 11 }}>
                    Backend futuro
                  </span>
                  <strong
                    style={{
                      display: 'block',
                      fontSize: 12,
                      marginTop: 3,
                      wordBreak: 'break-word',
                    }}
                  >
                    {item.futureFields}
                  </strong>
                </div>
              </article>
            ))}
          </div>

          <div
            style={{
              border: '1px solid #d7dee8',
              borderRadius: 14,
              padding: 14,
              background: '#f8fafc',
              display: 'grid',
              gap: 10,
            }}
          >
            <strong>Leitura de produto</strong>

            <p style={{ margin: 0, color: '#667085', lineHeight: 1.5 }}>
              O atendimento é a porta de entrada do processo. Ele não precisa ter
              todos os dados do imóvel. Precisa apenas criar contexto suficiente
              para a equipe saber quem é o responsável, qual é a origem, qual imóvel
              está sendo trabalhado, qual prazo está correndo e qual próxima etapa
              deve ser executada.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 10,
              }}
            >
              <div
                style={{
                  border: '1px solid #d7dee8',
                  borderRadius: 12,
                  padding: 10,
                  background: '#fff',
                }}
              >
                <strong style={{ display: 'block', fontSize: 13 }}>
                  Se começou do zero
                </strong>
                <p style={{ margin: '6px 0 0', color: '#667085', fontSize: 12, lineHeight: 1.4 }}>
                  Cria primeiro o contexto operacional do imóvel/captação e depois
                  evolui para anúncio.
                </p>
              </div>

              <div
                style={{
                  border: '1px solid #d7dee8',
                  borderRadius: 12,
                  padding: 10,
                  background: '#fff',
                }}
              >
                <strong style={{ display: 'block', fontSize: 13 }}>
                  Se veio de anúncio existente
                </strong>
                <p style={{ margin: '6px 0 0', color: '#667085', fontSize: 12, lineHeight: 1.4 }}>
                  O Pipeline começa mais avançado, aproveitando dados do anúncio
                  e do property_asset já vinculado.
                </p>
              </div>

              <div
                style={{
                  border: '1px solid #d7dee8',
                  borderRadius: 12,
                  padding: 10,
                  background: '#fff',
                }}
              >
                <strong style={{ display: 'block', fontSize: 13 }}>
                  Se veio do marketplace
                </strong>
                <p style={{ margin: '6px 0 0', color: '#667085', fontSize: 12, lineHeight: 1.4 }}>
                  Precisa autorização/vínculo antes de virar operação profissional,
                  preservando ownership, LGPD e segurança.
                </p>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                gap: 8,
                flexWrap: 'wrap',
              }}
            >
              <a
                href={buildStepHref('levantamento')}
                style={{
                  display: 'inline-flex',
                  padding: '9px 12px',
                  borderRadius: 10,
                  border: '1px solid #2563eb',
                  background: '#2563eb',
                  color: '#fff',
                  textDecoration: 'none',
                  fontWeight: 800,
                  fontSize: 13,
                }}
              >
                Ir para levantamento
              </a>

              <a
                href="/operations/pipeline"
                style={{
                  display: 'inline-flex',
                  padding: '9px 12px',
                  borderRadius: 10,
                  border: '1px solid #d7dee8',
                  background: '#fff',
                  color: '#344054',
                  textDecoration: 'none',
                  fontWeight: 800,
                  fontSize: 13,
                }}
              >
                Voltar para central
              </a>
            </div>
          </div>
        </section>
      )}




      {/* PIPELINE_LEVANTAMENTO_EXECUTABLE_CHECKLIST_V1 */}
      {stepKey === 'levantamento' && isPipelineStarted && (
        <section
          style={{
            border: '1px solid #dbe3ea',
            borderRadius: 18,
            padding: 18,
            background: '#fff',
            marginBottom: 18,
          }}
        >
          {/*
            ORIENTACAO PARA CODEX / EXECUTORES FUTUROS:
            - Este é o modelo correto do Levantamento: checklist executável.
            - Cada item do checklist contém perguntas reais.
            - Progresso e nota futura devem nascer por item, não por bloco solto.
            - Se o Pipeline veio de anúncio existente, composição/localização/fotos devem ser herdadas do anúncio/property_asset e revisadas pelo profissional.
            - Se veio de novo atendimento, os mesmos campos precisam ser preenchidos durante vistoria.
            - Futuramente:
              1) carregar dados herdados;
              2) permitir confirmar/corrigir/complementar;
              3) salvar autosave por item;
              4) calcular progresso;
              5) calcular nota/maturidade;
              6) liberar inteligência com base em maturidade mínima.
          */}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
              alignItems: 'flex-start',
              marginBottom: 14,
            }}
          >
            <div>
              <p
                style={{
                  margin: '0 0 6px',
                  fontSize: 13,
                  color: '#2563eb',
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                  fontWeight: 900,
                }}
              >
                Checklist executável do Levantamento
              </p>

              <h2 style={{ margin: '0 0 6px' }}>
                Perguntas reais dentro de cada passo da vistoria
              </h2>

              <p
                style={{
                  margin: 0,
                  color: '#667085',
                  lineHeight: 1.5,
                  maxWidth: 980,
                }}
              >
                Este bloco substitui a lógica de fichário solto. O corretor executa
                o levantamento por passos. Cada passo tem perguntas, status, progresso
                e futura nota parcial. Dados já existentes do anúncio devem ser herdados
                e conferidos, não redigitados.
              </p>
            </div>

            <span
              style={{
                display: 'inline-flex',
                borderRadius: 999,
                padding: '6px 10px',
                background: '#2563eb',
                color: '#fff',
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              checklist v1
            </span>
          </div>

          <div style={{ display: 'grid', gap: 14 }}>
            <article
              style={{
                border: '1px solid #d7dee8',
                borderRadius: 16,
                padding: 14,
                background: '#f8fafc',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
                <div>
                  <span style={{ display: 'inline-flex', borderRadius: 999, padding: '4px 8px', background: '#2563eb', color: '#fff', fontSize: 11, fontWeight: 900, marginBottom: 8 }}>
                    1 / Tipo e subtipo
                  </span>
                  <h3 style={{ margin: 0 }}>Selecionar tipo e subtipo do imóvel</h3>
                </div>
                <strong style={{ color: '#f59e0b' }}>Progresso: 0%</strong>
              </div>

              <p style={{ margin: '0 0 12px', color: '#667085', lineHeight: 1.5 }}>
                Este passo define quais perguntas aparecem depois. Casa de rua, casa em condomínio,
                apartamento antigo, moderno, conceitual, terreno, comercial e rural não devem seguir
                o mesmo roteiro.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800 }}>
                  Tipo principal
                  <select name="checklist_property_type" defaultValue="" style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff' }}>
                    <option value="">Selecionar</option>
                    <option value="street_house">Casa de rua</option>
                    <option value="condominium_house">Casa em condomínio</option>
                    <option value="apartment">Apartamento</option>
                    <option value="land">Terreno / lote</option>
                    <option value="commercial">Comercial</option>
                    <option value="rural">Rural</option>
                  </select>
                </label>

                <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800 }}>
                  Subtipo / perfil
                  <select name="checklist_property_subtype" defaultValue="" style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff' }}>
                    <option value="">Selecionar</option>
                    <option value="traditional">Tradicional / antigo</option>
                    <option value="modern">Moderno</option>
                    <option value="conceptual">Conceitual / serviços</option>
                    <option value="popular">Popular</option>
                    <option value="high_standard">Alto padrão</option>
                    <option value="luxury">Luxo</option>
                  </select>
                </label>

                <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800 }}>
                  Potencial principal
                  <select name="checklist_primary_potential" defaultValue="" style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff' }}>
                    <option value="">Selecionar</option>
                    <option value="family">Moradia familiar</option>
                    <option value="investment">Investimento</option>
                    <option value="rental">Locação tradicional</option>
                    <option value="short_term">Airbnb / temporada</option>
                    <option value="commercial">Uso comercial</option>
                    <option value="elderly">Idoso / acessibilidade</option>
                    <option value="pcd">PCD / necessidades especiais</option>
                  </select>
                </label>

                <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800 }}>
                  Proprietário aceita explorar esse potencial?
                  <select name="checklist_owner_accepts_potential" defaultValue="" style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff' }}>
                    <option value="">Selecionar</option>
                    <option value="yes">Sim</option>
                    <option value="maybe">Talvez / depende da proposta</option>
                    <option value="no">Não</option>
                    <option value="unknown">Ainda não perguntado</option>
                  </select>
                </label>
              </div>
            </article>

            <article
              style={{
                border: '1px solid #d7dee8',
                borderRadius: 16,
                padding: 14,
                background: '#f8fafc',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
                <div>
                  <span style={{ display: 'inline-flex', borderRadius: 999, padding: '4px 8px', background: '#16a34a', color: '#fff', fontSize: 11, fontWeight: 900, marginBottom: 8 }}>
                    2 / Composição
                  </span>
                  <h3 style={{ margin: 0 }}>Preencher ou conferir composição do imóvel</h3>
                </div>
                <strong style={{ color: '#f59e0b' }}>Progresso: 0%</strong>
              </div>

              <p style={{ margin: '0 0 12px', color: '#667085', lineHeight: 1.5 }}>
                Se este Pipeline veio de anúncio existente, os dados de composição devem ser herdados do
                anúncio/property_asset e apenas conferidos. Se veio de novo atendimento, devem ser preenchidos
                na vistoria.
              </p>

              {isAttachMode && attachedListing?.property_asset_id && (
                <div style={{ border: '1px solid #bbf7d0', borderRadius: 14, padding: 12, background: '#f0fdf4', marginBottom: 12 }}>
                  <strong style={{ display: 'block', marginBottom: 6 }}>Dados herdados do anúncio/imóvel vinculado</strong>
                  <p style={{ margin: 0, color: '#667085', fontSize: 13, lineHeight: 1.5 }}>
                    Este anúncio já possui property_asset vinculado. No backend real, quartos, suítes, banheiros,
                    vagas, áreas, andar, posição solar e demais características devem carregar automaticamente
                    para conferência do profissional.
                  </p>
                </div>
              )}


              {/* PIPELINE_INHERITED_COMPOSITION_PANEL_V1 */}
              {isAttachMode && (
                <div
                  style={{
                    border: '1px solid #bbf7d0',
                    borderRadius: 14,
                    padding: 12,
                    background: '#f0fdf4',
                    marginBottom: 12,
                  }}
                >
                  <strong style={{ display: 'block', marginBottom: 6 }}>
                    Composição herdada do anúncio/property_asset
                  </strong>

                  {listingCompositionLoading && (
                    <p style={{ margin: 0, color: '#667085', fontSize: 13 }}>
                      Buscando dados herdados do anúncio...
                    </p>
                  )}

                  {!listingCompositionLoading && listingCompositionError && (
                    <p style={{ margin: 0, color: '#dc2626', fontSize: 13 }}>
                      {listingCompositionError}
                    </p>
                  )}

                  {!listingCompositionLoading && !listingCompositionError && !listingCompositionContext?.features && (
                    <p style={{ margin: 0, color: '#667085', fontSize: 13 }}>
                      Nenhum registro encontrado em property_asset_features para este anúncio.
                    </p>
                  )}

                  {!listingCompositionLoading && listingCompositionContext?.features && (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                        gap: 8,
                        marginTop: 10,
                      }}
                    >
                      {[
                        ['Quartos', listingCompositionContext.features.bedrooms],
                        ['Suítes', listingCompositionContext.features.suites],
                        ['Banheiros', listingCompositionContext.features.bathrooms],
                        ['Vagas', listingCompositionContext.features.garage_spaces],
                        ['Área privativa', listingCompositionContext.features.private_area],
                        ['Área total', listingCompositionContext.features.total_area],
                        ['Andar', listingCompositionContext.features.floor_number],
                        ['Total andares', listingCompositionContext.features.total_floors],
                        ['Ano construção', listingCompositionContext.features.built_year],
                        ['Elevador', listingCompositionContext.features.has_elevator === true ? 'Sim' : listingCompositionContext.features.has_elevator === false ? 'Não' : null],
                        ['Mobiliado', listingCompositionContext.features.is_furnished === true || listingCompositionContext.features.furnished === true ? 'Sim' : listingCompositionContext.features.is_furnished === false || listingCompositionContext.features.furnished === false ? 'Não' : null],
                        ['Posição solar', listingCompositionContext.features.sun_position],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          style={{
                            border: '1px solid #bbf7d0',
                            borderRadius: 10,
                            padding: 9,
                            background: '#fff',
                          }}
                        >
                          <span style={{ display: 'block', color: '#667085', fontSize: 11 }}>
                            {label}
                          </span>
                          <strong style={{ display: 'block', fontSize: 13, marginTop: 3 }}>
                            {formatInheritedCompositionValue(value)}
                          </strong>
                        </div>
                      ))}
                    </div>
                  )}

                  <p style={{ margin: '10px 0 0', color: '#667085', fontSize: 12, lineHeight: 1.4 }}>
                    Regra operacional: dados herdados não são verdade absoluta. O profissional deve conferir,
                    corrigir divergências e complementar o que estiver ausente.
                  </p>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
                {[
                  ['Quartos', 'checklist_bedrooms'],
                  ['Suítes', 'checklist_suites'],
                  ['Banheiros', 'checklist_bathrooms'],
                  ['Vagas', 'checklist_garage_spaces'],
                  ['Área privativa', 'checklist_private_area'],
                  ['Área total', 'checklist_total_area'],
                  ['Andar', 'checklist_floor_number'],
                  ['Ano construção', 'checklist_built_year'],
                ].map(([label, name]) => (
                  <label key={name} style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800 }}>
                    {label}
                    <input name={name} placeholder={isAttachMode ? 'Herdar/conferir' : 'Preencher'} style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff' }} />
                  </label>
                ))}

                <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800, gridColumn: '1 / -1' }}>
                  Correções ou complementos da composição
                  <textarea name="checklist_composition_notes" rows={3} placeholder="Use para corrigir dado herdado, registrar divergência ou complementar informação coletada na vistoria." style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff', resize: 'vertical' }} />
                </label>
              </div>
            </article>

            <article style={{ border: '1px solid #d7dee8', borderRadius: 16, padding: 14, background: '#f8fafc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
                <div>
                  <span style={{ display: 'inline-flex', borderRadius: 999, padding: '4px 8px', background: '#7c3aed', color: '#fff', fontSize: 11, fontWeight: 900, marginBottom: 8 }}>
                    3 / Acabamento e padrão
                  </span>
                  <h3 style={{ margin: 0 }}>Classificar acabamento e padrão construtivo</h3>
                </div>
                <strong style={{ color: '#f59e0b' }}>Progresso: 0%</strong>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                {[
                  { label: 'Padrão construtivo', name: 'checklist_construction_standard', options: ['Popular', 'Médio baixo', 'Médio', 'Médio elevado', 'Alto padrão', 'Luxo', 'Não avaliado'] },
                  { label: 'Acabamento', name: 'checklist_finishing_quality', options: ['Simples', 'Bom', 'Muito bom', 'Premium', 'Precisa revisão'] },
                  { label: 'Conservação geral', name: 'checklist_conservation', options: ['Boa', 'Regular', 'Precisa revisão', 'Crítica', 'Não avaliado'] },
                  { label: 'Risco estrutural aparente', name: 'checklist_structural_risk', options: ['Baixo', 'Médio', 'Alto', 'Precisa especialista', 'Não avaliado'] },
                  { label: 'Umidade / infiltração', name: 'checklist_humidity_risk', options: ['Não identificado', 'Baixo', 'Médio', 'Alto', 'Precisa revisar'] },
                  { label: 'Elétrica / hidráulica aparente', name: 'checklist_systems_condition', options: ['Boa', 'Regular', 'Precisa revisão', 'Crítica', 'Não avaliado'] },
                ].map((field) => (
                  <label key={field.name} style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800 }}>
                    {field.label}
                    <select name={field.name} defaultValue="" style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff' }}>
                      <option value="">Selecionar</option>
                      {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </label>
                ))}
              </div>
            </article>

            <article style={{ border: '1px solid #d7dee8', borderRadius: 16, padding: 14, background: '#f8fafc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
                <div>
                  <span style={{ display: 'inline-flex', borderRadius: 999, padding: '4px 8px', background: '#475467', color: '#fff', fontSize: 11, fontWeight: 900, marginBottom: 8 }}>
                    4 / Condomínio e infraestrutura
                  </span>
                  <h3 style={{ margin: 0 }}>Registrar condomínio, infraestrutura e regras</h3>
                </div>
                <strong style={{ color: '#f59e0b' }}>Progresso: 0%</strong>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                {[
                  { label: 'Existe condomínio?', name: 'checklist_has_condominium', options: ['Sim', 'Não', 'Não se aplica', 'Não avaliado'] },
                  { label: 'Nível de infraestrutura', name: 'checklist_infrastructure_level', options: ['Básica', 'Boa', 'Completa', 'Premium', 'Não avaliada'] },
                  { label: 'Regras para Airbnb/temporada', name: 'checklist_short_term_rules', options: ['Permite', 'Não permite', 'Com restrições', 'Precisa consultar', 'Não se aplica'] },
                  { label: 'Acessibilidade idoso/PCD', name: 'checklist_accessibility', options: ['Boa', 'Adaptável', 'Ruim', 'Não avaliada'] },
                  { label: 'Taxa condominial', name: 'checklist_condo_fee_fit', options: ['Compatível', 'Alta', 'Baixa', 'Não informada', 'Não se aplica'] },
                  { label: 'Segurança percebida', name: 'checklist_security', options: ['Baixa', 'Média', 'Alta', 'Premium', 'Não avaliada'] },
                ].map((field) => (
                  <label key={field.name} style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800 }}>
                    {field.label}
                    <select name={field.name} defaultValue="" style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff' }}>
                      <option value="">Selecionar</option>
                      {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </label>
                ))}
              </div>
            </article>

            <article style={{ border: '1px solid #d7dee8', borderRadius: 16, padding: 14, background: '#f8fafc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
                <div>
                  <span style={{ display: 'inline-flex', borderRadius: 999, padding: '4px 8px', background: '#f59e0b', color: '#fff', fontSize: 11, fontWeight: 900, marginBottom: 8 }}>
                    5 / Fotos e evidências
                  </span>
                  <h3 style={{ margin: 0 }}>Adicionar ou conferir fotos e evidências</h3>
                </div>
                <strong style={{ color: '#f59e0b' }}>Progresso: 0%</strong>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800 }}>
                  Foto de capa
                  <select name="checklist_cover_photo_status" defaultValue="" style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff' }}>
                    <option value="">Selecionar</option>
                    <option value="ok">Definida</option>
                    <option value="missing">Faltando</option>
                    <option value="needs_review">Precisa revisão</option>
                  </select>
                </label>

                <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800 }}>
                  Quantidade de fotos úteis
                  <input name="checklist_usable_photos_count" placeholder={isAttachMode ? 'Herdar/conferir' : 'Ex.: 22'} style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff' }} />
                </label>

                <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800, gridColumn: '1 / -1' }}>
                  Ambientes faltantes ou fotos a refazer
                  <textarea name="checklist_photo_notes" rows={3} placeholder="Ex.: fachada, suíte, cozinha, área gourmet, condomínio, vista, detalhes de acabamento." style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff', resize: 'vertical' }} />
                </label>
              </div>
            </article>

            <article style={{ border: '1px solid #d7dee8', borderRadius: 16, padding: 14, background: '#f8fafc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
                <div>
                  <span style={{ display: 'inline-flex', borderRadius: 999, padding: '4px 8px', background: '#111827', color: '#fff', fontSize: 11, fontWeight: 900, marginBottom: 8 }}>
                    6 / Percepção do corretor
                  </span>
                  <h3 style={{ margin: 0 }}>Fechar percepção subjetiva do corretor</h3>
                </div>
                <strong style={{ color: '#f59e0b' }}>Progresso: 0%</strong>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                {[
                  { label: 'Liquidez percebida', name: 'checklist_liquidity', options: ['Baixa', 'Média', 'Alta', 'Muito alta', 'Não avaliada'] },
                  { label: 'Público provável', name: 'checklist_target_audience', options: ['Família', 'Investidor', 'Casal jovem', 'Idoso', 'Executivo', 'Temporada', 'Comercial'] },
                  { label: 'Potencial comercial', name: 'checklist_commercial_potential', options: ['Baixo', 'Médio', 'Alto', 'Muito alto', 'Não recomendado'] },
                  { label: 'Recomendação inicial', name: 'checklist_initial_recommendation', options: ['Seguir', 'Revisar preço', 'Melhorar fotos', 'Solicitar documentos', 'Aguardar', 'Não recomendado'] },
                ].map((field) => (
                  <label key={field.name} style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800 }}>
                    {field.label}
                    <select name={field.name} defaultValue="" style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff' }}>
                      <option value="">Selecionar</option>
                      {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </label>
                ))}

                <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800, gridColumn: '1 / -1' }}>
                  Percepção final do levantamento
                  <textarea name="checklist_broker_subjective_reading" rows={4} placeholder="Resumo objetivo do corretor sobre potencial, travas, urgência, pontos fortes, pontos fracos e o que precisa acontecer antes da inteligência." style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff', resize: 'vertical' }} />
                </label>
              </div>
            </article>
          </div>
        </section>
      )}

      {/* PIPELINE_LEVANTAMENTO_SLA_PROGRESS_V1 */}
      {stepKey === 'levantamento' && isPipelineStarted && (
        <section
          style={{
            border: '1px solid #dbe3ea',
            borderRadius: 18,
            padding: 18,
            background: '#fff',
            marginBottom: 18,
          }}
        >
          {/*
            ORIENTACAO PARA CODEX / EXECUTORES FUTUROS:
            - Este bloco modela a camada de controle operacional do levantamento.
            - Ainda não salva no banco.
            - No backend futuro:
              started_at deve disparar o SLA.
              due_at deve considerar regra operacional, exemplo 12h após vistoria/início.
              module_progress deve vir de property_pipeline_modules.
              intelligence_release_status deve considerar maturidade mínima.
            - A inteligência/proposta não deve liberar com dados ruins.
            - Regra inicial sugerida: liberar inteligência com 60% de maturidade nos módulos essenciais
              ou com encerramento formal justificado dos módulos impossíveis.
          */}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
              alignItems: 'flex-start',
              marginBottom: 14,
            }}
          >
            <div>
              <p
                style={{
                  margin: '0 0 6px',
                  fontSize: 13,
                  color: '#2563eb',
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                  fontWeight: 900,
                }}
              >
                Controle do levantamento
              </p>

              <h2 style={{ margin: '0 0 6px' }}>
                SLA, progresso e maturidade operacional
              </h2>

              <p
                style={{
                  margin: 0,
                  color: '#667085',
                  lineHeight: 1.5,
                  maxWidth: 940,
                }}
              >
                Depois que o atendimento é iniciado, o levantamento patrimonial passa
                a ter prazo, responsáveis por módulo e critérios mínimos para liberar
                a camada de inteligência e proposta.
              </p>
            </div>

            <span
              style={{
                display: 'inline-flex',
                borderRadius: 999,
                padding: '6px 10px',
                background: '#16a34a',
                color: '#fff',
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              em andamento
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: 10,
              marginBottom: 14,
            }}
          >
            {[
              {
                label: 'Prazo sugerido',
                value: '12h após início',
                detail: 'Conta a partir de started_at/vistoria, não da primeira ligação.',
                color: '#f59e0b',
              },
              {
                label: 'Progresso geral',
                value: '0%',
                detail: 'Soma ponderada dos módulos do levantamento.',
                color: '#2563eb',
              },
              {
                label: 'Módulos essenciais',
                value: '0 de 4',
                detail: 'Base mínima para liberar inteligência com qualidade.',
                color: '#7c3aed',
              },
              {
                label: 'Inteligência',
                value: 'Bloqueada',
                detail: 'Libera com maturidade mínima ou encerramento justificado.',
                color: '#dc2626',
              },
            ].map((item) => (
              <article
                key={item.label}
                style={{
                  border: '1px solid #d7dee8',
                  borderRadius: 14,
                  padding: 12,
                  background: '#f8fafc',
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    borderRadius: 999,
                    padding: '4px 8px',
                    background: item.color,
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 900,
                    marginBottom: 8,
                  }}
                >
                  {item.label}
                </span>

                <strong style={{ display: 'block', fontSize: 20 }}>
                  {item.value}
                </strong>

                <p
                  style={{
                    margin: '6px 0 0',
                    color: '#667085',
                    fontSize: 12,
                    lineHeight: 1.4,
                  }}
                >
                  {item.detail}
                </p>
              </article>
            ))}
          </div>

          <div
            style={{
              border: '1px solid #d7dee8',
              borderRadius: 14,
              padding: 14,
              background: '#f8fafc',
              marginBottom: 14,
            }}
          >
            <strong style={{ display: 'block', marginBottom: 8 }}>
              Critério de liberação da inteligência
            </strong>

            <p style={{ margin: 0, color: '#667085', lineHeight: 1.5 }}>
              A estratégia, proposta, precificação, abordagem comercial e script de
              divulgação não devem nascer com qualquer preenchimento fraco. A regra
              inicial da foundation é: atingir pelo menos 60% de maturidade nos módulos
              essenciais ou encerrar formalmente o que não pôde ser levantado por
              impossibilidade justificada.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 10,
            }}
          >
            {[
              {
                title: 'Essencial 1: imóvel',
                status: 'pendente',
                detail: 'Tipo, padrão, composição, áreas, estado e características principais.',
              },
              {
                title: 'Essencial 2: fotos/evidências',
                status: 'pendente',
                detail: 'Capa, ambientes, fachada, entorno e qualidade mínima para anúncio.',
              },
              {
                title: 'Essencial 3: localização',
                status: 'pendente',
                detail: 'Endereço, condomínio, bairro, entorno, acessos e percepção comercial.',
              },
              {
                title: 'Essencial 4: risco/documentos',
                status: 'pendente',
                detail: 'Documentos iniciais, restrições visíveis, débitos, pendências e alertas.',
              },
            ].map((item) => (
              <article
                key={item.title}
                style={{
                  border: '1px solid #d7dee8',
                  borderRadius: 14,
                  padding: 12,
                  background: '#fff',
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    borderRadius: 999,
                    padding: '4px 8px',
                    background: '#f59e0b',
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 900,
                    marginBottom: 8,
                  }}
                >
                  {item.status}
                </span>

                <strong style={{ display: 'block', fontSize: 13 }}>
                  {item.title}
                </strong>

                <p
                  style={{
                    margin: '6px 0 0',
                    color: '#667085',
                    fontSize: 12,
                    lineHeight: 1.4,
                  }}
                >
                  {item.detail}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}




      {/* PIPELINE_LEVANTAMENTO_CONDITIONAL_TYPE_ROUTING_V1 */}
      {stepKey === 'levantamento' && isPipelineStarted && (
        <section
          style={{
            border: '1px solid #dbe3ea',
            borderRadius: 18,
            padding: 18,
            background: '#fff',
            marginBottom: 18,
          }}
        >
          {/*
            ORIENTACAO PARA CODEX / EXECUTORES FUTUROS:
            - O Pipeline Pro não deve usar formulário único genérico.
            - O questionário muda conforme tipo/subtipo do patrimônio.
            - Nesta foundation ainda não há estado real de seleção.
            - Futuramente o roteamento deve vir de:
              property_assets.property_type_id
              property_assets.property_subtype_id
              property_asset_features
              metadata.type_profile
            - Exemplo:
              casa_rua, casa_condominio, apartamento_antigo,
              apartamento_moderno, apartamento_conceitual, terreno,
              comercial, rural.
            - Potenciais estratégicos também mudam:
              Airbnb, temporada, comercial, idoso/PCD, família,
              investimento, renda, administração, incorporação etc.
          */}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
              alignItems: 'flex-start',
              marginBottom: 14,
            }}
          >
            <div>
              <p
                style={{
                  margin: '0 0 6px',
                  fontSize: 13,
                  color: '#2563eb',
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                  fontWeight: 900,
                }}
              >
                Roteamento inteligente do levantamento
              </p>

              <h2 style={{ margin: '0 0 6px' }}>
                O formulário muda conforme tipo, subtipo e potencial do imóvel
              </h2>

              <p
                style={{
                  margin: 0,
                  color: '#667085',
                  lineHeight: 1.5,
                  maxWidth: 980,
                }}
              >
                Casa de rua, casa em condomínio, apartamento antigo, apartamento moderno,
                apartamento conceitual, terreno, comercial e rural não devem receber as
                mesmas perguntas. O Pipeline precisa adaptar o levantamento para orientar
                melhor preço, risco, público-alvo, potencial de uso e estratégia.
              </p>
            </div>

            <span
              style={{
                display: 'inline-flex',
                borderRadius: 999,
                padding: '6px 10px',
                background: '#2563eb',
                color: '#fff',
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              condicional
            </span>
          </div>

          <section
            style={{
              border: '1px solid #d7dee8',
              borderRadius: 16,
              padding: 14,
              background: '#f8fafc',
              marginBottom: 16,
            }}
          >
            <h3 style={{ margin: '0 0 8px' }}>
              0. Definição do tipo/subtipo para guiar o questionário
            </h3>

            <p style={{ margin: '0 0 12px', color: '#667085', lineHeight: 1.5 }}>
              Este bloco representa a decisão inicial que futuramente virá do cadastro
              do imóvel ou do atendimento. A partir dele, o sistema mostra perguntas
              específicas e oculta módulos que não fazem sentido.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 10,
              }}
            >
              <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800 }}>
                Tipo principal do imóvel
                <select name="pipeline_property_type_route" defaultValue="" style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff' }}>
                  <option value="">Selecionar</option>
                  <option value="street_house">Casa de rua</option>
                  <option value="condominium_house">Casa em condomínio</option>
                  <option value="apartment">Apartamento</option>
                  <option value="land">Terreno / lote</option>
                  <option value="commercial">Comercial</option>
                  <option value="rural">Rural</option>
                </select>
              </label>

              <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800 }}>
                Subtipo / perfil do imóvel
                <select name="pipeline_property_subtype_route" defaultValue="" style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff' }}>
                  <option value="">Selecionar</option>
                  <option value="traditional">Tradicional / antigo</option>
                  <option value="modern">Moderno</option>
                  <option value="conceptual">Conceitual / serviços</option>
                  <option value="high_standard">Alto padrão</option>
                  <option value="popular">Popular</option>
                  <option value="investment">Investimento</option>
                  <option value="mixed_use">Uso misto</option>
                </select>
              </label>

              <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800 }}>
                Potencial estratégico principal
                <select name="pipeline_primary_potential" defaultValue="" style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff' }}>
                  <option value="">Selecionar</option>
                  <option value="family_housing">Moradia familiar</option>
                  <option value="investment">Investimento</option>
                  <option value="traditional_rental">Locação tradicional</option>
                  <option value="short_term_rental">Airbnb / temporada</option>
                  <option value="commercial_potential">Potencial comercial</option>
                  <option value="elderly_accessible">Idoso / acessibilidade</option>
                  <option value="pcd_accessible">PCD / necessidades especiais</option>
                  <option value="development">Incorporação / desenvolvimento</option>
                </select>
              </label>

              <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800 }}>
                Proprietário aceita explorar esse potencial?
                <select name="owner_accepts_potential_strategy" defaultValue="" style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff' }}>
                  <option value="">Selecionar</option>
                  <option value="yes">Sim</option>
                  <option value="maybe">Talvez / depende da proposta</option>
                  <option value="no">Não</option>
                  <option value="unknown">Ainda não perguntado</option>
                </select>
              </label>
            </div>
          </section>

          <div style={{ display: 'grid', gap: 16 }}>
            <section
              style={{
                border: '1px solid #d7dee8',
                borderRadius: 16,
                padding: 14,
                background: '#f8fafc',
              }}
            >
              <h3 style={{ margin: '0 0 8px' }}>
                A. Casa de rua
              </h3>

              <p style={{ margin: '0 0 12px', color: '#667085', lineHeight: 1.5 }}>
                Perguntas próprias para casa fora de condomínio. Foco em rua, fachada,
                terreno, acessibilidade, potencial comercial, reforma e uso futuro.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                {[
                  { label: 'Fachada com potencial comercial?', name: 'street_house_commercial_front', options: ['Sim', 'Não', 'Talvez', 'Não avaliado'] },
                  { label: 'Rua permite uso comercial?', name: 'street_commercial_use_fit', options: ['Sim', 'Não', 'Precisa consultar', 'Não avaliado'] },
                  { label: 'Acessibilidade para idoso/PCD', name: 'street_house_accessibility', options: ['Boa', 'Adaptável', 'Ruim', 'Não avaliado'] },
                  { label: 'Potencial de ampliação/reforma', name: 'street_house_expansion_potential', options: ['Baixo', 'Médio', 'Alto', 'Não avaliado'] },
                  { label: 'Segurança percebida da rua', name: 'street_security_perception', options: ['Baixa', 'Média', 'Alta', 'Não avaliada'] },
                  { label: 'Potencial Airbnb/temporada', name: 'street_house_airbnb_potential', options: ['Baixo', 'Médio', 'Alto', 'Não recomendado', 'Não avaliado'] },
                ].map((field) => (
                  <label key={field.name} style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800 }}>
                    {field.label}
                    <select name={field.name} defaultValue="" style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff' }}>
                      <option value="">Selecionar</option>
                      {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </label>
                ))}

                <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800, gridColumn: '1 / -1' }}>
                  Observações específicas para casa de rua
                  <textarea name="street_house_specific_notes" rows={3} placeholder="Registre rua, fachada, potencial comercial, reforma, acessibilidade, garagem, segurança e pontos de atenção." style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff', resize: 'vertical' }} />
                </label>
              </div>
            </section>

            <section
              style={{
                border: '1px solid #d7dee8',
                borderRadius: 16,
                padding: 14,
                background: '#f8fafc',
              }}
            >
              <h3 style={{ margin: '0 0 8px' }}>
                B. Casa em condomínio
              </h3>

              <p style={{ margin: '0 0 12px', color: '#667085', lineHeight: 1.5 }}>
                Perguntas próprias para casa em condomínio. Foco em padrão da vizinhança,
                lazer, regras internas, segurança, taxa e perfil familiar/alto padrão.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                {[
                  { label: 'Padrão do condomínio', name: 'condo_house_standard', options: ['Popular', 'Médio', 'Médio elevado', 'Alto padrão', 'Luxo', 'Não avaliado'] },
                  { label: 'Lazer do condomínio', name: 'condo_house_leisure_level', options: ['Básico', 'Bom', 'Completo', 'Premium', 'Não avaliado'] },
                  { label: 'Regras para locação/temporada', name: 'condo_house_rental_rules', options: ['Permite', 'Não permite', 'Com restrições', 'Precisa consultar'] },
                  { label: 'Segurança do condomínio', name: 'condo_house_security_level', options: ['Baixa', 'Média', 'Alta', 'Premium', 'Não avaliada'] },
                  { label: 'Taxa condominial compatível?', name: 'condo_house_fee_fit', options: ['Sim', 'Não', 'A confirmar', 'Não avaliado'] },
                  { label: 'Potencial família/alto padrão', name: 'condo_house_family_premium_potential', options: ['Baixo', 'Médio', 'Alto', 'Muito alto', 'Não avaliado'] },
                ].map((field) => (
                  <label key={field.name} style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800 }}>
                    {field.label}
                    <select name={field.name} defaultValue="" style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff' }}>
                      <option value="">Selecionar</option>
                      {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </label>
                ))}

                <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800, gridColumn: '1 / -1' }}>
                  Observações específicas para casa em condomínio
                  <textarea name="condo_house_specific_notes" rows={3} placeholder="Registre padrão do condomínio, lazer, regras, segurança, taxa, perfil do público e pontos de atenção." style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff', resize: 'vertical' }} />
                </label>
              </div>
            </section>

            <section
              style={{
                border: '1px solid #d7dee8',
                borderRadius: 16,
                padding: 14,
                background: '#f8fafc',
              }}
            >
              <h3 style={{ margin: '0 0 8px' }}>
                C. Apartamento por perfil
              </h3>

              <p style={{ margin: '0 0 12px', color: '#667085', lineHeight: 1.5 }}>
                Apartamento antigo, moderno e conceitual possuem liquidez, riscos e
                potenciais diferentes. O Pipeline precisa capturar isso antes da estratégia.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                {[
                  { label: 'Perfil do apartamento', name: 'apartment_profile_type', options: ['Antigo/tradicional', 'Moderno com lazer comum', 'Conceitual com serviços', 'Alto padrão', 'Compacto/investimento', 'Não avaliado'] },
                  { label: 'Potencial Airbnb/temporada', name: 'apartment_airbnb_potential', options: ['Baixo', 'Médio', 'Alto', 'Muito alto', 'Não recomendado', 'Não avaliado'] },
                  { label: 'Estrutura para serviços', name: 'apartment_service_structure', options: ['Nenhuma', 'Lavanderia', 'Coworking', 'Serviços compartilhados', 'Completa', 'Não avaliado'] },
                  { label: 'Acessibilidade para idoso/PCD', name: 'apartment_accessibility', options: ['Boa', 'Média', 'Ruim', 'Adaptável', 'Não avaliado'] },
                  { label: 'Elevador e circulação', name: 'apartment_mobility_quality', options: ['Boa', 'Regular', 'Ruim', 'Sem elevador', 'Não avaliado'] },
                  { label: 'Público mais provável', name: 'apartment_probable_audience', options: ['Família', 'Jovem/casal', 'Investidor', 'Temporada', 'Idoso', 'Executivo', 'Não avaliado'] },
                ].map((field) => (
                  <label key={field.name} style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800 }}>
                    {field.label}
                    <select name={field.name} defaultValue="" style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff' }}>
                      <option value="">Selecionar</option>
                      {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </label>
                ))}

                <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800, gridColumn: '1 / -1' }}>
                  Observações específicas para apartamento
                  <textarea name="apartment_profile_specific_notes" rows={3} placeholder="Registre se é antigo, moderno ou conceitual, potencial Airbnb, serviços, acessibilidade, público provável e riscos." style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff', resize: 'vertical' }} />
                </label>
              </div>
            </section>
          </div>
        </section>
      )}

      {/* PIPELINE_LEVANTAMENTO_REAL_FIELDS_V1 */}
      {stepKey === 'levantamento' && isPipelineStarted && (
        <section
          style={{
            border: '1px solid #dbe3ea',
            borderRadius: 18,
            padding: 18,
            background: '#fff',
            marginBottom: 18,
          }}
        >
          {/*
            ORIENTACAO PARA CODEX / EXECUTORES FUTUROS:
            - Este bloco começa a trazer campos reais da antiga ficha/checkup para o Pipeline.
            - Ainda não salva no banco.
            - Não criar migration agora.
            - Não conectar autosave ainda.
            - Estes campos devem futuramente alimentar:
              technical_assessment
              documentation_assessment
              financial_assessment
              owner_interview
              commercial_assessment
            - O objetivo agora é redistribuir campos nos módulos certos.
          */}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
              alignItems: 'flex-start',
              marginBottom: 14,
            }}
          >
            <div>
              <p
                style={{
                  margin: '0 0 6px',
                  fontSize: 13,
                  color: '#2563eb',
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                  fontWeight: 900,
                }}
              >
                Campos reais do levantamento
              </p>

              <h2 style={{ margin: '0 0 6px' }}>
                Primeira redistribuição da antiga ficha para o Pipeline
              </h2>

              <p
                style={{
                  margin: 0,
                  color: '#667085',
                  lineHeight: 1.5,
                  maxWidth: 940,
                }}
              >
                Estes campos começam a transformar o levantamento em ferramenta de
                trabalho real. A conexão com banco, autosave, progresso e permissões
                por módulo fica para a próxima camada.
              </p>
            </div>

            <span
              style={{
                display: 'inline-flex',
                borderRadius: 999,
                padding: '6px 10px',
                background: '#2563eb',
                color: '#fff',
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              campos v1
            </span>
          </div>

          <div style={{ display: 'grid', gap: 16 }}>
            <section
              style={{
                border: '1px solid #d7dee8',
                borderRadius: 16,
                padding: 14,
                background: '#f8fafc',
              }}
            >
              <h3 style={{ margin: '0 0 8px' }}>
                1. Levantamento físico do imóvel
              </h3>

              <p style={{ margin: '0 0 12px', color: '#667085', lineHeight: 1.5 }}>
                Dados técnicos observados em campo. Alimenta a futura avaliação
                técnica, nota do patrimônio, posicionamento e estratégia.
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 10,
                }}
              >
                {[
                  { label: 'Topografia', name: 'topography', type: 'select', options: ['Plana', 'Aclive', 'Declive', 'Irregular', 'Não avaliado'] },
                  { label: 'Solo / implantação', name: 'soil_condition', type: 'select', options: ['Aparentemente estável', 'Exige atenção', 'Risco aparente', 'Não avaliado'] },
                  { label: 'Padrão construtivo', name: 'construction_standard', type: 'select', options: ['Popular', 'Médio baixo', 'Médio', 'Médio elevado', 'Alto padrão', 'Luxo', 'Não avaliado'] },
                  { label: 'Acabamento', name: 'finishing_quality', type: 'select', options: ['Simples', 'Bom', 'Muito bom', 'Premium', 'Precisa revisão'] },
                  { label: 'Conservação geral', name: 'general_conservation_status', type: 'select', options: ['Boa', 'Regular', 'Precisa revisão', 'Crítica', 'Não avaliado'] },
                  { label: 'Risco estrutural aparente', name: 'structural_risk_perception', type: 'select', options: ['Baixo', 'Médio', 'Alto', 'Não identificado', 'Precisa especialista'] },
                ].map((field) => (
                  <label
                    key={field.name}
                    style={{
                      display: 'grid',
                      gap: 6,
                      fontSize: 13,
                      color: '#344054',
                      fontWeight: 800,
                    }}
                  >
                    {field.label}
                    <select
                      name={field.name}
                      defaultValue=""
                      style={{
                        border: '1px solid #d7dee8',
                        borderRadius: 10,
                        padding: '10px 11px',
                        background: '#fff',
                        color: '#111827',
                      }}
                    >
                      <option value="">Selecionar</option>
                      {field.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}

                <label
                  style={{
                    display: 'grid',
                    gap: 6,
                    fontSize: 13,
                    color: '#344054',
                    fontWeight: 800,
                    gridColumn: '1 / -1',
                  }}
                >
                  Observações técnicas do imóvel
                  <textarea
                    name="technical_notes"
                    rows={4}
                    placeholder="Descreva pontos relevantes sobre estrutura, conservação, acabamento, manutenção, pontos fortes e pontos de atenção."
                    style={{
                      border: '1px solid #d7dee8',
                      borderRadius: 10,
                      padding: '10px 11px',
                      background: '#fff',
                      color: '#111827',
                      resize: 'vertical',
                    }}
                  />
                </label>
              </div>
            </section>

            <section
              style={{
                border: '1px solid #d7dee8',
                borderRadius: 16,
                padding: 14,
                background: '#f8fafc',
              }}
            >
              <h3 style={{ margin: '0 0 8px' }}>
                2. Fotos públicas e evidências
              </h3>

              <p style={{ margin: '0 0 12px', color: '#667085', lineHeight: 1.5 }}>
                Avaliação das imagens que vão sustentar o anúncio público. Fotos
                técnicas privadas devem ficar separadas depois.
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 10,
                }}
              >
                <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800 }}>
                  Foto de capa definida?
                  <select name="cover_photo_status" defaultValue="" style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff' }}>
                    <option value="">Selecionar</option>
                    <option value="yes">Sim</option>
                    <option value="no">Não</option>
                    <option value="needs_review">Precisa revisão</option>
                  </select>
                </label>

                <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800 }}>
                  Quantidade estimada de fotos úteis
                  <input name="usable_photos_count" type="number" min="0" placeholder="Ex.: 18" style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff' }} />
                </label>

                <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800 }}>
                  Qualidade geral das fotos
                  <select name="photo_quality" defaultValue="" style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff' }}>
                    <option value="">Selecionar</option>
                    <option value="poor">Ruim</option>
                    <option value="regular">Regular</option>
                    <option value="good">Boa</option>
                    <option value="excellent">Excelente</option>
                  </select>
                </label>

                <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800 }}>
                  Ambientes faltantes
                  <input name="missing_photo_rooms" placeholder="Ex.: fachada, suíte, área gourmet" style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff' }} />
                </label>

                <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800, gridColumn: '1 / -1' }}>
                  Observações sobre fotos e evidências
                  <textarea name="photo_notes" rows={3} placeholder="Indique se precisa voltar ao local, refazer fotos, melhorar capa ou coletar imagens específicas." style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff', resize: 'vertical' }} />
                </label>
              </div>
            </section>

            <section
              style={{
                border: '1px solid #d7dee8',
                borderRadius: 16,
                padding: 14,
                background: '#f8fafc',
              }}
            >
              <h3 style={{ margin: '0 0 8px' }}>
                3. Localização, entorno e percepção comercial
              </h3>

              <p style={{ margin: '0 0 12px', color: '#667085', lineHeight: 1.5 }}>
                Informações que podem ser observadas no local ou complementadas
                depois por pesquisa.
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 10,
                }}
              >
                <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800 }}>
                  Tipo de localização
                  <select name="location_profile" defaultValue="" style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff' }}>
                    <option value="">Selecionar</option>
                    <option value="urban">Urbana</option>
                    <option value="condominium">Condomínio</option>
                    <option value="rural">Rural</option>
                    <option value="commercial_axis">Eixo comercial</option>
                    <option value="mixed">Mista</option>
                  </select>
                </label>

                <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800 }}>
                  Acesso
                  <select name="access_quality" defaultValue="" style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff' }}>
                    <option value="">Selecionar</option>
                    <option value="easy">Fácil</option>
                    <option value="regular">Regular</option>
                    <option value="difficult">Difícil</option>
                    <option value="needs_explanation">Precisa orientação</option>
                  </select>
                </label>

                <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800 }}>
                  Atratividade da região
                  <select name="region_attractiveness" defaultValue="" style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff' }}>
                    <option value="">Selecionar</option>
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                    <option value="premium">Muito alta</option>
                  </select>
                </label>

                <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800, gridColumn: '1 / -1' }}>
                  Pontos fortes do entorno
                  <textarea name="surrounding_strengths" rows={3} placeholder="Ex.: escolas, mercado, shopping, farmácia, acesso rápido, segurança, silêncio, lazer, potencial de valorização." style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff', resize: 'vertical' }} />
                </label>

                <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800, gridColumn: '1 / -1' }}>
                  Pontos de atenção do entorno
                  <textarea name="surrounding_risks" rows={3} placeholder="Ex.: ruído, acesso ruim, rua sem pavimento, comércio fraco, vizinhança sensível, distância, trânsito." style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff', resize: 'vertical' }} />
                </label>
              </div>
            </section>

            <section
              style={{
                border: '1px solid #d7dee8',
                borderRadius: 16,
                padding: 14,
                background: '#f8fafc',
              }}
            >
              <h3 style={{ margin: '0 0 8px' }}>
                4. Diagnóstico documental e risco inicial
              </h3>

              <p style={{ margin: '0 0 12px', color: '#667085', lineHeight: 1.5 }}>
                Primeira leitura documental e financeira. Pode ser preenchida pelo
                corretor ou por apoio administrativo/documental.
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 10,
                }}
              >
                {[
                  { label: 'Matrícula / registro', name: 'property_registry_status', options: ['Apresentado', 'Pendente', 'Incompleto', 'Precisa revisão', 'Não se aplica'] },
                  { label: 'Documentos do proprietário', name: 'owner_document_status', options: ['Apresentados', 'Pendentes', 'Incompletos', 'Precisa revisão'] },
                  { label: 'IPTU / tributos', name: 'property_tax_status', options: ['Regular informado', 'Pendente', 'Débito informado', 'Não avaliado'] },
                  { label: 'Débito de condomínio', name: 'condominium_debt_status', options: ['Sem débito informado', 'Com débito informado', 'Não informado', 'Não se aplica'] },
                  { label: 'Nível de risco documental', name: 'documentation_risk_level', options: ['Baixo', 'Médio', 'Alto', 'Crítico', 'Não avaliado'] },
                ].map((field) => (
                  <label key={field.name} style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800 }}>
                    {field.label}
                    <select name={field.name} defaultValue="" style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff' }}>
                      <option value="">Selecionar</option>
                      {field.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}

                <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800, gridColumn: '1 / -1' }}>
                  Recomendação documental / financeira
                  <textarea name="documentation_recommendation" rows={4} placeholder="Descreva o que precisa validar antes de publicar, negociar, propor preço ou apresentar ao proprietário." style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff', resize: 'vertical' }} />
                </label>
              </div>
            </section>
          </div>
        </section>
      )}


      {/* PIPELINE_LEVANTAMENTO_OWNER_COMMERCIAL_FIELDS_V1 */}
      {stepKey === 'levantamento' && isPipelineStarted && (
        <section
          style={{
            border: '1px solid #dbe3ea',
            borderRadius: 18,
            padding: 18,
            background: '#fff',
            marginBottom: 18,
          }}
        >
          {/*
            ORIENTACAO PARA CODEX / EXECUTORES FUTUROS:
            - Estes campos saem da antiga ficha e entram no Pipeline no ponto correto.
            - São dados coletados na conversa/vistoria.
            - Ainda não salvar no banco.
            - Futuramente devem alimentar:
              owner_interview
              commercial_assessment
              private_notes
              public_summary
              owner_visibility_summary
            - Atenção LGPD/produto:
              perfil do proprietário é dado interno, não deve aparecer no anúncio público.
              O proprietário pode receber resumo apropriado, mas não análise sensível dele.
          */}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
              alignItems: 'flex-start',
              marginBottom: 14,
            }}
          >
            <div>
              <p
                style={{
                  margin: '0 0 6px',
                  fontSize: 13,
                  color: '#7c3aed',
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                  fontWeight: 900,
                }}
              >
                Entrevista e leitura comercial
              </p>

              <h2 style={{ margin: '0 0 6px' }}>
                Proprietário, motivação, preço e estratégia preliminar
              </h2>

              <p
                style={{
                  margin: 0,
                  color: '#667085',
                  lineHeight: 1.5,
                  maxWidth: 940,
                }}
              >
                Estes campos capturam o contexto humano e comercial da captação.
                Eles não são o anúncio final, mas alimentam a futura inteligência,
                proposta ao proprietário e posicionamento do imóvel.
              </p>
            </div>

            <span
              style={{
                display: 'inline-flex',
                borderRadius: 999,
                padding: '6px 10px',
                background: '#7c3aed',
                color: '#fff',
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              dados internos
            </span>
          </div>

          <div style={{ display: 'grid', gap: 16 }}>
            <section
              style={{
                border: '1px solid #d7dee8',
                borderRadius: 16,
                padding: 14,
                background: '#f8fafc',
              }}
            >
              <h3 style={{ margin: '0 0 8px' }}>
                5. Perfil do proprietário e contexto da negociação
              </h3>

              <p style={{ margin: '0 0 12px', color: '#667085', lineHeight: 1.5 }}>
                Informações internas para orientar abordagem, negociação e proposta.
                Não devem ser expostas publicamente.
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 10,
                }}
              >
                {[
                  {
                    label: 'Motivação do proprietário',
                    name: 'owner_motivation',
                    options: ['Venda por necessidade', 'Venda por oportunidade', 'Mudança', 'Investimento', 'Inventário/família', 'Não informado'],
                  },
                  {
                    label: 'Urgência percebida',
                    name: 'owner_urgency',
                    options: ['Baixa', 'Média', 'Alta', 'Muito alta', 'Não avaliada'],
                  },
                  {
                    label: 'Flexibilidade de preço',
                    name: 'owner_price_flexibility',
                    options: ['Baixa', 'Média', 'Alta', 'Depende da proposta', 'Não informada'],
                  },
                  {
                    label: 'Abertura para estratégia profissional',
                    name: 'owner_strategy_openness',
                    options: ['Aberto', 'Parcialmente aberto', 'Resistente', 'Precisa alinhamento', 'Não avaliado'],
                  },
                  {
                    label: 'Disponibilidade do proprietário',
                    name: 'owner_availability',
                    options: ['Alta', 'Média', 'Baixa', 'Difícil contato', 'Representante intermediando'],
                  },
                  {
                    label: 'Tipo de contato',
                    name: 'owner_contact_type',
                    options: ['Proprietário direto', 'Representante', 'Familiar', 'Administrador', 'Outro intermediário'],
                  },
                ].map((field) => (
                  <label
                    key={field.name}
                    style={{
                      display: 'grid',
                      gap: 6,
                      fontSize: 13,
                      color: '#344054',
                      fontWeight: 800,
                    }}
                  >
                    {field.label}
                    <select
                      name={field.name}
                      defaultValue=""
                      style={{
                        border: '1px solid #d7dee8',
                        borderRadius: 10,
                        padding: '10px 11px',
                        background: '#fff',
                        color: '#111827',
                      }}
                    >
                      <option value="">Selecionar</option>
                      {field.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}

                <label
                  style={{
                    display: 'grid',
                    gap: 6,
                    fontSize: 13,
                    color: '#344054',
                    fontWeight: 800,
                    gridColumn: '1 / -1',
                  }}
                >
                  Objeções, travas ou pontos sensíveis do proprietário
                  <textarea
                    name="owner_main_objections"
                    rows={3}
                    placeholder="Ex.: preço acima do mercado, resistência a fotos, urgência financeira, dificuldade com documentação, expectativa irreal, familiares envolvidos."
                    style={{
                      border: '1px solid #d7dee8',
                      borderRadius: 10,
                      padding: '10px 11px',
                      background: '#fff',
                      color: '#111827',
                      resize: 'vertical',
                    }}
                  />
                </label>

                <label
                  style={{
                    display: 'grid',
                    gap: 6,
                    fontSize: 13,
                    color: '#344054',
                    fontWeight: 800,
                    gridColumn: '1 / -1',
                  }}
                >
                  Notas internas sobre comportamento/contexto do proprietário
                  <textarea
                    name="owner_behavior_notes"
                    rows={4}
                    placeholder="Registre leitura profissional do contexto. Evite linguagem ofensiva. Use observações úteis para estratégia, negociação e alinhamento."
                    style={{
                      border: '1px solid #d7dee8',
                      borderRadius: 10,
                      padding: '10px 11px',
                      background: '#fff',
                      color: '#111827',
                      resize: 'vertical',
                    }}
                  />
                </label>
              </div>
            </section>

            <section
              style={{
                border: '1px solid #d7dee8',
                borderRadius: 16,
                padding: 14,
                background: '#f8fafc',
              }}
            >
              <h3 style={{ margin: '0 0 8px' }}>
                6. Leitura comercial preliminar
              </h3>

              <p style={{ margin: '0 0 12px', color: '#667085', lineHeight: 1.5 }}>
                Primeira leitura comercial feita a partir da vistoria. A inteligência
                final ainda será gerada depois, com base nos módulos essenciais.
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 10,
                }}
              >
                <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800 }}>
                  Preço pedido pelo proprietário
                  <input
                    name="owner_requested_price"
                    placeholder="Ex.: 850000"
                    inputMode="numeric"
                    style={{
                      border: '1px solid #d7dee8',
                      borderRadius: 10,
                      padding: '10px 11px',
                      background: '#fff',
                    }}
                  />
                </label>

                <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800 }}>
                  Percepção inicial de preço
                  <select name="initial_price_perception" defaultValue="" style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff' }}>
                    <option value="">Selecionar</option>
                    <option value="below_market">Abaixo do mercado</option>
                    <option value="aligned">Aparentemente alinhado</option>
                    <option value="above_market">Acima do mercado</option>
                    <option value="far_above_market">Muito acima do mercado</option>
                    <option value="needs_research">Precisa pesquisa</option>
                  </select>
                </label>

                <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800 }}>
                  Liquidez percebida
                  <select name="liquidity_perception" defaultValue="" style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff' }}>
                    <option value="">Selecionar</option>
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                    <option value="very_high">Muito alta</option>
                    <option value="unknown">Não avaliada</option>
                  </select>
                </label>

                <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800 }}>
                  Potencial de destaque
                  <select name="highlight_potential" defaultValue="" style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff' }}>
                    <option value="">Selecionar</option>
                    <option value="standard">Padrão</option>
                    <option value="good">Bom</option>
                    <option value="premium">Premium</option>
                    <option value="opportunity">Oportunidade</option>
                    <option value="difficult">Difícil posicionamento</option>
                  </select>
                </label>

                <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800 }}>
                  Público-alvo provável
                  <input
                    name="probable_target_audience"
                    placeholder="Ex.: família, investidor, casal jovem, alto padrão, locação temporada"
                    style={{
                      border: '1px solid #d7dee8',
                      borderRadius: 10,
                      padding: '10px 11px',
                      background: '#fff',
                    }}
                  />
                </label>

                <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800 }}>
                  Perfil de uso provável
                  <select name="probable_use_profile" defaultValue="" style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff' }}>
                    <option value="">Selecionar</option>
                    <option value="family_housing">Moradia familiar</option>
                    <option value="investment">Investimento</option>
                    <option value="rental">Locação tradicional</option>
                    <option value="short_term_rental">Temporada / Airbnb</option>
                    <option value="elderly">Terceira idade</option>
                    <option value="commercial_use">Uso comercial</option>
                    <option value="mixed">Uso misto</option>
                  </select>
                </label>

                <label
                  style={{
                    display: 'grid',
                    gap: 6,
                    fontSize: 13,
                    color: '#344054',
                    fontWeight: 800,
                    gridColumn: '1 / -1',
                  }}
                >
                  Diferenciais comerciais percebidos
                  <textarea
                    name="commercial_strengths"
                    rows={3}
                    placeholder="Ex.: localização, planta, acabamento, lazer, potencial de renda, vista, condomínio, preço, exclusividade."
                    style={{
                      border: '1px solid #d7dee8',
                      borderRadius: 10,
                      padding: '10px 11px',
                      background: '#fff',
                      resize: 'vertical',
                    }}
                  />
                </label>

                <label
                  style={{
                    display: 'grid',
                    gap: 6,
                    fontSize: 13,
                    color: '#344054',
                    fontWeight: 800,
                    gridColumn: '1 / -1',
                  }}
                >
                  Pontos fracos comerciais percebidos
                  <textarea
                    name="commercial_weaknesses"
                    rows={3}
                    placeholder="Ex.: preço, documentação, conservação, localização, fotos ruins, baixa liquidez, concorrência forte."
                    style={{
                      border: '1px solid #d7dee8',
                      borderRadius: 10,
                      padding: '10px 11px',
                      background: '#fff',
                      resize: 'vertical',
                    }}
                  />
                </label>

                <label
                  style={{
                    display: 'grid',
                    gap: 6,
                    fontSize: 13,
                    color: '#344054',
                    fontWeight: 800,
                    gridColumn: '1 / -1',
                  }}
                >
                  Recomendação comercial inicial
                  <textarea
                    name="initial_commercial_recommendation"
                    rows={4}
                    placeholder="Sugestão inicial do profissional antes da inteligência final: preço, posicionamento, melhorias, fotos, abordagem e prioridade."
                    style={{
                      border: '1px solid #d7dee8',
                      borderRadius: 10,
                      padding: '10px 11px',
                      background: '#fff',
                      resize: 'vertical',
                    }}
                  />
                </label>
              </div>
            </section>
          </div>
        </section>
      )}

      {/* PIPELINE_LEVANTAMENTO_OPERATIONAL_MODULES_V1 */}
      {stepKey === 'levantamento' && isPipelineStarted && (
        <section
          style={{
            border: '1px solid #dbe3ea',
            borderRadius: 18,
            padding: 18,
            background: '#fff',
            marginBottom: 18,
          }}
        >
          {/*
            ORIENTACAO PARA CODEX / EXECUTORES FUTUROS:
            - Este bloco detalha os módulos operacionais do levantamento.
            - Ainda é foundation visual/read-only.
            - Backend futuro:
              property_pipeline_modules
              property_pipeline_module_tasks
              property_pipeline_module_assignments
              property_pipeline_events
            - Cada módulo deve ter:
              status, responsável, prazo, progresso, started_at, completed_at,
              not_applicable_reason, blocked_reason e last_saved_at.
            - Botão "Não se aplica" não pode ser burla de progresso.
              Deve exigir justificativa quando afetar módulo essencial.
            - Botão "Encerrar com justificativa" libera fluxo sem travar por força maior,
              mas precisa registrar motivo e impacto.
          */}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
              alignItems: 'flex-start',
              marginBottom: 14,
            }}
          >
            <div>
              <p
                style={{
                  margin: '0 0 6px',
                  fontSize: 13,
                  color: '#2563eb',
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                  fontWeight: 900,
                }}
              >
                Módulos do levantamento
              </p>

              <h2 style={{ margin: '0 0 6px' }}>
                Execução por responsabilidade, prazo e maturidade
              </h2>

              <p
                style={{
                  margin: 0,
                  color: '#667085',
                  lineHeight: 1.5,
                  maxWidth: 940,
                }}
              >
                O levantamento não é uma ficha única. Ele é um conjunto de módulos
                que podem evoluir em paralelo, com responsáveis diferentes e níveis
                próprios de maturidade. Cada módulo alimenta a futura inteligência.
              </p>
            </div>

            <span
              style={{
                display: 'inline-flex',
                borderRadius: 999,
                padding: '6px 10px',
                background: '#2563eb',
                color: '#fff',
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              foundation visual
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gap: 12,
            }}
          >
            {[
              {
                title: 'Levantamento físico do imóvel',
                type: 'essencial',
                status: 'Pendente',
                progress: '0%',
                responsible: 'Corretor responsável',
                deadline: 'Até 12h após início',
                description:
                  'Tipo, padrão construtivo, composição, metragem, cômodos, acabamento, conservação, diferenciais e limitações visíveis.',
                unlockImpact:
                  'Alimenta nota do patrimônio, precificação, público-alvo e script comercial.',
              },
              {
                title: 'Fotos públicas e evidências de campo',
                type: 'essencial',
                status: 'Pendente',
                progress: '0%',
                responsible: 'Corretor responsável',
                deadline: 'Durante ou logo após vistoria',
                description:
                  'Foto de capa, ambientes, fachada, área externa, condomínio, entorno e seleção mínima de fotos para anúncio.',
                unlockImpact:
                  'Alimenta qualidade do anúncio, performance visual e material de divulgação.',
              },
              {
                title: 'Localização, entorno e percepção da região',
                type: 'essencial',
                status: 'Pendente',
                progress: '0%',
                responsible: 'Corretor ou apoio de pesquisa',
                deadline: 'Até 12h após início',
                description:
                  'Condomínio, bairro, acesso, vizinhança, serviços próximos, ruídos, comércio, segurança percebida e atratividade.',
                unlockImpact:
                  'Alimenta posicionamento comercial, narrativa, tags e diferenciais de localização.',
              },
              {
                title: 'Diagnóstico documental e risco inicial',
                type: 'essencial',
                status: 'Pendente',
                progress: '0%',
                responsible: 'Apoio documental / administrativo',
                deadline: 'Pode seguir em paralelo',
                description:
                  'Matrícula, IPTU, débitos aparentes, autorização, titularidade, pendências, restrições e sinais de risco.',
                unlockImpact:
                  'Alimenta risco comercial, segurança operacional e limites da proposta.',
              },
              {
                title: 'Perfil do proprietário e contexto da negociação',
                type: 'estratégico',
                status: 'Pendente',
                progress: '0%',
                responsible: 'Corretor responsável',
                deadline: 'Durante atendimento',
                description:
                  'Motivação, urgência, flexibilidade, expectativa de preço, resistência, abertura para estratégia e perfil relacional.',
                unlockImpact:
                  'Alimenta abordagem, proposta, argumentação e gestão de expectativa.',
              },
              {
                title: 'Notas internas e observações de campo',
                type: 'apoio',
                status: 'Pendente',
                progress: '0%',
                responsible: 'Participantes autorizados',
                deadline: 'Livre durante o processo',
                description:
                  'Observações do corretor, contribuições de especialistas, pontos de atenção, insights e recomendações internas.',
                unlockImpact:
                  'Alimenta histórico operacional, dossiê interno e colaboração da equipe.',
              },
            ].map((module) => (
              <article
                key={module.title}
                style={{
                  border: '1px solid #d7dee8',
                  borderRadius: 16,
                  padding: 14,
                  background: '#f8fafc',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    flexWrap: 'wrap',
                    alignItems: 'flex-start',
                    marginBottom: 10,
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        gap: 8,
                        flexWrap: 'wrap',
                        marginBottom: 8,
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-flex',
                          borderRadius: 999,
                          padding: '4px 8px',
                          background:
                            module.type === 'essencial'
                              ? '#dc2626'
                              : module.type === 'estratégico'
                                ? '#7c3aed'
                                : '#475467',
                          color: '#fff',
                          fontSize: 11,
                          fontWeight: 900,
                        }}
                      >
                        {module.type}
                      </span>

                      <span
                        style={{
                          display: 'inline-flex',
                          borderRadius: 999,
                          padding: '4px 8px',
                          background: '#f59e0b',
                          color: '#fff',
                          fontSize: 11,
                          fontWeight: 900,
                        }}
                      >
                        {module.status}
                      </span>
                    </div>

                    <strong style={{ display: 'block', fontSize: 15 }}>
                      {module.title}
                    </strong>

                    <p
                      style={{
                        margin: '7px 0 0',
                        color: '#667085',
                        fontSize: 13,
                        lineHeight: 1.5,
                        maxWidth: 920,
                      }}
                    >
                      {module.description}
                    </p>
                  </div>

                  <div
                    style={{
                      minWidth: 120,
                      border: '1px solid #d7dee8',
                      borderRadius: 12,
                      padding: 10,
                      background: '#fff',
                    }}
                  >
                    <span style={{ display: 'block', color: '#667085', fontSize: 11 }}>
                      Progresso
                    </span>
                    <strong style={{ display: 'block', fontSize: 22, marginTop: 3 }}>
                      {module.progress}
                    </strong>
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
                    gap: 10,
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      border: '1px solid #d7dee8',
                      borderRadius: 12,
                      padding: 10,
                      background: '#fff',
                    }}
                  >
                    <span style={{ display: 'block', color: '#667085', fontSize: 11 }}>
                      Responsável
                    </span>
                    <strong style={{ display: 'block', fontSize: 12, marginTop: 3 }}>
                      {module.responsible}
                    </strong>
                  </div>

                  <div
                    style={{
                      border: '1px solid #d7dee8',
                      borderRadius: 12,
                      padding: 10,
                      background: '#fff',
                    }}
                  >
                    <span style={{ display: 'block', color: '#667085', fontSize: 11 }}>
                      Prazo
                    </span>
                    <strong style={{ display: 'block', fontSize: 12, marginTop: 3 }}>
                      {module.deadline}
                    </strong>
                  </div>

                  <div
                    style={{
                      border: '1px solid #d7dee8',
                      borderRadius: 12,
                      padding: 10,
                      background: '#fff',
                    }}
                  >
                    <span style={{ display: 'block', color: '#667085', fontSize: 11 }}>
                      Impacto na inteligência
                    </span>
                    <strong style={{ display: 'block', fontSize: 12, marginTop: 3 }}>
                      {module.unlockImpact}
                    </strong>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                    flexWrap: 'wrap',
                  }}
                >
                  <button
                    type="button"
                    style={{
                      border: '1px solid #2563eb',
                      borderRadius: 10,
                      padding: '8px 10px',
                      background: '#2563eb',
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: 12,
                      cursor: 'default',
                    }}
                  >
                    Preencher módulo
                  </button>

                  <button
                    type="button"
                    style={{
                      border: '1px solid #d7dee8',
                      borderRadius: 10,
                      padding: '8px 10px',
                      background: '#fff',
                      color: '#344054',
                      fontWeight: 800,
                      fontSize: 12,
                      cursor: 'default',
                    }}
                  >
                    Não se aplica
                  </button>

                  <button
                    type="button"
                    style={{
                      border: '1px solid #f59e0b',
                      borderRadius: 10,
                      padding: '8px 10px',
                      background: '#fff7ed',
                      color: '#92400e',
                      fontWeight: 800,
                      fontSize: 12,
                      cursor: 'default',
                    }}
                  >
                    Encerrar com justificativa
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* PIPELINE_LEVANTAMENTO_STARTED_GATE_V1 */}
      {stepKey === 'levantamento' && (
        <section
          style={{
            border: '1px solid #dbe3ea',
            borderRadius: 18,
            padding: 18,
            background: '#fff',
            marginBottom: 18,
          }}
        >
          {/*
            ORIENTACAO PARA CODEX / EXECUTORES FUTUROS:
            - Levantamento patrimonial só deve ser liberado após started_at.
            - Nesta foundation usamos ?started=1 apenas como simulação visual.
            - Backend futuro deve validar started_at no workflow real.
            - Não liberar edição de módulos sem permissão/responsabilidade.
            - Cada módulo deverá ter status, responsável, progresso, "não se aplica" e autosave.
          */}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
              alignItems: 'flex-start',
              marginBottom: 14,
            }}
          >
            <div>
              <p
                style={{
                  margin: '0 0 6px',
                  fontSize: 13,
                  color: isPipelineStarted ? '#16a34a' : '#dc2626',
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                  fontWeight: 900,
                }}
              >
                {isPipelineStarted ? 'Levantamento liberado' : 'Levantamento bloqueado'}
              </p>

              <h2 style={{ margin: '0 0 6px' }}>
                Levantamento patrimonial
              </h2>

              <p
                style={{
                  margin: 0,
                  color: '#667085',
                  lineHeight: 1.5,
                  maxWidth: 940,
                }}
              >
                Esta etapa organiza a coleta em campo: imóvel, fotos, entorno,
                infraestrutura, documentação inicial, percepção comercial e evidências.
                Ela só deve abrir depois que o atendimento for iniciado.
              </p>
            </div>

            <span
              style={{
                display: 'inline-flex',
                borderRadius: 999,
                padding: '6px 10px',
                background: isPipelineStarted ? '#16a34a' : '#dc2626',
                color: '#fff',
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              {isPipelineStarted ? 'started=1' : 'aguardando início'}
            </span>
          </div>

          {!isPipelineStarted && (
            <div
              style={{
                border: '1px solid #fecaca',
                borderRadius: 14,
                padding: 14,
                background: '#fef2f2',
                marginBottom: 14,
              }}
            >
              <strong style={{ display: 'block', marginBottom: 6 }}>
                Esta etapa ainda não deveria ser preenchida
              </strong>

              <p style={{ margin: '0 0 12px', color: '#667085', lineHeight: 1.5 }}>
                O correto é voltar ao Atendimento e marcar a tarefa como iniciada
                apenas quando o profissional chegou ao local ou iniciou formalmente
                a vistoria. Isso dispara o prazo operacional do levantamento.
              </p>

              <a
                href={buildStepHref('atendimento')}
                style={{
                  display: 'inline-flex',
                  padding: '9px 12px',
                  borderRadius: 10,
                  border: '1px solid #dc2626',
                  background: '#dc2626',
                  color: '#fff',
                  textDecoration: 'none',
                  fontWeight: 900,
                }}
              >
                Voltar para atendimento
              </a>
            </div>
          )}

          {isPipelineStarted && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 12,
              }}
            >
              {[
                {
                  title: '1. Dados básicos do patrimônio',
                  progress: '0%',
                  owner: 'Corretor responsável',
                  detail: 'Tipo, padrão, composição, áreas, quartos, suítes, vagas e características principais.',
                },
                {
                  title: '2. Fotos e evidências',
                  progress: '0%',
                  owner: 'Corretor responsável',
                  detail: 'Fotos selecionadas, qualidade, quantidade, capa, ambientes, fachada, entorno e registros técnicos.',
                },
                {
                  title: '3. Localização e entorno',
                  progress: '0%',
                  owner: 'Corretor ou apoio',
                  detail: 'Endereço, condomínio, bairro, referências, acesso, comércio próximo, ruído, vizinhança e percepção.',
                },
                {
                  title: '4. Conservação e riscos visíveis',
                  progress: '0%',
                  owner: 'Corretor responsável',
                  detail: 'Estado geral, manutenção, infiltração, acabamento, estrutura aparente e pontos de atenção.',
                },
                {
                  title: '5. Documentos iniciais',
                  progress: '0%',
                  owner: 'Apoio documental',
                  detail: 'Matrícula, IPTU, autorização, documentos do proprietário e pendências preliminares.',
                },
                {
                  title: '6. Notas de campo',
                  progress: '0%',
                  owner: 'Corretor responsável',
                  detail: 'Percepção do proprietário, urgência, flexibilidade, motivação, diferenciais e observações estratégicas.',
                },
              ].map((module) => (
                <article
                  key={module.title}
                  style={{
                    border: '1px solid #d7dee8',
                    borderRadius: 14,
                    padding: 14,
                    background: '#f8fafc',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      borderRadius: 999,
                      padding: '4px 8px',
                      background: '#2563eb',
                      color: '#fff',
                      fontSize: 11,
                      fontWeight: 900,
                      marginBottom: 10,
                    }}
                  >
                    liberado
                  </span>

                  <strong style={{ display: 'block', fontSize: 14 }}>
                    {module.title}
                  </strong>

                  <p style={{ margin: '7px 0', color: '#667085', fontSize: 13, lineHeight: 1.5 }}>
                    {module.detail}
                  </p>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 8,
                      marginTop: 10,
                    }}
                  >
                    <div
                      style={{
                        border: '1px solid #d7dee8',
                        borderRadius: 10,
                        padding: 9,
                        background: '#fff',
                      }}
                    >
                      <span style={{ display: 'block', color: '#667085', fontSize: 11 }}>
                        Progresso
                      </span>
                      <strong style={{ display: 'block', fontSize: 12, marginTop: 3 }}>
                        {module.progress}
                      </strong>
                    </div>

                    <div
                      style={{
                        border: '1px solid #d7dee8',
                        borderRadius: 10,
                        padding: 9,
                        background: '#fff',
                      }}
                    >
                      <span style={{ display: 'block', color: '#667085', fontSize: 11 }}>
                        Responsável
                      </span>
                      <strong style={{ display: 'block', fontSize: 12, marginTop: 3 }}>
                        {module.owner}
                      </strong>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: 8,
                      flexWrap: 'wrap',
                      marginTop: 10,
                    }}
                  >
                    <button
                      type="button"
                      style={{
                        border: '1px solid #d7dee8',
                        borderRadius: 10,
                        padding: '8px 10px',
                        background: '#fff',
                        color: '#344054',
                        fontWeight: 800,
                        fontSize: 12,
                        cursor: 'default',
                      }}
                    >
                      Preencher módulo
                    </button>

                    <button
                      type="button"
                      style={{
                        border: '1px solid #d7dee8',
                        borderRadius: 10,
                        padding: '8px 10px',
                        background: '#fff',
                        color: '#344054',
                        fontWeight: 800,
                        fontSize: 12,
                        cursor: 'default',
                      }}
                    >
                      Não se aplica
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}



      {/* PIPELINE_DIAGNOSTICO_EXECUTABLE_CHECKLIST_V1 */}
      {stepKey === 'diagnostico' && (
        <section
          style={{
            border: '1px solid #dbe3ea',
            borderRadius: 18,
            padding: 18,
            background: '#fff',
            marginBottom: 18,
          }}
        >
          {/*
            ORIENTACAO PARA CODEX / EXECUTORES FUTUROS:
            - Este é o modelo correto do Diagnóstico: checklist executável.
            - Cada item contém perguntas reais, status, progresso e futura nota/risco.
            - Diagnóstico pode ser preenchido por corretor, apoio documental,
              administrativo ou coordenador, conforme permissão do módulo.
            - Ainda não salva no banco.
            - Futuramente deve alimentar:
              documentation_assessment
              financial_assessment
              private_notes
              moderation_notes
              workflow risk gates
            - Dados sensíveis não devem ir para anúncio público.
          */}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
              alignItems: 'flex-start',
              marginBottom: 14,
            }}
          >
            <div>
              <p
                style={{
                  margin: '0 0 6px',
                  fontSize: 13,
                  color: '#dc2626',
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                  fontWeight: 900,
                }}
              >
                Checklist executável do Diagnóstico
              </p>

              <h2 style={{ margin: '0 0 6px' }}>
                Documentação, financeiro, restrições e risco operacional
              </h2>

              <p
                style={{
                  margin: 0,
                  color: '#667085',
                  lineHeight: 1.5,
                  maxWidth: 980,
                }}
              >
                Esta etapa não é vistoria física. É checagem de segurança da operação:
                proprietário, autorização, matrícula, IPTU, condomínio, financiamento,
                prefeitura, cartório e risco. Pode rodar em paralelo ao levantamento.
              </p>
            </div>

            <span
              style={{
                display: 'inline-flex',
                borderRadius: 999,
                padding: '6px 10px',
                background: '#dc2626',
                color: '#fff',
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              checklist v1
            </span>
          </div>

          <div
            style={{
              border: '1px solid #fecaca',
              borderRadius: 14,
              padding: 14,
              background: '#fef2f2',
              marginBottom: 14,
            }}
          >
            <strong style={{ display: 'block', marginBottom: 6 }}>
              Regra de segurança
            </strong>
            <p style={{ margin: 0, color: '#667085', lineHeight: 1.5 }}>
              Risco alto, documentação divergente, proprietário não validado ou ausência
              de autorização podem bloquear inteligência, proposta e publicação. O sistema
              deve registrar o motivo, não apenas travar o fluxo.
            </p>
          </div>

          <div style={{ display: 'grid', gap: 14 }}>
            <article
              style={{
                border: '1px solid #d7dee8',
                borderRadius: 16,
                padding: 14,
                background: '#f8fafc',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
                <div>
                  <span style={{ display: 'inline-flex', borderRadius: 999, padding: '4px 8px', background: '#2563eb', color: '#fff', fontSize: 11, fontWeight: 900, marginBottom: 8 }}>
                    1 / Proprietário e autorização
                  </span>
                  <h3 style={{ margin: 0 }}>Conferir proprietário, representação e autorização</h3>
                </div>
                <strong style={{ color: '#f59e0b' }}>Progresso: 0%</strong>
              </div>

              <p style={{ margin: '0 0 12px', color: '#667085', lineHeight: 1.5 }}>
                Este passo valida se quem está oferecendo o imóvel tem legitimidade
                para negociar e se existe autorização mínima para a imobiliária/profissional agir.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                {[
                  {
                    label: 'Vínculo com proprietário',
                    name: 'diagnosis_owner_link_status',
                    options: ['Proprietário direto', 'Representante', 'Familiar', 'Administrador', 'Não confirmado'],
                  },
                  {
                    label: 'Documento do proprietário',
                    name: 'diagnosis_owner_document_status',
                    options: ['Comprovado', 'Pendente', 'Incompleto', 'Divergente', 'Não recebido'],
                  },
                  {
                    label: 'Autorização comercial',
                    name: 'diagnosis_authorization_status',
                    options: ['Assinada', 'Verbal', 'Pendente assinatura', 'Não autorizada', 'Precisa revisão'],
                  },
                  {
                    label: 'Exclusividade',
                    name: 'diagnosis_exclusivity_status',
                    options: ['Exclusivo', 'Não exclusivo', 'A confirmar', 'Não se aplica', 'Conflito identificado'],
                  },
                  {
                    label: 'Estado civil / anuência',
                    name: 'diagnosis_spouse_consent_status',
                    options: ['Não se aplica', 'Validado', 'Pendente', 'Precisa confirmar', 'Risco identificado'],
                  },
                  {
                    label: 'Procuração / representação',
                    name: 'diagnosis_representation_status',
                    options: ['Não se aplica', 'Validada', 'Pendente', 'Vencida', 'Precisa revisão'],
                  },
                ].map((field) => (
                  <label key={field.name} style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800 }}>
                    {field.label}
                    <select name={field.name} defaultValue="" style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff' }}>
                      <option value="">Selecionar</option>
                      {field.options.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </label>
                ))}

                <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800, gridColumn: '1 / -1' }}>
                  Observações sobre proprietário/autorização
                  <textarea
                    name="diagnosis_owner_authorization_notes"
                    rows={3}
                    placeholder="Registre quem autorizou, o que falta, se há representante, risco de anuência, procuração ou conflito."
                    style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff', resize: 'vertical' }}
                  />
                </label>
              </div>
            </article>

            <article style={{ border: '1px solid #d7dee8', borderRadius: 16, padding: 14, background: '#f8fafc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
                <div>
                  <span style={{ display: 'inline-flex', borderRadius: 999, padding: '4px 8px', background: '#7c3aed', color: '#fff', fontSize: 11, fontWeight: 900, marginBottom: 8 }}>
                    2 / Documentação do imóvel
                  </span>
                  <h3 style={{ margin: 0 }}>Verificar matrícula, registro e regularidade documental</h3>
                </div>
                <strong style={{ color: '#f59e0b' }}>Progresso: 0%</strong>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                {[
                  {
                    label: 'Matrícula / registro',
                    name: 'diagnosis_registry_status',
                    options: ['Apresentada', 'Pendente', 'Desatualizada', 'Divergente', 'Não se aplica', 'Precisa revisão'],
                  },
                  {
                    label: 'Titularidade',
                    name: 'diagnosis_ownership_status',
                    options: ['Titular confirmado', 'Representante', 'Inventário', 'Espólio', 'Empresa', 'Divergente', 'Não avaliado'],
                  },
                  {
                    label: 'Habite-se / regularidade construtiva',
                    name: 'diagnosis_construction_regularization_status',
                    options: ['Regular informado', 'Pendente', 'Irregularidade aparente', 'Não avaliado', 'Não se aplica'],
                  },
                  {
                    label: 'Divergência área/documento',
                    name: 'diagnosis_area_discrepancy_status',
                    options: ['Não identificada', 'Possível divergência', 'Divergência relevante', 'Precisa conferir', 'Não avaliado'],
                  },
                  {
                    label: 'Restrição jurídica conhecida',
                    name: 'diagnosis_legal_restriction_status',
                    options: ['Não informada', 'Não identificada', 'Restrição informada', 'Precisa pesquisa', 'Risco alto'],
                  },
                  {
                    label: 'Elegibilidade para financiamento',
                    name: 'diagnosis_financing_eligibility',
                    options: ['Provável', 'Incerta', 'Improvável', 'Não elegível', 'Não avaliada'],
                  },
                ].map((field) => (
                  <label key={field.name} style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800 }}>
                    {field.label}
                    <select name={field.name} defaultValue="" style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff' }}>
                      <option value="">Selecionar</option>
                      {field.options.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </label>
                ))}

                <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800, gridColumn: '1 / -1' }}>
                  Notas documentais
                  <textarea
                    name="diagnosis_documentation_notes"
                    rows={4}
                    placeholder="Registre documentos recebidos, pendências, divergências e o que precisa ser conferido antes de proposta/publicação."
                    style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff', resize: 'vertical' }}
                  />
                </label>
              </div>
            </article>

            <article style={{ border: '1px solid #d7dee8', borderRadius: 16, padding: 14, background: '#f8fafc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
                <div>
                  <span style={{ display: 'inline-flex', borderRadius: 999, padding: '4px 8px', background: '#f59e0b', color: '#fff', fontSize: 11, fontWeight: 900, marginBottom: 8 }}>
                    3 / Financeiro e débitos
                  </span>
                  <h3 style={{ margin: 0 }}>Levantar IPTU, condomínio, financiamento e pressão financeira</h3>
                </div>
                <strong style={{ color: '#f59e0b' }}>Progresso: 0%</strong>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                {[
                  {
                    label: 'IPTU / tributos',
                    name: 'diagnosis_tax_status',
                    options: ['Regular informado', 'Com débito informado', 'Pendente consulta', 'Não informado', 'Não se aplica'],
                  },
                  {
                    label: 'Débito de condomínio',
                    name: 'diagnosis_condo_debt_status',
                    options: ['Sem débito informado', 'Com débito informado', 'Pendente consulta', 'Não informado', 'Não se aplica'],
                  },
                  {
                    label: 'Financiamento / alienação',
                    name: 'diagnosis_financing_status',
                    options: ['Não possui', 'Possui financiamento', 'Quitação pendente', 'Alienado', 'Não informado', 'Precisa revisão'],
                  },
                  {
                    label: 'Saldo devedor',
                    name: 'diagnosis_debt_balance_status',
                    options: ['Não se aplica', 'Informado', 'Pendente', 'Incompatível com preço', 'Não informado'],
                  },
                  {
                    label: 'Risco fiscal / tributário',
                    name: 'diagnosis_tax_risk_level',
                    options: ['Baixo', 'Médio', 'Alto', 'Crítico', 'Não avaliado'],
                  },
                  {
                    label: 'Pressão financeira percebida',
                    name: 'diagnosis_financial_pressure_level',
                    options: ['Baixa', 'Média', 'Alta', 'Muito alta', 'Não avaliada'],
                  },
                ].map((field) => (
                  <label key={field.name} style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800 }}>
                    {field.label}
                    <select name={field.name} defaultValue="" style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff' }}>
                      <option value="">Selecionar</option>
                      {field.options.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </label>
                ))}

                <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800, gridColumn: '1 / -1' }}>
                  Notas financeiras
                  <textarea
                    name="diagnosis_financial_notes"
                    rows={4}
                    placeholder="Registre débitos, pressão financeira, saldo devedor, risco de negociação ou impacto no preço/proposta."
                    style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff', resize: 'vertical' }}
                  />
                </label>
              </div>
            </article>

            <article style={{ border: '1px solid #d7dee8', borderRadius: 16, padding: 14, background: '#f8fafc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
                <div>
                  <span style={{ display: 'inline-flex', borderRadius: 999, padding: '4px 8px', background: '#475467', color: '#fff', fontSize: 11, fontWeight: 900, marginBottom: 8 }}>
                    4 / Validações externas
                  </span>
                  <h3 style={{ margin: 0 }}>Consultar prefeitura, cartório e restrições externas</h3>
                </div>
                <strong style={{ color: '#f59e0b' }}>Progresso: 0%</strong>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                {[
                  {
                    label: 'Consulta prefeitura',
                    name: 'diagnosis_city_hall_check_status',
                    options: ['Não iniciada', 'Em andamento', 'Concluída', 'Bloqueada', 'Não se aplica'],
                  },
                  {
                    label: 'Consulta cartório',
                    name: 'diagnosis_registry_office_check_status',
                    options: ['Não iniciada', 'Em andamento', 'Concluída', 'Bloqueada', 'Não se aplica'],
                  },
                  {
                    label: 'Zoneamento / uso permitido',
                    name: 'diagnosis_zoning_status',
                    options: ['Compatível', 'Restrição identificada', 'Precisa consulta', 'Não avaliado', 'Não se aplica'],
                  },
                  {
                    label: 'Processos / restrições externas',
                    name: 'diagnosis_external_restriction_status',
                    options: ['Não identificado', 'Indício identificado', 'Confirmado', 'Precisa pesquisa', 'Não avaliado'],
                  },
                ].map((field) => (
                  <label key={field.name} style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800 }}>
                    {field.label}
                    <select name={field.name} defaultValue="" style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff' }}>
                      <option value="">Selecionar</option>
                      {field.options.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </label>
                ))}

                <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800, gridColumn: '1 / -1' }}>
                  Resultado das validações externas
                  <textarea
                    name="diagnosis_external_validation_notes"
                    rows={4}
                    placeholder="Registre protocolos, retorno de prefeitura/cartório, restrições, pendências e próximos passos."
                    style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff', resize: 'vertical' }}
                  />
                </label>
              </div>
            </article>

            <article style={{ border: '1px solid #d7dee8', borderRadius: 16, padding: 14, background: '#f8fafc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
                <div>
                  <span style={{ display: 'inline-flex', borderRadius: 999, padding: '4px 8px', background: '#dc2626', color: '#fff', fontSize: 11, fontWeight: 900, marginBottom: 8 }}>
                    5 / Risco
                  </span>
                  <h3 style={{ margin: 0 }}>Classificar risco documental e financeiro</h3>
                </div>
                <strong style={{ color: '#f59e0b' }}>Progresso: 0%</strong>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                {[
                  {
                    label: 'Risco documental',
                    name: 'diagnosis_documentation_risk_level',
                    options: ['Baixo', 'Médio', 'Alto', 'Crítico', 'Não avaliado'],
                  },
                  {
                    label: 'Risco financeiro',
                    name: 'diagnosis_financial_risk_level',
                    options: ['Baixo', 'Médio', 'Alto', 'Crítico', 'Não avaliado'],
                  },
                  {
                    label: 'Risco comercial causado por documentação',
                    name: 'diagnosis_commercial_blocker_level',
                    options: ['Nenhum', 'Baixo', 'Médio', 'Alto', 'Bloqueia proposta/publicação'],
                  },
                  {
                    label: 'Impacto na inteligência',
                    name: 'diagnosis_intelligence_impact',
                    options: ['Não impacta', 'Libera com ressalva', 'Aguardar pendência', 'Bloquear inteligência', 'Enviar para revisão jurídica'],
                  },
                ].map((field) => (
                  <label key={field.name} style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800 }}>
                    {field.label}
                    <select name={field.name} defaultValue="" style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff' }}>
                      <option value="">Selecionar</option>
                      {field.options.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            </article>

            <article style={{ border: '1px solid #d7dee8', borderRadius: 16, padding: 14, background: '#f8fafc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
                <div>
                  <span style={{ display: 'inline-flex', borderRadius: 999, padding: '4px 8px', background: '#111827', color: '#fff', fontSize: 11, fontWeight: 900, marginBottom: 8 }}>
                    6 / Recomendação
                  </span>
                  <h3 style={{ margin: 0 }}>Fechar recomendação do diagnóstico</h3>
                </div>
                <strong style={{ color: '#f59e0b' }}>Progresso: 0%</strong>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800 }}>
                  Recomendação documental
                  <select name="diagnosis_documentation_recommendation" defaultValue="" style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff' }}>
                    <option value="">Selecionar</option>
                    <option value="request_documents">Solicitar documentos</option>
                    <option value="proceed">Pode seguir</option>
                    <option value="proceed_with_reservations">Seguir com ressalvas</option>
                    <option value="hold">Aguardar pendências</option>
                    <option value="block">Bloquear</option>
                  </select>
                </label>

                <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800 }}>
                  Recomendação financeira
                  <select name="diagnosis_financial_recommendation" defaultValue="" style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff' }}>
                    <option value="">Selecionar</option>
                    <option value="confirm">A confirmar</option>
                    <option value="regular">Regular informado</option>
                    <option value="negotiate_debts">Negociar débitos</option>
                    <option value="adjust_price">Ajustar preço</option>
                    <option value="block">Bloquear</option>
                  </select>
                </label>

                <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800, gridColumn: '1 / -1' }}>
                  Recomendação final do diagnóstico
                  <textarea
                    name="diagnosis_final_recommendation"
                    rows={5}
                    placeholder="Explique se pode seguir, seguir com ressalvas, aguardar documento, ajustar preço, consultar jurídico ou bloquear estratégia/proposta."
                    style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff', resize: 'vertical' }}
                  />
                </label>
              </div>
            </article>
          </div>
        </section>
      )}

      {/* PIPELINE_DIAGNOSTICO_REAL_FIELDS_V1 */}
      {stepKey === 'diagnostico' && (
        <section
          style={{
            border: '1px solid #dbe3ea',
            borderRadius: 18,
            padding: 18,
            background: '#fff',
            marginBottom: 18,
          }}
        >
          {/*
            ORIENTACAO PARA CODEX / EXECUTORES FUTUROS:
            - Esta é a etapa real de Diagnóstico e Risco do Pipeline Pro.
            - Ela aprofunda o que no Levantamento aparece só como leitura inicial.
            - Ainda não salva no banco.
            - Futuramente deve alimentar:
              documentation_assessment
              financial_assessment
              private_notes
              moderation_notes
              risk_summary
            - Responsável comum:
              suporte documental, administrativo, coordenador ou corretor responsável.
            - Estes dados são internos e não devem aparecer no anúncio público.
          */}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
              alignItems: 'flex-start',
              marginBottom: 14,
            }}
          >
            <div>
              <p
                style={{
                  margin: '0 0 6px',
                  fontSize: 13,
                  color: '#dc2626',
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                  fontWeight: 900,
                }}
              >
                Diagnóstico e risco
              </p>

              <h2 style={{ margin: '0 0 6px' }}>
                Documentação, financeiro, prefeitura, cartório e impedimentos
              </h2>

              <p
                style={{
                  margin: 0,
                  color: '#667085',
                  lineHeight: 1.5,
                  maxWidth: 960,
                }}
              >
                Esta etapa transforma a checagem documental em processo operacional.
                Pode ser feita pelo corretor, apoio administrativo, coordenador ou
                setor documental da agência. O objetivo é identificar riscos antes
                de gerar estratégia, proposta e publicação.
              </p>
            </div>

            <span
              style={{
                display: 'inline-flex',
                borderRadius: 999,
                padding: '6px 10px',
                background: '#dc2626',
                color: '#fff',
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              dados internos
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 10,
              marginBottom: 14,
            }}
          >
            {[
              {
                label: 'Responsável pelo diagnóstico',
                value: 'Apoio documental / administrativo',
                detail: 'Futuro: module_responsible_profile_id.',
                color: '#2563eb',
              },
              {
                label: 'Prazo operacional',
                value: 'Paralelo ao levantamento',
                detail: 'Não precisa esperar todos os campos físicos.',
                color: '#f59e0b',
              },
              {
                label: 'Efeito no fluxo',
                value: 'Pode bloquear inteligência',
                detail: 'Risco alto deve impedir proposta fraca.',
                color: '#dc2626',
              },
              {
                label: 'Visibilidade',
                value: 'Interna',
                detail: 'Não expor ao proprietário sem resumo adequado.',
                color: '#475467',
              },
            ].map((item) => (
              <article
                key={item.label}
                style={{
                  border: '1px solid #d7dee8',
                  borderRadius: 14,
                  padding: 12,
                  background: '#f8fafc',
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    borderRadius: 999,
                    padding: '4px 8px',
                    background: item.color,
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 900,
                    marginBottom: 8,
                  }}
                >
                  {item.label}
                </span>

                <strong style={{ display: 'block', fontSize: 15 }}>
                  {item.value}
                </strong>

                <p
                  style={{
                    margin: '6px 0 0',
                    color: '#667085',
                    fontSize: 12,
                    lineHeight: 1.4,
                  }}
                >
                  {item.detail}
                </p>
              </article>
            ))}
          </div>

          <div style={{ display: 'grid', gap: 16 }}>
            <section
              style={{
                border: '1px solid #d7dee8',
                borderRadius: 16,
                padding: 14,
                background: '#f8fafc',
              }}
            >
              <h3 style={{ margin: '0 0 8px' }}>
                1. Situação documental do imóvel
              </h3>

              <p style={{ margin: '0 0 12px', color: '#667085', lineHeight: 1.5 }}>
                Checagem de titularidade, matrícula, autorização e consistência mínima
                para seguir com proposta e publicação.
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 10,
                }}
              >
                {[
                  {
                    label: 'Matrícula / registro do imóvel',
                    name: 'property_registry_status',
                    options: ['Apresentada', 'Pendente', 'Desatualizada', 'Divergente', 'Não se aplica', 'Precisa revisão'],
                  },
                  {
                    label: 'Titularidade',
                    name: 'ownership_status',
                    options: ['Titular confirmado', 'Representante', 'Inventário', 'Espólio', 'Empresa', 'Divergente', 'Não avaliado'],
                  },
                  {
                    label: 'Autorização para comercialização',
                    name: 'commercial_authorization_status',
                    options: ['Formalizada', 'Verbal', 'Pendente assinatura', 'Não autorizada', 'Precisa revisão'],
                  },
                  {
                    label: 'Documentos do proprietário',
                    name: 'owner_document_status',
                    options: ['Completos', 'Pendentes', 'Incompletos', 'Divergentes', 'Não recebidos'],
                  },
                  {
                    label: 'Estado civil / anuência',
                    name: 'spouse_consent_status',
                    options: ['Não se aplica', 'Validado', 'Pendente', 'Precisa confirmar', 'Risco identificado'],
                  },
                  {
                    label: 'Procuração / representação',
                    name: 'representation_status',
                    options: ['Não se aplica', 'Validada', 'Pendente', 'Vencida', 'Precisa revisão'],
                  },
                ].map((field) => (
                  <label
                    key={field.name}
                    style={{
                      display: 'grid',
                      gap: 6,
                      fontSize: 13,
                      color: '#344054',
                      fontWeight: 800,
                    }}
                  >
                    {field.label}
                    <select
                      name={field.name}
                      defaultValue=""
                      style={{
                        border: '1px solid #d7dee8',
                        borderRadius: 10,
                        padding: '10px 11px',
                        background: '#fff',
                        color: '#111827',
                      }}
                    >
                      <option value="">Selecionar</option>
                      {field.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}

                <label
                  style={{
                    display: 'grid',
                    gap: 6,
                    fontSize: 13,
                    color: '#344054',
                    fontWeight: 800,
                    gridColumn: '1 / -1',
                  }}
                >
                  Observações documentais
                  <textarea
                    name="documentation_notes"
                    rows={4}
                    placeholder="Registre pendências, divergências, documentos faltantes, necessidade de cartório, prefeitura ou validação jurídica."
                    style={{
                      border: '1px solid #d7dee8',
                      borderRadius: 10,
                      padding: '10px 11px',
                      background: '#fff',
                      color: '#111827',
                      resize: 'vertical',
                    }}
                  />
                </label>
              </div>
            </section>

            <section
              style={{
                border: '1px solid #d7dee8',
                borderRadius: 16,
                padding: 14,
                background: '#f8fafc',
              }}
            >
              <h3 style={{ margin: '0 0 8px' }}>
                2. Situação financeira e débitos
              </h3>

              <p style={{ margin: '0 0 12px', color: '#667085', lineHeight: 1.5 }}>
                Débitos podem afetar preço, proposta, urgência, negociação e segurança
                da operação.
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 10,
                }}
              >
                {[
                  {
                    label: 'IPTU / tributos',
                    name: 'property_tax_status',
                    options: ['Regular informado', 'Com débito informado', 'Pendente consulta', 'Não informado', 'Não se aplica'],
                  },
                  {
                    label: 'Débito de condomínio',
                    name: 'condominium_debt_status',
                    options: ['Sem débito informado', 'Com débito informado', 'Pendente consulta', 'Não informado', 'Não se aplica'],
                  },
                  {
                    label: 'Financiamento ativo',
                    name: 'active_financing_status',
                    options: ['Não possui', 'Possui financiamento', 'Quitação pendente', 'Não informado', 'Precisa revisão'],
                  },
                  {
                    label: 'Alienação / garantia',
                    name: 'collateral_status',
                    options: ['Não identificado', 'Alienado', 'Garantia ativa', 'Precisa confirmar', 'Não avaliado'],
                  },
                  {
                    label: 'Ações / processos conhecidos',
                    name: 'legal_dispute_status',
                    options: ['Não informado', 'Sem processo informado', 'Há processo informado', 'Precisa pesquisa', 'Risco alto'],
                  },
                  {
                    label: 'Pressão financeira percebida',
                    name: 'financial_pressure_level',
                    options: ['Baixa', 'Média', 'Alta', 'Muito alta', 'Não avaliada'],
                  },
                ].map((field) => (
                  <label
                    key={field.name}
                    style={{
                      display: 'grid',
                      gap: 6,
                      fontSize: 13,
                      color: '#344054',
                      fontWeight: 800,
                    }}
                  >
                    {field.label}
                    <select
                      name={field.name}
                      defaultValue=""
                      style={{
                        border: '1px solid #d7dee8',
                        borderRadius: 10,
                        padding: '10px 11px',
                        background: '#fff',
                        color: '#111827',
                      }}
                    >
                      <option value="">Selecionar</option>
                      {field.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}

                <label
                  style={{
                    display: 'grid',
                    gap: 6,
                    fontSize: 13,
                    color: '#344054',
                    fontWeight: 800,
                    gridColumn: '1 / -1',
                  }}
                >
                  Notas financeiras
                  <textarea
                    name="financial_notes"
                    rows={4}
                    placeholder="Registre débitos, necessidade de consulta, impacto no preço, urgência do proprietário ou riscos que possam afetar a negociação."
                    style={{
                      border: '1px solid #d7dee8',
                      borderRadius: 10,
                      padding: '10px 11px',
                      background: '#fff',
                      color: '#111827',
                      resize: 'vertical',
                    }}
                  />
                </label>
              </div>
            </section>

            <section
              style={{
                border: '1px solid #d7dee8',
                borderRadius: 16,
                padding: 14,
                background: '#f8fafc',
              }}
            >
              <h3 style={{ margin: '0 0 8px' }}>
                3. Prefeitura, cartório e validações externas
              </h3>

              <p style={{ margin: '0 0 12px', color: '#667085', lineHeight: 1.5 }}>
                Módulo próprio para apoio administrativo consultar informações fora
                do atendimento de campo.
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 10,
                }}
              >
                {[
                  {
                    label: 'Consulta prefeitura',
                    name: 'city_hall_check_status',
                    options: ['Não iniciada', 'Em andamento', 'Concluída', 'Bloqueada', 'Não se aplica'],
                  },
                  {
                    label: 'Consulta cartório',
                    name: 'registry_office_check_status',
                    options: ['Não iniciada', 'Em andamento', 'Concluída', 'Bloqueada', 'Não se aplica'],
                  },
                  {
                    label: 'Zoneamento / uso permitido',
                    name: 'zoning_status',
                    options: ['Não avaliado', 'Compatível', 'Restrição identificada', 'Precisa consulta', 'Não se aplica'],
                  },
                  {
                    label: 'Habite-se / regularidade construtiva',
                    name: 'construction_regularization_status',
                    options: ['Não avaliado', 'Regular informado', 'Pendente', 'Irregularidade aparente', 'Não se aplica'],
                  },
                ].map((field) => (
                  <label
                    key={field.name}
                    style={{
                      display: 'grid',
                      gap: 6,
                      fontSize: 13,
                      color: '#344054',
                      fontWeight: 800,
                    }}
                  >
                    {field.label}
                    <select
                      name={field.name}
                      defaultValue=""
                      style={{
                        border: '1px solid #d7dee8',
                        borderRadius: 10,
                        padding: '10px 11px',
                        background: '#fff',
                        color: '#111827',
                      }}
                    >
                      <option value="">Selecionar</option>
                      {field.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}

                <label
                  style={{
                    display: 'grid',
                    gap: 6,
                    fontSize: 13,
                    color: '#344054',
                    fontWeight: 800,
                    gridColumn: '1 / -1',
                  }}
                >
                  Resultado das validações externas
                  <textarea
                    name="external_validation_notes"
                    rows={4}
                    placeholder="Registre protocolos, informações levantadas, pendências de prefeitura/cartório e providências necessárias."
                    style={{
                      border: '1px solid #d7dee8',
                      borderRadius: 10,
                      padding: '10px 11px',
                      background: '#fff',
                      color: '#111827',
                      resize: 'vertical',
                    }}
                  />
                </label>
              </div>
            </section>

            <section
              style={{
                border: '1px solid #d7dee8',
                borderRadius: 16,
                padding: 14,
                background: '#f8fafc',
              }}
            >
              <h3 style={{ margin: '0 0 8px' }}>
                4. Classificação de risco e recomendação
              </h3>

              <p style={{ margin: '0 0 12px', color: '#667085', lineHeight: 1.5 }}>
                Conclusão operacional do diagnóstico. Esta leitura deve influenciar
                se a inteligência libera, libera com ressalva ou bloqueia a proposta.
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 10,
                }}
              >
                <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800 }}>
                  Nível geral de risco
                  <select name="overall_risk_level" defaultValue="" style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff' }}>
                    <option value="">Selecionar</option>
                    <option value="low">Baixo</option>
                    <option value="medium">Médio</option>
                    <option value="high">Alto</option>
                    <option value="critical">Crítico</option>
                    <option value="unknown">Não avaliado</option>
                  </select>
                </label>

                <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800 }}>
                  Recomendação do diagnóstico
                  <select name="diagnosis_recommendation_status" defaultValue="" style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff' }}>
                    <option value="">Selecionar</option>
                    <option value="proceed">Pode seguir</option>
                    <option value="proceed_with_reservations">Seguir com ressalvas</option>
                    <option value="hold">Aguardar pendências</option>
                    <option value="block">Bloquear estratégia/proposta</option>
                    <option value="legal_review">Enviar para revisão jurídica</option>
                  </select>
                </label>

                <label
                  style={{
                    display: 'grid',
                    gap: 6,
                    fontSize: 13,
                    color: '#344054',
                    fontWeight: 800,
                    gridColumn: '1 / -1',
                  }}
                >
                  Recomendação final do diagnóstico
                  <textarea
                    name="diagnosis_final_recommendation"
                    rows={5}
                    placeholder="Explique se o imóvel pode avançar, se precisa ressalvas, se deve aguardar documento ou se deve bloquear estratégia/proposta."
                    style={{
                      border: '1px solid #d7dee8',
                      borderRadius: 10,
                      padding: '10px 11px',
                      background: '#fff',
                      color: '#111827',
                      resize: 'vertical',
                    }}
                  />
                </label>
              </div>
            </section>
          </div>
        </section>
      )}


      {/* PIPELINE_INTELIGENCIA_REAL_FIELDS_V1 */}
      {stepKey === 'inteligencia' && (
        <section
          style={{
            border: '1px solid #dbe3ea',
            borderRadius: 18,
            padding: 18,
            background: '#fff',
            marginBottom: 18,
          }}
        >
          {/*
            ORIENTACAO PARA CODEX / EXECUTORES FUTUROS:
            - Esta é a camada cerebral do Pipeline Pro.
            - Ainda não salva no banco.
            - Não conectar IA agora.
            - A inteligência deve consumir dados do levantamento, diagnóstico,
              proprietário, fotos, localização, preço e risco.
            - Futuramente deve alimentar:
              commercial_assessment
              public_summary
              owner_visibility_summary
              partner_visibility_summary
              private_notes
              metadata.strategy
            - Esta etapa só deveria liberar quando os módulos essenciais atingirem maturidade mínima.
          */}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
              alignItems: 'flex-start',
              marginBottom: 14,
            }}
          >
            <div>
              <p
                style={{
                  margin: '0 0 6px',
                  fontSize: 13,
                  color: '#7c3aed',
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                  fontWeight: 900,
                }}
              >
                Inteligência estratégica
              </p>

              <h2 style={{ margin: '0 0 6px' }}>
                Preço, posicionamento, narrativa e plano de ataque
              </h2>

              <p
                style={{
                  margin: 0,
                  color: '#667085',
                  lineHeight: 1.5,
                  maxWidth: 960,
                }}
              >
                Esta etapa interpreta os dados coletados e transforma levantamento
                em estratégia. Aqui nasce a direção de preço, abordagem comercial,
                proposta ao proprietário, script para equipe e futuro anúncio.
              </p>
            </div>

            <span
              style={{
                display: 'inline-flex',
                borderRadius: 999,
                padding: '6px 10px',
                background: '#7c3aed',
                color: '#fff',
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              cérebro do pipeline
            </span>
          </div>

          <div
            style={{
              border: '1px solid #f59e0b',
              borderRadius: 14,
              padding: 14,
              background: '#fffbeb',
              marginBottom: 14,
            }}
          >
            <strong style={{ display: 'block', marginBottom: 6 }}>
              Regra de liberação
            </strong>

            <p style={{ margin: 0, color: '#667085', lineHeight: 1.5 }}>
              A inteligência não deve gerar estratégia com dados fracos. Na foundation,
              esta tela fica visível para modelagem. No workflow real, deve liberar
              apenas com maturidade mínima, por exemplo 60% nos módulos essenciais,
              ou encerramento formal justificado dos módulos impossíveis.
            </p>
          </div>

          <div style={{ display: 'grid', gap: 16 }}>
            <section
              style={{
                border: '1px solid #d7dee8',
                borderRadius: 16,
                padding: 14,
                background: '#f8fafc',
              }}
            >
              <h3 style={{ margin: '0 0 8px' }}>
                1. Leitura de preço e agressividade
              </h3>

              <p style={{ margin: '0 0 12px', color: '#667085', lineHeight: 1.5 }}>
                Consolida preço pedido, percepção de mercado, risco, liquidez e
                recomendação profissional.
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 10,
                }}
              >
                <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800 }}>
                  Preço pedido pelo proprietário
                  <input
                    name="owner_requested_price_strategy"
                    placeholder="Ex.: 850000"
                    inputMode="numeric"
                    style={{
                      border: '1px solid #d7dee8',
                      borderRadius: 10,
                      padding: '10px 11px',
                      background: '#fff',
                    }}
                  />
                </label>

                <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800 }}>
                  Preço recomendado pelo profissional
                  <input
                    name="professional_recommended_price"
                    placeholder="Ex.: 790000"
                    inputMode="numeric"
                    style={{
                      border: '1px solid #d7dee8',
                      borderRadius: 10,
                      padding: '10px 11px',
                      background: '#fff',
                    }}
                  />
                </label>

                <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800 }}>
                  Faixa mínima estratégica
                  <input
                    name="strategic_min_price"
                    placeholder="Ex.: 760000"
                    inputMode="numeric"
                    style={{
                      border: '1px solid #d7dee8',
                      borderRadius: 10,
                      padding: '10px 11px',
                      background: '#fff',
                    }}
                  />
                </label>

                <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800 }}>
                  Agressividade comercial
                  <select name="commercial_aggressiveness" defaultValue="" style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff' }}>
                    <option value="">Selecionar</option>
                    <option value="conservative">Conservadora</option>
                    <option value="balanced">Equilibrada</option>
                    <option value="aggressive">Agressiva</option>
                    <option value="urgent_sale">Venda urgente</option>
                    <option value="premium_positioning">Posicionamento premium</option>
                  </select>
                </label>

                <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800 }}>
                  Classificação de liquidez
                  <select name="liquidity_strategy" defaultValue="" style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff' }}>
                    <option value="">Selecionar</option>
                    <option value="low">Baixa liquidez</option>
                    <option value="medium">Liquidez média</option>
                    <option value="high">Alta liquidez</option>
                    <option value="opportunity">Oportunidade forte</option>
                    <option value="hard_sell">Venda difícil</option>
                  </select>
                </label>

                <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800 }}>
                  Confiança da recomendação
                  <select name="strategy_confidence_level" defaultValue="" style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff' }}>
                    <option value="">Selecionar</option>
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                    <option value="needs_more_data">Precisa mais dados</option>
                  </select>
                </label>

                <label
                  style={{
                    display: 'grid',
                    gap: 6,
                    fontSize: 13,
                    color: '#344054',
                    fontWeight: 800,
                    gridColumn: '1 / -1',
                  }}
                >
                  Justificativa da estratégia de preço
                  <textarea
                    name="price_strategy_rationale"
                    rows={4}
                    placeholder="Explique por que esse preço faz sentido: localização, estado, liquidez, documentação, concorrência, urgência e perfil do proprietário."
                    style={{
                      border: '1px solid #d7dee8',
                      borderRadius: 10,
                      padding: '10px 11px',
                      background: '#fff',
                      resize: 'vertical',
                    }}
                  />
                </label>
              </div>
            </section>

            <section
              style={{
                border: '1px solid #d7dee8',
                borderRadius: 16,
                padding: 14,
                background: '#f8fafc',
              }}
            >
              <h3 style={{ margin: '0 0 8px' }}>
                2. Posicionamento e público-alvo
              </h3>

              <p style={{ margin: '0 0 12px', color: '#667085', lineHeight: 1.5 }}>
                Define como o imóvel será apresentado e para quem a campanha deve falar.
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 10,
                }}
              >
                <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800 }}>
                  Posicionamento do imóvel
                  <select name="property_positioning" defaultValue="" style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff' }}>
                    <option value="">Selecionar</option>
                    <option value="standard">Anúncio padrão</option>
                    <option value="premium">Anúncio premium</option>
                    <option value="opportunity">Oportunidade</option>
                    <option value="investment">Investimento</option>
                    <option value="family_home">Moradia familiar</option>
                    <option value="income_property">Renda/locação</option>
                    <option value="hard_to_sell">Difícil liquidez</option>
                  </select>
                </label>

                <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800 }}>
                  Público-alvo principal
                  <input
                    name="primary_target_audience"
                    placeholder="Ex.: família com filhos, investidor, casal jovem, alto padrão"
                    style={{
                      border: '1px solid #d7dee8',
                      borderRadius: 10,
                      padding: '10px 11px',
                      background: '#fff',
                    }}
                  />
                </label>

                <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800 }}>
                  Perfil de uso estratégico
                  <select name="strategic_use_profile" defaultValue="" style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff' }}>
                    <option value="">Selecionar</option>
                    <option value="family_housing">Moradia familiar</option>
                    <option value="investment">Investimento</option>
                    <option value="traditional_rental">Locação tradicional</option>
                    <option value="short_term_rental">Temporada / Airbnb</option>
                    <option value="senior_living">Terceira idade</option>
                    <option value="commercial">Comercial</option>
                    <option value="mixed">Misto</option>
                  </select>
                </label>

                <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800 }}>
                  Melhor canal inicial
                  <select name="primary_distribution_channel" defaultValue="" style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff' }}>
                    <option value="">Selecionar</option>
                    <option value="marketplace">Marketplace</option>
                    <option value="agency_network">Rede da imobiliária</option>
                    <option value="social_media">Redes sociais</option>
                    <option value="internal_brokers">Corretores internos</option>
                    <option value="partners">Parceiros</option>
                    <option value="premium_campaign">Campanha premium</option>
                  </select>
                </label>

                <label
                  style={{
                    display: 'grid',
                    gap: 6,
                    fontSize: 13,
                    color: '#344054',
                    fontWeight: 800,
                    gridColumn: '1 / -1',
                  }}
                >
                  Narrativa estratégica do imóvel
                  <textarea
                    name="strategic_narrative"
                    rows={4}
                    placeholder="Defina o eixo da comunicação: o que vender primeiro, qual emoção acionar, qual diferencial destacar e qual objeção neutralizar."
                    style={{
                      border: '1px solid #d7dee8',
                      borderRadius: 10,
                      padding: '10px 11px',
                      background: '#fff',
                      resize: 'vertical',
                    }}
                  />
                </label>
              </div>
            </section>

            <section
              style={{
                border: '1px solid #d7dee8',
                borderRadius: 16,
                padding: 14,
                background: '#f8fafc',
              }}
            >
              <h3 style={{ margin: '0 0 8px' }}>
                3. Script e plano de ação
              </h3>

              <p style={{ margin: '0 0 12px', color: '#667085', lineHeight: 1.5 }}>
                Base para equipe comercial, proposta ao proprietário e futura publicação.
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 10,
                }}
              >
                <label
                  style={{
                    display: 'grid',
                    gap: 6,
                    fontSize: 13,
                    color: '#344054',
                    fontWeight: 800,
                    gridColumn: '1 / -1',
                  }}
                >
                  Script para corretores oferecerem o imóvel
                  <textarea
                    name="broker_sales_script"
                    rows={4}
                    placeholder="Crie um argumento curto para equipe: como apresentar, para quem oferecer, como abrir conversa e quais diferenciais usar."
                    style={{
                      border: '1px solid #d7dee8',
                      borderRadius: 10,
                      padding: '10px 11px',
                      background: '#fff',
                      resize: 'vertical',
                    }}
                  />
                </label>

                <label
                  style={{
                    display: 'grid',
                    gap: 6,
                    fontSize: 13,
                    color: '#344054',
                    fontWeight: 800,
                    gridColumn: '1 / -1',
                  }}
                >
                  Argumentação para o proprietário
                  <textarea
                    name="owner_argument"
                    rows={4}
                    placeholder="Explique como defender preço, fotos, ajustes, prazo, estratégia e abordagem profissional para o proprietário."
                    style={{
                      border: '1px solid #d7dee8',
                      borderRadius: 10,
                      padding: '10px 11px',
                      background: '#fff',
                      resize: 'vertical',
                    }}
                  />
                </label>

                <label
                  style={{
                    display: 'grid',
                    gap: 6,
                    fontSize: 13,
                    color: '#344054',
                    fontWeight: 800,
                    gridColumn: '1 / -1',
                  }}
                >
                  Plano de ação antes da publicação
                  <textarea
                    name="pre_publication_action_plan"
                    rows={4}
                    placeholder="Liste o que precisa acontecer antes de publicar: fotos, documentos, ajuste de preço, aprovação, destaque, revisão do texto, pendências."
                    style={{
                      border: '1px solid #d7dee8',
                      borderRadius: 10,
                      padding: '10px 11px',
                      background: '#fff',
                      resize: 'vertical',
                    }}
                  />
                </label>

                <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800 }}>
                  Status da estratégia
                  <select name="strategy_status" defaultValue="" style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff' }}>
                    <option value="">Selecionar</option>
                    <option value="draft">Rascunho</option>
                    <option value="ready_for_owner_proposal">Pronta para proposta</option>
                    <option value="needs_review">Precisa revisão</option>
                    <option value="blocked_by_risk">Bloqueada por risco</option>
                    <option value="waiting_more_data">Aguardando mais dados</option>
                  </select>
                </label>

                <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#344054', fontWeight: 800 }}>
                  Próxima etapa sugerida
                  <select name="next_recommended_step" defaultValue="" style={{ border: '1px solid #d7dee8', borderRadius: 10, padding: '10px 11px', background: '#fff' }}>
                    <option value="">Selecionar</option>
                    <option value="owner_proposal">Gerar proposta ao proprietário</option>
                    <option value="price_alignment">Alinhar preço</option>
                    <option value="photo_review">Revisar fotos</option>
                    <option value="document_review">Resolver documentação</option>
                    <option value="publish">Seguir para publicação</option>
                  </select>
                </label>
              </div>
            </section>
          </div>
        </section>
      )}

      {/* PIPELINE_STEP_FOOTER_NAV_V1 */}
      {/*
        ORIENTACAO PARA CODEX / EXECUTORES FUTUROS:
        - Estes botoes sao navegacao visual da V1.
        - Nao representam desbloqueio real de etapa.
        - Futuramente devem considerar progresso, pendencias obrigatorias,
          permissao, validacoes e status real do backend.
        - Preservar listingId/mode=attach quando o Pipeline Pro estiver acoplado
          a um anuncio existente.
      */}
      <section
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
          border: '1px solid #dbe3ea',
          borderRadius: 18,
          padding: 16,
          background: '#fff',
          marginTop: 20,
        }}
      >
        <div>
          {previousStep ? (
            <Link
              href={buildStepHref(previousStep)}
              style={{
                display: 'inline-flex',
                padding: '10px 14px',
                borderRadius: 10,
                border: '1px solid #d7dee8',
                background: '#f8fafc',
                color: '#344054',
                textDecoration: 'none',
                fontWeight: 700,
              }}
            >
              Voltar para {getPipelineStepDefinition(previousStep).shortLabel}
            </Link>
          ) : (
            <Link
              href="/operations/pipeline"
              style={{
                display: 'inline-flex',
                padding: '10px 14px',
                borderRadius: 10,
                border: '1px solid #d7dee8',
                background: '#f8fafc',
                color: '#344054',
                textDecoration: 'none',
                fontWeight: 700,
              }}
            >
              Voltar para visão geral
            </Link>
          )}
        </div>

        <div>
          {nextStep ? (
            <Link
              href={buildStepHref(nextStep)}
              style={{
                display: 'inline-flex',
                padding: '10px 14px',
                borderRadius: 10,
                border: '1px solid #2563eb',
                background: '#2563eb',
                color: '#fff',
                textDecoration: 'none',
                fontWeight: 800,
              }}
            >
              Avançar para {getPipelineStepDefinition(nextStep).shortLabel}
            </Link>
          ) : (
            <Link
              href="/operations/pipeline"
              style={{
                display: 'inline-flex',
                padding: '10px 14px',
                borderRadius: 10,
                border: '1px solid #16a34a',
                background: '#16a34a',
                color: '#fff',
                textDecoration: 'none',
                fontWeight: 800,
              }}
            >
              Concluir visão do fluxo
            </Link>
          )}
        </div>
      </section>
    </main>
  )
}
