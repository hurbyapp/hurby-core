/*
  HURBY — Pipeline Pro Service V1

  ORIENTACAO PARA CODEX / EXECUTORES FUTUROS:
  - Este service ainda é frontend/foundation.
  - Não salva dados no banco.
  - Não cria migration.
  - Não substitui propertyService.
  - Não duplica Properties, Clients, Portfolio ou Assessment.
  - Futuramente deverá conectar com tabelas próprias do Pipeline Pro:
    property_pipeline_workflows,
    property_pipeline_modules,
    property_pipeline_participants,
    property_pipeline_events,
    property_pipeline_tasks.
  - Enquanto backend real não existir, este service centraliza constantes,
    labels, etapas, regras visuais e helpers do Pipeline Pro.
*/

export type PipelineStepKey =
  | 'atendimento'
  | 'levantamento'
  | 'diagnostico'
  | 'estrategia'
  | 'proposta'
  | 'publicacao'
  | 'acompanhamento'

export type PipelineLayer =
  | 'operational'
  | 'intelligence'
  | 'approval'
  | 'publication'
  | 'lifecycle'

export type PipelineStepDefinition = {
  key: PipelineStepKey
  label: string
  shortLabel: string
  layer: PipelineLayer
  layerLabel: string
  ownerHint: string
  deadlineHint: string
  urgencyHint: string
  accessHint: string
  description: string
  minimumProgressToRelease?: number
}

export const pipelineStepOrder: PipelineStepKey[] = [
  'atendimento',
  'levantamento',
  'diagnostico',
  'estrategia',
  'proposta',
  'publicacao',
  'acompanhamento',
]

export const pipelineSteps: PipelineStepDefinition[] = [
  {
    key: 'atendimento',
    label: 'Atendimento e captação',
    shortLabel: 'Atendimento',
    layer: 'operational',
    layerLabel: 'Operação',
    ownerHint: 'Corretor/atendimento',
    deadlineHint: '24h para movimentar',
    urgencyHint: 'Alta',
    accessHint: 'Responsável conduz, supervisão consulta',
    description:
      'Entrada formal da captação, definição do responsável, aceite, recusa ou reagendamento.',
  },
  {
    key: 'levantamento',
    label: 'Levantamento do patrimônio',
    shortLabel: 'Levantamento',
    layer: 'operational',
    layerLabel: 'Operação',
    ownerHint: 'Corretor/vistoriador',
    deadlineHint: '12h após vistoria',
    urgencyHint: 'Alta',
    accessHint: 'Responsável do módulo edita',
    description:
      'Coleta de dados físicos, fotos, composição, acabamento, região e evidências do imóvel.',
  },
  {
    key: 'diagnostico',
    label: 'Diagnóstico e risco',
    shortLabel: 'Diagnóstico',
    layer: 'operational',
    layerLabel: 'Operação',
    ownerHint: 'Suporte documental/administrativo',
    deadlineHint: 'Prazo operacional',
    urgencyHint: 'Média',
    accessHint: 'Responsável documental edita',
    description:
      'Validação documental, riscos, prefeitura, cartório, débitos, processos e situação cadastral.',
  },
  {
    key: 'estrategia',
    label: 'Inteligência estratégica',
    shortLabel: 'Inteligência',
    layer: 'intelligence',
    layerLabel: 'Cérebro',
    ownerHint: 'Inteligência/coordenação',
    deadlineHint: 'Após maturidade mínima',
    urgencyHint: 'Condicional',
    accessHint: 'Libera após base mínima',
    description:
      'Leitura consolidada, preço, agressividade, posicionamento, narrativa, script e estratégia.',
    minimumProgressToRelease: 60,
  },
  {
    key: 'proposta',
    label: 'Proposta e aprovação',
    shortLabel: 'Proposta',
    layer: 'approval',
    layerLabel: 'Validação',
    ownerHint: 'Corretor/gestor',
    deadlineHint: 'Após inteligência',
    urgencyHint: 'Condicional',
    accessHint: 'Aprovação interna/proprietário',
    description:
      'Transforma a estratégia em proposta clara para aprovação do proprietário ou da agência.',
  },
  {
    key: 'publicacao',
    label: 'Publicação / anúncio distribuível',
    shortLabel: 'Publicação',
    layer: 'publication',
    layerLabel: 'Distribuição',
    ownerHint: 'Responsável do anúncio',
    deadlineHint: 'Após aprovação',
    urgencyHint: 'Condicional',
    accessHint: 'Executa estratégia aprovada',
    description:
      'Materializa o anúncio final, canais, distribuição, redes, parceiros e marketplace.',
  },
  {
    key: 'acompanhamento',
    label: 'Acompanhamento e lifecycle',
    shortLabel: 'Lifecycle',
    layer: 'lifecycle',
    layerLabel: 'Continuidade',
    ownerHint: 'Operação comercial',
    deadlineHint: 'Durante anúncio ativo',
    urgencyHint: 'Contínua',
    accessHint: 'Acompanha pós-publicação',
    description:
      'Histórico, visitas, propostas, ajustes, evolução do anúncio e encerramento do ciclo.',
  },
]

export function getPipelineStepDefinition(stepKey: string) {
  return pipelineSteps.find((step) => step.key === stepKey) || pipelineSteps[0]
}

export function getPreviousPipelineStep(stepKey: string) {
  const index = pipelineStepOrder.indexOf(stepKey as PipelineStepKey)

  if (index <= 0) {
    return null
  }

  return pipelineStepOrder[index - 1]
}

export function getNextPipelineStep(stepKey: string) {
  const index = pipelineStepOrder.indexOf(stepKey as PipelineStepKey)

  if (index < 0 || index >= pipelineStepOrder.length - 1) {
    return null
  }

  return pipelineStepOrder[index + 1]
}

export function buildPipelineStepHref(params: {
  stepKey: string
  listingId?: string
  mode?: string
}) {
  const base = `/operations/pipeline/${params.stepKey}`

  if (params.mode === 'attach' && params.listingId) {
    return `${base}?listingId=${params.listingId}&mode=attach`
  }

  return base
}

export function getPipelineLayerColor(layer: PipelineLayer) {
  const colors: Record<PipelineLayer, string> = {
    operational: '#2563eb',
    intelligence: '#7c3aed',
    approval: '#f59e0b',
    publication: '#16a34a',
    lifecycle: '#475467',
  }

  return colors[layer]
}

export function getPipelinePermissionMode(params: {
  canAccess: boolean
  canManage: boolean
}) {
  if (params.canManage) {
    return {
      label: 'Gestão liberada',
      color: '#16a34a',
      description: 'Usuário pode consultar e gerenciar este anúncio.',
    }
  }

  if (params.canAccess) {
    return {
      label: 'Somente consulta',
      color: '#f59e0b',
      description: 'Usuário pode consultar, mas edição deve ser restrita.',
    }
  }

  return {
    label: 'Sem permissão',
    color: '#dc2626',
    description: 'Usuário não possui permissão para acessar este anúncio.',
  }
}
