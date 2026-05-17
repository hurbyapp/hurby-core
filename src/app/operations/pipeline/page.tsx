'use client'

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
    title: '4. Estrategia comercial',
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
    title: '6. Publicacao parametrizada',
    route: 'publicacao',
    status: 'Futuro acoplavel',
    progress: 0,
    description:
      'Ativacao do anuncio com titulo, descricao, preco, fotos, tags, canais e estrategia aprovada.',
    pipelines: [
      'Gerar anuncio publico',
      'Aplicar estrategia',
      'Parametrizar canais',
      'Publicar',
    ],
  },
  {
    title: '7. Acompanhamento e lifecycle',
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
            marginBottom: 0,
          }}
        >
          Esta é a entrada operacional do processo profissional. O objetivo é
          conduzir o corretor da primeira conversa com o proprietário até a
          análise, estratégia, proposta, publicação e acompanhamento do imóvel.
        </p>
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

      <section id="pipeline-etapas">
        <h2>Etapas operacionais</h2>

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
