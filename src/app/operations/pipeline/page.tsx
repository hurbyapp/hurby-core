
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

import Link from 'next/link'

const phases = [
  {
    title: '1. Atendimento e captacao',
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

export default function PipelinePage() {
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

      <section id="pipeline-etapas">
        <h2>Fluxos e camadas executáveis</h2>

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
                      color: phase.layerColor || '#475467',
                      background: '#fff',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {phase.layer}
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
