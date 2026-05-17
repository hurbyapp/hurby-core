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
  getProfessionalAssessmentByListingId,
  getPropertyListingById,
} from '@/lib/services/propertyService'

const FIELD_LABELS: Record<string, string> = {
  document_type: 'Tipo do documento',
  document_origin: 'Origem do documento',
  information_origin: 'Origem da informação',
  visit_status: 'Visita presencial',
  information_confidence: 'Confiança da informação',
  occupancy_status: 'Ocupação do imóvel',
  documentation_status: 'Situação documental',
  financial_status: 'Situação financeira',
  market_price_perception: 'Percepção de preço',
  estimated_liquidity: 'Liquidez estimada',
  recommendation_status: 'Recomendação',
  next_step_status: 'Próximo passo',
  next_step_owner: 'Responsável pelo próximo passo',
  next_step_due_date: 'Data limite do próximo passo',
  paid_off_status: 'Imóvel quitado',
  financing_status: 'Aceita financiamento',
  commercial_purpose: 'Finalidade comercial',
  visit_availability: 'Disponibilidade para visita',
  information_provider: 'Fonte informante',
  commercial_attractiveness: 'Atratividade comercial',

  owner_requested_price: 'Preço pedido pelo proprietário',
  owner_minimum_acceptable_price: 'Preço mínimo aceitável',
  professional_recommended_price: 'Preço recomendado pelo profissional',
  initial_listing_price: 'Preço inicial anunciado',
  current_listing_price: 'Preço atual anunciado',
  negotiation_margin_authorized: 'Margem de negociação autorizada',
  price_confidence_level: 'Confiança da estratégia de preço',

  visit_quality: 'Qualidade da vistoria',
  conservation_status: 'Estado de conservação',
  structural_risk: 'Risco estrutural',
  moisture_risk: 'Risco de umidade ou infiltração',
  electrical_condition: 'Condição elétrica aparente',
  hydraulic_condition: 'Condição hidráulica aparente',
  finishing_standard: 'Padrão de acabamento',
  renovation_need: 'Necessidade de reforma',
  photo_quality: 'Qualidade das fotos',
  specialist_needed: 'Especialista necessário',
  main_risks: 'Principais riscos percebidos',
  improvement_suggestions: 'Sugestões de melhoria',
  technical_notes: 'Notas técnicas',

  property_registry_status: 'Matrícula ou registro do imóvel',
  owner_document_status: 'Documentos do proprietário',
  property_tax_status: 'IPTU e tributos',
  condominium_debt_status: 'Débito de condomínio',
  financing_debt_status: 'Financiamento ou saldo devedor',
  legal_restriction_status: 'Restrição jurídica conhecida',
  financing_eligibility_status: 'Possibilidade de financiamento',
  fiscal_risk_status: 'Risco fiscal ou tributário',
  documentation_risk_level: 'Nível de risco documental',
  documentation_recommendation: 'Recomendação documental',
  financial_recommendation: 'Recomendação financeira',
  documentation_notes: 'Notas documentais',
  financial_notes: 'Notas financeiras',

  owner_interview_source: 'Fonte da entrevista',
  owner_motivation: 'Motivação do proprietário',
  negotiation_urgency: 'Urgência de negociação',
  owner_availability: 'Disponibilidade do proprietário',
  exclusive_authorization: 'Autorização ou exclusividade',
  commission_agreement_status: 'Comissão ou acordo comercial',
  documentation_provided_status: 'Documentos fornecidos',
  price_flexibility: 'Flexibilidade de preço',
  exchange_interest: 'Interesse em permuta',
  owner_communication_preference: 'Preferência de comunicação',
  owner_main_objections: 'Objeções ou travas do proprietário',
  owner_interview_notes: 'Notas da entrevista',

  commercial_diagnosis: 'Diagnóstico comercial',
  recommended_positioning: 'Posicionamento recomendado',
  listing_strategy: 'Estratégia de publicação',
  negotiation_strategy: 'Estratégia de negociação',
  owner_argument: 'Argumentação para o proprietário',
  public_highlights: 'Pontos fortes para o anúncio',
  attention_points: 'Pontos de atenção',
  next_action: 'Próxima ação',
  follow_up_date: 'Data de retorno',
  internal_notes: 'Notas internas',

  house_subtype: 'Tipo de casa',
  has_condominium_context: 'Casa em condomínio',
  topography: 'Topografia',
  construction_type: 'Tipo de construção',
  floors: 'Pavimentos',
  general_conservation_status: 'Conservação geral',
  roof_condition: 'Condição do telhado',
  structural_risk_perception: 'Percepção de risco estrutural',
  built_area_matches_documents: 'Área construída confere com documentos',
  construction_registered: 'Construção averbada ou registrada',
  yard_status: 'Quintal ou área externa',
  pool_status: 'Piscina',
  gourmet_area_status: 'Área gourmet',
  parking_type: 'Garagem ou vaga',
  house_market_appeal: 'Atratividade comercial da casa',
  house_recommendation: 'Recomendação para casa',
  house_notes: 'Notas sobre a casa',

  apartment_subtype: 'Tipo de unidade',
  unit_floor: 'Andar',
  private_area: 'Área privativa',
  general_unit_conservation: 'Conservação da unidade',
  sun_position: 'Posição solar',
  view_type: 'Tipo de vista',
  ventilation_quality: 'Ventilação',
  natural_light_quality: 'Luz natural',
  condo_fee_status: 'Taxa condominial',
  condominium_risk: 'Risco condominial',
  short_term_rental_allowed: 'Locação curta ou Airbnb',
  unit_registration_status: 'Documentação da unidade',
  apartment_market_appeal: 'Atratividade comercial da unidade',
  apartment_recommendation: 'Recomendação para unidade',
  apartment_notes: 'Notas sobre a unidade',

  land_subtype: 'Tipo de terreno',
  total_area: 'Área total',
  front_measure: 'Medida de frente',
  zoning_informed: 'Zoneamento informado',
  street_type: 'Tipo de rua',
  water_network: 'Rede de água',
  electricity_network: 'Rede de energia',
  sewage_network: 'Rede de esgoto',
  area_matches_document: 'Área confere com documento',
  construction_potential: 'Potencial construtivo',
  liquidity_profile: 'Liquidez do terreno',
  land_recommendation: 'Recomendação para terreno',
  land_notes: 'Notas sobre o terreno',

  commercial_subtype: 'Tipo comercial',
  current_use: 'Uso atual',
  intended_best_use: 'Melhor uso indicado',
  ceiling_height_category: 'Pé-direito',
  street_frontage: 'Fachada para rua',
  visibility_from_street: 'Visibilidade da rua',
  parking_available: 'Estacionamento disponível',
  three_phase_power_available: 'Energia trifásica',
  avcb_status_informed: 'AVCB informado',
  accessibility_apparent: 'Acessibilidade aparente',
  business_region_profile: 'Perfil da região comercial',
  commercial_market_appeal: 'Atratividade comercial',
  commercial_recommendation: 'Recomendação para comercial',
  commercial_notes: 'Notas sobre o comercial',

  rural_subtype: 'Tipo rural',
  area_unit: 'Unidade de medida',
  access_quality: 'Qualidade do acesso',
  rainy_season_access_risk: 'Risco de acesso em período de chuva',
  electricity_available: 'Energia disponível',
  water_availability: 'Disponibilidade de água',
  improvements_condition: 'Condição das benfeitorias',
  current_rural_use: 'Uso rural atual',
  productive_potential: 'Potencial produtivo',
  environmental_risk: 'Risco ambiental',
  rural_documentation_status: 'Documentação rural',
  georeferencing_status: 'Georreferenciamento',
  rural_market_appeal: 'Atratividade comercial rural',
  rural_recommendation: 'Recomendação para rural',
  rural_notes: 'Notas sobre o rural',

  summary_readiness_status: 'Status do resumo',
  public_exposure_level: 'Exposição pública',
  owner_summary_visibility: 'Visibilidade para proprietário',
  partner_summary_visibility: 'Visibilidade para parceiros',
  summary_legal_sensitivity: 'Sensibilidade jurídica ou comercial',
  public_listing_summary: 'Resumo público para anúncio',
  owner_facing_summary: 'Resumo para proprietário',
  partner_facing_summary: 'Resumo para parceiros',
  internal_executive_summary: 'Resumo executivo interno',
  controlled_risk_disclaimer: 'Ressalva controlada',

  note_sensitivity: 'Sensibilidade da nota',
  note_priority: 'Prioridade da nota',
  note_category: 'Categoria da nota',
  operational_alert: 'Alerta operacional',
  negotiation_memo: 'Memória de negociação',
  owner_behavior_notes: 'Notas sobre comportamento do proprietário',
  risk_notes: 'Notas de risco',
  agency_notes: 'Notas da agência ou equipe',
  follow_up_notes: 'Notas de acompanhamento',
  do_not_share_notes: 'Notas que não devem ser compartilhadas',
}

const VALUE_LABELS: Record<string, string> = {
  sale: 'Venda',
  rent: 'Locação',
  rental: 'Locação',
  lease: 'Locação',
  arrendamento: 'Arrendamento',
  private: 'Privado',
  public: 'Público',
  active: 'Ativo',
  inactive: 'Inativo',
  published: 'Publicado',
  deleted: 'Deletado',
  broker_direct: 'Cadastro direto do corretor',
  marketplace_user_listing: 'Anúncio criado pelo usuário',
  platform_owner: 'Owner da plataforma',
  true: 'Sim',
  false: 'Não',
  not_verified: 'Não verificado',
  not_evaluated: 'Não avaliado',
  to_confirm: 'A confirmar',
  pending_review: 'Pendente de conferência',
  relevant_risk: 'Risco relevante',
  discrepancy_found: 'Divergência identificada',
  apparently_regular: 'Regular aparente',
  apparently_clear: 'Aparentemente sem débito',
  not_applicable: 'Não se aplica',
  not_presented: 'Não apresentado',
  not_provided: 'Não fornecido',
  partial: 'Parcial',
  complete: 'Completo',
  promised: 'Prometido',
  refused: 'Recusado',

  draft: 'Rascunho',
  submitted_for_review: 'Enviado para revisão',
  needs_correction: 'Precisa correção',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
  archived: 'Arquivado',

  yes: 'Sim',
  no: 'Não',
  low: 'Baixo',
  medium: 'Médio',
  high: 'Alto',
  critical: 'Crítico',
  excellent: 'Excelente',
  good: 'Bom',
  regular: 'Regular',
  poor: 'Ruim',
  limited: 'Limitado',
  none: 'Nenhum',
  full: 'Completo',

  review_price: 'Revisar preço',
  request_documents: 'Solicitar documentos',
  publish_as_is: 'Publicar como está',
  publish_now: 'Publicar agora',
  publish_after_review: 'Publicar após revisão',
  publish_after_documents: 'Publicar após documentos',
  publish_after_photos: 'Publicar após fotos melhores',
  hold_until_price_adjustment: 'Aguardar ajuste de preço',
  do_not_publish_yet: 'Não publicar ainda',
  not_recommend_publish_yet: 'Não recomendar publicação ainda',
  improve_photos: 'Melhorar fotos',
  schedule_new_visit: 'Agendar nova visita',
  align_with_owner: 'Alinhar com proprietário',
  monitor_performance: 'Acompanhar performance',
  archive_capture: 'Arquivar captação',

  high_potential: 'Alto potencial comercial',
  good_potential: 'Bom potencial comercial',
  average_potential: 'Potencial médio',
  depends_on_price: 'Depende do preço',
  requires_corrections: 'Precisa de ajustes antes de publicar',
  high_risk: 'Alto risco comercial/documental',
  premium_positioning: 'Posicionamento premium',
  standard_market: 'Mercado padrão',
  opportunity: 'Oportunidade',
  investment: 'Investimento',
  family_home: 'Moradia familiar',
  income_property: 'Renda ou locação',
  needs_repositioning: 'Precisa reposicionamento',
  firm_price: 'Preço firme',
  neutral_margin: 'Margem moderada',
  aggressive_discount: 'Desconto agressivo',
  start_high_reduce_later: 'Começar alto e reduzir depois',
  campaign_discount: 'Campanha ou desconto por prazo',
  owner_alignment_needed: 'Precisa alinhar com proprietário',

  owner_direct: 'Proprietário direto',
  owner_representative: 'Representante do proprietário',
  family_member: 'Familiar',
  tenant: 'Inquilino',
  third_party: 'Terceiro',
  sell_fast: 'Quer vender rápido',
  test_market: 'Quer testar mercado',
  upgrade_property: 'Quer trocar por outro imóvel',
  financial_need: 'Necessidade financeira',
  relocation: 'Mudança de cidade ou bairro',
  investment_reallocation: 'Realocar investimento',
  rent_income: 'Busca renda de locação',
  no_urgency: 'Sem urgência',
  available: 'Disponível',
  hard_to_contact: 'Difícil contato',
  requires_scheduling: 'Exige agendamento',
  exclusive_authorized: 'Exclusividade autorizada',
  non_exclusive_authorized: 'Autorização sem exclusividade',
  verbal_only: 'Apenas verbal',
  not_authorized: 'Não autorizado',
  agreed: 'Acordada',
  verbal_agreement: 'Acordo verbal',
  pending_definition: 'Pendente de definição',
  conflict_or_doubt: 'Conflito ou dúvida',
  yes_property: 'Aceita imóvel',
  yes_vehicle: 'Aceita veículo',
  yes_both: 'Aceita imóvel ou veículo',
  whatsapp: 'WhatsApp',
  phone: 'Telefone',
  email: 'E-mail',
  in_person: 'Presencial',
  representative: 'Via representante',
  not_informed: 'Não informado',

  street_house: 'Casa de rua',
  condominium_house: 'Casa em condomínio',
  townhouse: 'Sobrado',
  single_story_house: 'Casa térrea',
  semi_detached_house: 'Casa geminada',
  isolated_house: 'Casa isolada no lote',
  house_with_annex: 'Casa com edícula/anexo',
  flat: 'Plano',
  uphill: 'Aclive',
  downhill: 'Declive',
  irregular: 'Irregular',
  mixed: 'Misto',
  masonry: 'Alvenaria',
  wood: 'Madeira',
  steel_frame: 'Steel frame',
  one_floor: 'Um pavimento',
  two_floors: 'Dois pavimentos',
  three_or_more: 'Três ou mais',
  needs_repair: 'Precisa de reparo',
  requires_specialist: 'Exige especialista',
  specialist_required: 'Exige especialista',
  covered: 'Coberta',
  uncovered: 'Descoberta',

  standard_apartment: 'Apartamento padrão',
  studio: 'Studio',
  loft: 'Loft',
  kitnet: 'Kitnet',
  penthouse: 'Cobertura',
  garden: 'Garden',
  duplex: 'Duplex',
  serviced_apartment: 'Apartamento com serviços',
  rotating: 'Rotativa',
  deeded: 'Vinculada/documentada',
  assigned: 'Atribuída pelo condomínio',
  not_available: 'Não possui',
  morning_sun: 'Sol da manhã',
  afternoon_sun: 'Sol da tarde',
  no_direct_sun: 'Sem sol direto',
  open_view: 'Vista livre',
  internal_view: 'Vista interna',
  street_view: 'Vista para rua',
  blocked_view: 'Vista bloqueada',
  premium_view: 'Vista premium',

  public_street_lot: 'Terreno em rua pública',
  gated_lot: 'Lote em condomínio fechado',
  open_subdivision_lot: 'Loteamento aberto',
  urban_land: 'Terreno urbano',
  commercial_land: 'Terreno comercial',
  mixed_use_land: 'Terreno misto',
  industrial_land: 'Terreno industrial',
  incorporation_potential_area: 'Área com potencial de incorporação',

  office_room: 'Sala comercial',
  commercial_store: 'Loja',
  warehouse: 'Galpão',
  industrial_shed: 'Barracão industrial',
  commercial_point: 'Ponto comercial',
  commercial_set: 'Conjunto comercial',
  commercial_building: 'Prédio comercial',
  mixed_use_property: 'Imóvel misto',
  logistics_space: 'Espaço logístico',
  office: 'Escritório',
  retail: 'Varejo',
  food_service: 'Alimentação',
  storage: 'Armazenagem',
  industry: 'Indústria',
  logistics: 'Logística',
  vacant: 'Vazio',
  residential_adapted: 'Residencial adaptado',
  low_traffic: 'Baixo fluxo',
  high_flow_avenue: 'Avenida de alto fluxo',
  central: 'Central',
  neighborhood_commercial: 'Comercial de bairro',
  industrial_area: 'Área industrial',
  logistics_area: 'Área logística',
  mixed_region: 'Região mista',
  residential_region: 'Região residencial',

  small_farm: 'Chácara',
  country_house: 'Sítio',
  farm: 'Fazenda',
  rural_land: 'Área rural',
  leisure_area: 'Área de lazer rural',
  productive_farm: 'Imóvel rural produtivo',
  rural_residence: 'Moradia rural',
  rural_investment_area: 'Área rural para investimento',
  rural_area_with_improvements: 'Área rural com benfeitorias',
  rural_area_without_improvements: 'Área rural sem benfeitorias',
  square_meter: 'm²',
  hectare: 'Hectare',
  alqueire: 'Alqueire',
  acre: 'Acre',
  difficult: 'Difícil',
  seasonal_difficulty: 'Difícil em época de chuva',
  abundant: 'Abundante',
  sufficient: 'Suficiente',
  seasonal: 'Sazonal',
  cattle: 'Pecuária',
  agriculture: 'Agricultura',
  mixed_production: 'Produção mista',
  unused: 'Sem uso',
  rental_income: 'Renda ou arrendamento',
  tourism: 'Turismo rural',

  internal: 'Interna',
  restricted: 'Restrita',
  sensitive: 'Sensível',
  legal_sensitive: 'Sensível juridicamente',
  do_not_share: 'Não compartilhar',
  urgent: 'Urgente',
  general: 'Geral',
  negotiation: 'Negociação',
  owner_behavior: 'Comportamento do proprietário',
  documentation_risk: 'Risco documental',
  price_strategy: 'Estratégia de preço',
  legal_attention: 'Atenção jurídica',
  operational_follow_up: 'Acompanhamento operacional',
  agency_management: 'Gestão da agência',
  needs_owner_alignment: 'Precisa alinhar com proprietário',
  price_conflict: 'Conflito de preço',
  document_risk: 'Risco documental',
  communication_risk: 'Risco de comunicação',
  requires_manager_review: 'Exige revisão de gestor',
  requires_legal_review: 'Exige revisão jurídica',

  preliminary_survey: 'Levantamento preliminar',
  professional_capture: 'Captação profissional',
  commercial_inspection: 'Vistoria comercial',
  listing_review: 'Revisão de anúncio',
  pricing_support: 'Apoio à precificação',
  proposal_preparation: 'Preparação de proposta',
  contract_preparation: 'Preparação para contrato',
  from_existing_listing: 'Nasceu de anúncio existente',
  without_listing: 'Nasceu sem anúncio',
  from_existing_client: 'Nasceu de cliente existente',
  external_lead: 'Atendimento externo',
  referral: 'Indicação',
  agency_demand: 'Demanda da agência',
  marketplace_migration: 'Migração do marketplace',
  current_broker: 'Corretor atual',
  debt_informed: 'Dívida informada',
  financed: 'Financiado',
  link_client: 'Vincular cliente',
  occupied_by_owner: 'Ocupado pelo proprietário',
  occupied_by_tenant: 'Ocupado por inquilino',
  occupied_by_third_party: 'Ocupado por terceiro',
  under_construction: 'Em obra',
  closed_no_access: 'Fechado sem acesso',
  verified_in_person: 'Verificado presencialmente',
  informed_by_owner: 'Informado pelo proprietário',
  informed_by_representative: 'Informado por representante',
  informed_by_tenant: 'Informado por inquilino',
  informed_by_third_party: 'Informado por terceiro',
  extracted_from_document: 'Extraído de documento',
  extracted_from_previous_listing: 'Extraído de anúncio anterior',
  by_appointment: 'Mediante agendamento',
  authorization_required: 'Somente com autorização',
  unavailable: 'Indisponível no momento',
  wait_authorization: 'Aguardar autorização',
  coherent: 'Coerente',
  complete_in_person: 'Completa presencial',
  cosmetic: 'Reforma estética',
  architect: 'Arquiteto',
  medium_high: 'Médio alto',
  risk_visible: 'Risco visível',
  evaluate_financing: 'Avaliar financiamento',
  inventory_or_divorce: 'Inventário ou divórcio',
  send_to_legal_review: 'Enviar para revisão jurídica',
  depends_on_documents: 'Depende dos documentos',
  to_schedule: 'Agendar',
  request_repairs_before_publish: 'Solicitar reparos antes de publicar',
  validate_condominium_fee: 'Validar taxa condominial',
  validate_parking_documentation: 'Validar documentação da vaga',
  validate_financing: 'Validar financiamento',
  review_airbnb_viability: 'Revisar viabilidade Airbnb',
  dirt_road: 'Rua de terra',
  validate_area: 'Validar área',
  validate_zoning: 'Validar zoneamento',
  validate_infrastructure: 'Validar infraestrutura',
  request_cleaning_before_photos: 'Solicitar limpeza antes das fotos',
  showroom: 'Showroom',
  expired: 'Vencido',
  validate_activity_restriction: 'Validar restrição de atividade',
  validate_avcb: 'Validar AVCB',
  review_target_audience: 'Revisar público-alvo',
  not_done: 'Não feito',
  neighborhood_only: 'Somente bairro/região',
  partial_only: 'Parcial',
  needs_review: 'Precisa revisão',
  open_to_partners: 'Aberto para parceiros',
  informed: 'Informado',
  morning: 'Sol da manhã',
  afternoon: 'Sol da tarde',
}
function formatValue(value: any): string {
  if (value === null || value === undefined || value === '') {
    return '-'
  }

  if (typeof value === 'boolean') {
    return value ? 'Sim' : 'Não'
  }

  if (Array.isArray(value)) {
    return value.length ? value.map((item) => formatValue(item)).join(', ') : '-'
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value)

    if (entries.length === 0) {
      return '-'
    }

    return entries
      .map(([key, itemValue]) => `${formatJsonKey(key)}: ${formatValue(itemValue)}`)
      .join('\n')
  }

  if (typeof value === 'string') {
    const translated = VALUE_LABELS[value]

    if (translated) {
      return translated
    }

    if (value.includes('_') && /^[a-z0-9_]+$/.test(value)) {
      return formatJsonKey(value)
    }

    return value
  }

  return String(value)
}

function getJsonValue(source: any, key: string) {
  if (!source || typeof source !== 'object') {
    return '-'
  }

  return formatValue(source[key])
}

function hasModuleData(source: any): boolean {
  if (!source || typeof source !== 'object') {
    return false
  }

  return Object.values(source).some((value) => {
    if (value === null || value === undefined || value === '') return false
    if (typeof value === 'object') return Object.keys(value).length > 0
    return true
  })
}

function formatJsonKey(key: string) {
  return FIELD_LABELS[key] || key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function InfoLine({
  label,
  value,
}: {
  label: string
  value: any
}) {
  return (
    <div className="checkup-line">
      <div className="checkup-label">{label}</div>
      <div className="checkup-value">{formatValue(value)}</div>
    </div>
  )
}

function JsonLine({
  label,
  source,
  field,
}: {
  label: string
  source: any
  field: string
}) {
  return (
    <div className="checkup-line">
      <div className="checkup-label">{label}</div>
      <div className="checkup-value">{getJsonValue(source, field)}</div>
    </div>
  )
}

function JsonObjectLines({
  source,
}: {
  source: any
}) {
  if (!source || typeof source !== 'object') {
    return (
      <div className="checkup-line">
        <div className="checkup-label">Status</div>
        <div className="checkup-value">Sem dados salvos neste módulo.</div>
      </div>
    )
  }

  return (
    <>
      {Object.entries(source).map(([key, value]) => (
        <div className="checkup-line" key={key}>
          <div className="checkup-label">{formatJsonKey(key)}</div>
          <div className="checkup-value">{formatValue(value)}</div>
        </div>
      ))}
    </>
  )
}

function ModuleBlock({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: React.ReactNode
}) {
  return (
    <>
      <div className="checkup-module-heading" id={id}>
        <h3>{title}</h3>
        <a className="checkup-page-up" href="#analise-patrimonial-v1">
          Page up
        </a>
      </div>

      <div className="checkup-module-box">
        {children}
      </div>
    </>
  )
}

export default function PropertyDetailPage() {
  const params = useParams()
  const listingId = params.listingId as string

  const [loading, setLoading] = useState(true)
  const [listing, setListing] = useState<any>(null)
  const [assessment, setAssessment] = useState<any>(null)
  const [mediaUrls, setMediaUrls] = useState<any[]>([])
  const [status, setStatus] = useState('')
  const [propertyType, setPropertyType] = useState<any>(null)
  const [assetLocation, setAssetLocation] = useState<any>(null)
  const [assetFeatures, setAssetFeatures] = useState<any>(null)
  const showAllTypeModules = false

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
      setAssessment(assessmentResponse.data || null)

      const propertyTypeId =
        listingData?.property_assets?.property_type_id

      if (propertyTypeId) {
        const propertyTypeResponse = await supabase
          .from('property_type')
          .select('id, slug, label')
          .eq('id', propertyTypeId)
          .maybeSingle()

        setPropertyType(propertyTypeResponse.data || null)
      }

      const assetId = listingData?.property_assets?.id

      if (assetId) {
        const [locationResponse, featuresResponse] = await Promise.all([
          supabase
            .from('property_asset_locations')
            .select('*')
            .eq('property_asset_id', assetId)
            .maybeSingle(),

          supabase
            .from('property_asset_features')
            .select('*')
            .eq('property_asset_id', assetId)
            .maybeSingle(),
        ])

        setAssetLocation(locationResponse.data || null)
        setAssetFeatures(featuresResponse.data || null)
      }

      const mediaRecords = listingData?.property_listing_media || []

      const signedUrls = await Promise.all(
        mediaRecords.map(async (media: any) => {
          if (!media?.storage_path) {
            return null
          }

          const signed = await supabase.storage
            .from('property-media')
            .createSignedUrl(media.storage_path, 3600)

          return {
            id: media.id,
            storage_path: media.storage_path,
            url: signed.data?.signedUrl || null,
          }
        })
      )

      setMediaUrls(signedUrls.filter(Boolean))
      setLoading(false)
    }

    init()
  }, [listingId])

  if (loading) {
    return (
      <main style={{ padding: 24 }}>
        <p>Carregando checkup do imóvel...</p>
      </main>
    )
  }

  if (!listing) {
    return (
      <main style={{ padding: 24 }}>
        <p>
          <a href="/operations/properties/list">
            Voltar para lista
          </a>
        </p>

        <h1>Imóvel não encontrado</h1>

        {status && <p>{status}</p>}
      </main>
    )
  }

  const asset = listing.property_assets || {}
  const location = assetLocation || asset.property_asset_locations?.[0] || {}
  const features = assetFeatures || asset.property_asset_features?.[0] || {}
  const portfolioItem = listing.portfolio_items?.[0] || null
  const assessmentMetadata = assessment?.metadata || {}
  const propertyTypeSlug = String(propertyType?.slug || '').toLowerCase()
  const propertyTypeLabel = String(propertyType?.label || '').toLowerCase()
  const propertyTypeText = `${propertyTypeSlug} ${propertyTypeLabel}`

  const shouldShowTypeModule = (moduleKey: string) => {
    if (showAllTypeModules) {
      return true
    }

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

  return (
    <main className="checkup-page">
      <style jsx global>{`
        body {
          background: #f3f5f7;
          font-family: 'Google Sans', 'Product Sans', Inter, Arial, sans-serif;
        }

        @media print {
          .no-print {
            display: none !important;
          }

          body {
            background: #fff;
          }

          .checkup-page {
            max-width: none !important;
            padding: 0 !important;
          }

          .checkup-v1-shell,
          .hurby-section,
          .checkup-module-box {
            box-shadow: none !important;
            break-inside: avoid;
          }
        }

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
          margin: 0 8px 8px 0;
          font-size: 14px;
        }

        .checkup-page {
          padding: 24px;
          max-width: 1180px;
          margin: 0 auto;
          color: #172033;
          font-family: 'Google Sans', 'Product Sans', Inter, Arial, sans-serif;
        }

        .hurby-section {
          border: 1px solid #d8e0ea;
          border-radius: 18px;
          padding: 18px;
          margin: 18px 0;
          background: #fff;
          box-shadow: 0 10px 26px rgba(15, 23, 42, 0.05);
        }

        .hurby-photo-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 12px;
          margin-top: 12px;
        }

        .hurby-photo-card {
          border: 1px solid #ddd;
          border-radius: 12px;
          overflow: hidden;
          background: #f7f7f7;
        }

        .hurby-photo {
          width: 100%;
          height: 150px;
          object-fit: cover;
          display: block;
        }

        .muted {
          color: #666;
          font-size: 14px;
        }

        .checkup-v1-shell {
          border: 1px solid #d8e0ea;
          border-radius: 18px;
          background: #f8fafc;
          padding: 18px;
          margin-top: 18px;
        }

        .checkup-v1-nav {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding: 12px;
          border: 1px solid #dbe3ec;
          border-radius: 16px;
          background: #fff;
          margin: 12px 0 18px;
        }

        .checkup-v1-nav a {
          text-decoration: none;
          border: 1px solid #dbe3ec;
          border-radius: 999px;
          padding: 7px 10px;
          color: #334155;
          background: #f8fafc;
          font-size: 12px;
          font-weight: 700;
        }

        .checkup-v1-nav a:hover {
          border-color: #94a3b8;
          background: #eef4fb;
        }

        .checkup-type-note {
          border: 1px solid #dbe3ec;
          border-radius: 14px;
          background: #fff;
          color: #334155;
          font-size: 13px;
          font-weight: 700;
          padding: 10px 12px;
          margin: 10px 0 16px;
        }

        .checkup-module-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin: 24px 0 8px;
        }

        .checkup-module-heading h3 {
          margin: 0;
          color: #172033;
          font-size: 18px;
        }

        .checkup-page-up {
          color: #2563eb;
          text-decoration: none;
          font-size: 12px;
          font-weight: 800;
          white-space: nowrap;
        }

        .checkup-page-up:hover {
          text-decoration: underline;
        }

        .checkup-module-box {
          background: #fff;
          border: 1px solid #dbe3ec;
          border-radius: 16px;
          padding: 14px 16px;
          box-shadow: 0 8px 22px rgba(15, 23, 42, 0.05);
        }

        .checkup-line {
          display: grid;
          grid-template-columns: minmax(180px, 34%) minmax(0, 1fr);
          gap: 14px;
          align-items: start;
          padding: 8px 0;
          border-bottom: 1px solid #edf1f5;
        }

        .checkup-line:last-child {
          border-bottom: 0;
        }

        .checkup-label {
          text-align: right;
          color: #64748b;
          font-weight: 800;
          font-size: 13px;
        }

        .checkup-value {
          text-align: left;
          color: #172033;
          font-size: 13px;
          line-height: 1.45;
          word-break: break-word;
          white-space: pre-wrap;
        }

        @media (max-width: 760px) {
          .checkup-page {
            padding: 16px;
          }

          .checkup-line {
            grid-template-columns: 1fr;
            gap: 4px;
          }

          .checkup-label {
            text-align: left;
          }

          .checkup-module-heading {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>

      <div className="no-print">
        <a className="button-link" href="/operations/properties/list">
          Voltar para lista
        </a>

        <a
          className="button-link"
          href={`/operations/properties/${listing.id}/edit`}
        >
          Editar anúncio
        </a>

        <a
          className="button-link"
          href={`/operations/properties/${listing.id}/assessment`}
        >
          {assessment ? 'Editar Análise Patrimonial' : 'Criar Análise Patrimonial'}
        </a>

        <button onClick={() => window.print()}>
          Imprimir checkup
        </button>
      </div>

      <h1 id="topo-checkup">Checkup interno do imóvel</h1>

      <div className="hurby-section">
        <h2>Orientação</h2>

        <p>
          Esta tela consolida as informações internas do imóvel. Ela serve para
          conferência, revisão, acompanhamento e futura impressão do dossiê.
        </p>

        <p>
          O anúncio é a peça comercial. A Análise Patrimonial é um documento
          técnico separado. Dados sensíveis, notas privadas e informações do
          proprietário não devem ser expostos publicamente sem regra específica.
        </p>

        <p className="muted">
          Upload de fotos deve ser feito no cadastro ou na edição do anúncio.
          Este checkup apenas exibe as informações já vinculadas.
        </p>
      </div>

      {status && (
        <div className="hurby-section">
          <strong>Status:</strong> {status}
        </div>
      )}

      <section className="hurby-section">
        <h2>1. Anúncio</h2>

        <InfoLine label="Título" value={listing.title} />
        <InfoLine label="Descrição" value={listing.description} />
        <InfoLine label="Preço" value={listing.price} />
        <InfoLine label="Status" value={listing.listing_status?.label} />
        <InfoLine label="Contexto" value={listing.property_business_context?.label} />
        <InfoLine label="Visibilidade" value={listing.visibility_scope} />
        <InfoLine label="Publicado em" value={listing.published_at} />
        <InfoLine label="Expira em" value={listing.expires_at} />
      </section>

      
      <section className="top-indicators-v1">
        <div className="top-indicator-card">
          <span>Tipo</span>
          <strong>{propertyType?.label || propertyType?.slug || 'Nao identificado'}</strong>
        </div>
        <div className="top-indicator-card top-indicator-warning">
          <span>Proprietario</span>
          <strong>Nao vinculado</strong>
        </div>
        <div className="top-indicator-card">
          <span>Anuncio</span>
          <strong>{listing?.title || 'Sem titulo'}</strong>
        </div>
        <div className="top-indicator-card">
          <span>Analise</span>
          <strong>{assessment ? 'Criada' : 'Pendente'}</strong>
        </div>
        <div className="top-indicator-card top-indicator-warning">
          <span>Pendencias</span>
          <strong>Cliente e revisao</strong>
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


      <section className="hurby-section">
        <h2>2. Fotos públicas do anúncio</h2>

        <p className="muted">
          Estas imagens pertencem ao anúncio comercial. Fotos técnicas da análise
          profissional devem ter estrutura privada própria em etapa futura.
        </p>

        {mediaUrls.length === 0 && (
          <p>Nenhuma foto vinculada a este anúncio.</p>
        )}

        {mediaUrls.length > 0 && (
          <div className="hurby-photo-grid">
            {mediaUrls.map((media) => (
              <div className="hurby-photo-card" key={media.id}>
                {media.url ? (
                  <img
                    src={media.url}
                    alt="Foto pública do imóvel"
                    className="hurby-photo"
                  />
                ) : (
                  <p style={{ padding: 12 }}>
                    Não foi possível carregar esta imagem.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="hurby-section">
        <h2>3. Imóvel / Asset</h2>

        <InfoLine label="Asset ID" value={asset.id} />
        <InfoLine label="País" value={asset.country} />
        <InfoLine label="Ativo" value={asset.is_active} />
        <InfoLine label="Padrão" value={asset.property_standard} />
        <InfoLine label="Condomínio" value={asset.condominium_name} />
        <InfoLine label="Edifício" value={asset.building_name} />
        <InfoLine label="Condomínio fechado" value={asset.is_gated_community} />
        <InfoLine label="Piscina no condomínio" value={asset.has_condominium_pool} />
        <InfoLine label="Aceita financiamento" value={asset.accepts_financing} />
      </section>

      <section className="hurby-section">
        <h2>4. Localização</h2>

        <InfoLine label="CEP" value={location.zip_code || location.zipcode} />
        <InfoLine label="UF" value={location.state} />
        <InfoLine label="Cidade" value={location.city} />
        <InfoLine label="Bairro" value={location.neighborhood} />
        <InfoLine label="Rua" value={location.street} />
        <InfoLine label="Número" value={location.number} />
        <InfoLine label="Complemento" value={location.complement} />
        <InfoLine label="Ocultar número publicamente" value={location.hide_public_number} />
        <InfoLine label="Latitude" value={location.latitude} />
        <InfoLine label="Longitude" value={location.longitude} />
      </section>

      <section className="hurby-section">
        <h2>5. Características</h2>

        <InfoLine label="Quartos" value={features.bedrooms} />
        <InfoLine label="Suítes" value={features.suites} />
        <InfoLine label="Banheiros" value={features.bathrooms} />
        <InfoLine label="Vagas" value={features.garage_spaces} />
        <InfoLine label="Área privativa" value={features.private_area} />
        <InfoLine label="Área total" value={features.total_area} />
        <InfoLine label="Ano de construção" value={features.built_year} />
        <InfoLine label="Andar" value={features.floor_number} />
        <InfoLine label="Total de andares" value={features.total_floors} />
        <InfoLine label="Elevador" value={features.has_elevator} />
        <InfoLine label="Mobiliado" value={features.is_furnished ?? features.furnished} />
        <InfoLine label="Piscina privativa" value={features.has_private_pool} />
        <InfoLine label="Posição solar" value={features.sun_position} />
      </section>

      <section className="hurby-section">
        <h2>6. Portfolio</h2>

        {portfolioItem ? (
          <>
            <InfoLine label="Portfolio" value={portfolioItem.portfolio_id} />
            <InfoLine label="Status do item" value={portfolioItem.item_status} />
            <InfoLine label="Origem" value={portfolioItem.origin_type} />
            <InfoLine label="Visibilidade" value={portfolioItem.visibility_scope} />
          </>
        ) : (
          <p>Nenhum vínculo de portfolio encontrado.</p>
        )}
      </section>

      <section className="hurby-section">
        <h2 id="analise-patrimonial-v1">7. Análise Patrimonial V1</h2>

        {!assessment && (
          <>
            <p>Este anúncio ainda não possui Análise Patrimonial vinculada.</p>

            <p className="no-print">
              <a
                className="button-link"
                href={`/operations/properties/${listing.id}/assessment`}
              >
                Criar Análise Patrimonial
              </a>
            </p>
          </>
        )}

        {assessment && (
          <>
            {/* WORKFLOW_PIPELINE_VISUAL_V1 */}
            <section
              style={{
                border: '1px solid #dbe3ea',
                borderRadius: 16,
                padding: 18,
                marginBottom: 18,
                background: '#f8fafc',
              }}
            >
              <h3 style={{ marginTop: 0 }}>Pipeline profissional do imóvel</h3>

              <p style={{ marginTop: 0, color: '#5f6b7a', lineHeight: 1.5 }}>
                Este fluxo mostra em que ponto o imóvel está dentro da jornada profissional:
                entrada, análise, estratégia, proposta, publicação e histórico. Nesta V1,
                alguns passos ainda são leitura operacional e preparação para acoplagens futuras.
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
                    label: '1. Entrada',
                    status: 'Concluido',
                    hint: 'Anuncio e imóvel ja existem no sistema.',
                  },
                  {
                    label: '2. Dados herdados',
                    status: hasModuleData(assessmentMetadata.base_common_v1) ? 'Em andamento' : 'Pendente',
                    hint: 'Base reaproveitada do anuncio básico.',
                  },
                  {
                    label: '3. Proprietario',
                    status: hasModuleData(assessmentMetadata.owner_interview_v1) ? 'Em andamento' : 'Pendente',
                    hint: 'Informacoes declaradas pelo proprietario.',
                  },
                  {
                    label: '4. Avaliacao',
                    status: hasModuleData(assessmentMetadata.technical_assessment_v1) ? 'Em andamento' : 'Pendente',
                    hint: 'Leitura observada pelo profissional.',
                  },
                  {
                    label: '5. Risco',
                    status: hasModuleData(assessmentMetadata.documentation_financial_v1) ? 'Em andamento' : 'Pendente',
                    hint: 'Documentacao, financeiro e pontos de atencao.',
                  },
                  {
                    label: '6. Estrategia',
                    status: hasModuleData(assessmentMetadata.price_strategy_v1) || hasModuleData(assessmentMetadata.commercial_proposal_v1) ? 'Em andamento' : 'Pendente',
                    hint: 'Preco, negociacao e posicionamento.',
                  },
                  {
                    label: '7. Proposta',
                    status: hasModuleData(assessmentMetadata.commercial_proposal_v1) ? 'Preparada' : 'Pendente',
                    hint: 'Base para apresentar ao proprietario.',
                  },
                  {
                    label: '8. Publicacao',
                    status: 'Futuro',
                    hint: 'Acoplar estrategia ao anuncio publico.',
                  },
                  {
                    label: '9. Historico',
                    status: hasModuleData(assessmentMetadata.private_notes_v1) ? 'Com registro' : 'Inicial',
                    hint: 'Notas, decisoes e lifecycle.',
                  },
                ].map((step) => (
                  <div
                    key={step.label}
                    style={{
                      border: '1px solid #d7dee8',
                      borderRadius: 12,
                      padding: 12,
                      background: '#fff',
                    }}
                  >
                    <strong>{step.label}</strong>
                    <div style={{ marginTop: 8, fontSize: 13 }}>
                      Status: <strong>{step.status}</strong>
                    </div>
                    <p style={{ marginBottom: 0, fontSize: 12, color: '#667085', lineHeight: 1.4 }}>
                      {step.hint}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* PROPERTY_SCORE_PREVIEW_V1 */}
            <section
              style={{
                border: '1px solid #dbe3ea',
                borderRadius: 16,
                padding: 18,
                marginBottom: 18,
                background: '#fff',
              }}
            >
              <h3 style={{ marginTop: 0 }}>Pontuacao operacional do patrimonio</h3>

              <p style={{ marginTop: 0, color: '#5f6b7a', lineHeight: 1.5 }}>
                Esta pontuacao e uma leitura inicial da maturidade da analise.
                Ainda nao e a nota final do patrimonio. A regra definitiva devera
                considerar tipo, subtipo, pesos por resposta, equalizacao por categoria
                e estrategia comercial.
              </p>

              {(() => {
                const typeModuleFilled =
                  (shouldShowTypeModule('house') && hasModuleData(assessmentMetadata.house_module_v1)) ||
                  (shouldShowTypeModule('apartment') && hasModuleData(assessmentMetadata.apartment_module_v1)) ||
                  (shouldShowTypeModule('land') && hasModuleData(assessmentMetadata.land_module_v1)) ||
                  (shouldShowTypeModule('commercial') && hasModuleData(assessmentMetadata.commercial_module_v1)) ||
                  (shouldShowTypeModule('rural') && hasModuleData(assessmentMetadata.rural_module_v1))

                const scoreItems = [
                  {
                    label: 'Dados herdados do anuncio',
                    weight: 10,
                    done: hasModuleData(assessmentMetadata.base_common_v1),
                    hint: 'Base inicial reaproveitada do anuncio.',
                  },
                  {
                    label: 'Avaliacao declarada',
                    weight: 10,
                    done: hasModuleData(assessmentMetadata.owner_interview_v1),
                    hint: 'Informacoes coletadas com proprietario.',
                  },
                  {
                    label: 'Modulo por tipo/subtipo',
                    weight: 20,
                    done: !!typeModuleFilled,
                    hint: 'Criterios especificos do tipo de imovel.',
                  },
                  {
                    label: 'Avaliacao observada',
                    weight: 15,
                    done: hasModuleData(assessmentMetadata.technical_assessment_v1),
                    hint: 'Leitura profissional sobre estado e condicao.',
                  },
                  {
                    label: 'Documentacao e risco',
                    weight: 15,
                    done: hasModuleData(assessmentMetadata.documentation_financial_v1),
                    hint: 'Riscos, pendencias e validacoes.',
                  },
                  {
                    label: 'Estrategia de preco',
                    weight: 10,
                    done: hasModuleData(assessmentMetadata.price_strategy_v1),
                    hint: 'Preco, margem e negociacao.',
                  },
                  {
                    label: 'Estrategia comercial/proposta',
                    weight: 15,
                    done: hasModuleData(assessmentMetadata.commercial_proposal_v1),
                    hint: 'Plano para proprietario e publicacao.',
                  },
                  {
                    label: 'Comunicacao e historico',
                    weight: 5,
                    done:
                      hasModuleData(assessmentMetadata.controlled_summaries_v1) ||
                      hasModuleData(assessmentMetadata.private_notes_v1),
                    hint: 'Registros, decisoes e comunicacao controlada.',
                  },
                ]

                const total = scoreItems.reduce((sum, item) => sum + item.weight, 0)
                const current = scoreItems.reduce((sum, item) => sum + (item.done ? item.weight : 0), 0)
                const percent = total > 0 ? Math.round((current / total) * 100) : 0

                let label = 'Inicial'

                if (percent >= 80) {
                  label = 'Forte'
                } else if (percent >= 60) {
                  label = 'Boa base'
                } else if (percent >= 35) {
                  label = 'Em construcao'
                }

                return (
                  <div>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(0, 1fr) auto',
                        gap: 16,
                        alignItems: 'center',
                        marginBottom: 14,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            height: 12,
                            borderRadius: 999,
                            background: '#e5eaf0',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${percent}%`,
                              height: '100%',
                              background: '#2563eb',
                            }}
                          />
                        </div>

                        <p style={{ marginBottom: 0, color: '#5f6b7a', fontSize: 13 }}>
                          Base calculada por blocos preenchidos. A nota final futura
                          devera usar pesos por resposta e equalizacao por tipo/subtipo.
                        </p>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 30, fontWeight: 800 }}>{percent}%</div>
                        <div style={{ fontSize: 13, color: '#5f6b7a' }}>{label}</div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: 10,
                      }}
                    >
                      {scoreItems.map((item) => (
                        <div
                          key={item.label}
                          style={{
                            border: '1px solid #d7dee8',
                            borderRadius: 12,
                            padding: 12,
                            background: item.done ? '#f8fafc' : '#fff',
                          }}
                        >
                          <strong>{item.label}</strong>
                          <div style={{ marginTop: 6, fontSize: 13 }}>
                            Peso: {item.weight} pontos | {item.done ? 'Considerado' : 'Pendente'}
                          </div>
                          <p style={{ marginBottom: 0, fontSize: 12, color: '#667085', lineHeight: 1.4 }}>
                            {item.hint}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}
            </section>

            <nav className="checkup-v1-nav" aria-label="Módulos da Análise Patrimonial V1">
              <a href="#v1-identificacao">Identificação</a>
              <a href="#v1-maturidade">Pipeline</a>
              <a href="#v1-base-comum">Dados herdados</a>
              <a href="#v1-preco">Preço e negociação</a>
              <a href="#v1-tecnica">Avaliação observada</a>
              <a href="#v1-documentacao">Doc./Financeiro</a>
              <a href="#v1-entrevista">Declaração proprietário</a>
              <a href="#v1-proposta">Estratégia/proposta</a>
              {shouldShowTypeModule('house') && <a href="#v1-casa">Casa</a>}
              {shouldShowTypeModule('apartment') && <a href="#v1-apartamento">Apartamento</a>}
              {shouldShowTypeModule('land') && <a href="#v1-terreno">Terreno</a>}
              {shouldShowTypeModule('commercial') && <a href="#v1-comercial">Comercial</a>}
              {shouldShowTypeModule('rural') && <a href="#v1-rural">Rural</a>}
              <a href="#v1-resumos">Resumos</a>
              <a href="#v1-privadas">Notas privadas</a>
              <a href="#topo-checkup">Page up</a>
            </nav>

            <div className="checkup-type-note">
              Tipo identificado pelo anúncio: {propertyType?.label || propertyType?.slug || 'não identificado'}.
              O Checkup exibe automaticamente apenas o módulo compatível com o tipo do imóvel.
            </div>

            <div className="checkup-v1-shell">
              <ModuleBlock id="v1-identificacao" title="7.0 Identificacao e vinculo da analise">
                <InfoLine label="Análise ID" value={assessment.id} />
                <InfoLine label="Status da análise" value={assessment.assessment_status} />
                <InfoLine label="Finalidade" value={assessment.assessment_purpose} />
                <InfoLine label="Disponível para parceria" value={assessment.is_available_for_partnership} />
                <InfoLine label="Exclusivo" value={assessment.is_exclusive} />
                <InfoLine label="Ocultar endereço para parceiros" value={assessment.hide_exact_address_for_partners} />
                                <InfoLine label="Proprietário pode ver resumo" value={assessment.owner_can_view_summary} />
                <InfoLine label="Tipo do imóvel" value={propertyType?.label || propertyType?.slug || 'Não identificado'} />
              </ModuleBlock>

              <ModuleBlock id="v1-maturidade" title="7.1 Pipeline e status da analise">
              {(() => {
                const isFieldAnswered = (value: any) => {
                  if (value === true || value === false) return true
                  if (value === 0) return true
                  if (value === null || value === undefined) return false

                  if (typeof value === 'string') {
                    const normalized = value.trim().toLowerCase()
                    if (!normalized) return false

                    const notCompletedValues = [
                      'nao sei',
                      'nao sei responder',
                      'nao informado',
                      'nao informada',
                      'nao preenchido',
                      'nao preenchida',
                      'pendente',
                      'pendente de conferencia',
                      'pendente de comprovacao',
                      'a confirmar',
                      'nao verificado',
                      'nao verificada',
                    ]

                    return !notCompletedValues.includes(normalized)
                  }

                  if (Array.isArray(value)) return value.length > 0
                  if (typeof value === 'object') return Object.keys(value).length > 0

                  return Boolean(value)
                }

                const calculateModuleProgress = (moduleData: any) => {
                  if (!moduleData || typeof moduleData !== 'object') {
                    return { filled: 0, total: 0, percent: 0 }
                  }

                  const entries = Object.entries(moduleData).filter(([key]) => {
                    return !key.startsWith('_') && key !== 'updated_at' && key !== 'created_at'
                  })

                  const total = entries.length
                  const filled = entries.filter(([, value]) => isFieldAnswered(value)).length
                  const percent = total > 0 ? Math.round((filled / total) * 100) : 0

                  return { filled, total, percent }
                }

                const moduleProgressItems = [
                  { label: 'Base comum', data: assessmentMetadata.base_common_v1, visible: true, anchor: 'base-common' },
                  { label: 'Estrategia de preco', data: assessmentMetadata.price_strategy_v1, visible: true, anchor: 'price-strategy' },
                  { label: 'Avaliacao tecnica', data: assessmentMetadata.technical_assessment_v1, visible: true, anchor: 'technical-assessment-v1' },
                  { label: 'Documentacao e financeiro', data: assessmentMetadata.documentation_financial_v1, visible: true, anchor: 'documentation-financial-v1' },
                  { label: 'Entrevista com proprietario', data: assessmentMetadata.owner_interview_v1, visible: true, anchor: 'owner-interview-v1' },
                  { label: 'Estrategia comercial e proposta', data: assessmentMetadata.commercial_proposal_v1, visible: true, anchor: 'commercial-proposal-v1' },
                  { label: 'Modulo casa', data: assessmentMetadata.house_module_v1, visible: shouldShowTypeModule('house'), anchor: 'house-module' },
                  { label: 'Modulo apartamento', data: assessmentMetadata.apartment_module_v1, visible: shouldShowTypeModule('apartment'), anchor: 'apartment-module' },
                  { label: 'Modulo terreno', data: assessmentMetadata.land_module_v1, visible: shouldShowTypeModule('land'), anchor: 'land-module' },
                  { label: 'Modulo comercial', data: assessmentMetadata.commercial_module_v1, visible: shouldShowTypeModule('commercial'), anchor: 'commercial-module' },
                  { label: 'Modulo rural', data: assessmentMetadata.rural_module_v1, visible: shouldShowTypeModule('rural'), anchor: 'rural-module' },
                  { label: 'Resumos controlados', data: assessmentMetadata.controlled_summaries_v1, visible: true, anchor: 'controlled-summaries-v1' },
                  { label: 'Notas privadas', data: assessmentMetadata.private_notes_v1, visible: true, anchor: 'private-notes-v1' },
                ]
                  .filter((item) => item.visible)
                  .map((item) => ({
                    ...item,
                    progress: calculateModuleProgress(item.data),
                  }))

                return (
                  <div style={{ display: 'grid', gap: 10 }}>
                    {moduleProgressItems.map((item) => (
                      <div
                        key={item.label}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '220px 1fr 64px 54px',
                          alignItems: 'center',
                          gap: 12,
                          border: '1px solid #dbe3ec',
                          borderRadius: 14,
                          padding: '10px 12px',
                          background: '#ffffff',
                        }}
                      >
                        <strong style={{ color: '#172033', fontSize: 13 }}>{item.label}</strong>

                        <div
                          title={`${item.progress.filled} de ${item.progress.total} campos considerados preenchidos`}
                          style={{
                            height: 10,
                            background: '#e2e8f0',
                            borderRadius: 999,
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${item.progress.percent}%`,
                              height: '100%',
                              background: item.progress.percent >= 100 ? '#22c55e' : item.progress.percent >= 70 ? '#2563eb' : '#f97316',
                              borderRadius: 999,
                            }}
                          />
                        </div>

                        <span style={{ fontWeight: 900, color: '#172033', textAlign: 'right' }}>
                          {item.progress.percent}%
                        </span>

                        <a
                          href={`/operations/properties/${listingId}/assessment#${item.anchor}`}
                          title="Abrir modulo na Analise Patrimonial"
                          style={{
                            textAlign: 'center',
                            border: '1px solid #bfdbfe',
                            background: '#eff6ff',
                            color: '#1d4ed8',
                            borderRadius: 999,
                            padding: '6px 8px',
                            fontSize: 12,
                            fontWeight: 900,
                            textDecoration: 'none',
                          }}
                        >
                          Abrir
                        </a>
                      </div>
                    ))}
                  </div>
                )
              })()}
                <InfoLine label="Base comum" value={hasModuleData(assessmentMetadata.base_common_v1) ? 'Preenchido' : 'Pendente'} />
                <InfoLine label="Estratégia de preço" value={hasModuleData(assessmentMetadata.price_strategy_v1) ? 'Preenchido' : 'Pendente'} />
                <InfoLine label="Avaliação técnica" value={hasModuleData(assessmentMetadata.technical_assessment_v1) ? 'Preenchido' : 'Pendente'} />
                <InfoLine label="Documentação e financeiro" value={hasModuleData(assessmentMetadata.documentation_financial_v1) ? 'Preenchido' : 'Pendente'} />
                <InfoLine label="Entrevista com proprietário" value={hasModuleData(assessmentMetadata.owner_interview_v1) ? 'Preenchido' : 'Pendente'} />
                <InfoLine label="Estratégia comercial e proposta" value={hasModuleData(assessmentMetadata.commercial_proposal_v1) ? 'Preenchido' : 'Pendente'} />
                {shouldShowTypeModule('house') && <InfoLine label="Módulo casa" value={hasModuleData(assessmentMetadata.house_module_v1) ? 'Preenchido' : 'Pendente'} />}
                {shouldShowTypeModule('apartment') && <InfoLine label="Módulo apartamento" value={hasModuleData(assessmentMetadata.apartment_module_v1) ? 'Preenchido' : 'Pendente'} />}
                {shouldShowTypeModule('land') && <InfoLine label="Módulo terreno" value={hasModuleData(assessmentMetadata.land_module_v1) ? 'Preenchido' : 'Pendente'} />}
                {shouldShowTypeModule('commercial') && <InfoLine label="Módulo comercial" value={hasModuleData(assessmentMetadata.commercial_module_v1) ? 'Preenchido' : 'Pendente'} />}
                {shouldShowTypeModule('rural') && <InfoLine label="Módulo rural" value={hasModuleData(assessmentMetadata.rural_module_v1) ? 'Preenchido' : 'Pendente'} />}
                <InfoLine label="Resumos controlados" value={hasModuleData(assessmentMetadata.controlled_summaries_v1) ? 'Preenchido' : 'Pendente'} />
                <InfoLine label="Notas privadas" value={hasModuleData(assessmentMetadata.private_notes_v1) ? 'Preenchido' : 'Pendente'} />
              </ModuleBlock>

              <ModuleBlock id="v1-base-comum" title="7.2 Dados herdados do anuncio">
                <JsonObjectLines source={assessmentMetadata.base_common_v1} />
              </ModuleBlock>

              <ModuleBlock id="v1-preco" title="7.6 Estrategia de preco e negociacao">
                <JsonObjectLines source={assessmentMetadata.price_strategy_v1} />
              </ModuleBlock>

              <ModuleBlock id="v1-tecnica" title="7.4 Avaliacao observada do imovel">
                <JsonObjectLines source={assessmentMetadata.technical_assessment_v1} />
              </ModuleBlock>

              <ModuleBlock id="v1-documentacao" title="7.5 Documentacao, financeiro e risco">
                <JsonObjectLines source={assessmentMetadata.documentation_financial_v1} />
              </ModuleBlock>

              <ModuleBlock id="v1-entrevista" title="7.3 Avaliacao declarada pelo proprietario">
                <JsonObjectLines source={assessmentMetadata.owner_interview_v1} />
              </ModuleBlock>

              <ModuleBlock id="v1-proposta" title="7.7 Estrategia comercial e proposta ao proprietario">
                <JsonObjectLines source={assessmentMetadata.commercial_proposal_v1} />
              </ModuleBlock>

              {shouldShowTypeModule('house') && (
              <ModuleBlock id="v1-casa" title="7.8.1 Casa">
                <JsonObjectLines source={assessmentMetadata.house_module_v1} />
              </ModuleBlock>
              )}

              {shouldShowTypeModule('apartment') && (
              <ModuleBlock id="v1-apartamento" title="7.8.2 Apartamento / Unidade">
                <JsonObjectLines source={assessmentMetadata.apartment_module_v1} />
              </ModuleBlock>
              )}

              {shouldShowTypeModule('land') && (
              <ModuleBlock id="v1-terreno" title="7.8.3 Terreno / Lote">
                <JsonObjectLines source={assessmentMetadata.land_module_v1} />
              </ModuleBlock>
              )}

              {shouldShowTypeModule('commercial') && (
              <ModuleBlock id="v1-comercial" title="7.8.4 Comercial">
                <JsonObjectLines source={assessmentMetadata.commercial_module_v1} />
              </ModuleBlock>
              )}

              {shouldShowTypeModule('rural') && (
              <ModuleBlock id="v1-rural" title="7.8.5 Rural">
                <JsonObjectLines source={assessmentMetadata.rural_module_v1} />
              </ModuleBlock>
              )}

              <ModuleBlock id="v1-resumos" title="7.9 Comunicacao controlada">
                <JsonObjectLines source={assessmentMetadata.controlled_summaries_v1} />
              </ModuleBlock>

              <ModuleBlock id="v1-privadas" title="7.10 Historico, notas privadas e lifecycle">
                <JsonObjectLines source={assessmentMetadata.private_notes_v1} />
              </ModuleBlock>
            </div>

            <p className="no-print" style={{ marginTop: 16 }}>
              <a
                className="button-link"
                href={`/operations/properties/${listing.id}/assessment`}
              >
                Editar Análise Patrimonial
              </a>
            </p>
          </>
        )}
      </section>
    </main>
  )
}