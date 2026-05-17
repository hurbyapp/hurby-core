
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

// PIPELINE_STEP_ORDER_V1
const stepOrder = [
  'atendimento',
  'levantamento',
  'diagnostico',
  'estrategia',
  'proposta',
  'publicacao',
  'acompanhamento',
]

const stepLabels: Record<string, string> = {
  atendimento: 'Atendimento',
  levantamento: 'Levantamento',
  diagnostico: 'Diagnóstico',
  estrategia: 'Inteligência',
  proposta: 'Proposta',
  publicacao: 'Publicação',
  acompanhamento: 'Lifecycle',
}

export default function PipelineStepPage() {
  const params = useParams()
  const [attachContext, setAttachContext] = useState({
    listingId: '',
    mode: '',
  })

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

  // PIPELINE_PREV_NEXT_CONTEXT_V1
  const currentStepIndex = stepOrder.indexOf(stepKey)
  const previousStep = currentStepIndex > 0 ? stepOrder[currentStepIndex - 1] : ''
  const nextStep =
    currentStepIndex >= 0 && currentStepIndex < stepOrder.length - 1
      ? stepOrder[currentStepIndex + 1]
      : ''

  const buildStepHref = (targetStep: string) =>
    isAttachMode
      ? `/operations/pipeline/${targetStep}?listingId=${listingId}&mode=attach`
      : `/operations/pipeline/${targetStep}`

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
          {[
            { key: 'atendimento', label: 'Atendimento', layer: 'Operação' },
            { key: 'levantamento', label: 'Levantamento', layer: 'Operação' },
            { key: 'diagnostico', label: 'Diagnóstico', layer: 'Operação' },
            { key: 'estrategia', label: 'Inteligência', layer: 'Cérebro' },
            { key: 'proposta', label: 'Proposta', layer: 'Validação' },
            { key: 'publicacao', label: 'Publicação', layer: 'Distribuição' },
            { key: 'acompanhamento', label: 'Lifecycle', layer: 'Continuidade' },
          ].map((item) => {
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
                  Futuro item executavel do pipeline.
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
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
              Voltar para {stepLabels[previousStep]}
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
              Avançar para {stepLabels[nextStep]}
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
