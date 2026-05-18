'use client'


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
HURBY — PIPELINE PRO / CAPTACAO PRO
LOCAL:
src/app/operations/pipeline/page.tsx

STATUS:
PIPELINE_PRO_FOUNDATION_V1

OBJETIVO:
Criar a entrada operacional do fluxo profissional.

REGRA DE PRODUTO:
- Esta pagina nao substitui o Dossie do Imovel.
- Esta pagina nao substitui a Analise Patrimonial.
- Esta pagina inicia o processo guiado: captacao, levantamento, diagnostico, estrategia, proposta, publicacao e lifecycle.
- Nesta V1, nao grava no banco e nao cria tabelas.
- Proxima evolucao deve conectar cada pipeline aos registros reais.

PAPEIS:
- Pipeline Pro: executa o processo.
- Analise Patrimonial: avalia e gera inteligencia.
- Anuncio: publica e comercializa.
- Dossie: consolida historico, dados, decisoes e lifecycle.

NAO MEXER SEM AUDITORIA:
- services;
- migrations;
- RLS;
- RPCs;
- schema;
- contratos de dados.
=========================================
*/

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  buildPipelineStepHref,
  getPipelineLayerColor,
  getPipelineStepDefinition,
  pipelineStepOrder,
} from '@/lib/services/pipelineProService'
import { getPipelineCentralListingCandidates } from '@/lib/services/propertyService'

const phases = [
  {
    title: '1. Atendimento e captacao',
    owner: 'Corretor/Atendimento',
    deadline: '24h para movimentar',
    urgency: 'Alta',
    done: 'Aberto',
    maturity: 'Entrada',
    maturityColor: '#2563eb',
    access: 'Liberada',
    accessColor: '#16a34a',
    layer: 'Operacao',
    layerColor: '#2563eb',
    nextAction: 'Registrar oportunidade ou iniciar Anuncio Placeholder',
    route: 'atendimento',
    status: 'Base V1',
    progress: 15,
    description:
      'Entrada rapida da oportunidade: proprietario, telefone, origem, titulo interno e agendamento.',
    pipelines: [
      'Atendimento inicial',
      'Proprietario preliminar',
      'Agendamento de vistoria',
      'Origem da oportunidade',
    ],
  },
  {
    title: '2. Levantamento do patrimonio',
    owner: 'Corretor ou vistoriador',
    deadline: '12h após vistoria',
    urgency: 'Alta',
    done: 'Em execução',
    maturity: 'Operacional',
    maturityColor: '#2563eb',
    access: 'Liberada',
    accessColor: '#16a34a',
    layer: 'Operacao',
    layerColor: '#2563eb',
    nextAction: 'Levantar dados fisicos, acabamento e evidencias',
    route: 'levantamento',
    status: 'Em desenho',
    progress: 20,
    description:
      'Vistoria e coleta por tipo/subtipo: composicao, acabamento, condominio, entorno e evidencias.',
    pipelines: [
      'Tipo e subtipo',
      'Composicao do imovel',
      'Acabamento e padrao',
      'Fotos e evidencias',
    ],
  },
  {
    title: '3. Diagnostico e risco',
    owner: 'Suporte documental',
    deadline: 'Prazo operacional',
    urgency: 'Média',
    done: 'Pendente',
    layer: 'Operacao',
    layerColor: '#2563eb',
    nextAction: 'Organizar risco, documentos, mercado e proprietario',
    route: 'diagnostico',
    status: 'Em desenho',
    progress: 10,
    description:
      'Leitura financeira, documental, geografica, perfil do proprietario, pesquisa de mercado e riscos.',
    pipelines: [
      'Perfil do proprietario',
      'Financeiro e IPTU',
      'Documentacao e risco',
      'Pesquisa de mercado',
    ],
  },
  {
    title: '4. Inteligencia estrategica',
    owner: 'Inteligência/coordenação',
    deadline: 'Após base mínima',
    urgency: 'Condicional',
    done: 'Bloqueada',
    maturity: 'Cérebro',
    maturityColor: '#7c3aed',
    access: 'Dependente de dados',
    accessColor: '#f59e0b',
    layer: 'Inteligencia',
    layerColor: '#7c3aed',
    nextAction: 'Gerar recomendacao profissional e decisao comercial',
    route: 'estrategia',
    status: 'Em desenho',
    progress: 10,
    description:
      'Preco, posicionamento, canais, distribuicao, adendos estrategicos e proposta de comercializacao.',
    pipelines: [
      'Pontuacao do patrimonio',
      'Estrategia de preco',
      'Estrategia de distribuicao',
      'Adendos estrategicos',
    ],
  },
  {
    title: '5. Proposta e aprovacao',
    owner: 'Corretor/gestor',
    deadline: 'Após inteligência',
    urgency: 'Condicional',
    done: 'Futura',
    maturity: 'Validação',
    maturityColor: '#f59e0b',
    access: 'Futura regra',
    accessColor: '#667085',
    layer: 'Validacao',
    layerColor: '#f59e0b',
    nextAction: 'Validar estrategia com agencia/proprietario',
    route: 'proposta',
    status: 'Futuro acoplavel',
    progress: 0,
    description:
      'Aprovacao interna, proposta ao proprietario, ajustes, aceite e ponto futuro para contratos.',
    pipelines: [
      'Aprovacao interna',
      'Proposta ao proprietario',
      'Contrato futuro',
      'Aceite da estrategia',
    ],
  },
  {
    title: 'Publicacao / Anuncio distribuivel',
    owner: 'Responsável do anúncio',
    deadline: 'Após aprovação',
    urgency: 'Condicional',
    done: 'Futura',
    maturity: 'Publicação',
    maturityColor: '#16a34a',
    access: 'Futura regra',
    accessColor: '#667085',
    layer: 'Publicacao',
    layerColor: '#16a34a',
    nextAction: 'Montar anuncio publico e preparar distribuicao',
    route: 'publicacao',
    status: 'Futuro acoplavel',
    progress: 0,
    description:
      'Camada independente que transforma a estrategia aprovada em anuncio distribuivel para marketplace, pagina profissional, redes, parceiros e canais futuros.',
    pipelines: [
      'Gerar anuncio publico',
      'Aplicar estrategia',
      'Parametrizar canais',
      'Publicar',
    ],
  },
  {
    title: '7. Acompanhamento e lifecycle',
    owner: 'Operação comercial',
    deadline: 'Durante anúncio ativo',
    urgency: 'Contínua',
    done: 'Futura',
    maturity: 'Lifecycle',
    maturityColor: '#7c3aed',
    access: 'Futura regra',
    accessColor: '#667085',
    layer: 'Lifecycle',
    layerColor: '#7c3aed',
    nextAction: 'Acompanhar evolucao, ajustes e encerramento',
    route: 'acompanhamento',
    status: 'Futuro acoplavel',
    progress: 0,
    description:
      'Leads, visitas, propostas, ajustes, campanhas, encerramento e historico consolidado.',
    pipelines: [
      'Acompanhamento futuro',
      'Ajustes do anuncio',
      'Saida do ar',
      'Dossie/lifecycle',
    ],
  },
]


// PIPELINE_MAIN_SERVICE_HELPERS_V1
function getPipelineServiceCardData(stepKey: string) {
  const definition = getPipelineStepDefinition(stepKey)
  const layerColor = getPipelineLayerColor(definition.layer)

  return {
    key: definition.key,
    label: definition.label,
    shortLabel: definition.shortLabel,
    layer: definition.layerLabel,
    layerColor,
    ownerHint: definition.ownerHint,
    deadlineHint: definition.deadlineHint,
    urgencyHint: definition.urgencyHint,
    accessHint: definition.accessHint,
    description: definition.description,
    href: buildPipelineStepHref({ stepKey: definition.key }),
  }
}

const pipelineServiceCards = pipelineStepOrder.map(getPipelineServiceCardData)



// PIPELINE_CENTRAL_KPI_PREVIEW_DATA_V1
const pipelineCentralKpiPreview = [
  {
    label: 'Pipelines ativos',
    value: '3',
    detail: 'Captações profissionais em andamento',
    color: '#2563eb',
  },
  {
    label: 'Em atraso ou risco',
    value: '1',
    detail: 'Exigem ação do responsável ou gestor',
    color: '#dc2626',
  },
  {
    label: 'Com suporte envolvido',
    value: '2',
    detail: 'Módulos atribuídos a apoio/documental',
    color: '#7c3aed',
  },
  {
    label: 'Prontos para inteligência',
    value: '1',
    detail: 'Base operacional próxima da maturidade mínima',
    color: '#16a34a',
  },
]

const pipelineCentralFilterPreview = [
  'Todos',
  'Meus pipelines',
  'Em atraso',
  'Aguardando suporte',
  'Prontos para inteligência',
  'Placeholder',
  'Modo consulta',
]

// PIPELINE_ACTIVE_WORKFLOWS_PREVIEW_DATA_V1
const pipelineActiveWorkflowPreview = [
  {
    id: 'preview-florais-helio',
    internalName: 'Captação Florais - Hélio',
    ownerName: 'Hélio',
    responsible: 'Marcos',
    currentStep: 'Levantamento',
    currentStepKey: 'levantamento',
    context: 'Casa em condomínio',
    progress: 62,
    deadline: 'Vence em 3h',
    urgency: 'Alta',
    urgencyColor: '#dc2626',
    status: 'Em andamento',
    statusColor: '#2563eb',
    permission: 'Gestão liberada',
    permissionColor: '#16a34a',
    nextAction: 'Completar fotos, composição do imóvel e dados do entorno.',
  },
  {
    id: 'preview-jardim-ana',
    internalName: 'Captação Jardim Itália - Ana',
    ownerName: 'Ana',
    responsible: 'Carlos',
    currentStep: 'Diagnóstico',
    currentStepKey: 'diagnostico',
    context: 'Apartamento',
    progress: 44,
    deadline: 'Atenção: prazo em risco',
    urgency: 'Média',
    urgencyColor: '#f59e0b',
    status: 'Aguardando suporte',
    statusColor: '#7c3aed',
    permission: 'Consulta operacional',
    permissionColor: '#f59e0b',
    nextAction: 'Validar documentação, débitos, matrícula e situação cadastral.',
  },
  {
    id: 'preview-condominio-roberto',
    internalName: 'Captação Condomínio X - Roberto',
    ownerName: 'Roberto',
    responsible: 'Suporte documental',
    currentStep: 'Prefeitura/cartório',
    currentStepKey: 'diagnostico',
    context: 'Terreno em condomínio',
    progress: 78,
    deadline: 'Dentro do prazo',
    urgency: 'Baixa',
    urgencyColor: '#16a34a',
    status: 'Quase pronto',
    statusColor: '#16a34a',
    permission: 'Módulo atribuído',
    permissionColor: '#2563eb',
    nextAction: 'Encerrar diagnóstico com justificativa ou anexar evidências finais.',
  },
]


// PIPELINE_CENTRAL_FORMAT_MONEY_V1
function formatPipelineCentralMoney(value: unknown) {
  if (typeof value !== 'number') {
    return 'Preço não informado'
  }

  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export default function PipelinePage() {
  // PIPELINE_CENTRAL_REAL_LISTINGS_STATE_V1
  const [realListingCandidates, setRealListingCandidates] = useState<any[]>([])
  const [realListingCandidatesStatus, setRealListingCandidatesStatus] = useState('')
  const [realListingCandidatesError, setRealListingCandidatesError] = useState('')

  // PIPELINE_CENTRAL_REAL_LISTINGS_FETCH_V1
  useEffect(() => {
    let active = true

    async function loadRealListingCandidates() {
      setRealListingCandidatesStatus('Carregando anúncios reais candidatos ao Pipeline Pro...')
      setRealListingCandidatesError('')

      const response = await getPipelineCentralListingCandidates()

      if (!active) return

      if (response.error) {
        console.error('PIPELINE CENTRAL LISTINGS ERROR:', response.error)
        setRealListingCandidates([])
        setRealListingCandidatesStatus('')
        setRealListingCandidatesError('Não foi possível carregar anúncios reais agora.')
        return
      }

      setRealListingCandidates(response.data || [])
      setRealListingCandidatesStatus(
        response.data?.length
          ? 'Anúncios reais carregados.'
          : 'Nenhum anúncio acessível encontrado para acoplar ao Pipeline Pro.'
      )
    }

    loadRealListingCandidates()

    return () => {
      active = false
    }
  }, [])


  return (
    <main
      style={{
        padding: 24,
        maxWidth: 1180,
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
        <Link href="/operations/properties">Core Imobiliario</Link>
        <Link href="/operations/properties/new">Cadastrar imovel</Link>
        <Link href="/operations/properties/list">Listar imoveis</Link>
        <Link href="/account">Minha conta</Link>
      </nav>

      <section
        style={{
          border: '1px solid #dbe3ea',
          borderRadius: 20,
          padding: 24,
          background: '#f8fafc',
          marginBottom: 22,
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
          Pipeline Pro V1
        </p>

        <h1 style={{ marginBottom: 10 }}>
          Captação Pro e Anúncio Pro
        </h1>

        <p
          style={{
            maxWidth: 880,
            color: '#5f6b7a',
            lineHeight: 1.6,
            marginBottom: 18,
          }}
        >
          Esta é a entrada operacional do processo profissional. O objetivo é
          conduzir o corretor da primeira conversa com o proprietário até a
          análise, estratégia, proposta, publicação e acompanhamento do imóvel.
        </p>

        {/* START_PLACEHOLDER_CTA_V1 */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <Link
            href="/operations/pipeline/atendimento"
            style={{
              display: 'inline-flex',
              padding: '12px 16px',
              borderRadius: 12,
              background: '#2563eb',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 800,
            }}
          >
            Iniciar Anúncio Placeholder
          </Link>

          <Link
            href="/operations/properties/list"
            style={{
              display: 'inline-flex',
              padding: '12px 16px',
              borderRadius: 12,
              border: '1px solid #d7dee8',
              background: '#fff',
              color: '#344054',
              textDecoration: 'none',
              fontWeight: 700,
            }}
          >
            Ver imóveis existentes
          </Link>

          <span style={{ color: '#667085', fontSize: 13 }}>
            O placeholder nasce como entrada operacional antes do anúncio público final.
          </span>
        </div>
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 16,
          marginBottom: 22,
        }}
      >
        <div
          style={{
            border: '1px solid #d7dee8',
            borderRadius: 16,
            padding: 18,
            background: '#fff',
          }}
        >
          <h2 style={{ marginTop: 0 }}>Agendar atendimento</h2>

          <p style={{ color: '#667085', lineHeight: 1.5 }}>
            Futuro fluxo para registrar compromisso, visita, vistoria ou retorno
            com proprietário. Ainda não será desenvolvido agora.
          </p>

          <button
            disabled
            style={{
              padding: '10px 14px',
              borderRadius: 10,
              border: '1px solid #cfd8e3',
              background: '#eef2f6',
              color: '#667085',
              cursor: 'not-allowed',
            }}
          >
            Futuro
          </button>
        </div>

        <div
          style={{
            border: '1px solid #2563eb',
            borderRadius: 16,
            padding: 18,
            background: '#fff',
          }}
        >
          <h2 style={{ marginTop: 0 }}>Iniciar imediatamente</h2>

          <p style={{ color: '#667085', lineHeight: 1.5 }}>
            Entrada que será usada agora para estruturar o fluxo guiado da
            captação profissional, mesmo antes da agenda e do comunicador.
          </p>

          <a
            href="#pipeline-etapas"
            style={{
              display: 'inline-flex',
              padding: '10px 14px',
              borderRadius: 10,
              background: '#2563eb',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 700,
            }}
          >
            Ver etapas do pipeline
          </a>
        </div>
      </section>

      <section
        style={{
          border: '1px solid #dbe3ea',
          borderRadius: 18,
          padding: 20,
          background: '#fff',
          marginBottom: 22,
        }}
      >
        <h2 style={{ marginTop: 0 }}>Como as peças se conectam</h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 12,
          }}
        >
          {[
            {
              title: 'Pipeline Pro',
              text: 'Executa o processo passo a passo.',
            },
            {
              title: 'Analise Patrimonial',
              text: 'Avalia o imóvel e gera inteligencia.',
            },
            {
              title: 'Anuncio',
              text: 'Publica e comercializa o imóvel.',
            },
            {
              title: 'Dossie',
              text: 'Consolida histórico, decisões e lifecycle.',
            },
          ].map((item) => (
            <div
              key={item.title}
              style={{
                border: '1px solid #d7dee8',
                borderRadius: 14,
                padding: 14,
                background: '#f8fafc',
              }}
            >
              <strong>{item.title}</strong>
              <p
                style={{
                  marginBottom: 0,
                  color: '#667085',
                  lineHeight: 1.5,
                  fontSize: 13,
                }}
              >
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        style={{
          border: '1px solid #dbe3ea',
          borderRadius: 18,
          padding: 20,
          background: '#fff',
          marginBottom: 22,
        }}
      >
        {/* PIPELINE_INTELLIGENCE_LAYER_NOTE_V1 */}
        <h2 style={{ marginTop: 0 }}>Camadas do processo</h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
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
            <strong>Pipelines operacionais</strong>
            <p style={{ marginBottom: 0, color: '#667085', lineHeight: 1.5 }}>
              Coletam e organizam dados: atendimento, levantamento, documentos,
              geografia, mercado, perfil do proprietario, evidencias e riscos.
            </p>
          </div>

          <div
            style={{
              border: '1px solid #2563eb',
              borderRadius: 14,
              padding: 14,
              background: '#eff6ff',
            }}
          >
            <strong>Pipeline de inteligencia</strong>
            <p style={{ marginBottom: 0, color: '#475467', lineHeight: 1.5 }}>
              Atua como cerebro do processo. Interpreta os dados dos pipelines
              inferiores e gera decisoes de preco, posicionamento, proposta e estrategia.
            </p>
          </div>

          <div
            style={{
              border: '1px solid #16a34a',
              borderRadius: 14,
              padding: 14,
              background: '#f0fdf4',
            }}
          >
            {/* PIPELINE_PUBLICATION_LAYER_NOTE_V1 */}
            <strong>Publicacao / Anuncio distribuivel</strong>
            <p style={{ marginBottom: 0, color: '#475467', lineHeight: 1.5 }}>
              Camada independente que materializa a estrategia em anuncio publico:
              titulo, descricao, preco, fotos, tags, canais, marketplace, redes,
              parceiros e vitrine profissional.
            </p>
          </div>
        </div>
      </section>

      
      {/* PIPELINE_GOVERNANCE_MODEL_V1 */}
      {/*
        ORIENTACAO PARA CODEX / EXECUTORES FUTUROS:

        MODELO OPERACIONAL DO PIPELINE PRO:
        - O Pipeline Pro nasce quando atendimento/corretor/agencia abre formalmente uma captacao.
        - A primeira ligacao do proprietario nao e necessariamente controlavel.
        - O controle operacional nasce quando o atendimento registra o processo, agenda vistoria ou designa responsavel.
        - Em imobiliaria/agencia, pode haver rodizio interno de atendimento/captacao.
        - O corretor designado deve poder aceitar, recusar ou renegociar horario.
        - Se recusar, o processo pode ir para o proximo profissional do rodizio.
        - Se renegociar horario, o prazo operacional deve recalcular a partir do novo agendamento.
        - O prazo do levantamento pode contar a partir da data/hora da vistoria.
        - Exemplo conceitual: 12h apos vistoria para completar levantamento patrimonial.
        - Autosave futuro deve permitir preenchimento em campo, celular ou escritorio.
        - Módulos podem ser preenchidos fora de ordem.
        - Cada campo/módulo pode ter "não se aplica" para não prejudicar progresso.
        - Módulo pode ser encerrado por impossibilidade justificada.
        - Inteligência só deve liberar após maturidade mínima ou encerramento formal dos módulos essenciais.

        VISIBILIDADE:
        - Corretor responsável vê e conduz todo o processo.
        - Atendimento/secretaria pode consultar, mas não editar tudo.
        - Dono/sócio/coordenador da imobiliária pode supervisionar e cobrar.
        - Responsável de módulo edita apenas o módulo dele.
        - Participantes convidados podem visualizar o todo e contribuir no escopo autorizado.
        - Corretores fora do processo veem apenas o Anúncio Placeholder e sinais mínimos, não o pipeline confidencial.
        - Proprietário não vê o processo interno; recebe proposta/apresentação final adequada.

        COMISSÕES / RATEIO:
        - Não implementar percentuais agora.
        - Futuro módulo de comissão/configuração/contratos deve tratar regras por agência.
        - Participação convidada pode impactar rateio, mas isso será parametrizável.
      */}
      <section
        style={{
          border: '1px solid #dbe3ea',
          borderRadius: 18,
          padding: 20,
          background: '#fff',
          marginBottom: 22,
        }}
      >
        <h2 style={{ marginTop: 0 }}>Governança operacional do Pipeline</h2>

        <p style={{ color: '#667085', lineHeight: 1.5 }}>
          O Pipeline Pro deve controlar quem conduz, quem apenas acompanha, quem
          edita cada módulo, qual prazo está correndo e quando a inteligência pode
          entrar. Nesta V1, esta estrutura é visual e conceitual.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 12,
            marginTop: 14,
          }}
        >
          {[
            {
              title: 'Responsável principal',
              badge: 'Conduz o fluxo',
              text: 'Corretor definido pelo atendimento, rodízio interno ou captação direta.',
            },
            {
              title: 'Responsável por módulo',
              badge: 'Edita módulo',
              text: 'Suporte documental, coordenador, vistoriador, especialista ou outro corretor convidado.',
            },
            {
              title: 'Supervisão da agência',
              badge: 'Consulta e cobra',
              text: 'Dono, sócio, gestor, secretaria ou administrativo autorizado acompanha prazos e pendências.',
            },
            {
              title: 'Visibilidade externa',
              badge: 'Restrita',
              text: 'Corretores fora do processo veem apenas placeholder/sinais mínimos. Proprietário vê só proposta final.',
            },
            {
              title: 'Prazos e urgência',
              badge: 'SLA visual',
              text: 'Aceite, recusa, reagendamento, contador após vistoria e alertas de atraso.',
            },
            {
              title: 'Liberação da inteligência',
              badge: 'Condicional',
              text: 'Só ativa com maturidade mínima ou módulos essenciais encerrados com justificativa.',
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
                  background: '#2563eb',
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
                {item.text}
              </p>
            </article>
          ))}
        </div>
      </section>

{/* PIPELINE_MAIN_PRODUCT_ORGANIZATION_V1 */}
      <section
        style={{
          border: '1px solid #dbe3ea',
          borderRadius: 18,
          padding: 20,
          background: '#fff',
          marginBottom: 22,
        }}
      >
        <h2 style={{ marginTop: 0 }}>Organização operacional do produto</h2>

        <p style={{ color: '#667085', lineHeight: 1.5 }}>
          O Pipeline Pro é dividido em camadas. Primeiro a operação coleta dados.
          Depois a inteligência interpreta. Por fim, a publicação materializa o
          anúncio distribuível. Essa separação evita fichário solto e transforma
          o processo em método profissional.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 12,
          }}
        >
          {[
            {
              title: '1. Operação',
              color: '#2563eb',
              text: 'Atendimento, levantamento, diagnóstico, documentos, mercado, proprietário e evidências.',
            },
            {
              title: '2. Inteligência',
              color: '#7c3aed',
              text: 'Interpreta os dados e decide preço, posicionamento, narrativa, proposta e estratégia.',
            },
            {
              title: '3. Publicação',
              color: '#16a34a',
              text: 'Transforma a estratégia aprovada em anúncio distribuível para canais, marketplace e rede.',
            },
          ].map((layer) => (
            <article
              key={layer.title}
              style={{
                border: '1px solid #d7dee8',
                borderRadius: 14,
                padding: 16,
                background: '#f8fafc',
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 6,
                  borderRadius: 999,
                  background: layer.color,
                  marginBottom: 12,
                }}
              />

              <strong>{layer.title}</strong>

              <p style={{ color: '#667085', lineHeight: 1.5, marginBottom: 0 }}>
                {layer.text}
              </p>
            </article>
          ))}
        </div>
      </section>


      {/* PIPELINE_MAIN_PAGE_PURPOSE_EXPLANATION_V1 */}
      {/*
        ORIENTACAO PARA CODEX / EXECUTORES FUTUROS:
        - Esta page /operations/pipeline é a CENTRAL do Pipeline Pro.
        - Ela NÃO representa um Pipeline Pro individual.
        - No produto final, esta tela deve listar múltiplos workflows reais simultâneos.
        - Cada workflow real deverá ter um identificador próprio, provavelmente workflowId.
        - A rota futura ideal para um pipeline específico será algo como:
          /operations/pipeline/[workflowId]
        - A rota atual /operations/pipeline/[step] é foundation visual provisória para validar etapas antes do backend real.
        - Não criar backend ou migration apenas por causa desta explicação.
        - Codex pode corrigir acentuação e microcopy mantendo UTF-8.
      */}
      <section
        style={{
          border: '1px solid #dbe3ea',
          borderRadius: 22,
          padding: 22,
          background: '#f8fafc',
          marginBottom: 22,
        }}
      >
        <p
          style={{
            margin: '0 0 8px',
            fontSize: 13,
            color: '#2563eb',
            textTransform: 'uppercase',
            letterSpacing: 0.8,
            fontWeight: 900,
          }}
        >
          Central operacional
        </p>

        <h1 style={{ margin: '0 0 10px' }}>
          Central do Pipeline Pro
        </h1>

        <p
          style={{
            margin: 0,
            color: '#667085',
            lineHeight: 1.6,
            maxWidth: 980,
          }}
        >
          Esta tela será a central para acompanhar várias captações profissionais
          em andamento ao mesmo tempo. Aqui o corretor, atendimento, gestor ou
          agência deverá enxergar pipelines ativos, responsáveis, prazos, progresso,
          gargalos, urgências e próximos passos.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 12,
            marginTop: 16,
          }}
        >
          <div
            style={{
              border: '1px solid #d7dee8',
              borderRadius: 14,
              padding: 14,
              background: '#fff',
            }}
          >
            <strong>O que esta página é</strong>
            <p style={{ marginBottom: 0, color: '#667085', fontSize: 13, lineHeight: 1.5 }}>
              Uma central/lista futura de Pipelines Pro, com visão de carteira,
              prazos, progresso e operação.
            </p>
          </div>

          <div
            style={{
              border: '1px solid #d7dee8',
              borderRadius: 14,
              padding: 14,
              background: '#fff',
            }}
          >
            <strong>O que ela ainda não é</strong>
            <p style={{ marginBottom: 0, color: '#667085', fontSize: 13, lineHeight: 1.5 }}>
              Não é ainda um workflow real salvo no banco e não representa um
              pipeline individual com workflowId.
            </p>
          </div>

          <div
            style={{
              border: '1px solid #d7dee8',
              borderRadius: 14,
              padding: 14,
              background: '#fff',
            }}
          >
            <strong>Função da V1 atual</strong>
            <p style={{ marginBottom: 0, color: '#667085', fontSize: 13, lineHeight: 1.5 }}>
              Validar o produto, as etapas, a navegação, a lógica operacional e
              a futura separação entre central, pipeline individual e módulos.
            </p>
          </div>

          <div
            style={{
              border: '1px solid #d7dee8',
              borderRadius: 14,
              padding: 14,
              background: '#fff',
            }}
          >
            <strong>Rota futura provável</strong>
            <p style={{ marginBottom: 0, color: '#667085', fontSize: 13, lineHeight: 1.5 }}>
              A central fica em /operations/pipeline. Cada pipeline real deverá
              abrir em rota própria, como /operations/pipeline/[workflowId].
            </p>
          </div>
        </div>
      </section>

      {/* PIPELINE_MAIN_SERVICE_NOTE_V1 */}
      {/*
        ORIENTACAO PARA CODEX / EXECUTORES FUTUROS:
        - A fonte canônica das etapas do Pipeline Pro deve ser pipelineProService.ts.
        - Esta página ainda pode manter copy visual própria, mas não deve duplicar regra de ordem, labels e camadas.
        - Backend real ainda não existe para workflow; esta tela é produto/frontend foundation.
      */}




      {/* PIPELINE_CENTRAL_KPI_FILTER_BAR_V1 */}
      {/*
        ORIENTACAO PARA CODEX / EXECUTORES FUTUROS:
        - Esta seção é visual/foundation.
        - Futuramente os KPIs devem vir de workflows reais.
        - Filtros devem consultar backend ou estado client-side com dados reais.
        - Não salvar filtros ainda.
        - Não criar migration por causa destes filtros.
        - Esta central deverá listar múltiplos pipelines simultâneos por workflowId.
      */}
      <section
        style={{
          border: '1px solid #dbe3ea',
          borderRadius: 22,
          padding: 20,
          background: '#fff',
          marginBottom: 22,
        }}
      >
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
              Gestão da carteira
            </p>

            <h2 style={{ margin: '0 0 6px' }}>
              Visão de controle dos pipelines
            </h2>

            <p style={{ margin: 0, color: '#667085', lineHeight: 1.5, maxWidth: 840 }}>
              Esta área deverá ajudar corretor, atendimento e gestor a priorizar o que
              precisa de ação agora: atraso, risco, suporte envolvido, maturidade mínima
              e liberação para inteligência.
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: 12,
            marginBottom: 16,
          }}
        >
          {pipelineCentralKpiPreview.map((kpi) => (
            <article
              key={kpi.label}
              style={{
                border: '1px solid #d7dee8',
                borderRadius: 16,
                padding: 15,
                background: '#f8fafc',
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  borderRadius: 999,
                  padding: '4px 8px',
                  background: kpi.color,
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 900,
                  marginBottom: 10,
                }}
              >
                KPI
              </span>

              <strong style={{ display: 'block', fontSize: 24, lineHeight: 1 }}>
                {kpi.value}
              </strong>

              <span style={{ display: 'block', marginTop: 8, fontWeight: 800 }}>
                {kpi.label}
              </span>

              <p style={{ margin: '6px 0 0', color: '#667085', fontSize: 13, lineHeight: 1.5 }}>
                {kpi.detail}
              </p>
            </article>
          ))}
        </div>

        <div
          style={{
            border: '1px solid #d7dee8',
            borderRadius: 16,
            padding: 14,
            background: '#f8fafc',
          }}
        >
          <strong style={{ display: 'block', marginBottom: 10 }}>
            Filtros operacionais futuros
          </strong>

          <div
            style={{
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
            }}
          >
            {pipelineCentralFilterPreview.map((filter, index) => (
              <button
                key={filter}
                type="button"
                style={{
                  border: index === 0 ? '1px solid #2563eb' : '1px solid #d7dee8',
                  borderRadius: 999,
                  padding: '8px 11px',
                  background: index === 0 ? '#2563eb' : '#fff',
                  color: index === 0 ? '#fff' : '#344054',
                  fontWeight: 800,
                  fontSize: 12,
                  cursor: 'default',
                }}
              >
                {filter}
              </button>
            ))}
          </div>

          <p style={{ margin: '10px 0 0', color: '#667085', fontSize: 13, lineHeight: 1.5 }}>
            Nesta V1, os filtros são apenas demonstração visual. No produto final,
            deverão filtrar pipelines reais por responsável, etapa, urgência,
            status, permissão e maturidade.
          </p>
        </div>
      </section>


      {/* PIPELINE_CENTRAL_REAL_LISTINGS_ATTACH_V1 */}
      {/*
        ORIENTACAO PARA CODEX / EXECUTORES FUTUROS:
        - Esta seção é a primeira conexão real da Central do Pipeline Pro com o banco.
        - Ela apenas lista anúncios reais acessíveis por RLS.
        - Não cria workflow.
        - Não cria Anúncio Placeholder.
        - Não salva progresso.
        - Não cria migration.
        - O botão "Acoplar Pipeline Pro" leva para o modo attach usando listingId real.
        - Futuramente esta área deve ser substituída ou complementada por workflows reais.
      */}
      <section
        style={{
          border: '1px solid #dbe3ea',
          borderRadius: 22,
          padding: 20,
          background: '#fff',
          marginBottom: 22,
        }}
      >
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
              Banco real
            </p>

            <h2 style={{ margin: '0 0 6px' }}>
              Anúncios reais candidatos ao Pipeline Pro
            </h2>

            <p style={{ margin: 0, color: '#667085', lineHeight: 1.5, maxWidth: 860 }}>
              Estes anúncios já existem no banco e podem ser acoplados ao Pipeline Pro.
              Nesta fase, o sistema apenas lê os anúncios e leva para o modo attach.
              O workflow real ainda não é criado.
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
            leitura real
          </span>
        </div>

        {(realListingCandidatesStatus || realListingCandidatesError) && (
          <div
            style={{
              border: realListingCandidatesError ? '1px solid #fecaca' : '1px solid #d7dee8',
              borderRadius: 14,
              padding: 12,
              background: realListingCandidatesError ? '#fef2f2' : '#f8fafc',
              color: realListingCandidatesError ? '#991b1b' : '#667085',
              marginBottom: 14,
              fontSize: 13,
            }}
          >
            {realListingCandidatesError || realListingCandidatesStatus}
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 12,
          }}
        >
          {realListingCandidates.map((listing) => (
            <article
              key={listing.id}
              style={{
                border: '1px solid #d7dee8',
                borderRadius: 16,
                padding: 14,
                background: '#f8fafc',
                display: 'grid',
                gap: 10,
              }}
            >
              <div>
                <strong style={{ display: 'block', fontSize: 15 }}>
                  {listing.title || 'Anúncio sem título'}
                </strong>

                <span style={{ display: 'block', color: '#667085', fontSize: 13, marginTop: 4 }}>
                  {formatPipelineCentralMoney(listing.price)}
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: 8,
                }}
              >
                <div
                  style={{
                    border: '1px solid #d7dee8',
                    borderRadius: 12,
                    padding: 9,
                    background: '#fff',
                  }}
                >
                  <span style={{ display: 'block', color: '#667085', fontSize: 11 }}>
                    Visibilidade
                  </span>
                  <strong style={{ display: 'block', fontSize: 12, marginTop: 3 }}>
                    {listing.visibility_scope || 'Não informado'}
                  </strong>
                </div>

                <div
                  style={{
                    border: '1px solid #d7dee8',
                    borderRadius: 12,
                    padding: 9,
                    background: '#fff',
                  }}
                >
                  <span style={{ display: 'block', color: '#667085', fontSize: 11 }}>
                    Origem
                  </span>
                  <strong style={{ display: 'block', fontSize: 12, marginTop: 3 }}>
                    {listing.metadata?.source || listing.metadata?.flow || 'Não informado'}
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
                <Link
                  href={`/operations/pipeline/atendimento?listingId=${listing.id}&mode=attach`}
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
                  Acoplar Pipeline Pro
                </Link>

                <Link
                  href={`/operations/properties/${listing.id}`}
                  style={{
                    display: 'inline-flex',
                    padding: '9px 12px',
                    borderRadius: 10,
                    border: '1px solid #d7dee8',
                    background: '#fff',
                    color: '#344054',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  Abrir checkup
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* PIPELINE_ACTIVE_WORKFLOWS_PREVIEW_V1 */}
      {/*
        ORIENTACAO PARA CODEX / EXECUTORES FUTUROS:
        - Esta seção representa a futura lista real de workflows ativos.
        - Hoje os dados são mockados/controlados para validar UX.
        - Futuramente deve consumir tabela própria do Pipeline Pro, provavelmente property_pipeline_workflows.
        - Cada card deverá abrir um workflow real por workflowId.
        - A rota atual /operations/pipeline/[step] é provisória e valida etapas sem workflow real.
        - Não conectar backend aqui sem migration planejada e RLS revisada.
      */}
      <section
        style={{
          border: '1px solid #dbe3ea',
          borderRadius: 22,
          padding: 20,
          background: '#fff',
          marginBottom: 22,
        }}
      >
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
              Operação em andamento
            </p>

            <h2 style={{ margin: '0 0 6px' }}>
              Pipelines ativos
            </h2>

            <p style={{ margin: 0, color: '#667085', lineHeight: 1.5, maxWidth: 820 }}>
              Prévia da futura carteira de captações profissionais. Aqui ficarão os
              pipelines reais em andamento, com responsável, prazo, urgência, progresso
              e próxima ação operacional.
            </p>
          </div>

          <Link
            href="/operations/pipeline/atendimento"
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
            Iniciar novo Pipeline
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 14,
          }}
        >
          {pipelineActiveWorkflowPreview.map((workflow) => (
            <article
              key={workflow.id}
              style={{
                border: '1px solid #d7dee8',
                borderRadius: 18,
                padding: 16,
                background: '#f8fafc',
                display: 'grid',
                gap: 12,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 10,
                  alignItems: 'flex-start',
                }}
              >
                <div>
                  <strong style={{ display: 'block', fontSize: 16 }}>
                    {workflow.internalName}
                  </strong>

                  <span style={{ display: 'block', color: '#667085', fontSize: 13, marginTop: 4 }}>
                    {workflow.context}
                  </span>
                </div>

                <span
                  style={{
                    display: 'inline-flex',
                    borderRadius: 999,
                    padding: '5px 8px',
                    background: workflow.statusColor,
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 900,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {workflow.status}
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: 8,
                }}
              >
                {[
                  {
                    label: 'Responsável',
                    value: workflow.responsible,
                  },
                  {
                    label: 'Etapa atual',
                    value: workflow.currentStep,
                  },
                  {
                    label: 'Prazo',
                    value: workflow.deadline,
                  },
                  {
                    label: 'Permissão',
                    value: workflow.permission,
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
                    <span style={{ display: 'block', color: '#667085', fontSize: 11 }}>
                      {item.label}
                    </span>
                    <strong style={{ display: 'block', fontSize: 12, marginTop: 3 }}>
                      {item.value}
                    </strong>
                  </div>
                ))}
              </div>

              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 8,
                    marginBottom: 6,
                    fontSize: 12,
                    color: '#667085',
                  }}
                >
                  <span>Progresso operacional</span>
                  <strong>{workflow.progress}%</strong>
                </div>

                <div
                  style={{
                    height: 9,
                    borderRadius: 999,
                    background: '#e5eaf0',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: workflow.progress + '%',
                      height: '100%',
                      background: workflow.progress >= 70 ? '#16a34a' : workflow.progress >= 50 ? '#2563eb' : '#f59e0b',
                    }}
                  />
                </div>
              </div>

              <div
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
                    padding: '4px 7px',
                    background: workflow.urgencyColor,
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 900,
                    marginBottom: 8,
                  }}
                >
                  Urgência {workflow.urgency}
                </span>

                <p style={{ margin: 0, color: '#667085', fontSize: 13, lineHeight: 1.5 }}>
                  {workflow.nextAction}
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  flexWrap: 'wrap',
                }}
              >
                <Link
                  href={`/operations/pipeline/${workflow.currentStepKey}`}
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
                  Abrir etapa
                </Link>

                <Link
                  href="/operations/properties/list"
                  style={{
                    display: 'inline-flex',
                    padding: '9px 12px',
                    borderRadius: 10,
                    border: '1px solid #d7dee8',
                    background: '#fff',
                    color: '#344054',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  Ver anúncio
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* PIPELINE_MAIN_SERVICE_REFERENCE_RAIL_V1 */}
      <section
        style={{
          border: '1px solid #dbe3ea',
          borderRadius: 18,
          padding: 16,
          background: '#fff',
          marginBottom: 22,
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
            <strong>Mapa canônico das etapas</strong>
            <p style={{ margin: '4px 0 0', color: '#667085', fontSize: 13, lineHeight: 1.5 }}>
              Esta trilha usa o pipelineProService.ts como fonte central de ordem,
              labels, camadas, responsáveis sugeridos e prazos conceituais.
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
            service centralizado
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 8,
          }}
        >
          {pipelineServiceCards.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              style={{
                border: '1px solid #d7dee8',
                borderRadius: 12,
                padding: 10,
                background: '#f8fafc',
                color: '#344054',
                textDecoration: 'none',
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  borderRadius: 999,
                  padding: '3px 7px',
                  background: item.layerColor,
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 800,
                  marginBottom: 8,
                }}
              >
                {item.layer}
              </span>

              <strong style={{ display: 'block', fontSize: 13 }}>
                {item.shortLabel}
              </strong>

              <span style={{ display: 'block', color: '#667085', fontSize: 12, marginTop: 4 }}>
                {item.deadlineHint}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section id="pipeline-etapas">
        {/* PIPELINE_PHASE_STATUS_NOTE_V1 */}
        <h2>Fluxos e camadas executáveis</h2>

        <div
          style={{
            border: '1px solid #dbe3ea',
            borderRadius: 14,
            padding: 14,
            background: '#f8fafc',
            marginBottom: 16,
          }}
        >
          <strong>Status das camadas</strong>
          <p style={{ marginBottom: 0, color: '#667085', lineHeight: 1.5 }}>
            Nesta V1, os status são visuais e orientativos. No backend futuro,
            cada etapa deverá considerar progresso real, pendências obrigatórias,
            permissões, dados mínimos, responsável por módulo, prazo operacional,
            urgência, conclusão com justificativa e liberação condicional.
          </p>

          {/* PIPELINE_RESPONSIBILITY_SLA_NOTE_V1 */}
          <p style={{ margin: '10px 0 0', color: '#667085', lineHeight: 1.5 }}>
            O corretor responsável pode acompanhar tudo, mas módulos específicos
            podem ser executados por suporte documental, coordenador, administrativo
            ou outro profissional da agência. A camada de inteligência só deve
            entrar quando a base operacional estiver concluída ou formalmente
            encerrada por impossibilidade.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 16,
          }}
        >
          {phases.map((phase) => (
            <article
              key={phase.title}
              style={{
                border: '1px solid #d7dee8',
                borderRadius: 18,
                padding: 18,
                background: '#fff',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  alignItems: 'flex-start',
                  marginBottom: 10,
                }}
              >
                <h3 style={{ margin: 0 }}>{phase.title}</h3>

                <div style={{ display: 'grid', gap: 6, justifyItems: 'end' }}>
                  {/* PHASE_PRODUCT_BADGE_V1 */}
                  <span
                    style={{
                      fontSize: 12,
                      border: '1px solid #d7dee8',
                      borderRadius: 999,
                      padding: '4px 8px',
                      color: '#475467',
                      background: '#f8fafc',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {phase.status}
                  </span>

                  <span
                    style={{
                      fontSize: 12,
                      border: `1px solid ${phase.layerColor || '#d7dee8'}`,
                      borderRadius: 999,
                      padding: '4px 8px',
                      background: phase.layerColor || '#475467',
                      color: '#fff',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {phase.layer}
                  </span>

                  {/* PIPELINE_PHASE_ACCESS_BADGES_V1 | PIPELINE_SOLID_BADGES_V1 */}
                  <span
                    style={{
                      fontSize: 12,
                      border: `1px solid ${phase.maturityColor || '#d7dee8'}`,
                      borderRadius: 999,
                      padding: '4px 8px',
                                            background: phase.layerColor || '#475467',
                      color: '#fff',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {phase.maturity}
                  </span>

                  <span
                    style={{
                      fontSize: 12,
                      border: `1px solid ${phase.accessColor || '#d7dee8'}`,
                      borderRadius: 999,
                      padding: '4px 8px',
                                            background: phase.layerColor || '#475467',
                      color: '#fff',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {phase.access}
                  </span>
                </div>
              </div>

              <div
                style={{
                  height: 10,
                  borderRadius: 999,
                  background: '#e5eaf0',
                  overflow: 'hidden',
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    width: `${phase.progress}%`,
                    height: '100%',
                    background: '#2563eb',
                  }}
                />
              </div>

              <p style={{ color: '#667085', lineHeight: 1.5 }}>
                {phase.description}
              </p>

              <div
                style={{
                  border: '1px solid #d7dee8',
                  borderRadius: 12,
                  padding: 10,
                  background: '#f8fafc',
                  marginBottom: 12,
                }}
              >
                <strong style={{ fontSize: 13 }}>Próxima ação</strong>
                <p style={{ margin: '6px 0 0', color: '#667085', fontSize: 13 }}>
                  {phase.nextAction}
                </p>
              </div>

              {/* PIPELINE_PHASE_OPERATION_META_V1 */}
              {/*
                ORIENTACAO PARA CODEX / EXECUTORES FUTUROS:
                - Estes dados sao visuais nesta V1.
                - Futuramente devem vir do backend: responsavel, setor, prazo,
                  SLA, urgencia, progresso real, permissao de edicao e conclusao.
                - Cada modulo pode ter responsavel diferente do corretor principal.
                - Participantes podem visualizar tudo, mas editar apenas modulo
                  sob sua responsabilidade.
                - Inteligencia deve ativar apenas quando modulos essenciais forem
                  concluidos ou encerrados com justificativa.
              */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    border: '1px solid #d7dee8',
                    borderRadius: 10,
                    padding: 10,
                    background: '#fff',
                  }}
                >
                  <strong style={{ display: 'block', fontSize: 12 }}>Responsável</strong>
                  <span style={{ color: '#667085', fontSize: 12 }}>{phase.owner}</span>
                </div>

                <div
                  style={{
                    border: '1px solid #d7dee8',
                    borderRadius: 10,
                    padding: 10,
                    background: '#fff',
                  }}
                >
                  <strong style={{ display: 'block', fontSize: 12 }}>Prazo</strong>
                  <span style={{ color: '#667085', fontSize: 12 }}>{phase.deadline}</span>
                </div>

                <div
                  style={{
                    border: '1px solid #d7dee8',
                    borderRadius: 10,
                    padding: 10,
                    background: '#fff',
                  }}
                >
                  <strong style={{ display: 'block', fontSize: 12 }}>Urgência</strong>
                  <span style={{ color: '#667085', fontSize: 12 }}>{phase.urgency}</span>
                </div>

                <div
                  style={{
                    border: '1px solid #d7dee8',
                    borderRadius: 10,
                    padding: 10,
                    background: '#fff',
                  }}
                >
                  <strong style={{ display: 'block', fontSize: 12 }}>Status</strong>
                  <span style={{ color: '#667085', fontSize: 12 }}>
                    {phase.done === 'Em execução' ? '◔ ' : phase.done === 'Aberto' ? '○ ' : phase.done === 'Bloqueada' ? '⛔ ' : phase.done === 'Pendente' ? '△ ' : '□ '}
                    {phase.done}
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gap: 8,
                  marginTop: 12,
                }}
              >
                {phase.pipelines.map((pipeline) => (
                  <Link
                    key={pipeline}
                    href={`/operations/pipeline/${phase.route}`}
                    style={{
                      textAlign: 'left',
                      padding: 10,
                      borderRadius: 10,
                      border: '1px solid #d7dee8',
                      background: '#f8fafc',
                      cursor: 'pointer',
                      textDecoration: 'none',
                      color: '#111827',
                    }}
                  >
                    {pipeline}
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
