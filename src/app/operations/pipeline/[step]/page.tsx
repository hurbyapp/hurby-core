'use client'

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

export default function PipelineStepPage() {
  const params = useParams()
  const stepKey = String(params.step || '')
  const step = steps[stepKey] || steps.atendimento

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
    </main>
  )
}
